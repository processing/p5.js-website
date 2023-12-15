/**
 * @name Video Capture
 * @frame 710,240
 * @description Using the <a href="https://p5js.org/reference/#/p5/createCapture" target="_blank">createCapture()</a>
 * and <a href="https://p5js.org/reference/#/p5/image" target="_blank">image()</a> functions, you can take a device's
 * video capture and draw it in the canvas. Since the video capture is passed through the
 * <a href="https://p5js.org/reference/#/p5/image" target="_blank">image()</a> constructor, you can add filters to the
 * video capture with the <a href="https://p5js.org/reference/#/p5/filter" target="_blank">filter()</a> method.
 * For different strategies for uploading, presenting, or styling videos, visit the
 * <a href="https://p5js.org/examples/dom-video.html" target="_blank">Video</a> and
 * <a href="https://p5js.org/examples/dom-video-canvas.html" target="_blank">Video Canvas</a> examples.
 */
// Set the video capture as a global variable.
let capture;

function setup() {
  describe('Video capture from the device webcam.');
  createCanvas(720, 400);

  // Use the createCapture() function to access the device's
  // camera and start capturing video.
  capture = createCapture(VIDEO);

  // Make the capture frame half of the canvas.
  capture.size(360, 200);

  // Use capture.hide() to remove the p5.Element object made
  // using createCapture(). The video will instead be rendered as
  // an image in draw().
  capture.hide();
}

function draw() {
  //Set the background to gray.
  background(51);

  // Draw the resulting video capture on the canvas
  // with the invert filter applied.
  image(capture, 0, 0, 360, 400);
  filter(INVERT);
}
