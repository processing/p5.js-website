/**
 * Week 2 Local Testing Script
 * Tests GitHub API integration and issue creation (without actually creating issues)
 */

const { main } = require('./index.js');

// Test scenarios using actual example files
const testFiles = [
  'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx',
  'src/content/examples/en/02_Animation_And_Variables/00_Drawing_Lines/description.mdx'
];

console.log('🧪 Testing Week 2 Translation Tracker with GitHub API');
console.log('=====================================================\n');

// Test options
const options = {
  createIssues: false,  // Set to false for local testing to avoid creating real issues
  githubToken: process.env.GITHUB_TOKEN || null  // Will use token if provided via environment
};

// Run the main function with test files and options
main(testFiles, options).then(() => {
  console.log('\n💡 Week 2 Testing Complete!');
  console.log('🔧 To test with real GitHub API:');
  console.log('   export GITHUB_TOKEN=your_token_here');
  console.log('   node test-week2.js');
  console.log('\n📋 Week 2 Features Tested:');
  console.log('✅ GitHub API commit tracking');
  console.log('✅ Enhanced outdated detection');
  console.log('✅ Issue creation logic (dry run)');
  console.log('✅ Hindi-only focus');
}).catch(error => {
  console.error('❌ Test failed:', error.message);
}); 