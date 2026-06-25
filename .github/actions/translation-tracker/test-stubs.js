const path = require('path');
const { main } = require('./index.js');

// Run from repository root so content paths resolve correctly.
process.chdir(path.join(__dirname, '../../..'));

// Dry-run stub generation: writes stub files locally, does not open PRs.
process.env.GENERATE_STUBS = 'true';
process.env.STUB_DRY_RUN = 'true';
process.env.STUB_LANGUAGES = 'es';
process.env.STUB_CONTENT_TYPES = 'reference';
process.env.STUB_FULL_SCAN = 'true';
process.env.STUB_MAX_FILES = '3';

console.log('🧪 Testing stub generation (dry run, max 3 files)');
console.log('   Output: .github/actions/translation-tracker/stub-preview/');
console.log('=================================================');

main();
