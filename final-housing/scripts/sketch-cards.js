function generateCards(datadetail){

    var pane = d3.select('.pane-neighb');
    var cards = pane.selectAll('.card.neighb').data(datadetail, d=> d[0]).join(
        enter => {
            cards = enter.append("div")
            .attr('class', 'card neighb');

            cards.append('div').attr('class', 'card-header').html(d => longPumaNameById(d[0]));
            cardData = cards.append('div').attr('class', 'card-data');
            var statobj = [
                {label: 'Persons Per Room', value: 'personsPerRoomMean'},
                {label: 'Income', value: 'incomeMedian'},
                {label: 'Rent', value: 'rentMedian'}
            ];
            statobj.forEach((statobj)=> {

                var compdata = getComparisonData()[statobj.value];

                cardDataPt = cardData.append('div').attr('class', 'card-data-pt');
                //append stat label
                cardDataPt.append('div').attr('class', 'label').html(statobj.label);
                cardDataPtValues = cardDataPt.append('div').attr('class', 'value-holder')
                    .on('mouseover',function(e){
                        var pumaname = shortPumaNameById(d3.select(this).data()[0][0]);
                        var currval = d3.select(this).data()[0][1].stats[statobj.value];
                        var introline = `<div>${pumaname} ${statobj.label.toLowerCase()} is `;
                        var amtDiff = Math.abs(Math.round(100*(currval - compdata.median)/compdata.median));
                        if (currval > compdata.median){
                            introline =`${introline}${amtDiff}% above median city value</div>`
                        } else if (currval < compdata.median) {
                            introline = `${introline}${amtDiff}% below median city value</div>`
                        } else {
                            introline =`${introline}${amtDiff} is equal to median city value</div>`
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
                    var leftamt = 100 * (compdata.median - compdata.min) / (compdata.max);
                    d3.select(this).append('div').attr('class', 'statval median').style('left', leftamt + '%');

                    //add curr value dot
                    var currval = d[1].stats[statobj.value];
                    var leftamt = 100 * (currval - compdata.min) / (compdata.max);
                    d3.select(this).append('div').attr('class', 'statval currval').style('left', leftamt + '%');
                })
            });       
            //footer
            cards.append('div').attr('class', 'card-details flat-btn').html('View Details')
            .on('click', function(d,i){
                var sel = d3.select(this)
                var data = sel.data();
                var pumaid = parseInt(data[0]);
                cardSelection(sel, pumaid);
            })
            ;

        }
    );
   
    d3.select('.overlay-close').on('click',  () => {
        disableCards();
        d3.select('.housing-overlay').classed('active', false);
    });

}

function disableCards(){
    d3.selectAll('.card').classed('active', false);
    d3.selectAll('.card-details').classed('disabled', false);
}

function cardSelection(sel, pumaid){
    disableCards();
    d3.select(sel.node().parentNode).classed('active', true);
    sel.classed('active', true);
    sel.classed('disabled', true);
    d3.select('.housing-overlay').classed('active', true);
    setCurrentData(pumaid);
    housingDrilldown();
}

function generateHighlightCards(datadetail){
   
    cards = d3.select('.pane-highlights').selectAll('.card').data(datadetail);
    cards.join(
        enter => {
            cards = enter.append("div")
            .attr('class', 'card highlight');
            
        
            cards.append('div').attr('class', 'card-header').html(d => d[1].displayName);
            cardText = cards.append('div').attr('class', 'card-text').html(d=> d[1].displayString);
            cards.append('div').attr('class', 'card-data').html(function(d){
                //copy pasting pre-created data
                var copysel = d3.selectAll('.card.neighb .card-data').filter(z=> z[0] == d[1].metro);
                return copysel['_groups'][0][0].innerHTML;
            });   

            //footer
            cards.append('div').attr('class', 'card-details flat-btn')
                .html('View Details')
                .on('click', function(d,i) {
                    var sel = d3.select(this);
                    var pumaid = sel.data()[0][1].metro;
                    cardSelection(sel, pumaid)
                });
        }
    );

}


function housingDrilldown(){

    table = d3.select('.housing-data tbody');
    var currDataDetail = getCurrentData().detail;
    var houseRows = table.selectAll('.row-house').data(currDataDetail, d=> {return d.geo + '-' + d.weightPersons}).join('tr').attr('class', 'row-house');
    //for some reason select(this)  doesn't work with es6
    houseRows.each(function(d, i){
        var currRow = d3.select(this);
        currRow.append('td').attr('class', 'row-structure');
        currRow.append('td').attr('class', 'row-occupants');
        currRow.append('td').attr('class', 'row-details');                
    })

    drawFloorPlans();
    updateOccupantColors();
    drawDetails();
}