

  document.addEventListener("DOMContentLoaded", function(){
 

        //scrolltelling for intro piece
        var contOffset = d3.select('.scroll-content').node().getBoundingClientRect().top;
        var blocks = d3.selectAll('.scroll-block').nodes();
        d3.select('.scroll-content').on('wheel', d=> {
            var scrollDir = (d.wheelDeltaY > 0) ? 'up': 'down';
            for (i=0; i<blocks.length; i++){
                n = blocks[i];
                var yPos = n.getBoundingClientRect().top - contOffset;
                if (scrollDir == 'down'){
                    if (yPos < 500 && yPos > 10){
                        console.log(yPos);
                        d3.select(blocks[i-1]).style('opacity', 0);
                    }
                } else {
                    if (yPos > 300){
                        d3.select(blocks[i-1]).style('opacity', 1);
                    }
                }
            }
        })


    });


//     var scrollDir;
//     if ((document.body.getBoundingClientRect()).top > scrollPos){
//         scrollDir = 'up';
//     } else {
//         scrollDir = 'down';
//     }
//     document.getElementById('info-box').setAttribute('data-scroll-direction', 'UP');
// else
//     document.getElementById('info-box').setAttribute('data-scroll-direction', 'DOWN');
// // saves the new position for iteration.
// scrollPos = (document.body.getBoundingClientRect()).top;

