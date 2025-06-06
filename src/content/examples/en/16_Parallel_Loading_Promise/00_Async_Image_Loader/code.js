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
  // This waits untill ALL images are loaded before continuing
  [img1, img2, img3] = await Promise.all([
    loadImageAsync('https://picsum.photos/100/100?random=1'), // Replace the image links with user wanted images.
    loadImageAsync('https://picsum.photos/100/100?random=2'),
    loadImageAsync('https://picsum.photos/100/100?random=3')
  ]);

  // Once all images are ready, draw them on the canvas
  image(img1, 100, 150);  // Draw first image at x=100
  image(img2, 250, 150);  // Second image at x=250
  image(img3, 400, 150);  // Third image at x=400

  // Display a message showing that everything is loaded
  fill(0);  // Set text color to black
  text("All images loaded!", width / 2, 50);
}

// Helper function to load images using a Promise
// Makes loadImage compatible with async/await style
function loadImageAsync(url) {
  return new Promise((resolve, reject) => {
    // Try to load the image from the given URL.
    //If successful, resolve the promise with the image. If it fails, reject with the error.
    loadImage(url, img => resolve(img), err => reject(err));
  });
}