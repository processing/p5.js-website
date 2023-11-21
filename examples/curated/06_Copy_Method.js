/*
 * @name Copy() method
 * @frame 600,400
 * @description An example of how to simulate coloring image with the copy() method. [loads image, uses copy to do something to the images]
 */
//Define your global variables: bottomImg and topImg.
let bottomImg, topImg;

function preload() {
  //Preload the images from the canvas' assets directory.
  //The bottomImg is the photograph with color,
  //and the topImg is the black-and-white photograph.
  bottomImg = loadImage('assets/parrot-color.png');
  topImg = loadImage('assets/parrot-bw.png');
}
function setup() {
  createCanvas(600, 400);

  //Hide the cursor and replace it with a picture of 
  //a paint brush.
  noCursor();
  cursor('assets/brush.png', 20, -10);

  //Load the images on top of each other.
  image(bottomImg, 0, 0);
  image(topImg, 0, 0);
}
function mouseDragged() {
  //Using the copy() function, copy the bottom image
  //on top of the top image when you drag your cursor
  //across the canvas.
  copy(bottomImg, mouseX, mouseY, 20, 20, mouseX, mouseY, 20, 20);
}