var tooltips = [];

function uiInit(){
    qs = select('.qs_main');
    msg = select('#msg');
    btnInit = select('#btn-init')
    msg.style('opacity', 1)
    btnInit.mouseClicked(function(e){
        msg.style('opacity', 0);
        msg.style('pointer-events', 'none');
        qs.style('opacity', .8);
        playPause();
    })

    playBtn = select('.play-btn');
    playBtn.mouseClicked(playPause)

    createTooltips();
    initToolips();
}

function createQuickSettings(){
    settings = QuickSettings.create(40, 30, 'Sound Properties');
    settings.addHTML('playback', '<div class="play-btn">Pause</div>');      
    settings.addHTML('Color Legend', '<img class="legend" src="./legend.svg"/>');    
    settings.addRange('reverb', 0, 1, 0, .1);
    settings.overrideStyle('reverb', 'background', 'black');
    settings.addRange('amplitude', minOctave, maxOctave, 7, 1);   
    settings.addRange('pan', -1, 1, 0, .2);      
    settings.addRange('delay',0, 1, 0, .1)
    settings.addRange('distortion', 0, .1, 0, .01)
}

//make the track loop. called by pause btn/
function playPause(){
    pauseBtn = select(".play-btn");
    if (track.isPlaying() == true){
        pauseBtn.html('play')
        noLoop()
        setTimeout(pTrack,30); //very janky
    } else {
        pauseBtn.html('pause')
        loop()
        track.play();
    }
}

function pTrack(){
    track.pause()
}

function showTooltip(x, y, text){
    tip = select('.tooltip');
    tip.style('opacity', '1')
    tip.style('left', x +'px');
    tip.style('top', y +'px');
    tip.style('pointer-events', 'inherit')
    tip.html(text)
}
function hideTip(){
    tip.style('opacity', '0').style('pointer-events', 'none')
}

function initToolips(){
    console.log(tooltips)
    legend = select('.legend');
    labels = document.querySelectorAll('.qs_label');
    labels.forEach( (d, i)=> {
        if (i > 0){
            divText = '<div class="me">me</div>';
            newDiv = document.createElement('div');
            newDiv.classList.add('slider-'+ i);
            newDiv.classList.add('help');
            newDiv.innerHTML = '(?)';
            d.after(newDiv)
        }
    });
    tipNeeded = selectAll('.help');
    tipNeeded.forEach((d, i)=>{
        sliderClass = d.elt.classList[0];
        check = tooltips.filter(z=> z.class == sliderClass);
        tipText = '';
        if (check[0]){
            tipText = check[0].text;
        }
        console.log(tipText)
        d.mouseOver(e => {showTooltip(mouseX.toString(), mouseY.toString(), tipText)});
        d.mouseOut(hideTip);
    })
}

function createTooltips(){
    var tipTextLegend = {
        text: 'Each pulsing particle represents a frequency range from the track (as indicated below). The brighter a sphere pulses, the more active a given frequency range is.',
        class: 'slider-1'
    };
    var tipTextReverb = {
        text: 'Adjusting reverb will change the size of the room that the sound is housed in',
        class: 'slider-2'
    };
    var tipTextAmplitude = {
        text: 'Amplitude corresponds to volume. Higher amplitude will create more particles.',
        class: 'slider-3'
    };
    var tipTextPan = {
        text:  'Panning is the distribution of sound across speakers. Panning can concentrate sound on a given side of the sonic field.',
        class: 'slider-4'
    };
    var tipTextDelay = {
        text: 'Delay will cause frequencies in the track to resonate and linger. Visually, this is represented by individual particles stretching',
        class: 'slider-5'
    };
    var tipTextDistortion = {
        text: 'Distortion alters the signal of a sound, causing a fuzzy, noisy sound. Visually, this is represented by particles vibrating.',
        class: 'slider-6'
    };                
    tooltips.push(tipTextLegend);
    tooltips.push(tipTextReverb);
    tooltips.push(tipTextAmplitude);
    tooltips.push(tipTextPan);
    tooltips.push(tipTextDelay);
    tooltips.push(tipTextDistortion);
}


