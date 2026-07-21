const core = require('@actions/core');
const { GitHubCommitTracker } = require('./github-tracker');

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
    skipped: [],
    errors: [],
    closedByReference: [],
  };

  const referencedIssues = parseReferencedIssues(prBody);
  if (referencedIssues.length === 0) {
    core.info(
      `No Resolves/Closes/Fixes #N references found in PR #${prNumber} body. Nothing to close.`
    );
    return;
  }

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
}

main().catch((error) => {
  core.setFailed(error.message);
});
