/*
 * @name Blur
 * @arialabel Astronaut rendered in black and white on the left and a blurred version of the image on the right
 * @description A low-pass filter that blurs an image. This program analyzes every pixel in an image and blends it with all the neighboring pixels to blur the image.
 * <br><br><span class="small"><em>This example is ported from the <a href="https://processing.org/examples/blur.html">Blur example</a>
 * on the Processing website</em></span>
 */
// to consider all neighboring pixels we use a 3x3 array
// and normalize these values
// v is the normalized value
let v = 1.0 / 9.0;
// kernel is the 3x3 matrix of normalized values
let kernel = [
  [v, v, v],
  [v, v, v],
  [v, v, v]
];

// preload() runs once, before setup()
// loadImage() needs to occur here instead of setup()
// if loadImage() is called in setup(), the image won't appear
// since noLoop() restricts draw() to execute only once
// (one execution of draw() is not enough time for the image to load),
// preload() makes sure image is loaded before anything else occurs
function preload() {
  // load the original image
  img = loadImage('/assets/rover.png');
}

// setup() runs once after preload
function setup() {
  // create canvas
  createCanvas(710, 400);
  // noLoop() makes draw() run only once, not in a loop
  noLoop();
}

// draw() runs after setup(), normally on a loop
// in this case it runs only once, because of noDraw()
function draw() {
  // place the original image on the upper left corner
  image(img, 0, 0);

  // create a new image, same dimensions as img
  edgeImg = createImage(img.width, img.height);

  // load its pixels
  edgeImg.loadPixels();

  // two for() loops, to iterate in x axis and y axis
  // since the kernel assumes that the pixel
  // has pixels above, under, left, and right
  // we need to skip the first and last column and row
  // x then goes from 1 to width - 1
  // y then goes from 1 to height - 1
  for (let x = 1; x < img.width; x++) {
    for (let y = 1; y < img.height; y++) {
      // kernel sum for the current pixel starts as 0
      let sum = 0;

      // kx, ky variables for iterating over the kernel
      // kx, ky have three different values: -1, 0, 1
      for (kx = -1; kx <= 1; kx++) {
        for (ky = -1; ky <= 1; ky++) {
          let xpos = x + kx;
          let ypos = y + ky;

          // since our image is grayscale,
          // RGB values are identical
          // we retrieve the red value for this example
          // (green and blue work as well)
          let val = red(img.get(xpos, ypos));

          // accumulate the  kernel sum
          // kernel is a 3x3 matrix
          // kx and ky have values -1, 0, 1
          // if we add 1 to kx and ky, we get 0, 1, 2
          // with that we can use it to iterate over kernel
          // and calculate the accumulated sum
          sum += kernel[kx + 1][ky + 1] * val;
        }
      }

      // set the value of the edgeImg pixel to the kernel sum
      edgeImg.set(x, y, color(sum));
    }
  }
  // updatePixels() to write the changes on edgeImg
  edgeImg.updatePixels();

  // draw edgeImg at the right of the original image
  image(edgeImg, img.width, 0);
}
