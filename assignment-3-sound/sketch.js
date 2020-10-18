let track;
let btnPlayPause;
let paramReverb, sliderReverb, sliderPan, sliderAmp;
let effectReverb, effectPan, effectAmp;
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
    // soundFormats('wav')
    track = loadSound('hecker.mp3')  
    //track = loadSound('6a.wav') 
}

function setup() {
    //ui elements
    createCanvas(windowWidth, windowHeight, WEBGL)   

    settings = QuickSettings.create(20, 20, 'Sound Properties');
    settings.addButton('play/pause', playPause); 
    settings.addRange('reverb', 0, 1, 0, .1);
    settings.addRange('amplitude', minOctave, maxOctave, 7, 1);   
    settings.addRange('pan', -1, 1, 0, .2);      
  
    
    //init effects
    effectReverb = new p5.Reverb();
    track.disconnect();
    effectReverb.process(track,1, 2)
    fft = new p5.FFT(.4, initFft);
    let bpm = 144;
    beat = new p5.PeakDetect(2000, 20000, 0.02, 60/(bpm/60))
    angleMode(DEGREES)
    userStartAudio();

    initSpheres();
    background(40)
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
            xPanR: xPanR
        })
    }
    console.log('sphere obj', spheres);
}


function pTrack(){
    track.pause()
}

//make the track loop
function playPause(){
    if (track.isPlaying() == true){
        noLoop()
        setTimeout(pTrack,30); //very janky

    } else {
        loop();
        track.play();
    }
}

function updateParams(){
     sliderParams = settings.getValuesAsJSON()
    paramReverb = sliderParams.reverb;
    effectReverb.drywet(paramReverb);
    effectPan = sliderParams.pan;
    track.pan(effectPan);
    effectAmp = sliderParams.amplitude;
    track.setVolume(effectAmp/maxOctave);
}


var freqColorBands = [0, 250, 500, 2000, 4000, 6000];
var freqColors = ['#13ead5', '#8fcbac', '#b9ab85',  '#f98cd4', '#f35fc6', '#ea13b8'];
var freqColors = ['#13ead5', '#7fcdcf', '#a8afca', '#c58dc4', '#ea13b8', '#ea13b8'];

function getBandColor(bandCtr){
    bandval = max(freqColorBands.filter(d=> d < bandCtr));
    colorIndex = freqColorBands.indexOf(bandval);
    return freqColors[colorIndex];
}

function drawSpheres(){
    bands = fft.getOctaveBands(effectAmp); 
    rScale = map(paramReverb, 0, 1, .7, 1);
    for (var i=0; i<bands.length; i++){
        
        push ()
        xval = random(-width/2, width/2)
        yval = random(-height/2, height/2);
        zval = random(0, 200)
        n = fft.getEnergy(bands[i].lo, bands[i].hi)
        let ptSize = map(n, 0,255, ptMin, ptMin*1.07);

        col = getBandColor(bands[i].ctr);
        str = color(col);
        str2 = color(col);
        str.setAlpha(map(n, 0,255, 10, 250))
        str2.setAlpha(map(n, 0,255, 50, 250))
        // str2 = str;
        // str.setAlpha(map(n, 0,255, 10, 130))
        fill (str)
        strokeWeight(0.5)
        stroke(str2);
        //stroke('black')

        pt = spheres[i];
        var moveLeft = 0;
        if (effectPan < 0 && pt.x > 0){
            moveLeft = (pt.x - pt.xPanL)*rScale*abs(effectPan);
            pt.currX = pt.x - moveLeft;
        } else if (effectPan > 0 && pt.x < 0){
            moveRight = (-pt.x + pt.xPanR)*rScale*abs(effectPan);
            pt.currX = pt.x + moveRight;     
        }
        translate(pt.currX*rScale,pt.currY*rScale, (pt.z + 10)*rScale)
        rotateX(-rotateAmt)
        rotateY(rotateYAmt)
        sphere(ptSize, sphereDetail, sphereDetail)
        pop ()
    }  
    rotateYAmt += 1;
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


