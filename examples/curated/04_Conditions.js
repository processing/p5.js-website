/**
 * @name Conditions
 * @frame 400,400
 * @description If and else statements allow a
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/block" target="_blank">block of code</a>
 * to only run when a certain condition is true. This example only
 * animates when the mouse is held down. This is because of the if
 * statement on line 59. You can read more about if and else statements
 * <a href="https://p5js.org/reference/#/p5/if-else">in the p5 reference</a>
 * or <a href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals" target="_blank">on MDN</a>.
 *
 * Comparison operators help to form conditions by comparing two
 * values. In this example, the hue of the circle resets to zero when
 * the hue is at least 360 because of the if statement on line 69.
 * You can read more about comparison operators
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#relational_operators" target="_blank">on MDN</a>.
 *
 * Logical operators allow conditions to be combined.
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND" target="_blank">&amp;$amp;</a>
 * checks that both conditions are true. The circle in this example
 * has a black fill when it is toward the horizontal center of the canvas, and it
 * has a white fill when it is not. This is because of the if statement on line
 * 45, which checks that the circle's x position is at least 100 and also
 * no more than 300.
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR" target="_blank">||</a>
 * checks that at least one of the conditions are true. The circle reverses horizontal
 * speed when it reaches the left or right edge of the canvas because of the if statement
 * on line 75.
 */
// Position variables
let circlePositionX = 200;
let circlePositionY = 200;

// Speed variables
let circleSpeedX = 2;
let circleSpeedY = 3;

// Radius variable
let circleRadius = 25;

// Hue variable
let circleHue = 0;

function setup() {
  // Create 400x400 canvas
  createCanvas(400, 400);

  // Cover canvas with white
  background(255);

  // Draw ellipses using their radius
  ellipseMode(RADIUS);

  // Draw rectangles on either side of the canvas
  noStroke();
  fill(128);
  rect(0, 0, 100, height);
  rect(300, 0, 100, height);

  // Use Hue Saturation Brightness for colors on circle trail
  colorMode(HSB);

  // Set stroke weight to 4 units
  strokeWeight(4);

  // Create screen reader accessible description
  describe(
    'A circle starts in the center of the canvas. When the user holds the mouse down, the circle bounces around the canvas, its inside switches between black and white, and its outline fades between colors, leaving a rainbow trail.'
  );
}

function draw() {
  // Set stroke color using current hue
  stroke(circleHue, 80, 90);

  // If circle's x position is between 100 and 300
  if (circlePositionX >= 100 && circlePositionX <= 300) {
    // Set fill color to black
    fill(0);

    // Otherwise
  } else {
    // Set fill color to white
    fill(255);
  }

  // Draw circle at current position
  circle(circlePositionX, circlePositionY, circleRadius);

  // If mouse is held down, animate the sketch
  if (mouseIsPressed === true) {
    // Add speed to circle's position to make it move
    circlePositionX = circlePositionX + circleSpeedX;
    circlePositionY = circlePositionY + circleSpeedY;

    // Increase hue by 1
    circleHue = circleHue + 1;
  }

  // If hue has reached maximum value
  if (circleHue >= 360) {
    // Reset hue to 0
    circleHue = 0;
  }

  // If circle is beyond left or right edge
  if (
    circlePositionX < circleRadius ||
    circlePositionX > width - circleRadius
  ) {
    // Reverse horizontal speed
    circleSpeedX = -circleSpeedX;
  }

  // If circle is beyond top or bottom edge
  if (
    circlePositionY < circleRadius ||
    circlePositionY > height - circleRadius
  ) {
    // Reverse vertical speed
    circleSpeedY = -circleSpeedY;
  }
}
