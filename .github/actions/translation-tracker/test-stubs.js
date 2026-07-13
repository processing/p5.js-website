const path = require('path');
const { main } = require('./index.js');

// Run from repository root so content paths resolve correctly.
process.chdir(path.join(__dirname, '../../..'));

// Dry-run stub generation: writes stub files locally, does not open PRs.
process.env.GENERATE_STUBS = 'true';
process.env.STUB_DRY_RUN = 'true';
process.env.STUB_LANGUAGES = 'es';
// Omit STUB_CONTENT_TYPES to use the same defaults as issue tracking (all CONTENT_TYPES).
process.env.STUB_FULL_SCAN = 'true';
process.env.STUB_MAX_FILES = '3';

console.log('🧪 Testing stub generation (dry run, max 3 files per language, non-reference content)');
console.log('   Output: .github/actions/translation-tracker/stub-preview/');
console.log('=================================================');

main();
