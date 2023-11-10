let textSin, textCos;

function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES);
  colorMode(HSB);
  textAlign(LEFT, CENTER);
}

function draw() {
  background(100);

  //Circle Path
  noFill();
  stroke(90);
  circle(200, 100, 100);
  noStroke();

  //Diameters
  stroke(90);
  strokeWeight(3);
  line(200, 50, 200, 150);
  line(150, 100, 250, 100);
  noStroke();

  //Black Circle
  //X Co-ordinate Controlled by Sine
  //Y Co-ordinate Controlled by Cosine
  fill(0);
  circle(200 + 50 * sin(frameCount), 100 + 50 * cos(frameCount), 10);

  //Orange Circle
  //X Co-ordinate Controlled by Sine
  fill(20, 100, 100);
  circle(200 + 50 * sin(frameCount), 100, 10);

  //Blue Circle
  //Y Co-ordinate Controlled by Cosine
  fill(200, 100, 100);
  circle(200, 100 + 50 * cos(frameCount), 10);

  //Diagram Showing Sine and Cosine Wave

  //Axes
  stroke(90);
  strokeWeight(3);
  line(200, 250, 200, 350);
  line(0, 300, 400, 300);
  noStroke();

  //Sine Wave Label
  textSin = 300 + 50 * sin(-frameCount);
  fill(20, 100, 100, 0.5);
  text("X = " + " " + (200 + 50 * sin(frameCount)), 220, textSin);

  //Cosine Wave Label
  textCos = 300 + 50 * cos(-frameCount);
  fill(200, 100, 100, 0.5);
  text("Y = " + " " + (100 + 50 * cos(frameCount)), 220, textCos);

  for (let i = 0; i <= 200; i++) {
    let ySin = 300 + 50 * sin(-frameCount + i);
    let yCos = 300 + 50 * cos(-frameCount + i);
    let x = width / 2 - 1 * i;
    fill(20, 100, 100, 0.5);
    circle(x, ySin, 10);

    fill(200, 100, 100, 0.5);
    circle(x, yCos, 10);
  }
}
