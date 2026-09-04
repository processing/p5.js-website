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

/**
 * Parse expected translation file paths from a tracker issue body.
 *
 * The issue body produced by github-tracker.js contains paths in two forms:
 *   Outdated:  `[📝 View file](https://github.com/.../blob/main/src/content/...)`
 *   Missing:   `Expected location: \`src/content/...\``
 *
 * @param {string} body - The issue body text.
 * @returns {Map<string, string[]>} Language code → expected file paths.
 */
function extractExpectedPaths(body) {
  const result = new Map();

  if (!body) return result;

  const langPattern = [...SUPPORTED_LANGUAGES].sort((a, b) => b.length - a.length).join('|');
  const langFromPath = new RegExp(`^src/content/[^/]+/(${langPattern})/`);

  const addPath = (filePath) => {
    const match = filePath.match(langFromPath);
    if (match) {
      const lang = match[1];
      if (!result.has(lang)) result.set(lang, []);
      result.get(lang).push(filePath);
    }
  };

  // Missing translations: Expected location: `src/content/...`
  const expectedLocationRegex = /Expected location:\s*`([^`]+)`/g;
  let m;
  while ((m = expectedLocationRegex.exec(body)) !== null) {
    addPath(m[1]);
  }

  // Outdated translations: [📝 View file](https://github.com/.../blob/<branch>/src/content/...)
  const viewFileRegex = /\[.*?View file.*?\]\(https?:\/\/github\.com\/[^)]*\/blob\/[^/]+\/([^)]+)\)/g;
  while ((m = viewFileRegex.exec(body)) !== null) {
    addPath(m[1]);
  }

  return result;
}

/**
 * Strike language lines in the tracker issue body for languages whose translations have been added.
 *
 * Returns both the modified body and the list of languages that were actually
 * struck, so callers can gate label removal on the same condition.
 */
function strikeLanguagesInBody(body, languages) {
  let result = body || '';
  const struck = [];

  for (const language of languages) {
    const displayName = getLanguageDisplayName(language);
    const escaped = displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const lineRegex = new RegExp(`^(\\s*-?\\s*(?!~~)\\*\\*${escaped}\\*\\*:.*)$`, 'gm');
    const before = result;
    
    result = result.replace(lineRegex, '~~$1~~');
    if (result !== before) {
      struck.push(language);
    }
  }

  return { body: result, struck };
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

      // Narrow languages to those whose expected file actually appears in this PR.
      const expectedPaths = extractExpectedPaths(issue.body);
      const changedFileNames = changedFiles.map((f) => f.filename || f);

      const verifiedLanguages = languages.filter((lang) => {
        const paths = expectedPaths.get(lang);
        if (!paths || paths.length === 0) return true; // no path info means we fall back to label match
        return paths.some((p) => changedFileNames.includes(p));
      });

      const skippedLangs = languages.filter((lang) => !verifiedLanguages.includes(lang));
      for (const lang of skippedLangs) {
        const paths = expectedPaths.get(lang) || [];
        core.info(
          `Skipped lang-${lang} for #${issueNumber}: expected file(s) [${paths.join(', ')}] not in PR`
        );
      }

      if (verifiedLanguages.length === 0) {
        summary.skipped.push({ issueNumber, reason: 'expected file(s) not in PR' });
        core.info(`Skipped #${issueNumber}: none of the expected translation files were changed`);
        continue;
      }

      const { body: editedBody, struck } = strikeLanguagesInBody(issue.body, verifiedLanguages);

      if (struck.length === 0) {
        summary.skipped.push({ issueNumber, reason: 'could not match language lines in issue body' });
        core.info(
          `Skipped #${issueNumber}: verified languages [${verifiedLanguages.join(', ')}] could not be matched in body`
        );
        continue;
      }

      const result = await tracker.applyLanguageProgress(issue, struck, prNumber, {
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
  extractExpectedPaths,
};
