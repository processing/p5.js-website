/**
 * @name Shape Primitives
 * @description This program demostrates the use of the basic shape 
 * primitive functions
 * <a href="https://p5js.org/reference/#/p5/rect">rect()</a>,
 * <a href="https://p5js.org/reference/#/p5/ellipse">ellipse()</a>,
 * <a href="https://p5js.org/reference/#/p5/circle">circle()</a>,
 * <a href="https://p5js.org/reference/#/p5/quad">quad()</a>,
 * <a href="https://p5js.org/reference/#/p5/arc">arc()</a>, and
 * <a href="https://p5js.org/reference/#/p5/triangle">triangle()</a>.
 *
 * The program also demonstrates the use of 
 * <a href="https://p5js.org/reference/#/p5/fill">fill()</a>
 * with names for basic 
 * <a href="https://en.wikipedia.org/wiki/Web_colors">web colors</a>.
 *
 */


function setup() {
  // Create screen reader accessible description
  textOutput();

  createCanvas(720, 400);
  angleMode(DEGREES);
  background(0);

  // Draw red rectangle
  fill('red');
  rect(20, 50, 200, 100);

  // Draw yellow ellipse
  fill('yellow');
  ellipse(360, 100, 200, 100);

  // Draw lime circle
  fill('lime');
  circle(600, 100, 100);

  // Draw aqua quadrilateral
  fill('aqua');
  quad(20, 250, 70, 200, 220, 300, 170, 350);

  // Draw white arc (compare to ellipse())
  fill('white');
  arc(360, 300, 200, 100, 0, 180);

  // Draw fuchsia triangle
  fill('fuchsia');
  triangle(550, 350, 600, 250, 650, 350);
}


