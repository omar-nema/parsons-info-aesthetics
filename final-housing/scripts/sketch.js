async function draw(){
    d3.select('.housing-overlay').classed('active', false);
    await generateCards(getCurrentData().map);
    return;
}



var selectedPumaId;
var selectedPumaName;
var pumaIdMap = new Map();
var pumaSelect;
var currDataDetail, currDataStats, selectedPumaName, selectedPumaId;
var currDataDetailOriginal;

//name lookup helpers
function shortPumaNameById(pumaid){
    var sel = getPumaIdMap().get(parseInt(pumaid));
    var boroughStart = sel.indexOf('-')
    var boroughEnd = sel.indexOf(' ');
    var borough = sel.substring(boroughStart, boroughEnd).replace('-', '');
    var lookup = 'District';
    var startInd = sel.indexOf(lookup);    
    var districtNum = sel.substring(startInd, startInd +lookup.length+3).replace('-', '');
    return borough + ' ' + districtNum;
}

function longPumaNameById(pumaid){
    var idmap = getPumaIdMap();
    var fullname = idmap.get(pumaid)
    return fullname.replace('NYC-', '').replace('Community ', '').replace('--', ' • ');
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
//get and set
function setCurrentData(pumainput){
    resetHousingFilters();
    if (pumainput){
        selectedPumaId = parseInt(pumainput);
        selectedPumaName = shortPumaNameById(pumainput) 
        var currDataMap = new Map();
        var dataToSet = getOrigData().map.get(selectedPumaId);
        currDataMap.set(selectedPumaId, dataToSet);
        currData = currDataMap;
        currDataDetail = dataToSet.detail;
        currDataDetailOriginal = dataToSet.detail;
        currDataStats = dataToSet.stats;
    } else {
        currData = getOrigData().map;
        currDataDetail = null;
        currDataStats = null;
    }
}

var filters = new Map();
function initFilters(){
    var filterTypes = ['personsNum', 'statsRent', 'statsIncome'];
    
    filterTypes.forEach(d=>{
        filters.set(d, {min: null, max: null});
    })
}
function updateFilter(type, min, max){
    var filterToUpdate = filters.get(type);
    if (min == ''){
        filterToUpdate.min =  null;
    } else {
        filterToUpdate.min = min;
    }
    if (max == ''){
        filterToUpdate.max = null;
    } else {
        filterToUpdate.max = max;
    } ;
    filterCurrentDataDetail();
}
function resetHousingFilters(){
    d3.selectAll('.select-filter').each(function(d){
        d3.select(this).classed('active', false);
        d3.select(this).node().selectedIndex = 0;
    })
}



//does not auto reset when nulls are given
function filterCurrentDataDetail(){
    var currDataReplica = currDataDetailOriginal.map(d => d);
    currDataDetail = currDataReplica;
    filters.forEach((val, key) => {
        if (val.min || val.max){
            currDataDetail = currDataDetail.filter(d => d[key] > val.min && d[key] <= val.max )
        } 
    })
}
function getCurrentData(){
    return {
        map: currData,
        detail: currDataDetail,
        detailOriginal: currDataDetailOriginal,
        stats: currDataStats,
        name: selectedPumaName,
        id: selectedPumaId
    }
}
function filterDataByBorough(bor){
    var allbor = getOrigData().array;
    return allbor.filter(d=> d[1].borough == bor );
}
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





//tooltips: break out separately

tooltip = d3.select('.tooltip');

function showTooltip(html, e){
    tooltip
    .html(html)
    .style("visibility", "visible")
    .transition().duration(200)
    .style("opacity", .95)
    .style("left", (e.pageX) + "px")
    .style("top", (e.pageY + 22) + "px")
    .style('pointer-events', 'inherit')
;    
}

function hideTooltip(){
    tooltip.style("opacity", 0).style('pointer-events', 'none').style("visibility", "hidden");
}

function addTooltips(){

    //tooltips for stat obj not added here. 
    //this should prob not be a function on its own
    
    d3.selectAll('.puma-path')
    .on('mouseover',function(e){
        var pumaid = parseInt(d3.select(this).data()[0].properties.puma);
        var stats = getStatsbyId(pumaid);
        var name = cleanPumaName(pumaIdMap.get(pumaid));
        var txtpersonsper = '<div>' + stats.personsPerRoomMean + ' median persons per bedroom' + '</div>';
        var txtincome = '<div>' + '$' + stats.incomeMedian + ' median income' + '</div>';
        var txtrent = '<div>' + '$' + stats.rentMedian + ' median rent' + '</div>';
        var tiptext = '<div class="tip-header">' + name + '</div>' + txtpersonsper + txtincome + txtrent;
        showTooltip(tiptext, e);
   
    })
    .on('mouseout', function() {
        hideTooltip();
    });

    

    d3.selectAll('.occ-head')
    .on('mouseover', function(e){
        var img = '<img style="margin: -8.5px -13.5px" src="./legend-occupant.svg"/>';
        showTooltip(img, e);
    })
    .on('mouseout', hideTooltip);
    d3.selectAll('.label-map')
    .on('mouseover', function(e){
        showTooltip('<div>Darker color in the map below indicates more crowdedness (lower number of rooms per person). </div>', e);
    })
    .on('mouseout',hideTooltip);

    d3.selectAll('.occupant-holder')
    .on('mouseover',function(e){
        d = d3.select(this).data()[0];
        var tippersons = d.personsNum + ' persons';
        var tipkids = d.personsChild + ' children';
        var adult = (d.personsAdultElder + d.personsAdultOther) + ' adults';
        var tiptext = '<div><div class="tip-header">Occupancy Details</div>' + tippersons + '<br>' + adult + '<br>' +  tipkids +'</div>'
        showTooltip(tiptext, e);
    })
    .on('mouseout', hideTooltip);
}