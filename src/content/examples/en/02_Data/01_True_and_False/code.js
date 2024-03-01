
function setup() {
  createCanvas(720, 400);
  background(0);
  stroke(255);

  let b = false;
  let d = 20;
  let middle = width / 2;

  for (let i = d; i <= width; i += d) {
    b = i < middle;

    if (b === true) {
      // Vertical line
      line(i, d, i, height - d);
    }

    if (b === false) {
      // Horizontal line
      line(middle, i - middle + d, width - d, i - middle + d);
    }
  }
}
