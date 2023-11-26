/*
 * @name Recursive Tree
 * @description Renders a simple tree-like structure via recursion.
 * The branching angle is calculated as a function of the horizontal mouse
 * location. Move the mouse left and right to change the angle.
 * Based on Daniel Shiffman's <a href="https://processing.org/examples/tree.html">Recursive Tree Example</a> for Processing.
 */

let theta;

function setup() {
  createCanvas(710, 400);
  colorMode(HSB);
}

function draw() {
  background(0);

  // Let's pick an angle 0 to 90 degrees based on the mouse position
  let a = (mouseX / width) * 90;
  // Convert it to radians
  theta = radians(a);
  // Start the tree from the bottom of the screen
  translate(width/2,height);
  // Draw a line 120 pixels
  stroke(0, 255, 255);
  line(0,0,0,-120);
  // Move to the end of that line
  translate(0,-120);
  // Start the recursive branching!
  branch(120, 0);

  describe('A tree drawn by recursively drawing branches.');
}

function branch(h, level) {

  // Set the hue based on the recursion level
  stroke(level*25, 255, 255);

  // Each branch will be 2/3rds the size of the previous one
  h *= 0.66;

  // All recursive functions must have an exit condition!!!!
  // Here, ours is when the length of the branch is 2 pixels or less
  if (h > 2) {
    push();    // Save the current state of transformation (i.e. where are we now)
    rotate(theta);   // Rotate by theta
    line(0, 0, 0, -h);  // Draw the branch
    translate(0, -h); // Move to the end of the branch
    branch(h, level+1);       // Ok, now call myself to draw two new branches!!
    pop();     // Whenever we get back here, we "pop" in order to restore the previous matrix state

    // Repeat the same thing, only branch off to the "left" this time!
    push();
    rotate(-theta);
    line(0, 0, 0, -h);
    translate(0, -h);
    branch(h, level+1);
    pop();
  }
}

