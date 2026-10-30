let gradientShader;
function setup() {
  createCanvas(400, 400, WEBGL);
  gradientShader = buildFilterShader(gradient);
}

function gradient() {
  filterColor.begin();
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
  let outColor = lerpColor(
    color('#F00'),
    color('#0214f3'),
    gradientProgress
  );
  filterColor.set(outColor);
  filterColor.end();
}

function draw() {
  filter(gradientShader);
}
