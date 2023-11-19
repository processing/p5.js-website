/**
 * @name Shader as a Texture
 * @description Shaders can be applied to 2D/3D shapes as textures.
 * <br> To learn more about using shaders in p5.js:
 * <a href="https://itp-xstory.github.io/p5js-shaders/">p5.js Shaders</a>
 */

// vertex shader code as a string
let vertexShader = `
 // vert file and comments from adam ferriss
 // https://github.com/aferriss/p5jsShaderExamples
 
 // our vertex data
 attribute vec3 aPosition;
 
 void main() {
 
   // copy the position data into a vec4, using 1.0 as the w component
   vec4 positionVec4 = vec4(aPosition, 1.0);
   positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
 
   // send the vertex information on to the fragment shader
   gl_Position = positionVec4;
 }
 `;

// fragment shader code as a string
let fragmentShader = `
// casey conchinha - @kcconch ( https://github.com/kcconch )
// louise lessel - @louiselessel ( https://github.com/louiselessel )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/
// rotate/tile functions from example by patricio gonzalez vivo
// @patriciogv ( patriciogonzalezvivo.com )

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265358979323846

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 tile (vec2 _st, float _zoom) {
    _st *= _zoom;
    return fract(_st);
}

vec2 rotateTilePattern(vec2 _st){
    
    //  Scale the coordinate system by 2x2
    _st *= 2.0;
    
    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;
    
    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |
    
    // Make each cell between 0.0 - 1.0
    _st = fract(_st);
    
    // Rotate each cell according to the index
    if(index == 1.0){
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st,PI*0.5);
    } else if(index == 2.0){
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st,PI*-0.5);
    } else if(index == 3.0){
        //  Rotate cell 3 by 180 degrees
        _st = rotate2D(_st,PI);
    }
    
    return _st;
}

float concentricCircles(in vec2 st, in vec2 radius, in float res, in float scale) {
    float dist = distance(st,radius);
    float pct = floor(dist*res)/scale;
    return pct;
}

void main (void) {
    vec2 st = gl_FragCoord.xy/resolution.xy;
    vec2 mst = gl_FragCoord.xy/mouse.xy;
    float mdist= distance(vec2(1.0,1.0), mst);
    
    float dist = distance(st,vec2(sin(time/10.0),cos(time/10.0)));
    st = tile(st,10.0);
    
    st = rotate2D(st,dist/(mdist/5.0)*PI*2.0);
    
    gl_FragColor = vec4(vec3(concentricCircles(st, vec2(0.0,0.0), 5.0, 5.0),concentricCircles(st, vec2(0.0,0.0), 10.0, 10.0),concentricCircles(st, vec2(0.0,0.0), 20.0, 10.0)),1.0);
}
`;

// this variable will hold our shader object
let theShader;

// this variable will hold our createGraphics layer
let shaderTexture;

function setup() {
  // shaders require WEBGL mode to work
  createCanvas(710, 400, WEBGL);

  noStroke();
  angleMode(DEGREES);

  // create a shader object using the vertex shader and fragment shader strings
  theShader = createShader(vertexShader, fragmentShader);

  // initialize the createGraphics layers
  shaderTexture = createGraphics(710, 400, WEBGL);

  // turn off the createGraphics layers stroke
  shaderTexture.noStroke();

  describe('Sphere broken up into a square grid with a gradient in each grid.');
}

function draw() {
  background(255);

  // instead of just setting the active shader we are passing it to the createGraphics layer
  shaderTexture.shader(theShader);

  // send uniform values to the shader
  theShader.setUniform('resolution', [width, height]);
  theShader.setUniform('time', millis() / 1000.0);
  theShader.setUniform('mouse', [mouseX, map(mouseY, 0, height, height, 0)]);

  // passing the shaderTexture layer geometry to render on
  shaderTexture.rect(0, 0, width, height);

  // pass the shader as a texture
  texture(shaderTexture);

  // add a sphere using the texture
  translate(-150, 0, 0);
  push();
  rotateX(-mouseY);
  rotateY(-mouseX);
  sphere(125);
  pop();

  // add an ellipse using the texture
  // passing a fifth parameter to ellipse for smooth edges in 3D
  ellipse(260, 0, 200, 200, 100);
}
