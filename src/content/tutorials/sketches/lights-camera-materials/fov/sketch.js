let fovDisplay;
let distDisplay;
let w = 200
let h = 200

let cameraView
let outsideView

function setup() {
  createCanvas(2*w, h, WEBGL);
  cameraView = createFramebuffer({ width: w, height: h });
  outsideView = createFramebuffer({ width: w, height: h });
  fovDisplay = createP().position(0, 200);
  distDisplay = createP().position(0, 230);
}

function draw() {
  background(255);
  noStroke();
  
  const distanceAway = map(
    sin(millis() * 0.001),
    -1, 1,
    80, 600
  );
  const fov = 2 * Math.atan(h / 2 / distanceAway);
  fovDisplay.html(`FOV: ${round(degrees(fov))}°`)
  distDisplay.html(`Distance: ${round(distanceAway)}`)
  
  const drawScene = () => {
    push();
    translate(-70, -70, 0);
    normalMaterial();
    sphere(20);
    pop();

    push();
    translate(70, 70, 0);
    rotateY(PI*0.1);
    normalMaterial();
    torus(20, 5);
    pop();

    push()
    translate(0, 0, -100);
    rotateX(PI/4);
    rotateY(PI/4);
    normalMaterial();
    box(80);
    pop();
  };
  
  cameraView.draw(() => {
    background(255, 220, 220);
    camera(0, 0, distanceAway);
    perspective(fov, w/h, 0.1, 1000);
    drawScene();
  });
  outsideView.draw(() => {
    background(220, 220, 255);
    translate(0, -200, -700);    
    
    // Visualize camera view
    push();
    fill(255, 0, 0, 100);
    const extend = 400;
    const totalDist = distanceAway + extend;
    triangle(
      0, distanceAway,
      -w/2 * (totalDist/distanceAway), -extend,
      w/2 * (totalDist/distanceAway), -extend,
    );
    pop();
    
    push();
    stroke(255, 0, 0);
    strokeWeight(20);
    line(-w/2, 0, w/2, 0);
    pop();
    drawingContext.clear(drawingContext.DEPTH_BUFFER_BIT);
    
    push();
    rotateX(-PI/2);
    drawScene();
    pop();
  });
  
  imageMode(CENTER);
  image(cameraView, -w/2, 0);
  image(outsideView, w/2, 0);
}
