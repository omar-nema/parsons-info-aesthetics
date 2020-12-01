function generateCards(datadetail){

    var pane = d3.select('.pane-neighb');
    var cards = pane.selectAll('.card.neighb').data(datadetail, d=> d[0]).join(
        enter => {
            cards = enter.append("div")
            .attr('class', 'card neighb');

            cards.append('div').attr('class', 'card-header').html(d => shortPumaNameById(d[0]));
            cardData = cards.append('div').attr('class', 'card-data');
            var statobj = [
                {label: 'Persons Per Room', value: 'personsPerRoomMean'},
                {label: 'Income', value: 'incomeMedian'},
                {label: 'Rent', value: 'rentMedian'}
            ];
            statobj.forEach((statobj)=> {
                cardDataPt = cardData.append('div').attr('class', 'card-data-pt');
                //append stat label
                cardDataPt.append('div').attr('class', 'label').html(statobj.label);
                cardDataPtValues = cardDataPt.append('div').attr('class', 'value-holder');
                //append stat content
                cardDataPtValues.append('div').attr('class', 'value').html(d=> d[1].stats[statobj.value]);
                cardDataPtScale = cardDataPtValues.append('div').attr('class', 'value').append('div').attr('class', 'scale-holder');
                cardDataPtScale.append('div').attr('class', 'scale');
                cardDataPtScale.append('div').attr('class', 'currval');
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
    console.log(datadetail)
    cards = d3.select('.pane-highlights').selectAll('.card').data(datadetail);
    cards.join(
        enter => {
            cards = enter.append("div")
            .attr('class', 'card highlight');
            cards.append('div').attr('class', 'card-header').html(d => d[1].displayName);
            cardText = cards.append('div').attr('class', 'card-text').html(d=> d[1].displayString)
   
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