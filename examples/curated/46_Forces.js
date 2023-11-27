/*
 * @name Forces
 * @description Demonstration of multiple force acting on bodies.
 * Bodies experience gravity continuously.Bodies experience fluid 
 * resistance when in "water".
 * (<a href="http://natureofcode.com">natureofcode.com</a>)
 */

// Array to store the moving bodies
let movers = [];

// Liquid object
let liquid;

function setup() {
  createCanvas(640, 360);
  colorMode(HSB, 9, 100, 100);
  reset();

  // Create liquid object
  liquid = new Liquid(0, height/2, width, height/2, 0.1);

  describe('9 grey balls drop from the top of the window and slow down as they reach the bottom half of the screen.');
}

function draw() {
  background(0);

  // Draw water
  liquid.display();

  for (let i = 0; i < movers.length; i++) {
    // Is the Mover in the liquid?
    if (liquid.contains(movers[i])) {
      // Calculate drag force
      let dragForce = liquid.calculateDrag(movers[i]);
      // Apply drag force to Mover
      movers[i].applyForce(dragForce);
    }

    // Gravity is scaled by mass here!
    let gravity = createVector(0, 0.1 * movers[i].mass);
    // Apply gravity
    movers[i].applyForce(gravity);

    // Update and display
    movers[i].update();
    movers[i].display();
    movers[i].checkEdges();
  }
}


function mousePressed() {
  reset();
}


// Restart all the Mover objects randomly
function reset() {
  for (let i = 0; i < 9; i++) {
    movers[i] = new Mover(random(0.5, 3), 40 + i * 70, 0, color(i, 100, 100));
  }
}


class Liquid {

    constructor(x, y, w, h, c) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.c = c;
    };

    // Is the Mover in the Liquid?
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
      // Magnitude is coefficient * speed squared
      let speed = m.velocity.mag();
      let dragMagnitude = this.c * speed * speed;

      // Direction is inverse of velocity
      let dragForce = m.velocity.copy();
      dragForce.mult(-1);

      // Scale according to magnitude
      // dragForce.setMag(dragMagnitude);
      dragForce.normalize();
      dragForce.mult(dragMagnitude);
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

    // Newton's 2nd law: F = M * A
    // or A = F / M
    applyForce(force) {
      let f = p5.Vector.div(force, this.mass);
      this.acceleration.add(f);
    }

    update() {
      // Velocity changes according to acceleration
      this.velocity.add(this.acceleration);
      // position changes by velocity
      this.position.add(this.velocity);
      // We must clear acceleration each frame
      this.acceleration.mult(0);
    }

    display() {
      stroke(0);
      strokeWeight(2);
      fill(this.color);
      ellipse(this.position.x, this.position.y, this.mass * 16, this.mass * 16);
    }

    // Bounce off bottom of window
    checkEdges() {
      if (this.position.y > height - this.mass * 8) {
        // A little dampening when hitting the bottom
        this.velocity.y *= -0.9;
        this.position.y = height - this.mass * 8;
      }
    }
} // class Mover


