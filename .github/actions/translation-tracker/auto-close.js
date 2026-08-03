const core = require('@actions/core');
const { GitHubCommitTracker } = require('./github-tracker');
const { SUPPORTED_LANGUAGES } = require('./constants');
const { getLanguageDisplayName } = require('./utils');

// Check for linking keywords (ref: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
const RESOLVES_REGEX = /(?:resolves|resolve|resolved|close|closes|closed|fixes|fix|fixed)\s+#(\d+)/gi;

/// Extract unique issue numbers from PR body (Resolves / Closes / Fixes #N).
function parseReferencedIssues(prBody) {
  if (!prBody) {
    return [];
  }

  const numbers = new Set();
  let match;
  const regex = new RegExp(RESOLVES_REGEX.source, RESOLVES_REGEX.flags);
  while ((match = regex.exec(prBody)) !== null) {
    numbers.add(parseInt(match[1], 10));
  }
  return [...numbers];
}

// List all files changed in a merged PR (paginated).
async function listPullRequestFiles(octokit, owner, repo, pullNumber) {
  const files = [];
  let page = 1;
  const perPage = 100;
  
  while (true) {
    const { data } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: perPage,
      page,
    });

    files.push(...data);

    if (data.length < perPage) {
      break;
    }

    page += 1;
  }

  return files;
}

/*
  Identify translation languages from changed PR file paths.
  e.g. src/content/tutorials/es/**.mdx → 'es' (Spanish)
 */
function identifyLanguagesFromFiles(changedFiles) {
  const languages = new Set();

  // Sort longer codes first (standard for regex)
  const langPattern = [...SUPPORTED_LANGUAGES].sort((a, b) => b.length - a.length).join('|'); // it should be like this: 'zh-Hans|es|hi|ko'
  const pathRegex = new RegExp(`^src/content/[^/]+/(${langPattern})/`);

  for (const file of changedFiles) {
    const filename = file.filename || file;
    const match = filename.match(pathRegex);
    if (match) {
      languages.add(match[1]);
    }
  }

  return [...languages];
}

// Strike language required lines in the tracker issue body for resolved languages.
function strikeLanguagesInBody(body, languages) {
  let result = body || '';

  for (const language of languages) {
    const displayName = getLanguageDisplayName(language);
    const escaped = displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match a list item that starts with the language display name and is not already struck.
    const lineRegex = new RegExp(`^(- (?!~~)\\*\\*${escaped}\\*\\*:.*)$`, 'gm');
    result = result.replace(lineRegex, '~~$1~~');
  }

  return result;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY || 'processing/p5.js-website';
  const prNumber = parseInt(process.env.PR_NUMBER || '', 10);
  const prBody = process.env.PR_BODY || '';

  if (!token) {
    core.setFailed('GITHUB_TOKEN is required');
    return;
  }

  if (!prNumber || Number.isNaN(prNumber)) {
    core.setFailed('PR_NUMBER is required');
    return;
  }

  const [owner, repo] = repository.split('/');
  const tracker = await GitHubCommitTracker.create(token, owner, repo);

  const summary = {
    updated: [],
    closed: [],
    skipped: [],
    errors: [],
  };

  const referencedIssues = parseReferencedIssues(prBody);
  if (referencedIssues.length === 0) {
    core.info(
      `No Resolves/Closes/Fixes #N references found in PR #${prNumber} body. Nothing to close or edit.`
    );
    return;
  }

  const changedFiles = await listPullRequestFiles(tracker.octokit, owner, repo, prNumber);
  const languages = identifyLanguagesFromFiles(changedFiles);

  if (languages.length === 0) {
    core.info(
      `PR #${prNumber} references issue(s) but no translation-language paths were found in changed files. Skipping...`
    );
    return;
  }

  core.info(`Found ${referencedIssues.length} referenced issue(s) in PR body`);
  core.info(`Languages from changed files: ${languages.join(', ')}`);

  for (const issueNumber of referencedIssues) {
    try {
      const issue = await tracker.getIssue(issueNumber);

      if (!issue.open) {
        summary.skipped.push({ issueNumber, reason: 'not open' });
        core.info(`Skipped #${issueNumber}: not open`);
        continue;
      }

      // check for 'needs translation' label to ensure that the issue is related to translation
      if (!issue.labels.includes('needs translation')) {
        summary.skipped.push({ issueNumber, reason: 'not a tracker issue' });
        core.info(`Skipped #${issueNumber}: missing 'needs translation' label`);
        continue;
      }

      const editedBody = strikeLanguagesInBody(issue.body, languages);
      const result = await tracker.applyLanguageProgress(issue, languages, prNumber, {
        body: editedBody,
      });

      if (result.closed) {
        summary.closed.push(issueNumber);
        core.info(`Closed issue #${issueNumber} (no remaining lang-* labels)`);
      } else if (result.removedLanguages.length > 0) {
        summary.updated.push({
          issueNumber,
          removedLanguages: result.removedLanguages,
          remainingLanguages: result.remainingLanguages,
        });
        core.info(
          `Updated issue #${issueNumber}: removed ${result.removedLanguages
            .map((l) => `lang-${l}`)
            .join(', ')}; remaining: ${result.remainingLanguages.join(', ') || 'none'}`
        );
      } else {
        summary.skipped.push({
          issueNumber,
          reason: 'no matching lang-* labels for PR languages',
        });
        core.info(`Skipped #${issueNumber}: no matching lang-* labels for ${languages.join(', ')}`);
      }
    } catch (error) {
      summary.errors.push({ issueNumber, error: error.message });
      core.warning(`Failed to process #${issueNumber}: ${error.message}`);
    }
  }

  core.info(
    `Auto-close summary: ${summary.updated.length} updated, ${summary.closed.length} closed, ${summary.skipped.length} skipped, ${summary.errors.length} error(s)`
  );
}

main().catch((error) => {
  core.setFailed(error.message);
});
