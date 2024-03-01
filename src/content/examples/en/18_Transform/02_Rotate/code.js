

let angle = 0.0;
let jitter = 0.0;

function setup() {
  createCanvas(720, 400);
  noStroke();
  fill(255);
  //Draw the rectangle from the center and it will also be the
  //rotate around that center
  rectMode(CENTER);
}

function draw() {
  background(51);

  // during even-numbered seconds (0, 2, 4, 6...) add jitter to
  // the rotation
  if (second() % 2 === 0) {
    jitter = random(-0.1, 0.1);
  }
  //increase the angle value using the most recent jitter value
  angle = angle + jitter;
  //use cosine to get a smooth CW and CCW motion when not jittering
  let c = cos(angle);
  //move the shape to the center of the canvas
  translate(width / 2, height / 2);
  //apply the final rotation
  rotate(c);
  rect(0, 0, 180, 180);
}
