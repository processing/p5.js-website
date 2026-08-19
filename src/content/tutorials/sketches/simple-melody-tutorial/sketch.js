// Variable for frequency (middle C).
let myFreq = 262;

// Array of frequencies in C Major.
let frequencies = [
  myFreq,
  (myFreq * 9) / 8,
  (myFreq * 5) / 4,
  (myFreq * 4) / 3,
  (myFreq * 3) / 2,
  (myFreq * 5) / 3,
  (myFreq * 15) / 8,
  myFreq * 2,
];

// Melody Object for C Major
let melody = {name: '',
              notesIndex: [],
              tempo: 0
             };


// Empty array for oscillator objects.
let oscillators = [];

// Calculate duration of each note in seconds.
let noteDuration = 60 / melody.tempo;

/* number of notes that can be played (equal to the number of frequencies/oscillators) */
let numNotes = frequencies.length;


// Tempo selection list (in beats per min).
let tempoList = [
  "100",
  "110",
  "120",
  "130",
  "140",
  "150",
  "160",
  "170",
  "180",
  "190",
  "200",
  "210",
  "220",
  "230",
  "240",
  "250",
  "260",
  "270",
  "280",
  "290",
  "300"
];

// Variable for tempo dropdown.
let tempoSelect;

function setup() {
  createCanvas(400, 400);

  // Initialize oscillators and place in oscillators array.
  for (let freq of frequencies) {
    osc = new p5.Oscillator(freq);
    oscillators.push(osc);
  }
  //set color mode to HSB (better for using notes to color keys)
  colorMode(HSB);

  // Play button.
  let playButton = createButton("🎵 Play your song when you are done! 🎶");
  playButton.position(width * 0.2, 540);
  playButton.mouseClicked(play);

  // Text to prompt users to set tempo
  let p = createP("Step 1: Select a tempo");
  p.style("color", "magenta");
  p.position(10, 415);

  // Tempo dropdown menu.
  tempoSelect = createSelect();
  tempoSelect.position(10, 455);
  tempoSelect.option(0);

  // Add tempos to dropdown options.
  for (let tempo of tempoList) {
    tempoSelect.option(tempo);
  }
  
  // Directions to input text.
let p2 = createP('Step 2: Type a name for your melody and click "Set name"');
p2.style("color", "magenta");
p2.position(10, 465);

  // Name of song input.
    nameInput = createInput("Type a name and set");
  	nameInput.position(10, 500);
  	nameInput.size(200);
  
  // Name button.
let nameButton = createButton('Set name');
nameButton.position(250, 500);
nameButton.mouseClicked(setName);

  // Reset button.
let resetButton = createButton('Reset Melody');
resetButton.position(150, 580);
resetButton.mouseClicked(resetMelody);

}

function draw() {
  background(220);
  
  // Draw and color keys on canvas
  drawMelody();
  
  // Call setTempo() when selected
  tempoSelect.changed(setTempo);
  
  // Display melody name
  fill("magenta")
  textSize(20)
  text(`Melody Name: 
${melody.name}`, 50, 50);
  
  // Display melody name
  fill("magenta")
  textSize(20)
  text(`Tempo: 
${tempoSelect.selected()}`, 300, 50);
}


//update melody object when clicked
function mousePressed() {
    updateMelody();
}

//save notes based on keys on the screen
function updateMelody() {
  //width of keys
  let keyWidth = width / numNotes;
    //Loop for the number of notes available
  for (let i = 0; i < numNotes; i++) {
    //set x and y for each element
    let x = i * keyWidth;
    let y = keyWidth * 3;
  
        /* Check if the mouse is 
        over the key */
        if (mouseX > x && 
            mouseX < x + keyWidth && 
            mouseY > y && 
            mouseY < y + keyWidth * 2) {
          //save notes index array
          let notes = melody.notesIndex;
          
          //add new note index to the array
          notes.push(i);
          
          //reassign to melody object
          melody.notesIndex = notes;
          
          //play note at that index
          playNote(i);
        }
      }
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
  
  //prints index of notes from Major C for melody
  console.log(`${melody.notesIndex}`)
}

//User Interface
function drawMelody() {
  // draw key buttons
  let keyWidth = width / numNotes;

  //Loop for the number of notes available
  for (let i = 0; i < numNotes; i++) {
    //set x for each element
    let x = i * keyWidth;
    let y = keyWidth * 3; // height 3x width

    /*  
    Check if the oscillator[i] has started playing and
    the index for the oscillator (i) matches the value 
    in melody.notesIndex[i]
      */
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
    rect(x, y, keyWidth, keyWidth * 2, 10);
  }
}

// Sets tempo of melody object
function setTempo() {
  // Check that the tempo choice isn’t 0
  if (tempoSelect.selected() !== 0) {
    melody.tempo = tempoSelect.selected();
    noteDuration = 60 / melody.tempo;
  }
}

// Set name of melody.
function setName(){
    melody.name = nameInput.value();
}

//Reset melody object
function resetMelody(){
  // Empty melody object
  melody.name =  "Untitled", 
  melody.notesIndex = [], 
  melody.tempo = 0,
    
  // Reset tempo dropdown
  tempoSelect.selected(0);
}