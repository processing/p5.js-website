/**
 * Test Real GitHub Issue Creation
 * This will create an actual issue on your repository!
 */

const { main } = require('./index.js');

console.log('🎫 Testing REAL GitHub Issue Creation');
console.log('=====================================');
console.log('⚠️  WARNING: This will create an actual GitHub issue!');
console.log('🎯 Target: Your fork with outdated Hindi translation\n');

// Test with the file we know is outdated
const testFiles = [
  'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx'
];

// Test options - ENABLE issue creation
const options = {
  createIssues: true,  // This will create real issues!
  githubToken: process.env.GITHUB_TOKEN,
  repository: 'Divyansh013/p5.js-website-new'
};

async function testIssueCreation() {
  // Override environment for your fork
  process.env.GITHUB_REPOSITORY = 'Divyansh013/p5.js-website-new';
  
  console.log('⚙️ Configuration:');
  console.log(`   Repository: ${process.env.GITHUB_REPOSITORY}`);
  console.log(`   Create Issues: ${options.createIssues ? '🟢 ENABLED' : '🔴 DISABLED'}`);
  console.log(`   GitHub Token: ${process.env.GITHUB_TOKEN ? '✅ Provided' : '❌ Missing'}`);
  
  if (!process.env.GITHUB_TOKEN) {
    console.log('\n❌ No GitHub token - cannot create issues');
    return;
  }
  
  try {
    console.log('\n🚀 Running tracker with issue creation enabled...\n');
    
    await main(testFiles, options);
    
    console.log('\n🎉 ISSUE CREATION TEST COMPLETE!');
    console.log('✅ Check your GitHub repository for new issues');
    console.log('📋 Issues should be labeled with: translation, lang-hi, help wanted');
    console.log('🔗 Visit: https://github.com/Divyansh013/p5.js-website-new/issues');
    
  } catch (error) {
    console.error('\n❌ Issue creation failed:', error.message);
    console.error('🔍 Check:');
    console.error('   - GitHub token has issues:write permission');
    console.error('   - Repository exists and is accessible');
    console.error('   - Network connectivity');
  }
}

console.log('⏳ Starting in 3 seconds...');
setTimeout(() => {
  testIssueCreation();
}, 3000); 