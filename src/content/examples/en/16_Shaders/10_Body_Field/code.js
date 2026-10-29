/*
 * Inspired by
 * Golan's https://openprocessing.org/@golan/2405195
 * and Dave's https://editor.p5js.org/davepagurek/sketches/dTizHPqbM
 */

let video;
let bodyPose;
let poses = [];
let connections;
let dataStorage;
let bodyFieldShader;

const loopN = 100;
const pointN = 100;

// Adapted from https://openprocessing.org/@golan/2405195
function bodyField() {
  const points = uniformStorage(dataStorage);
  const progress = uniformFloat("u_progress");
  const green = uniformFloat("u_green");
  filterColor.begin();
  const coord = filterColor.texCoord;
  // Find the distance from this pixel to the nearest body point.
  let minDist = 1.0;
  for (let i = 0; i < 100; i++) {
    const point = [points[i].x, points[i].y];
    minDist = min(minDist, length(coord - point));
  }
  const r = 6.0 * minDist;
  const g = green * coord.y;
  const b = 0.5 + 0.5 * cos(TWO_PI * progress);
  filterColor.set([r, g, b, 1]);
  filterColor.end();
}

async function setup() {
  await createCanvas(640, 640, WEBGPU);
  // Share a fixed-size array of body points with the GPU.
  dataStorage = createStorage(emptyPoints());
  bodyFieldShader = buildFilterShader(bodyField);
  bodyPose = await ml5.bodyPose();
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  connections = bodyPose.getSkeleton();
  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  if (!connections || !dataStorage) return;
  const points = emptyPoints();
  let count = 0;
  for (const pose of poses) {
    for (const [a, b] of connections) {
      if (count >= pointN) break;
      const pointA = pose.keypoints[a];
      const pointB = pose.keypoints[b];
      if (pointA.confidence <= 0.1 || pointB.confidence <= 0.1) continue;
      // Use each skeleton segment's midpoint as a point in the field.
      const x = (pointA.x + pointB.x) / 2;
      const y = (pointA.y + pointB.y) / 2;
      // Normalize to shader coordinates and mirror the webcam horizontally.
      points[count++] = { x: 1 - x / width, y: y / height };
    }
  }
  dataStorage.update(points);
  const t = millis() / 1000;
  const progress = (frameCount % loopN) / loopN;
  bodyFieldShader.setUniform("u_progress", progress);
  bodyFieldShader.setUniform("u_green", noise(t + 1));
  filter(bodyFieldShader);
}

function emptyPoints() {
  // Keep unused points far outside the canvas.
  return Array.from({ length: pointN }, () => ({ x: -10, y: -10 }));
}

function gotPoses(results) {
  // Track one person and ease toward each new pose to reduce jitter.
  const smoothing = 0.2;
  poses = results.slice(0, 1).map((pose, i) => {
    const previousPose = poses[i];
    if (!previousPose) return pose;
    return {
      ...pose,
      keypoints: pose.keypoints.map((point, j) => {
        const previousPoint = previousPose.keypoints[j];
        if (!previousPoint) return point;
        return {
          ...point,
          x: lerp(previousPoint.x, point.x, smoothing),
          y: lerp(previousPoint.y, point.y, smoothing),
          confidence: lerp(previousPoint.confidence, point.confidence, smoothing),
        };
      }),
    };
  });
  // Merge facial landmarks so the head contributes a single location.
  for (const pose of poses) {
    const leftEye = pose.keypoints.find((p) => p.name === "left_eye");
    const rightEye = pose.keypoints.find((p) => p.name === "right_eye");
    if (!(leftEye?.confidence > 0.1 && rightEye?.confidence > 0.1)) continue;
    const x = (leftEye.x + rightEye.x) / 2;
    const y = (leftEye.y + rightEye.y) / 2;
    const merged = ["nose", "left_eye", "right_eye", "left_ear", "right_ear"];
    for (const point of pose.keypoints) {
      if (merged.includes(point.name)) {
        point.x = x;
        point.y = y;
      }
    }
  }
}
