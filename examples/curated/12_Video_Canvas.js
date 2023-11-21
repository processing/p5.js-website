/*
 * @name Video Canvas
 * @description Load a video with multiple formats and draw it to the canvas.
 * To run this example locally, you will need a running 
 * <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.
 */

//Define video as a global variable.
let fingers;

function setup() {
  createCanvas(710, 400);

  //Upload your video in the canvas' assets directory, and
  //use the createVideo() function to load in your video.
  //It's best to upload multiple video formats so your video
  //is visible within different browsers.
  fingers = createVideo(['assets/fingers.mov', 'assets/fingers.webm']);
  
  //Use the hide() method to remove the DOM instance of the video.
  fingers.hide();
}

function draw() {
  background(150);

  //Draw the first instance of the video in the canvas.
  image(fingers, 10, 10);

  //Draw the second instance of the video, adding a grey
  //filter to the image.
  filter(GRAY);
  image(fingers, 150, 150);

  fingers.loop();
}

function mousePressed() {
  //Click the canvas to start playing the videos.
  fingers.loop();
}
