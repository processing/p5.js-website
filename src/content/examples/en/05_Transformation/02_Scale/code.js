function setup() {
  // Create the canvas
  createCanvas(720, 400);

  // Create screen reader accessible description
  textOutput();
}

function draw() {
  // Clear the background
  background(0);

  // Draw blue square
  // Save current coordinate system
  push();

  // Scale by 2
  scale(2);

  // Set color to blue
  fill(33, 89, 194);

  // Draw square at origin, size 200
  square(0, 0, 200);

  // Restore coordinate system
  pop();

  // Draw white square
  // Set color to white
  fill(255);

  // Draw square at origin, size 200
  square(0, 0, 200);

  // Draw green square
  // Save current coordinate system
  push();

  // Scale by .5 in x and .75 in y
  scale(0.5, 0.75);

  // Set color to green
  fill(42, 150, 60);

  // Draw square at origin, size 200
  square(0, 0, 200);

  // Restore coordinate system
  pop();
}
