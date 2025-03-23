
/*
 * @name Spirograph
 * @arialabel A spirograph is created by interlocking black circle outlines rotating around each other on a grey background. When the user clicks the space bar, the background turns white and paths of circles of various sizes in an indigo color are visible
 * @description This sketch uses simple transformations to create a
 * Spirograph-like effect with interlocking circles (called sines).
 * Press the spacebar to switch between tracing and showing the underlying geometry.<br>
 * Example created by <a href='http://lukedubois.com/' target='_blank'>R. Luke DuBois</a>.<br>
 * <a href='http://en.wikipedia.org/wiki/Spirograph'>http://en.wikipedia.org/wiki/Spirograph</a>
 */
let NUMSINES = 20; // how many of these things can we do at once?
let sines = new Array(NUMSINES); // an array to hold all the current angles
let rad; // an initial radius value for the central sine
let i; // a counter variable

// play with these to get a sense of what's going on:
let fund = 0.005; // the speed of the central sine
let ratio = 1; // what multiplier for speed is each additional sine?
let alpha = 50; // how opaque is the tracing system

let trace = false; // are we tracing?

function setup() {
  createCanvas(710, 400);

  rad = height / 4; // compute radius for central circle
  background(204); // clear the screen

  for (let i = 0; i<sines.length; i++) {
    sines[i] = PI; // start EVERYBODY facing NORTH
  }
}

function draw() {
  if (!trace) {
    background(204); // clear screen if showing geometry
    stroke(0, 255); // black pen
    noFill(); // don't fill
  }

  // MAIN ACTION
  push(); // start a transformation matrix
  translate(width / 2, height / 2); // move to middle of screen

  for (let i = 0; i < sines.length; i++) {
    let erad = 0; // radius for small "point" within circle... this is the 'pen' when tracing
    // setup for tracing
    if (trace) {
      stroke(0, 0, 255 * (float(i) / sines.length), alpha); // blue
      fill(0, 0, 255, alpha / 2); // also, um, blue
      erad = 5.0 * (1.0 - float(i) / sines.length); // pen width will be related to which sine
    }
    let radius = rad / (i + 1); // radius for circle itself
    rotate(sines[i]); // rotate circle
    if (!trace) ellipse(0, 0, radius * 2, radius * 2); // if we're simulating, draw the sine
    push(); // go up one level
    translate(0, radius); // move to sine edge
    if (!trace) ellipse(0, 0, 5, 5); // draw a little circle
    if (trace) ellipse(0, 0, erad, erad); // draw with erad if tracing
    pop(); // go down one level
    translate(0, radius); // move into position for next sine
    sines[i] = (sines[i] + (fund + (fund * i * ratio))) % TWO_PI; // update angle based on fundamental
  }

  pop(); // pop down final transformation

}

function keyReleased() {
  if (key==' ') {
    trace = !trace;
    background(255);
  }
}
