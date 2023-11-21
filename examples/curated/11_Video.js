/*
 * @name Video
 * @frame 710,250
 * @description Load a video with multiple formats and toggle between playing
 * and paused with a button press.
 */

//Create your global variables: playing, video, and button.
//Set playing to false so your video loads in as paused.
let playing = false;
let video;
let button;

function setup() {
  //Use the noCanvas() function to remove the canvas.
  noCanvas();

  //Upload your video in the canvas' assets directory, and
  //use the createVideo() function to load in your video.
  //It's best to upload multiple video formats so your video
  //is visible within different browsers.
  video = createVideo(['assets/fingers.mov', 'assets/fingers.webm']);

  //Create a button next to the video that says 'play.'
  button = createButton('play');

  //Your button will call the toggleVid() function
  //whenever it is pressed.
  button.mousePressed(toggleVid);
}

function toggleVid() {
  //If the video is playing, then pause the video with
  //the pause() method and make the button's text say 'play.'
  if (playing == true) {
    video.pause();
    button.html('play');

  //If the video is paused, then play the video with
  //the loop() method and make the button's text say 'pause.'
  } else {
    video.loop();
    button.html('pause');
  }

  //Switch playing to the opposite boolean value.
  playing = !playing;
}
