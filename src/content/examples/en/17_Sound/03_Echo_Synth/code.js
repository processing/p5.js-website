
let colors = ['red', 'orange', 'limegreen', 'green', 'springgreen', 'cyan','dodgerblue', 'blue', 'violet', 'magenta', 'deeppink' ];
let color = 'red';

function setup() {
  createCanvas(400, 400);
  background(color);
  textAlign(CENTER);
  textSize(13);
  //create a 'sawtooth' oscillator
  //a sawtooth wave form has a grittier texture than the sine wave form
  beep = new p5.Oscillator('sawtooth', 880);
  //create an envelope to control the amplitude of the oscillator
  myEnvelope = new p5.Envelope(0.04)
  //create a filter to shape the sound of the oscillator
  myFilter = new p5.Biquad(400, 'lowpass');
  myFilter.res(10);
  myFilter.freq(2000);
  //make a delay to create an echo effect
  delay = new p5.Delay(0.250, 0.75)

  //connections 
  //disconnect the oscillator from the main output
  beep.disconnect();
  //connect the oscillator to the envelope
  beep.connect(myEnvelope);
  //disconnect the envelope from the main output
  myEnvelope.disconnect();
  //connect the envelope to the filter
  myEnvelope.connect(myFilter);
  myFilter.disconnect();
  myFilter.connect(delay)
  describe('A grey sketch that plays a note with a quick attack that echoes, pitches use the harmonic series.');
}

function mousePressed() {
  beep.freq(floor(random(2, 10)) * 100, 0)
  beep.start();
  myEnvelope.play();
  color = random(colors);
}
  
function draw() {
  background(color);
  
  let frequency = map(mouseX, 0, width, 80, 10000);
  myFilter.freq(frequency);
  let resonance = map(mouseY, 0, height, 0.1, 10.8);
  myFilter.res(resonance);
  
  text('click around to produce echoey sounds.', width/2, 150);
  text('filter frequency: ' + frequency.toFixed(0) + 'Hz', width/2, 170);
}