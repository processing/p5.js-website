const core = require('@actions/core');

/*
  Collect issue numbers referenced from a pull request.

  Problem: Contributors rarely use GitHub's linking keywords (Resolves / Closes / Fixes),
  Solution: so every `#N` is treated as a candidate. Candidates are validated later by the
  caller, which checks that the number is a real, translation-tracker issue. (Explained later about how an issue is validated)
 */

// Fenced blocks (``` or ~~~) delimited on their own lines.
const FENCED_CODE_REGEX = /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$/gm;
const INLINE_CODE_REGEX = /`[^`\n]*`/g;

/*
  `#` must not follow a word character or slash, which rejects the cross-repo
  form `owner/repo#123` and URL fragments like `/issues/17#issuecomment-99`.
 */
const BARE_REF_REGEX = /(?:^|[^\w/])#(\d{1,6})\b/g;

const MAX_ISSUE_NUMBER = 99999; // this cap should be good for now, it avoids the 6 digit hex

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Code samples and hex colors such as #336699 would otherwise look like references. So throw them away
function stripCode(text) {
  return String(text || '')
    .replace(FENCED_CODE_REGEX, '\n')
    .replace(INLINE_CODE_REGEX, ' ');
}

// avoid bots like github copilot PR review thing
function isBot(user) {
  if (!user) {
    return false;
  }
  return user.type === 'Bot' || /\[bot\]$/i.test(user.login || '');
}

/**
 * Extract candidate issue numbers from a block of (refined) text.
 *
 * @param {string} text
 * @param {{ owner?: string, repo?: string }} [repository] - Enables matching of pasted issue URLs.
 * @returns {number[]} Unique issue numbers, in first-seen order.
 */
function extractIssueNumbers(text, repository = {}) {
  const cleaned = stripCode(text);

  if (!cleaned.trim()) {
    return [];
  }

  const numbers = new Set();
  const patterns = [new RegExp(BARE_REF_REGEX.source, BARE_REF_REGEX.flags)];

  const { owner, repo } = repository;
  if (owner && repo) {
    patterns.push(
      new RegExp(
        `https?://github\\.com/${escapeRegex(owner)}/${escapeRegex(repo)}/issues/(\\d{1,6})`,
        'gi'
      )
    );
  }

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(cleaned)) !== null) {
      const number = parseInt(match[1], 10);
      if (number > 0 && number <= MAX_ISSUE_NUMBER) {
        numbers.add(number);
      }
    }
  }

  return [...numbers];
}

// Run a source collector, downgrading failures to a warning so one bad source can't fail the run. (Error handling)
async function safely(label, fn) {
  try {
    return await fn();
  } catch (error) {
    core.warning(`Could not read ${label}: ${error.message}`);
    return [];
  }
}

/**
 * Gather every issue number referenced from a PR's title, body, comments,
 * reviews, and the issues that cross-reference it.
 *
 * @param {{ octokit: object, owner: string, repo: string, prNumber: number }} options
 * @returns {Promise<Map<number, Set<string>>>} Issue number to the sources it was found in.
 */
async function collectReferencedIssues({ octokit, owner, repo, prNumber }) {
  const references = new Map();

  const record = (number, source) => {
    if (!references.has(number)) {
      references.set(number, new Set());
    }
    references.get(number).add(source);
  };

  const scan = (text, source) => {
    for (const number of extractIssueNumbers(text, { owner, repo })) {
      record(number, source);
    }
  };

  await safely('pull request title and body', async () => {
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });
    scan(pullRequest.title, 'title');
    scan(pullRequest.body, 'body');
  });

  await safely('pull request comments', async () => {
    const comments = await octokit.paginate(octokit.rest.issues.listComments, {
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });

    // filter the bots comments and PR reviews, imo not helpful to include them
    for (const comment of comments) {
      if (isBot(comment.user)) {
        continue;
      }
      scan(comment.body, 'comment');
    }
  });

  await safely('pull request reviews', async () => {
    const reviews = await octokit.paginate(octokit.rest.pulls.listReviews, {
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    for (const review of reviews) {
      if (isBot(review.user)) {
        continue;
      }
      scan(review.body, 'review');
    }
  });

  await safely('pull request review comments', async () => {
    const reviewComments = await octokit.paginate(octokit.rest.pulls.listReviewComments, {
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    for (const comment of reviewComments) {
      if (isBot(comment.user)) { // filter out bot reviews
        continue;
      }
      scan(comment.body, 'review-comment');
    }
  });

  // Issues that mention this PR show up as cross-referenced timeline events.
  await safely('pull request timeline', async () => {
    const timeline = await octokit.paginate(octokit.rest.issues.listEventsForTimeline, {
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });

    for (const event of timeline) {
      if (event.event !== 'cross-referenced' || isBot(event.actor)) {
        continue;
      }

      const source = event.source && event.source.issue;
      if (!source || source.pull_request) {
        continue;
      }

      const sourceRepo = source.repository;
      if (sourceRepo && sourceRepo.full_name !== `${owner}/${repo}`) {
        continue;
      }

      record(source.number, 'cross-reference');
    }
  });

  return references;
}

module.exports = {
  extractIssueNumbers,
  collectReferencedIssues,
};
