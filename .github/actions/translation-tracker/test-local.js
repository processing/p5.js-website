

const { main } = require('./index.js');

// Test scenarios using actual example files that exist
const testFiles = [
  'src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx',
  'src/content/examples/en/02_Animation_And_Variables/00_Drawing_Lines/description.mdx',
  'src/content/examples/en/03_Imported_Media/00_Words/description.mdx'
];

console.log('🧪 Testing Example Translation Tracker Locally');
console.log('===============================================\n');

// Run the main function with test files
main(testFiles);

console.log('\n💡 This demonstrates local testing capability as requested by mentor');
console.log('🔧 The git logic is now separated and modular for easier testing');
console.log('📖 Now tracking examples instead of tutorials as requested'); 