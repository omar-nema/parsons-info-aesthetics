

function getPathbyId(id){
    return d3.selectAll('.puma-path')
        .filter(d => parseInt(d.properties.puma) === id);
}

function mapHighlightHighkey(pumaid){
    getPathbyId(pumaid).classed('highlight-highkey', true);
}

function mapHighlightLowkey(pumaid){
    getPathbyId(pumaid).classed('highlight-lowkey', true);
 }
 
function mapHighlightRemove(){
    d3.select('.map').selectAll('.puma-path').classed('highlight-lowkey', false).classed('highlight-highkey', false);
}

function mapReturnState(pumaid){
    getPathbyId(pumaid).classed('highlight-highkey', false);
}

async function drawMap(){
 
    map = d3.select('.map').append('svg').append('g').attr('transform', 'translate(0,0) scale(1)');
    return await d3.json('./data/pumageosimplified.geojson').then((geopuma) =>{

        var bbox = d3.select('.map').node().getBoundingClientRect();
        var mapw = bbox.width-60;
        // d3.select('.map').style('height', mapw.toString() + 'px');
        bbox = d3.select('.map').node().getBoundingClientRect();
        var maph = bbox.height;
        var projection = d3.geoIdentity().reflectY(true).angle(20).fitSize([mapw, maph], geopuma);
        var path = d3.geoPath().projection(projection);

        map
            .selectAll('path')
            .data(geopuma.features)
            .join('path')
            .attr('d', path)
            .attr('class', d => 'puma-path ' + d.properties.puma)
            .on('mouseover', function(e){
                data = d3.select(this).data()[0];
                var puma = parseInt(data.properties.puma);
                var name = longPumaNameById(puma);
                var linkedData = getOrigData().map.get(puma);
                var displayString = name;
                if (linkedData.highlightData){
                    displayString = `<strong>${linkedData.highlightData.displayName}</strong><br>${name}`
                } 
                showTooltip(displayString, e);
            })
            .on('mouseleave', hideTooltip)
        ;

    //ZOOMING FUNCTION IN MAP  
    var zoom = d3.zoom().translateExtent([[-mapw, -maph], [mapw, maph]]).scaleExtent([1, 5]).on('zoom', zoomed);
    function zoomed({transform}){
        map.attr('transform', transform); 
    }
    map.call(zoom);
    
    updateMapHighlight();

    return;
});
    return ;
    
}

// function updateMap(){
//     d3.selectAll('.puma-path')
//         .classed('active', d=> {
//             var pumaid = parseInt(d.properties.puma);
//             if (pumaid == selectedPumaId){
//                 return true;
//             } else {
//                 return false;
//             }
//         });
// }

// function getStatsbyId(pumaid){
//     return getOrigData().map.get(parseInt(pumaid)).stats;
// }
