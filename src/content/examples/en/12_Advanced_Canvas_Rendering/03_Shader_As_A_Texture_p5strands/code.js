let theShader;

function setup() {
  createCanvas(710, 400, WEBGL);
  noStroke();
  angleMode(DEGREES);
  theShader = buildMaterialShader(shaderAsTextureCallback);
  describe('Sphere broken up into a square grid with a gradient in each grid.');
}

function shaderAsTextureCallback() {
  let position = sharedVec3();

  function rotate2D(st, angle) {
    const c = cos(angle);
    const s = sin(angle);
    const x = st.x - 0.5;
    const y = st.y - 0.5;
    return [c * x - s * y + 0.5, s * x + c * y + 0.5];
  }

  function tile(st, zoom) {
    return fract(st * zoom);
  }

  function concentricCircles(st, radius, res, scale) {
    return floor(distance(st, radius) * res) / scale;
  }

  cameraInputs.begin();
  position = cameraInputs.position;
  cameraInputs.end();

  pixelInputs.begin();
  const fragCoord = position.xy + [width, height] * 0.5;
  const safeMouse = [max(mouseX, 1), max(height - mouseY, 1)];
  const mst = fragCoord / safeMouse;
  const mdist = distance([1, 1], mst);

  const st = pixelInputs.texCoord;
  const distToCenter = distance(st, [sin(millis() / 10000), cos(millis() / 10000)]);
  let tiled = tile(st, 10);
  tiled = rotate2D(tiled, distToCenter / (mdist / 5) * PI * 2);

  const r = concentricCircles(tiled, [0, 0],  5,  5);
  const g = concentricCircles(tiled, [0, 0], 10, 10);
  const b = concentricCircles(tiled, [0, 0], 20, 10);

  pixelInputs.color = [r, g, b, 1];
  pixelInputs.end();
}

function draw() {
  background(255);
  shader(theShader);
  translate(-150, 0, 0);
  push();
  rotateX(-mouseY);
  rotateY(-mouseX);
  sphere(125);
  pop();
  ellipse(260, 0, 200, 200, 100);
}
