function setup() {
  createCanvas(710, 400);
  pixelDensity(1);
  describe('Colorful rendering of the Mandelbrot set.');
  background(0);

  // Establish a range of values on the complex plane
  // Different width values change the zoom level
  let w = 4;
  let h = (w * height) / width;

  // Start at negative half the width and height
  let xMin = -w / 2;
  let yMin = -h / 2;

  // Access the pixels[] array
  loadPixels();

  // Set the maximum number of iterations for each point on the complex plane
  let maxIterations = 100;

  // x goes from xMin to xMax
  let xMax = xMin + w;

  // y goes from yMin to yMax
  let yMax = yMin + h;

  // Calculate amount we increment x,y for each pixel
  let dx = (xMax - xMin) / width;
  let dy = (yMax - yMin) / height;

  // Start y
  let y = yMin;
  for (let j = 0; j < height; j += 1) {
    // Start x
    let x = xMin;
    for (let i = 0; i < width; i += 1) {
      // Test whether iteration of z = z^2 + cm diverges
      let a = x;
      let b = y;
      let iterations = 0;
      while (iterations < maxIterations) {
        let aSquared = pow(a, 2);
        let bSquared = pow(b, 2);
        let twoAB = 2.0 * a * b;
        a = aSquared - bSquared + x;
        b = twoAB + y;

        // If the values are too big, stop iteration
        if (dist(aSquared, bSquared, 0, 0) > 16) {
          break;
        }
        iterations += 1;
      }

      // Color each pixel based on how long it takes to get to infinity

      let index = (i + j * width) * 4;

      // Convert number of iterations to range of 0-1
      let normalized = map(iterations, 0, maxIterations, 0, 1);

      // Use square root of normalized value for color interpolation
      let lerpAmount = sqrt(normalized);

      // Set default color to black
      let pixelColor = color(0);

      // Blue
      let startColor = color(47, 68, 159);

      // Light yellow
      let endColor = color(255, 255, 128);

      // If iteration is under the maximum, interpolate a color
      if (iterations < maxIterations) {
        pixelColor = lerpColor(startColor, endColor, lerpAmount);
      }

      // Copy the RGBA values from the color to the pixel
      for (let i = 0; i < 4; i += 1) {
        pixels[index + i] = pixelColor.levels[i];
      }

      x += dx;
    }
    y += dy;
  }
  updatePixels();
}
