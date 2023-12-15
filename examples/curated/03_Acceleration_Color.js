/**
 * @name Acceleration Color
 * @description The <a href="https://p5js.org/reference/#/p5/deviceMoved" target="_blank">deviceMoved()</a>
 * function runs when the mobile device displaying the sketch moves.
 * In this example, the
 * <a href="https://p5js.org/reference/#/p5/accelerationX" target="_blank">accelerationX</a>,
 * <a href="https://p5js.org/reference/#/p5/accelerationY" target="_blank">accelerationY</a>,
 * and <a href="https://p5js.org/reference/#/p5/accelerationZ" target="_blank">accelerationZ</a>
 * values set the position and size of a circle.
 * This only works for mobile devices.
 */
// Establish the global variables: redValue, greenValue, and blueValue.

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
  // When the device is moved, update the canvas' color
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
