/**
 *
 * @name Multiple Canvases
 * @description By default, p5 runs in Global Mode, which means that
 * all p5 functions are in the global scope, and all canvas-related functions
 * apply to a single canvas. p5 can also run in Instance Mode, in which those
 * same functions are methods of an instance of the p5 class. Each instance of
 * p5 may have its own canvas.
 *
 * To use instance mode, a function must be defined with a parameter representing
 * the p5 instance (labeled p in this example). All the p5 functions and variables
 * that are typically global will belong to this parameter within this function's
 * scope. Passing the function into the p5 constructor, runs it.
 */

// Function for first canvas
function sketch1(p) {
  p.setup = function () {
    p.createCanvas(720, 200);
    p.background(0);
  };
  p.draw = function () {
    p.circle(p.mouseX, p.mouseY, 50);
  };
}

// Run first p5 instance
new p5(sketch1);

// Function for second canvas
function sketch2(p) {
  p.setup = function () {
    p.createCanvas(720, 200);
    p.background(255);
    p.fill(0);
    p.stroke(255);
  };
  p.draw = function () {
    p.square(p.mouseX, p.mouseY, 50);
  };
}

// Run second p5 instance
new p5(sketch2);
