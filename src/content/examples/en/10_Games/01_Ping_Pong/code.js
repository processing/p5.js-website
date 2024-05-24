let paddleLeftX = 20;
let paddleLeftY = 200;

let paddleRightX = 380;
let paddleRightY = 200;

let paddleSpeed = 2;
let paddleHeight = 80;
let paddleWidth = 10;

let leftScore = 0;
let rightScore = 0;

let ballPosX = 200;
let ballPosY = 200;
let ballSpeedX = 0;
let ballSpeedY = 0;
let ballSize = 10;

function setup() {
  createCanvas(400, 400);

  // Draw rectangles from their center
  // This makes it easier to check whether the ball is above or below the
  // center of a paddle
  rectMode(CENTER);
  fill(255);
  noStroke();
  textSize(40);
  textAlign(CENTER);

  // Start paused
  noLoop();
  describe(
    'Two narrow white rectangles and a white square representing the paddles and ball in a game of ping pong. The player scores are displayed in the upper corners, and initially text reads "Click to start"'
  );
}

function draw() {
  background(0);

  // Draw the paddles
  rect(paddleLeftX, paddleLeftY, paddleWidth, paddleHeight);
  rect(paddleRightX, paddleRightY, paddleWidth, paddleHeight);

  // Draw the ball
  square(ballPosX, ballPosY, ballSize);

  // Draw the score
  text(leftScore, width * 0.25, height * 0.1);
  text(rightScore, width * 0.75, height * 0.1);

  // Move the ball using its current speed
  ballPosX += ballSpeedX;
  ballPosY += ballSpeedY;

  // Store coordinates of the left paddle's collision area edges
  let leftCollisionLeft = paddleLeftX - paddleWidth / 2 - ballSize / 2;
  let leftCollisionRight = paddleLeftX + paddleWidth / 2 + ballSize / 2;
  let leftCollisionTop = paddleLeftY - paddleHeight / 2 - ballSize / 2;
  let leftCollisionBottom = paddleLeftY + paddleHeight / 2 + ballSize / 2;

  // If the ball is colliding with the left paddle
  if (
    ballPosX >= leftCollisionLeft &&
    ballPosX <= leftCollisionRight &&
    ballPosY >= leftCollisionTop &&
    ballPosY <= leftCollisionBottom
  ) {
    // Reverse the ball's horizontal speed
    ballSpeedX = -ballSpeedX;

    // Change the ball's vertical speed so it appears to bounce off the paddle
    ballSpeedY = (ballPosY - paddleLeftY) / 20;
  }

  // Store coordinates of the right paddle's collision area edges
  let rightCollisionLeft = paddleRightX - paddleWidth / 2 - ballSize / 2;
  let rightCollisionRight = paddleRightX + paddleWidth / 2 + ballSize / 2;
  let rightCollisionTop = paddleRightY - paddleHeight / 2 - ballSize / 2;
  let rightCollisionBottom = paddleRightY + paddleHeight / 2 + ballSize / 2;

  // If the ball is colliding with the right paddle
  if (
    ballPosX >= rightCollisionLeft &&
    ballPosX <= rightCollisionRight &&
    ballPosY >= rightCollisionTop &&
    ballPosY <= rightCollisionBottom
  ) {
    // Reverse the ball's horizontal speed
    ballSpeedX = -ballSpeedX;

    // Change the ball's vertical speed so it appears to bounce off the paddle
    ballSpeedY = (ballPosY - paddleRightY) / 20;
  }

  // If the ball is beyond the left edge
  if (ballPosX < 0) {
    // Give the right player a point
    rightScore += 1;
    resetBall();

    // Otherwise if the ball is beyond the right edge
  } else if (ballPosX > width) {
    // Give the left player a point
    leftScore += 1;
    resetBall();

    // Otherwise if the ball is hitting the top or bottom edge
  } else if (ballPosY < 0 || ballPosY > height) {
    // Reverse its vertical speed
    ballSpeedY = -ballSpeedY;
  }

  // Store whether W and S keys are pressed
  let leftDownPressed = keyIsDown(83);
  let leftUpPressed = keyIsDown(87);

  // Store how much the left paddle will move
  let leftMove = 0;

  if (leftDownPressed === true) {
    leftMove += paddleSpeed;
  }
  if (leftUpPressed === true) {
    leftMove -= paddleSpeed;
  }

  // Prevent the paddle from moving off screen
  paddleLeftY = constrain(
    paddleLeftY + leftMove,
    paddleHeight / 2,
    height - paddleHeight / 2
  );

  // Store whether up and down arrow keys are pressed
  let rightDownPressed = keyIsDown(DOWN_ARROW);
  let rightUpPressed = keyIsDown(UP_ARROW);

  // Store how much the right paddle will move
  let rightMove = 0;

  if (rightDownPressed === true) {
    rightMove += paddleSpeed;
  }
  if (rightUpPressed === true) {
    rightMove -= paddleSpeed;
  }

  // Prevent the paddle from moving off screen
  paddleRightY = constrain(
    paddleRightY + rightMove,
    paddleHeight / 2,
    height - paddleHeight / 2
  );

  // Show 'Click to start' if game is paused
  if (isLooping() === false) {
    text('Click to start', width / 2, height / 2 - 20);
  }
}

// Reset ball to center of canvas with random speed
function resetBall() {
  ballPosX = width / 2;
  ballPosY = height / 2;
  ballSpeedX = random([-3, 3]);
  ballSpeedY = random([-1, 1]);
}

function mousePressed() {
  if (isLooping() === false) {
    resetBall();
    loop();
  }
}
