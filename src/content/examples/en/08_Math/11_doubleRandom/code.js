
let totalPts = 300;
let steps = totalPts + 1;

function setup() {
  createCanvas(710, 400);
  stroke(255);
  frameRate(1);
}

function draw() {
  background(0);
  let rand = 0;
  for (let i = 1; i < steps; i++) {
    point((width / steps) * i, height / 2 + random(-rand, rand));
    rand += random(-5, 5);
  }
}
