/* 
 * @name DOM Form Elements
 * @description Using p5.js' form elements, such as <a href="https://p5js.org/reference/#/p5/createInput" target="_blank">createInput()</a>, 
 * <a href="https://p5js.org/reference/#/p5/createSelect" target="_blank">createSelect()</a>,
 * and <a href="https://p5js.org/reference/#/p5/createRadio" target="_blank">createRadio()</a>, you can build different ways to take information submitted through
 * a select, input, or radio button, and update the canvas based on the information.
*/
// Define the inputs for this form as global variables.
let nameInput;
let fontSelect;
let foodRadio;

// canvasBackground will be used to color the background.
let canvasBackground = 255;

function setup() {
  createCanvas(720, 400);
  
  // Assign an input box to nameInput.
  nameInput = createInput();
  nameInput.position(5, 65);
  
  // Assign radio buttons to foodRadio.
  foodRadio = createRadio();
  foodRadio.position(5, 115);
  
  //List the radio options for foodRadio.
  foodRadio.option("Cranberries", "Cranberries");
  foodRadio.option("Almonds", "Almonds");
  foodRadio.option("Gouda", "Gouda");
  
  //Assign a select dropdown to fontSelect.
  fontSelect = createSelect();
  fontSelect.position(5, 150);
  
  //List out the dropdown options for fontSelect.
  fontSelect.option("Sans-serif");
  fontSelect.option("Serif");
  fontSelect.option("Fantasy");
  
  //If the fontSelect selection is changed, call the 
  //fontChanged function.
  fontSelect.changed(fontChanged);
}

function draw() {
  gridOutput();
  background(canvasBackground, 250, 250);
  
  // Create the header for the form.
  textSize(25);
  text('Welcome to p5.js!', 5, 25);
  
  // Create the text inputs that will update with the 
  // new user inputs.
  textSize(20);
  text(`What is your name? ${nameInput.value()}`, 5, 55);
  text(`What is your favorite food? ${foodRadio.value()}`, 5, 110);
  
  // If the value of foodRadio changes, update the 
  // canvas' color.
  switch (foodRadio.value()) {
    case "Cranberries":
      canvasBackground = 200;
    break;
    case "Almonds":
      canvasBackground = 190;
    break;
    case "Gouda":
      canvasBackground = 255;
    break;
  }
  
}

function fontChanged() {
  // When the fontSelect value is changed,
  // update the canvas' font selection to the
  // new value.
  switch (fontSelect.value()) {
    case "Sans-serif":
      textFont("sans-serif");
      break;
    case "Serif":
      textFont("serif");
      break;
    case "Fantasy":
      textFont("fantasy");
      break;
  }
}