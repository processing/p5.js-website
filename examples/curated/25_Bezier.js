/*
 * @name Bezier
 * @arialabel 10 lines in a bezier curve formation. The bottom of the curve does not move but as the user’s mouse moves, the top of the curve follows the left and right movement 
 * @description The first two parameters for the bezier() function specify the
 * first point in the curve and the last two parameters specify the last point.
 * The middle parameters set the control points that define the shape of the
 * curve.
 */
function setup() {
  createCanvas(720, 400);

  //Set the bezier strokes to white and remove their fill.
  stroke(255);
  noFill();
}

function draw() {
  background(0);

  //Create 10 bezier lines whose anchor points move 
  //with your mouse.
  for (let i = 0; i < 200; i += 20) {
    bezier(
      mouseX - i / 2,
      40 + i,
      410,
      20,
      440,
      300,
      240 - i / 16,
      300 + i / 8
    );
  }
}
