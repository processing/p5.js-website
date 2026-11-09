let ditherGradientShader;
function setup() {
  createCanvas(400, 400, WEBGL);
  ditherGradientShader = buildFilterShader(ditherGradient);
}

// This function is p5.strands code: it's like JavaScript, but
// where you can write vectors as arrays and use math oeprators on them
function ditherGradient() {
  // filterColor is an example of a *hook* in a strands shader, which
  // lets you control different parts of the shader's job
  filterColor.begin();
  randomSeed(0); // Comment out for a flickery output
  // Or use the one below to use a low frame rate flicker
  // randomSeed(floor(frameCount / 5))

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
