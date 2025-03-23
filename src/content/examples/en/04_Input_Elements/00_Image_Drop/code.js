// Define canvasText as a global variable.
let canvasText = 'Drag an image file onto the canvas.';

function setup() {
  // Assign the dropArea variable to the canvas.
  let dropArea = createCanvas(710, 400);

  // Add the drop() method to the canvas. Call the gotFile
  // function when a file is dropped into the canvas.
  dropArea.drop(gotFile);
  noLoop();
}

function draw() {
  background(100);

  // Add instructions for dropping an image file in the canvas.
  fill(255);
  noStroke();
  textSize(24);
  textAlign(CENTER);
  text(canvasText, width / 2, height / 2);

  describe(`Grey canvas with the text "${canvasText}" in the center.`);
}

function gotFile(file) {
  // If the file dropped into the canvas is an image,
  // create a variable called img to contain the image.
  // Remove this image file from the DOM and only
  // draw the image within the canvas.
  if (file.type === 'image') {
    // Pass in an empty string for the alt text. This should only be done with
    // decorative photos.
    let img = createImg(file.data, '').hide();
    image(img, 0, 0, width, height);
  } else {
    // If the file dropped into the canvas is not an image,
    // change the instructions to 'Not an image file!'
    canvasText = 'Not an image file!';
    redraw();
  }
}
