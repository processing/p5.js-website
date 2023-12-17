/**
 * @name Linear Interpolation
 * @frame 720, 400
 * @description
 * <a href="https://developer.mozilla.org/en-US/docs/Glossary/Interpolation" target="_blank">Interpolation</a>
 * calculates a value between two other values. For example, the number 5 is
 * halfway between 0 and 10. Different types of interpolation uses
 * different rates of change between values. Linear interpolation,
 * abbreviated as lerp, uses a constant rate of change. The
 * <a href="https://p5js.org/reference/#/p5/lerp" target="_blank">lerp()</a>
 * function linearly interpolates between two numbers.
 *
 * Move the mouse across the screen and the symbol will follow.
 * Between drawing each frame of the animation, the ellipse moves part
 * of the distance from its current position toward the cursor.
 */

let x = 0;
let y = 0;

function setup() {
  createCanvas(720, 400);
  noStroke();
  textOutput();
}

function draw() {
  background(51);

  // lerp() calculates a number between two numbers at a specific increment.
  // The amt parameter is the amount to interpolate between the two values
  // where 0.0 equal to the first point, 0.1 is very near the first point, 0.5
  // is half-way in between, etc.

  // Move 5% of the way to the mouse location each frame
  x = lerp(x, mouseX, 0.05);
  y = lerp(y, mouseY, 0.05);

  fill(255);
  stroke(255);
  ellipse(x, y, 66, 66);
}
