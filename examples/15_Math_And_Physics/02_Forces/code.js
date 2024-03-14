// Declare array to store the moving bodies
let movers = [];

// Declare variable for the Liquid object
let liquid;

function setup() {
  createCanvas(720, 400);
  colorMode(HSB, 9, 100, 100);
  initializeMovers();

  // Create Liquid object
  liquid = new Liquid(0, height / 2, width, height / 2, 0.1);

  describe(
    'Nine grey balls drop from the top of the canvas and slow down as they reach the bottom half of the canvas.'
  );
}

function draw() {
  background(20);

  // Draw water
  liquid.display();

  for (let mover of movers) {
    // Check whether the mover is in the liquid
    if (liquid.contains(mover)) {
      // Calculate drag force
      let dragForce = liquid.calculateDrag(mover);

      // Apply drag force to Mover
      mover.applyForce(dragForce);
    }

    // Gravitational force is proportional to the mass
    let gravity = createVector(0, 0.1 * mover.mass);

    // Apply gravitational force
    mover.applyForce(gravity);

    // Update and display
    mover.update();
    mover.display();
    mover.checkEdges();
  }
}

function mousePressed() {
  initializeMovers();
}

function initializeMovers() {
  // Calculate the spacing based on the width of the canvas
  let xSpacing = width / 9;

  // Fill the movers array with 9 Mover objects with random masses
  for (let i = 0; i < 9; i += 1) {
    let mass = random(0.5, 3);
    let xPosition = xSpacing * i + xSpacing / 2;
    movers[i] = new Mover(mass, xPosition, 0, color(i, 100, 100));
  }
}

class Liquid {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;
  }

  // Check whether the Mover in the Liquid
  contains(m) {
    let l = m.position;
    return (
      l.x > this.x &&
      l.x < this.x + this.w &&
      l.y > this.y &&
      l.y < this.y + this.h
    );
  }

  // Calculate drag force
  calculateDrag(m) {
    // The drag force magnitude is coefficient * speed squared
    let speed = m.velocity.mag();
    let dragMagnitude = this.c * speed * speed;

    // Create the drag force vector (opposite direction of velocity)
    let dragForce = m.velocity.copy();
    dragForce.mult(-1);

    // Scale the drag force vector to the magnitude calculated above
    dragForce.setMag(dragMagnitude);

    return dragForce;
  }

  display() {
    noStroke();
    fill(50);
    rect(this.x, this.y, this.w, this.h);
  }
} // class Liquid

class Mover {
  constructor(m, x, y, c) {
    this.mass = m;
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.color = c;
  }

  // Apply force according to Newton's 2nd law: F = M * A
  // or A = F / M
  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    // Change the velocity by the acceleration
    this.velocity.add(this.acceleration);

    // Change the position by the velocity
    this.position.add(this.velocity);

    // Clear the acceleration each frame
    this.acceleration.mult(0);
  }

  display() {
    stroke(0);
    strokeWeight(2);
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.mass * 16, this.mass * 16);
  }

  // Make the balls bounce at the bottom
  checkEdges() {
    if (this.position.y > height - this.mass * 8) {
      // A little dampening when hitting the bottom
      this.velocity.y *= -0.9;
      this.position.y = height - this.mass * 8;
    }
  }
} // class Mover
