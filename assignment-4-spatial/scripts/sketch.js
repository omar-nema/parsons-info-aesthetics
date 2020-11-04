tooltip = d3.select('.tooltip');
var selectedPumaId;
var selectedPumaName;

function cleanPumaName(sel){

    var boroughStart = sel.indexOf('-')
    var boroughEnd = sel.indexOf(' ');
    var borough = sel.substring(boroughStart, boroughEnd).replace('-', '');

    var lookup = 'District';
    var startInd = sel.indexOf(lookup);    
    var districtNum = sel.substring(startInd, startInd +lookup.length+3).replace('-', '');

    return borough + ' ' + districtNum;
}

function plotAll(){
    var currData = getOrigData().get(parseInt(selectedPumaId))
    var currDataDetail = currData.detail;
    var currDataStats = currData.stats;
    console.log('processed detail data ', currDataDetail)

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
    drawFloorPlans();
    drawOccupants();
    updateOccupantColors();
    drawDetails();
    addTooltips();
    d3.select('.content').classed('loading', false);
    d3.select('.loading-ind').classed('loading', false);
}

function initLookup(){
    var pumaChoices = [];
    pumaId = Array.from(getOrigData().keys());
    const pumaUrl = 'https://www2.census.gov/geo/docs/reference/puma/2010_PUMA_Names.txt';
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    var pumaIdMap = new Map();
    d3.csv(proxyurl + pumaUrl).then((arr) => {
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
     
        var pumaSelect = new Choices(document.querySelector('.puma-select'), {
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
    
        document.querySelector('.puma-select').addEventListener('change', function(e){
            selectedPumaId = pumaSelect.getValue(true);
            selectedPumaName = cleanPumaName(idmap.get(selectedPumaId));
            d3.select('.housing-summary').classed('loading-inline', true);
            setTimeout(plotAll, 50);
        });
        return;
    }).then(() => plotAll())
}

async function draw(){
    console.log('processed data ', getOrigData());

    initLookup();

}


function drawHousingSummary(d){

    d3.select('.title-sel').text(selectedPumaName);
    var beds = 'On average, there are <strong>' + d.personsMedian + ' persons occupying ' + d.bedroomMedian + ' bedrooms</strong> in ' + selectedPumaName + '. ';
    var density = '';
    if (d.personsPerRoom > 1){
        density = 'This amounts to <strong>' + d.personsPerRoom + ' persons per room</strong>, which is considered an uncomfortable living arrangement. '
    } else {
        density = 'This amounts to <strong>' + d.personsPerRoom + ' persons per room</strong>, which is considered a comfortable living arrangement. '
    }
    var inc = selectedPumaName + ' has a median household <strong>income of $' + d.incomeMedian + '</strong>'
    if (d.rentMedian){
        inc = inc + ', $' + d.rentMedian + ' of which goes to monthly rent payments.' 
    } else {
        inc = inc + '. '
    }

    var txt = beds + density + inc;
    d3.select('.housing-summary').classed('loading-inline', false);
    d3.select('.housing-summary').html(txt);
}

function drawFloorPlans(){
    //add floor plans
    d3.selectAll('.row-structure').each(function(d,i){
        var sel = d3.select(this).append('svg').append('g').attr('class', 'housing-unit');
        var r = 26;
        var colNum = 0;
        var rowNum = 0;
        var rectPerRow = 3;
        var padding = 6;
        var strokewidth = 1;
        function incrementCol(){
            if (colNum == rectPerRow-1){
                colNum = 0;
                rowNum++;
            } else {
                colNum++;
            }
        };
        var circler = 5;
        var rectColorScale = d3.scaleSequential().domain([0,3]).range(['rgb(203, 205, 222)', 'rgb(216 17 100)']);
 
        //add bedrooms and occupants
        d.houseArray.forEach((x,i) =>{
            var rectX = (colNum)*(padding+r);
            var rectY = (rowNum)*(r+padding);
            var rectCenters = [[r/4, r/4],[3*r/4, r/4],[r/4, 3*r/4],[3*r/4, 3*r/4] ]
            
            sel.append('rect')
                .attr('width', r)
                .attr('height', r)
                .attr('fill', rectColorScale(Math.max(x.length-1, 0)))
                .attr('x', rectX)
                .attr('y', rectY)
                .attr('class', 'room bed')
                ;

            var numCircles = 0;
            x.forEach((z)=> {
                personInHouse = sel.append('circle').attr('circle', 'house-occupant')
                    .attr('class', 'occupant ' + z)
                    .attr('stroke', 'black')
                    .attr('stroke-width', '1px')
                    ;
                //combine with other code
                ;
                if (x.length ==1){ //center
                    personInHouse.attr('r', r/8)
                        .attr('cx', rectX + r/2)
                        .attr('cy', rectY + r/2)
                } else if (x.length ==2){
                    personInHouse.attr('r', r/8)
                    .attr('cx', rectX + r/4+(r/2)*numCircles)
                    .attr('cy', rectY + r/2);
                    numCircles++;        
                }
                else {
                    personInHouse.attr('r', r/8)
                    .attr('cx', rectX + rectCenters[numCircles][0])
                    .attr('cy', rectY + rectCenters[numCircles][1]);
                    if (numCircles < rectCenters.length-1){
                        numCircles++; 
                    }
                }
            });
            incrementCol();
        }) ;


        var nonbedstroke = 3;

        //add rooms outside of bedrooms
        for (var i=0; i< (d.houseRoom - d.houseBed); i++){
            rectX = (colNum)*(padding+r);
            rectY = (rowNum)*(r+padding);
            sel.append('rect')
                .attr('width', r-nonbedstroke)
                .attr('height', r-nonbedstroke)
                .attr('x', rectX+nonbedstroke/2)
                .attr('y', rectY+nonbedstroke/2)
                .attr('fill', 'white')
                .attr('stroke', 'rgb(203 205 222)')
                .attr('stroke-width', nonbedstroke)
                .attr('class', 'room nonbed')
                ;
            incrementCol();
        }

    });

}

function drawOccupants(){
        //add occupants graph
        d3.selectAll('.row-occupants').each(function(x,i){
            var planVis = d3.select(this).append('svg').append('g').attr('class', 'occupant-holder');
            var circlesPerRow = 3;
            var rowNum = 0;
            var colNum = 0;
            var r = 6;
            var padding = 15;
            var strokewidth = 1;
            //needed to display circles in grid
            function incrementCol(){
                if (colNum == circlesPerRow-1){
                    colNum = 0;
                    rowNum++;
                } else {
                    colNum++;
                }
            };
            var partnered = 0;
            x.personsArray.forEach((d,i)=>{  
                planVis.append('circle').attr('r', r)
                .attr('cx', () => {
                    return (colNum)*(padding+r)+ (r+strokewidth);
                })
                .attr('cy', ()=> {
                    return (2*r)+(rowNum)*(2*r+padding/2);
                })
                .attr('class', 'occupant ' + d)
                .attr('stroke', ()=> {
                    if (d == 'adultPartnered' || d == 'adult'){
                        return '#57109e';
                    } else if (d=='child'){
                        return '#14cccc';
                    }
                })
                .attr('stroke-width', strokewidth);
                //add connecting line
                if (d == 'adultPartnered' && partnered == 0){
                    planVis.append('rect').attr('width', padding/2 - padding/10).attr('height', .5)
                    .attr('x', (colNum)*(padding+r)+ (2*r+strokewidth+ padding / 10))
                    .attr('y', (2*r)+(rowNum)*(2*r+.25))
                    .attr('stroke', '#57109e')
                    ;
                    partnered = 1;
                }
                incrementCol();
            });
        });
};

function updateOccupantColors(){
        //update colors
        d3.selectAll('.occupant')
        .attr('fill', function(d,i) 
        {   
            sel = d3.select(this);
            if (sel.classed('adultPartnered') || sel.classed('adult')){
                return '#72B1F0';
            } else if (sel.classed('child')){
                return '#D9ECFF';
            }
        });
};

function drawDetails(){
        //add row details 
        d3.selectAll('.row-details').each(function(d,i){
            var txtweight = 'Persons Represented: ' + d.weightPersons;
            var txtrent = '';
            if (d.statsRent){
                txtrent = 'Median Rent: $' + d.statsRent;
            };
            var txtincome = 'Median Household Income: $' + d.statsIncome;
            var txtstats = '<div>' + txtweight + '<br>' + txtincome + '<br>' + txtrent + '</div>';
            var planVis = d3.select(this).append('div').html(txtstats);
            
        });
};

function addTooltips(){
    
    //add tooltips
    d3.selectAll('.housing-unit')
    .on('mouseover',function(e){
        hd = d3.select(this).data()[0];
        var txtbeds = hd.houseBed + ' bedrooms';
        var personsPerRoom = Math.round(hd.personsNum/hd.houseBed * 10) / 10 ;
        var txtoccupants = hd.personsNum + ' occupants, ' + personsPerRoom + ' per room';
        var txtrooms = hd.houseRoom + ' total rooms'; 
        var tiptext = '<div class="tip-header">Housing Structure Detail</div><div>' + txtoccupants + '<br>' + txtbeds + '<br>' +  txtrooms +'</div>'
        tooltip
                .html(tiptext)
                .transition().duration(200)
                .style("opacity", .95)
                .style("left", (e.pageX) + "px")
                .style("top", (e.pageY + 22) + "px")
                .style('pointer-events', 'inherit')
                ;
    })
    // .on('mouseout', function() {
    //     tooltip.style("opacity", 0).style('pointer-events', 'none');
    // });

    d3.selectAll('.house-head')
    .on('mouseover', function(e){
        tooltip
        .html('<img style="margin: -8.5px -13.5px" src="./legend-room.svg"/>')
        .transition().duration(200)
        .style("opacity", .95)
        .style("left", (e.pageX) + "px")
        .style("top", (e.pageY + 22) + "px")
        .style('pointer-events', 'inherit')
        ;
    })
    .on('mouseout', function(e){
        tooltip.style("opacity", 0).style('pointer-events', 'none');
    });

    d3.selectAll('.demo-head')
    .on('mouseover', function(e){
        var tiptext = '<div>Household demographic information for unique combination of occupant composition (quantity and age), and room structure.</div>'
        ;
        tooltip
        .html(tiptext)
        .transition().duration(200)
        .style("opacity", .95)
        .style("left", (e.pageX) + "px")
        .style("top", (e.pageY + 22) + "px")
        .style('pointer-events', 'inherit')
        ;
    })
    .on('mouseout', function(e){
        tooltip.style("opacity", 0).style('pointer-events', 'none');
    });
 

    d3.selectAll('.occ-head')
    .on('mouseover', function(e){
        tooltip
        .html('<img style="margin: -8.5px -13.5px" src="./legend-occupant.svg"/>')
        .transition().duration(200)
        .style("opacity", .95)
        .style("left", (e.pageX) + "px")
        .style("top", (e.pageY + 22) + "px")
        .style('pointer-events', 'inherit')
        ;
    })
    .on('mouseout', function(e){
        tooltip.style("opacity", 0).style('pointer-events', 'none');
    });
    


    d3.selectAll('.occupant-holder')
    .on('mouseover',function(e){
        d = d3.select(this).data()[0];
        console.log(d);
        var tippersons = d.personsNum + ' persons';
        var tipkids = d.personsChild + ' children';
        var adult = (d.personsAdultElder + d.personsAdultOther) + ' adults';
        var tiptext = '<div><div class="tip-header">Occupancy Details</div>' + tippersons + '<br>' + adult + '<br>' +  tipkids +'</div>'
        tooltip
                .html(tiptext)
                .transition().duration(200)
                .style("opacity", .95)
                .style("left", (e.pageX) + "px")
                .style("top", (e.pageY + 22) + "px")
                .style('pointer-events', 'inherit')
                ;
    })
    .on('mouseout', function() {
        tooltip.style("opacity", 0).style('pointer-events', 'none');
    });
}