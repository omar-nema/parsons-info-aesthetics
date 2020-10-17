
let track;

//rate, pan, reverb
//add sliders for everything and get it working

let btnPlayPause;

let paramReverb, sliderReverb;

let attrAmp;
let effectReverb;
let attrfft;
let fftLen = 256;
let spheres = [];

function preload() {
    // soundFormats('wav')
    track = loadSound('6a.wav')
   
}

function setup() {
    createCanvas(600, 600, WEBGL)   
    btnPlayPause = createButton('play/pause')
    btnPlayPause.mousePressed(playPause);

    createP('Reverb')
    sliderReverb = createSlider(0, 1, .5, .1);
    attrAmp = new p5.Amplitude();

    effectReverb = new p5.Reverb();
    track.disconnect();
    effectReverb.process(track,1, 2)
    //reverbTime, decayRate
    fft = new p5.FFT(.2, fftLen);
    angleMode(DEGREES)
    userStartAudio();

    initSpheres();


} 

function initSpheres(){
    for (i=0; i< fftLen; i++){
        spheres.push({
            x: random(-width/2, width/2), 
            y: random(-height/2 + 50, height/2 - 50),
            z: random(0, 50)
        })
    }
}

//audio current time = 0

function playPause(){
    if (track.isPlaying() == true){
        track.pause()
    } else {
        track.play();
    }
}


function updateParams(){
    effectReverb.drywet(sliderReverb.value());
}


var noiseoff = 0;
function draw() {


    background(90);
    updateParams();


    let attrfft = fft.analyze();
    let wave = fft.waveform();
    let unitWidth = width/16;
    let unitHt = height/16;
    let scl = 16;


    let rotateAmt = 60;
    rotateX(rotateAmt) 

    push ()
    //noisy textured terrain
    fill(30)
    translate(-width/2, -height/2, -50)
    rect(0,0,width,height)
    pop()

 

    let ptScale = 1;
    fill(0)
    strokeWeight(0.2)
    stroke(255)

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


    push ()

    // noLoop()
    // console.log(spheres)
  
    if (track.isPlaying()  == true){
        for (i=0; i<attrfft.length; i++){
            push ()
            //translate(0, 100)
            xval = random(-width/2, width/2)
            yval = random(-height/2, height/2);
            zval = random(0, 200)
            let ptSize = map(attrfft[i], 0,255, 0, 20);

            pt = spheres[i];
            //
            xval = pt.x;
            pt.x = xval;
            yval = pt.y;
            pt.y = yval;
            translate(xval*ptScale,yval*ptScale,pt.z)
            //rotateX(-rotateAmt)
            box(ptSize)
            pop ()
        }      
    }
    pop ()

    noiseoff +=0.1;
    
    //where to distribute points = left and right
 
    
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
}
