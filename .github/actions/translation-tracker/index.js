const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPPORTED_LANGUAGES = ['es', 'hi', 'ko', 'zh-Hans'];


function getChangedFiles(testFiles = null) {
  // Allow passing test files for local development
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

/**
 * Check if a file exists
 */
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


function checkTranslationStatus(changedExampleFiles) {
  const translationStatus = {
    needsUpdate: [],
    missing: [],
    upToDate: []
  };
  
  changedExampleFiles.forEach(englishFile => {
    console.log(`\n📝 Checking translations for: ${englishFile}`);
    
    const englishModTime = getFileModTime(englishFile);
    if (!englishModTime) {
      console.log(`⚠️ Could not get modification time for English file`);
      return;
    }
    
    SUPPORTED_LANGUAGES.forEach(language => {
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
      } else {
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
    });
  });
  
  return translationStatus;
}


function displaySummary(translationStatus) {
  console.log('\n📊 TRANSLATION STATUS SUMMARY');
  console.log('═══════════════════════════════');
  
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
  

}

/**
 * Explore repository structure (focusing on examples as requested)
 */
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


function main(testFiles = null) {
  console.log('🎯 p5.js Example Translation Tracker - Week 1 Prototype');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📅 Event: ${process.env.GITHUB_EVENT_NAME || 'local'}`);
  console.log(`🏠 Working directory: ${process.cwd()}`);
  console.log(`🌍 Tracking languages: ${SUPPORTED_LANGUAGES.join(', ')}`);

  exploreRepoStructure();
  
  // Get changed files (supports both git and test files)
  const changedExampleFiles = getChangedFiles(testFiles);
  
  if (changedExampleFiles.length === 0) {
    console.log('\n✨ No changes detected in English example files.');
    console.log('📝 Nothing to track for translations in this commit!');
    return;
  }
  
  const translationStatus = checkTranslationStatus(changedExampleFiles);

  displaySummary(translationStatus);
}

// Export for testing
module.exports = {
  main,
  getChangedFiles,
  checkTranslationStatus,
  exploreRepoStructure
};


if (require.main === module) {
  main();
} 
