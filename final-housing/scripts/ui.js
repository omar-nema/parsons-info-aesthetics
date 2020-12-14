//dynamic page navigation functions
var navPage = 'landing';
var searchState = false;
function updateSearchState(state){
    searchState = state;
    updateNav();
};
function updateNavPage(page){
    navPage = page;
    updateNav();
        
};
function updateNav(){
    if (navPage == 'landing' && !searchState){
        setCurrentData();
        generateCards(getCurrentData().map);
        d3.select('.housing-overlay').classed('active', false);
        d3.select('.inner-nav .card-explain').html(`Search for housing stats on any NYC neighborhood`)  
        d3.select('.back-btn').classed('disabled', true);
        d3.select('.bor-holder').classed('disabled', false);
        d3.selectAll('.card.neighb').classed('disabled', true);
    }
    else if (navPage == 'landing' && searchState){
        d3.select('.inner-nav .card-explain').html(`Search for housing stats on any NYC neighborhood`)   
        d3.select('.bor-holder').classed('disabled', true);
        d3.select('.back-btn').classed('disabled', true);
    }
    else if (navPage == 'bor' && !searchState){
        d3.select('.inner-nav .card-explain').html(`Search for metro areas in ${helperCapitalizeFirstLetter(bor)}`)        
        d3.select('.back-btn').classed('disabled', false);
        d3.select('.bor-holder').classed('disabled', true);       
    } 
    updateMapHighlight();
}

//helpers - local and global

//tooltips: break out separately
tooltip = d3.select('.tooltip');
function showTooltip(html, e){
    tooltip
    .html(html)
    .style("visibility", "visible")
    .transition().duration(200)
    .style("opacity", 1)
    .style("left", (e.pageX-20) + "px")
    .style("top", (e.pageY + 40) + "px")
    .style('pointer-events', 'inherit')
;    
}
function hideTooltip(){
    tooltip.style("opacity", 0).style('pointer-events', 'none').style("visibility", "hidden");
}
function helperCapitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};



//initilization for UI elements - called once
function initUI(){
    drawMap();
    initSearch();
    initBoroughSelector();
    initNavTabs();
    initTooltips();
    updateNav();
}
var pageNav = 'landing';
var bor = '';
function initBoroughSelector(){
    
    d3.selectAll('.btn-bor').on('click', function(d){
        bor = d3.select(this).attr('bor');
        d3.select('.pane-neighb').attr('page', 'bor');
        var borData = filterDataByBorough(bor);     
        generateCards(borData);
        updateNavPage('bor');
    });
    
    d3.select('.back-btn').on('click', ()=>{
        updateNavPage('landing');
    });
}
function initNavTabs(){
    d3.selectAll('.nav-option').on('click', function(d,i) {
        d3.selectAll('.nav-option').classed('selected', false);
        sel = d3.select(this);
        sel.classed('selected', true);

        function slide(selectionOut, selectionIn){
            d3.select(selectionOut).classed('active', false);
            d3.select(selectionIn).classed('active', true)
        };

        d3.selectAll('.pane').classed('active', false);
        if (sel.classed('highlights')){
            slide('.pane-neighb', '.pane-highlights');
        } else if (sel.classed('neighb')){
            slide('.pane-highlights', '.pane-neighb');
            
        }
        updateNav();

    });
};
function initTooltips(){
    d3.select('.housing-detail').on('mouseover', function(e){
        var tipdata = 'Shown below are living arrangements in the selected metro area, ordered by representation (items higher on the list are more common). Each combination of adults, children, and rooms in a household constitute a distinct living arrangement. ' 
        showTooltip(tipdata, e);
    })
    .on('mouseout', hideTooltip);
}

//included in UI b/c it does not actually filter, it's just hiding and showing elements that exist
function initSearch(){
    //setup before functions
    var input = d3.select('input.search');
    input.on('click', (e)=> {
        updateSearchState(true);
    })
    .on('mouseout', ()=>{
        if (input.node().value == ''){
            updateSearchState(false);
        }
    })

    var typingTimer;                
    var doneTypingInterval = 200;  
    input.on('keyup', function(){
        clearTimeout(typingTimer);
        if (input.node().value) {
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        } else {
            updateSearchState(false);
        }
    });
    input.on('keydown', function () {
        clearTimeout(typingTimer);
        updateSearchState(true);
    });

    async function doneTyping () {
        
        d3.selectAll('.card.neighb').classed('disabled', true);

        var userString = input.node().value.toLowerCase();
        pn = Array.from(await getPumaNames());
        var idResults = pn.filter(d=> d[0].toLowerCase().includes(userString)).map(d=> d[1]);
        idResults.forEach(d=> {
            var card = d3.select('#metro-'+d.toString())
            console.log(card);
            card.classed('disabled', false)
            card.style('visibility', 'visible').style('opacity', '1').style('height', 'auto')
        })
    };

    d3.select('.search-clear').on('click', () => {
        input.node().value = '';
        updateNav();
    });
}

function initIntro(){

    d3.select('.btn-context').on('click', ()=>{
        d3.select('.scroll-holder').classed('disabled', false);
        d3.selectAll('.scroll-block').style('opacity', '1');
    });

    d3.select('.btn-skip').on('click', ()=>{
        d3.select('.scroll-holder').classed('disabled', true);
        d3.select('.scroll-content').node().scrollTop = 0;
    });
   
    d3.select('.btn-explore').on('click', ()=>{
        d3.select('.scroll-holder').classed('disabled', true);
        d3.select('.scroll-content').node().scrollTop = 0;
    }); 
 

    //scrolltelling for intro piece
    var contOffset = d3.select('.scroll-content').node().getBoundingClientRect().top;
    var blocks = d3.selectAll('.scroll-block').nodes();
    var windowHt = window.innerHeight;
    d3.select('.scroll-content').on('wheel', d=> {
        var scrollDir = (d.wheelDeltaY > 0) ? 'up': 'down';
        for (i=0; i<blocks.length-1; i++){
            n = blocks[i];
            var yPos = n.getBoundingClientRect().top - contOffset;
            if (scrollDir == 'down'){
                if (yPos < windowHt*.75 && yPos > 10){
                    
                    d3.select(blocks[i-1]).style('opacity', 0);
                }
            } else {
                if (yPos > windowHt*.3){
                    d3.select(blocks[i-1]).style('opacity', 1);
                }
            }
        }
    })

    return;
}


function updateMapHighlight(){
    var sel = d3.select('.nav-option.selected');
    if (sel.classed('highlights')){
        d3.selectAll('.card.highlight').each(d=>{
            var puma = d[0];
            mapHighlightLowkey(puma);
        });
    } else {
        mapHighlightRemove();
        d3.selectAll('.card.neighb').each(function(d){
            var puma = d[0];
            if (!d3.select(this).classed('disabled')){
                mapHighlightLowkey(puma);
            }            
        });
    }
};