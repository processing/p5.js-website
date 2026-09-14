let permissionGranted = false;

function setup() {
  describe(
    'Available on mobile devices only: a white circle on a black background that moves and changes size based on the movement of the device.'
  );
  createCanvas(displayWidth, displayHeight);
  background(0);

  // iOS 13+ requires explicit user permission for device motion.
  // Create a button so the user can grant access via a tap gesture.
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    let btn = createButton('Enable Motion');
    btn.position(width / 2 - 60, height / 2 - 20);
    btn.mousePressed(() => {
      DeviceMotionEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            permissionGranted = true;
            btn.remove();
            background(0);
          }
        })
        .catch(console.error);
    });
  } else {
    // Non-iOS devices — permission not required
    permissionGranted = true;
  }
}

function deviceMoved() {
  if (!permissionGranted) return;

  // Map acceleration along x axis to position along canvas width
  let x = map(accelerationX, -10, 10, 0, width);

  // Map acceleration along y axis to position along canvas height
  let y = map(accelerationY, -10, 10, 0, height);

  // Map acceleration along z axis to size between 10-100
  let diameter = map(accelerationZ, -10, 10, 10, 100);

  // Use alpha value to fade out previously drawn circles
  background(0, 64);
  noStroke();
  circle(x, y, diameter);
}