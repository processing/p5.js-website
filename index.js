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
        const maxLines = 80;
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


// Removed verbose summary function


// Remove verbose repository exploration


async function main(testFiles = null, options = {}) {
  const hasToken = !!process.env.GITHUB_TOKEN;
  const isGitHubAction = !!process.env.GITHUB_ACTIONS; // Detect if running in GitHub Actions
  const isDryRun = options.dryRun || process.argv.includes('--dry-run');
  const isProduction = hasToken && !testFiles && !isDryRun;
  
  if (isDryRun) {
    console.log(`🧪 Dry run mode: scanning files but NOT creating GitHub issues`);
  }

  if (testFiles) {
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
      if (isDryRun) {
        const fileTranslationMap = translationStatus.fileTranslationMap;
        const wouldCreate = fileTranslationMap.size;
        console.log(`\n🧪 Dry run: ${wouldCreate} issue(s) would be created:`);
        for (const [englishFile, fileTranslations] of fileTranslationMap) {
          const affectedLangs = [
            ...fileTranslations.outdatedLanguages.map(l => l.language),
            ...fileTranslations.missingLanguages.map(l => l.language)
          ];
          const langNames = affectedLangs.map(lang => 
            githubTracker ? githubTracker.getLanguageDisplayName(lang) : lang
          );
          console.log(`   - 🌍 Update translations for ${path.basename(englishFile)}`);
          console.log(`     Languages: ${langNames.join(', ')}`);
        }
      } else if (!hasToken) {
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
  GitHubCommitTracker,
  SUPPORTED_LANGUAGES,
  CONTENT_TYPES
};

// Run if called directly
if (require.main === module) {
  main();
}
