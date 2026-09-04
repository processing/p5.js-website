const core = require('@actions/core');
const { GitHubCommitTracker } = require('./github-tracker');
const { collectReferencedIssues } = require('./pr-references');
const { SUPPORTED_LANGUAGES } = require('./constants');
const { getLanguageDisplayName } = require('./utils');

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
    reopened: [],
    closed: [],
    skipped: [],
    errors: [],
  };

  const references = await collectReferencedIssues({
    octokit: tracker.octokit,
    owner,
    repo,
    prNumber,
  });

  if (references.size === 0) {
    core.info(`No #N references found anywhere on PR #${prNumber}. Nothing to close or edit.`);
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

  core.info(`Found ${references.size} referenced issue(s) on PR #${prNumber}:`);
  for (const [issueNumber, sources] of references) {
    core.info(`  #${issueNumber} (from ${[...sources].join(', ')})`);
  }
  core.info(`Languages from changed files: ${languages.join(', ')}`);

  for (const issueNumber of references.keys()) {
    if (issueNumber === prNumber) {
      summary.skipped.push({ issueNumber, reason: 'self-reference' });
      core.info(`Skipped #${issueNumber}: self-reference`);
      continue;
    }

    try {
      let issue;
      try {
        issue = await tracker.getIssue(issueNumber);
      } catch (error) {
        // A stray number (a hex color, a version string) is noise, not a failure.
        if (error.status === 404) {
          summary.skipped.push({ issueNumber, reason: 'not found' });
          core.info(`Skipped #${issueNumber}: no such issue`);
          continue;
        }
        throw error;
      }

      if (issue.isPullRequest) {
        summary.skipped.push({ issueNumber, reason: 'is a pull request' });
        core.info(`Skipped #${issueNumber}: is a pull request, not an issue`);
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
        const removed = result.removedLanguages.map((l) => `lang-${l}`).join(', ');
        const remaining = result.remainingLanguages.join(', ') || 'none';

        summary.updated.push({
          issueNumber,
          removedLanguages: result.removedLanguages,
          remainingLanguages: result.remainingLanguages,
        });

        if (result.reopened) {
          summary.reopened.push(issueNumber);
          core.info(
            `Reopened issue #${issueNumber}: removed ${removed}; still needs ${remaining}`
          );
        } else {
          core.info(`Updated issue #${issueNumber}: removed ${removed}; remaining: ${remaining}`);
        }
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
    `Auto-close summary: ${summary.updated.length} updated (${summary.reopened.length} reopened), ${summary.closed.length} closed, ${summary.skipped.length} skipped, ${summary.errors.length} error(s)`
  );
}

if (require.main === module) {
  main().catch((error) => {
    core.setFailed(error.message);
  });
}

module.exports = {
  main,
  identifyLanguagesFromFiles,
  strikeLanguagesInBody,
};
