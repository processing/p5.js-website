/**
 * @name Materials
 * @description In 3D rendering, a material determines how a surface
 * responds to light. p5's
 * <a href="https://p5js.org/reference/#/p5/WEBGL" target="_blank">WEBGL</a>
 * mode supports
 * <a href="https://p5js.org/reference/#/p5/ambientMaterial" target="_blank">ambient</a>,
 * <a href="https://p5js.org/reference/#/p5/emissiveMaterial" target="_blank">emissive</a>,
 * <a href="https://p5js.org/reference/#/p5/normalMaterial" target="_blank">normal</a>, and
 * <a href="https://p5js.org/reference/#/p5/specularMaterial" target="_blank">specular</a>
 * materials.
 *
 * An ambient material responds to ambient light only. A specular
 * material responds to any light source. In p5, an emissive material
 * displays its color regardless of light source. In other contexts,
 * typically an emissive material emits light. A normal material
 * visualizes the direction each part of the surface faces. A normal
 * material does not respond to light.
 *
 * Ambient and emissive materials can be combined with each other.
 * They can also be combined with fill and stroke. Fill sets a base
 * color for the surface, and stroke sets the color for the object's
 * vertices.
 *
 * Additionally,
 * <a href="https://p5js.org/reference/#/p5/texture" target="_blank">texture()</a>
 * wraps an object with an image. The model and image texture in this example are
 * from <a href="https://nasa3d.arc.nasa.gov" target="_blank">NASA's collection</a>.
 
 */

// Model and image texture
let astronaut;
let venus;

// Material type radio element
let materialType;

// Color selector elements
let colorSelectionContainer;
let fillCheckbox, strokeCheckbox, ambientCheckbox, specularCheckbox;
let emissivePicker;

// Selected colors
let fillSelection, strokeSelection, ambientSelection, specularSelection;

// Load astronaut model and venus image texture
function preload() {
  astronaut = loadModel('assets/astronaut.obj');
  venus = loadImage('assets/venus.jpg');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  angleMode(DEGREES);

  // Create container for selection elements
  let selectionArea = createDiv();
  selectionArea.style('background', '#f0f0f0');
  selectionArea.style('width', '400px');

  // Create material type radio selector
  let materialTypeLabel = createElement('label', 'Material type');
  materialTypeLabel.parent(selectionArea);
  materialType = createRadio();
  materialType.parent(materialTypeLabel);
  materialType.option('color');
  materialType.option('emissive');
  materialType.option('normal');
  materialType.option('texture');
  materialType.selected('color');

  // Create selectors for material colors
  colorSelectionContainer = createDiv();
  colorSelectionContainer.parent(selectionArea);
  fillSelection = color(255);
  fillCheckbox = createColorSelector('fill', fillSelection, true);
  strokeSelection = color(0);
  strokeCheckbox = createColorSelector('stroke', strokeSelection, true);
  ambientSelection = color(255);
  ambientCheckbox = createColorSelector('ambient', ambientSelection, false);
  specularSelection = color(255);
  specularCheckbox = createColorSelector('specular', specularSelection, false);

  // Create picker for emissive material color
  emissivePicker = createColorPicker(color(255));

  describe(
    'Astronaut 3D model displayed with a user-selected material using the selectors below the canvas.'
  );
}

function draw() {
  background(0);

  // Save canvas settings
  push();

  // Get current material type
  let currentMaterial = materialType.value();

  if (currentMaterial === 'color') {
    colorSelectionContainer.show();
    emissivePicker.hide();

    // Set fill using current selection
    if (fillCheckbox.checked() === true) {
      fill(fillSelection);
    } else {
      noFill();
    }

    // Set stroke using current selection
    if (strokeCheckbox.checked() === true) {
      stroke(strokeSelection);
    } else {
      noStroke();
    }
    if (ambientCheckbox.checked() === true) {
      // Apply ambient material using selected color
      ambientMaterial(ambientSelection);
    }
    if (specularCheckbox.checked() === true) {
      // Apply specular material using selected color
      specularMaterial(specularSelection);
    }
  } else if (currentMaterial === 'emissive') {
    noStroke();
    colorSelectionContainer.hide();
    emissivePicker.show();

    // Apply emissive material using selected color
    emissiveMaterial(emissivePicker.color());
  } else if (currentMaterial === 'normal') {
    colorSelectionContainer.hide();
    emissivePicker.hide();

    // Apply normal material
    normalMaterial();
  } else if (currentMaterial) {
    colorSelectionContainer.hide();
    emissivePicker.hide();
    noStroke();

    // Apply texture
    texture(venus);
  }

  // Lights
  ambientLight(128);
  spotLight(255, 255, 255, 0, -height / 2, 200, 0, 0.5, -1, 30);

  // Astronaut
  translate(0, -25);
  scale(4);
  rotateZ(180);
  model(astronaut);

  // Restore canvas settings so that only current selections
  //  are applied in next frame
  pop();
}

function createColorSelector(label, colorSelection, checked) {
  let checkbox = createCheckbox(label);
  checkbox.parent(colorSelectionContainer);

  let picker = createColorPicker(colorSelection);

  function setColor() {
    let selectedColor = picker.color();
    colorSelection.setRed(red(selectedColor));
    colorSelection.setGreen(green(selectedColor));
    colorSelection.setBlue(blue(selectedColor));
  }

  // When picker's color is changed, set the selector color to its value
  picker.changed(setColor);
  picker.parent(colorSelectionContainer);

  function setPickerVisibility() {
    if (checkbox.checked() === true) {
      picker.show();
    } else {
      picker.hide();
    }
  }

  // When checkbox is checked, show the color picker
  checkbox.changed(setPickerVisibility);
  checkbox.checked(checked);
  setPickerVisibility();

  return checkbox;
}
