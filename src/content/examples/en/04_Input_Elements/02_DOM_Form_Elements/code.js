// Define the inputs for this form as global variables.
let nameInput;
let fontSelect;
let foodRadio;

function setup() {
  createCanvas(720, 400);

  // Assign an input box to nameInput.
  nameInput = createInput();
  nameInput.position(25, 115);

  // Assign radio buttons to foodRadio.
  foodRadio = createRadio();
  foodRadio.position(25, 215);

  // List the radio options for foodRadio, along
  // with the background color associated with each selection.
  foodRadio.option('#F7F5BC', 'Cranberries');
  foodRadio.option('#B8E3FF', 'Almonds');
  foodRadio.option('#C79A9A', 'Gouda');

  // Assign a select dropdown to fontSelect.
  fontSelect = createSelect();
  fontSelect.position(25, 300);

  // List out the dropdown options for fontSelect.
  fontSelect.option('Sans-serif');
  fontSelect.option('Serif');
  fontSelect.option('Cursive');

  // If the fontSelect selection is changed, call the
  // fontChanged function.
  fontSelect.changed(fontChanged);
}

function draw() {
  describe(
    'A form with "Welcome to p5.js!" for a header, a text input with the label "What is your name?", and a set of radio buttons with the label "What is your favorite food?", with the options of "Cranberries," "Almonds," or "Gouda." The text submitted through the input appears next to its label. The radio button selection changes the canvas background color. The select element changes the form font.'
  );

  // Set the background color to the current foodRadio value.
  let backgroundColor = foodRadio.value();
  background(backgroundColor);

  // Create the header for the form.
  textSize(25);
  text('Welcome to p5.js!', 25, 50);

  // Create the text inputs that will update with the
  // new user inputs.
  textSize(20);
  text(`What is your name? ${nameInput.value()}`, 25, 100);
  text('What is your favorite food?', 25, 200);
}

function fontChanged() {
  // When the fontSelect value is changed,
  // update the canvas's font selection to the
  // new value.
  let fontSelection = fontSelect.value();
  textFont(fontSelection);
}
