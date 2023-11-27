/*
 * @name Non Orthogonal Reflection
 * @description This example demonstrates a ball bouncing on a slanted
 * surface, implemented using vector calculations for reflection.
 */

// Position of left and right sides of floor
let base1;
let base2;
let baseColor;

// Variables related to moving ball
let position;
let velocity;
let radius = 6;
let speed = 3.5;
let circleColor;


function setup() {
  createCanvas(710, 400);
  colorMode(HSB);

  base1 = createVector(0, height - 150);
  base2 = createVector(width, height);
  setColors();

  // Set initial position to middle of canvas
  position = createVector(width/2, height/2);

  // Set the velocity with a random direction
  velocity = p5.Vector.random2D();
  velocity.mult(speed);

  // Create screen reader accessible description
  describe('A bouncing ball simulation demonstrating the use of vectors for reflection.');
}


function setColors() {
  // Choose random hues
  baseColor = color(random(256), 255, 255);
  circleColor = color(random(256), 255, 255);
}


function draw() {

  // Clear background, using alpha for fade effect
  fill(0, 12);
  noStroke();
  rect(0, 0, width, height);

  // Draw the base
  fill(baseColor);
  quad(base1.x, base1.y, base2.x, base2.y, width, height, 0, height);

  // Draw the circle
  fill(circleColor);
  circle(position.x, position.y, 2*radius);

  // Move the circle
  position.add(velocity);

  // Handle collisions
  handleBaseCollision();
  handleBoundaryCollision();
}


function handleBaseCollision() {
  // Calculate the normal vector and intercept for the base line
  let baseDirection = p5.Vector.sub(base2, base1);
  baseDirection.normalize();
  let normal = createVector(baseDirection.y, -baseDirection.x);
  let intercept = base1.dot(normal);

  // Detect and handle collision with base
  if (position.dot(normal) < intercept) {
    // Calculate the reflected velocity vector: v -= 2 * v.dot(n) * n
    let dot = velocity.dot(normal);
    let bounce = p5.Vector.mult(normal, 2*dot);
    velocity.sub(bounce);

    // Draw the normal vector at collision point
    stroke(255);
    line(position.x, position.y,
      position.x + normal.x * 100, position.y + normal.y * 100
    );
  }
}


function handleBoundaryCollision() {
  // Handle side bounce
  if (position.x < radius || position.x > width-radius) {
    velocity.x *= -1;
  }

  // Handle top bounce
  if (position.y < radius) {
    velocity.y *= -1;

    // Randomize base and colors
    base1.y = random(height - 100, height);
    base2.y = random(height - 100, height);
    setColors();
  }
}

