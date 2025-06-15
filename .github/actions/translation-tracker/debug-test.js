/**
 * Debug Test for GitHub API
 * Shows detailed commit information to debug why outdated files aren't detected
 */

const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');

console.log('🔍 Debug Test - Analyzing GitHub Commit Data');
console.log('=============================================\n');

async function debugCommitData() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('❌ No GITHUB_TOKEN provided');
    return;
  }

  const octokit = new Octokit({ auth: token });
  const git = simpleGit();

  // Test files
  const englishFile = 'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx';
  const hindiFile = 'src/content/examples/hi/01_Shapes_And_Color/00_Shape_Primitives/description.mdx';

  console.log('📋 Files to analyze:');
  console.log(`   English: ${englishFile}`);
  console.log(`   Hindi:   ${hindiFile}\n`);

  try {
    // Get local commit data for comparison
    console.log('🏠 LOCAL Git Analysis:');
    const englishLog = await git.log({ file: englishFile, n: 1 });
    const hindiLog = await git.log({ file: hindiFile, n: 1 });
    
    console.log(`   English latest: ${englishLog.latest.hash} (${englishLog.latest.date})`);
    console.log(`   Hindi latest:   ${hindiLog.latest.hash} (${hindiLog.latest.date})\n`);

    // Get GitHub API data
    console.log('🔗 GITHUB API Analysis:');
    
    // For English file
    console.log('   Fetching English file commits...');
    const englishCommits = await octokit.rest.repos.listCommits({
      owner: 'Divyansh013',
      repo: 'p5.js-website-new',
      path: englishFile,
      per_page: 5
    });
    
    console.log(`   English commits found: ${englishCommits.data.length}`);
    if (englishCommits.data.length > 0) {
      const latest = englishCommits.data[0];
      console.log(`   Latest English commit: ${latest.sha.substring(0, 8)} (${latest.commit.committer.date})`);
      console.log(`   Message: ${latest.commit.message}`);
    }

    // For Hindi file
    console.log('\n   Fetching Hindi file commits...');
    const hindiCommits = await octokit.rest.repos.listCommits({
      owner: 'Divyansh013',
      repo: 'p5.js-website-new',
      path: hindiFile,
      per_page: 5
    });
    
    console.log(`   Hindi commits found: ${hindiCommits.data.length}`);
    if (hindiCommits.data.length > 0) {
      const latest = hindiCommits.data[0];
      console.log(`   Latest Hindi commit: ${latest.sha.substring(0, 8)} (${latest.commit.committer.date})`);
      console.log(`   Message: ${latest.commit.message}`);
    }

    // Compare dates
    if (englishCommits.data.length > 0 && hindiCommits.data.length > 0) {
      const englishDate = new Date(englishCommits.data[0].commit.committer.date);
      const hindiDate = new Date(hindiCommits.data[0].commit.committer.date);
      
      console.log('\n📊 DATE COMPARISON:');
      console.log(`   English: ${englishDate.toISOString()}`);
      console.log(`   Hindi:   ${hindiDate.toISOString()}`);
      console.log(`   Difference: ${Math.floor((englishDate - hindiDate) / (1000 * 60 * 60 * 24))} days`);
      
      if (englishDate > hindiDate) {
        console.log('   ✅ DETECTED: Hindi translation is OUTDATED!');
      } else {
        console.log('   ❌ NOT DETECTED: System thinks Hindi is up to date');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status === 404) {
      console.error('   Repository or file not found');
    }
  }
}

debugCommitData(); 