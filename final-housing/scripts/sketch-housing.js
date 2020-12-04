function drawFloorPlans(d, dselection){
    //add floor plans

    var sv = dselection.append('svg');        
    sel = sv.append('g').attr('class', 'housing-unit');

    var r = 26;
    var colNum = 0;
    var rowNum = 0;
    var rectPerRow = 4;
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
            .attr('fill', '#1E191C')
            .attr('stroke', '#1E191C')
            .attr('stroke-width', nonbedstroke)
            .attr('class', 'room nonbed')
            ;
        incrementCol();
    }
    if (rowNum > 1){
        var ht = 100 + (rowNum-1)*30; //should not have hardcoded num here
        sv.style('height', ht)
    }

    //tooltips
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

}



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

function populateDetails(){
        //add row details 
        d3.selectAll('.detail-stats').each(function(d,i){
            var txtweight = '% Persons: ' + Math.round(d.weightPct * 100)/100 + '%';
            var txtpersons = 'Number Persons: ' + d.weightPersons;
            var txtrent = '';
            if (d.statsRent){
                txtrent = 'Rent Avg: $' + d.statsRent;
            };
            var txtincome = 'House Income Avg: $' + d.statsIncome;
            var txtstats = '<div>' + txtweight + '<br>' + txtpersons + '<br>' + txtincome + '<br>' + txtrent + '</div>';
            var planVis = d3.select(this).html(txtstats);
            
        });
};