const fs = require('fs');
const path = require('path');
const { SUPPORTED_LANGUAGES, CONTENT_TYPES } = require('./constants');
const {
  getAllEnglishContentFiles,
  getTranslationPath,
  parseEnvList,
  parseFrontmatter,
  fileExists,
} = require('./utils');

/** Same default scope as stub generation: everything except reference. */
const DEFAULT_CONTENT_TYPES = CONTENT_TYPES.filter((type) => type !== 'reference');

function coverageOutputPath() {
  return path.join(process.cwd(), 'public', 'translation-status', 'coverage.json');
}

function contentTypeOf(englishFile) {
  const match = englishFile.split(path.sep).join('/').match(/^src\/content\/([^/]+)\/en\//);
  return match ? match[1] : null;
}

function isStub(translationPath) {
  if (!fileExists(translationPath)) {
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
  return { total: 0, present: 0, missing: 0, stub: 0, percent: 0 };
}

function finalize(counts) {
  counts.percent = counts.total === 0 ? 0 : Math.round((counts.present / counts.total) * 100);
  return counts;
}

function ensureBucket(map, key) {
  if (!map[key]) {
    map[key] = emptyCounts();
  }
  return map[key];
}

function bump(counts, field) {
  counts[field] += 1;
  counts.total += 1;
}

/**
 * Filesystem coverage scan: present (translated), missing, or stub.
 */
function scanCoverage(englishFiles, languages) {
  const byLanguage = {};
  const byContentType = {};

  for (const language of languages) {
    byLanguage[language] = emptyCounts();
  }

  for (const englishFile of englishFiles) {
    const contentType = contentTypeOf(englishFile);

    for (const language of languages) {
      const translationPath = getTranslationPath(englishFile, language);
      let field = 'missing';

      if (fileExists(translationPath)) {
        field = isStub(translationPath) ? 'stub' : 'present';
      }

      bump(byLanguage[language], field);

      if (contentType) {
        if (!byContentType[contentType]) {
          byContentType[contentType] = {};
        }
        bump(ensureBucket(byContentType[contentType], language), field);
      }
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

function collectEnglishFiles(contentTypes) {
  const files = [];
  for (const contentType of contentTypes) {
    files.push(...getAllEnglishContentFiles(contentType).map((file) => file.split(path.sep).join('/')));
  }
  return files;
}

function runCoverage() {
  const repoRoot = path.join(__dirname, '../../..');
  process.chdir(repoRoot);

  const languages = parseEnvList(process.env.COVERAGE_LANGUAGES, SUPPORTED_LANGUAGES).filter((language) =>
    SUPPORTED_LANGUAGES.includes(language)
  );
  const contentTypes = parseEnvList(process.env.COVERAGE_CONTENT_TYPES, DEFAULT_CONTENT_TYPES).filter(
    (contentType) => CONTENT_TYPES.includes(contentType)
  );

  if (languages.length === 0 || contentTypes.length === 0) {
    throw new Error('COVERAGE_LANGUAGES and COVERAGE_CONTENT_TYPES must include at least one supported value');
  }

  const englishFiles = collectEnglishFiles(contentTypes);
  console.log(`\n📊 Coverage scan: ${englishFiles.length} English file(s), languages: ${languages.join(', ')}`);

  const report = scanCoverage(englishFiles, languages);

  const outputPath = coverageOutputPath();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`🗂️  Wrote translation coverage: ${outputPath}`);

  return report;
}

module.exports = {
  scanCoverage,
  contentTypeOf,
  isStub,
  runCoverage,
  DEFAULT_CONTENT_TYPES,
};

if (require.main === module) {
  try {
    runCoverage();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
