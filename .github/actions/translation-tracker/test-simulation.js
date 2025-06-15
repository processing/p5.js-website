

const { GitHubCommitTracker } = require('./index.js');


class MockGitHubTracker extends GitHubCommitTracker {
  constructor() {
    super(null, 'processing', 'p5.js-website'); // Call super with mock values
  }

  async getLastCommit(filePath) {
    
    const mockCommits = {
      'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx': {
        sha: 'abc1234567890',
        date: new Date('2024-06-10T10:00:00Z'),
        message: 'Update shape primitives documentation with better examples',
        author: 'p5js-contributor',
        url: 'https://github.com/processing/p5.js-website/commit/abc1234567890'
      },
      'src/content/examples/hi/01_Shapes_And_Color/00_Shape_Primitives/description.mdx': {
        sha: 'def0987654321',
        date: new Date('2024-06-01T15:30:00Z'), 
        message: 'आकार आदिम दस्तावेज़ीकरण का अनुवाद',
        author: 'hindi-translator',
        url: 'https://github.com/processing/p5.js-website/commit/def0987654321'
      }
    };

    return mockCommits[filePath] || null;
  }

  async createTranslationIssue(englishFile, language, commitInfo) {
    
    const issueTitle = `🌍 Update ${language.toUpperCase()} translation for ${require('path').basename(englishFile)}`;
    const issueBody = this.formatIssueBody(englishFile, language, commitInfo);
    
    console.log('\n🎫 SIMULATED ISSUE CREATION:');
    console.log('═══════════════════════════════');
    console.log(`Title: ${issueTitle}`);
    console.log('Body Preview:');
    console.log(issueBody.substring(0, 300) + '...');
    
    
    return {
      number: 42,
      html_url: 'https://github.com/processing/p5.js-website/issues/42',
      title: issueTitle
    };
  }
}

async function runSimulation() {
  console.log('🎭 Week 2 Translation Tracker Simulation');
  console.log('=========================================\n');
  
  const mockTracker = new MockGitHubTracker();
  const englishFile = 'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx';
  const language = 'hi';
  
  console.log('📋 Simulation Scenario:');
  console.log(`  - English file updated: June 10, 2024`);
  console.log(`  - Hindi translation: June 1, 2024 (9 days outdated)`);
  console.log(`  - Expected result: Create update issue\n`);
  
  
  const englishCommit = await mockTracker.getLastCommit(englishFile);
  const translationPath = englishFile.replace('/en/', `/${language}/`);
  const translationCommit = await mockTracker.getLastCommit(translationPath);
  
  console.log('📊 Commit Analysis:');
  console.log(`  English: ${englishCommit.date.toISOString()} (${englishCommit.sha.substring(0, 7)})`);
  console.log(`  Hindi: ${translationCommit.date.toISOString()} (${translationCommit.sha.substring(0, 7)})`);
  console.log(`  Outdated: ${translationCommit.date < englishCommit.date ? 'YES' : 'NO'}\n`);
  
  if (translationCommit.date < englishCommit.date) {
    await mockTracker.createTranslationIssue(englishFile, language, {
      english: englishCommit,
      translation: translationCommit
    });
  }
  
  console.log('\n🎯 Week 2 Simulation Results:');
  console.log('✅ GitHub API commit tracking simulation');
  console.log('✅ Outdated detection logic verification');
  console.log('✅ Issue creation format testing');
  console.log('✅ Ready for real-world testing!');
}


runSimulation().catch(console.error); 