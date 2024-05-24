let circleX;
let circleY;
let circleRadius;
let circleMaximumRadius;
let circleColor;
let score = 0;
let highScore;

function setup() {
  createCanvas(720, 400);
  colorMode(HSB);
  noStroke();
  ellipseMode(RADIUS);
  textSize(36);

  // Get the last saved high score
  highScore = getItem('high score');

  // If no score was saved, start with a value of 0
  if (highScore === null) {
    highScore = 0;
  }
}

function draw() {
  background(20);

  // If the circle had not shrunk completely
  if (circleRadius > 0) {
    // Draw the circle
    fill(circleColor);
    circle(circleX, circleY, circleRadius);
    describeElement('Circle', 'Randomly colored shrinking circle');

    // Shrink it
    circleRadius -= 1;

    // Show the score
    textAlign(RIGHT, TOP);
    fill(220);
    text(score, width - 20, 20);
    describeElement('Score', `Text with current score: ${score}`);
  } else {
    // Otherwise show the start/end screen
    endGame();
  }
}

function startGame() {
  // Reset the score to 0
  score = 0;

  // Start with the circle's radius maximum at half the minimum canvas dimension
  circleMaximumRadius = min(height / 2, width / 2);
  resetCircle();
}

function endGame() {
  // Pause the sketch
  noLoop();

  // Store the new high score
  highScore = max(highScore, score);
  storeItem('high score', highScore);

  textAlign(CENTER, CENTER);
  fill(220);
  let startText = `Circle Clicker
  Click the circle before it gets too small
  Score: ${score}
  High score: ${highScore}
  Click to play`;
  text(startText, 0, 0, width, height);
  describeElement('Start text', `Text reading, "${startText}"`);
}

function resetCircle() {
  // Start with the circle's radius at its maximum value
  circleRadius = circleMaximumRadius;
  circleX = random(circleRadius, width - circleRadius);
  circleY = random(circleRadius, height - circleRadius);
  circleColor = color(random(240, 360), random(40, 80), random(50, 90));
}

function mousePressed() {
  // If the game is unpaused
  if (isLooping() === true) {
    // Check how far the mouse is from the circle
    let distanceToCircle = dist(mouseX, mouseY, circleX, circleY);

    // If the mouse is closer to the circle's center than the circle's radius,
    // that means the player clicked on it
    if (distanceToCircle < circleRadius) {
      // Decrease the maximum radius, but don't go below 15
      circleMaximumRadius = max(circleMaximumRadius - 1, 15);
      resetCircle();

      // Give the player a point
      score += 1;
    }
    // If the game is paused
  } else {
    // Start and unpause it
    startGame();
    loop();
  }
}
