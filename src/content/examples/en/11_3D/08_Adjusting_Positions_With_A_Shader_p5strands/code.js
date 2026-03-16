let wiggleShader;
let ribbon;

function setup() {
  createCanvas(700, 400, WEBGL);

  wiggleShader = baseColorShader().modify(wiggleCallback);

  let startColor = color('#F55');
  let endColor = color('#55F');
  ribbon = buildGeometry(() => {
    noStroke();
    beginShape(QUAD_STRIP);
    let numPoints = 50;
    for (let currentPoint = 0; currentPoint < numPoints; currentPoint++) {
      let x = map(currentPoint, 0, numPoints - 1, -width / 3, width / 3);
      let y = map(currentPoint, 0, numPoints - 1, -height / 3, height / 3);
      fill(lerpColor(startColor, endColor, currentPoint / (numPoints - 1)));
      for (let z of [-50, 50]) {
        vertex(x, y, z);
      }
    }
    endShape();
  });

  describe('A red-to-blue ribbon that waves over time');
}

function wiggleCallback() {
  const time = uniformFloat(() => millis());

  getObjectInputs((inputs) => {
    inputs.position.y += 20 * sin(time * 0.01 + inputs.position.y * 0.1);
    return inputs;
  });
}

function draw() {
  background(255);
  noStroke();
  rotateX(PI * 0.1);

  shader(wiggleShader);

  model(ribbon);
}
