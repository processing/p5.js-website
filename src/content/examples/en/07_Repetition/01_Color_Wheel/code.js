function setup() {
  createCanvas(400, 400);
  background(255);

  // Use Hue Saturation Brightness colors without stroke
  colorMode(HSB);
  noStroke();

  // Set angle mode to use degrees
  angleMode(DEGREES);
  describe(
    'Small circles, each with a different color, arranged in a circular path, displaying hues across the color spectrum.'
  );

  // Center align text
  textAlign(CENTER, CENTER);

  // Repeat for angles 0-360 at increments of 30 degrees
  // Changing the 30 value will change
  // how many circles are drawn and how close together
  for (let angle = 0; angle < 360; angle += 30) {
    // Save current transformation
    push();

    // Move origin to center of canvas
    translate(width / 2, height / 2);

    // Rotate using current angle
    rotate(angle);

    // Move 150 pixels out from center
    translate(150, 0);

    // Set fill using current angle as hue
    fill(angle, 85, 90);

    // Draw a circle at current origin (150 pixels from center)
    circle(0, 0, 50);

    // Move 50 pixels toward center
    translate(-50, 0);

    // Reverse rotation to keep text upright
    rotate(-angle);

    // Label the current angle
    fill(0);
    text(`${angle}°`, 0, 0);

    // Restore canvas transformation
    pop();
  }
}
