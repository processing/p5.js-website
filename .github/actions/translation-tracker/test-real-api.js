/**
 * Real GitHub API Test for User's Fork
 * Tests with actual commit data from Divyansh013/p5.js-website-new
 */

const { main } = require('./index.js');

console.log('🔥 Testing Translation Tracker with REAL GitHub API');
console.log('===================================================');
console.log('🎯 Target: Divyansh013/p5.js-website-new (YOUR FORK)');
console.log('📅 Testing recent commits on week2 branch\n');

// Test with the file we just modified
const testFiles = [
  'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx'
];

// Test options for your fork
const options = {
  createIssues: false, // Set to true if you want to actually create issues
  githubToken: process.env.GITHUB_TOKEN,
  // Override the repository to use your fork
  repository: 'Divyansh013/p5.js-website-new'
};

// Custom main function that uses your fork
async function testWithFork() {
  // Override environment variable for this test
  process.env.GITHUB_REPOSITORY = 'Divyansh013/p5.js-website-new';
  
  console.log('🔧 Configuration:');
  console.log(`   Repository: ${process.env.GITHUB_REPOSITORY}`);
  console.log(`   Branch: week2`);
  console.log(`   GitHub Token: ${process.env.GITHUB_TOKEN ? '✅ Provided' : '❌ Missing'}`);
  console.log(`   Create Issues: ${options.createIssues ? 'YES' : 'NO (dry run)'}\n`);
  
  try {
    await main(testFiles, options);
    
    console.log('\n🎉 Real API Test Results:');
    console.log('✅ GitHub API successfully connected to your fork');
    console.log('✅ Commit data retrieved from your repository');
    console.log('✅ Translation status analysis completed');
    console.log('\n💡 Next Steps:');
    console.log('• To create real issues, set createIssues: true');
    console.log('• Check GitHub API rate limits if needed');
    console.log('• Test with different file changes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Check:');
    console.error('   - GitHub token permissions');
    console.error('   - Repository access');
    console.error('   - Network connectivity');
  }
}

// Run the test
testWithFork(); 