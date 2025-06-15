/**
 * Test Multiple Example Files
 * Manually select several files to show different translation statuses
 */

const { main } = require('./index.js');
const fs = require('fs');
const path = require('path');

console.log('📚 Testing Multiple Example Files');
console.log('=================================');
console.log('🎯 Checking several files to show different scenarios\n');

function findExampleFiles(limit = 5) {
  const examplesPath = 'src/content/examples/en';
  const files = [];
  
  function scanDirectory(dir, currentFiles) {
    if (currentFiles.length >= limit) return currentFiles;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (currentFiles.length >= limit) break;
        
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDirectory(itemPath, currentFiles);
        } else if (item === 'description.mdx') {
          currentFiles.push(itemPath);
        }
      }
    } catch (error) {
      console.log(`⚠️ Error reading ${dir}: ${error.message}`);
    }
    
    return currentFiles;
  }
  
  return scanDirectory(examplesPath, files);
}

async function testMultipleFiles() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.log('❌ No GitHub token - set it first:');
    console.log('   GITHUB_TOKEN=your_token node test-multiple-files.js');
    return;
  }

  // Override to use your fork
  process.env.GITHUB_REPOSITORY = 'Divyansh013/p5.js-website-new';
  
  // Find several example files to test
  const testFiles = findExampleFiles(5);
  
  console.log('🔧 Configuration:');
  console.log(`   Repository: Divyansh013/p5.js-website-new`);
  console.log(`   Files to check: ${testFiles.length}`);
  console.log(`   GitHub Token: ✅ Provided`);
  console.log(`   Issue Creation: 🔴 DISABLED (dry run)\n`);
  
  console.log('📋 Files being checked:');
  testFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log('');

  const options = {
    createIssues: false, // Don't create issues
    githubToken: token
  };
  
  try {
    console.log('🚀 Running tracker on multiple files...\n');
    
    await main(testFiles, options);
    
    console.log('\n🎉 MULTIPLE FILES CHECK COMPLETE!');
    console.log('📊 This shows different translation statuses:');
    console.log('   • Some files may be outdated (Hindi older than English)');
    console.log('   • Some files may be up-to-date (Hindi newer than English)');
    console.log('   • Some files may have missing translations');
    console.log('\n💡 In real usage:');
    console.log('   • Only files changed in a commit are checked');
    console.log('   • Issues are created automatically for outdated translations');
    console.log('   • The system focuses on one language at a time (Hindi)');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testMultipleFiles(); 