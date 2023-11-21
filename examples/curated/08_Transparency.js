/*
 * @name Transparency
 * @arialabel An astronaut on planet as the background with a slightly transparent version of this image on top that moves with the horizontal direction of the user’s mouse
 * @description Move the pointer left and right across the image to change its
 * position. This program overlays one image over another by modifying the
 * alpha value of the image with the tint() function.
 * <p><em><span class="small"> To run this example locally, you will need an
 * image file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">
 * local server</a>.</span></em></p>
 */
//Define your global variables: img, offset, and easing.
//Set offset to 0 and easing to 0.05 for moving the 
//transparent image with your mouse position.
let img;
let offset = 0;
let easing = 0.05;

function setup() {
  createCanvas(720, 400);

  //Load your image from your canvas' assets directory.
  img = loadImage('assets/moonwalk.jpg');
}

function draw() {
  //Display the first image at full opacity.
  image(img, 0, 0);

  //Define dx as the rate at which the second image
  //moves with your mouse. The offset variable
  //delays the movement of the image.
  let dx = mouseX - img.width / 2 - offset;
  offset += dx * easing;

  //Display the second image at half opacity.
  tint(255, 127);
  image(img, offset, 0);
}
