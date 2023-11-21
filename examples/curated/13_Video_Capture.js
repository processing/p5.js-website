/*
 * @name Video Capture
 * @arialabel Takes feed from the user’s computer camera and displays it in the window
 * @frame 710,240
 * @description Capture video from the webcam and display
 * on the canvas as well with invert filter. Note that by
 * default the capture feed shows up, too. 
 */
//Set capture as a global variable.
let capture;

function setup() {
  createCanvas(390, 240);

  //Use the createCapture() function to access the device's
  //camera and start capturing video.
  capture = createCapture(VIDEO);

  //Make the capture size the size of the canvas.
  capture.size(320, 240);
}

function draw() {
  background(255);

  //Draw the resulting video capture on the canvas,
  //with the invert filter applied.
  image(capture, 0, 0, 320, 240);
  filter(INVERT);
}