/*
 * @name Input and Button
 * @description Input text and click the button to see it affect the the canvas. [shows in-time live updates in the canvas, shows how to tie a button and label to an input]
 */

// Define your global variables: input, button, and greeting.
let input, button, greeting;

function setup() {
  createCanvas(710, 400);
  background(255);

  //Use the greeting variable to ask for the person's name.
  greeting = createElement('h2', 'what is your name?');
  greeting.position(20, 5);

  //Create your input and button in the canvas. (Note to self: add labeling and proper a11y.)
  input = createInput();
  input.position(20, 65);

  button = createButton('submit');
  button.position(input.x + input.width, 65);

  //Use the mousePressed() method to call the greet() 
  //function when the button is pressed.
  button.mousePressed(greet);
}

function greet() {
  //Refresh the canvas background to clear of any
  //previous inputs.
  background(255);

  //Connect the name variable to the input's value.
  let name = input.value();

  //Update the greeting to state the person's name.
  greeting.html('Hello, ${name}!');

  //Clear the input's value.
  input.value('');

  //Randomly populate the input's value 200 times
  //within the canvas.
  for (let i = 0; i < 200; i++) {
    push();
    fill(random(255), 255, 255);
    translate(random(width), random(height));

    //no pi
    rotate(random(2 * PI));
    text(name, 0, 0);
    pop();
  }
}