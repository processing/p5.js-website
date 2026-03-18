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
  displaceColors = buildFilterShader(displaceColorsCallback);
  describe(
    'A video of a city crosswalk, with colors getting more offset the further from the center they are'
  );
}

function displaceColorsCallback() {
  function zoom(coord, amount) {
    return (coord - 0.5) / amount + 0.5;
  }
  filterColor.begin();
  const uv = filterColor.texCoord;
  const r = getTexture(filterColor.canvasContent, uv).r;
  const g = getTexture(filterColor.canvasContent, zoom(uv, 1.05)).g;
  const b = getTexture(filterColor.canvasContent, zoom(uv, 1.1)).b;
  const a = getTexture(filterColor.canvasContent, uv).a;
  filterColor.set([r, g, b, a]);
  filterColor.end();
}

function draw() {
  background(255);
  push();
  imageMode(CENTER);
  image(video, 0, 0, width, height, 0, 0, video.width, video.height, COVER);
  pop();
  filter(displaceColors);
}
