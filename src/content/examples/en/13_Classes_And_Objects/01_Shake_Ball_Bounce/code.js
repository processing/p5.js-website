// Define the global variables.
// The balls variable will contain all the
// balls in the canvas.
let balls = [];

// The threshold variable will be used to check
// if the mobile device has been moved enough to
// initiate a response.
let threshold = 30;

// accChangeX and accChangeY will measure the acceleration
// when the mobile device is moved.
let accChangeX = 0;
let accChangeY = 0;

// accChangeT will be used to calculate the overall change
// for the mobile device's position.
let accChangeT = 0;

function setup() {
  describe(
    'Twenty circles that bounce around in the canvas whenever the mobile device is tilted.'
  );

  // Create a canvas that fills the entire viewport display.
  createCanvas(displayWidth, displayHeight);

  // Create 20 instances of the Ball class.
  for (let i = 0; i < 20; i++) {
    balls.push(new Ball());
  }
}

function draw() {
  background(0);

  // For each ball created, move the ball
  // in response to the measurements gathered
  // by the checkForShake() function.
  for (let i = 0; i < balls.length; i++) {
    balls[i].move();
    balls[i].display();
  }
  checkForShake();
}

function checkForShake() {
  // Calculate the total change for accelerationX and accelerationY.
  accChangeX = abs(accelerationX - pAccelerationX);
  accChangeY = abs(accelerationY - pAccelerationY);

  // Calculate the overall change in the mobile device's acceleration.
  accChangeT = accChangeX + accChangeY;

  // If the overall change meets or is greater than the threshold,
  // call the shake() and turn() methods and change the direction
  // and speed of each ball.
  if (accChangeT >= threshold) {
    for (let i = 0; i < balls.length; i++) {
      balls[i].shake();
      balls[i].turn();
    }
  }
  // If the overall change doesn't meet the threshold,
  // gradually slow down the ball movement.
  else {
    for (let i = 0; i < balls.length; i++) {
      balls[i].stopShake();
      balls[i].turn();
      balls[i].move();
    }
  }
}

// Create the Ball class.
class Ball {
  constructor() {
    // Make each ball created have a random size, speed, and starting
    // placement in the canvas.
    this.x = random(width);
    this.y = random(height);
    this.diameter = random(10, 30);
    this.xspeed = random(-2, 2);
    this.yspeed = random(-2, 2);
    this.direction = 0.7;

    // oxspeed will be used to calculate the decrease in speed in the
    // stopShake() method.
    this.oxspeed = this.xspeed;
    this.oyspeed = this.yspeed;
  }

  // Whenever the ball's move() method is called,
  // multiply its speed and direction of movement
  // and have that equal its new placement in the canvas.
  move() {
    this.x += this.xspeed * this.direction;
    this.y += this.yspeed * this.direction;
  }

  // If the ball ever touches the edge of the canvas,
  // have it bounce off the edge.
  turn() {
    if (this.x < 0) {
      this.x = 0;
      this.direction = -this.direction;
    } else if (this.y < 0) {
      this.y = 0;
      this.direction = -this.direction;
    } else if (this.x > width - 20) {
      this.x = width - 20;
      this.direction = -this.direction;
    } else if (this.y > height - 20) {
      this.y = height - 20;
      this.direction = -this.direction;
    }
  }

  // Whenever the ball's shake() method is called,
  // add to the speed of the ball based on
  // the change in the accelerationX value.
  shake() {
    this.xspeed += random(5, accChangeX / 3);
    this.yspeed += random(5, accChangeX / 3);
  }

  // Whenever the ball's stopShake() method is called,
  // gradually slow down its speed.
  stopShake() {
    if (this.xspeed > this.oxspeed) {
      this.xspeed -= 0.6;
    } else {
      this.xspeed = this.oxspeed;
    }
    if (this.yspeed > this.oyspeed) {
      this.yspeed -= 0.6;
    } else {
      this.yspeed = this.oyspeed;
    }
  }

  // Draw the ball on the canvas, given its randomized diameter
  // and current coordinates calculated with the methods listed above.
  display() {
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }
}
