// Vertex shader code
let vertexShader = `
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
// texcoords only come from p5 to vertex shader
// so pass texcoords on to the fragment shader in a varying variable
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  // transferring texcoords for the frag shader
  vTexCoord = aTexCoord;

  // copy position with a fourth coordinate for projection (1.0 is normal)
  vec4 positionVec4 = vec4(aPosition, 1.0);

  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}`;

// Fragment shader code
let fragmentShader = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D img;
uniform sampler2D depth;
float getBlurriness(float d) {
  // Blur more the farther away we go from the
  // focal point at depth=0.9
  return abs(d - 0.9) * 40.;
}
float maxBlurDistance(float blurriness) {
  return blurriness * 0.01;
}
void main() {
  vec4 color = texture2D(img, vTexCoord);
  float samples = 1.;
  float centerDepth = texture2D(depth, vTexCoord).r;
  float blurriness = getBlurriness(centerDepth);
  for (int sample = 0; sample < 20; sample++) {
    // Sample nearby pixels in a spiral going out from the
    // current pixel
    float angle = float(sample);
    float distance = float(sample)/20.
      * maxBlurDistance(blurriness);
    vec2 offset = vec2(cos(angle), sin(angle)) * distance;

    // How close is the object at the nearby pixel?
    float sampleDepth = texture2D(depth, vTexCoord + offset).r;

    // How far should its blur reach?
    float sampleBlurDistance =
      maxBlurDistance(getBlurriness(sampleDepth));

    // If it's in front of the current pixel, or its blur overlaps
    // with the current pixel, add its color to the average
    if (
      sampleDepth >= centerDepth ||
      sampleBlurDistance >= distance
    ) {
      color += texture2D(img, vTexCoord + offset);
      samples++;
    }
  }
  color /= samples;
  gl_FragColor = color;
}`;

let layer;
let blur;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  noStroke();

  // Create framebuffer and shader objects
  layer = createFramebuffer();
  blur = createShader(vertexShader, fragmentShader);

  describe(
    'A row of five spheres rotating in front of the camera. The closest and farthest spheres from the camera appear blurred.'
  );
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
    sphere();
    pop();
  }

  // Stop drawing to framebuffer
  layer.end();

  // Pass color and depth information from the framebuffer
  // to the shader's uniforms
  blur.setUniform('img', layer.color);
  blur.setUniform('depth', layer.depth);

  // Render the scene captured by framebuffer with depth of field blur
  shader(blur);
  plane(width, height);
}
