let track;
let btnPlayPause;
let paramReverb, sliderReverb, sliderPan;
let effectReverb, effectPan;
let attrfft, attrAmp;
let fftLen = 128;
let spheres = [];
let peakDetect;

function preload() {
    // soundFormats('wav')
    track = loadSound('hecker.mp3')  
    //track = loadSound('6a.wav') 
}

function setup() {
    //ui elements
    createCanvas(600, 600, WEBGL)   
    btnPlayPause = createButton('play/pause')
    btnPlayPause.mousePressed(playPause);

    createP('Reverb')
    sliderReverb = createSlider(0, 1, 0, .1);
    attrAmp = new p5.Amplitude();

    createP('Pan')
    sliderPan = createSlider(-1, 1, 0, .1);

    //init effects
    effectReverb = new p5.Reverb();
    track.disconnect();
    effectReverb.process(track,1, 2)
    fft = new p5.FFT(.4, fftLen);
    let bpm = 144;
    beat = new p5.PeakDetect(2000, 20000, 0.02, 60/(bpm/60))
    angleMode(DEGREES)
    userStartAudio();

    initSpheres();
    background(40)


} 

function initSpheres(){
    for (i=0; i< fftLen; i++){
        spheres.push({
            x: random(-width/2, width/2), 
            y: random(-height/2, height/2 ),
            z: random(-50, 300)
        })
    }
}

function playPause(){
    if (track.isPlaying() == true){
        track.pause()
    } else {
        track.play();
    }
}

function updateParams(){
    effectReverb.drywet(sliderReverb.value());
    track.pan(sliderPan.value())
}

function drawSpheres(){
    bands = fft.getOctaveBands(7);
    rScale = map(sliderReverb.value(), 0, 1, .5, 1);
    for (var i=0; i<bands.length; i++){
        push ()
        //translate(0, 100)
        xval = random(-width/2, width/2)
        yval = random(-height/2, height/2);
        zval = random(0, 200)
        n = fft.getEnergy(bands[i].lo, bands[i].hi)
        let ptSize = map(n, 0,255, 18, 20);

        str = color(0,0,255);
        str.setAlpha(map(n, 0,255, 10, 255))


        str2 = str;
        str.setAlpha(map(n, 0,255, 10, 130))
        fill (str)
        
        stroke(str);
        pt = spheres[i];
  
        translate(pt.x*rScale,pt.y*rScale, (pt.z + 10)*rScale)
        rotateX(-rotateAmt)
        rotateY(rotateYAmt)
        sphere(ptSize, sphereDetail, sphereDetail)
        pop ()
    }  
    rotateYAmt += 1;
}


var noiseoff = 0;
var rotateYAmt = 0;
let sphereDetail = 5;
let rotateAmt = 70;

function draw() {

    background(40);
    updateParams();

    let attrfft = fft.analyze();
    let wave = fft.waveform();
    let unitWidth = width/16;
    let unitHt = height/16;
    let scl = 16;

    //change default perspective
    rotateX(rotateAmt) 

    //create horizon grid
    push ()
    noFill()
    strokeWeight(0.2)
    stroke(140)
    translate(-width/2, -height/2, -50)
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

        // bands = fft.getOctaveBands(7);
        // rScale = map(sliderReverb.value(), 0, 1, .5, 1);
        // for (var i=0; i<bands.length; i++){
        //     push ()
        //     //translate(0, 100)
        //     xval = random(-width/2, width/2)
        //     yval = random(-height/2, height/2);
        //     zval = random(0, 200)
        //     n = fft.getEnergy(bands[i].lo, bands[i].hi)
        //     let ptSize = map(n, 0,255, 18, 20);

        //     str = color(0,0,255);
        //     str.setAlpha(map(n, 0,255, 10, 255))


        //     str2 = str;
        //     str.setAlpha(map(n, 0,255, 10, 130))
        //     fill (str)
            
        //     stroke(str);
        //     pt = spheres[i];
      
        //     translate(pt.x*rScale,pt.y*rScale, (pt.z + 10)*rScale)
        //     rotateX(-rotateAmt)
        //     rotateY(rotateYAmt)
        //     sphere(ptSize, sphereDetail, sphereDetail)
        //     pop ()
        // }  
        // rotateYAmt += 1;
    }
    pop ()
    noiseoff +=.01;
}



   //fft.getEnergy(), fft.getOctaveBands()
    //get energy across each octave band and plot
    //scatter the points. or order by frequency
    //peakdetect looks for peak within frequency spectrum




     // for (var i=0; i<attrfft.length; i++){
        //     push ()
        //     //translate(0, 100)
        //     xval = random(-width/2, width/2)
        //     yval = random(-height/2, height/2);
        //     zval = random(0, 200)
        //     let ptSize = map(attrfft[i], 0,255, 20, 30);

        //     str = color(0,0,255);
        //     str.setAlpha(map(attrfft[i], 0,255, 2, 120))

        //     fill (str)
        //     noFill()
        //     stroke(str);
        //     pt = spheres[i];
        //     //
        //     xval = pt.x ;
        //     pt.x = xval;
        //     yval = pt.y ;
        //     pt.y = yval;
        //     translate(xval*ptScale,yval*ptScale,pt.z + 10)
        //     rotateX(-rotateAmt)
        //     sphere(10)
  
        //     pop ()
        // }      
    //where to distribute points = left and right
 
    
    // push ()    
    // translate(50, 50, 10)
    // rotateX(-rotateAmt)
    // sphere(10)
    // pop ()

    // push ()    
    // translate(50, height/2-50, 10)
    // rotateX(-rotateAmt)
    // sphere(10)
    // pop ()

    // push ()    
    // translate(50, -height/2+50, 10)
    // rotateX(-rotateAmt)
    // sphere(10)
    // pop ()

    
    //noLoop();
    // background(0,0,noise(noiseoff)*150);
    // background('yellow')
    // for (i=0; i<7; i++){
    //     stroke(random(100,200))
    //     strokeWeight(0.4)
    //     n = map(noise(noiseoff),0,1, 1, 10)
    //     // shearX(random(PI / 140))
    //     // shearY(random(PI / 140))
    //     sphere(i*40+random(5,10))
        
    // }
    // noiseoff+=.1;