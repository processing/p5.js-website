const fs = require('fs');
const path = require('path');
const { SUPPORTED_LANGUAGES, STUB_FRONTMATTER_KEYS } = require('./constants');
const {
  getTranslationPath,
  parseEnvList,
  fileExists,
  getFileModTime,
  parseFrontmatter,
  stringifyMdx,
  getStubWritePath,
  getStubOutputRoot,
  getChangedFiles,
  getAllEnglishContentFiles,
  getLanguageDisplayName,
} = require('./utils');

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

/**
 * Build a placeholder translation file from an English source.
 * Copies essential frontmatter (in English), sets needsTranslation: true, minimal body.
 */
function generateStubFromEnglish(englishPath, language, contentType = 'reference') {
  if (!englishPath.endsWith('.mdx')) {
    throw new Error(`Stub generation only supports .mdx sources (got ${englishPath})`);
  }

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

async function checkTranslationStatus(changedFiles, githubTracker = null, createIssues = false) {
  const translationStatus = {
    needsUpdate: [],
    missing: [],
    upToDate: [],
    issuesCreated: [],
    fileTranslationMap: new Map(),
  };

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
      englishCommit,
    };

    for (const language of SUPPORTED_LANGUAGES) {
      const translationPath = getTranslationPath(englishFile, language);
      const exists = fileExists(translationPath);

      if (!exists) {
        const missingItem = {
          englishFile,
          language,
          translationPath,
          status: 'missing',
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
            status: 'missing',
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
              translation: translationCommit,
            },
          };

          translationStatus.needsUpdate.push(statusItem);
          fileTranslations.outdatedLanguages.push(statusItem);
        } else {
          const upToDateItem = {
            englishFile,
            language,
            translationPath,
            status: 'up-to-date',
          };
          translationStatus.upToDate.push(upToDateItem);
          fileTranslations.upToDateLanguages.push(upToDateItem);
        }
      } else {
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
            translationModTime,
          };
          translationStatus.needsUpdate.push(statusItem);
          fileTranslations.outdatedLanguages.push(statusItem);
        } else {
          const upToDateItem = {
            englishFile,
            language,
            translationPath,
            status: 'up-to-date',
          };
          translationStatus.upToDate.push(upToDateItem);
          fileTranslations.upToDateLanguages.push(upToDateItem);
        }
      }
    }

    if (fileTranslations.outdatedLanguages.length > 0 || fileTranslations.missingLanguages.length > 0) {
      fileTranslationMap.set(englishFile, fileTranslations);
    }
  }

  if (createIssues && githubTracker) {
    for (const [, fileTranslations] of fileTranslationMap) {
      const issue = await githubTracker.createMultiLanguageTranslationIssue(fileTranslations);
      if (issue) {
        const issueItem = {
          englishFile: fileTranslations.englishFile,
          affectedLanguages: [
            ...fileTranslations.outdatedLanguages.map((l) => l.language),
            ...fileTranslations.missingLanguages.map((l) => l.language),
          ],
          issueNumber: issue.number,
          issueUrl: issue.html_url,
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
  const contentTypes = parseEnvList(process.env.STUB_CONTENT_TYPES, ['reference']) || ['reference'];
  const fullScan = options.fullScan ?? process.env.STUB_FULL_SCAN === 'true';
  const dryRun = process.env.STUB_DRY_RUN === 'true';
  const parsedMaxFiles = parseInt(process.env.STUB_MAX_FILES || '50', 10);
  const maxFiles = Number.isNaN(parsedMaxFiles) ? 50 : parsedMaxFiles;

  console.log(`\n📦 Stub generation mode`);
  console.log(`   Languages: ${languages.join(', ')}`);
  console.log(`   Content types: ${contentTypes.join(', ')}`);
  console.log(`   Scan: ${fullScan ? 'all English files' : 'changed files only'}`);
  console.log(`   Max stubs per language: ${maxFiles}`);

  const missing = findMissingTranslations(contentTypes, languages, {
    fullScan,
    testFiles: options.testFiles || null,
  });

  if (missing.length === 0) {
    console.log('\n✅ No missing translation files found for stub generation.');
    return { prsCreated: [], stubsWritten: 0, failures: [], skippedNonMdx: [] };
  }

  // Stub generation currently only supports MDX. Skip other non-MDX sources with a notice
  const skippedNonMdx = [];
  const stubbable = [];
  for (const item of missing) {
    if (item.englishFile.endsWith('.mdx')) {
      stubbable.push(item);
    } else {
      skippedNonMdx.push(item);
    }
  }

  if (skippedNonMdx.length > 0) {
    console.log(`\n⏭️  Skipping ${skippedNonMdx.length} non-MDX source(s) (stub generation is MDX-only for now):`);
    skippedNonMdx.forEach((item) => {
      console.log(`   - ${item.englishFile} → ${item.language}`);
    });
  }

  if (stubbable.length === 0) {
    console.log('\n✅ No MDX files need stubs.');
    return { prsCreated: [], stubsWritten: 0, failures: [], skippedNonMdx };
  }

  console.log(`\n❌ Found ${stubbable.length} missing translation file(s):`);
  stubbable.forEach((item) => {
    console.log(`   - ${item.englishFile} → ${item.language}`);
    console.log(`     Expected: ${item.translationPath}`);
  });

  const byLanguage = new Map();
  for (const item of stubbable) {
    if (!byLanguage.has(item.language)) {
      byLanguage.set(item.language, []);
    }
    byLanguage.get(item.language).push(item);
  }

  let wasLimited = false;
  const limitedByLanguage = new Map();
  for (const [language, items] of byLanguage) {
    const capped = items.slice(0, maxFiles);
    if (capped.length < items.length) {
      wasLimited = true;
    }
    if (capped.length > 0) {
      limitedByLanguage.set(language, capped);
    }
  }

  if (wasLimited) {
    console.log(`\n⚠️  Limiting to ${maxFiles} stub(s) per language (STUB_MAX_FILES). Re-run to process more.`);
  }

  const prsCreated = [];
  const failures = [];
  let stubsWritten = 0;

  for (const [language, items] of limitedByLanguage) {
    const langName = githubTracker ? githubTracker.getLanguageDisplayName(language) : getLanguageDisplayName(language);

    console.log(`\n📝 Generating ${items.length} stub(s) for ${langName}:`);

    const stubs = [];
    const languageFailures = [];
    for (const item of items) {
      try {
        const stub = generateStubFromEnglish(item.englishFile, language, item.contentType);
        console.log(`   📄 ${item.englishFile} → ${stub.translationPath}`);
        stubs.push(stub);
      } catch (error) {
        const failure = {
          englishFile: item.englishFile,
          language,
          translationPath: item.translationPath,
          error: error.message,
        };
        languageFailures.push(failure);
        failures.push(failure);
        console.error(`   ❌ Failed ${item.englishFile}: ${error.message}`);
      }
    }

    if (stubs.length === 0) {
      console.log(`\n⚠️  No stubs generated for ${langName} (${languageFailures.length} failure(s)). Skipping PR.`);
      continue;
    }

    if (dryRun || !githubTracker) {
      const previewRoot = getStubOutputRoot();
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
      if (languageFailures.length > 0) {
        console.log(`   (${languageFailures.length} file(s) failed and were skipped)`);
      }
      continue;
    }

    const pr = await githubTracker.createStubPullRequest(language, stubs, languageFailures);
    if (pr) {
      prsCreated.push({
        language,
        prNumber: pr.number,
        prUrl: pr.html_url,
        fileCount: stubs.length,
        failureCount: languageFailures.length,
      });
      stubsWritten += stubs.length;
    }
  }

  if (failures.length > 0) {
    console.log(`\n⚠️  Stub generation failures: ${failures.length}`);
    failures.forEach((failure) => {
      console.log(`   - ${failure.englishFile} (${failure.language}): ${failure.error}`);
    });
  }

  if (prsCreated.length > 0) {
    console.log(`\n🔀 Stub PRs created: ${prsCreated.length}`);
    prsCreated.forEach((pr) => {
      console.log(`   - ${pr.language}: PR #${pr.prNumber} (${pr.fileCount} file(s))`);
      console.log(`     URL: ${pr.prUrl}`);
    });
  } else if (!dryRun && stubsWritten === 0 && limitedByLanguage.size > 0) {
    console.log(`\n💡 Stubs were not written. Check GITHUB_TOKEN permissions (contents + pull-requests write).`);
  }

  return { prsCreated, stubsWritten, failures, skippedNonMdx };
}

module.exports = {
  findMissingTranslations,
  pickStubFrontmatter,
  generateStubFromEnglish,
  checkTranslationStatus,
  runStubGeneration,
};
