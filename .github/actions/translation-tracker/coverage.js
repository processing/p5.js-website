const fs = require('fs');
const path = require('path');
const { SUPPORTED_LANGUAGES, CONTENT_TYPES } = require('./constants');
const { GitHubCommitTracker } = require('./github-tracker');
const { checkTranslationStatus } = require('./workflows');
const {
  getAllEnglishContentFiles,
  parseEnvList,
  parseFrontmatter,
  fileExists,
} = require('./utils');

function coverageOutputPath() {
  return path.join(process.cwd(), 'public', 'translation-status', 'coverage.json');
} // for it of be publicly accessible

function contentTypeOf(englishFile) {
  const normalized = englishFile.split(path.sep).join('/');
  const match = normalized.match(/^src\/content\/([^/]+)\/en\//);
  return match ? match[1] : null;
}

function isStub(translationPath) {
  if (!translationPath || !fileExists(translationPath)) {
    return false;
  }

  try {
    const raw = fs.readFileSync(translationPath, 'utf8');
    return parseFrontmatter(raw, translationPath).needsTranslation === true;
  } catch (error) {
    return false;
  }
}

function emptyCounts() {
  return { total: 0, upToDate: 0, outdated: 0, missing: 0, stub: 0, percent: 0 };
}

function finalize(counts) {
  counts.percent = counts.total === 0 ? 0 : Math.round((counts.upToDate / counts.total) * 100);
  return counts;
}

function bump(counts, field) {
  counts[field] += 1;
  counts.total += 1;
}

/**
 * Turn the per-file checker result into language and content-type totals.
 * Files marked needsTranslation are stubs, not completed translations.
 */
function aggregateCoverage(status, languages) {
  const stubs = [];
  const keepTranslated = (items) =>
    items.filter((item) => {
      if (!isStub(item.translationPath)) {
        return true;
      }
      stubs.push(item);
      return false;
    });

  const upToDate = keepTranslated(status.upToDate);
  const outdated = keepTranslated(status.needsUpdate);
  const buckets = [
    ['upToDate', upToDate],
    ['outdated', outdated],
    ['missing', status.missing],
    ['stub', stubs],
  ];

  const byLanguage = {};
  const byContentType = {};

  for (const language of languages) {
    byLanguage[language] = emptyCounts();
  }

  for (const [field, items] of buckets) {
    for (const item of items) {
      if (!languages.includes(item.language)) {
        continue;
      }

      bump(byLanguage[item.language], field);

      const contentType = contentTypeOf(item.englishFile);
      if (!contentType) {
        continue;
      }

      if (!byContentType[contentType]) {
        byContentType[contentType] = {};
      }
      if (!byContentType[contentType][item.language]) {
        byContentType[contentType][item.language] = emptyCounts();
      }
      bump(byContentType[contentType][item.language], field);
    }
  }

  for (const language of languages) {
    finalize(byLanguage[language]);
  }

  for (const contentType of Object.keys(byContentType)) {
    for (const language of Object.keys(byContentType[contentType])) {
      finalize(byContentType[contentType][language]);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    languages: byLanguage,
    contentTypes: byContentType,
  };
}

async function collectEnglishFiles(contentTypes) {
  const files = [];

  for (const contentType of contentTypes) {
    const found = getAllEnglishContentFiles(contentType).map((file) => file.split(path.sep).join('/'));
    files.push(...found);
  }

  return files;
}

async function runCoverage() {
  const repoRoot = path.join(__dirname, '../../..');
  process.chdir(repoRoot);

  /// get user passed variables or use defaults
  const languages = parseEnvList(process.env.COVERAGE_LANGUAGES, SUPPORTED_LANGUAGES).filter((language) =>
    SUPPORTED_LANGUAGES.includes(language)
  );
  const contentTypes = parseEnvList(process.env.COVERAGE_CONTENT_TYPES, CONTENT_TYPES).filter((contentType) =>
    CONTENT_TYPES.includes(contentType)
  );

  if (languages.length === 0 || contentTypes.length === 0) {
    throw new Error('COVERAGE_LANGUAGES and COVERAGE_CONTENT_TYPES must include at least one supported value');
  }

  const englishFiles = await collectEnglishFiles(contentTypes);
  console.log(`\n📊 Coverage scan: ${englishFiles.length} English file(s), languages: ${languages.join(', ')}`);

  let tracker = null;
  if (process.env.GITHUB_TOKEN) {
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'processing/p5.js-website').split('/');
    tracker = await GitHubCommitTracker.create(process.env.GITHUB_TOKEN, owner, repo);
  }

  const status = await checkTranslationStatus(englishFiles, tracker, false);
  const report = aggregateCoverage(status, languages);

  const outputPath = coverageOutputPath();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`🗂️  Wrote translation coverage: ${outputPath}`);

  return report;
}

module.exports = {
  aggregateCoverage,
  contentTypeOf,
  isStub,
  runCoverage,
};

if (require.main === module) {
  runCoverage().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
