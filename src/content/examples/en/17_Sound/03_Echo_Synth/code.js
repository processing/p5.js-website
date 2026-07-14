colors = ['red', 'orange', 'limegreen', 'green', 'springgreen', 'cyan','dodgerblue', 'blue', 'violet', 'magenta', 'deeppink' ];

function setup() {
  createCanvas(400, 400);
  background(220);
  textAlign(CENTER);
  textSize(13);

  beep = new p5.Oscillator('sawtooth', 880);
  env = new p5.Envelope(0.04)
  myFilter = new p5.Biquad(400, 'lowpass');
  myFilter.res(10);
  myFilter.freq(2000);
  delay = new p5.Delay(0.250, 0.75)
  
  beep.disconnect();
  beep.connect(env);
  env.disconnect();
  env.connect(myFilter);
  myFilter.disconnect();
  myFilter.connect(delay)
  describe('A grey sketch that plays a note with a quick attack that echoes, pitches use the harmonic series.');
}

function mousePressed() {
  beep.freq(floor(random(2, 10)) * 100, 0)
  beep.start();
  env.play();
  background(random(colors))
}
  
function draw() {
  noFill();
  stroke(10);
  rect(0, 0, width, height);
  myFilter.freq(map(mouseX, width, 0, 80, 10000))
  let resonance = map(mouseY, 0, height, 0.1, 10.8);
  myFilter.res(resonance);
  stroke(0);
  text('click the mouse to produce a sound that echoes.', width/2, 150);
}