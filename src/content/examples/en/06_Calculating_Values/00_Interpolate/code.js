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
  // where 0.0 is equal to the first point, 0.1 is very near the first point, 0.5
  // is halfway in between, etc.

  // Move 5% of the way to the mouse location each frame
  x = lerp(x, mouseX, 0.05);
  y = lerp(y, mouseY, 0.05);

  fill(255);
  stroke(255);
  ellipse(x, y, 66, 66);
}
