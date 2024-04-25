// Variable to store NASA model
let astronaut;

function preload() {
  astronaut = loadModel('/assets/astronaut.obj');
}

function setup() {
  createCanvas(710, 400, WEBGL);

  angleMode(DEGREES);

  // Use a normal material, which uses color to illustrate
  // what direction each face of the geometry is pointing
  normalMaterial();

  describe(
    'Eight 3D shapes: a plane, box, cylinder, cone, torus, sphere, ellipsoid, and a model of an astronaut. Each shape is rotating in all directions. The surface of the shapes are multicolored.'
  );
}

function draw() {
  background(250);

  // Plane
  push();
  translate(-250, -100, 0);
  rotateWithFrameCount();
  plane(70);
  pop();

  // Box
  push();
  translate(-75, -100, 0);
  rotateWithFrameCount();
  box(70, 70, 70);
  pop();

  // Cylinder
  push();
  translate(100, -100, 0);
  rotateWithFrameCount();
  cylinder(70, 70);
  pop();

  // Cone
  push();
  translate(275, -100, 0);
  rotateWithFrameCount();
  cone(50, 70);
  pop();

  // Torus
  push();
  translate(-250, 100, 0);
  rotateWithFrameCount();
  torus(50, 20);
  pop();

  // Sphere
  push();
  translate(-75, 100, 0);
  rotateWithFrameCount();

  // Show black stroke to help visualize movement
  stroke(0);
  sphere(50);
  pop();

  // Ellipsoid
  push();
  translate(100, 100, 0);
  rotateWithFrameCount();
  ellipsoid(20, 40, 40);
  pop();

  // Astronaut
  push();
  translate(275, 100, 0);
  rotateWithFrameCount();

  // Extra rotation to start model in upright position
  rotateZ(180);
  model(astronaut);
  pop();
}

// Rotate 1 degree per frame along all three axes
function rotateWithFrameCount() {
  rotateZ(frameCount);
  rotateX(frameCount);
  rotateY(frameCount);
}
