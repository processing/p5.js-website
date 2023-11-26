/*
 * @name Random
 * @description This example demonstrates the use of the
 * <a href="https://p5js.org/reference/#/p5/random">random()</a>
 * function.
 * 
 * When the user presses the mouse button, the position and color
 * of the circle change randomly.
 */


// Declare variables for the position and color of the circle
let x;
let y;
let c;


function setup() {
  createCanvas(710, 400);

  // Set the initial position and color of the circle
  setPositionAndColor();

  describe('A circle with random position and color on the canvas.');
}


function setPositionAndColor(){
    // Set the position to a random value (within the canvas)
    x = random(0, width);
    y = random(0, height);

    // Set R, G, and B to random values in the range [0, 256)
    c = color(random(256), random(256), random(256));
}


function draw() {
  background(0);

  // Draw a circle at (x,y) with color c
  fill(c);
  circle(x, y, 100);
}


function mousePressed() {
  // On mouse press (re)set the position and color
  setPositionAndColor();
}


