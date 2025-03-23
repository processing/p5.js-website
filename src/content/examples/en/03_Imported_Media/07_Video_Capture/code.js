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
  // Set the background to gray.
  background(51);

  // Draw the resulting video capture on the canvas
  // with the invert filter applied.
  image(capture, 0, 0, 360, 400);
  filter(INVERT);
}
