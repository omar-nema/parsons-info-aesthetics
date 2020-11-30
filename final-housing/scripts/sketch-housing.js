function drawFloorPlans(){
    //add floor plans
    d3.selectAll('.row-structure').each(function(d,i){
        var sv = d3.select(this).append('svg');
        sel = sv.append('g').attr('class', 'housing-unit');
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

    });

}

// function drawOccupants(){
//         //add occupants graph
//         d3.selectAll('.row-occupants').each(function(x,i){
//             var planVis = d3.select(this).append('svg').append('g').attr('class', 'occupant-holder');
//             var circlesPerRow = 3;
//             var rowNum = 0;
//             var colNum = 0;
//             var r = 6;
//             var padding = 15;
//             var strokewidth = 1;
//             //needed to display circles in grid
//             function incrementCol(){
//                 if (colNum == circlesPerRow-1){
//                     colNum = 0;
//                     rowNum++;
//                 } else {
//                     colNum++;
//                 }
//             };
//             var partnered = 0;
//             x.personsArray.forEach((d,i)=>{  
//                 planVis.append('circle').attr('r', r)
//                 .attr('cx', () => {
//                     return (colNum)*(padding+r)+ (r+strokewidth);
//                 })
//                 .attr('cy', ()=> {
//                     return (2*r)+(rowNum)*(2*r+padding/2);
//                 })
//                 .attr('class', 'occupant ' + d)
//                 .attr('stroke', ()=> {
//                     if (d == 'adultPartnered' || d == 'adult'){
//                         return '#57109e';
//                     } else if (d=='child'){
//                         return '#14cccc';
//                     }
//                 })
//                 .attr('stroke-width', strokewidth);
//                 //add connecting line
//                 if (d == 'adultPartnered' && partnered == 0){
//                     planVis.append('rect').attr('width', padding/2 - padding/10).attr('height', .5)
//                     .attr('x', (colNum)*(padding+r)+ (2*r+strokewidth+ padding / 10))
//                     .attr('y', (2*r)+(rowNum)*(2*r+.25))
//                     .attr('stroke', '#57109e')
//                     ;
//                     partnered = 1;
//                 }
//                 incrementCol();
//             });
//         });
// };

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
            var txtweight = 'Pct Representation: ' + Math.round(d.weightPct * 100)/100 + '%';
            var txtpersons = 'Persons Represented: ' + d.weightPersons;
            var txtrent = '';
            if (d.statsRent){
                txtrent = 'Median Rent: $' + d.statsRent;
            };
            var txtincome = 'Median Household Income: $' + d.statsIncome;
            var txtstats = '<div>' + txtweight + '<br>' + txtpersons + '<br>' + txtincome + '<br>' + txtrent + '</div>';
            var planVis = d3.select(this).append('div').html(txtstats);
            
        });
};