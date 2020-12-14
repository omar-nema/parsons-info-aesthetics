function housingDrilldown(){

    var table = d3.select('.housing-data tbody');
    var currDataDetail = getCurrentData().detail;

    var transitionTime = 500;
    var houseRows = table.selectAll('.row-house').data(currDataDetail, d=> {return d.geo + '-' + d.weightPersons})
    .join(
            enter => {
            houseRows = enter.append('tr').attr('class', 'row-house').style('opacity', '0').transition().duration(transitionTime).style('opacity', '1');
            houseRows.each(function(d, i){
                var currRow = d3.select(this);
                currRow.append('td').attr('class', 'row-structure').each(function(d){drawFloorPlans(d.houseData, d3.select(this))})
                currRow.append('td').attr('class', 'row-persons').append('div').attr('class', 'detail-persons')
                    .html(d=> '<div>' + d.weightPersons + '</div>')
                ; 

                currRow.append('td').attr('class', 'row-persons').append('div').attr('class', 'detail-remt')
                .html(d=> (d.statsRent > 0) ? ('<div>' + formatDollar(d.statsRent) + '</div>') : ('n/a'));      
                currRow.append('td').attr('class', 'row-persons').append('div').attr('class', 'detail-income')
                .html(d=> (d.statsIncome > 0) ? ('<div>' + formatDollar(d.statsIncome) + '</div>') : ('n/a') ); 
                 
            });
  

        },
        update => {
            update.transition().duration(transitionTime).style('opacity', '1');
        }, 
        exit => {
            exit.transition().duration(transitionTime).style('opacity', '0').on('end', ()=>{ exit.remove() });
        }
    );
    d3.select('.housing-data tbody').classed('loading', false);

    housingDetailTooltips();

};

function housingDetailTooltips(){

    var housingOverlay = d3.select('.housing-overlay');

    housingOverlay.selectAll('.table-head-struct')
    .on('mouseover', function(e){
        showTooltip('<img style="margin: -8.5px -13.5px" src="./assets/legend-room-updated.svg"/>',e)
    })
    .on('mouseout', hideTooltip);

    housingOverlay.select('.table-head-demo.persons')
    .on('mouseover', function(e){
        showTooltip('<div>Number of persons represented by the living arrangement</div>',e)
    })
    .on('mouseout', hideTooltip);

    housingOverlay.select('.table-head-demo.rent')
    .on('mouseover', function(e){
        showTooltip('<div>Median rent for occupants of a given living arrangement (homeowners excluded)</div>',e)
    })
    .on('mouseout', hideTooltip);    

    housingOverlay.select('.table-head-demo.income')
    .on('mouseover', function(e){
        showTooltip('<div>Median income for occupants of a given living arrangement</div>',e)
    })
    .on('mouseout', hideTooltip);    
    
}

function drawFloorPlans(d, dselection){

    //creates generative floor plan based on array of adults, children, rooms

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
    for (var i=0; i< (d.roomsOther); i++){
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
        var ht = 90 + (rowNum-1)*30; //should not have hardcoded num here
        sv.style('height', ht)
    }

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

    //tooltips
    d3.selectAll('.pane-right .housing-unit')
    .on('mouseover',function(e){
        hd = d3.select(this).data()[0];
        var txtbeds = hd.houseArray.length + ' bedrooms';
        var personsPerRoom = Math.round(hd.personsNum/hd.houseArray.length * 10) / 10 ;
        var txtoccupants = hd.personsNum + ' occupants, ' + personsPerRoom + ' per room';
        var txtrooms = hd.houseRoom + ' total rooms'; 
        var tiptext = '<div class="tip-header">Housing Structure Detail</div><div>' + txtoccupants + '<br>' + txtbeds + '<br>' +  txtrooms +'</div>'
        showTooltip(tiptext, e);
    })
    .on('mouseout', hideTooltip);

    //weird workaround to get the heights right outside of detail container (in cards)
    var classNum = rowNum;
    if (colNum == 0){
        classNum = rowNum - 1;
    }
    sv.classed('row-'+classNum.toString(), true);
}

