let osc, delay, env;

function setup() {
  let cnv = createCanvas(400, 400);
  background(220);
  textAlign(CENTER);
  textSize(13);
  text('click and drag mouse', width/2, 150);

  osc = new p5.Oscillator('sawtooth');
  osc.amp(0.74);
  env = new p5.Envelope(0.01);
  delay = new p5.Delay(0.12, 0.7);
  
  osc.disconnect();
  osc.connect(env);
  env.disconnect();
  env.connect(delay);

  cnv.mousePressed(oscStart);
  cnv.mouseReleased(oscStop);
  cnv.mouseOut(oscStop);
  describe('Click and release or hold, to play a square wave with delay effect.');
}

function oscStart() {
  background(0, 255, 255);
  text('release to hear delay', width/2, 150);
  osc.start();
  env.triggerAttack();
}

function oscStop() {
  background(220);
  text('click and drag mouse', width/2, 150);
  env.triggerRelease();
} 
  
function draw() {
  osc.freq(map(mouseY, height, 0, 440, 880))
  let dtime = map(mouseX, 0, width, 0.1, 0.5);
  delay.delayTime(dtime);
}