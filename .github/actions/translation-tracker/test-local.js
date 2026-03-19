const { main, getAllEnglishContentFiles, CONTENT_TYPES } = require('./index.js');

// Simple test with predefined files across multiple content types
const testFiles = [
  'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx',
  'src/content/examples/en/02_Animation_And_Variables/00_Drawing_Lines/description.mdx',
  'src/content/examples/en/03_Imported_Media/00_Words/description.mdx',
  'src/content/tutorials/en/variables-and-change.mdx',
  'src/content/tutorials/en/getting-started-with-nodejs.mdx'
];

const args = process.argv.slice(2);

if (args.includes('--scan-all')) {
  // Full scan mode: check all English files across all content types
  console.log('🔍 Full scan mode: checking all English content files');
  console.log(`📦 Content types: ${CONTENT_TYPES.join(', ')}`);
  console.log('====================================================\n');
  main(null, { dryRun: true });
} else if (args.includes('--content-type') && args[args.indexOf('--content-type') + 1]) {
  // Scan a specific content type
  const contentType = args[args.indexOf('--content-type') + 1];
  if (!CONTENT_TYPES.includes(contentType)) {
    console.error(`❌ Unknown content type: ${contentType}`);
    console.log(`   Valid types: ${CONTENT_TYPES.join(', ')}`);
    process.exit(1);
  }
  console.log(`🔍 Scanning all ${contentType} files`);
  console.log('====================================================\n');
  const files = getAllEnglishContentFiles(contentType);
  main(files, { dryRun: true });
} else {
  // Default: test with predefined files
  console.log('🧪 Testing Translation Tracker with predefined files');
  console.log('====================================================');
  console.log('  Tip: run with --scan-all to check all content');
  console.log('  Tip: run with --content-type <type> to check a specific type');
  console.log(`  Valid types: ${CONTENT_TYPES.join(', ')}\n`);
  main(testFiles, { dryRun: true });
}
