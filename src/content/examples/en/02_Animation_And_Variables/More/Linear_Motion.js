/*
 * @name Linear
 * @arialabel Horizontal white line on a black background traveling from the bottom to the top of the screen parallel to the x axis
 * @frame 720,400
 * @description Changing a variable to create a moving line.
 * When the line moves off the edge of the window,
 * the variable is set to 0, which places the line back at the bottom of the screen.
 */

let a;

function setup() {
  createCanvas(720, 400);
  stroke(255);
  a = height / 2;
}

function draw() {
  background(51);
  line(0, a, width, a);
  a = a - 0.5;
  if (a < 0) {
    a = height;
  }
}
