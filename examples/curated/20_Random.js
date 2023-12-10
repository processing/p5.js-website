/**
 * @name Random
 * @arialabel Various shades of grey bars change patterns randomly every half a second
 * @description Random numbers create the basis of this image.
 * Each time the program is loaded the result is different.
 */
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
  x = random(0, width);
  y = random(0, height);

  // Set R, G, and B to random values in the range [100, 256)
  c = color(random(100, 256), random(100, 256), random(100, 256));
}

function draw() {
  background(10);

  // Draw a circle at (x,y) with color c
  fill(c);
  circle(x, y, 100);
}

function mousePressed() {
  // On mouse press (re)set the position and color
  setPositionAndColor();
}
