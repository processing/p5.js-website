/*
 * @name Drop
 * @description Using drop, drag an image file onto the canvas to see it displayed. [checks to make sure it's an image file, and offers feedback if its not an img file.]
 */
function setup() {
  //Define your canvas as the image drop area.
  let dropArea = createCanvas(710, 400);
  background(100);

  //Add the drop() method to the canvas. Call the gotFile 
  //function when a file is dropped into the canvas.
  dropArea.drop(gotFile);
}

function draw() {
  //Add text in the center of the canvas with drop instructions.
  fill(255);
  noStroke();
  textSize(24);
  textAlign(CENTER);
  text('Drag an image file onto the canvas.', width / 2, height / 2);
  noLoop();
}

function gotFile(file) {
  //If the file dropped into the canvas is an image,
  //create a variable called img to contain the image.
  //Remove this image file from the DOM, and only
  //draw the image within the canvas.
  if (file.type === 'image') {
    let img = createImg(file.data).hide();
    image(img, 0, 0, width, height);
  } else {
    //If the file dropped into the canvas is not an image,
    //submit 'Not an image file!' into the browser console.
    console.log('Not an image file!');
  }
}