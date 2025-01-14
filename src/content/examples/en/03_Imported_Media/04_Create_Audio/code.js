// Declare variable to store audio player
let audioPlayer;

function setup() {
  // Remove canvas
  noCanvas();

  // Create audio player using path to audio file
  // This can also be a URL for a public file
  // On the p5 Editor, a file may be uploaded to Sketch Files
  // by clicking the > button on the upper left, followed by the + button
  audioPlayer = createAudio('assets/piano-loop.mp3');

  // Add description for assistive technologies to explain playback speed
  audioPlayer.attribute(
    'aria-description',
    'The playback speed of this audio player is controlled by the position of the mouse. The further to the right the mouse is, the faster the audio will play.'
  );

  // Display player controls
  audioPlayer.showControls();
}

function draw() {
  // Set playback speed to 1-2x normal based on mouse position
  audioPlayer.speed(1 + mouseX / windowWidth);
}
