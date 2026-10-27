const fs = require('fs');
const path = require('path');
const { SUPPORTED_LANGUAGES, CONTENT_TYPES } = require('./constants');
const { getChangedFiles, getAllEnglishContentFiles, getSlugFromEnglishPath } = require('./utils');
const { GitHubCommitTracker } = require('./github-tracker');
const {
  checkTranslationStatus,
  runStubGeneration,
  findMissingTranslations,
  generateStubFromEnglish,
  pickStubFrontmatter,
} = require('./workflows');

async function main(testFiles = null, options = {}) {
  const hasToken = !!process.env.GITHUB_TOKEN;
  const isGitHubAction = !!process.env.GITHUB_ACTIONS;
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

  if (generateStubsMode) {
    const dryRun = process.env.STUB_DRY_RUN === 'true';
    if (!githubTracker && !dryRun) {
      console.error('❌ GENERATE_STUBS requires GITHUB_TOKEN, or set STUB_DRY_RUN=true for local preview');
      process.exitCode = 1;
      return;
    }

    const fullScan = process.env.STUB_FULL_SCAN === 'true' || (!isGitHubAction && !testFiles);

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
    filesToCheck.forEach((file) => console.log(`   - ${file}`));

    const createIssues = isProduction && githubTracker !== null;
    const translationStatus = await checkTranslationStatus(filesToCheck, githubTracker, createIssues);

    allTranslationStatus.push({ contentType, translationStatus });

    const { needsUpdate, missing, upToDate, issuesCreated } = translationStatus;

    console.log(`\n📊 Translation Status Summary for ${contentType}:`);
    console.log(`   🔄 Outdated: ${needsUpdate.length}`);
    console.log(`   ❌ Missing: ${missing.length}`);
    console.log(`   ✅ Up-to-date: ${upToDate.length}`);

    if (needsUpdate.length > 0) {
      console.log(`\n🔄 Files needing translation updates:`);
      needsUpdate.forEach((item) => {
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
      missing.forEach((item) => {
        const langName = githubTracker ? githubTracker.getLanguageDisplayName(item.language) : item.language;
        console.log(`   - ${item.englishFile} → ${langName}`);
        console.log(`     Expected: ${item.translationPath}`);
      });
    }

    if (issuesCreated.length > 0) {
      console.log(`\n🎫 GitHub issues created: ${issuesCreated.length}`);
      issuesCreated.forEach((issue) => {
        console.log(`   - Issue #${issue.issueNumber}: ${issue.englishFile}`);
        console.log(`     Languages: ${issue.affectedLanguages.map((lang) => githubTracker.getLanguageDisplayName(lang)).join(', ')}`);
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
        const outdated = fileTranslations.outdatedLanguages.map((l) => l.language);
        const missingLangs = fileTranslations.missingLanguages.map((l) => l.language);
        const upToDateLangs = fileTranslations.upToDateLanguages.map((l) => l.language);
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
  CONTENT_TYPES,
};

if (require.main === module) {
  main();
}
