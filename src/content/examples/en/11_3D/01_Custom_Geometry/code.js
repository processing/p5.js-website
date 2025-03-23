let snake;

function setup() {
  createCanvas(700, 400, WEBGL);
  angleMode(DEGREES);
  buildSnake();
  describe('A tiled plane of snake models');
}

function buildSnake() {
  // If there was a previous snake, we're going to replace it
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
      translate(20, -20, 10);
      sphere(10);
      pop();
    }
    translate(0, 0, 50);

    // Draw body
    let numSegments = ceil(random(10, 30));
    for (let segment = 0; segment < numSegments; segment++) {
      rotateY(random(-60, 60));
      translate(0, 0, 50);
      push();
      rotateX(90);
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
  background(255);
  noStroke();
  scale(1.5);

  // Slowly orbit around the plane of snakes
  rotateX(-45);
  rotateY(frameCount * 0.25);

  // Set up the material and shininess
  lights();
  specularMaterial('white');
  shininess(100);

  // Tile the snake model a number of times along the ground
  for (let x = -4; x <= 4; x += 1) {
    for (let z = -4; z <= 4; z += 1) {
      push();
      translate(x * 200, 0, z * 200);
      model(snake);
      pop();
    }
  }
}

// When mouse is pressed, generate a new snake
function mousePressed() {
  buildSnake();
}
