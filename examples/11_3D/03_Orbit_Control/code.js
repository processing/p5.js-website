function setup() {
  createCanvas(710, 400, WEBGL);
  angleMode(DEGREES);
  strokeWeight(5);
  noFill();
  stroke(32, 8, 64);
  describe(
    'Users can click on the screen and drag to adjust their perspective in 3D space. The space contains a sphere of dark purple cubes on a light pink background.'
  );
}

function draw() {
  background(250, 180, 200);

  // Call every frame to adjust camera based on mouse/touch
  orbitControl();

  // Rotate rings in a half circle to create a sphere of cubes
  for (let zAngle = 0; zAngle < 180; zAngle += 30) {
    // Rotate cubes in a full circle to create a ring of cubes
    for (let xAngle = 0; xAngle < 360; xAngle += 30) {
      push();

      // Rotate from center of sphere
      rotateZ(zAngle);
      rotateX(xAngle);

      // Then translate down 400 units
      translate(0, 400, 0);
      box();
      pop();
    }
  }
}
