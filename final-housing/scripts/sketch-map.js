function getStatsbyId(pumaid){
    return getOrigData().get(parseInt(pumaid)).stats;
}


async function drawMap(){
    map = d3.select('.map').append('svg').append('g').attr('transform', 'translate(0,0) scale(1)');
    await d3.json('./data/pumageo.geojson').then((geopuma) =>{

        var bbox = d3.select('.map').node().getBoundingClientRect();
        var mapw = bbox.width-20;
        // d3.select('.map').style('height', mapw.toString() + 'px');
        bbox = d3.select('.map').node().getBoundingClientRect();
        var maph = bbox.height-20;

        projection = d3.geoIdentity().fitSize([mapw, maph], geopuma);
        path = d3.geoPath().projection(projection);
        var colorScaleDensity = d3.scaleSequential().domain([1,2]).range(['black', '#cc296d']);

        map
            .selectAll('path')
            .data(geopuma.features)
            .join('path')
            .attr('d', path)
            .attr('class', d => 'puma-path ' + d.properties.puma)
            .attr('stroke', 'rgba(0,0,0,.1)')
            .attr('fill', d=> {
                var mapid = parseInt(d.properties.puma);
                if (getOrigData().get(mapid)){
                    stats = getStatsbyId(mapid);
                    return colorScaleDensity(stats.personsPerRoomMean);
                } else {
                    return 'rgba(0,0,0)'
                }
            })
            .on('click', function(d,i){
                data = d3.select(this).data()[0];
                var mapid = parseInt(data.properties.puma);
                pumaSelect.setChoiceByValue(mapid); //change input
                d3.selectAll('.puma-path').classed('active', false);
                d3.select(this).classed('active', true);
                lookupChange();
            })
        ;

    //ZOOMING FUNCTION IN MAP  
    var zoom = d3.zoom().translateExtent([[-mapw, -maph], [mapw, maph]]).scaleExtent([1, 5]).on('zoom', zoomed);
    function zoomed({transform}){
        map.attr('transform', transform); 
    }
    map.call(zoom);
    
    updateMap();

    return;
});
    addTooltips();
    return ;
    
}

function updateMap(){
    d3.selectAll('.puma-path')
        .classed('active', d=> {
            var pumaid = parseInt(d.properties.puma);
            if (pumaid == selectedPumaId){
                return true;
            } else {
                return false;
            }
        });
}
