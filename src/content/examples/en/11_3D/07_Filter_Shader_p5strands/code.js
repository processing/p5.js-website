let video;
let displaceColors;

function setup() {
  createCanvas(700, 400, WEBGL);
  video = createVideo(
    'https://upload.wikimedia.org/wikipedia/commons/d/d2/DiagonalCrosswalkYongeDundas.webm'
  );
  video.volume(0);
  video.hide();
  video.loop();

  displaceColors = baseFilterShader().modify(displaceColorsCallback);

  describe(
    'A video of a city crosswalk, with colors getting more offset the further from the center they are'
  );
}

function displaceColorsCallback() {

  // Note: arithmetic on coord operates componentwise (vec2), as in GLSL.
  function zoom(coord, amount) {
    return (coord - 0.5) / amount + 0.5;
  }

  getColor((inputs, canvasContent) => {
    const uv = inputs.texCoord;

    const r = getTexture(canvasContent, uv).r;
    const g = getTexture(canvasContent, zoom(uv, 1.05)).g;
    const b = getTexture(canvasContent, zoom(uv, 1.1)).b;
    const a = getTexture(canvasContent, uv).a;

    return [r, g, b, a];
  });
}

function draw() {
  background(255);
  push();
  imageMode(CENTER);
  image(
    video,
    0, 0, width, height,
    0, 0, video.width, video.height,
    COVER
  );
  pop();

  filter(displaceColors);
}
