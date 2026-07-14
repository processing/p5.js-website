async function setup() {
  sample = await loadSound("assets/sounds/beat.mp3");
  sample.loop(true);
  createCanvas(100, 100);
  textAlign(CENTER);
  textWrap(WORD);
  textSize(10);
  describe("a sketch that changes the playback rate of a soundfile");
}

function draw() {
  background(220);
  rate = map(mouseX, 0, width, 0.5, 2);
  sample.rate(rate);
  if (!sample.isPlaying()) {
    text("click to play the sound, move your mouse to change the playback rate", 0, 20, width);
  }
  else {
    text("Playback Rate: " + rate.toFixed(2), 0, 20, width);
  }
}

function mousePressed() {
  if(!sample.isPlaying()) {
    sample.play();
  }
  else {
    sample.stop();
  }
}
