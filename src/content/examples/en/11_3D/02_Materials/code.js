// Model and image texture
let astronaut;
let venus;

// Material type radio element
let materialType;

// Color selector elements
let fillStrokeSelectionContainer;
let ambientSpecularSelectionContainer;
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
  createSelectionArea();

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

  switch (currentMaterial) {
    case 'color':
      applyColorMaterial();
      break;
    case 'emissive':
      applyEmissiveMaterial();
      break;
    case 'normal':
      applyNormalMaterial();
      break;
    case 'texture':
      applyTextureMaterial();
      break;
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
  // are applied in next frame
  pop();
}

function createSelectionArea() {
  // Create container for selection elements
  let selectionArea = createDiv();
  selectionArea.style('background', '#f0f0f0');
  selectionArea.style('width', '400px');
  selectionArea.style('font-family', 'sans-serif');

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
  fillStrokeSelectionContainer = createDiv();
  fillStrokeSelectionContainer.parent(selectionArea);
  ambientSpecularSelectionContainer = createDiv();
  ambientSpecularSelectionContainer.parent(selectionArea);

  fillSelection = color(255);
  fillCheckbox = createColorSelector(
    'fill',
    fillSelection,
    true,
    fillStrokeSelectionContainer
  );
  strokeSelection = color(0);
  strokeCheckbox = createColorSelector(
    'stroke',
    strokeSelection,
    true,
    fillStrokeSelectionContainer
  );
  ambientSelection = color(255);
  ambientCheckbox = createColorSelector(
    'ambient',
    ambientSelection,
    false,
    ambientSpecularSelectionContainer
  );
  specularSelection = color(255);
  specularCheckbox = createColorSelector(
    'specular',
    specularSelection,
    false,
    ambientSpecularSelectionContainer
  );

  // Create picker for emissive material color
  emissivePicker = createColorPicker(color(255));
  emissivePicker.hide();
}

function createColorSelector(label, colorSelection, checked, parentElement) {
  let checkbox = createCheckbox(label);
  checkbox.parent(parentElement);
  let picker = createColorPicker(colorSelection);
  picker.parent(parentElement);

  function setColor() {
    let selectedColor = picker.color();
    colorSelection.setRed(red(selectedColor));
    colorSelection.setGreen(green(selectedColor));
    colorSelection.setBlue(blue(selectedColor));
  }

  // When picker's color is changed, set the selector color to its value
  picker.changed(setColor);

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

function applyColorMaterial() {
  ambientSpecularSelectionContainer.show();
  emissivePicker.hide();
  fillStrokeSelectionContainer.show();
  applyAmbientSpecularMaterial();

  // Set fill using current selection
  if (fillCheckbox.checked() === true) {
    fill(fillSelection);
  } else {
    noFill();
  }
  strokeCheckbox.show();

  // Set stroke using current selection
  if (strokeCheckbox.checked() === true) {
    stroke(strokeSelection);
  } else {
    noStroke();
  }
}

function applyEmissiveMaterial() {
  noStroke();
  ambientSpecularSelectionContainer.hide();
  fillStrokeSelectionContainer.hide();
  emissivePicker.show();

  // Apply emissive material using selected color
  emissiveMaterial(emissivePicker.color());
}

function applyNormalMaterial() {
  ambientSpecularSelectionContainer.hide();
  fillStrokeSelectionContainer.hide();
  emissivePicker.hide();

  // Apply normal material
  normalMaterial();
}

function applyTextureMaterial() {
  ambientSpecularSelectionContainer.show();
  emissivePicker.hide();
  fillStrokeSelectionContainer.hide();
  applyAmbientSpecularMaterial();
  noStroke();

  // Apply texture
  texture(venus);
}

function applyAmbientSpecularMaterial() {
  if (ambientCheckbox.checked() === true) {
    ambientMaterial(ambientSelection);
  }
  if (specularCheckbox.checked() === true) {
    specularMaterial(specularSelection);
  }
}
