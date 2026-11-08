let synth, ctx;
let scale = ["C3", "D3", "Eb3", "F3", "G3", "A3", "Bb3"];
let analyzer;

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER);
  textWrap(WORD);
  textSize(16);

  //get the p5.sound.js Audio Context
  ctx = getAudioContext()
  //set the Tone.js Audio Context to match the p5.sound.js context
  Tone.setContext(ctx)
  //create a new MonoSynth from the Tone.js library
  synth = new Tone.MonoSynth();
  //create a new p5.sound.js Reverb effect
  rev = new p5.Reverb(3)
  //connect the MonoSynth to the Reverb
  rev.setInput(synth)

  analyzer = new p5.FFT();
  rev.connect(analyzer);
}

function draw() {
  background(220);
  text("Click to play a random note from the scale using the Tone.js MonoSynth", 0, 20, width);
  let samples = analyzer.waveform();
  
  push();
  fill(255, 100, 100, 55);
  
  beginShape();
  stroke(20);
  
  for (let i = 0; i < samples.length; i++){
    let x = map(i, 0, samples.length, 0, width);
    let y = map(samples[i], -1, 1, 0, height);
    vertex(x,y);
  }
  endShape();
  pop();

}

function mousePressed() {
  synth.triggerAttackRelease(scale[int(random(scale.length))], "0.35");
}