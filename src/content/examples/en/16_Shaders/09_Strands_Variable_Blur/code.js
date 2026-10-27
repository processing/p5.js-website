let video;
let blurShader;
function setup() {
  createCanvas(400, 400, WEBGL);
  video = createVideo(
    '/assets/DiagonalCrosswalkYongeDundas.mp4'
  );
  video.volume(0);
  video.hide();
  video.loop();
  blurShader = buildFilterShader(myBlur);
}

function myBlur() {
  filterColor.begin();
  let coord = filterColor.texCoord;
  let distFromCenter = length(coord - [0.5, 0.5]);
  let blurAmount = map(distFromCenter, 0.2, 1, 0, 0.1, true);
  coord += blurAmount * [random(-1, 1), random(-1, 1)];
  filterColor.set(getTexture(filterColor.canvasContent, coord));
  filterColor.end();
}

function draw() {
  imageMode(CENTER);
  image(video, 0, 0, width, height, 0, 0, video.width, video.height, COVER);
  filter(blurShader);
}
