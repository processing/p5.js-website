let p0 = { x: 300, y: 250 };

// Start with a slight velocity 'kick' so initialEnergy isn't zero
let p1 = { x: 420, y: 250, lastX: 418, lastY: 250 };
let p2 = { x: 540, y: 250, lastX: 538, lastY: 250 };
let gravity = 0.9;
let len = 100;
let path = [];
// More compelling animation when energy is higher
let initialEnergy = 780;

function checkLength() {
  // This is essentially a Gauss–Seidel method
  // 15 iterations makes things appear totally rigid
  for (let i = 0; i < 15; ++i) {
    // fibonaci
    let distance = ((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2) ** 0.5;
    // normalize
    p1.x = p0.x + (len / distance) * (p1.x - p0.x);
    p1.y = p0.y + (len / distance) * (p1.y - p0.y);

    // p1 and p2 are linked and influence each other through tensions
    let distance2 = ((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) ** 0.5;
    let diffX = p1.x - p2.x;
    let diffY = p1.y - p2.y;
    p1.x = p1.x + ((len - distance2) / distance2) * diffX * 0.5;
    p1.y = p1.y + ((len - distance2) / distance2) * diffY * 0.5;
    p2.x = p2.x - ((len - distance2) / distance2) * diffX * 0.5;
    p2.y = p2.y - ((len - distance2) / distance2) * diffY * 0.5;
  }
}

function getEnergy() {
  let v1x = p1.x - p1.lastX;
  let v1y = p1.y - p1.lastY;
  let v2x = p2.x - p2.lastX;
  let v2y = p2.y - p2.lastY;

  //kinetic energy
  let ke1 = (v1x ** 2 + v1y ** 2) / 2;
  let ke2 = (v2x ** 2 + v2y ** 2) / 2;

  // potential energy
  let pe1 = gravity * (600 - p1.y);
  let pe2 = gravity * (600 - p2.y);

  return ke1 + ke2 + pe1 + pe2;
}

function drawSystem() {
  path.push({ x: p2.x, y: p2.y });
  if (path.length > 300) {
    path.shift();
  }
  for (let i = path.length - 1; i > 0; --i) {
    stroke(0, 200, 255, (255 / path.length) * i);
    line(path[i].x, path[i].y, path[i - 1].x, path[i - 1].y);
  }
  noFill();
  stroke(255, 50);
  line(p0.x, p0.y, p1.x, p1.y);
  fill(255);
  ellipse(p1.x, p1.y, 10);
  stroke(255, 50);
  line(p1.x, p1.y, p2.x, p2.y);
  fill(255);
  ellipse(p2.x, p2.y, 10);
}

function verletIntegrationWithHamiltonianPreservation() {
  // Making the energy quite variable makes the system evolve faster
  // giving a more striking simulation
  let correction = (initialEnergy / getEnergy()) ** 0.5 + Math.random() * 0.1;

  let vx = (p1.x - p1.lastX) * correction;
  let vy = (p1.y - p1.lastY) * correction;
  p1.lastX = p1.x;
  p1.lastY = p1.y;
  p1.x = p1.x + vx;
  p1.y = p1.y + vy + gravity;

  // repeated code make function with arguments
  let vx2 = (p2.x - p2.lastX) * correction;
  let vy2 = (p2.y - p2.lastY) * correction;
  p2.lastX = p2.x;
  p2.lastY = p2.y;
  p2.x = p2.x + vx2;
  p2.y = p2.y + vy2 + gravity;
}

function setup() {
  createCanvas(600, 500);
  // Add random noise
  [p1, p2].forEach((p) => {
    p.x += random(-8, 8);
    p.y += random(-8, 8);
  });
}

function draw() {
  background(15);
  verletIntegrationWithHamiltonianPreservation();
  checkLength();
  drawSystem();
}

