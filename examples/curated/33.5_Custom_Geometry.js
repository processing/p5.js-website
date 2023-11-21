/**
 * @name Custom Geometry
 * @description The `buildGeometry()` function store shapes into a model that can
 * be efficiently used and reused.
 */

let snake;

function setup() {
  createCanvas(700, 400, WEBGL);
  buildSnake();
  
  describe('A tiled plane of snake models');
}

function buildSnake() {
  // If there was a previous snake, we're going to replace it,
  // so we can free its resources to save memory
  if (snake) {
    freeGeometry(snake);
  }
  
  snake = buildGeometry(() => {
    colorMode(HSB, 100);
    fill(random(100), 50, 100);
    
    // Draw the head
    push();
    scale(1, 0.5, 1.4);
    sphere(50);
    pop();
    
    // Draw eyes
    for (let mirrorX of [-1, 1]) {
      push();
      scale(mirrorX, 1, 1);
      fill('black');
      translate(20, -20, 10)
      sphere(10);
      pop();
    }
    translate(0, 0, 50);
    
    // Draw body
    let numSegments = ceil(random(10, 30));
    for (let segment = 0; segment < numSegments; segment++) {
      rotateY(random(-1, 1) * PI * 0.3);
      translate(0, 0, 50);
      push();
      rotateX(PI/2);
      scale(1, 1, 0.5);
      let radius = map(segment, numSegments - 5, numSegments, 50, 0, true);
      cylinder(radius, 100);
      pop();
      translate(0, 0, 50);
    }
  });

  // Recenter the model and scale it to a common size
  snake.normalize();
}

function draw() {
  // Every 4 seconds, generate a new snake
  if (frameCount % 240 === 0) {
    buildSnake();
  }
  
  background(255);
  noStroke();
  scale(1.5);

  // Slowly orbit around the plane of snakes
  rotateX(PI * -0.2);
  rotateY(frameCount * 0.01);

  // Set up the material and shininess
  lights();
  specularMaterial('white')
  shininess(100);

  // Tile the snake model a number of times along the ground
  for (let x = -4; x <= 4; x++) {
    for (let z = -4; z <= 4; z++) {
      push();
      translate(x * 200, 0, z * 200);
      model(snake);
      pop();
    }
  }
}
