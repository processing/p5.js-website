// Preload the image assets from the canvas
// assets directory.
function preload() {
  // Photo by Sergey Shmidt, https://unsplash.com/photos/koy6FlCCy5s
  img = loadImage('/assets/image.jpg');

  // Photo by Mockup Graphics, https://unsplash.com/photos/_mUVHhvBYZ0
  imgMask = loadImage('/assets/mask.png');
}

function setup() {
  describe(
    'Two photos, the one on the left labeled with "Masked Image" and the one on the right labeled with "Mask."'
  );
  createCanvas(710, 400);

  // Use the mask() method to apply imgMask photo as a
  // mask for img.
  img.mask(imgMask);

  // Set the alignment of the text labels.
  textAlign(LEFT, TOP);
}

function draw() {
  background(255);

  // Draw the masked image on the left, then
  // the photo used to mask on the right.
  describeElement(
    'Masked Image',
    'A photo of yellow flowers masked by a photo of two leaves.'
  );
  image(img, 0, 0, 350, 350);

  describeElement(
    'Mask',
    'The photo of two leaves used to mask the previous photo.'
  );
  image(imgMask, 350, 0, 350, 350);

  // Add labels to explain the images shown.
  textSize(24);
  fill(0);
  text('Masked Image', 10, 10);
  text('Mask', 360, 10);
}
