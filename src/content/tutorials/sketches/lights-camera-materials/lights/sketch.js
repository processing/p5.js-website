let toggleAmbient, toggleDirectional, toggleSpotlight, togglePoint, toggleImage;

let pointX, pointY, pointZ;
let spotX, spotY, spotZ;
let directionX, directionY, directionZ;
// let reflections;
let spheremap;

function preload() {
  spheremap = loadImage('/images/tutorials/outdoor_spheremap.jpg');
}

function setup() {
  let canvas = createCanvas(350, 350, WEBGL);
  canvas.parent("sketchContainer");

  toggleAmbient = document.querySelector("#toggleAmbient");
  toggleDirectional = document.querySelector("#toggleDirectional");
  toggleSpotlight = document.querySelector("#toggleSpotlight");
  togglePoint = document.querySelector("#togglePoint");
  toggleImage = document.querySelector("#toggleImage");
  // reflections = document.querySelector("#toggleReflections");
  
  camera(700, -100, 700);

  describe(
    'an interactive sketch that allows you to toggle on and off a number of different lights with indicators on a box shape.'
  );
}

function draw() {
  background(220);
  orbitControl();

  noStroke();

  directionX = 0
  directionY = -1
  directionZ = 0

  pointX = 80;
  pointY = -20;
  pointZ = 0;

  spotX = 0
  spotY = -10
  spotZ = 150

  push();
  if (toggleAmbient.checked) ambientLight(50);

  if (toggleDirectional.checked) directionalLight(255, 0, 0, -0.25, 0.25, 0);

  if (toggleSpotlight.checked) spotLight(0, 255, 0, spotX, spotY, spotZ, 0, 0, -1);

  if (togglePoint.checked) pointLight(0, 0, 255, pointX, pointY, pointZ);
  
  if (toggleImage.checked) imageLight(spheremap);

  fill(255);
  // if (reflections.checked) {
  //   specularMaterial(255);
  //   shininess(100);
  // }
  sphere(50);
  
  fill(200);
  for (const [ry, rx] of [[0, 0], [PI/2, 0], [0, PI/2]]) {
    push();
    rotateX(rx);
    rotateY(ry);
    translate(0, 0, -100);
    plane(200, 200);
    pop();
  }
  pop();

  // draw debug directional light
  if (toggleDirectional.checked) {
    push();
    translate(0,-150,0);
    rotateZ(PI/4);
    scale(0.15);
    fill('red');
    cone();
    translate(0, -50, 0)
    cylinder(20, 100);
    pop();  
  }

  // draw debug spotlight
  if (toggleSpotlight.checked) {
    push();
    translate(spotX, spotY, spotZ);
    scale(0.3);
    rotateX(PI /2)
    fill('green');
    cone();
    pop();  
  }

  // draw debug point light
  if (togglePoint.checked) {
    push();
    translate(pointX, pointY, pointZ);
    scale(0.2);
    fill('blue');
    sphere();
    pop();
  }
}
