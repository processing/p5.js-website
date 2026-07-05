const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const yaml = require('js-yaml');

function getTranslationPath(englishFilePath, language) {
  if (!englishFilePath.includes('/en/')) {
    throw new Error(`Invalid English file path: ${englishFilePath}. Must contain '/en/'`);
  }

  const pathParts = englishFilePath.split('/');
  const enIndex = pathParts.findIndex((part) => part === 'en');

  if (enIndex === -1) {
    throw new Error(`Could not find 'en' directory in path: ${englishFilePath}`);
  }

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

/** Root directory for dry-run stub output (never touches src/content by default). */
function getStubOutputRoot() {
  return (
    process.env.STUB_OUTPUT_DIR ||
    path.join(process.cwd(), '.github/actions/translation-tracker/stub-preview')
  );
}

/** Where dry-run stubs are written locally (never touches src/content by default). */
function getStubWritePath(translationPath, dryRun) {
  if (!dryRun) {
    return translationPath;
  }
  return path.join(getStubOutputRoot(), translationPath);
}

function getChangedFiles(testFiles = null, contentType = 'examples') {
  if (testFiles) {
    console.log('🧪 Using provided test files for local testing');
    return testFiles.filter(
      (file) =>
        file.startsWith(`src/content/${contentType}/en`) &&
        (file.endsWith('.mdx') || file.endsWith('.yaml'))
    );
  }

  try {
    const gitCommand =
      process.env.GITHUB_EVENT_NAME === 'pull_request'
        ? 'git diff --name-only origin/main...HEAD'
        : 'git diff --name-only HEAD~1 HEAD';

    const changedFilesOutput = execSync(gitCommand, { encoding: 'utf8' });
    const allChangedFiles = changedFilesOutput.trim().split('\n').filter((file) => file.length > 0);

    return allChangedFiles.filter(
      (file) =>
        file.startsWith(`src/content/${contentType}/en`) &&
        (file.endsWith('.mdx') || file.endsWith('.yaml'))
    );
  } catch (error) {
    console.error('❌ Error getting changed files:', error.message);
    return [];
  }
}

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
      items.forEach((item) => {
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

async function loadStewardsConfig() {
  const STEWARDS_URL = 'https://raw.githubusercontent.com/processing/p5.js/main/stewards.yml';

  return new Promise((resolve) => {
    https
      .get(STEWARDS_URL, (res) => {
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
      })
      .on('error', (error) => {
        console.log(` Could not load stewards config from remote: ${error.message}`);
        resolve(null);
      });
  });
}

function getStewardsForLanguage(stewardsConfig, language) {
  if (!stewardsConfig) return [];

  const languageMap = {
    'zh-Hans': 'zh',
    hi: 'hi',
    ko: 'ko',
    es: 'es',
  };

  const stewardsLangCode = languageMap[language] || language;
  const stewards = [];

  for (const [username, areas] of Object.entries(stewardsConfig)) {
    if (!Array.isArray(areas)) continue;

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

function getLanguageDisplayName(langCode) {
  const languages = {
    es: 'Spanish (Español)',
    hi: 'Hindi (हिन्दी)',
    ko: 'Korean (한국어)',
    'zh-Hans': 'Chinese Simplified (简体中文)',
  };
  return languages[langCode] || langCode;
}

module.exports = {
  getTranslationPath,
  getSlugFromEnglishPath,
  parseEnvList,
  fileExists,
  getFileModTime,
  parseFrontmatter,
  stringifyMdx,
  getStubWritePath,
  getStubOutputRoot,
  getChangedFiles,
  getAllEnglishContentFiles,
  loadStewardsConfig,
  getStewardsForLanguage,
  getLanguageDisplayName,
};
