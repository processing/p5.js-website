// Declare variables for the position and color of the circle

let circleX;
let circleY;
let circleColor;

function setup() {
  createCanvas(710, 400);

  // Set the initial position and color of the circle
  setPositionAndColor();

  describe(
    'A circle whose position and color change randomly when the user clicks the canvas.'
  );
}

function setPositionAndColor() {
  // Set the position to a random value (within the canvas)
  circleX = random(0, width);
  circleY = random(0, height);

  // Set R, G, and B to random values in the range (100, 256)
  circleColor = color(random(100, 256), random(100, 256), random(100, 256));
}

function draw() {
  background(10);

  // Draw a circle at (x,y) with color c
  fill(circleColor);
  circle(circleX, circleY, 100);
}

function mousePressed() {
  // On mouse press (re)set the position and color
  setPositionAndColor();
}
