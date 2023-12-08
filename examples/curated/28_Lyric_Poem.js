/** 
 ** @name Lyric Poem
 ** @description Using the <a href="https://p5js.org/reference/#/p5/floor" target="_blank">floor()</a> and 
 ** <a href="https://p5js.org/reference/#/p5/random" target="_blank">random()</a> functions, you can randomly select a series 
 ** of items from an array and draw them at different sizes and positions on the canvas. 
**/
// Define the global variables.
// Create the lyrics array to store the available lyrics.
let lyrics = ['Are', 'you', 'lonesome', 'tonight?', 'Do', 'you', 'miss', 'me', 'tonight?', 
  'Are', 'you', 'sorry', 'we', 'drifted', 'apart?', 'Does', 'your', 'memory', 'stray', 'to', 'a', 
  'bright', 'summer', 'day', 'When', 'I', 'kissed', 'you', 'and', 'called', 'you', 'sweetheart?', 
  'Do', 'the', 'chairs', 'in', 'your', 'parlor', 'seem', 'empty', 'and', 'bare?', 'Do', 'you', 'gaze', 
  'at', 'your', 'doorstep', 'and', 'picture', 'me', 'there?'];

// Set the amount of words to be drawn on the canvas, as 
// well as the starting hue value. Declare the position variable,
// which will be used to randomly start the lyrics selection in the array.
let words = 15;
let hue;
let position;

function setup() {
  describe('A random series of words from an array drawn onto the canvas.');

  // Import the selected font style defined the canvas' style.css file.
  textFont('Space Mono');

  createCanvas(720, 400);

  // Set the text alignment to center and set the color mode to HSB.
  textAlign(CENTER);
  colorMode(HSB);

  // Define hue as a random value.
  hue = random(180, 360);

  // Define the random starting point for selecting the lyrics in the
  // array.
  position = floor(random(0, lyrics.length - words));

  background(hue, 95, 25);

  // Draw as many lyrics set with the words variable in the 
  // canvas in random positions.
  for (let i = 0; i < 20; i++) {
    textSize(random(16, 48));
    fill(hue, 200, random(50, 95));
    text(random(lyrics), random(width), random(height));
  }
}

// Presley, Elvis. “Are You Lonesome Tonight?” Elvis' Golden Records, Vol. 3. RCA Records, 1960. Digital.