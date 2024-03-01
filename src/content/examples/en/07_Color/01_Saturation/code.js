
function setup() {
  createCanvas(400, 400) ;
  colorMode(HSB);
}

function draw() {
  background (220)
  noStroke();

  for (let i = 0;i<6;i++){
    
    //with each iteration of the loop 
    //the saturation steps down by 20
    
    //fill(hue,saturation,brightness)
    fill (28,100 - i*20,95) ;

    rect (0,i*height/6,width,height/6) ;
  }
}
