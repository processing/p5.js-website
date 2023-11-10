/*
 * @name Arctangent
 * @arialabel Three white circles have smaller green circles within them resembling eyes where the pupil, represented by the green circle, looks in the direction of where the user’s mouse is
 * @description Move the mouse to change the direction of the eyes.<br>The atan2() function computes the angle from each eye to the cursor.
 */
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0);

  push();
  translate(150, 200);
  fill(255);
  ellipse(0, 0, 50, 50);
  rotate(atan2(mouseY - 200, mouseX - 150));
  fill(0);
  ellipse(12.5, 0, 25, 25);
  pop();

  push();
  translate(250, 200);
  fill(255);
  ellipse(0, 0, 50, 50);
  rotate(atan2(mouseY - 200, mouseX - 250));
  fill(0);
  ellipse(12.5, 0, 25, 25);
  pop();
}
