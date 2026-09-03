// Variable for frequency (middle C).
let myFreq = 262;

// Variable for Oscillator.
let osc;

function setup() {
  createCanvas(400, 400);
  
  /* Create an Oscillator object with a 
  Frequency defined by the variable myFreq */
  osc = new p5.Oscillator(myFreq);
  //console.log(osc)
}

function draw() {
  background(220);
}

function mousePressed() {
  //toggle the note that is playing 
  if(osc.started){
    osc.stop();
  } else {
    osc.start();
  }
}