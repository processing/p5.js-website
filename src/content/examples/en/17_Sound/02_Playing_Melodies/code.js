// D Minor Pentatonic Scale
let notes = [293.66, 349.23, 392.00, 440.00, 523.25, 586];
//uncomment the line below to use note names instead of frequencies
//notes = ['D3', 'F3', 'G3', 'A3', 'C4', 'D4'];

function setup() {
  createCanvas(400, 400);
  background(220);
  textAlign(CENTER);
  textSize(13);
  text('click and drag mouse around', width/2, 150);

  osc = new p5.Oscillator("square");
  //create an envelope to control the amplitude of the oscillator
  env = new p5.Envelope(0.03, 0.01, 0.7, 0.2);
  delay = new p5.Delay(0.12, 0.7);
  
  osc.disconnect();
  osc.connect(env);
  env.disconnect();
  env.connect(delay);

  describe('A grey sketch that demonstrates how to play a D Minor Pentatonic scale.');
}

function mousePressed() {
  background(0, 255, 255);
  text('move the mouse left to right to change notes', width/2, 150);
  osc.start();
  //trigger the attack, or onset, of the envelope to start the sound
  env.triggerAttack();
}

function mouseReleased() {
  background(220);
  text('click and drag mouse', width/2, 150);
  //trigger the release of the envelope to stop the sound
  env.triggerRelease();
} 
  
function draw() {
  //map the mouseX position to the pentatonic scale
  scaleDegree = floor(map(mouseX, 0, width, 0, notes.length - 1))
  osc.freq(notes[scaleDegree], 0.025)
}