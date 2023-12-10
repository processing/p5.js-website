/**
 * @name The Mandelbrot Set
 * @description Colorful rendering of the Mandelbrot set.
 * Based on Daniel Shiffman's 
 * <a href="https://processing.org/examples/mandelbrot.html">Mandelbrot Example</a> for Processing.
 */


function setup() {
  createCanvas(710, 400);
  pixelDensity(1);
  noLoop();
  describe('Colorful rendering of the Mandelbrot set.');
}


function draw() {
  background(0);

  // Establish a range of values on the complex plane
  // Different width values change the zoom level
  let w = 4;
  let h = (w * height) / width;

  // Start at negative half the width and height
  let xmin = -w/2;
  let ymin = -h/2;

  // Access the pixels[] array
  loadPixels();

  // Set the maxium number of iterations for each point on the complex plane
  let maxiterations = 100;

  // x goes from xmin to xmax
  let xmax = xmin + w;
  // y goes from ymin to ymax
  let ymax = ymin + h;

  // Calculate amount we increment x,y for each pixel
  let dx = (xmax - xmin) / (width);
  let dy = (ymax - ymin) / (height);

  // Start y
  let y = ymin;
  for (let j = 0; j < height; j++) {
    // Start x
    let x = xmin;
    for (let i = 0; i < width; i++) {

      // Test whether iteration of z = z^2 + cm diverges
      let a = x;
      let b = y;
      let n = 0;
      while (n < maxiterations) {
        let aa = a * a;
        let bb = b * b;
        let twoab = 2.0 * a * b;
        a = aa - bb + x;
        b = twoab + y;
        // If the values are too big, stop iteration
        if (dist(aa, bb, 0, 0) > 16) {
          break;
        }
        n++;
      }

      // Color each pixel based on how long it takes to get to infinity

      let index = (i+j*width)*4;
      let t = map(n, 0, maxiterations, 0, 1);

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


