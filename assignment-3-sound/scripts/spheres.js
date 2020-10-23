var rotateMult = 1;
function drawSpheres(){
    //break down fft analysis into specific freq bands
    bands = fft.getOctaveBands(effectAmp); 
    //create set of spheres for each band
    for (var i=0; i<bands.length; i++){
        push ()
        xval = random(-width/2, width/2)
        yval = random(-height/2, height/2);
        zval = random(0, 200)
        //amplitude of frequency band used to determine fill and stroke
        n = fft.getEnergy(bands[i].lo, bands[i].hi)
        let ptSize = map(n, 0,255, ptMin, ptMin*1.07);
        col = getBandColor(bands[i].ctr);
        str = color(col);
        str2 = color(col);
        str.setAlpha(map(n, 0,255, 0, 240))
        str2.setAlpha(map(n, 0,255, 10, 255))
        fill (str)
        strokeWeight(1)
        stroke(str2);
    
        pt = spheres[i];

        //move spheres if pan effect activated
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
        //change size if distory applied
        if (paramDistort > 0){
            minSize = map(paramDistort*2.5, 0, .1, .999, .90);
            maxSize = map(paramDistort*2.5, 0, .1, 1.10, 1.001);
            ptSize = random(ptSize*minSize, ptSize*maxSize);
        }
        //rotate spheres, but only if delay is not applied
        if (paramDelay == 0){
            pt.rotate += random(0.3, .8);
            rotateY(pt.rotate)
        }
        sphere(ptSize, sphereDetail, sphereDetail)
        //extend spheres (draw more) if delay applied
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
}
