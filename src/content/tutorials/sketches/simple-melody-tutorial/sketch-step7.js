// Variable for frequency (middle C).
let myFreq = 262;

// Array of frequencies in C Major.
let frequencies = [
  myFreq,
  myFreq * 9/8,
  myFreq * 5/4,
  myFreq * 4/3,
  myFreq * 3/2,
  myFreq * 5/3,
  myFreq * 15/8,
  myFreq * 2
];

// Melody Object for C Major
let melody = {name: 'C Major Scale',
              notesIndex: [0, 1, 2, 3, 4, 5, 6, 7],
              tempo: 120
             };

// Empty array for oscillator objects.
let oscillators = [];

// Calculate duration of each note in seconds.
let noteDuration = 60 / melody.tempo;

/* number of notes that can be played (equal to the number of frequencies/oscillators) */
let numNotes = frequencies.length;

//canvas width
let cWidth = 400;

function setup() {
  createCanvas(400, 400);
  
  // Initialize oscillators and place in oscillators array.
  for (let freq of frequencies) {
    osc = new p5.Oscillator(freq);
    oscillators.push(osc);
  }
  //set color mode to HSB (better for using notes to color keys)
  colorMode(HSB);
}

function draw() {
  background(220);
  drawMelody();  
}

// Starts playing a note at index n in the oscillators array.
function playNote(n) {
  // Starts oscillator if needed.
  if (oscillators[n].started === false) {
      oscillators[n].start();
      // Starts playing the note by increasing the volume with a 0.01 sec fade-in.
      oscillators[n].amp(1, 0.01);
  }
  
  // Stops playing the note after number of seconds stored in noteDuration * 1000
  setTimeout(stopNote, noteDuration * 1000, n); 
}

// Stops playing the note.
function stopNote(n) {
  // Lower oscillator volume to 0.
  oscillators[n].amp(0, 0.01);
  
  // Stop the oscillator.
  oscillators[n].stop();
}

// Plays the notes in a melody.
function play() {
  // Read each [index, note] in melody.notesIndex
  for (let [index, note] of melody.notesIndex.entries()) {
    // Play each note at scheduled time
    setTimeout(playNote, noteDuration * 1000 * index, note);
    
  }
}

//User Interface
function drawMelody() {
  // draw key buttons
  let keyWidth = width/numNotes;
  
  //Loop for the number of notes available
  for (let i = 0; i < numNotes; i ++) {
    //set x for each element
    let x = i * keyWidth;
    let y = keyWidth*3; // height 3x width
     
    // Check if the oscillator[i] has started playing 
    if (oscillators[i].started) {
        //true: define a local variable h
        //using map(), numNotes and i
        let h = map(i, 0, numNotes, 0, 360);
        // use h in fill to set the color of the button 
        fill(h, 100, 100);
      } else {
        fill("white");
      }
      
      // Draw a rounded rectangle button.
      rect(x, y, keyWidth, keyWidth*2, 10);
    }

    }

//play melody with mouse click
function mousePressed(){
  play();
}