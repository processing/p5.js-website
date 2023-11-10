/*
 * @name Alpha Mask
 * @arialabel An astronaut on a planet as the background with a slightly transparent version of this image on top that moves with the user’s mouse. Both have a light blue gradient on the right side.
 * @description Loads a "mask" for an image to specify the transparency in
 * different parts of the image. The two images are blended together using
 * the mask() method of p5.Image.
 * <p><em><span class="small"> To run this example locally, you will need two
 * image files, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">
 * local server</a>.</span></em></p>
 */
function preload() {
  img = loadImage("assets/image.jpg");
  imgMask = loadImage("assets/mask.png");
  imgMasked = loadImage("assets/image.jpg");
}

function setup() {
  createCanvas(1200, 400);
  imgMasked.mask(imgMask);

  //Label Alignment
  textAlign(LEFT, TOP);
}

function draw() {
  background(255);
  image(img, 0, 0, 400, 400);
  image(imgMask, 400, 0, 400, 400);
  image(imgMasked, 800, 0, 400, 400);

  //Labels
  textSize(24);
  fill(255);
  text("Image", 10, 10);
  fill(0);
  text("Mask", 410, 10);
  text("Masked Image", 810, 10);
}

//Images from Unsplash

//image.jpg -> Photo by Sergey Shmidt //https://unsplash.com/photos/koy6FlCCy5s

//mask.png -> Photo by Mockup Graphics
//https://unsplash.com/photos/_mUVHhvBYZ0
