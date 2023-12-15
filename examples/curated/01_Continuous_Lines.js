/**
 * @name Drawing Lines
 * @description Click and drag the mouse to draw a line.
 *
 * This example demonstrates the use of several built-in
 * variables.
 * <a href="https://p5js.org/reference/#/p5/mouseX">mouseX</a>
 * and
 * <a href="https://p5js.org/reference/#/p5/mouseY">mouseY</a>
 * store the current mouse position, while the
 * previous mouse position is represented by
 * <a href="https://p5js.org/reference/#/p5/pmouseX">pmouseX</a>
 * and
 * <a href="https://p5js.org/reference/#/p5/pmouseY">pmouseY</a>.
 *
 * This example also shows the use of
 * <a href="https://p5js.org/reference/#/p5/colorMode">colorMode</a> with HSB
 * (hue-saturation-brightness), so that the first variable sets the hue.
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

function mouseDragged() {
  // Set the color based on the mouse position, and draw a line
  // from the previous position to the current position
  let lineHue = mouseX - mouseY;
  stroke(lineHue, 90, 90);
  line(pmouseX, pmouseY, mouseX, mouseY);
}
