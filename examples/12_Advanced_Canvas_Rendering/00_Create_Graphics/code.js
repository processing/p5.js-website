// Define graphic as a global variable. This variable
// will be the offscreen buffer.
let graphic;

function setup() {
  describe(
    'Black canvas with a very dark grey rectangle in the middle. When the cursor is hovered over the canvas, a white circle follows the cursor in the black areas of the canvas, but not over the dark grey rectangle.'
  );
  createCanvas(720, 400);

  // Create the graphic that will be placed within the canvas.
  graphic = createGraphics(405, 250);
}

function draw() {
  // Create a black rectangle to cover the canvas.
  // Make the rectangle black with an alpha value of 12 so that
  // the white circle following the cursor slowly fades into the background.
  background(0, 12);

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

  // Draw the buffer to the screen with image().
  image(graphic, 150, 75);
}
