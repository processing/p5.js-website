/*
 * @name Video Capture
 * @frame 710,240
 * @description Using the <a href="https://p5js.org/reference/#/p5/createCapture" target="_blank">createCapture()</a> 
 * and <a href="https://p5js.org/reference/#/p5/image" target="_blank">image()</a> functions, you can take a device's 
 * video capture and draw it in the canvas. Since the video capture is passed through the 
 * <a href="https://p5js.org/reference/#/p5/image" target="_blank">image()</a> constructor, you can add filters to the 
 * video capture with the <a href="https://p5js.org/reference/#/p5/filter" target="_blank">filter()</a> method.
 */
// Set the video capture as a global variable.
let capture;

function setup() {
  describe('Video capture from the device webcam.');
  createCanvas(390, 240);

  // Use the createCapture() function to access the device's
  // camera and start capturing video.
  capture = createCapture(VIDEO);

  // Make the capture frame the size of the canvas.
  capture.size(320, 240);
}

function draw() {
  background(255);

  // Draw the resulting video capture on the canvas
  // with the invert filter applied.
  image(capture, 0, 0, 320, 240);
  filter(INVERT);
}