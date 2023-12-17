/**
 * @name Aim
 * @description The
 * <a href="https://p5js.org/reference/#/p5/atan2" target="_blank">atan2()</a>
 * function calculates the angle between two positions. The angle it
 * calculates can be used to rotate a shape toward something. In this
 * example, the eyes rotate to look at the cursor.
 */

function setup() {
  createCanvas(400, 400);
  colorMode(HSB);

  // Set angle mode so that atan2() returns angles in degrees
  angleMode(DEGREES);

  describe('Two eyes that follow the cursor.');
}

function draw() {
  background(0);

  // Draw left eye

  let leftX = 150;
  let leftY = 200;

  // Calculate angle between left eye and mouse
  let leftAngle = atan2(mouseY - leftY, mouseX - leftX);

  push();
  translate(leftX, leftY);
  fill(255);
  ellipse(0, 0, 50, 50);
  rotate(leftAngle);
  fill(0);
  ellipse(12.5, 0, 25, 25);
  pop();

  // Draw right eye

  let rightX = 250;
  let rightY = 200;

  // Calculate angle between right eye and angle
  let rightAngle = atan2(mouseY - rightY, mouseX - rightX);

  push();
  translate(rightX, rightY);
  fill(255);
  ellipse(0, 0, 50, 50);
  rotate(rightAngle);
  fill(0);
  ellipse(12.5, 0, 25, 25);
  pop();
}
