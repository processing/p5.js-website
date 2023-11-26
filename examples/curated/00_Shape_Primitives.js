/*
 * @name Shape Primitives
 * @description This program demostrates the use of the basic shape 
 * primitive functions
 * <a href="https://p5js.org/reference/#/p5/rect">rect()</a>,
 * <a href="https://p5js.org/reference/#/p5/ellipse">ellipse()</a>,
 * <a href="https://p5js.org/reference/#/p5/circle">circle()</a>,
 * <a href="https://p5js.org/reference/#/p5/quad">quad()</a>,
 * <a href="https://p5js.org/reference/#/p5/arc">arc()</a>, and
 * <a href="https://p5js.org/reference/#/p5/triangle">triangle()</a>.
 */


function setup() {
  createCanvas(720, 400);
  background(0);

  fill('red');
  rect(20, 50, 200, 100);

  fill('yellow');
  ellipse(360, 100, 200, 100);

  fill('lime');
  circle(600, 100, 100);

  fill('aqua');
  quad(20, 250, 70, 200, 220, 300, 170, 350);

  fill('blue');
  arc(360, 300, 200, 100, 0, PI); // compare to ellipse()

  fill('fuchsia');
  triangle(550, 350, 600, 250, 650, 350);
 
  describe('Six primitive shapes arranged in a grid.');
}

