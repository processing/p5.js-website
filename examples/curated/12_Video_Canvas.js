/*
 * @name Video Canvas
 * @description Using the <a href="https://p5js.org/reference/#/p5/createVideo" target="_blank">createVideo()</a> 
 * and <a href="https://p5js.org/reference/#/p5/image" target="_blank">image()</a> functions, you can upload a video into 
 * the canvas. Since the video capture is passed through the 
 * <a href="https://p5js.org/reference/#/p5/image" target="_blank">image()</a> constructor, you can add filters to the 
 * video capture using the <a href="https://p5js.org/reference/#/p5/filter" target="_blank">filter()</a> method. To run this example locally, 
 * you will need a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.
 */
// Define video and playing as global variables.
// Set playing to false so the videos are paused when loaded into the canvas.
let video;
let playing = false;

function setup() {
  createCanvas(710, 400);

  // Upload the video in the canvas' assets directory, and
  // use the createVideo() function to load the video into the code.
  // It's best to upload multiple video formats so the video
  // is visible within different browsers.
  video = createVideo(['assets/fingers.mov', 'assets/fingers.webm']);
  
  // By default, the video will render as its own DOM element. 
  // Use the hide() method to remove the DOM instance of the video.
  video.hide();
}

function draw() {
  describe('Two videos in the top right and bottom center of the canvas, with the text "Click the canvas to start and pause the video feed." in the top left corner.');
  background(240);

  // Add instructional text to the top right of the canvas.
  textSize(16);
  text('Click the canvas to start and pause the video feed.', 345, 50);

  // Draw the first instance of the video in the canvas.
  image(video, 10, 10);

  // Draw the second instance of the video, adding a grey
  // filter to the image.
  filter(GRAY);
  image(video, 150, 150);
}

function mousePressed() {

  // When the canvas is clicked, check to see if the videos are
  // paused or playing. If it is playing, pause the videos.
  if (playing) {
    video.pause();
  } else {

  // If it is paused, play the videos.
    video.loop();
  }

  // Change the playing value to the opposite boolean.
  playing = !playing;
}
