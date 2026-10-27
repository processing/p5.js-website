let ditherGradientShader;
function setup() {
  createCanvas(400, 400, WEBGL);
  ditherGradientShader = buildFilterShader(ditherGradient);
}

function ditherGradient() {
  filterColor.begin();
  randomSeed(0); // Comment out for a flickery output
  // Or use the one below to use a low frame rate flicker
  // randomSeed(floor(frameCount / 5))
  let start = [0.1, 0.1];
  let end = [mouseX, mouseY] / [width, height];
  let startToPixel = length(filterColor.texCoord - start);
  let startToEnd = length(end - start);
  let gradientProgress = map(
    startToPixel,
    0,
    startToEnd,
    0,
    1,
    true
  );
  let outColor = color('#F00');
  if (gradientProgress + random(-0.3, 0.3) > 0.5) {
    outColor = color('#0214f3');
  }
  filterColor.set(outColor);
  filterColor.end();
}

function draw() {
  filter(ditherGradientShader);
}
