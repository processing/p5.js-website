let theShader;

function setup() {
  createCanvas(710, 400, WEBGL);
  noStroke();
  angleMode(DEGREES);

  // baseMaterialShader is used because it is the only base shader whose
  // getPixelInputs hook exposes inputs.texCoord in JS callback form.
  // baseColorShader only exposes getFinalColor, which does not include texCoord.
  theShader = baseMaterialShader().modify(shaderAsTextureCallback);

  describe('Sphere broken up into a square grid with a gradient in each grid.');
}

function shaderAsTextureCallback() {
  const time = uniformFloat(() => millis() / 1000.0);
  const size = uniformVec2(() => [width, height]);
  // Y is flipped to match gl_FragCoord's bottom-up axis.
  const mouse = uniformVec2(() => [mouseX, height - mouseY]);

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

  getCameraInputs((inputs) => {
    position = inputs.position;
    return inputs;
  });

  getPixelInputs((inputs) => {
    const st = inputs.texCoord;

    // Shift camera-space position (center origin) to bottom-left origin,
    // producing the equivalent of gl_FragCoord.xy
    const fragCoord = position.xy + size * 0.5;
    const safeMouse = [max(mouse.x, 1.0), max(mouse.y, 1.0)];
    const mst = fragCoord / safeMouse;
    const mdist = distance([1.0, 1.0], mst);

    const distToCenter = distance(st, [sin(time / 10.0), cos(time / 10.0)]);
    let tiled = tile(st, 10.0);
    tiled = rotate2D(tiled, distToCenter / (mdist / 5.0) * PI * 2.0);

    const r = concentricCircles(tiled, [0.0, 0.0],  5.0,  5.0);
    const g = concentricCircles(tiled, [0.0, 0.0], 10.0, 10.0);
    const b = concentricCircles(tiled, [0.0, 0.0], 20.0, 10.0);

    inputs.color = [r, g, b, 1.0];
    return inputs;
  });
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
