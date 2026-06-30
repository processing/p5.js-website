function setup() {
  createCanvas(400, 400);
  background(220);
  textAlign(CENTER);
  textWrap(WORD);
  textSize(13);
  text('click to hear the wind', width/2, height/2);

  whiteNoise = new p5.Noise('white');
  filty = new p5.Biquad(400, 'lowpass')
  
  whiteNoise.disconnect();
  whiteNoise.connect(filty);
  
  describe('A grey sketch that demonstrates how to create wind and ocean sounds.');
}

function mousePressed() {
  background(0, 255, 255);
  text('release the mouse to stop the wind, move mouse to change filter frequency',0, height/2, width);
  whiteNoise.start()
}

function mouseReleased() {
  background(220);
  text('click to hear the wind', width/2, height/2);
  whiteNoise.stop();
} 
  
function draw() {
  filty.freq(map(mouseX, 0, width, 200, 18000))
}