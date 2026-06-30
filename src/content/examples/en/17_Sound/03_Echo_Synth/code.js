colors = ['red', 'orange', 'limegreen', 'green', 'springgreen', 'cyan','dodgerblue', 'blue', 'violet', 'magenta', 'deeppink' ];

function setup() {
  createCanvas(400, 400);
  background(220);
  textAlign(CENTER);
  textSize(13);

  beep = new p5.Oscillator('sawtooth', 880);
  env = new p5.Envelope(0.04)
  filty = new p5.Biquad(400, 'lowpass');
  filty.res(10);
  filty.freq(2000);
  delay = new p5.Delay(0.250, 0.75)
  
  beep.disconnect();
  beep.connect(env);
  env.disconnect();
  env.connect(filty);
  filty.disconnect();
  filty.connect(delay)
  
  describe('A grey sketch that plays a note with a quick attack that echoes, pitches use the harmonic series.');
}

function mousePressed() {
  beep.freq(floor(random(2, 10)) * 100, 0)
  beep.start();
  env.play();
  background(random(colors))
}
  
function draw() {
  filty.freq(map(mouseX, width, 0, 80, 10000))
  let resonance = map(mouseY, 0, height, 0.1, 10.8);
  filty.res(resonance);
  text('click the mouse to produce a sound that echoes.', width/2, 150);
}