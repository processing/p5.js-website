/*
 * @name Scale
 * @description The 
 * <a href="https://p5js.org/reference/#/p5/scale">scale()</a>
 * function scales the current coordinate system by the specified
 * factor.
 *
 * The 
 * <a href="https://p5js.org/reference/#/p5/push">push()</a>
 * and
 * <a href="https://p5js.org/reference/#/p5/pop">pop()</a>
 * functions save and restore the coordinate system, respectively.
 *
 * In this example, a square size 200 is drawn at the origin, with
 * three different scaling factors.
 *
  */

function setup() {
  // Create the canvas
  createCanvas(720, 400);

  // Create screen reader accessible description
  describe('Three squares drawn on the canvas')
}

function draw() {
  // Clear the background
  background(0);

  // Draw blue square
  push();               // save current coordinate system
  scale(2);             // scale by 2
  fill('blue');         // set color to blue
  square(0, 0, 200);    // draw square at origin, size 200
  pop();                // restore coordinate system

  // Draw white square 
  fill(255);            // set color to white
  square(0, 0, 200);    // draw square at origin, size 200

  // Draw green square 
  push();               // save current coordinate system
  scale(.5);            // scale by .5
  fill('green');        // set color to green
  square(0, 0, 200);    // draw square at origin, size 200
  pop();                // restore coordinate system
}

