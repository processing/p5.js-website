/*
 * @name Snake game
 * @description This is a reproduction of a type of arcade game called
 * Snake. The first Snake game was Blockade, released in 1976, and many
 * games use the same structure. In Snake games, the player controls
 * the movements of a snake, represented in this example by a green
 * line. The player's goal is to collide the snake with a fruit,
 * represented by a red dot. Each time the snake collides with a fruit,
 * the snake grows longer. The player's goal is grow the snake as long
 * as possible without colliding the snake into itself or into the edges
 * of the play area.
 *
 * This example uses an array of
 * <a href="https://p5js.org/reference/#/p5.Vector" target="_blank">vectors</a>
 * to store the positions of each of the segments of the snake. The arrow
 * keys control the snake's movement.
 */

// The snake moves along a grid, one space at a time
// The grid is smaller than the canvas, and its dimensions
//  are stored in these variables
let gridWidth = 30;
let gridHeight = 30;

let gameStarted = false;

// How many segments snake starts with
let startingSegments = 10;

// Starting coordinates for first segment
let xStart = 0;
let yStart = 15;

// Starting direction of motion
let startDirection = 'right';

// Current direction of motion
let direction = startDirection;

// The snake is divided small segments,
//  stored as vectors in this array
let segments = [];

let score = 0;

// The fruit's position is stored as a vector
//  in this variable
let fruit;

function setup() {
  createCanvas(500, 500);

  // Adjust frame rate to set movement speed
  frameRate(10);

  textAlign(CENTER, CENTER);
  textSize(2);

  describe(
    'A reproduction of the arcade game Snake, in which a snake, represented by a green line on a black background, is controlled by the arrow keys. Users move the snake toward a fruit, represented by a red dot, but the snake must not hit the sides of the window or itself.'
  );
}

function draw() {
  background(0);
  // Set scale so that the game grid fills canvas
  scale(width / gridWidth, height / gridHeight);
  if (gameStarted === false) {
    showStartScreen();
  } else {
    // Shift over so that snake and fruit are still on screen
    //  when their coordinates are 0
    translate(0.5, 0.5);
    showFruit();
    showSegments();
    updateSegments();
    checkForCollision();
    checkForFruit();
  }
}

function showStartScreen() {
  noStroke();
  fill(32);
  rect(2, gridHeight / 2 - 5, gridWidth - 4, 10, 2);
  fill(255);
  text(
    'Click to play.\nUse arrow keys to move.',
    gridWidth / 2,
    gridHeight / 2
  );
  noLoop();
}

function mousePressed() {
  if (gameStarted === false) {
    startGame();
  }
}

function startGame() {
  // Put the fruit in a random place
  updateFruitCoordinates();

  // Start with an empty array for segments
  segments = [];

  // Start with coordinates at the starting position
  let y = yStart;
  let x = xStart;

  // Repeat until the number of segments matches the
  //  starting number
  while (segments.length < startingSegments) {
    let segmentPosition = createVector(x, y);
    segments.push(segmentPosition);
    x = x + 1;
  }

  direction = startDirection;
  score = 0;
  gameStarted = true;
  loop();
}

function showFruit() {
  stroke(255, 64, 32);
  point(fruit.x, fruit.y);
}

function showSegments() {
  noFill();
  stroke(96, 255, 64);
  beginShape();
  for (let segment of segments) {
    vertex(segment.x, segment.y);
  }
  endShape();
}

function updateSegments() {
  // Copy all segments, except the last to the previous segment.
  // This causes each segment to appear to move in the direction of
  //  the snake's body
  for (let i = 0; i < segments.length - 1; i++) {
    segments[i] = segments[i + 1].copy();
  }

  // Store last segment in array as head
  let head = segments[segments.length - 1];

  // Adjust the head's position based on the current direction
  switch (direction) {
    case 'right':
      head.x = head.x + 1;
      break;
    case 'up':
      head.y = head.y - 1;
      break;
    case 'left':
      head.x = head.x - 1;
      break;
    case 'down':
      head.y = head.y + 1;
      break;
  }
}

function checkForCollision() {
  // Store last segment in array as head
  let head = segments[segments.length - 1];

  // If snake's head...
  if (
    // hit right edge or
    head.x >= gridWidth ||
    // hit left edge or
    head.x < 0 ||
    // hit bottom edge or
    head.y >= gridHeight ||
    // hit top edge or
    head.y < 0 ||
    // Collided with itself
    selfColliding() === true
  ) {
    // Show game over screen
    gameOver();
  }
}

function gameOver() {
  noStroke();
  fill(32);
  rect(2, gridHeight / 2 - 5, gridWidth - 4, 10, 2);
  fill(255);
  text(
    'Game over!\nYour score: ' + score + '\nClick to play again.',
    gridWidth / 2,
    gridHeight / 2
  );
  gameStarted = false;
  noLoop();
}

function selfColliding() {
  // Store the last segment as head
  let head = segments[segments.length - 1];

  // Store every segment except the last
  let segmentsBeforeHead = segments.slice(0, -1);

  // Check each of the other segments
  for (let segment of segmentsBeforeHead) {
    // If segment is in the same place as head
    if (segment.equals(head) === true) {
      return true;
    }
  }
  return false;
}

function checkForFruit() {
  let head = segments[segments.length - 1];

  // If the head segment is in the same place as the fruit
  if (head.equals(fruit) === true) {
    // Give player a point
    score = score + 1;

    // Duplicate the tail segment
    let tail = segments[0];
    let newSegment = tail.copy();

    // Put the duplicate in the beginning of the array
    segments.unshift(newSegment);

    // Reset fruit to a new location
    updateFruitCoordinates();
  }
}

function updateFruitCoordinates() {
  // Pick a random new coordinate for the fruit
  //  and round it down using floor().
  // Because the segments move in increments of 1,
  //  in order for the snake to hit the same position
  //  as the fruit, the fruit's coordinates must be
  //  integers, but random() returns a float
  let x = floor(random(gridWidth));
  let y = floor(random(gridHeight));
  fruit = createVector(x, y);
}

// When an arrow key is pressed switch the snake's direction of movement,
//  but if the snake is already moving in the opposite direction,
//  do nothing.
function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
      if (direction !== 'right') {
        direction = 'left';
      }
      break;
    case RIGHT_ARROW:
      if (direction !== 'left') {
        direction = 'right';
      }
      break;
    case UP_ARROW:
      if (direction !== 'down') {
        direction = 'up';
      }
      break;
    case DOWN_ARROW:
      if (direction !== 'up') {
        direction = 'down';
      }
      break;
  }
}
