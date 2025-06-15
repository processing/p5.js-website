/**
 * Branch-specific test for Week 2 commits
 * Tests with our actual week2 branch where recent changes exist
 */

const { Octokit } = require('@octokit/rest');

console.log('🎯 Branch-Specific GitHub API Test');
console.log('===================================');
console.log('🌿 Testing week2 branch specifically\n');

async function testWeek2Branch() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('❌ No GITHUB_TOKEN provided');
    return;
  }

  const octokit = new Octokit({ auth: token });

  // Test files
  const englishFile = 'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx';
  const hindiFile = 'src/content/examples/hi/01_Shapes_And_Color/00_Shape_Primitives/description.mdx';

  console.log('📋 Files to analyze on week2 branch:');
  console.log(`   English: ${englishFile}`);
  console.log(`   Hindi:   ${hindiFile}\n`);

  try {
    // Get commits from week2 branch specifically
    console.log('🔗 GITHUB API Analysis (week2 branch):');
    
    // For English file on week2 branch
    console.log('   Fetching English file commits from week2...');
    const englishCommits = await octokit.rest.repos.listCommits({
      owner: 'Divyansh013',
      repo: 'p5.js-website-new',
      sha: 'week2',  // Specify the branch!
      path: englishFile,
      per_page: 5
    });
    
    console.log(`   English commits found: ${englishCommits.data.length}`);
    if (englishCommits.data.length > 0) {
      const latest = englishCommits.data[0];
      console.log(`   ✅ Latest English commit: ${latest.sha.substring(0, 8)} (${latest.commit.committer.date})`);
      console.log(`   Message: "${latest.commit.message}"`);
    }

    // For Hindi file on week2 branch
    console.log('\n   Fetching Hindi file commits from week2...');
    const hindiCommits = await octokit.rest.repos.listCommits({
      owner: 'Divyansh013',
      repo: 'p5.js-website-new',
      sha: 'week2',  // Specify the branch!
      path: hindiFile,
      per_page: 5
    });
    
    console.log(`   Hindi commits found: ${hindiCommits.data.length}`);
    if (hindiCommits.data.length > 0) {
      const latest = hindiCommits.data[0];
      console.log(`   ✅ Latest Hindi commit: ${latest.sha.substring(0, 8)} (${latest.commit.committer.date})`);
      console.log(`   Message: "${latest.commit.message}"`);
    }

    // Compare dates
    if (englishCommits.data.length > 0 && hindiCommits.data.length > 0) {
      const englishDate = new Date(englishCommits.data[0].commit.committer.date);
      const hindiDate = new Date(hindiCommits.data[0].commit.committer.date);
      
      console.log('\n🎯 WEEK2 BRANCH DATE COMPARISON:');
      console.log(`   English: ${englishDate.toISOString()}`);
      console.log(`   Hindi:   ${hindiDate.toISOString()}`);
      
      const daysDiff = Math.floor((englishDate - hindiDate) / (1000 * 60 * 60 * 24));
      console.log(`   Difference: ${daysDiff} days`);
      
      if (englishDate > hindiDate) {
        console.log('   🚨 CORRECTLY DETECTED: Hindi translation is OUTDATED!');
        console.log('   📝 An issue should be created for this outdated translation.');
      } else {
        console.log('   ✅ Hindi translation is up to date');
      }
    }

    console.log('\n💡 Key Learning:');
    console.log('   The tracker needs to specify the correct branch when querying GitHub API!');
    console.log('   Currently it defaults to main branch, missing recent week2 changes.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status === 404) {
      console.error('   Repository, branch, or file not found');
    }
  }
}

testWeek2Branch(); 