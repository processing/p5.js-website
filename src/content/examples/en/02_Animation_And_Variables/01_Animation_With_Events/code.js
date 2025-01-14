// Declare variable for the horizontal position of the circle
let x = 25;

function setup() {
  // Create the canvas
  createCanvas(720, 400);

  // Set the color mode to hue-saturation-brightness (HSB)
  colorMode(HSB);

  // Set the text size
  textSize(20);

  // No animation to start
  noLoop();
}

function draw() {
  // Clear the background
  background(0);

  // Draw a circle, with hue determined by frameCount
  fill(x / 3, 90, 90);
  circle(x, height / 2, 50);

  // Increase the x variable by 5
  x += 5;

  // Reset the circle position after it moves off the right side
  if (x > width + 25) {
    x = -25;
  }

  describe('circle moving to the right');
}

function mousePressed() {
  // Start/stop the animation loop
  if (isLooping()) {
    noLoop();
  } else {
    loop();
  }
}

function keyPressed() {
  // Draw one frame
  redraw();
}
