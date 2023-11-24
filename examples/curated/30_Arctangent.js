/*
 * @name Arctangent
 * @description The 
 * <a href="https://p5js.org/reference/#/p5/atan2">atan2()</a>
 * function calcuates the angle formed by the specified point,
 * the origin, and the positive x-axis (in the direction of the
 * positive y-axis).
 *
 * Move the mouse to see the angle formed between the mouse position,
 * the origin (upper left corner), and the positive x-axis (top edge
 * of the canvas).  
 *
 * atan2() is also used to change the direction of the eyes.
 */

function setup() {
  createCanvas(400, 400);
  colorMode(HSB);

  // Set angle mode so that atan2() returns angles in degrees
  angleMode(DEGREES);

  describe('A demonstration of the atan2 function, with two eyes that follow the mouse.');
}


function draw() {
  background(0);

  // Calculate and display angle value calculated with atan2()

  let angle = atan2(mouseY, mouseX);

  fill(255);
  textSize(20);
  text("angle: " + round(angle), mouseX + 20, mouseY + 20);

  // Draw line and arc to indicate the angle

  stroke(128);
  line(0, 0, mouseX, mouseY);

  fill(angle, 255, 255); // angle determines hue
  arc(0, 0, 100, 100, 0, angle);

  // Draw left eye

  push();
  translate(150, 200);
  fill(255);
  ellipse(0, 0, 50, 50);
  rotate(atan2(mouseY - 200, mouseX - 150));
  fill(0);
  ellipse(12.5, 0, 25, 25);
  pop();

  // Draw right eye

  push();
  translate(250, 200);
  fill(255);
  ellipse(0, 0, 50, 50);
  rotate(atan2(mouseY - 200, mouseX - 250));
  fill(0);
  ellipse(12.5, 0, 25, 25);
  pop();
}


