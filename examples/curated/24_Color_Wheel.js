/*
 * @name Color Wheel
 * @description A
 * <a href="https://p5js.org/reference/#/p5/for" target="_blank">for loop</a>
 * can repeat transformations. The for loop in this example initializes
 * a variable called angle, which changes the rotation of a circle as
 * well as its hue. Each time the loop repeats, a circle is drawn
 * relative to the center of the canvas.  The
 * <a href="https://p5js.org/reference/#/p5/push" target="_blank">push()</a>
 * and <a href="https://p5js.org/reference/#/p5/pop" target="_blank">pop()</a>
 * functions make these transformations affect only the individual circle.
 */
function setup() {
  createCanvas(400, 400);
  background(255);

  //  Use Hue Saturation Brightness colors without stroke
  colorMode(HSB);
  noStroke();

  //  Set angle mode to use degrees
  angleMode(DEGREES);
  describe(
    "Small circles, each with a different color, arranged in a circular path, displaying hues across the color spectrum."
  );

  //  Repeat for angles 0-360 at increments of 30 degrees
  //  Changing the 30 value will change
  //  how many circles are drawn and how close together
  for (let angle = 0; angle < 360; angle += 30) {
    //  Save current transformation
    push();
    //  Move origin to center of canvas
    translate(width / 2, height / 2);
    //  Rotate using current angle
    rotate(angle);
    //  Set fill using current angle as hue
    fill(angle, 85, 90);
    //  Draw a circle 150 units from origin
    circle(150, 0, 50);
    //  Restore canvas transformation
    pop();
  }
}
