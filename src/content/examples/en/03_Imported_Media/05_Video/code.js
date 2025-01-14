// Create the global variables: playing, video, and button.
// Set playing to false so the video loads in as paused.
let playing = false;
let video;
let button;

function setup() {
  // Use the noCanvas() function to remove the canvas.
  noCanvas();

  // Upload the video in the canvas's assets directory, and
  // use the createVideo() function to load in the video to the code.
  // This createVideo() function will build a p5.MediaElement class.
  // It's best to upload multiple video formats so the video
  // is visible within different browsers.
  video = createVideo(['assets/fingers.mov', 'assets/fingers.webm']);

  // Create a button next to the video that says 'play.'
  button = createButton('play');

  // The button will call the toggleVid() function
  // whenever it is pressed.
  button.mousePressed(toggleVid);
}

function toggleVid() {
  // If the video is playing, pause the video with
  // the pause() method and make the button's text say 'play.'
  if (playing == true) {
    video.pause();
    button.html('play');

    // If the video is paused, play the video with
    // the loop() method and make the button's text say 'pause.'
  } else {
    video.loop();
    button.html('pause');
  }

  // Once the video playing status has been toggled,
  // switch playing to the opposite boolean value.
  playing = !playing;
}
