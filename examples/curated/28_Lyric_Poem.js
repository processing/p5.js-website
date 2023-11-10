let lyric =
  "Are you lonesome tonight? Do you miss me tonight? Are you sorry we drifted apart? Does your memory stray to a bright summer day When I kissed you and called you sweetheart? Do the chairs in your parlor seem empty and bare? Do you gaze at your doorstep and picture me there? Is your heart filled with pain, shall I come back again? Tell me dear, are you lonesome tonight? I wonder if youre lonesome tonight You know someone said that the worlds a stage and each of us must play a part Fate had me playing in love with you as my sweetheart Act one was where we met I loved you at first glance You read your lines so cleverly and never missed a cue Then came act two, you seemed to change, you acted strange And why Ive never known Honey, you lied when you said you loved me And I had no cause to doubt you But Id rather go on hearing your lies Than to go on living without you Now the stage is bare and Im standing there With emptiness all around And if you wont come back to me Then they can bring the curtain down Is your heart filled with pain Shall I come back again? Tell me dear, are you lonesome tonight?";

var RSeed = 0;
var words = 15;
var Hue = 0;
var spaceCounter = 1;

function setup() {
  createCanvas(500, 500);
  textAlign(CENTER);
  RSeed = random(0, 9999);
  colorMode(HSB, 255);

  //USING GOOGLE FONTS, IMPORTED IN STYLE.CSS
  textFont("Space Mono");
}

function draw() {
  randomSeed(RSeed);
  Hue = random(0, 255);

  /*SPLIT() BREAKS A STRING INTO PIECES USING A 
  CHARACTER OR STRING AS THE DELIMITER
  IN THIS CASE THE DELIMITER IS ' ' */
  let lyrics = split(lyric, " ");

  //FINDING A RANDOM WORD OF THE LYRIC TO START WITH
  pos = floor(random(0, lyrics.length - words));

  background(Hue, 255, 30);
  var line = 1;

  for (var i = pos; i < pos + words; i++) {
    textSize(32);
    fill(Hue, 200, random(50, 255));
    text(lyrics[i], random(70, 430), (470 / words) * line);
    line++;
  }
}

function mouseClicked() {
  RSeed = random(0, 9999);
  spaceCounter++;
}
