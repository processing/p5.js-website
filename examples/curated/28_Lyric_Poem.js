/* 
 * @name Lyric Poem
 * @description Using the <a href="https://p5js.org/reference/#/p5/floor" target="_blank">floor()</a> and 
 * <a href="https://p5js.org/reference/#/p5/random" target="_blank">random()</a> functions, you can randomly select a series 
 * of items from an array and draw them on the canvas.
*/
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

  //Import the selected font style defined the canvas' style.css file.
  textFont("Space Mono");

  createCanvas(710, 400);

  // Set the text alignment to center and set the color mode to HSB.
  textAlign(CENTER);
  colorMode(HSB, 255);

  // Define hue as a random value between 230 and 255.
  hue = random(230, 255);

  // Define the random starting point for selecting the lyrics in the
  // array.
  position = floor(random(0, lyrics.length - words));

  background(hue, 255, 30);
  let line = 1;

  // Using the starting position in the array, draw as many lyrics
  // set with the words variable in the canvas in random positions.
  for (let i = position; i < position + words; i++) {
    textSize(32);
    fill(hue, 200, random(150, 255));
    text(lyrics[i], random(30, 680), (370 / words) * line);
    line++;
  }
}