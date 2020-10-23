var tooltips = [];

function uiInit(){
    qs = select('.qs_main');
    msg = select('#msg');
    btnInit = select('#btn-init')
    msg.style('opacity', 1)
    helpMain = select('.help-main');    
    btnInit.mouseClicked(function(e){
        msg.style('opacity', 0);
        msg.style('pointer-events', 'none');
        qs.style('opacity', .8);
        helpMain.style('opacity', 1);
        playPause();
    })

    playBtn = select('.play-btn');
    playBtn.mouseClicked(playPause)

    createTooltips();
    initToolips();

    //initialize help button

    instruction = select('.instruction');
    helpMain.mouseClicked(e => {
        helpMain.style('opacity', '0.3');
        instruction.style('opacity', '1')        
        setTimeout(d=> {
            helpMain.style('opacity', '1');
            instruction.style('opacity', '0')           
        }, 7000)

    });
}


function createQuickSettings(){
    settings = QuickSettings.create(40, 30, 'Sound Properties');
    settings.addHTML('playback', '<div class="play-btn">Pause</div>');      
    settings.addHTML('Frequency Legend', '<object class="legend" data="./visual/legend.svg"/>');    
    settings.addRange('reverb', 0, 1, 0, .1);
    settings.overrideStyle('reverb', 'background', 'black');
    settings.addRange('amplitude', minOctave, maxOctave, 7, 1);   
    settings.addRange('pan', -1, 1, 0, .2);      
    settings.addRange('delay',0, 1, 0, .1)
    settings.addRange('distortion', 0, .1, 0, .01)
}

//disable sliders when track is paused
function disableSettings(){
    settings.disableControl('amplitude');
    settings.overrideStyle('amplitude', 'opacity', '0.3');
    settings.disableControl('reverb');
    settings.overrideStyle('reverb', 'opacity', '0.3');
    settings.disableControl('pan');
    settings.overrideStyle('pan', 'opacity', '0.3');
    settings.disableControl('delay');
    settings.overrideStyle('delay', 'opacity', '0.3');
    settings.disableControl('distortion');
    settings.overrideStyle('distortion', 'opacity', '0.3');
}
function enableSettings(){
    settings.enableControl('amplitude');
    settings.overrideStyle('amplitude', 'opacity', '1');
    settings.enableControl('reverb');
    settings.overrideStyle('reverb', 'opacity', '1');
    settings.enableControl('pan');
    settings.overrideStyle('pan', 'opacity', '1');
    settings.enableControl('delay');
    settings.overrideStyle('delay', 'opacity', '1');
    settings.enableControl('distortion');
    settings.overrideStyle('distortion', 'opacity', '1');
}

//make the track loop. called by pause btn/
function playPause(){
    pauseBtn = select(".play-btn");
    if (track.isPlaying() == true){
        disableSettings();
        pauseBtn.html('play')
        noLoop()
        setTimeout(pTrack,30); //very janky
    } else {
        enableSettings();
        pauseBtn.html('pause')
        loop()
        track.play();
    }
}

function pTrack(){
    track.pause()
}

function showTooltip(e, d){
    x = mouseX.toString(); 
    y = mouseY.toString();

    sliderClass = d.elt.classList[0];
    check = tooltips.filter(z=> z.class == sliderClass);
    tipText = '';
    if (check[0]){
        tipText = check[0].text;
    }
    tip = select('.tooltip');
    tip.style('opacity', '1')
    tip.style('left', x +'px');
    tip.style('top', y +'px');
    tip.style('pointer-events', 'inherit')
    tip.html(tipText);
}
function hideTip(){
    tip.style('opacity', '0').style('pointer-events', 'none')
}

function initToolips(){
    legend = select('.legend');
    labels = document.querySelectorAll('.qs_label');
    labels.forEach( (d, i)=> {
        if (i > 0){
            divText = '<div class="me">me</div>';
            newDiv = document.createElement('div');
            newDiv.classList.add('slider-'+ i);
            newDiv.classList.add('help');
            newDiv.innerHTML = '?';
            d.after(newDiv)
        }
    });
    tipNeeded = selectAll('.help');
    tipNeeded.forEach((d, i)=>{
        d.mouseOver(e => showTooltip(e, d));
        d.mouseOut(hideTip);
    });
}

function createTooltips(){
    var tipTextLegend = {
        text: '<strong>Audio:</strong> Each pulsing particle represents a frequency range from the track (as indicated by color scale to the left). <br><br><strong>Visual:</strong> The brighter a sphere pulses, the more active a given frequency range is.</div>',
        class: 'slider-1'
    };
    var tipTextReverb = {
        text: '<strong>Audio:</strong> Adjusting reverb will change the size of the room that the sound is housed in<br><br><strong>Visual:</strong> Represented by the dispersion of particles in virtual space.',
        class: 'slider-2'
    };
    var tipTextAmplitude = {
        text: '<strong>Audio:</strong> Amplitude corresponds to loudness. <br><br><strong>Visual:</strong> Higher amplitude will create more particles.',
        class: 'slider-3'
    };
    var tipTextPan = {
        text:  '<strong>Audio:</strong> Panning is the distribution of sound across speakers.<br><br><strong>Visual:</strong> Panning will shift particles laterally in virtual space.',
        class: 'slider-4'
    };
    var tipTextDelay = {
        text: '<strong>Audio:</strong> Delay will cause frequencies in the track to resonate and linger. <br><br><strong>Visual:</strong> Represented by particles stretching',
        class: 'slider-5'
    };
    var tipTextDistortion = {
        text: '<strong>Audio:</strong> Distortion alters audio signal, causing a fuzzy, noisy sound. <br><br><strong>Visual:</strong> Shown with particles vibrating.',
        class: 'slider-6'
    };                
    tooltips.push(tipTextLegend);
    tooltips.push(tipTextReverb);
    tooltips.push(tipTextAmplitude);
    tooltips.push(tipTextPan);
    tooltips.push(tipTextDelay);
    tooltips.push(tipTextDistortion);
}


