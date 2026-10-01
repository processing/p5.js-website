async function setup() {
  createCanvas(400, 400);
  song = await loadSound('/assets/drums.mp3');
  song.loop();

  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Patch the sound file output to the analyzer
  song.connect(analyzer);
}

function draw() {
  background(220);

  // Get the average (root mean square) amplitude
  let rms = analyzer.getLevel();
  
  push();
  fill(127);
  stroke(0);
  pop();

  textAlign(CENTER);

  // Draw an ellipse with size based on volume
  ellipse(width / 2, height / 2, 10 + rms * 200, 10 + rms * 200);

  if (song.isPlaying()) {
    text('click to stop the song', width / 2, 50);
  } else {
    text('click to play the song', width / 2, 50);
  }
}

function mousePressed() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.play();
  }
}