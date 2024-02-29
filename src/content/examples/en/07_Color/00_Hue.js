
function setup() {
  createCanvas(400, 400) ;
  colorMode(HSB);
}

function draw() {
  background (220)
  noStroke();

  for (let i = 0;i<12;i++){
    
    //with each iteration of the loop 
    //the hue steps down by 25
    
    //fill(hue,saturation,brightness)
    fill (360-i*25,100,100) ;

    rect (0,i*height/12,width,height/12) ;
  }
}
