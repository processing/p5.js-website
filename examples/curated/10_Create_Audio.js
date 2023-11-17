/**
 * @name Create Audio
 * @description <a href="https://p5js.org/reference/#/p5/createAudio" target="_blank">createAudio()</a>
 * creates an audio player. This example displays the player's controls
 * and adjusts its speed. The playback speed is normal when the mouse
 * is on the left edge of the window, and it gets faster as the mouse
 * moves to the right. More information on using media elements such as
 * audio players is on the
 * <a href="https://p5js.org/reference/#/p5.MediaElement" target="_blank">p5.MediaElement</a>
 * reference page. The audio file is a
 * <a href="https://freesound.org/people/josefpres/sounds/711156/" target="_blank">
 * public domain piano loop by Josef Pres</a>.
 */

// Declare variable to store audio player
let audioPlayer;

function setup() {
  // Remove canvas
  noCanvas();

  // Create audio player using path to audio file
  audioPlayer = createAudio("assets/piano-loop.mp3");

  // Display player controls
  audioPlayer.showControls();
}

function draw() {
  // Set playback speed to 1-2x normal based on mouse position
  audioPlayer.speed(1 + mouseX / windowWidth);
}
