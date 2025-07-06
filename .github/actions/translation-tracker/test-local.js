
const { main, getAllEnglishExampleFiles, SUPPORTED_LANGUAGES } = require('./index.js');

async function testWeek3Functionality() {
  console.log('🧪 Testing Week 3 Multi-Language Translation Tracker');
  console.log('====================================================\n');

  // Test 1: Single issue per file with multiple languages
  console.log('📝 TEST 1: Multi-language issue creation');
  console.log('==========================================');
  const testFiles = [
    'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx',
    'src/content/examples/en/02_Animation_And_Variables/00_Drawing_Lines/description.mdx',
    'src/content/examples/en/03_Imported_Media/00_Words/description.mdx'
  ];

  await main(testFiles, { 
    createIssues: false // Don't create real issues in test mode
  });

  console.log('\n\n');

  // Test 2: Manual scan mode (scan all files)
  console.log('📝 TEST 2: Manual scan mode (first 5 files only for demo)');
  console.log('==========================================================');
  
  const allFiles = getAllEnglishExampleFiles();
  const firstFiveFiles = allFiles.slice(0, 5); // Limit for demo
  
  if (firstFiveFiles.length > 0) {
    await main(firstFiveFiles, {
      scanAll: false, // Set to false since we're passing specific files
      createIssues: false
    });
  } else {
    console.log('No files found for manual scan test');
  }

  console.log('\n\n');

  // Test 3: Week 2 mode with GitHub token (if available)
  console.log('📝 TEST 3: Week 2 mode with GitHub API (if token available)');
  console.log('==============================================================');
  
  if (process.env.GITHUB_TOKEN) {
    console.log('✅ GitHub token detected - running in Week 2 mode');
    await main(testFiles, {
      githubToken: process.env.GITHUB_TOKEN,
      createIssues: false // Change to true to actually create issues
    });
  } else {
    console.log('⚠️ No GitHub token - run with GITHUB_TOKEN=your_token for Week 2 features');
    console.log('📝 Running in Week 1 mode instead...');
    await main(testFiles, { createIssues: false });
  }

  console.log('\n\n');

  // Test 4: Full manual scan (commented out to avoid spam)
  console.log('📝 TEST 4: Full manual scan mode (disabled by default)');
  console.log('======================================================');
  console.log('💡 To run full scan: main(null, { scanAll: true })');
  console.log(`📊 Found ${allFiles.length} total English example files`);
  console.log(`🌍 Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`);
  
  console.log('\n✅ Week 3 Testing Complete!');
  console.log('\n📋 Key Features Demonstrated:');
  console.log('   ✅ Single issue per file covering all affected languages');
  console.log('   ✅ Proper labeling: "needs translation" + language-specific labels');
  console.log('   ✅ Manual scan capability for all files');
  console.log('   ✅ Week 1 & Week 2 backward compatibility');
  console.log('   ✅ Enhanced issue format with detailed language status');
}

// Allow running specific modes
async function runMode() {
  const mode = process.argv[2];
  
  switch(mode) {
    case 'manual':
      console.log('🔍 Running manual scan of all files...');
      await main(null, { scanAll: true, createIssues: false });
      break;
    case 'week2':
      if (process.env.GITHUB_TOKEN) {
        console.log('🚀 Running Week 2 mode with issue creation...');
        await main(null, { 
          scanAll: false, 
          createIssues: true,
          githubToken: process.env.GITHUB_TOKEN 
        });
      } else {
        console.log('❌ GITHUB_TOKEN required for Week 2 mode');
        console.log('Usage: GITHUB_TOKEN=token node test-local.js week2');
      }
      break;
    case 'issues':
      console.log('🎫 Creating issues for test files...');
      const testFiles = [
        'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx'
      ];
      await main(testFiles, { 
        createIssues: true,
        githubToken: process.env.GITHUB_TOKEN 
      });
      break;
    default:
      await testWeek3Functionality();
  }
}

// Usage examples
console.log('💡 Usage Examples:');
console.log('   node test-local.js                               # Run all tests');
console.log('   node test-local.js manual                        # Manual scan all files');
console.log('   GITHUB_TOKEN=token node test-local.js week2      # Week 2 with issues');
console.log('   GITHUB_TOKEN=token node test-local.js issues     # Create test issues');
console.log('');

runMode().catch(console.error); 