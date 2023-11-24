/*
 * @name Triangle Strip
 * @description This example demonstrates the use of the
 * <a href="https://p5js.org/reference/#/p5/vertex">vertex()</a>
 * function and specifying a shape in TRIANGLE_STRIP mode.  
 */


const insideRadius = 100;
const outsideRadius = 150;


function setup() {
  createCanvas(720, 400);
  angleMode(DEGREES, 360, 255, 255);
  colorMode(HSB);

  describe('Rainbow triangle strip in the shape of a ring.');
}


function draw() {
  background(0);

  const centerX = width/2;
  const centerY = height/2;

  // Set the number of points based on the mouse x position

  let numPoints = int(map(mouseX, 0, width, 6, 60));
  fill(255);
  textSize(20);
  text("numPoints: " + numPoints, 30, 30);

  // Draw the triangle strip by specifying points on
  // the inside circle and outside circle alternately

  let angle = 0;
  let angleStep = 180.0 / numPoints;

  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= numPoints; i++) {

    // Specify a point on the outside circle
    let px = centerX + cos(angle) * outsideRadius;
    let py = centerY + sin(angle) * outsideRadius;
    fill(angle, 255, 255);
    vertex(px, py);
    angle += angleStep;

    // Specify a point on the inside circle
    px = centerX + cos(angle) * insideRadius;
    py = centerY + sin(angle) * insideRadius;
    fill(angle, 255, 255);
    vertex(px, py);
    angle += angleStep;
  }
  endShape();
}


