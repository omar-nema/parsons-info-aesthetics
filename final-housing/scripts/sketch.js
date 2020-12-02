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




var selectedPumaId;
var selectedPumaName;
var pumaIdMap = new Map();
var pumaSelect;
var currDataDetail, currDataStats, selectedPumaName, selectedPumaId;

function setCurrentData(pumainput){
    if (pumainput){
        selectedPumaId = parseInt(pumainput);
        selectedPumaName = shortPumaNameById(pumainput) 
        var currDataMap = new Map();
        var dataToSet = getOrigData().get(selectedPumaId);
        currDataMap.set(selectedPumaId, dataToSet);
        currData = currDataMap;
        currDataDetail = dataToSet.detail;
        currDataStats = dataToSet.stats;
    } else {
        currData = getOrigData();
        currDataDetail = null;
        currDataStats = null;
    }
}

function getCurrentData(){
    return {
        map: currData,
        detail: currDataDetail,
        stats: currDataStats,
        name: selectedPumaName,
        id: selectedPumaId
    }
}

async function initLookup(){
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

async function draw(){
    d3.select('.housing-overlay').classed('active', false);
    generateCards(getCurrentData().map);
    drawMap()
    addTooltips();
}


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

    d3.selectAll('.housing-unit')
    .on('mouseover',function(e){
        hd = d3.select(this).data()[0];
        var txtbeds = hd.houseBed + ' bedrooms';
        var personsPerRoom = Math.round(hd.personsNum/hd.houseBed * 10) / 10 ;
        var txtoccupants = hd.personsNum + ' occupants, ' + personsPerRoom + ' per room';
        var txtrooms = hd.houseRoom + ' total rooms'; 
        var tiptext = '<div class="tip-header">Housing Structure Detail</div><div>' + txtoccupants + '<br>' + txtbeds + '<br>' +  txtrooms +'</div>'
        showTooltip(tiptext, e);
    })
    .on('mouseout', hideTooltip);

    d3.selectAll('.house-head')
    .on('mouseover', function(e){
        showTooltip('<img style="margin: -8.5px -13.5px" src="./legend-room.svg"/>',e)
    })
    .on('mouseout', hideTooltip);

    d3.selectAll('.demo-head')
    .on('mouseover', function(e){
        var tiptext = '<div>Household demographic information for unique combination of occupant composition (quantity and age), and room structure.</div>'
        showTooltip(tiptext, e);
    })
    .on('mouseout', hideTooltip);
 

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