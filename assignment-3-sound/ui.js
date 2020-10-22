function uiInit(){
    btnInit = select("#btn-init");
    qs = select('.qs_main');
    msg = select('#msg');
    
    btnInit.style('opacity', 1)
    btnInit.mouseClicked(function(e){
        msg.style('opacity', 0);
        msg.style('pointer-events', 'none');
        qs.style('opacity', .8);
        playPause();
    })

    playBtn = select('.play-btn');
    playBtn.mouseClicked(playPause)
}


function createQuickSettings(){
    settings = QuickSettings.create(40, 30, 'Sound Properties');
    settings.addHTML('playback', '<div class="play-btn">Pause</div>');      
    settings.addHTML('Color Legend', '<img src="./legend.svg"/>');    
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

