/*
 * @name Create Graphics
 * @description The <a href="https://p5js.org/reference/#/p5/createGraphics" target="_blank">createGraphics()</a> function can be 
 * used to create a new p5.Graphics object, which can serve as an off-screen graphics buffer within the canvas. 
 */
// Define graphic as a global vairable.
let graphic;

function setup() {
  describe('Black canvas with a very dark grey rectangle in the middle. When the cursor is hovered over the canvas, a white circle follows the cursor in the black areas of the canvas, but not over the dark grey rectangle.');
  createCanvas(710, 400);

  //Create the graphic that will be placed within the canvas.
  // This graphic will be the offscreen buffer.
  graphic = createGraphics(400, 250);
}

function draw() {
  // Create a black rectangle to cover the canvas.
  // Make the rectangle black with an alpha value of 12 so that
  // the white circle following the cursor slowly fades into the background.
  fill(0, 12);
  rect(0, 0, width, height);

  // Create the circle that will follow the cursor as it hovers
  // over the canvas.
  fill(255);
  noStroke();
  ellipse(mouseX, mouseY, 60, 60);

  // Give the buffer a dark grey background.
  // Any shapes within the buffer will have no fill.
  graphic.background(51);
  graphic.noFill();

  // When the cursor hovers over the offscreen buffer, replicate the 
  // circle that is drawn when the cursor is hovering over the 
  // canvas. Within the buffer area, only show the outline of the circle.
  graphic.stroke(255);
  graphic.ellipse(mouseX - 150, mouseY - 75, 60, 60);

  //Draw the buffer to the screen with image().
  image(graphic, 150, 75);
}