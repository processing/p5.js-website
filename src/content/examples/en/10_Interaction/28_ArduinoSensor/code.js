

function setup() { 
  createCanvas(400, 400);
  noStroke();
  fill('#ff00aa22');
  receiveSensorData(handleData);
}

function handleData(data, connection) {

  console.log(data); // output the values to log
  // data[0] is the 1st value, data[1] 2nd, etc.

  // draw stuff! Browse http://p5js.org/reference/
  background('#ddd');
  ellipse(100, 200, data[0]+10, data[0]+10);

  // connection.send('send data back to the Arduino if its listening');
}
