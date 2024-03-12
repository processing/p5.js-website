
let noise, env, analyzer;

function setup() {
  createCanvas(710, 200);
  noise = new p5.Noise(); // other types include 'brown' and 'pink'
  noise.start();

  // multiply noise volume by 0
  // (keep it quiet until we're ready to make noise!)
  noise.amp(0);

  env = new p5.Env();
  // set attackTime, decayTime, sustainRatio, releaseTime
  env.setADSR(0.001, 0.1, 0.2, 0.1);
  // set attackLevel, releaseLevel
  env.setRange(1, 0);

  // p5.Amplitude will analyze all sound in the sketch
  // unless the setInput() method is used to specify an input.
  analyzer = new p5.Amplitude();
}

function draw() {
  background(0);

  // get volume reading from the p5.Amplitude analyzer
  let level = analyzer.getLevel();

  // use level to draw a green rectangle
  let levelHeight = map(level, 0, 0.4, 0, height);
  fill(100, 250, 100);
  rect(0, height, width, -levelHeight);
}

function mousePressed() {
  env.play(noise);
}
