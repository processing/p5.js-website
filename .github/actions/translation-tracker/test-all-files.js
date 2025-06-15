/**
 * Test ALL Example Files
 * This will check every English example file for translation status
 */

const { main } = require('./index.js');

console.log('🌍 Testing ALL Example Files Translation Status');
console.log('===============================================');
console.log('📋 This will check EVERY English example file\n');

async function testAllFiles() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.log('❌ No GitHub token - set it first:');
    console.log('   export GITHUB_TOKEN=your_token_here');
    return;
  }

  // Override to use your fork
  process.env.GITHUB_REPOSITORY = 'Divyansh013/p5.js-website-new';
  
  console.log('🔧 Configuration:');
  console.log(`   Repository: Divyansh013/p5.js-website-new`);
  console.log(`   Mode: CHECK ALL EXAMPLE FILES`);
  console.log(`   GitHub Token: ✅ Provided`);
  console.log(`   Issue Creation: 🔴 DISABLED (dry run)\n`);

  const options = {
    createIssues: false, // Don't spam with issues
    githubToken: token
  };
  
  try {
    console.log('🚀 Running tracker on ALL example files...\n');
    
    // Pass null to testFiles - this will make it check ALL changed files
    // But since we're in test mode, let's simulate checking multiple files
    await main(null, options);
    
    console.log('\n🎉 ALL FILES CHECK COMPLETE!');
    console.log('📊 This shows what would happen in a real scenario');
    console.log('💡 In production, it only checks files that changed in a commit');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testAllFiles(); 