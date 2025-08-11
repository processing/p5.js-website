const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');


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


const SUPPORTED_LANGUAGES = ['es', 'hi', 'ko', 'zh-Hans'];


class GitHubCommitTracker {
  constructor(token, owner, repo) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
    this.currentBranch = this.detectCurrentBranch();
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
        return process.env.GITHUB_REF_NAME; // For push events
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

  /**
   * Create a GitHub issue for outdated translation
   */
  async createTranslationIssue(englishFile, language, commitInfo) {
    const issueTitle = `🌍 Update ${language.toUpperCase()} translation for ${path.basename(englishFile)}`;
    const issueBody = this.formatIssueBody(englishFile, language, commitInfo);
    
    try {
      const { data } = await this.octokit.rest.issues.create({
        owner: this.owner,
        repo: this.repo,
        title: issueTitle,
        body: issueBody,
        labels: ['translation', `lang-${language}`, 'help wanted']
      });

      return data;
    } catch (error) {
      console.error(`❌ Error creating issue:`, error.message);
      return null;
    }
  }

  /**
   * Create a single GitHub issue for a file covering multiple languages
   */
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
    
    try {
      const { data } = await this.octokit.rest.issues.create({
        owner: this.owner,
        repo: this.repo,
        title: issueTitle,
        body: issueBody,
        labels: labels
      });

      return data;
    } catch (error) {
      console.error(`❌ Error creating multi-language issue:`, error.message);
      return null;
    }
  }

  /**
   * Format the issue body with helpful information
   */
  formatIssueBody(englishFile, language, commitInfo) {
    const translationPath = getTranslationPath(englishFile, language);
    const englishCommit = commitInfo.english;
    const translationCommit = commitInfo.translation;

    return `## 🌍 Translation Update Needed

**File**: \`${englishFile}\`
**Language**: ${this.getLanguageDisplayName(language)}
**Translation file**: \`${translationPath}\`
**Branch**: \`${this.currentBranch}\`

### 📅 Timeline
- **English last updated**: ${englishCommit.date.toLocaleDateString()} by ${englishCommit.author}
- **Translation last updated**: ${translationCommit ? translationCommit.date.toLocaleDateString() + ' by ' + translationCommit.author : 'Never translated'}

### 🔗 Quick Links
- [📄 Current English file](https://github.com/${this.owner}/${this.repo}/blob/${this.currentBranch}/${englishFile})
- [📝 Translation file](https://github.com/${this.owner}/${this.repo}/blob/${this.currentBranch}/${translationPath})
- [🔍 Compare changes](https://github.com/${this.owner}/${this.repo}/compare/${translationCommit ? translationCommit.sha : 'HEAD'}...${englishCommit.sha})

### 📋 What to do
1. Review the English changes in the file
2. Update the ${this.getLanguageDisplayName(language)} translation accordingly
3. Maintain the same structure and formatting
4. Test the translation for accuracy and cultural appropriateness

### 📝 Recent English Changes
**Last commit**: [${englishCommit.message}](${englishCommit.url})

---
*This issue was automatically created by the p5.js Translation Tracker 🤖*
*Need help? Check our [translation guidelines](https://github.com/processing/p5.js-website/blob/main/contributor_docs/translation.md)*`;
  }

  /**
   * Format the issue body for multi-language updates
   */
  formatMultiLanguageIssueBody(fileTranslations, englishDiff) {
    const englishFile = fileTranslations.englishFile;
    const outdatedLanguages = fileTranslations.outdatedLanguages;
    const missingLanguages = fileTranslations.missingLanguages;

    let body = `## 🌍 Translation Update Needed

**File**: \`${englishFile}\`
**Branch**: \`${this.currentBranch}\`

### 📅 Timeline
- **Latest English update**: ${fileTranslations.englishCommit.date.toLocaleDateString()} by ${fileTranslations.englishCommit.author}

`;

    // Outdated translations section
    if (outdatedLanguages.length > 0) {
      body += `### 🔄 Outdated Translations\n\n`;
      outdatedLanguages.forEach(lang => {
        const translationPath = lang.translationPath;
        body += `- **${this.getLanguageDisplayName(lang.language)}**: Last updated ${lang.commitInfo.translation.date.toLocaleDateString()} by ${lang.commitInfo.translation.author}\n`;
        body += `  - [📝 View file](https://github.com/${this.owner}/${this.repo}/blob/${this.currentBranch}/${translationPath})\n`;
        body += `  - [🔍 Compare changes](https://github.com/${this.owner}/${this.repo}/compare/${lang.commitInfo.translation.sha}...${lang.commitInfo.english.sha})\n\n`;
      });
    }

    // Missing translations section
    if (missingLanguages.length > 0) {
      body += `### ❌ Missing Translations\n\n`;
      missingLanguages.forEach(lang => {
        const translationPath = lang.translationPath;
        body += `- **${this.getLanguageDisplayName(lang.language)}**: Translation file does not exist\n`;
        body += `  - Expected location: \`${translationPath}\`\n\n`;
      });
    }

    // Include an English diff snippet if available
    if (englishDiff) {
      body += `### 🧾 English Changes (Recent)\n\n`;
      body += `- [🔍 View full diff](${englishDiff.compareUrl})\n`;
      if (englishDiff.patchSnippet) {
        body += `\n\n\u0060\u0060\u0060diff\n${englishDiff.patchSnippet}\n\u0060\u0060\u0060\n`;
        if (englishDiff.isTruncated) {
          body += `\n_(diff truncated — open the full diff link above for all changes)_\n`;
        }
      }
      body += `\n`;
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
**Last commit**: [${fileTranslations.englishCommit.message}](${fileTranslations.englishCommit.url})

${outdatedLanguages.length > 0 || missingLanguages.length > 0 ? `**Change Type**: English file was updated. ${outdatedLanguages.length > 0 ? `${outdatedLanguages.map(l => this.getLanguageDisplayName(l.language)).join(', ')} translation${outdatedLanguages.length > 1 ? 's' : ''} may be outdated.` : ''} ${missingLanguages.length > 0 ? `${missingLanguages.map(l => this.getLanguageDisplayName(l.language)).join(', ')} translation${missingLanguages.length > 1 ? 's are' : ' is'} missing.` : ''}` : ''}

---
ℹ️ **Need help?** See our [Translation Guidelines](https://github.com/processing/p5.js-website/blob/main/contributor_docs/translation.md)

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
 * Week 1: Get changed files from git or test files
 * This is the core Week 1 functionality that remains unchanged
 */
function getChangedFiles(testFiles = null) {
  // Allow passing test files for local development (Week 1 feature)
  if (testFiles) {
    console.log('🧪 Using provided test files for local testing');
    return testFiles.filter(file => 
      file.startsWith('src/content/examples/en') && file.endsWith('.mdx')
    );
  }

  try {
    // Different git commands for different event types
    const gitCommand = process.env.GITHUB_EVENT_NAME === 'pull_request' 
      ? 'git diff --name-only origin/main...HEAD'  // Compare with base branch for PRs
      : 'git diff --name-only HEAD~1 HEAD';       // Compare with previous commit for pushes
    
    const changedFilesOutput = execSync(gitCommand, { encoding: 'utf8' });
    const allChangedFiles = changedFilesOutput.trim().split('\n').filter(file => file.length > 0);
    
      const changedExampleFiles = allChangedFiles.filter(file => 
    file.startsWith('src/content/examples/en') && file.endsWith('.mdx')
  );
    
    return changedExampleFiles;
  } catch (error) {
    console.error('❌ Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Scan all English example files (for manual scanning)
 */
function getAllEnglishExampleFiles() {
  const examplesPath = 'src/content/examples/en';
  const allFiles = [];
  
  try {
    if (!fs.existsSync(examplesPath)) {
      console.log(`❌ Examples path does not exist: ${examplesPath}`);
      return [];
    }
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          scanDirectory(itemPath);
        } else if (item.endsWith('.mdx')) {
          allFiles.push(itemPath);
        }
      });
    };
    
    scanDirectory(examplesPath);
    console.log(`📊 Found ${allFiles.length} English example files to check`);
    return allFiles;
  } catch (error) {
    console.error('❌ Error scanning English example files:', error.message);
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


async function checkTranslationStatus(changedExampleFiles, githubTracker = null, createIssues = false) {
  const translationStatus = {
    needsUpdate: [],
    missing: [],
    upToDate: [],
    issuesCreated: []
  };
  
  // Group translation issues by file to create single issues per file
  const fileTranslationMap = new Map();
  
  for (const englishFile of changedExampleFiles) {
    const fileName = englishFile.split('/').pop();
    
    const fileTranslations = {
      englishFile,
      outdatedLanguages: [],
      missingLanguages: [],
      upToDateLanguages: [],
      englishCommit: null
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
        // Get English commit only once per file
        if (!fileTranslations.englishCommit) {
          fileTranslations.englishCommit = await githubTracker.getLastCommit(englishFile);
        }
        const englishCommit = fileTranslations.englishCommit;
        const translationCommit = await githubTracker.getLastCommit(translationPath);

        if (!englishCommit) {
          continue;
        }

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
        // Week 1: Fallback to file modification time comparison
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
  
  // Default behavior: scan all files UNLESS running in GitHub Actions or test mode
  const scanAll = isGitHubAction ? false : (process.env.SCAN_ALL !== 'false');
  const isProduction = hasToken && !testFiles;
  
  if (testFiles) {
    console.log(`🧪 Test mode: Checking ${testFiles.length} predefined files`);
  } else if (isGitHubAction) {
    console.log(`🚀 GitHub Actions: Checking changed files only`);
  } else {
    console.log(`🔍 Manual run: Scanning all ${scanAll ? 'files' : 'changed files'}`);
  }

  // Initialize GitHub tracker if token is available
  let githubTracker = null;
  if (hasToken) {
    try {
      const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'processing/p5.js-website').split('/');
      githubTracker = new GitHubCommitTracker(process.env.GITHUB_TOKEN, owner, repo);
      console.log(`📡 Connected to ${owner}/${repo}`);
    } catch (error) {
      console.error('❌ GitHub API failed, using file-based tracking');
    }
  }

  // Get files to check
  let filesToCheck;
  if (scanAll && !testFiles && !isGitHubAction) {
    console.log('📊 Scanning all English example files...');
    filesToCheck = getAllEnglishExampleFiles();
  } else {
    filesToCheck = getChangedFiles(testFiles);
  }
  
  if (filesToCheck.length === 0) {
    if (isGitHubAction) {
      console.log('✅ No English example files changed in this push');
    } else {
      console.log('✅ No files to check');
    }
    return;
  }
 
  console.log(`📝 Checking ${filesToCheck.length} English example file(s):`);
  filesToCheck.forEach(file => console.log(`   - ${file}`));

  const createIssues = isProduction && githubTracker !== null;
  const translationStatus = await checkTranslationStatus(
    filesToCheck, 
    githubTracker, 
    createIssues
  );

  // Detailed results
  const { needsUpdate, missing, upToDate, issuesCreated } = translationStatus;
  
  console.log('\n📊 Translation Status Summary:');
  console.log(`   🔄 Outdated: ${needsUpdate.length}`);
  console.log(`   ❌ Missing: ${missing.length}`);
  console.log(`   ✅ Up-to-date: ${upToDate.length}`);
  
  if (needsUpdate.length > 0) {
    console.log('\n🔄 Files needing translation updates:');
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
    console.log('\n❌ Missing translation files:');
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
    console.log('\n✅ All translations are up to date!');
  }
}

// Export for testing (simplified)
module.exports = {
  main,
  getChangedFiles,
  getAllEnglishExampleFiles,
  checkTranslationStatus,
  GitHubCommitTracker,
  SUPPORTED_LANGUAGES
};

// Run if called directly
if (require.main === module) {
  main();
} 
