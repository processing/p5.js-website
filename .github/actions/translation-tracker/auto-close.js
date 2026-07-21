const core = require('@actions/core');
const { GitHubCommitTracker } = require('./github-tracker');
const { parseTranslationPath } = require('./utils');

const RESOLVES_REGEX = /(?:resolves|closes|fixes)\s+#(\d+)/gi;

/**
 * Extract unique issue numbers from PR body (Resolves / Closes / Fixes #N).
 */
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

/**
 * List all files changed in a merged PR (paginated).
 */
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
    resolved: [],
    skipped: [],
    errors: [],
    closedByReference: [],
  };

  // Fast path: Resolves / Closes / Fixes #N in PR body
  const referencedIssues = parseReferencedIssues(prBody);
  if (referencedIssues.length > 0) {
    core.info(`Found ${referencedIssues.length} referenced issue(s) in PR body`);

    for (const issueNumber of referencedIssues) {
      try {
        const closed = await tracker.closeTrackerIssueByReference(issueNumber, prNumber);
        if (closed) {
          summary.closedByReference.push(issueNumber);
          core.info(`Closed issue #${issueNumber} via Resolves fast path`);
        } else {
          summary.skipped.push({ issueNumber, reason: 'not open or not a tracker issue' });
        }
      } catch (error) {
        summary.errors.push({ issueNumber, error: error.message });
        core.warning(`Failed to close #${issueNumber}: ${error.message}`);
      }
    }

    const closedCount = summary.closedByReference.length;
    core.info(
      `Auto-close summary: ${closedCount} issue(s) closed via PR reference, ${summary.skipped.length} skipped, ${summary.errors.length} error(s)`
    );
    return;
  }

  // File-path path: match changed translation files to tracker issues
  const changedFiles = await listPullRequestFiles(tracker.octokit, owner, repo, prNumber);
  core.info(`Processing ${changedFiles.length} changed file(s) from PR #${prNumber}`);

  const processed = new Set();
  let closedCount = 0;
  let updatedCount = 0;

  for (const file of changedFiles) {
    const filePath = file.filename;

    try {
      const parsed = parseTranslationPath(filePath);
      if (!parsed) {
        summary.skipped.push({ file: filePath, reason: 'not a translation content path' });
        continue;
      }

      const dedupeKey = `${parsed.englishPath}:${parsed.language}`;
      if (processed.has(dedupeKey)) {
        summary.skipped.push({ file: filePath, reason: 'duplicate englishPath+language' });
        continue;
      }
      processed.add(dedupeKey);

      const issue = await tracker.findTrackerIssue(parsed.englishPath, parsed.language);
      if (!issue) {
        summary.skipped.push({
          file: filePath,
          englishPath: parsed.englishPath,
          language: parsed.language,
          reason: 'no matching open tracker issue',
        });
        continue;
      }

      const result = await tracker.resolveTranslationIssue(issue, parsed.language, prNumber);
      summary.resolved.push({
        issueNumber: issue.number,
        file: filePath,
        language: parsed.language,
        closed: result.closed,
        remainingLanguages: result.remainingLanguages,
      });

      if (result.closed) {
        closedCount += 1;
        core.info(`Closed issue #${issue.number} (${parsed.language} was last remaining language)`);
      } else {
        updatedCount += 1;
        core.info(
          `Updated issue #${issue.number}: removed lang-${parsed.language}, remaining: ${result.remainingLanguages.join(', ')}`
        );
      }
    } catch (error) {
      summary.errors.push({ file: filePath, error: error.message });
      core.warning(`Error processing ${filePath}: ${error.message}`);
    }
  }

  core.info(
    `Auto-close summary: ${updatedCount} issue(s) updated, ${closedCount} closed, ${summary.skipped.length} skipped, ${summary.errors.length} error(s)`
  );
}

main().catch((error) => {
  core.setFailed(error.message);
});
