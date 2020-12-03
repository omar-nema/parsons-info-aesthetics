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

    var bor = 'brooklyn';
    if (navPage == 'landing' && !searchState){
        draw(getOrigData().map)
        d3.select('.back-btn').classed('disabled', true);
        d3.select('.bor-holder').classed('disabled', false);
        d3.selectAll('.card.neighb').classed('disabled', true);
    }
    else if (navPage == 'landing' && searchState){
        d3.select('.bor-holder').classed('disabled', true);
    }
    else if (navPage == 'bor' && !searchState){
        d3.select('.back-btn').classed('disabled', false);
        d3.select('.bor-holder').classed('disabled', true);
        d3.selectAll('.card.neighb').classed('disabled', false);
        d3.select('.card-explain').html(`Search for metro areas in ${bor}`)
    } 
}


var pageNav = 'landing';
//landing, search, borough


function initBoroughSelector(){
    
    d3.selectAll('.btn-bor').on('click', function(d){
        var bor = d3.select(this).attr('bor');
        d3.select('.pane-neighb').attr('page', 'bor');
        var borData = filterDataByBorough(bor);     
        generateCards(borData);
        updateNavPage('bor');
    });
    
    d3.select('.back-btn').on('click', ()=>{
        updateNavPage('landing');
    });
}


//lookup init
async function initLookup(){
    var pumaChoices = [];
    pumaId = Array.from(getOrigData().map.keys());
    d3.csv('./data/2010pumanames.txt').then((arr) => {
        nypumas = arr.filter(d => d.STATEFP == '36');
        nypumas.forEach((d)=> {
            pumaIdMap.set(parseInt(d.PUMA5CE), d['PUMA NAME'])
        })
        return pumaIdMap;
    }).then((idmap)=> {
        pumaId.forEach((x)=>{
            pumaChoices.push({
                value: x,
                label: idmap.get(x).replace('NYC-', '').replace('Community ', '')
            })
        });
        return pumaChoices;
    }).then(metros => {
        var input = document.getElementById('metros');
   
        autocomplete({
            input: input,
            fetch: function(text, update) {
                text = text.toLowerCase();
                var suggestions = metros.filter(n => n.label.toLowerCase().includes(text))
                update(suggestions);
            },
            onSelect: function(item) {
                input.value = item.label;
                setCurrentData(item.value);
                draw();
            },
            minLength: 1
        });

        d3.select('.search-clear').on('click', d => {
            document.getElementById('metros').value = null;
            setCurrentData(null);

            draw();
        })
        
    })
};

window.addEventListener("load", function(){
   
    //enable/disable panes
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

    });
});