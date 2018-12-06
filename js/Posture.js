var synth = new Tone.AMSynth().toMaster();
var goodPostureY = 0;
var badPostureY = 0;
var postureIsBad = false;

var postureY = 0;
var chinY = 0;


const alertDelay = 2000;

var audioEndTimeout = -1;
var audioStartTimeout = -1;

var tones = []


function calibrate() {
	goodPostureY = postureY;
	badPostureY = Math.min(chinY, goodPostureY + 200);
}

var audioPlaying  = false
function playAlert() {
	
	if (Tone.context.state !== 'running') {
		Tone.context.resume();
	}
	
	generateTones()
	
	audioPlaying = true
	for (var i = 0; i < tones.length; i++) {
		synth.triggerAttackRelease(tones[i], '8n', "+" + (0.2 * i))
	}
	
	if (audioEndTimeout >= 0) clearTimeout(audioEndTimeout);
	audioEndTimeout = setTimeout(function() {audioPlaying = false;}, 200 * tones.length);
}

var scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
var pitches = [3, 4]
var notes = []

for (var p = 0; p < pitches.length; p++) {
	for (var s = 0; s < scale.length; s++) {
		notes.push(scale[s] + pitches[p])
	}
}

var noteIdx = randInt(0, notes.length)

function generateTones() {
	var numNotes = randInt(4, 9);
	var maxDeviation = randInt(1, 5)
	tones = []
	for (var i = 0; i < numNotes; i++) {
		tones.push(notes[noteIdx])
		noteIdx = noteIdx + randInt(-maxDeviation, maxDeviation)
		if (noteIdx < 0) {
			noteIdx *= -1
		}
		if (noteIdx >= notes.length) {
			noteIdx -= notes.length
		}
	}
	console.log("tone: " + tones)
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
		if (audioStartTimeout > 0) {
			clearTimeout(audioStartTimeout)
			audioStartTimeout = -1
		}
	}
}