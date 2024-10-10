// Define the global variables.
// Create an array to store words from the p5 homepage statement.
let words = ['p5.js', 'is', 'a', 'JavaScript', 'library', 'for', 'creative',
  'coding', 'with', 'a', 'focus', 'on', 'making', 'coding', 'accessible', 'and',
  'inclusive', 'for', 'artists', 'designers', 'educators', 'beginners', 'and',
  'anyone', 'else!', 'p5.js', 'is', 'free', 'and', 'open-source', 'because', 
  'we', 'believe', 'software', 'and', 'the', 'tools', 'to', 'learn', 'it',
  'should', 'be', 'accessible', 'to', 'everyone', 'Using', 'the', 'metaphor',
  'of', 'a', 'sketch', 'p5.js', 'has', 'a', 'full', 'set', 'of', 'drawing',
  'functionality', 'However', "you're", 'not', 'limited', 'to', 'your',
  'drawing', 'canvas', 'You', 'can', 'think', 'of', 'your', 'whole', 'browser',
  'page', 'as', 'your', 'sketch', 'including', 'HTML5', 'objects', 'for', 'text',
  'input', 'video', 'webcam', 'and', 'sound'];

// Set the amount of words to be drawn on the canvas,   as
// well as the starting hue value. Declare the position variable,
// which will be used to randomly start the word selection in the array.
let wordCount = 15;
let hue;
let position;

function setup() {
  describe(
    'A random series of words related to p5.js scattered onto the canvas.'
  );

  // Import the selected font style defined in the canvas's style.css file.
  textFont('Space Mono');

  createCanvas(720, 400);

  // Set the text alignment to center and set the color mode to HSB.
  textAlign(CENTER);
  colorMode(HSB);

  // Define hue as a random value.
  hue = random(180, 360);

  // Define the random starting point for selecting the words in the
  // array.
  position = floor(random(0, words.length - wordCount));

  background(hue, 95, 25);

  // Draw as many words as set with the words variable in the
  // canvas in random positions.
  for (let i = 0; i < 20; i++) {
    textSize(random(16, 48));
    fill(hue, 200, random(50, 95));
    text(random(words), random(width), random(height));
  }
}
