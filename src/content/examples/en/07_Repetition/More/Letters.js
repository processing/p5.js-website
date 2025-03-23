/*
 * @name Letters
 * @arialabel Letters and characters on a grey background. All are white except the vowels are pink.
 * @description Letters can be drawn to the screen by loading a font, setting
 * its characteristics and then drawing the letters. This example uses a for
 * loop and unicode reference numbers to automatically fill the canvas with
 * characters in a grid. Vowels are selected and given a specific fill color.
 */
let font,
  fontsize = 32;

function preload() {
  // Ensure the .ttf or .otf font stored in the assets directory
  // is loaded before setup() and draw() are called
  font = loadFont('/assets/SourceSansPro-Regular.otf');
}

function setup() {
  createCanvas(710, 400);

  // Set text characteristics
  textFont(font);
  textSize(fontsize);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(160);

  // Set the gap between letters and the left and top margin
  let gap = 52;
  let margin = 10;
  translate(margin * 4, margin * 4);

  // Set the counter to start at the character you want
  // in this case 35, which is the # symbol
  let counter = 35;

  // Loop as long as there is space on the canvas
  for (let y = 0; y < height - gap; y += gap) {
    for (let x = 0; x < width - gap; x += gap) {
      // Use the counter to retrieve individual letters by their Unicode number
      let letter = char(counter);

      // Add different color to the vowels and other characters
      if (
        letter === 'A' ||
        letter === 'E' ||
        letter === 'I' ||
        letter === 'O' ||
        letter === 'U'
      ) {
        fill('#ed225d');
      } else {
        fill(255);
      }

      // Draw the letter to the screen
      text(letter, x, y);

      // Increment the counter
      counter++;
    }
  }
}
