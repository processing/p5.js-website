/**
 ** @name Image Transparency
 ** @description This program overlays one image over another by modifying the
 ** alpha value of the image with the <a href="https://p5js.org/reference/#/p5/tint" target="_blank">tint()</a> 
 ** function. Move the cursor left and right across the canvas to change the image's position. To run this example 
 ** locally, you will need an image file, and a running 
 ** <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.
 **/
// Define the global variables: img, offset, and easing.
// Set offset to 0 and easing to 0.05 for moving the 
// transparent image with the cursor position.
let img;
let offset = 0;
let easing = 0.05;

function setup() {
  describe('An astronaut on planet as the background with a slightly transparent version of this image on top that moves with the horizontal direction of the user’s mouse.');
  
  createCanvas(720, 400);

  // Load the bottom image from the canvas' assets directory.
  img = loadImage('assets/moonwalk.jpg');
}

function draw() {
  // Display the bottom image at full opacity.
  tint(255, 255);
  image(img, 0, 0);

  // Define dx as the rate at which the top image
  // moves with the cursor. The offset variable
  // delays the movement of the image.
  let dx = mouseX - img.width / 2 - offset;
  offset += dx * easing;

  // Display the top image at half opacity.
  tint(255, 127);
  image(img, offset, 0);
}