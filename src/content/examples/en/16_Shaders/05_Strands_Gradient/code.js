let gradientShader;
function setup() {
  createCanvas(400, 400, WEBGL);
  gradientShader = buildFilterShader(gradient);
}

// This function is p5.strands code: it's like JavaScript, but
// where you can write vectors as arrays and use math oeprators on them
function gradient() {
  // filterColor is an example of a *hook* in a strands shader, which
  // lets you control different parts of the shader's job
  filterColor.begin();
  // Texture coordinates like filterColor.texCoord go from [0,0] in the
  // top left to [1,1] in the bottom right
  let start = [0.1, 0.1];
  // Convert mouse coords to texture coordinate range by dividing
  // by canvas size
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
