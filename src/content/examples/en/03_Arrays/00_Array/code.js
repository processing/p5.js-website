
let coswave = [];

function setup() {
  createCanvas(720, 360);
  for (let i = 0; i < width; i++) {
    let amount = map(i, 0, width, 0, PI);
    coswave[i] = abs(cos(amount));
  }
  background(255);
  noLoop();
}

function draw() {
  let y1 = 0;
  let y2 = height / 3;
  for (let i = 0; i < width; i += 3) {
    stroke(coswave[i] * 255);
    line(i, y1, i, y2);
  }

  y1 = y2;
  y2 = y1 + y1;
  for (let i = 0; i < width; i += 3) {
    stroke((coswave[i] * 255) / 4);
    line(i, y1, i, y2);
  }

  y1 = y2;
  y2 = height;
  for (let i = 0; i < width; i += 3) {
    stroke(255 - coswave[i] * 255);
    line(i, y1, i, y2);
  }
}
