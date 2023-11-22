/*
 * @name Acceleration Color
 * @description Use deviceMoved() to detect when the device is rotated. The background RGB color values are mapped to accelerationX, accelerationY, and accelerationZ values. [on mobile devices only, instructions on mobile stuff, note on browsers?]
 */


//Establish your global variables: red, green, and blue.
let red, geen, blue;

function setup() {
  //Make the canvas the full width and height of the 
  //device's viewport.
  createCanvas(displayWidth, displayHeight);

  //Set the red, green, and blue variables to random values.
  red = random(50, 255);
  green = random(0, 200);
  blue = random(50, 255);
}

function draw() {
  //Set the canvas background to the red, green and blue values.
  background(r, g, b);
}

function deviceMoved() {
  //When your device is moved, update the canvas' color
  //based on the direction in which the device is moved.

  //If the device is moved along the X axis, re-map the red value.
  red = map(accelerationX, -90, 90, 100, 175);

  //If the device is moved along the Y axis, re-map the green value.
  green = map(accelerationY, -90, 90, 100, 200);

  //If the device is moved along the Z axis, re-map the blue value.
  blue = map(accelerationZ, -90, 90, 100, 200);
}