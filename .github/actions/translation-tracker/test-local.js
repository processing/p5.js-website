
const { main } = require('./index.js');

// Simple test with predefined files
const testFiles = [
  'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx',
  'src/content/examples/en/02_Animation_And_Variables/00_Drawing_Lines/description.mdx',
  'src/content/examples/en/03_Imported_Media/00_Words/description.mdx'
];

console.log('🧪 Testing Translation Tracker with predefined files');
console.log('====================================================');

main(testFiles, { createIssues: false }); 