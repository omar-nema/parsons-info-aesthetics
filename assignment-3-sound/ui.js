function uiInit(){
    btnInit = select("#btn-init");
    qs = select('.qs_main');
    btnInit.style('opacity', 1)
    btnInit.mouseClicked(function(e){
        btnInit.style('opacity', 0);
        btnInit.style('pointer-events', 'none');
        qs.style('opacity', 1);
        playPause();
    })

}

//make the track loop. called by pause btn/
function playPause(){
    pauseBtn = select(".qs_button");
    if (track.isPlaying() == true){
        pauseBtn.attribute('value', 'play')
        noLoop()
        setTimeout(pTrack,30); //very janky

    } else {
        pauseBtn.attribute('value', 'pause')
        loop()
        track.play();
    }
}

