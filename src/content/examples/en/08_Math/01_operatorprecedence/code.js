
// The highest precedence is at the top of the list and
// the lowest is at the bottom.
// Multiplicative: * / %
// Additive: + -
// Relational: < > <= >=
// Equality: == !=
// Logical AND: &&
// Logical OR: ||
// Assignment: = += -= *= /= %=
function setup() {
  createCanvas(710, 400);
  background(51);
  noFill();
  stroke(51);

  stroke(204);
  for (let i = 0; i < width - 20; i += 4) {
    // The 30 is added to 70 and then evaluated
    // if it is greater than the current value of "i"
    // For clarity, write as "if (i > (30 + 70)) {"
    if (i > 30 + 70) {
      line(i, 0, i, 50);
    }
  }

  stroke(255);
  // The 2 is multiplied by the 8 and the result is added to the 4
  // For clarity, write as "rect(5 + (2 * 8), 0, 90, 20);"
  rect(4 + 2 * 8, 52, 290, 48);
  rect((4 + 2) * 8, 100, 290, 49);

  stroke(153);
  for (let i = 0; i < width; i += 2) {
    // The relational statements are evaluated
    // first, and then the logical AND statements and
    // finally the logical OR. For clarity, write as:
    // "if(((i > 20) && (i < 50)) || ((i > 100) && (i < width-20))) {"
    if ((i > 20 && i < 50) || (i > 100 && i < width - 20)) {
      line(i, 151, i, height - 1);
    }
  }
}
