// Declare variables for position of left and right sides of floor
let baseLeft;
let baseRight;
let baseColor;

// Declare variables related to moving ball
let position;
let velocity;
let radius = 6;
let speed = 3.5;
let circleColor;


function setup() {
  createCanvas(710, 400);
  colorMode(HSB, 360, 100, 100);

  baseLeft = createVector(0, height - 150);
  baseRight = createVector(width, height);
  setColors();

  // Set initial position to middle of canvas
  position = createVector(width/2, height/2);

  // Set the velocity with a random direction
  velocity = p5.Vector.random2D();
  velocity.mult(speed);

  // Create screen reader accessible description
  describe('A simulation of a ball bouncing on slanted surfaces.');
}


function setColors() {
  // Choose random hues
  baseColor = color(random(30, 180), 70, 70);
  circleColor = color(random(30, 180), 90, 90);
}


function draw() {

  // Clear background, using alpha for fade effect
  background(30, 50);
  frameRate(30);

  // Draw the base
  fill(baseColor);
  noStroke();
  quad(baseLeft.x, baseLeft.y, baseRight.x, baseRight.y, width, height, 0, height);

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
  let baseDirection = p5.Vector.sub(baseRight, baseLeft);
  baseDirection.normalize();
  let normal = createVector(baseDirection.y, -baseDirection.x);
  let intercept = baseLeft.dot(normal);

  // Detect and handle collision with base
  if (position.dot(normal) < intercept) {
    // Calculate the reflected velocity vector: v -= 2 * v.dot(n) * n
    let dot = velocity.dot(normal);
    let bounce = p5.Vector.mult(normal, 2*dot);
    velocity.sub(bounce);

    // Draw the normal vector at collision point
    stroke(255);
    strokeWeight(5);
    line(position.x, position.y,
      position.x + normal.x * 100, position.y + normal.y * 100
    );
  }
}


function handleBoundaryCollision() {
  // Handle side bounce:  
  //
  // If the ball has reached the left wall
  // or the ball has reached the right wall,
  // bounce by negating the ball's x velocity.
  //
  // Note: the ball's y velocity is unchanged when it hits
  // the side wall.
  
  if (position.x < radius || position.x > width-radius) {
    velocity.x *= -1;
  }

  // Handle top bounce:
  // If the ball has reached the top, bounce by negating
  // its y velocity.
  if (position.y < radius) {
    velocity.y *= -1;

    // Randomize base and colors
    baseLeft.y = random(height - 100, height);
    baseRight.y = random(height - 100, height);
    setColors();
  }
}

