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

// This function is p5.strands code: it's like JavaScript, but
// where you can write vectors as arrays and use math oeprators on them
function myBlur() {
  // filterColor is an example of a *hook* in a strands shader, which
  // lets you control different parts of the shader's job
  filterColor.begin();
  // The range of texture coordinates is [0,0] in the top left to [1,1] in
  // the bottom right. These are the units shaders use to tell you where you
  // are on the canvas for filter shaders, or on a shape for a material shader.
  let coord = filterColor.texCoord;
  let distFromCenter = length(coord - [0.5, 0.5]);
  // Map distance from center to blurriness, also in texture coordinate units.
  // Since the whole canvas is only 1 unit across, a max blurriness of 0.1 is
  // actually pretty blurry (10% of the canvas size!)
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
