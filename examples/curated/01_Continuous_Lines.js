/*
 * @name Continuous Lines
 * @description Click and drag the mouse to draw a line.
 *
 * This example demonstrates the use of several built-in
 * variables.  
 * <a href="https://p5js.org/reference/#/p5/mouseX">mouseX</a>
 * and
 * <a href="https://p5js.org/reference/#/p5/mouseY">mouseY</a>
 * can be used to obtain the current mouse position, while the
 * previous mouse position is represented by
 * <a href="https://p5js.org/reference/#/p5/pmouseX">pmouseX</a>
 * and
 * <a href="https://p5js.org/reference/#/p5/pmouseY">pmouseY</a>.
 * 
 * The 
 * <a href="https://p5js.org/reference/#/p5/mouseIsPressed">mouseIsPressed</a>.
 * indicates whether the user is currently pressing the mouse, and
 * <a href="https://p5js.org/reference/#/p5/frameCount">frameCount</a>
 * indicates how many frames have been drawn.
 * 
 * This example also shows the use of 
 * <a href="https://p5js.org/reference/#/p5/colorMode">colorMode</a> with HSB
 * (hue-saturation-brightness), so that the first variable sets the hue.  
 * The 
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder">remainder</a>
 * operator is used (frameCount%256) to obtain a number between 0 and 255,
 * so that the hue changes each frame.
 *
 */
function setup() {
  // Create the canvas
  createCanvas(710, 400);

  // Set background to black
  background(0);

  // Set width of the lines
  strokeWeight(10);

  // Set color mode to hue-saturation-value (HSB)
  colorMode(HSB);

  // Set screen reader accessible description
  describe('A blank canvas where the user draws by dragging the mouse');
}

function draw() {
  // Change the hue with each frame
  stroke(frameCount%256, 255, 255);

  // If the mouse button is pressed, draw a line from 
  // previous mouse position to current mouse position
  if (mouseIsPressed === true) {
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}


