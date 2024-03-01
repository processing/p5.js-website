

let a;

function setup() {
  createCanvas(720, 400);
  stroke(255);
  a = height / 2;
}

function draw() {
  background(51);
  line(0, a, width, a);
  a = a - 0.5;
  if (a < 0) {
    a = height;
  }
}
