#!/usr/bin/env node

/**
 * Local test script for the translation tracker
 * This simulates the GitHub Action environment for testing
 */

const { execSync } = require('child_process');
const path = require('path');

process.env.GITHUB_EVENT_NAME = 'push';
process.env.GITHUB_WORKSPACE = process.cwd();

console.log('🧪 LOCAL TEST: Translation Tracker');
console.log('═══════════════════════════════════');
console.log(`📁 Working directory: ${process.cwd()}`);

// Navigate to repository root
const repoRoot = path.resolve(__dirname, '../../..');
process.chdir(repoRoot);

console.log(`📁 Changed to repository root: ${process.cwd()}`);

try {
  const gitLogOutput = execSync('git log --oneline -5', { encoding: 'utf8' });
  console.log(' Recent commits:');
  console.log(gitLogOutput);
} catch (error) {
  console.log(' No git history available or not in a git repository');
}

console.log(' Running translation tracker...\n');

try {
  require('./index.js');
} catch (error) {
  console.error('❌ Error running translation tracker:', error.message);
  console.error(error.stack);
} 