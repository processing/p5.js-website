// Define the global variables: img, offset, and easing.
// Set offset to 0 and easing to 0.05 for moving the
// transparent image with the cursor position.
let img;
let offset = 0;
let easing = 0.05;

function preload() {
  // Load the bottom image from the canvas's assets directory.
  img = loadImage('assets/moonwalk.jpg');
}

function setup() {
  describe(
    "An astronaut on a planet as the background with a slightly transparent version of this image on top that moves with the horizontal direction of the user's mouse."
  );

  createCanvas(720, 400);
}

function draw() {
  // Display the bottom image at full opacity.
  tint(255, 255);
  image(img, 0, 0);

  // Define dx as the rate at which the top image
  // moves with the cursor. The offset variable
  // delays the movement of the image.
  let dx = mouseX - img.width / 2 - offset;
  offset += dx * easing;

  // Display the top image at half opacity.
  tint(255, 127);
  image(img, offset, 0);
}
