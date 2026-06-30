let verb, filter;
let soundFile;

async function setup(){
  let cnv = createCanvas(400,400);
  soundFile = await loadSound('assets/chime.mp3')
  cnv.mouseClicked(togglePlay);
  filter = new p5.Biquad(800, 'lowpass');
  filter.res(30);
  verb = new p5.Reverb(0.850);
  fft = new p5.FFT(32);
  soundFile.disconnect();
  soundFile.amp(2.0)
  soundFile.connect(filter);
  filter.disconnect();
  filter.connect(verb);
  verb.connect(fft);
}

function draw(){
  background(220);
  // Visualize the frequency spectrum
  let spectrum = fft.analyze();
  noStroke();
  
  push();
  fill(255, 0, 0);
  for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width);     
    let h = -height + map(spectrum[i], 0, 0.1, height, -1000);
    rect(x, height, width / spectrum.length, h )
  }
  pop();

  // Visualize the waveform
  let waveform = fft.waveform();

  push();
  noFill();
  beginShape();
  stroke(20);
  for (let i = 0; i < waveform.length; i++){
    let x = map(i, 0, waveform.length, 0, width);
    let y = map( waveform[i], -1, 1, 0, height);
    vertex(x,y);
  }
  endShape();
  pop();

  textAlign(CENTER);
  text('click to start playback', width/2, 20);
  filter.freq(map(mouseX, 0, width, 40, 14000))
  describe('The sketch displays the frequency spectrum and waveform of the sound that plays.');
}

function togglePlay() {
  soundFile.play();
}