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
    // soundFormats('wav')
    track = loadSound('hecker.mp3');
    //    track = loadSound('6a.wav') 
    track.setLoop(true)

}

function setup() {
    //ui elements
    createCanvas(windowWidth, windowHeight, WEBGL)   ;

    settings = QuickSettings.create(20, 20, 'Sound Properties');
    settings.addButton('Pause', playPause); 
    settings.addRange('reverb', 0, 1, 0, .1);
    settings.addRange('amplitude', minOctave, maxOctave, 7, 1);   
    settings.addRange('pan', -1, 1, 0, .2);      
    settings.addRange('delay',0, 1, 0, .1)
    settings.addRange('distortion', 0, .1, 0, .01)
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

    angleMode(DEGREES)
    userStartAudio();

    initSpheres();
    background(10);
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



function pTrack(){
    track.pause()
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

var freqColorBands = [0, 250, 500, 2000, 4000, 6000];
var freqColorBands = [0, 250, 500, 2000, 4000];
var freqColors = ['#13ead5', '#8fcbac', '#b9ab85',  '#f98cd4', '#f35fc6', '#ea13b8'];
var freqColors = ['white', 'green', 'red' ,'#13ead5', '#ea13b8'];

var freqColors = ['#13ead5', '#9413EA',  '#EA1384', '#EA1313', '#EA1313']


function getBandColor(bandCtr){
    bandval = max(freqColorBands.filter(d=> d < bandCtr));
    colorIndex = freqColorBands.indexOf(bandval);
    return freqColors[colorIndex];
}

var rotateMult = 1;
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
        str.setAlpha(map(n, 0,255, 0, 250))
        str2.setAlpha(map(n, 0,255, 20, 250))
        // str2 = str;
        // str.setAlpha(map(n, 0,255, 10, 130))
        fill (str)
        strokeWeight(0.5)
        stroke(str2);

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

        if (paramDistort > 0){
            minSize = map(paramDistort*2.5, 0, .1, .999, .87);
            maxSize = map(paramDistort*2.5, 0, .1, 1.13, 1.001);
            ptSize = random(ptSize*minSize, ptSize*maxSize);
        }
        if (paramDelay == 0){
            pt.rotate += random(0.3, .8);
            rotateY(pt.rotate)
        }
        
        sphere(ptSize, sphereDetail, sphereDetail)

        var alpha = str2.levels[3];
        var currAlpha = alpha;
        for (var x=0; x<paramDelay; x+= 0.1){
            currRotation = 0;
            translate(0, 0, ptSize*.3);
            push ()
            currAlpha *= 0.9;
            str3 = color(col);
            str3.setAlpha(currAlpha);
            stroke(str3);
            fill(str3)
            sphere(ptSize, sphereDetail, sphereDetail)
            pop ()
        }
      
        
        pop ()
    }  
    // rotateYAmt += 1 * rotateMult;
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


