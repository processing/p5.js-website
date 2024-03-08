let toggleNormalMaterial;
let toggleAmbientMaterial;
let toggleEmissiveMaterial;
let toggleSpecularMaterial;
let shininessSlider;

let ambientColorPicker;
let emissiveColorPicker;
let specularColorPicker;
let fillColorPicker;

let isUserChange = true;

function setup() {
  let canvas = createCanvas(350, 350, WEBGL);
  canvas.parent("sketchContainer");

  debugMode();

  toggleNormalMaterial = document.querySelector('#toggleNormalMaterial');
  toggleAmbientMaterial = document.querySelector('#toggleAmbientMaterial');
  toggleEmissiveMaterial = document.querySelector('#toggleEmissiveMaterial');
  toggleSpecularMaterial = document.querySelector('#toggleSpecularMaterial');
  shininessSlider = document.querySelector('#shininessSlider');
  
  ambientColorPicker = document.querySelector('#ambientColor');
  emissiveColorPicker = document.querySelector('#emissiveColor');
  specularColorPicker = document.querySelector('#specularColor');
  fillColorPicker = document.querySelector('#fillColor');
  
  const allChecks = [
    toggleNormalMaterial,
    toggleAmbientMaterial,
    toggleEmissiveMaterial,
    toggleSpecularMaterial
  ];
  for (const check of allChecks) {
    check.addEventListener('change', (e) => {
      if (!isUserChange) return;
      
      isUserChange = false;
      if (e.target === toggleNormalMaterial && toggleNormalMaterial.checked) {
        for (const other of allChecks) {
          if (other === toggleNormalMaterial) continue;
          other.checked = false;
        }
      } else if (e.target !== toggleNormalMaterial && e.target.checked) {
        toggleNormalMaterial.checked = false;
      }
      shininessSlider.disabled = !toggleSpecularMaterial.checked;
      isUserChange = true;
    })
  }

  describe('an interactive example that allows you to toggle different materials on either a box or sphere shape');
}

function draw() {
  background(220);
  camera(
    50 * sin(millis()*0.002), -100, 500, // position
    0, 0, 0 // look at
  );
  
  noStroke();

  push()
  let locX = 50
  let locY = -100;
  directionalLight(127, 127, 127, 1.0-locX, 1.0-locY, -1);
  ambientLight(64);

  if(toggleNormalMaterial.checked) {
    normalMaterial();
  } else {
    fill(fillColorPicker.value);
  }

  if(toggleAmbientMaterial.checked) {
    ambientMaterial(ambientColorPicker.value);
  }

  if(toggleEmissiveMaterial.checked) {
    emissiveMaterial(emissiveColorPicker.value);
  }

  if(toggleSpecularMaterial.checked) {
    specularMaterial(specularColorPicker.value);
    shininess(parseFloat(shininessSlider.value));
  }

  push();
  torus(40, 20);
  pop();
  pop();
  
  // draw debug point light
  push();
  translate(locX, locY, 50);
  scale(0.2);
  noLights();
  fill('white');
  sphere();
  pop();
}
