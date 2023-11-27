/*
 * @name The Mandelbrot Set
 * @description Simple rendering of the Mandelbrot set.
 * Based on Daniel Shiffman's 
 * <a href="https://processing.org/examples/mandelbrot.html">Mandelbrot Example</a> for Processing.
 */


function setup() {
  createCanvas(710, 400);
  pixelDensity(1);
  noLoop();
  describe('Simple rendering of the Mandelbrot set.');
}


function draw() {
  background(0);

  // Establish a range of values on the complex plane
  // A different range will allow us to "zoom" in or out on the fractal

  // It all starts with the width, try higher or lower values
  const w = 4;
  const h = (w * height) / width;

  // Start at negative half the width and height
  const xmin = -w/2;
  const ymin = -h/2;
  // Make sure we can write to the pixels[] array.
  // Only need to do this once since we don't do any other drawing.
  loadPixels();

  // Maximum number of iterations for each point on the complex plane
  const maxiterations = 100;

  // x goes from xmin to xmax
  const xmax = xmin + w;
  // y goes from ymin to ymax
  const ymax = ymin + h;

  // Calculate amount we increment x,y for each pixel
  const dx = (xmax - xmin) / (width);
  const dy = (ymax - ymin) / (height);

  // Start y
  let y = ymin;
  for (let j = 0; j < height; j++) {
    // Start x
    let x = xmin;
    for (let i = 0; i < width; i++) {

      // Now we test, as we iterate z = z^2 + cm does z tend towards infinity?
      let a = x;
      let b = y;
      let n = 0;
      while (n < maxiterations) {
        const aa = a * a;
        const bb = b * b;
        const twoab = 2.0 * a * b;
        a = aa - bb + x;
        b = twoab + y;
        // Infinty in our finite world is simple, let's just consider it 16
        if (dist(aa, bb, 0, 0) > 16) {
          break;  // Bail
        }
        n++;
      }

      // Color each pixel based on how long it takes to get to infinity

      const index = (i+j*width)*4;
      const t = map(n, 0, maxiterations, 0, 1);

      let c = color(0);
      if (n < maxiterations)
          c = lerpColor(color('blue'), color('yellow'), t);

      // Copy the RGBA values from the color to the pixel
      for (let i=0; i<4; i++)
        pixels[index+i] = c.levels[i];

      x += dx;
    }
    y += dy;
  }
  updatePixels();
}


