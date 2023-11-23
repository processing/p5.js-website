/*
 * @name Redraw
 * @description This example demonstrates the use of 
 * <a href="https://p5js.org/reference/#/p5/loop">loop()</a>
 * and
 * <a href="https://p5js.org/reference/#/p5/noLoop">noLoop()</a>
 * to control the animation loop.
 *
 * Clicking the mouse toggles the animation loop.  If the animation
 * loop is stopped, the user can press any key to advance one frame.
 * 
 * Advancing a single frame is accomplished by calling the
 * <a href="https://p5js.org/reference/#/p5/redraw">redraw()</a>
 * function, which results in a single call to the draw() function.
 *
 */

// Position of the circle
let x = 25;

function setup() {
  // Create the canvas
  createCanvas(720, 400);
 
  // Set the color mode to hue-saturation-brightness (HSB)
  colorMode(HSB);

  // Set the text size
  textSize(20);
}

function draw() {
  // Clear the background
  background(0);

  // Draw a circle, with hue determined by frameCount
  fill(frameCount%256, 255, 255);
  circle(x, height/2, 50);

  // Advance the position
  x += 5;

  // Reset the circle position after it moves off the right side
  if (x > width+25)
    x = -25;

  // Show the value of isLooping()
  text("isLooping(): " + isLooping(), 25, 25);

  describe('circle at x position ' + x + ' moving to the right');
}


function mousePressed() {
  // Start/stop the animation loop
  if (isLooping()) 
    noLoop();
  else 
    loop();
}


function keyPressed() {
  // Draw one frame
  redraw();
}


