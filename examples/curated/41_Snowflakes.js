/**
 * @name Snowflakes
 * @description This example demonstrates the use of a particle system
 * to simulate the motion of falling snowflakes.  This program defines a
 * snowflake 
 * <a href="https://p5js.org/reference/#/p5/class">class</a>, 
 * and uses an array to hold the snowflake objects.
 */


// Define array to hold snowflake objects
let snowflakes = []; 


function setup() {
  createCanvas(400, 600);
}


function draw() {

  background(0);

  // Create a random number of snowflakes each frame
  for (let i = 0; i < random(5); i++) {
    // Add a new snowflake object to the array
    snowflakes.push(new snowflake());
  }

  // Update and display each snowflake in the array
  let currentTime = frameCount/60;

  for (let flake of snowflakes) {
    // Update each snowflake position and display
    flake.update(currentTime);
    flake.display();
  }
}


// Define the snowflake class

class snowflake {

  constructor() {
      this.posX = 0;
      this.posY = random(-50, 0);
      this.initialangle = random(0, 2 * PI);
      this.size = random(2, 5);
      this.radius = sqrt(random(pow(width / 2, 2)));
      this.color = color(random(200,256), random(200,256), random(200,256));
  }

  update(time) {
    // x position follows a sine wave
    let w = 0.6; // angular speed
    let angle = w * time + this.initialangle;
    this.posX = width / 2 + this.radius * sin(angle);

    // Different size snowflakes fall at slightly different y speeds
    this.posY += pow(this.size, 0.5);

    // Delete snowflake if past end of screen
    if (this.posY > height) {
      let index = snowflakes.indexOf(this);
      snowflakes.splice(index, 1);
    }
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.posX, this.posY, this.size);
  }
}


