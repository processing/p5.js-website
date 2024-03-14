/**
 * @name Animation with Events
 * @description This example demonstrates the use of
 * <a href="https://p5js.org/reference/#/p5/loop">loop()</a>
 * and
 * <a href="https://p5js.org/reference/#/p5/noLoop">noLoop()</a>
 * to pause and resume the animation.
 *
 * Clicking the mouse toggles the animation loop. If the animation
 * loop is stopped, the user can press any key to advance one frame.
 * Note: the user must click to set the focus on the canvas for
 * key presses to be registered.
 *
 * Advancing a single frame is accomplished by calling the
 * <a href="https://p5js.org/reference/#/p5/redraw">redraw()</a>
 * function, which results in a single call to the draw() function.
 *
 */

// Declare variable for the horizontal position of the circle
let x = 25;

function setup() {
  // Create the canvas
  createCanvas(720, 400);

  // Set the color mode to hue-saturation-brightness (HSB)
  colorMode(HSB);

  // Set the text size
  textSize(20);

  // No animation to start
  noLoop();
}

function draw() {
  // Clear the background
  background(0);

  // Draw a circle, with hue determined by frameCount
  fill(x / 3, 90, 90);
  circle(x, height / 2, 50);

  // Increase the x variable by 5
  x += 5;

  // Reset the circle position after it moves off the right side
  if (x > width + 25) {
    x = -25;
  }

  describe('circle moving to the right');
}

function mousePressed() {
  // Start/stop the animation loop
  if (isLooping()) {
    noLoop();
  } else {
    loop();
  }
}

function keyPressed() {
  // Draw one frame
  redraw();
}
