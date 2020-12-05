var pumaIdMap = new Map();
var currDataDetail, currDataStats, selectedPumaName, selectedPumaId;
var currDataDetailOriginal;

//update and filter data
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
function filterCurrentDataDetail(){
    var currDataReplica = currDataDetailOriginal.map(d => d);
    currDataDetail = currDataReplica;
    filters.forEach((val, key) => {
        if (val.min || val.max){
            currDataDetail = currDataDetail.filter(d => d[key] > val.min && d[key] <= val.max )
        } 
    })
}
function filterDataByBorough(bor){
    var allbor = getOrigData().array;
    return allbor.filter(d=> d[1].borough == bor );
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


//placed here b/c it affects current data selection
var filters = new Map();
function initFilters(){
    var filterTypes = ['personsNum', 'statsRent', 'statsIncome'];
    
    filterTypes.forEach(d=>{
        filters.set(d, {min: null, max: null});
    });

    //housing filters
    d3.select('#sort').on('change', function(d){
        var sortSel = d3.select(this).node().value;
        var houseRows = d3.selectAll('.row-house')
        if (sortSel == 'income'){
            houseRows.sort((a,b)=>  b.statsIncome - a.statsIncome);
        }
        else if (sortSel == 'rent'){
            houseRows.sort((a,b)=>  b.statsRent - a.statsRent);
        }  
        else if (sortSel == 'rep'){
            houseRows.sort((a,b)=>  b.weightPersons - a.weightPersons);
        }                 
    });

    d3.selectAll('.select-filter').on('change', function(d){
        var occNode = d3.select(this).node();
        var sortSel = d3.select(this).node().value;
        var selectedItem = occNode.children[occNode.selectedIndex];
        var minVal = parseInt(d3.select(selectedItem).attr('min'));
        var maxVal = parseInt(d3.select(selectedItem).attr('max'));
        if (minVal > -1 || maxVal > -1 ){
            d3.select(this).classed('active', true);
        } else {
            d3.select(this).classed('active', false);
        }
        updateFilter(d3.select(this).attr('id'), minVal, maxVal);
        housingDrilldown();
    });


}

//helpers
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