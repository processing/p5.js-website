let insideRadius = 100;
let outsideRadius = 150;

function setup() {
  createCanvas(720, 400);
  angleMode(DEGREES, 360, 255, 255);
  colorMode(HSB);

  describe(
    'Rainbow ring made up of triangles whose vertices lie on two concentric circles.'
  );
}

function draw() {
  background(0);

  let centerX = width / 2;
  let centerY = height / 2;

  // Set the number of points based on the mouse x position
  let pointCount = map(mouseX, 0, width, 6, 60);

  // Round pointCount to the nearest integer
  pointCount = round(pointCount);

  // Display the current pointCount
  fill(255);
  textSize(20);
  text(`pointCount: ${pointCount}`, 30, 30);

  // Draw the triangle strip by specifying points on
  // the inside circle and outside circle alternately

  let angle = 0;
  let angleStep = 180.0 / pointCount;

  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= pointCount; i += 1) {
    // Specify a point on the outside circle
    let pointX = centerX + cos(angle) * outsideRadius;
    let pointY = centerY + sin(angle) * outsideRadius;
    fill(angle, 255, 255);
    vertex(pointX, pointY);
    angle += angleStep;

    // Specify a point on the inside circle
    pointX = centerX + cos(angle) * insideRadius;
    pointY = centerY + sin(angle) * insideRadius;
    fill(angle, 255, 255);
    vertex(pointX, pointY);
    angle += angleStep;
  }
  endShape();
}
