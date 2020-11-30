function getStatsbyId(pumaid){
    return getOrigData().get(parseInt(pumaid)).stats;
}



function lookupChange(){
    selectedPumaId = pumaSelect.getValue(true);
    selectedPumaName = cleanPumaName(pumaIdMap.get(selectedPumaId));
    d3.select('.housing-summary').classed('loading-inline', true);
    d3.select('.housing-data').classed('loading-inline', true);
    setTimeout(plotAll, 50);
}


function cleanPumaName(sel){

    var boroughStart = sel.indexOf('-')
    var boroughEnd = sel.indexOf(' ');
    var borough = sel.substring(boroughStart, boroughEnd).replace('-', '');

    var lookup = 'District';
    var startInd = sel.indexOf(lookup);    
    var districtNum = sel.substring(startInd, startInd +lookup.length+3).replace('-', '');

    return borough + ' ' + districtNum;
}


function initLookup(){
    var pumaChoices = [];
    pumaId = Array.from(getOrigData().keys());
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
                label: idmap.get(x)
            })
        });
     
        pumaSelect = new Choices(document.querySelector('.puma-select'), {
            silent: false,
            items: [],
            choices: pumaChoices,
            renderChoiceLimit: -1,
            maxItemCount: -1,
            addItems: true,
            renderSelectedChoices: 'auto',
            loadingText: 'Loading...',
            noResultsText: 'No results found',
            noChoicesText: 'No choices to choose from',
            itemSelectText: ''
        })  
        selectedPumaId = pumaSelect.getValue(true);
        selectedPumaName = cleanPumaName(idmap.get(selectedPumaId));
    
        document.querySelector('.puma-select').addEventListener('change', lookupChange);
        return;
    }).then(() => {
        drawMap();
        plotAll();
    });
}

function plotAll(){

    var currData = getOrigData().get(parseInt(selectedPumaId))
    var currDataDetail = currData.detail;
    var currDataStats = currData.stats;
    console.log('processed detail data ', currDataDetail);
    console.log('processed stats ', currDataStats)

    table = d3.select('.housing-data tbody');
    var houseRows = table.selectAll('.row-house').data(currDataDetail, d=> {return d.geo + '-' + d.weightPersons}).join('tr').attr('class', 'row-house');
    //for some reason select(this)  doesn't work with es6
    houseRows.each(function(d, i){
        var currRow = d3.select(this);
        currRow.append('td').attr('class', 'row-structure');
        currRow.append('td').attr('class', 'row-occupants');
        currRow.append('td').attr('class', 'row-details');                
    })
    drawHousingSummary(currDataStats);

    generateCards(getOrigData());

    // drawFloorPlans();
    // drawOccupants();
    // updateOccupantColors();
    // drawDetails();
    // d3.select('.content').classed('loading', false);
    // d3.select('.loading-ind').classed('loading', false);
    // addTooltips();


    updateMap();
}

