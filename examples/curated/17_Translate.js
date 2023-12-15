/**
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
 * functions save and restore the coordinate system and various
 * other drawing settings, such as the fill color.
 *
 * Note that in this example, we draw the shapes (rectangle and
 * circle) each time in a different coordinate system.
 */

function setup() {
  // Create the canvas
  createCanvas(720, 400);

  // Create screen reader accessible description
  textOutput();
}

function draw() {
  // Clear the background
  background(0);

  // Draw shapes (rectangle and circle) in the upper left corner
  // Set fill color to green
  fill(90, 189, 60);
  rect(0, 0, 200, 50);
  circle(225, 25, 50);

  // Draw shapes in the middle of the canvas

  // Save current coordinate system and color
  push();

  // Translate origin to middle of canvas
  translate(width / 2, height / 2);

  // Set fill color to blue
  fill(57, 102, 191);

  // Draw at (0,0) in new coordinate system
  rect(0, 0, 200, 50);
  circle(225, 25, 50);

  // Restore coordinate system and color
  pop();

  // Draw shapes at the mouse position
  push();
  translate(mouseX, mouseY);
  rect(0, 0, 200, 50);
  circle(225, 25, 50);
  pop();
}
