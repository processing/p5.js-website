/*
 * @name Translate
 * @description The 
 * <a href="https://p5js.org/reference/#/p5/translate">translate()</a>
 * function moves the origin of the coordinate system to the specified
 * location.
 *
 * The 
 * <a href="https://p5js.org/reference/#/p5/push">push()</a>
 * and
 * <a href="https://p5js.org/reference/#/p5/pop">pop()</a>
 * functions save and restore the coordinate system, respectively.
 *
 * Note that in this example, rect() is called three times, drawing the
 * rectangle at (0,0) each time in a different coordinate system.
 */

function setup() {
  // Create the canvas
  createCanvas(720, 400);

  // create screen reader accessible description
  describe('Three rectangles drawn on the canvas, one at mouse position');
}

function draw() {
  // Clear the background
  background(0);

  // Draw a green rectangle in the upper left corner
  fill(0, 255, 0);              // set color to green
  rect(0, 0, 200, 50);          // draw at (0,0)

  // Draw a blue rectangle in the middle of the canvas
  push();                       // save current coordinate system
  translate(width/2, height/2); // translate origin to middle of canvas
  fill(0, 0, 255);              // set color to blue
  rect(0, 0, 200, 50);          // draw at (0,0) in new coordinate system
  pop();                        // restore coordinate system

  // Draw orange rectangle at the mouse position
  push();                       // save current coordinate system
  translate(mouseX, mouseY);    // translate origin to mouse position
  fill('orange');               // set color to orange
  rect(0, 0, 200, 50);          // draw at (0,0) in new coordinate system
  pop();                        // restore coordinate system
}


