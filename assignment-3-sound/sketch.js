let track;
let paramReverb, sliderReverb, sliderPan, sliderAmp;
let paramFreqMin, paramFreqMax;
let paramDelay = 0;
let effectReverb, effectAmp, effectFilterLo, effectFilterHi, effectDelay;
let effectPan, paramPan;

let effectDistort, paramDistort;

let attrfft, attrAmp;
let initFft = 1024;
let spheres = [];
let peakDetect;
let minOctave = 3;
let maxOctave = 30;

var noiseoff = 0;
var rotateYAmt = 0;
let sphereDetail = 5;
let rotateAmt = 90;

let ptMin = 17;

var settings;
var myAngle = 30;
var myColor = '#eeee00';

function preload() {
    track = loadSound('hecker.mp3');
    track.setLoop(true)

}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL)   ;
    background(10);

    //init effects
    track.disconnect();
    effectReverb = new p5.Reverb();
    effectDelay = new p5.Delay();
    effectPanner = new p5.Panner3D();
    effectDistort = new p5.Distortion();
    effectReverb.process(track,1, .5)
    effectDelay.process(track, 0.12, .7, 2300);
    effectDistort.process(track);
    effectDelay.drywet(0);
    effectReverb.chain(effectDelay, effectDistort)
    track.connect(effectReverb)
    fft = new p5.FFT(.4, initFft);
    userStartAudio();
    initSpheres();
   
    angleMode(DEGREES)
    createQuickSettings();
    uiInit();
} 

function initSpheres(){
    for (i=0; i< 1024; i++){
        var xVal = random(-width/2, width/2);
        var yVal = random(-height/2, height/2 );
        var zVal = random(0, height*.6);
        var xPanR = xVal;
        var xPanL = xVal;
        if (xVal < 0){
            xPanR = xVal + random(-xVal, width - xVal);
        } else if (xVal >= 0) {
            xPanL = xVal - random(xVal, (xVal + width/2) );
        }
        spheres.push({
            x: xVal, 
            y: yVal,
            z: zVal,
            currX: xVal,
            currY: yVal,
            xPanL: xPanL,
            xPanR: xPanR,
            rotate: 0
        })
    }
    console.log('sphere obj', spheres);
}




function updateParams(){
    sliderParams = settings.getValuesAsJSON()
    paramReverb = sliderParams.reverb;
    effectReverb.drywet(paramReverb);
    effectPan = sliderParams.pan;
    track.pan(effectPan);
    effectAmp = sliderParams.amplitude;
    track.setVolume(effectAmp/maxOctave);
    paramFreqMin = sliderParams['min freq'];
    paramFreqMax = sliderParams['max freq']
    paramDelay = sliderParams.delay;
    effectDelay.drywet(paramDelay);
    paramDistort = sliderParams.distortion/2.5;
    effectDistort.set(paramDistort.toString(), 'none');  
}

// var freqColorBands = [0, 250, 500, 2000, 4000, 6000];
var freqColorBands = [0, 250, 500, 2000, 4000];
// var freqColors = ['#13ead5', '#8fcbac', '#b9ab85',  '#f98cd4', '#f35fc6', '#ea13b8'];
// var freqColors = ['white', 'green', 'red' ,'#13ead5', '#ea13b8'];
var freqColors = ['#13ead5', '#9413EA',  '#EA1384', '#EA1313', '#EA1313']


function getBandColor(bandCtr){
    bandval = max(freqColorBands.filter(d=> d < bandCtr));
    colorIndex = freqColorBands.indexOf(bandval);
    return freqColors[colorIndex];
}


function draw() {

    background(10);
    updateParams();
    orbitControl()
    let attrfft = fft.analyze();
    let wave = fft.waveform();
    let unitWidth = width/16;
    let unitHt = height/16;
    let scl = 16;


    //change default perspective
    rotateX(rotateAmt) 
    translate(0, 0, -100)

    //create horizon grid
    push ()
    noFill()
    strokeWeight(0.5)
    stroke(140)
 
    translate(-width/2, -height/2, -100)
    for (var y=0; y<scl; y++){
        for (var x=0; x<scl; x++){
            strokeWeight(1)
            rect(x*unitWidth, y*unitHt, unitWidth, unitHt)
        }
    }
    pop()

    strokeWeight(.2)
    stroke(255, 150)
    push ()
    if (track.isPlaying()  == true){
        drawSpheres();
    }
    pop ()
}


