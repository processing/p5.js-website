let stars;
let starShader;
let starStrokeShader;
let originalFrameBuffer;
let pixellizeShader;
let fresnelShader;
let bloomShader;

function starShaderCallback() {
  const time = uniformFloat(() => millis());
  const skyRadius = uniformFloat(1000);
  
  function rand(st) {
    return fract(sin(dot(st, createVector2(12.9898, 78.233))) * 43758.5453123);
  }

  getWorldInputs((inputs) => {
    let id = instanceID();
    let theta = rand(createVector2(id, 0.1234)) * TWO_PI;
    let phi = rand(createVector2(id, 3.321)) * PI+time/10000;
    let r = skyRadius;
    r *= 1.5 * sin(phi);
    let x = r * sin(phi) * cos(theta);
    let y = r * 1.5 * cos(phi);
    let z = r * sin(phi) * sin(theta);
    inputs.position += createVector3(x, y, z);
    return inputs;
  });

  getObjectInputs((inputs) => {
    inputs.position *= 1 + 0.1 * sin(time * 0.002 + instanceID());
    return inputs;
  });
}

function pixellizeShaderCallback() {
  const pixelSize = uniformFloat(()=> width/2);
  getColor((input, canvasContent) => {
    let coord = input.texCoord;
    coord = floor(coord * pixelSize) / pixelSize;
    let col = texture(canvasContent, coord);
    return col;
  });
}

function bloomShaderCallback() {
  const preBlur = uniformTexture(() => originalFrameBuffer);
  getColor((input, canvasContent) => {
    const blurredCol = texture(canvasContent, input.texCoord);
    const originalCol = texture(preBlur, input.texCoord);
    const brightPass = max(originalCol - 0.3, 0.7) * 1.2;
    const bloom = originalCol + blurredCol * brightPass;
    return bloom;
  });
}

function fresnelShaderCallback() {
  const fresnelPower = uniformFloat(2);
  const fresnelBias = uniformFloat(-0.1);
  const fresnelScale = uniformFloat(2);
  const viewDir = uniformVector3();
  const time = uniformFloat(() => millis());

  getWorldInputs((inputs) => {
    let n = normalize(inputs.normal);
    let v = normalize(viewDir);
    
    let base = 1.0 - dot(n, v);
    let fresnel = fresnelScale * pow(base, fresnelPower) + fresnelBias;
    let col = mix([0, 0, 0], [1, .5, .7], fresnel);
    inputs.color = createVector4(col.x, col.y, col.z, 1);

    inputs.position.x += 10 * sin(inputs.position.z + time * 0.01);
    return inputs;
  });
}

async function setup(){
  let canvas = createCanvas(350, 350, WEBGL);
  canvas.parent("sketchContainer")
  
  // stars = buildGeometry(() => sphere(20, 4, 2))
  // originalFrameBuffer = createFramebuffer();

  // starShader = baseMaterialShader().modify(starShaderCallback); 
  // starStrokeShader = baseStrokeShader().modify(starShaderCallback);
  fresnelShader = baseColorShader().modify(fresnelShaderCallback);
  // bloomShader = baseFilterShader().modify(bloomShaderCallback);
  // pixellizeShader = baseFilterShader().modify(pixellizeShaderCallback);


  // note these are all angle ranges:
  xAxisSlider = document.querySelector('#xAxis');
  yAxisSlider = document.querySelector('#yAxis');
  zAxisSlider = document.querySelector('#zAxis');

  describe('An interactive');
}

function draw(){
  // Draw to the offscreen buffer
  // originalFrameBuffer.begin();
  background(0);
  orbitControl(); 

  // Draw the instanced particles
  push()
  // strokeWeight(4)
  // stroke(255,0,0)
  // rotateX(PI/2 + millis() * 0.0005);
  // fill(255,100, 150)
  // strokeShader(starStrokeShader)
  // shader(starShader);
  // model(stars, 5000);
  pop()

  // Draw the central sphere
  push()
  // shader(fresnelShader)
  // let viewDir = [originalFrameBuffer.defaultCamera.eyeX, originalFrameBuffer.defaultCamera.eyeY, originalFrameBuffer.defaultCamera.eyeZ];
  // fresnelShader.setUniform("viewDir", viewDir)
  noStroke()
  sphere(100);
  pop()
  // Pixellize the offscreen buffer
  // filter(pixellizeShader);
  // originalFrameBuffer.end();
  // 
  // Draw the offscreen buffer to the screen and apply post processing  
  imageMode(CENTER)
  // image(originalFrameBuffer, 0, 0)
  // filter(BLUR, 20)
  // filter(bloomShader);
}
