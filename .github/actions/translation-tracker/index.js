const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');


const SUPPORTED_LANGUAGES = ['es', 'hi', 'ko', 'zh-Hans'];
const REFERENCE_PATH = 'src/content/reference';
const ENGLISH_PATH = path.join(REFERENCE_PATH, 'en');


function getChangedFiles() {
  try {
    
    
    
    const gitCommand = process.env.GITHUB_EVENT_NAME === 'pull_request' 
      ? 'git diff --name-only HEAD~1 HEAD'
      : 'git diff --name-only HEAD~1 HEAD';
    
    const changedFilesOutput = execSync(gitCommand, { encoding: 'utf8' });
    const allChangedFiles = changedFilesOutput.trim().split('\n').filter(file => file.length > 0);
    
 
    const changedEnglishFiles = allChangedFiles.filter(file => 
      file.startsWith(ENGLISH_PATH) && file.endsWith('.mdx')
    );
    
    console.log(` Total changed files: ${allChangedFiles.length}`);
    console.log(` Changed English reference files: ${changedEnglishFiles.length}`);
    
    if (changedEnglishFiles.length > 0) {
      console.log('📄 Changed English files:');
      changedEnglishFiles.forEach(file => console.log(`  - ${file}`));
    }
    
    return changedEnglishFiles;
  } catch (error) {
    console.error(' Error getting changed files:', error.message);
    return [];
  }
}


function getTranslationPath(englishFilePath, language) {
  return englishFilePath.replace('/en/', `/${language}/`);
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


function checkTranslationStatus(changedEnglishFiles) {
  
  
  const translationStatus = {
    needsUpdate: [],
    missing: [],
    upToDate: []
  };
  
  changedEnglishFiles.forEach(englishFile => {
    
    
    const englishModTime = getFileModTime(englishFile);
    if (!englishModTime) {
      console.log(`Could not get modification time for English file`);
      return;
    }
    
    SUPPORTED_LANGUAGES.forEach(language => {
      const translationPath = getTranslationPath(englishFile, language);
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
  
  console.log('\n💡 Next steps for Week 2+:');
  

function exploreRepoStructure() {
  console.log('\n🔍 REPOSITORY STRUCTURE ANALYSIS');
  console.log('═══════════════════════════════════');
  
  try {
    const referencePath = REFERENCE_PATH;
    console.log(`📁 Reference path: ${referencePath}`);
    
    if (fs.existsSync(referencePath)) {
      const languages = fs.readdirSync(referencePath)
        .filter(item => fs.statSync(path.join(referencePath, item)).isDirectory())
        .filter(item => !item.startsWith('.'));
      
      console.log(`🌐 Available languages: ${languages.join(', ')}`);
      
      // Count files in each language
      languages.forEach(lang => {
        const langPath = path.join(referencePath, lang);
        try {
          const subdirs = fs.readdirSync(langPath)
            .filter(item => fs.statSync(path.join(langPath, item)).isDirectory());
          
          let totalFiles = 0;
          subdirs.forEach(subdir => {
            const subdirPath = path.join(langPath, subdir);
            const files = fs.readdirSync(subdirPath)
              .filter(file => file.endsWith('.mdx'));
            totalFiles += files.length;
          });
          
          console.log(`  ${lang}: ${totalFiles} files across ${subdirs.length} categories`);
        } catch (error) {
          console.log(`  ${lang}: Error reading directory - ${error.message}`);
        }
      });
    } else {
      console.log(` Reference path does not exist: ${referencePath}`);
    }
  } catch (error) {
    console.error(' Error exploring repository structure:', error.message);
  }
}


function main() {
  console.log('p5.js Translation Sync Tracker - Week 1 Prototype');
  console.log('════════════════════════════════════════════════════');
  console.log(`📅 Event: ${process.env.GITHUB_EVENT_NAME || 'local'}`);
  console.log(`🏠 Working directory: ${process.cwd()}`);
  console.log(`🎯 Tracking languages: ${SUPPORTED_LANGUAGES.join(', ')}`);
  
 
  exploreRepoStructure();
  
  
  const changedEnglishFiles = getChangedFiles();
  
  if (changedEnglishFiles.length === 0) {
    console.log(' No changes detected in English reference files.');
    console.log(' Nothing to track for translations in this commit!');
    return;
  }
  
 
  const translationStatus = checkTranslationStatus(changedEnglishFiles);
  
  
  displaySummary(translationStatus);
  
  
}

// Run the main function
if (require.main === module) {
  main();
} 