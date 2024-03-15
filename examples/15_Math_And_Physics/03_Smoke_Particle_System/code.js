// Declare variables for the particle system and texture
let particleTexture;
let particleSystem;

function preload() {
  particleTexture = loadImage('assets/particle_texture.png');
}

function setup() {
  // Set the canvas size
  createCanvas(720, 400);
  colorMode(HSB);

  // Initialize the particle system
  particleSystem = new ParticleSystem(
    0,
    createVector(width / 2, height - 60),
    particleTexture
  );

  describe(
    'White circle gives off smoke in the middle of the canvas, with wind force determined by the cursor position.'
  );
}

function draw() {
  background(20);

  // Calculate the wind force based on the mouse x position
  let dx = map(mouseX, 0, width, -0.2, 0.2);
  let wind = createVector(dx, 0);

  // Apply the wind and run the particle system
  particleSystem.applyForce(wind);
  particleSystem.run();
  for (let i = 0; i < 2; i += 1) {
    particleSystem.addParticle();
  }

  // Draw an arrow representing the wind force
  drawVector(wind, createVector(width / 2, 50, 0), 500);
}

// Display an arrow to show a vector magnitude and direction
function drawVector(v, loc, scale) {
  push();
  let arrowSize = 4;
  translate(loc.x, loc.y);
  stroke(255);
  strokeWeight(3);
  rotate(v.heading());

  let length = v.mag() * scale;
  line(0, 0, length, 0);
  line(length, 0, length - arrowSize, +arrowSize / 2);
  line(length, 0, length - arrowSize, -arrowSize / 2);
  pop();
}

class ParticleSystem {
  constructor(particleCount, origin, textureImage) {
    this.particles = [];

    // Make a copy of the input vector
    this.origin = origin.copy();
    this.img = textureImage;
    for (let i = 0; i < particleCount; ++i) {
      this.particles.push(new Particle(this.origin, this.img));
    }
  }

  run() {
    // Loop through and run each particle
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      let particle = this.particles[i];
      particle.run();

      // Remove dead particles
      if (particle.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Apply force to each particle
  applyForce(dir) {
    for (let particle of this.particles) {
      particle.applyForce(dir);
    }
  }

  addParticle() {
    this.particles.push(new Particle(this.origin, this.img));
  }
} // class ParticleSystem

class Particle {
  constructor(pos, imageTexture) {
    this.loc = pos.copy();

    let xSpeed = randomGaussian() * 0.3;
    let ySpeed = randomGaussian() * 0.3 - 1.0;

    this.velocity = createVector(xSpeed, ySpeed);
    this.acceleration = createVector();
    this.lifespan = 100.0;
    this.texture = imageTexture;
    this.color = color(frameCount % 256, 255, 255);
  }

  // Update and draw the particle
  run() {
    this.update();
    this.render();
  }

  // Draw the particle
  render() {
    imageMode(CENTER);
    tint(this.color, this.lifespan);
    image(this.texture, this.loc.x, this.loc.y);
  }

  applyForce(f) {
    // Add the force vector to the current acceleration vector
    this.acceleration.add(f);
  }

  isDead() {
    return this.lifespan <= 0.0;
  }

  // Update the particle's position, velocity, lifespan
  update() {
    this.velocity.add(this.acceleration);
    this.loc.add(this.velocity);
    this.lifespan -= 2.5;

    // Set the acceleration to zero
    this.acceleration.mult(0);
  }
} // class Particle
