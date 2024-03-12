
function setup() {
  createCanvas(720, 360);
  background(0);

  for (let i = 10; i < width; i += 10) {
    // If 'i' divides by 20 with no remainder draw the first line
    // else draw the second line
    if (i % 20 === 0) {
      stroke(255);
      line(i, 80, i, height / 2);
    } else {
      stroke(153);
      line(i, 20, i, 180);
    }
  }
}
