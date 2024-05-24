let wiggleShader;

let vertSrc = `
precision highp float;

attribute vec3 aPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 vVertexColor;

uniform float time;

void main() {
  vec3 position = aPosition;

  // Add an offset per vertex. There will be a time delay based
  // on the texture coordinates.
  position.y += 20.0 * sin(time * 0.01 + position.y * 0.1);

  // Apply the transformations that have been set in p5
  vec4 viewModelPosition = uModelViewMatrix * vec4(position, 1.0);

  // Tell WebGL where the vertex should be drawn
  gl_Position = uProjectionMatrix * viewModelPosition;  

  // Pass along the color of the vertex to the fragment shader
  vVertexColor = aVertexColor;
}
`;

let fragSrc = `
precision highp float;

// Receive the vertex color from the vertex shader
varying vec4 vVertexColor;

void main() {
  // Color the pixel with the vertex color
  gl_FragColor = vVertexColor;
}
`;

let ribbon;
function setup() {
  createCanvas(700, 400, WEBGL);
  wiggleShader = createShader(vertSrc, fragSrc);

  let startColor = color('#F55');
  let endColor = color('#55F');
  ribbon = buildGeometry(() => {
    noStroke();

    // Draw a ribbon of vertices
    beginShape(QUAD_STRIP);
    let numPoints = 50;
    for (let currentPoint = 0; currentPoint < numPoints; currentPoint++) {
      let x = map(currentPoint, 0, numPoints - 1, -width / 3, width / 3);
      let y = map(currentPoint, 0, numPoints - 1, -height / 3, height / 3);

      // Change color from red to blue along the ribbon
      fill(lerpColor(startColor, endColor, currentPoint / (numPoints - 1)));
      for (let z of [-50, 50]) {
        vertex(x, y, z);
      }
    }
    endShape();
  });

  describe('A red-to-blue ribbon that waves over time');
}

function draw() {
  background(255);
  noStroke();

  rotateX(PI * 0.1);

  // Use the vertex shader we made. Try commenting out this line to see what
  // the ribbon looks like when we don't move it with the shader!
  shader(wiggleShader);

  // Pass the shader the current time so it can animate.
  wiggleShader.setUniform('time', millis());

  // Draw the ribbon. The shader will distort and animate it.
  model(ribbon);
}
