/*
 * @name Bezier
 * @description 
 * <a href="https://p5js.org/reference/#/p5/bezier" target="_blank">bezier()</a> curves are created using control and achor points. 
 * The first two parameters for the <a href="https://p5js.org/reference/#/p5/bezier" target="_blank">bezier()</a> 
 * function specify the first point in the curve and the last two parameters specify the last point.
 * The middle parameters set the control points that define the shape of the curve.
 */
function setup() {
  createCanvas(720, 400);

  // Set the bezier strokes to white and remove their fill.
  stroke(255);
  noFill();
}

function draw() {
  describe('Ten white lines in a bezier curve formation. The top anchors of the curves move with the cursor as it hovers over the black canvas.');
  
  background(0);

  // Create 10 bezier lines with anchor points moving 
  // with the X coordinate of the cursor.
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