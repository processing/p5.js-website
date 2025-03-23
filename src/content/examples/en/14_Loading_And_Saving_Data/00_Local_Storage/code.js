// Global array to hold all bubble objects
let bubbles;

// Store mouse press position so that a bubble can be created there
let mousePressX = 0;
let mousePressY = 0;

// Remember whether bubble is currently being created
let creatingBubble = false;

// Convert saved Bubble data into Bubble Objects
function loadData(bubblesData) {
  bubbles = [];
  for (let bubble of bubblesData) {
    // Get x,y from position
    let x = bubble.x;
    let y = bubble.y;

    // Get radius and name
    let radius = bubble.radius;
    let name = bubble.name;

    // Put object in array
    bubbles.push(new Bubble(x, y, radius, name));
  }
}

function setup() {
  let p5Canvas = createCanvas(640, 360);

  // Get saved data
  let savedData = getItem('bubbles');

  // If no data has been saved yet
  if (savedData === null) {
    // Use an empty array to start
    loadData([]);
  } else {
    // Otherwise convert the data to Bubble objects
    loadData(savedData);
  }

  // When canvas is clicked, call saveMousePress()
  p5Canvas.mousePressed(saveMousePress);

  ellipseMode(RADIUS);
  textSize(20);

  describe(
    'When the cursor clicks on the canvas, drags, and releases, a black outline circle representing a bubble appears on the white background. A prompt asks to name the bubble, and this name appears under the circle when the cursor hovers over it.'
  );
}

function draw() {
  background(255);

  // Display all bubbles
  for (let bubble of bubbles) {
    bubble.display();
  }

  // Display bubble in progress
  if (creatingBubble === true) {
    let radius = dist(mousePressX, mousePressY, mouseX, mouseY);
    noFill();
    stroke(0);
    strokeWeight(4);
    circle(mousePressX, mousePressY, radius);
  }

  // Label directions at bottom
  textAlign(LEFT, BOTTOM);
  fill(0);
  noStroke();
  text('Click and drag to add bubbles.', 10, height - 10);
}

// Save current mouse position to use as next bubble position
function saveMousePress() {
  mousePressX = mouseX;
  mousePressY = mouseY;
  creatingBubble = true;
}

// Add a bubble if in the process of creating one
function mouseReleased() {
  if (creatingBubble === true) {
    addBubble();
    creatingBubble = false;
  }
}

// Create a new bubble each time the mouse is clicked.
function addBubble() {
  // Add radius and label to bubble
  let radius = dist(mousePressX, mousePressY, mouseX, mouseY);
  let name = prompt('Enter a name for the new bubble');

  // If the user pressed 'Okay' and not 'Cancel'
  if (name !== null) {
    // Append the new JSON bubble object to the array
    bubbles.push(new Bubble(mousePressX, mousePressY, radius, name));
    storeItem('bubbles', bubbles);
  }
}

// Bubble class
class Bubble {
  constructor(x, y, radius, name) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.name = name;
  }

  // Check if mouse is over the bubble
  mouseOver() {
    let mouseDistance = dist(mouseX, mouseY, this.x, this.y);
    return mouseDistance < this.radius;
  }

  // Display the bubble
  display() {
    stroke(0);
    noFill();
    strokeWeight(4);
    circle(this.x, this.y, this.radius);
    if (this.mouseOver() === true) {
      fill(0);
      noStroke();
      textAlign(CENTER);
      text(this.name, this.x, this.y + this.radius + 30);
    }
  }
}
