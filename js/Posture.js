var synth = new Tone.AMSynth().toMaster();
var goodPostureY = 0;
var badPostureY = 1000000000;

var postureY = 0;
var chinY = 0;


const alertDelay = 2000;

var audioEndTimeout = -1;
var audioStartTimeout = -1;

var tones = []

var scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
var pitches = [3, 4]
var notes = []

var ticked = false;

// 0 - waiting for camera, 1 - waiting for calibration, 2 - good posture, 3 - bad posture
var gameState = 0;

for (var p = 0; p < pitches.length; p++) {
	for (var s = 0; s < scale.length; s++) {
		notes.push(scale[s] + pitches[p])
	}
}

var noteIdx = randInt(0, notes.length)
var maxDeviation = randInt(1, 5)


function calibrate() {
	goodPostureY = postureY;
	badPostureY = Math.min(chinY, goodPostureY + 200);
}

var audioPlaying  = false
function playAlert() {
	if (Tone.context.state !== 'running') {
		Tone.context.resume();
	}
		
	audioPlaying = true
	noteIdx = noteIdx + (randInt(-maxDeviation, maxDeviation) || 1)
	if (noteIdx < 0) {
		noteIdx *= -1
	}
	if (noteIdx >= notes.length) {
		noteIdx -= notes.length
	}
	synth.triggerAttackRelease(notes[noteIdx], '8n')
	
	if (audioEndTimeout >= 0) clearTimeout(audioEndTimeout);
	audioEndTimeout = setTimeout(function() {audioPlaying = false;}, 200);
}

function randInt(min, max) {
	return min + Math.floor(Math.random() * (max - min))
}

function tick() {
	if (postureY > badPostureY && audioStartTimeout < 0) {
		audioPlaying = true
		audioStartTimeout = setTimeout(playAlert, alertDelay)
	} else if (postureY > badPostureY) {
		if (!audioPlaying) playAlert()
	} else if (postureY <= badPostureY) {
		audioPlaying = false
		maxDeviation = randInt(1, 5)
		if (audioStartTimeout > 0) {
			clearTimeout(audioStartTimeout)
			audioStartTimeout = -1
		}
	}
	
	ticked = true
	updategameState()
}

function updategameState() {
	if (gameState == 0 && postureY) {
		gameState = 1;
	}
	if (gameState == 1 && badPostureY < 1000000000) {
		gameState = 2;
	}
	if (gameState > 1) {
		gameState = postureY <= badPostureY ? 2 : 3;
	}
	
	
	switch (gameState) {
		case 0:
		statusSpan.innerText = "Webcam..."
		statusSubSpan.innerText = "Allow webcam access..."
		 break;
		case 1:
		statusSpan.innerText = "Sit straight..."
		statusSubSpan.innerText = "Look near bottom of screen and press button"
		 break;
		case 2:
		statusSpan.innerText = "Lookin' Good!"
		statusSubSpan.innerText = "You'll hear an alert if you start to slouch"
		 break;
		case 3:
		statusSpan.innerText = "Straighten up!"
		statusSubSpan.innerText = "Annoyed yet?"
		 break;
	}
}