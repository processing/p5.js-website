/*
 * @name Soft Body
 * @description Softbody dynamics simulation using curveVertex() and 
 * curveTightness().
 */


let centerX = 0.0, centerY = 0.0;

let radius = 45, rotAngle = -90;
let accelX = 0.0, accelY = 0.0;
let deltaX = 0.0, deltaY = 0.0;
let springing = 0.0009, damping = 0.98;

let nodes = 5;

let nodeStartX = [];
let nodeStartY = [];
let nodeX = [];
let nodeY = [];
let angle = [];
let frequency = [];

let organicConstant = 1.0;

function setup() {
  createCanvas(710, 400);

  // Start in the center of the canvas
  centerX = width/2;
  centerY = height/2;

  // Initialize arrays to 0
  for (let i = 0; i < nodes; i++){
    nodeStartX[i] = 0;
    nodeStartY[i] = 0;
    nodeY[i] = 0;
    nodeY[i] = 0;
    angle[i] = 0;
  }

  // Initialize frequencies for corner nodes
  for (let i = 0; i < nodes; i++){
    frequency[i] = random(5, 12);
  }

  noStroke();
}

function draw() {
  // Use alpha blending for fade effect
  fill(0, 50);
  rect(0, 0, width, height);

  // Draw and move the shape
  drawShape();
  moveShape();
}

function drawShape() {
  // Calculate node starting locations
  for (let i = 0; i < nodes; i++){
    nodeStartX[i] = centerX + cos(radians(rotAngle)) * radius;
    nodeStartY[i] = centerY + sin(radians(rotAngle)) * radius;
    rotAngle += 360.0 / nodes;
  }

  // Draw the polygon

  curveTightness(organicConstant);
  fill(lerpColor(color('red'), color('yellow'), 1-organicConstant));

  beginShape();
  for (let i = 0; i < nodes; i++){
    curveVertex(nodeX[i], nodeY[i]);
  }
  endShape(CLOSE);
}

function moveShape() {
  // Move center point
  deltaX = mouseX - centerX;
  deltaY = mouseY - centerY;

  // Create springing effect
  deltaX *= springing;
  deltaY *= springing;
  accelX += deltaX;
  accelY += deltaY;

  // Move center
  centerX += accelX;
  centerY += accelY;

  // Slow down springing
  accelX *= damping;
  accelY *= damping;

  // Change curve tightness
  organicConstant = 1 - ((abs(accelX) + abs(accelY)) * 0.1);

  // Move nodes
  for (let i = 0; i < nodes; i++){
    nodeX[i] = nodeStartX[i] + sin(radians(angle[i])) * (accelX * 2);
    nodeY[i] = nodeStartY[i] + sin(radians(angle[i])) * (accelY * 2);
    angle[i] += frequency[i];
  }
}


