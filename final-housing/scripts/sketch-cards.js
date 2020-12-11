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
            
        }
    );

    d3.selectAll('.card.metro').on('click', function(d,i){
        var sel = d3.select(this)
        var data = sel.data();
        var pumaid = parseInt(data[0]);
        cardSelection(sel, pumaid);
    })
    ;
   
    d3.select('.overlay-close').on('click',  () => {
        d3.selectAll('.card').classed('active', false);
        d3.select('.housing-overlay').classed('active', false);
    });

    return;

}

//separated b/c it's big and applies to diff selections
function populateCardBody(d, dnode){


    //populate card bodies with stats
    var statobj = [
        // {label: 'Occupants/Room', value: 'personsPerRoomMean', percentileval: 'personsPerRoomPercentile', dollarVal: 0},
        // {label: 'Occupants', value: 'personsMean', percentileval: 'personsMeanPercentile', dollarVal:  0},
        {label: 'Income', value: 'incomeMedian', percentileval: 'incomePercentile', dollarVal: 1},
        {label: 'Rent', value: 'rentMedian', percentileval: 'rentPercentile', dollarVal: 1}
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
                var introline = `<div><strong>${statobj.label} percentile rank: ${pctile} `;
                var amtDiff = Math.abs(Math.round(100*(currval - compdata.median)/compdata.median));
                
                if (currval > compdata.median){
                    introline =`${introline}</strong>(${amtDiff}% above median)</div>`
                } else if (currval < compdata.median) {
                    introline = `${introline}</strong>(${amtDiff}% below median)</div>`
                } else {
                    introline =`${introline}(${amtDiff} is equal to median)</div>`
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
            // var colorScale = d3.scaleLinear().domain([0,100]).range(['rgb(30, 30, 30)', 'white']);
            // var colorScale = d3.scaleDiverging(d3.interpolatePuOr).domain([0,50, 100]);
            //var currval = d[1].stats[statobj.value]; //if adding value judgment
            var leftamt = d[1].stats[statobj.percentileval];


            d3.select(this).append('div').attr('class', 'statval currval')
                .style('left', leftamt + '%')
                // .style('background', ()=> colorScale(leftamt))
            ;
        })
    });      

    //add floor plan
    var floorplan = dnode.append('div').attr('class', 'card-data-pt floor-plan')
    floorplan.append('div').attr('class', 'label').html('Housing Avg');
    floorplan.append('div').attr('class', 'value-holder card-plan').each(function(z){
        drawFloorPlans(d[1].stats, d3.select(this))
    })  
}

function cardSelection(sel, pumaid){
    
    d3.select('.housing-data tbody').classed('loading', true);
    d3.selectAll('.card').classed('active', false);
    sel.classed('active', true)
    d3.select('.housing-overlay').classed('active', true);
    setCurrentData(pumaid);
    
    //slows down card click transition when outside. start after card is selected
    setTimeout(function(){
        housingDrilldown();
    }, 20);
}



