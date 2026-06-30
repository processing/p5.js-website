function setup() {
  createCanvas(400, 400);
  background(220);
  textAlign(CENTER);
  textWrap(WORD);
  textSize(13);
  text('click and drag the mouse', width/2, 150);

  //initiallize the oscillator
  beep = new p5.Oscillator();
  
  describe('A grey sketch that demonstrates how to use the Oscillator class in p5.sound.');
}

function mousePressed() {
  beep.start();
}

function mouseReleased() {
  beep.stop();
}

function draw() {
  background(220);
  let frequency = map(mouseX, 0, width, 440, 880);
  let amp = map(mouseY, 0, height, 1, 0);
  beep.freq(frequency);
  beep.amp(amp);
  if (beep.started) {
    text('Frequency: ' + frequency.toFixed(0) + 'Hz', 0, height/2, width);
    text('Amplitude: ' + amp.toFixed(2), 0, height/2 + 20, width);
  }
  else {
    text('click and drag the mouse to change the frequency and amplitude values', 0, height/2, width);
  }
}