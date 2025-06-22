const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');


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
          // Silent fallback
        }
      }
      
      return null;
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
   * Format the issue body with helpful information
   */
  formatIssueBody(englishFile, language, commitInfo) {
    const translationPath = englishFile.replace('/en/', `/${language}/`);
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
    const gitCommand = process.env.GITHUB_EVENT_NAME === 'pull_request' 
      ? 'git diff --name-only HEAD~1 HEAD'
      : 'git diff --name-only HEAD~1 HEAD';
    
    const changedFilesOutput = execSync(gitCommand, { encoding: 'utf8' });
    const allChangedFiles = changedFilesOutput.trim().split('\n').filter(file => file.length > 0);
    
    const changedExampleFiles = allChangedFiles.filter(file => 
      file.startsWith('src/content/examples/en') && file.endsWith('.mdx')
    );
    
    console.log(`📊 Total changed files: ${allChangedFiles.length}`);
    console.log(`📖 Changed English example files: ${changedExampleFiles.length}`);
    
    if (changedExampleFiles.length > 0) {
      console.log('📄 Changed English example files:');
      changedExampleFiles.forEach(file => console.log(`  - ${file}`));
    }
    
    return changedExampleFiles;
  } catch (error) {
    console.error('❌ Error getting changed files:', error.message);
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
  
  for (const englishFile of changedExampleFiles) {
    console.log(`\n📝 Checking translations for: ${englishFile}`);
    
    for (const language of SUPPORTED_LANGUAGES) {
      const translationPath = englishFile.replace('/en/', `/${language}/`);
      const exists = fileExists(translationPath);
      
      if (!exists) {
        console.log(`  ❌ ${language}: Missing translation`);
        translationStatus.missing.push({
          englishFile,
          language,
          translationPath,
          status: 'missing'
        });
        continue;
      }

      
      if (githubTracker) {
        const englishCommit = await githubTracker.getLastCommit(englishFile);
        const translationCommit = await githubTracker.getLastCommit(translationPath);

        if (!englishCommit) {
          console.log(`  ⚠️ ${language}: Could not get English commit info`);
          continue;
        }

        if (!translationCommit) {
          console.log(`  🆕 ${language}: Missing translation (no commits)`);
          translationStatus.missing.push({
            englishFile,
            language,
            translationPath,
            status: 'missing'
          });
          continue;
        }

        const isOutdated = englishCommit.date > translationCommit.date;
        
        if (isOutdated) {
          console.log(`  🔄 ${language}: Needs update`);
          console.log(`    - English: ${englishCommit.date.toISOString()} (${englishCommit.sha.substring(0, 7)})`);
          console.log(`    - Translation: ${translationCommit.date.toISOString()} (${translationCommit.sha.substring(0, 7)})`);
          
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
          
          
          if (createIssues) {
            console.log(`  📝 Creating GitHub issue for ${language} translation...`);
            const issue = await githubTracker.createTranslationIssue(
              englishFile, 
              language, 
              statusItem.commitInfo
            );
            if (issue) {
              console.log(`  ✅ Created issue #${issue.number}: ${issue.title}`);
              translationStatus.issuesCreated.push({
                ...statusItem,
                issueNumber: issue.number,
                issueUrl: issue.html_url
              });
            }
          }
        } else {
          console.log(`  ✅ ${language}: Up to date`);
          translationStatus.upToDate.push({
            englishFile,
            language,
            translationPath,
            status: 'up-to-date'
          });
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
          console.log(`  🔄 ${language}: Needs update (English: ${englishModTime.toISOString()}, Translation: ${translationModTime.toISOString()})`);
          translationStatus.needsUpdate.push({
            englishFile,
            language,
            translationPath,
            status: 'outdated',
            englishModTime,
            translationModTime
          });
        } else {
          console.log(`  ✅ ${language}: Up to date`);
          translationStatus.upToDate.push({
            englishFile,
            language,
            translationPath,
            status: 'up-to-date'
          });
        }
      }
    }
  }
  
  return translationStatus;
}


function displaySummary(translationStatus, isWeek2 = false) {
  console.log(`\n📊 TRANSLATION STATUS SUMMARY ${isWeek2 ? '(Week 2)' : '(Week 1)'}`);
  console.log('═══════════════════════════════════════');
  
  console.log(`🆕 Missing translations: ${translationStatus.missing.length}`);
  if (translationStatus.missing.length > 0) {
    translationStatus.missing.forEach(item => {
      console.log(`  - ${item.language}: ${item.englishFile}`);
    });
  }
  
  console.log(`🔄 Outdated translations: ${translationStatus.needsUpdate.length}`);
  if (translationStatus.needsUpdate.length > 0) {
    translationStatus.needsUpdate.forEach(item => {
      console.log(`  - ${item.language}: ${item.englishFile}`);
    });
  }
  
  console.log(`✅ Up-to-date translations: ${translationStatus.upToDate.length}`);
  
  if (translationStatus.issuesCreated && translationStatus.issuesCreated.length > 0) {
    console.log(`🎫 Issues created: ${translationStatus.issuesCreated.length}`);
    translationStatus.issuesCreated.forEach(item => {
      console.log(`  - Issue #${item.issueNumber}: ${item.language} - ${item.englishFile}`);
      console.log(`    ${item.issueUrl}`);
    });
  }
  
  if (isWeek2) {
    console.log('\n💡 Week 2 Features:');
    console.log('✅ GitHub API integration for accurate commit tracking');
    console.log('✅ Automated issue creation for outdated translations');
    console.log('✅ Enhanced issue templates with helpful links');
    console.log('✅ Backward compatibility with Week 1 functionality');
  }
}


function exploreRepoStructure() {
  console.log('\n🔍 REPOSITORY STRUCTURE ANALYSIS');
  console.log('═══════════════════════════════════');
  
  try {
    const examplesPath = 'src/content/examples';
    console.log(`📁 Examples path: ${examplesPath}`);
    
    if (fs.existsSync(examplesPath)) {
      const languages = fs.readdirSync(examplesPath)
        .filter(item => fs.statSync(path.join(examplesPath, item)).isDirectory())
        .filter(item => !item.startsWith('.') && item !== 'images');
      
      console.log(`🌐 Available languages: ${languages.join(', ')}`);
      
      // Count example files in each language
      languages.forEach(lang => {
        const langPath = path.join(examplesPath, lang);
        try {
          let totalFiles = 0;
          const categories = fs.readdirSync(langPath)
            .filter(item => fs.statSync(path.join(langPath, item)).isDirectory());
          
          categories.forEach(category => {
            const categoryPath = path.join(langPath, category);
            const countFilesRecursively = (dir) => {
              const items = fs.readdirSync(dir);
              let count = 0;
              items.forEach(item => {
                const itemPath = path.join(dir, item);
                if (fs.statSync(itemPath).isDirectory()) {
                  count += countFilesRecursively(itemPath);
                } else if (item.endsWith('.mdx')) {
                  count++;
                }
              });
              return count;
            };
            totalFiles += countFilesRecursively(categoryPath);
          });
          
          console.log(`  ${lang}: ${totalFiles} example files across ${categories.length} categories`);
        } catch (error) {
          console.log(`  ${lang}: Error reading directory - ${error.message}`);
        }
      });
    } else {
      console.log(`❌ Examples path does not exist: ${examplesPath}`);
    }
  } catch (error) {
    console.error('❌ Error exploring repository structure:', error.message);
  }
}


async function main(testFiles = null, options = {}) {
  const isWeek2 = !!options.enableWeek2 || !!process.env.GITHUB_TOKEN;
  
  console.log(`🎯 p5.js Translation Tracker - ${isWeek2 ? 'Week 2' : 'Week 1'} Mode`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📅 Event: ${process.env.GITHUB_EVENT_NAME || 'local'}`);
  console.log(`🏠 Working directory: ${process.cwd()}`);
  console.log(`🌍 Tracking languages: ${SUPPORTED_LANGUAGES.join(', ')}`);

  // Week 2: Initialize GitHub tracker if token is available
  let githubTracker = null;
  if (isWeek2) {
    const token = process.env.GITHUB_TOKEN || options.githubToken;
    if (token) {
      try {
        const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'processing/p5.js-website').split('/');
        githubTracker = new GitHubCommitTracker(token, owner, repo);
        console.log(`🔗 GitHub API initialized for ${owner}/${repo} (branch: ${githubTracker.currentBranch})`);
      } catch (error) {
        console.error('⚠️ GitHub API initialization failed:', error.message);
        console.log('📝 Falling back to Week 1 mode...');
      }
    } else {
      console.log('⚠️ No GitHub token provided - running in Week 1 mode');
    }
  }

  exploreRepoStructure();
 
  const changedExampleFiles = getChangedFiles(testFiles);
  
  if (changedExampleFiles.length === 0) {
    console.log('\n✨ No changes detected in English example files.');
    console.log('📝 Nothing to track for translations in this commit!');
    return;
  }
 
  const createIssues = options.createIssues !== false && githubTracker !== null;
  const translationStatus = await checkTranslationStatus(
    changedExampleFiles, 
    githubTracker, 
    createIssues
  );
  

  displaySummary(translationStatus, isWeek2);
}

// Export for testing (Week 1 + Week 2)
module.exports = {
  main,
  getChangedFiles,
  checkTranslationStatus,
  exploreRepoStructure,
  GitHubCommitTracker
};

// Run if called directly
if (require.main === module) {
  main();
} 
