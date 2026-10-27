let layer;
let blur;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  noStroke();

  // Create framebuffer and shader objects
  layer = createFramebuffer();
  blur = buildFilterShader(blurCallback);

  describe(
    'A row of five spheres rotating in front of the camera. The closest and farthest spheres from the camera appear blurred.'
  );
}

function blurCallback() {
  // In draw, the depth info is passed in with setUniform
  let depth = uniformTexture('depth');

  function getBlurriness(d) {
    // Blur more the farther away we go from the
    // focal point at depth=0.909
    return min(abs(d - 0.909) * 200, 4);
  }

  function maxBlurDistance(blurriness) {
    return blurriness * 0.01;
  }

  filterColor.begin();
  let coord = filterColor.texCoord;
  let color = getTexture(filterColor.canvasContent, coord);
  let samples = 1;
  let centerDepth = getTexture(depth, coord).r;
  let blurriness = getBlurriness(centerDepth);

  for (let i = 0; i < 20; i++) {
    // Sample nearby pixels in a spiral going out from the
    // current pixel
    let angle = i;
    let distance = (i / 20) * maxBlurDistance(blurriness);
    let offset = [cos(angle), sin(angle)] * distance;

    // How close is the object at the nearby pixel?
    let sampleDepth = getTexture(depth, coord + offset).r;

    // How far should its blur reach?
    let sampleBlurDistance = maxBlurDistance(getBlurriness(sampleDepth));

    // If it's in front of the current pixel, or its blur overlaps
    // with the current pixel, add its color to the average
    if (sampleDepth >= centerDepth || sampleBlurDistance >= distance) {
      color += getTexture(filterColor.canvasContent, coord + offset);
      samples++;
    }
  }

  filterColor.set(color / samples);
  filterColor.end();
}

function draw() {
  // Start drawing to framebuffer
  layer.begin();
  background(255);
  ambientLight(100);
  directionalLight(255, 255, 255, -1, 1, -1);
  ambientMaterial(255, 0, 0);
  fill(255, 255, 100);
  specularMaterial(255);
  shininess(150);

  // Rotate 1° per frame
  rotateY(frameCount);

  // Place 5 spheres across canvas at equal distance
  let sphereDistance = width / 4;
  for (let x = -width / 2; x <= width / 2; x += sphereDistance) {
    push();
    translate(x, 0, 0);
    sphere(width / 16);
    pop();
  }

  // Stop drawing to framebuffer
  layer.end();

  // Draw the framebuffer to the canvas, then blur the canvas using
  // the framebuffer's depth information
  imageMode(CENTER);
  image(layer, 0, 0);
  blur.setUniform('depth', layer.depth);
  filter(blur);
}
