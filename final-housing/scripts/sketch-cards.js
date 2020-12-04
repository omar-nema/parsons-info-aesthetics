

function populateCardBody(d, dnode){
    //populate card bodies
    var statobj = [
        {label: 'Persons Per Room', value: 'personsPerRoomMean', percentileval: 'personsPerRoomPercentile', scaledir: -1},
        {label: 'Income', value: 'incomeMedian', percentileval: 'incomePercentile', scaledir: 1},
        {label: 'Rent', value: 'rentMedian', percentileval: 'rentPercentile', scaledir: -1}
    ];



    statobj.forEach((statobj)=> {

        var compdata = getComparisonData()[statobj.value];

        cardDataPt = dnode.append('div').attr('class', 'card-data-pt');
        //append stat label
        cardDataPt.append('div').attr('class', 'label').html(statobj.label);
        cardDataPtValues = cardDataPt.append('div').attr('class', 'value-holder')
            .on('mouseover',function(e){
                var pumaname = shortPumaNameById(d3.select(this).data()[0][0]);
                var currval = d3.select(this).data()[0][1].stats[statobj.value];
                var pctile =  d3.select(this).data()[0][1].stats[statobj.percentileval];
                var introline = `<div>${statobj.label} percentile rank: ${pctile} `;
                var amtDiff = Math.abs(Math.round(100*(currval - compdata.median)/compdata.median));
                
                if (currval > compdata.median){
                    introline =`${introline}(${amtDiff}% above median city value)</div>`
                } else if (currval < compdata.median) {
                    introline = `${introline}(${amtDiff}% below median city value)</div>`
                } else {
                    introline =`${introline}(${amtDiff} is equal to median city value)</div>`
                }
                var line1 = `<div class="card-data-pt"><div class="label">${statobj.label}</div><div class="value">${currval}</div></div>`;
                var line2 = `<div class="card-data-pt"><div class="label">City Median</div><div class="value">${compdata.median}</div></div>`;
                var line3 = `<div class="card-data-pt"><div class="label">City Min (Start Scale)</div><div class="value">${compdata.min}</div></div>`;
                var line4 = `<div class="card-data-pt"><div class="label">City Max (End Scale)</div><div class="value">${compdata.max}</div></div>`;

                var tipdata = `<div class="tip-intro">${introline}</div><div class="card-data">${line1}${line2}${line3}${line4}</div>`;
        
                showTooltip(tipdata, e);
            })
            .on('mouseout', hideTooltip);
        ;
        //append stat content
        cardDataPtValues.append('div').attr('class', 'value').html(d=> d[1].stats[statobj.value]);
        cardDataPtScale = cardDataPtValues.append('div').attr('class', 'value').append('div').attr('class', 'scale-holder');
        cardDataPtScale.append('div').attr('class', 'scale');
        cardDataPtScale.each( function(d) {
             //min, max, median
            //add median dot
            var markerplacements = [25, 50, 75];
            markerplacements.forEach(z=>{
                d3.select(this).append('div').attr('class', 'statval marker').style('left', z + '%');
            });


            //add curr value dot
            //var colorScale = d3.scaleDiverging(d3.interpolatePiYG).domain([0,50, 100]);
            var currval = d[1].stats[statobj.value];
            var leftamt = d[1].stats[statobj.percentileval];
            var scaleamt = (statobj.scaledir == 1) ? leftamt: 100-leftamt;

            d3.select(this).append('div').attr('class', 'statval currval')
                .style('left', leftamt + '%')
            ;
        })
    });      

}

//takes array not map 
function generateCards(datadetail){

    var pane = d3.select('.pane-neighb .card-holder');
    var cards = pane.selectAll('.card.neighb').data(datadetail, d=> d[0]).join(

     
        enter => {
            cards = enter.append("div")
            .attr('class', 'card neighb metro')
            .attr('id', d => 'metro-'+ d[0].toString())
            .classed('disabled', false)
            ;
            cards.append('div').attr('class', 'card-header').html(d => longPumaNameById(d[0]));
            cardData = cards.append('div').attr('class', 'card-data').each(function(d){populateCardBody(d, d3.select(this))})
            ;
            //footer
            // cards.append('div').attr('class', 'card-details flat-btn').html('View Details');
        },
        update => {
            update.classed('disabled', false);
        },
        exit => {
            exit.classed('disabled', true);
        }
    );

    //now create highlight cards - which always use the raw data rather than filtered
    var highlightData = getOrigData().array.filter(d=> d[1].highlightData);
    var hightlightCards = d3.select('.pane-highlights').selectAll('.card').data(highlightData, d=> d[0]);
    hightlightCards.join(
        enter => {
            cards = enter.append("div")
            .attr('class', 'card highlight metro')
            .attr('id', d => 'metro-'+ d[0].toString())
            ;
        
            cards.append('div').attr('class', 'card-header').html(d => d[1].highlightData.displayName);
            cards.append('div').attr('class', 'card-text').html(d=> d[1].highlightData.displayString);
            cards.append('div').attr('class', 'card-data').each(function(d){populateCardBody(d, d3.select(this))})
            
            //footer
            // cards.append('div').attr('class', 'card-details flat-btn')
            //     .html('View Details')
            //     .on('click', function(d,i) {
            //         var sel = d3.select(this);
            //         var pumaid = sel.data()[0][1].metro;
            //         cardSelection(sel, pumaid)
            //     });
        }
    );

    //populateCardBody();

    d3.selectAll('.card.metro').on('click', function(d,i){
        var sel = d3.select(this)
        var data = sel.data();
        var pumaid = parseInt(data[0]);
        cardSelection(sel, pumaid);
    })
    ;
   
    d3.select('.overlay-close').on('click',  () => {
        disableCards();
        d3.select('.housing-overlay').classed('active', false);
    });

    return;

}

function disableCards(){
    d3.selectAll('.card').classed('active', false);
    //d3.selectAll('.card-details').classed('disabled', false);
}

function cardSelection(sel, pumaid){
    disableCards();
    d3.select(sel.node().parentNode).classed('active', true);
    sel.classed('active', true);
    d3.select('.housing-overlay').classed('active', true);
    setCurrentData(pumaid);
    housingDrilldown();
}


function housingDrilldown(){

    table = d3.select('.housing-data tbody');
    var currDataDetail = getCurrentData().detail;

    var transitionTime = 700;
    var houseRows = table.selectAll('.row-house').data(currDataDetail, d=> {return d.geo + '-' + d.weightPersons})
    .join(
            enter => {
            houseRows = enter.append('tr').attr('class', 'row-house').style('opacity', '0').transition().duration(transitionTime).style('opacity', '1');
            houseRows.each(function(d, i){
                var currRow = d3.select(this);
                currRow.append('td').attr('class', 'row-structure').each(function(d){drawFloorPlans(d, d3.select(this))})
                //currRow.append('td').attr('class', 'row-occupants');
                currRow.append('td').attr('class', 'row-details').append('div').attr('class', 'detail-stats');                
            });
            updateOccupantColors();
            populateDetails();

        },
        update => {
            update.transition().duration(transitionTime).style('opacity', '1');
        }, 
        exit => {
            exit.transition().duration(transitionTime).style('opacity', '0').on('end', ()=>{ exit.remove() });
            
            //.on('end', d=> d3.select(d).remove());
        }
    
    );

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


};