/*
 * @name Acceleration Color
 * @description You can use the <a href="https://p5js.org/reference/#/p5/deviceMoved" target="_blank">deviceMoved()</a> 
 * function to detect when the phone is rotated, and update the background color of the canvas. The background color is mapped to the 
 * <a href="https://p5js.org/reference/#/p5/accelerationX" target="_blank">accelerationX</a>, 
 * <a href="https://p5js.org/reference/#/p5/accelerationY" target="_blank">accelerationY</a>, 
 * and <a href="https://p5js.org/reference/#/p5/accelerationZ" target="_blank">accelerationZ</a> values. 
 * The <a href="https://p5js.org/reference/#/p5/deviceMoved" target="_blank">deviceMoved()</a> function is 
 * available for mobile devices only.
 */
// Establish the global variables: redValue, greenValue, and blueValue.
let redValue, greenValue, blueValue;

function setup() {
  describe('Canvas available on mobile devices only. Canvas with a background color that changes based on the movement of the device.');

  // Make the canvas the full width and height of the 
  // device's viewport.
  createCanvas(displayWidth, displayHeight);

  // Set the redValue, greenValue, and blueValue variables to 
  //random hue values.
  redValue = random(50, 255);
  greenValue = random(0, 200);
  blueValue = random(50, 255);
}

function draw() {
  // Set the canvas background to the hue values.
  background(redValue, greenValue, blueValue);
}

function deviceMoved() {
  // When the device is moved, update the canvas' color
  // based on the direction in which the device is moved.

  // If the device is moved along the X axis, re-map the red value.
  redValue = map(accelerationX, -90, 90, 100, 175);

  // If the device is moved along the Y axis, re-map the green value.
  greenValue = map(accelerationY, -90, 90, 100, 200);

  // If the device is moved along the Z axis, re-map the blue value.
  blueValue = map(accelerationZ, -90, 90, 100, 200);
}