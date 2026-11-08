

async function setup() {
  sample = await loadSound("/assets/beat.mp3");
  sample.loop(true);
  createCanvas(400, 400);
  textAlign(CENTER);
  textWrap(WORD);
  textSize(10);
  describe("a sketch that changes the playback rate of a soundfile");
}

function draw() {
  background(220);
  rate = map(mouseX, 0, width, 0, 4);
  sample.rate(rate);
  if (!sample.isPlaying()) {
    text("click to play the sound, move your mouse to change the playback rate", 0, height/2, width);
  }
  else {
    text("Playback Rate: " + rate.toFixed(2), 0, height/2, width);
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
