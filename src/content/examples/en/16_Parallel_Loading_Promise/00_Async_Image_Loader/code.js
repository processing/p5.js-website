// PromiseAllExample.js

// Declare variables to hold the images we'll load
let img1, img2, img3;

async function setup() {
  // Add screen reader-friendly text description
  textOutput();
  
  // Create a canvas where the images will be drawn
  createCanvas(600, 400);

  // Set background color to gray
  background(220);

  // Configure text appearance
  textAlign(CENTER, CENTER);
  textSize(18);

  // Use async/await with Promise.all to load all three images at once
  // This waits until ALL images are loaded before continuing
  [img1, img2, img3] = await Promise.all([
    loadImage('https://picsum.photos/100/100?random=1'), // Replace the image links with user wanted images.
    loadImage('https://picsum.photos/100/100?random=2'),
    loadImage('https://picsum.photos/100/100?random=3')
  ]);

  // Once all images are ready, draw them on the canvas
  image(img1, 100, 150);  // Draw first image at x=100
  image(img2, 250, 150);  // Second image at x=250
  image(img3, 400, 150);  // Third image at x=400

  // Display a message showing that everything is loaded
  fill(0);  // Set text color to black
  text("All images loaded!", width / 2, 50);
}

