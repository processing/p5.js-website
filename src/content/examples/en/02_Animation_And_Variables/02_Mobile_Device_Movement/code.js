function setup() {
  describe(
    'Available on mobile devices only: a white circle on a black background that moves and changes size based on the movement of the device.'
  );

  // Make the canvas the full width and height of the
  // device's viewport.
  createCanvas(displayWidth, displayHeight);
  background(0);
}

function deviceMoved() {
  // When the device is moved, draw a circle with its position and size
  // based on the direction in which the device is moved.

  // Map acceleration along x axis to position along canvas width
  let x = map(accelerationX, -10, 10, 0, width);

  // Map acceleration along y axis to position along canvas height
  let y = map(accelerationY, -10, 10, 0, height);

  // Map acceleration along z axis to size between 10-100
  let diameter = map(accelerationZ, -10, 10, 10, 100);

  // Use alpha value to fade out previously drawn circles
  background(0, 64);
  noStroke();
  circle(x, y, diameter);
}
