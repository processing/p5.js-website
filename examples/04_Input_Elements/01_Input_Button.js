/**
 ** @name Input and Button
 ** @description Using the <a href="https://p5js.org/reference/#/p5.Element/createElement" target="_blank">createElement()</a>,
 ** <a href="https://p5js.org/reference/#/p5/createInput" target="_blank">createInput()</a>,
 ** and <a href="https://p5js.org/reference/#/p5.Element/createButton" target="_blank">createButton()</a> functions,
 ** you can take a string of text submitted via text input and transpose it into multiple elements within your canvas.
 **/
// Define the global variables: input, button, and greeting.
let nameInput;
let button;
let greeting;

function setup() {
  createCanvas(710, 400);
  background(255);

  // Use the greeting variable to ask for the person's name.
  greeting = createElement('h2', 'What is your name?');
  greeting.position(20, 5);

  // Create the input and button in the canvas.
  nameInput = createInput();
  nameInput.position(20, 65);

  button = createButton('submit');
  button.position(nameInput.x + nameInput.width, 65);

  // Use the mousePressed() method to call the greet()
  // function when the button is pressed.
  button.mousePressed(greet);

  // Also call greet when input is changed and enter/return button is pressed
  nameInput.changed(greet);
}

function greet() {
  // Refresh the canvas background to clear of any
  // previous inputs.
  background(255);

  // Connect the name variable to the input's value.
  let name = nameInput.value();

  // Update the greeting to state the person's name.
  greeting.html(`Hello, ${name}!`);

  // Clear the input's value.
  nameInput.value('');

  // Draw name on the canvas
  textSize(100);
  textAlign(CENTER, CENTER);
  text(name, width / 2, height / 2);

  describe(`The name ${name} in large black text on a white background.`);
}
