const { execSync } = require('child_process');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const { getStewardsForLanguage, getLanguageDisplayName, loadStewardsConfig } = require('./utils');

class GitHubCommitTracker {
  constructor(token, owner, repo) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
    this.currentBranch = this.detectCurrentBranch();
    this.stewardsConfig = null;
  }

  static async create(token, owner, repo) {
    const instance = new GitHubCommitTracker(token, owner, repo);
    instance.stewardsConfig = await loadStewardsConfig();
    return instance;
  }

  detectCurrentBranch() {
    try {
      if (process.env.GITHUB_HEAD_REF) {
        return process.env.GITHUB_HEAD_REF;
      }

      if (process.env.GITHUB_REF_NAME) {
        return process.env.GITHUB_REF_NAME;
      }

      try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        if (branch && branch !== 'HEAD') {
          return branch;
        }
      } catch (gitError) {
        // Silent fallback
      }

      return 'main';
    } catch (error) {
      return 'main';
    }
  }

  async getLastCommit(filePath) {
    try {
      const { data } = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        sha: this.currentBranch,
        path: filePath,
        per_page: 1,
      });

      if (data.length > 0) {
        return {
          sha: data[0].sha,
          date: new Date(data[0].commit.committer.date),
          message: data[0].commit.message,
          author: data[0].commit.author.name,
          url: data[0].html_url,
        };
      }

      return null;
    } catch (error) {
      console.log(
        `⚠️  Primary commit lookup failed for ${filePath} on branch '${this.currentBranch}': ${error.message}`
      );

      if (this.currentBranch !== 'main') {
        try {
          const { data } = await this.octokit.rest.repos.listCommits({
            owner: this.owner,
            repo: this.repo,
            sha: 'main',
            path: filePath,
            per_page: 1,
          });

          if (data.length > 0) {
            return {
              sha: data[0].sha,
              date: new Date(data[0].commit.committer.date),
              message: data[0].commit.message,
              author: data[0].commit.author.name,
              url: data[0].html_url,
            };
          }
        } catch (fallbackError) {
          console.log(`⚠️  Fallback to main branch also failed for ${filePath}: ${fallbackError.message}`);
        }
      }

      console.log(`❌ Could not get commit info for ${filePath} from any branch`);
      return null;
    }
  }

  async getRecentDiffForFile(filePath) {
    try {
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        sha: this.currentBranch,
        path: filePath,
        per_page: 2,
      });

      if (!commits || commits.length === 0) {
        return null;
      }

      const headSha = commits[0].sha;
      let baseSha = commits.length > 1 ? commits[1].sha : null;

      if (!baseSha) {
        try {
          const { data: headCommit } = await this.octokit.rest.repos.getCommit({
            owner: this.owner,
            repo: this.repo,
            ref: headSha,
          });
          baseSha = headCommit.parents && headCommit.parents.length > 0 ? headCommit.parents[0].sha : null;
        } catch (parentErr) {
          console.log(`⚠️  Could not resolve base commit for diff of ${filePath}: ${parentErr.message}`);
        }
      }

      if (!baseSha) {
        return {
          baseSha: null,
          headSha,
          compareUrl: `https://github.com/${this.owner}/${this.repo}/commit/${headSha}`,
          patchSnippet: null,
          isTruncated: false,
        };
      }

      const { data: compare } = await this.octokit.rest.repos.compareCommits({
        owner: this.owner,
        repo: this.repo,
        base: baseSha,
        head: headSha,
      });

      const changedFile = (compare.files || []).find((f) => f.filename === filePath);
      const patch = changedFile && changedFile.patch ? changedFile.patch : null;

      let patchSnippet = null;
      let isTruncated = false;
      if (patch) {
        const lines = patch.split('\n');
        const maxLines = 50;
        if (lines.length > maxLines) {
          patchSnippet = lines.slice(0, maxLines).join('\n');
          isTruncated = true;
        } else {
          patchSnippet = patch;
        }
      }

      return {
        baseSha,
        headSha,
        compareUrl: `https://github.com/${this.owner}/${this.repo}/compare/${baseSha}...${headSha}`,
        patchSnippet,
        isTruncated,
      };
    } catch (error) {
      console.log(`⚠️  Failed to compute diff for ${filePath} on branch '${this.currentBranch}': ${error.message}`);
      return {
        baseSha: null,
        headSha: null,
        compareUrl: `https://github.com/${this.owner}/${this.repo}/blob/${this.currentBranch}/${filePath}`,
        patchSnippet: null,
        isTruncated: false,
      };
    }
  }

  async createMultiLanguageTranslationIssue(fileTranslations) {
    const englishFile = fileTranslations.englishFile;
    const issueTitle = `🌍 Update translations for ${path.basename(englishFile)}`;
    const englishDiff = await this.getRecentDiffForFile(englishFile);
    const issueBody = this.formatMultiLanguageIssueBody(fileTranslations, englishDiff);

    const labels = ['needs translation', 'help wanted'];
    const affectedLanguages = [
      ...fileTranslations.outdatedLanguages.map((l) => l.language),
      ...fileTranslations.missingLanguages.map((l) => l.language),
    ];

    const uniqueLanguages = [...new Set(affectedLanguages)];
    uniqueLanguages.forEach((lang) => {
      labels.push(`lang-${lang}`);
    });

    let assignees = [];
    uniqueLanguages.forEach((lang) => {
      const stewards = getStewardsForLanguage(this.stewardsConfig, lang);
      assignees.push(...stewards);
    });
    assignees = [...new Set(assignees.map((a) => a.replace('@', '')))];

    try {
      const createParams = {
        owner: this.owner,
        repo: this.repo,
        title: issueTitle,
        body: issueBody,
        labels,
      };

      if (assignees.length > 0) {
        createParams.assignees = assignees;
      }

      const { data } = await this.octokit.rest.issues.create(createParams);
      return data;
    } catch (error) {
      if (error.message.includes('assignees') && assignees.length > 0) {
        try {
          const { data } = await this.octokit.rest.issues.create({
            owner: this.owner,
            repo: this.repo,
            title: issueTitle,
            body: issueBody,
            labels,
          });
          console.log(`⚠️  Issue created but stewards could not be assigned (not collaborators)`);
          return data;
        } catch (retryError) {
          console.error(`❌ Error creating issue on retry:`, retryError.message);
          return null;
        }
      }
      console.error(`❌ Error creating multi-language issue:`, error.message);
      return null;
    }
  }

  formatMultiLanguageIssueBody(fileTranslations, englishDiff) {
    const englishFile = fileTranslations.englishFile;
    const outdatedLanguages = fileTranslations.outdatedLanguages;
    const missingLanguages = fileTranslations.missingLanguages;
    const englishCommit = fileTranslations.englishCommit;

    let body = `## 🌍 Translation Update Needed

**File**: \`${englishFile}\`
**Branch**: \`${this.currentBranch}\`

### 📅 Timeline
- **Latest English update**: ${englishCommit.date.toLocaleDateString()} by ${englishCommit.author}

`;

    if (outdatedLanguages.length > 0) {
      body += `### 🔄 Outdated Translations\n\n`;
      outdatedLanguages.forEach((lang) => {
        const translationPath = lang.translationPath;
        const stewards = getStewardsForLanguage(this.stewardsConfig, lang.language);
        const stewardsText = stewards.length > 0 ? ` (cc ${stewards.join(', ')})` : '';
        body += `- **${this.getLanguageDisplayName(lang.language)}**: Last updated ${lang.commitInfo.translation.date.toLocaleDateString()} by ${lang.commitInfo.translation.author}${stewardsText}\n`;
        body += `  - [📝 View file](https://github.com/${this.owner}/${this.repo}/blob/${this.currentBranch}/${translationPath})\n\n`;
      });
    }

    if (missingLanguages.length > 0) {
      body += `### ❌ Missing Translations\n\n`;
      missingLanguages.forEach((lang) => {
        const translationPath = lang.translationPath;
        const stewards = getStewardsForLanguage(this.stewardsConfig, lang.language);
        const stewardsText = stewards.length > 0 ? ` (cc ${stewards.join(', ')})` : '';
        body += `- **${this.getLanguageDisplayName(lang.language)}**: Translation file does not exist${stewardsText}\n`;
        body += `  - Expected location: \`${translationPath}\`\n\n`;
      });
    }

    if (englishDiff && (englishDiff.compareUrl || englishDiff.patchSnippet)) {
      body += `### 🧩 Recent English Diff\n\n`;
      if (englishDiff.compareUrl) {
        body += `- [🔍 View full compare](${englishDiff.compareUrl})\n\n`;
      }
      if (englishDiff.patchSnippet) {
        body += `<details>\n<summary>Show patch snippet</summary>\n\n`;
        body += `\`\`\`diff\n${englishDiff.patchSnippet}\n\`\`\`\n\n`;
        if (englishDiff.isTruncated) {
          body += `_(Patch snippet truncated. Use the compare link above for the full diff.)_\n\n`;
        }
        body += `</details>\n\n`;
      } else {
        body += `_(Couldn't generate preview of the differences for this change. Use the compare link above to see the full diff.)_\n\n`;
      }
    }

    body += `### 🔗 Quick Links
- [📄 Current English file](https://github.com/${this.owner}/${this.repo}/blob/${this.currentBranch}/${englishFile})

### ✅ Action Checklist

**For translators / contributors:**

- [ ] Review the recent English file changes and the current translations
- [ ] Confirm if translation already reflects the update — close the issue if so  
- [ ] Update the translation files accordingly
- [ ] Maintain structure, code blocks, and formatting
- [ ] Ensure translation is accurate and culturally appropriate

### 📝 Summary of English File Changes
**Last commit**: [${englishCommit.message}](${englishCommit.url})

${outdatedLanguages.length > 0 || missingLanguages.length > 0 ? `**Change Type**: English file was updated. ${outdatedLanguages.length > 0 ? `${outdatedLanguages.map((l) => this.getLanguageDisplayName(l.language)).join(', ')} translation${outdatedLanguages.length > 1 ? 's' : ''} may be outdated.` : ''} ${missingLanguages.length > 0 ? `${missingLanguages.map((l) => this.getLanguageDisplayName(l.language)).join(', ')} translation${missingLanguages.length > 1 ? 's are' : ' is'} missing.` : ''}` : ''}

---
ℹ️ **Need help?** See our [Contributor Guidelines](https://p5js.org/contribute/contributor_guidelines/)

🤖 *This issue was auto-generated by the p5.js Translation Tracker*`;
    return body;
  }

  getLanguageDisplayName(langCode) {
    return getLanguageDisplayName(langCode);
  }

  async createBranchWithFiles(branchName, commitMessage, fileChanges) {
    const baseBranch = this.currentBranch || 'main';

    const { data: ref } = await this.octokit.rest.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${baseBranch}`,
    });
    const baseSha = ref.object.sha;

    const { data: baseCommit } = await this.octokit.rest.git.getCommit({
      owner: this.owner,
      repo: this.repo,
      commit_sha: baseSha,
    });

    const treeItems = await Promise.all(
      fileChanges.map(async ({ path: filePath, content }) => {
        const { data: blob } = await this.octokit.rest.git.createBlob({
          owner: this.owner,
          repo: this.repo,
          content: Buffer.from(content, 'utf8').toString('base64'),
          encoding: 'base64',
        });
        return { path: filePath, mode: '100644', type: 'blob', sha: blob.sha };
      })
    );

    const { data: tree } = await this.octokit.rest.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: baseCommit.tree.sha,
      tree: treeItems,
    });

    const { data: commit } = await this.octokit.rest.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message: commitMessage,
      tree: tree.sha,
      parents: [baseSha],
    });

    await this.octokit.rest.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${branchName}`,
      sha: commit.sha,
    });

    return { branchName, commitSha: commit.sha };
  }

  async createStubPullRequest(language, stubs, failures = []) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const branchName = `translation-stubs/${language}-${dateStr}-${Date.now()}`;
    const langName = this.getLanguageDisplayName(language);
    const commitMessage = `chore(i18n): add ${language} translation stubs for ${stubs.length} page(s)`;

    const fileChanges = stubs.map((stub) => ({
      path: stub.translationPath,
      content: stub.content,
    }));

    try {
      await this.createBranchWithFiles(branchName, commitMessage, fileChanges);

      const stewards = getStewardsForLanguage(this.stewardsConfig, language);
      const stewardsText = stewards.length > 0 ? `\n\ncc ${stewards.join(' ')}` : '';
      const fileList = stubs
        .map((stub) => `- \`${stub.translationPath}\` (from \`${stub.englishPath}\`)`)
        .join('\n');

      const failuresSection =
        failures.length > 0
          ? `

### Generation failures (${failures.length})

These English sources could not be turned into stubs and were skipped:

${failures.map((f) => `- \`${f.englishFile}\`: ${f.error}`).join('\n')}
`
          : '';

      const { data: pr } = await this.octokit.rest.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title: `chore(i18n): add ${langName} translation stubs (${stubs.length})`,
        head: branchName,
        base: this.currentBranch || 'main',
        body: `## Translation stub files

This PR adds placeholder files for content that exists in English but has no ${langName} translation yet.

Each stub:
- copies English frontmatter
- sets \`needsTranslation: true\`
- includes a short placeholder body for translators to replace

### Files (${stubs.length})

${fileList}
${failuresSection}
### Next steps for translators

- [ ] Translate each file's body and frontmatter fields
- [ ] Remove or set \`needsTranslation: false\` when complete
- [ ] Keep code blocks, links, and structure aligned with the English source

---
🤖 *Auto-generated by the p5.js Translation Tracker*${stewardsText}`,
      });

      console.log(`\n🔀 Stub PR created for ${langName}: #${pr.number}`);
      console.log(`   URL: ${pr.html_url}`);
      return pr;
    } catch (error) {
      console.error(`❌ Failed to create stub PR for ${language}:`, error.message);
      return null;
    }
  }
}

module.exports = { GitHubCommitTracker };
