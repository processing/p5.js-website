

function setup() {
  createCanvas(720, 560);
  noStroke();
  noLoop();
}

function draw() {
  drawCircle(width / 2, 280, 6);
}

function drawCircle(x, radius, level) {
  // 'level' is the variable that terminates the recursion once it reaches 
  // a certain value (here, 1). If a terminating condition is not 
  // specified, a recursive function keeps calling itself again and again
  // until it runs out of stack space - not a favourable outcome! 
  const tt = (126 * level) / 4.0;
  fill(tt);
  ellipse(x, height / 2, radius * 2, radius * 2);
  if (level > 1) {  
    // 'level' decreases by 1 at every step and thus makes the terminating condition
    // attainable
    level = level - 1;  
    drawCircle(x - radius / 2, radius / 2, level);
    drawCircle(x + radius / 2, radius / 2, level);
  }
}
