const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { Octokit } = require('@octokit/rest');
const yaml = require('js-yaml');

const SUPPORTED_LANGUAGES = ['es', 'hi', 'ko', 'zh-Hans'];
const CONTENT_TYPES = ['examples', 'reference', 'tutorials', 'text-detail', 'events', 'libraries'];

function getTranslationPath(englishFilePath, language) {
  // Ensure we have a valid English path
  if (!englishFilePath.includes('/en/')) {
    throw new Error(`Invalid English file path: ${englishFilePath}. Must contain '/en/'`);
  }
  
  // Split path into parts and replace 'en' directory with target language
  const pathParts = englishFilePath.split('/');
  const enIndex = pathParts.findIndex(part => part === 'en');
  
  if (enIndex === -1) {
    throw new Error(`Could not find 'en' directory in path: ${englishFilePath}`);
  }
  
  // Create new path with language replacement
  const translationParts = [...pathParts];
  translationParts[enIndex] = language;
  
  return translationParts.join('/');
}

function getSlugFromEnglishPath(englishFilePath, contentType) {
  const prefix = `src/content/${contentType}/en/`;
  if (!englishFilePath.startsWith(prefix)) return null;
  let relative = englishFilePath.substring(prefix.length);
  
  if (relative.endsWith('/description.mdx')) {
    relative = relative.slice(0, -'/description.mdx'.length);
  } else if (relative.endsWith('.mdx')) {
    relative = relative.slice(0, -'.mdx'.length);
  } else if (relative.endsWith('.yaml')) {
    relative = relative.slice(0, -'.yaml'.length);
  }
  return relative;
}

function parseEnvList(envValue, defaultList) {
  if (!envValue || envValue.trim() === '') {
    return defaultList;
  }
  return envValue.split(',').map((item) => item.trim()).filter(Boolean);
}

/**
 * Find English content files that have no translation file yet.
 * Used for stub-file generation (Week 2).
 */
function findMissingTranslations(contentTypes, languages, options = {}) {
  const { fullScan = false, testFiles = null } = options;
  const missing = [];

  for (const contentType of contentTypes) {
    let englishFiles;
    if (testFiles) {
      englishFiles = testFiles.filter(
        (file) =>
          file.startsWith(`src/content/${contentType}/en/`) &&
          (file.endsWith('.mdx') || file.endsWith('.yaml'))
      );
    } else if (fullScan) {
      englishFiles = getAllEnglishContentFiles(contentType);
    } else if (process.env.GITHUB_ACTIONS) {
      englishFiles = getChangedFiles(null, contentType);
    } else {
      englishFiles = getAllEnglishContentFiles(contentType);
    }

    for (const englishFile of englishFiles) {
      for (const language of languages) {
        const translationPath = getTranslationPath(englishFile, language);
        if (!fileExists(translationPath)) {
          missing.push({ englishFile, language, translationPath, contentType });
        }
      }
    }
  }

  missing.sort((a, b) => a.translationPath.localeCompare(b.translationPath));
  return missing;
}

/** Frontmatter fields copied into stubs (English values). Avoids duplicating params/examples. */
const STUB_FRONTMATTER_KEYS = {
  reference: ['title', 'module', 'submodule', 'file', 'description'],
  examples: ['title', 'oneLineDescription', 'featuredImage', 'featuredImageAlt'],
  tutorials: ['title', 'description'],
  'text-detail': ['title', 'description'],
  events: ['title', 'description'],
  libraries: ['title', 'description'],
};

function pickStubFrontmatter(frontmatter, contentType) {
  const keys = STUB_FRONTMATTER_KEYS[contentType] || ['title', 'description'];
  const picked = { needsTranslation: true };
  for (const key of keys) {
    if (frontmatter[key] !== undefined) {
      picked[key] = frontmatter[key];
    }
  }
  return picked;
}

function parseFrontmatter(raw, filePath) {
  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatterMatch) {
    throw new Error(`Could not find frontmatter in ${filePath}`);
  }

  return yaml.load(frontmatterMatch[1]) || {};
}

function stringifyMdx(frontmatter, body) {
  const frontmatterText = yaml.dump(frontmatter, {
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
  });

  return `---\n${frontmatterText}---\n${body}`;
}

/**
 * Build a placeholder translation file from an English source.
 * Copies essential frontmatter (in English), sets needsTranslation: true, minimal body.
 */
function generateStubFromEnglish(englishPath, language, contentType = 'reference') {
  const raw = fs.readFileSync(englishPath, 'utf8');
  const frontmatter = parseFrontmatter(raw, englishPath);
  const translationPath = getTranslationPath(englishPath, language);

  const stubFrontmatter = pickStubFrontmatter(frontmatter, contentType);

  const stubComment = `<!--
  Auto-generated translation stub (${language}).
  Translate from the English source and remove needsTranslation when done.
  English source: ${englishPath}
-->`;

  const stubBody = `${stubComment}

<!-- Translation needed. Replace this placeholder with the translated content. -->
`;

  const content = stringifyMdx(stubFrontmatter, stubBody);

  return { translationPath, content, englishPath };
}

/** Where dry-run stubs are written locally (never touches src/content by default). */
function getStubWritePath(translationPath, dryRun) {
  if (!dryRun) {
    return translationPath;
  }
  const outputRoot =
    process.env.STUB_OUTPUT_DIR ||
    path.join(process.cwd(), '.github/actions/translation-tracker/stub-preview');
  return path.join(outputRoot, translationPath);
}

async function loadStewardsConfig() {
  const STEWARDS_URL = 'https://raw.githubusercontent.com/processing/p5.js/main/stewards.yml';
  
  return new Promise((resolve, reject) => {
    https.get(STEWARDS_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const config = yaml.load(data);
          console.log('Successfully loaded stewards config from p5.js repository');
          resolve(config);
        } catch (error) {
          console.log(`Could not parse stewards config: ${error.message}`);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.log(` Could not load stewards config from remote: ${error.message}`);
      resolve(null);
    });
  });
}

function getStewardsForLanguage(stewardsConfig, language) {
  if (!stewardsConfig) return [];
  
  // Map website language codes to stewards.yml language codes
  const languageMap = {
    'zh-Hans': 'zh', // Simplified Chinese
    'hi': 'hi',
    'ko': 'ko',
    'es': 'es'
  };
  
  const stewardsLangCode = languageMap[language] || language;
  const stewards = [];
  
  for (const [username, areas] of Object.entries(stewardsConfig)) {
    if (!Array.isArray(areas)) continue;
    
    // Check if this steward has i18n area with the target language
    for (const area of areas) {
      if (typeof area === 'object' && area.i18n) {
        const languages = area.i18n;
        if (Array.isArray(languages) && languages.includes(stewardsLangCode)) {
          stewards.push(`@${username}`);
          break; 
        }
      }
    }
  }
  
  return stewards;
}

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

  /**
   * Detect the current git branch
   */
  detectCurrentBranch() {
    try {
      // GitHub Actions environment
      if (process.env.GITHUB_HEAD_REF) {
        return process.env.GITHUB_HEAD_REF; // For pull requests
      }
      
      if (process.env.GITHUB_REF_NAME) {
        return process.env.GITHUB_REF_NAME;
      }
      
      // Git command fallback
      try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        if (branch && branch !== 'HEAD') {
          return branch;
        }
      } catch (gitError) {
        // Silent fallback
      }
      
      // Default fallback
      return 'main';
      
    } catch (error) {
      return 'main';
    }
  }

  /**
   * Get the last commit for a specific file using GitHub API
   */
  async getLastCommit(filePath) {
    try {
      const { data } = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        sha: this.currentBranch,
        path: filePath,
        per_page: 1
      });

      if (data.length > 0) {
        return {
          sha: data[0].sha,
          date: new Date(data[0].commit.committer.date),
          message: data[0].commit.message,
          author: data[0].commit.author.name,
          url: data[0].html_url
        };
      }
      
      return null;
    } catch (error) {
      console.log(`⚠️  Primary commit lookup failed for ${filePath} on branch '${this.currentBranch}': ${error.message}`);
      
      // Fallback to main branch if current branch fails
      if (this.currentBranch !== 'main') {
        try {
          const { data } = await this.octokit.rest.repos.listCommits({
            owner: this.owner,
            repo: this.repo,
            sha: 'main',
            path: filePath,
            per_page: 1
          });
          
          if (data.length > 0) {
            return {
              sha: data[0].sha,
              date: new Date(data[0].commit.committer.date),
              message: data[0].commit.message,
              author: data[0].commit.author.name,
              url: data[0].html_url
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

  /**
   * Get a recent diff for a file (head vs previous commit) and return a short patch snippet
   */
  async getRecentDiffForFile(filePath) {
    try {
      // Get latest two commits for this file on current branch
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

      // If only one commit is found for the file (new file), use the parent of head
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

      // Compare the two commits and extract the file patch
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
      // Fallback to at least provide a compare link to branch head
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
    // Fetch recent English diff (best-effort)
    const englishDiff = await this.getRecentDiffForFile(englishFile);
    const issueBody = this.formatMultiLanguageIssueBody(fileTranslations, englishDiff);
    
    // Create labels: "needs translation" + specific language labels
    const labels = ['needs translation', 'help wanted'];
    const affectedLanguages = [
      ...fileTranslations.outdatedLanguages.map(l => l.language),
      ...fileTranslations.missingLanguages.map(l => l.language)
    ];
    
    // Add specific language labels (remove duplicates)
    const uniqueLanguages = [...new Set(affectedLanguages)];
    uniqueLanguages.forEach(lang => {
      labels.push(`lang-${lang}`);
    });
    
    let assignees = [];
    uniqueLanguages.forEach(lang => {
      const stewards = getStewardsForLanguage(this.stewardsConfig, lang);
      assignees.push(...stewards);
    });
    assignees = [...new Set(assignees.map(a => a.replace('@', '')))];
    
    try {
      const createParams = {
        owner: this.owner,
        repo: this.repo,
        title: issueTitle,
        body: issueBody,
        labels: labels
      };
      
      if (assignees.length > 0) {
        createParams.assignees = assignees;
      }
      
      const { data } = await this.octokit.rest.issues.create(createParams);

      return data;
    } catch (error) {
      // If assignees fail, try again without assignees
      if (error.message.includes('assignees') && assignees.length > 0) {
        try {
          const { data } = await this.octokit.rest.issues.create({
            owner: this.owner,
            repo: this.repo,
            title: issueTitle,
            body: issueBody,
            labels: labels
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

  /**
   * Format the issue body for multi-language updates
   */
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

    // Outdated translations section
    if (outdatedLanguages.length > 0) {
      body += `### 🔄 Outdated Translations\n\n`;
      outdatedLanguages.forEach(lang => {
        const translationPath = lang.translationPath;
        const stewards = getStewardsForLanguage(this.stewardsConfig, lang.language);
        const stewardsText = stewards.length > 0 ? ` (cc ${stewards.join(', ')})` : '';
        body += `- **${this.getLanguageDisplayName(lang.language)}**: Last updated ${lang.commitInfo.translation.date.toLocaleDateString()} by ${lang.commitInfo.translation.author}${stewardsText}\n`;
        body += `  - [📝 View file](https://github.com/${this.owner}/${this.repo}/blob/${this.currentBranch}/${translationPath})\n\n`;
      });
    }

    // Missing translations section
    if (missingLanguages.length > 0) {
      body += `### ❌ Missing Translations\n\n`;
      missingLanguages.forEach(lang => {
        const translationPath = lang.translationPath;
        const stewards = getStewardsForLanguage(this.stewardsConfig, lang.language);
        const stewardsText = stewards.length > 0 ? ` (cc ${stewards.join(', ')})` : '';
        body += `- **${this.getLanguageDisplayName(lang.language)}**: Translation file does not exist${stewardsText}\n`;
        body += `  - Expected location: \`${translationPath}\`\n\n`;
      });
    }

    // English diff. It shows the actual content changes in the English file.
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

${outdatedLanguages.length > 0 || missingLanguages.length > 0 ? `**Change Type**: English file was updated. ${outdatedLanguages.length > 0 ? `${outdatedLanguages.map(l => this.getLanguageDisplayName(l.language)).join(', ')} translation${outdatedLanguages.length > 1 ? 's' : ''} may be outdated.` : ''} ${missingLanguages.length > 0 ? `${missingLanguages.map(l => this.getLanguageDisplayName(l.language)).join(', ')} translation${missingLanguages.length > 1 ? 's are' : ' is'} missing.` : ''}` : ''}

---
ℹ️ **Need help?** See our [Contributor Guidelines](https://p5js.org/contribute/contributor_guidelines/)

🤖 *This issue was auto-generated by the p5.js Translation Tracker*`;
    return body;
  }

  /**
   * Get display name for language code
   */
  getLanguageDisplayName(langCode) {
    const languages = {
      'es': 'Spanish (Español)',
      'hi': 'Hindi (हिन्दी)',
      'ko': 'Korean (한국어)',
      'zh-Hans': 'Chinese Simplified (简体中文)'
    };
    return languages[langCode] || langCode;
  }

  /**
   * Create a branch with one commit containing multiple new files (for stub PRs).
   */
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

  /**
   * Open one PR per language with all stub files for that language.
   */
  async createStubPullRequest(language, stubs) {
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
      const fileList = stubs.map((stub) => `- \`${stub.translationPath}\` (from \`${stub.englishPath}\`)`).join('\n');

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

/**
 * Get changed files from git or test files (generalized for different content types)
 */
function getChangedFiles(testFiles = null, contentType = 'examples') {
  // Allow passing test files for local development (Week 1 feature)
  if (testFiles) {
    console.log('🧪 Using provided test files for local testing');
    return testFiles.filter(file => 
      file.startsWith(`src/content/${contentType}/en`) && (file.endsWith('.mdx') || file.endsWith('.yaml'))
    );
  }

  try {
    // Different git commands for different event types
    const gitCommand = process.env.GITHUB_EVENT_NAME === 'pull_request' 
      ? 'git diff --name-only origin/main...HEAD'  // Compare with base branch for PRs
      : 'git diff --name-only HEAD~1 HEAD';       // Compare with previous commit for pushes
    
    const changedFilesOutput = execSync(gitCommand, { encoding: 'utf8' });
    const allChangedFiles = changedFilesOutput.trim().split('\n').filter(file => file.length > 0);
    
    const changedContentFiles = allChangedFiles.filter(file => 
      file.startsWith(`src/content/${contentType}/en`) && (file.endsWith('.mdx') || file.endsWith('.yaml'))
    );
    
    return changedContentFiles;
  } catch (error) {
    console.error('❌ Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Scan all English files in a content directory (generalized for examples, tutorials, text-detail)
 */
function getAllEnglishContentFiles(contentType = 'examples') {
  const contentPath = `src/content/${contentType}/en`;
  const allFiles = [];
  
  try {
    if (!fs.existsSync(contentPath)) {
      console.log(`❌ Content path does not exist: ${contentPath}`);
      return [];
    }
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          scanDirectory(itemPath);
        } else if (item.endsWith('.mdx') || item.endsWith('.yaml')) {
          allFiles.push(itemPath);
        }
      });
    };
    
    scanDirectory(contentPath);
    console.log(`📊 Found ${allFiles.length} English ${contentType} files to check`);
    return allFiles;
  } catch (error) {
    console.error(`❌ Error scanning English ${contentType} files:`, error.message);
    return [];
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}


function getFileModTime(filePath) {
  try {
    return fs.statSync(filePath).mtime;
  } catch (error) {
    console.log(`⚠️  Could not get file timestamp for ${filePath}: ${error.message}`);
    return null;
  }
}


async function checkTranslationStatus(changedFiles, githubTracker = null, createIssues = false) {
  const translationStatus = {
    needsUpdate: [],
    missing: [],
    upToDate: [],
    issuesCreated: [],
    fileTranslationMap: new Map()
  };
  
  // Group translation issues by file to create single issues per file
  const fileTranslationMap = translationStatus.fileTranslationMap;
  
  for (const englishFile of changedFiles) {
    
    let englishCommit = null;
    if (githubTracker) {
      englishCommit = await githubTracker.getLastCommit(englishFile);
      if (!englishCommit) {
        console.log(`⚠️ Skipping ${englishFile} - could not retrieve commit data`);
        continue; 
      }
    }

    const fileTranslations = {
      englishFile,
      outdatedLanguages: [],
      missingLanguages: [],
      upToDateLanguages: [],
      englishCommit
    };
    
    for (const language of SUPPORTED_LANGUAGES) {
      const translationPath = getTranslationPath(englishFile, language);
      const exists = fileExists(translationPath);
      
      if (!exists) {
        const missingItem = {
          englishFile,
          language,
          translationPath,
          status: 'missing'
        };
        translationStatus.missing.push(missingItem);
        fileTranslations.missingLanguages.push(missingItem);
        continue;
      }

      
      if (githubTracker) {
        const translationCommit = await githubTracker.getLastCommit(translationPath);

        if (!translationCommit) {
          const missingItem = {
            englishFile,
            language,
            translationPath,
            status: 'missing'
          };
          translationStatus.missing.push(missingItem);
          fileTranslations.missingLanguages.push(missingItem);
          continue;
        }

        const isOutdated = englishCommit.date > translationCommit.date;
        
        if (isOutdated) {
          const statusItem = {
            englishFile,
            language,
            translationPath,
            status: 'outdated',
            commitInfo: {
              english: englishCommit,
              translation: translationCommit
            }
          };
          
          translationStatus.needsUpdate.push(statusItem);
          fileTranslations.outdatedLanguages.push(statusItem);
        } else {
          const upToDateItem = {
            englishFile,
            language,
            translationPath,
            status: 'up-to-date'
          };
          translationStatus.upToDate.push(upToDateItem);
          fileTranslations.upToDateLanguages.push(upToDateItem);
        }
      } else {
        // Fallback to file modification time comparison
        const englishModTime = getFileModTime(englishFile);
        if (!englishModTime) {
          console.log(`  ⚠️ Could not get modification time for English file`);
          continue;
        }
        
        const translationModTime = getFileModTime(translationPath);
        const isOutdated = translationModTime < englishModTime;
        
        if (isOutdated) {
          const statusItem = {
            englishFile,
            language,
            translationPath,
            status: 'outdated',
            englishModTime,
            translationModTime
          };
          translationStatus.needsUpdate.push(statusItem);
          fileTranslations.outdatedLanguages.push(statusItem);
        } else {
          const upToDateItem = {
            englishFile,
            language,
            translationPath,
            status: 'up-to-date'
          };
          translationStatus.upToDate.push(upToDateItem);
          fileTranslations.upToDateLanguages.push(upToDateItem);
        }
      }
    }
    
    // Store file translations for potential issue creation
    if (fileTranslations.outdatedLanguages.length > 0 || fileTranslations.missingLanguages.length > 0) {
      fileTranslationMap.set(englishFile, fileTranslations);
    }
  }
  
  // Create single issues per file (covering all affected languages)
  if (createIssues && githubTracker) {
    for (const [englishFile, fileTranslations] of fileTranslationMap) {
      const issue = await githubTracker.createMultiLanguageTranslationIssue(fileTranslations);
      if (issue) {
        const issueItem = {
          englishFile,
          affectedLanguages: [
            ...fileTranslations.outdatedLanguages.map(l => l.language),
            ...fileTranslations.missingLanguages.map(l => l.language)
          ],
          issueNumber: issue.number,
          issueUrl: issue.html_url
        };
        translationStatus.issuesCreated.push(issueItem);
      }
    }
  }
  
  return translationStatus;
}

/**
 * Week 2: generate stub files and open one PR per language.
 */
async function runStubGeneration(githubTracker, options = {}) {
  const languages = parseEnvList(process.env.STUB_LANGUAGES, SUPPORTED_LANGUAGES);
  const contentTypes = parseEnvList(process.env.STUB_CONTENT_TYPES, ['reference']);
  const fullScan = options.fullScan ?? process.env.STUB_FULL_SCAN === 'true';
  const dryRun = process.env.STUB_DRY_RUN === 'true';
  const maxFiles = parseInt(process.env.STUB_MAX_FILES || '50', 10);

  console.log(`\n📦 Stub generation mode`);
  console.log(`   Languages: ${languages.join(', ')}`);
  console.log(`   Content types: ${contentTypes.join(', ')}`);
  console.log(`   Scan: ${fullScan ? 'all English files' : 'changed files only'}`);

  const missing = findMissingTranslations(contentTypes, languages, {
    fullScan,
    testFiles: options.testFiles || null,
  });

  if (missing.length === 0) {
    console.log('\n✅ No missing translation files found for stub generation.');
    return { prsCreated: [], stubsWritten: 0 };
  }

  console.log(`\n❌ Found ${missing.length} missing translation file(s):`);
  missing.forEach((item) => {
    console.log(`   - ${item.englishFile} → ${item.language}`);
    console.log(`     Expected: ${item.translationPath}`);
  });

  const limited = missing.slice(0, maxFiles);
  if (limited.length < missing.length) {
    console.log(`\n⚠️  Limiting to ${maxFiles} stub(s) (STUB_MAX_FILES). Re-run to process more.`);
  }

  const byLanguage = new Map();
  for (const item of limited) {
    if (!byLanguage.has(item.language)) {
      byLanguage.set(item.language, []);
    }
    byLanguage.get(item.language).push(item);
  }

  const prsCreated = [];
  let stubsWritten = 0;

  for (const [language, items] of byLanguage) {
    const langName = githubTracker
      ? githubTracker.getLanguageDisplayName(language)
      : language;

    console.log(`\n📝 Generating ${items.length} stub(s) for ${langName}:`);

    const stubs = items.map((item) => {
      const stub = generateStubFromEnglish(item.englishFile, language, item.contentType);
      console.log(`   📄 ${item.englishFile} → ${stub.translationPath}`);
      return stub;
    });

    if (dryRun || !githubTracker) {
      const previewRoot =
        process.env.STUB_OUTPUT_DIR ||
        path.join(process.cwd(), '.github/actions/translation-tracker/stub-preview');
      for (const stub of stubs) {
        const writePath = getStubWritePath(stub.translationPath, true);
        const dir = path.dirname(writePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(writePath, stub.content, 'utf8');
        stubsWritten += 1;
      }
      console.log(`\n🧪 Dry run: wrote ${stubs.length} stub file(s) under ${previewRoot}`);
      continue;
    }

    const pr = await githubTracker.createStubPullRequest(language, stubs);
    if (pr) {
      prsCreated.push({
        language,
        prNumber: pr.number,
        prUrl: pr.html_url,
        fileCount: stubs.length,
      });
      stubsWritten += stubs.length;
    }
  }

  if (prsCreated.length > 0) {
    console.log(`\n🔀 Stub PRs created: ${prsCreated.length}`);
    prsCreated.forEach((pr) => {
      console.log(`   - ${pr.language}: PR #${pr.prNumber} (${pr.fileCount} file(s))`);
      console.log(`     URL: ${pr.prUrl}`);
    });
  } else if (!dryRun && stubsWritten === 0 && limited.length > 0) {
    console.log(`\n💡 Stubs were not written. Check GITHUB_TOKEN permissions (contents + pull-requests write).`);
  }

  return { prsCreated, stubsWritten };
}


async function main(testFiles = null, options = {}) {
  const hasToken = !!process.env.GITHUB_TOKEN;
  const isGitHubAction = !!process.env.GITHUB_ACTIONS; // Detect if running in GitHub Actions
  const isProduction = hasToken && !testFiles;
  const generateStubsMode = process.env.GENERATE_STUBS === 'true';
  
  if (generateStubsMode) {
    console.log(`📦 Stub generation: ${testFiles ? 'test files' : isGitHubAction ? 'changed files' : 'full scan'}`);
  } else if (testFiles) {
    console.log(`🧪 Test mode: Checking ${testFiles.length} predefined files`);
  } else if (isGitHubAction) {
    console.log(`🚀 GitHub Actions: Checking changed files only`);
  } else {
    console.log(`🔍 Manual run: Scanning all files`);
  }

  // Initialize GitHub tracker if token is available
  let githubTracker = null;
  if (hasToken) {
    try {
      const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'processing/p5.js-website').split('/');
      githubTracker = await GitHubCommitTracker.create(process.env.GITHUB_TOKEN, owner, repo);
      console.log(`📡 Connected to ${owner}/${repo}`);
    } catch (error) {
      console.error('❌ GitHub API failed, using file-based tracking');
    }
  }

  // Week 2: stub-file PR generation (separate mode from issue tracking)
  if (generateStubsMode) {
    const dryRun = process.env.STUB_DRY_RUN === 'true';
    if (!githubTracker && !dryRun) {
      console.error('❌ GENERATE_STUBS requires GITHUB_TOKEN, or set STUB_DRY_RUN=true for local preview');
      process.exitCode = 1;
      return;
    }

    const fullScan =
      process.env.STUB_FULL_SCAN === 'true' ||
      (!isGitHubAction && !testFiles);

    await runStubGeneration(githubTracker, { fullScan, testFiles });
    return;
  }

  const allTranslationStatus = [];

  for (const contentType of CONTENT_TYPES) {
    let filesToCheck;
    if (testFiles) {
      filesToCheck = getChangedFiles(testFiles, contentType);
    } else if (isGitHubAction) {
      filesToCheck = getChangedFiles(null, contentType);
    } else {
      console.log(`📊 Scanning all English ${contentType} files...`);
      filesToCheck = getAllEnglishContentFiles(contentType);
    }
    
    if (filesToCheck.length === 0) {
      continue;
    }
    
    console.log(`\n📝 Checking ${filesToCheck.length} English ${contentType} file(s):`);
    filesToCheck.forEach(file => console.log(`   - ${file}`));

    const createIssues = isProduction && githubTracker !== null;
    const translationStatus = await checkTranslationStatus(
      filesToCheck, 
      githubTracker, 
      createIssues
    );
    
    allTranslationStatus.push({ contentType, translationStatus });

    const { needsUpdate, missing, upToDate, issuesCreated } = translationStatus;
    
    console.log(`\n📊 Translation Status Summary for ${contentType}:`);
    console.log(`   🔄 Outdated: ${needsUpdate.length}`);
    console.log(`   ❌ Missing: ${missing.length}`);
    console.log(`   ✅ Up-to-date: ${upToDate.length}`);
    
    if (needsUpdate.length > 0) {
      console.log(`\n🔄 Files needing translation updates:`);
      needsUpdate.forEach(item => {
        const langName = githubTracker ? githubTracker.getLanguageDisplayName(item.language) : item.language;
        if (githubTracker && item.commitInfo) {
          console.log(`   - ${item.englishFile} → ${langName}`);
          console.log(`     English: ${item.commitInfo.english.date.toLocaleDateString()} by ${item.commitInfo.english.author}`);
          console.log(`     Translation: ${item.commitInfo.translation.date.toLocaleDateString()} by ${item.commitInfo.translation.author}`);
        } else {
          console.log(`   - ${item.englishFile} → ${langName}`);
          if (item.englishModTime && item.translationModTime) {
            console.log(`     English: ${item.englishModTime.toLocaleDateString()}`);
            console.log(`     Translation: ${item.translationModTime.toLocaleDateString()}`);
          }
        }
      });
    }
    
    if (missing.length > 0) {
      console.log(`\n❌ Missing translation files:`);
      missing.forEach(item => {
        const langName = githubTracker ? githubTracker.getLanguageDisplayName(item.language) : item.language;
        console.log(`   - ${item.englishFile} → ${langName}`);
        console.log(`     Expected: ${item.translationPath}`);
      });
    }
    
    if (issuesCreated.length > 0) {
      console.log(`\n🎫 GitHub issues created: ${issuesCreated.length}`);
      issuesCreated.forEach(issue => {
        console.log(`   - Issue #${issue.issueNumber}: ${issue.englishFile}`);
        console.log(`     Languages: ${issue.affectedLanguages.map(lang => githubTracker.getLanguageDisplayName(lang)).join(', ')}`);
        console.log(`     URL: ${issue.issueUrl}`);
      });
    } else if (needsUpdate.length > 0 || missing.length > 0) {
      if (!hasToken) {
        console.log(`\n💡 Run with GITHUB_TOKEN to create GitHub issues`);
      }
    }
    
    if (needsUpdate.length === 0 && missing.length === 0) {
      console.log(`\n✅ All ${contentType} translations are up to date!`);
    }

    // Write manifest JSON for the site to consume
    try {
      const manifestDir = path.join(process.cwd(), 'public', 'translation-status');
      const manifestPath = path.join(manifestDir, `${contentType}.json`);
      if (!fs.existsSync(manifestDir)) {
        fs.mkdirSync(manifestDir, { recursive: true });
      }
      const content = {};
      for (const [englishFile, fileTranslations] of translationStatus.fileTranslationMap) {
        const slug = getSlugFromEnglishPath(englishFile, contentType);
        if (!slug) continue;
        const outdated = fileTranslations.outdatedLanguages.map(l => l.language);
        const missingLangs = fileTranslations.missingLanguages.map(l => l.language);
        const upToDateLangs = fileTranslations.upToDateLanguages.map(l => l.language);
        content[slug] = {
          englishFile,
          outdated,
          missing: missingLangs,
          upToDate: upToDateLangs,
        };
      }
      const manifest = {
        generatedAt: new Date().toISOString(),
        branch: githubTracker ? githubTracker.currentBranch : null,
        contentType,
        [contentType]: content,
      };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      console.log(`\n🗂️  Wrote ${contentType} translation manifest: ${manifestPath}`);
    } catch (writeErr) {
      console.log(`\n⚠️  Could not write ${contentType} translation manifest: ${writeErr.message}`);
    }
  }
}

// Export for testing (simplified)
module.exports = {
  main,
  getChangedFiles,
  getAllEnglishContentFiles,
  checkTranslationStatus,
  findMissingTranslations,
  generateStubFromEnglish,
  pickStubFrontmatter,
  runStubGeneration,
  GitHubCommitTracker,
  SUPPORTED_LANGUAGES,
  CONTENT_TYPES
};

// Run if called directly
if (require.main === module) {
  main();
}
