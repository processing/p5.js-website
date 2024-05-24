function setup() {
  // Create the canvas
  createCanvas(720, 400);

  // Set angle mode to degrees
  angleMode(DEGREES);

  // Set text color, size, and alignment
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);

  // Set the color mode to hue-saturation-brightness (HSB)
  colorMode(HSB);

  // Create screen reader accessible description
  describe('line segments rotated around center of canvas');
}


function draw() {
  // Clear the background
  background(0);

  // Loop through angles 0, 30, 60, 90 degrees
  for (let angle=0; angle <= 90; angle += 30) {
      // Save current coordinate system
      push();                       

      // Translate to center of canvas and rotate by angle
      translate(width/2, height/2);
      rotate(angle);

      // Set color based on angle and draw line along x-axis
      stroke(angle+100, 100, 100);
      strokeWeight(5);
      line(0, 0, 150, 0);

      // Display the angle
      strokeWeight(1);              
      text(angle, 170, 0);

      // Restore coordinate system
      pop();                        
  }

  // Draw the animated line
  translate(width/2, height/2);
  rotate(frameCount);
  stroke(255);
  strokeWeight(5);
  line(0, 0, 150, 0);
}