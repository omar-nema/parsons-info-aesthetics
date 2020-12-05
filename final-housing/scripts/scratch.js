       // var distinct = d3.groups(pcd, d => d.geo+'-'+d.personsNum+'-'+d.personsAdultElder+'-'+d.personsChild+'-'+d.personsPartnered+'-'+d.personsAdultOther+'-'+d.houseBed+'-'+d.houseRoom+'-'+d.amenityInternet+'-'+d.amenityHeat);

        // var distinct = d3.groups(pcd, d => d.geo+'-'+d.personsNum+'-'+d.personsAdultTotal+'-'+d.personsPartnered+'-'+d.houseBed+'-'+d.houseRoom);


                 //get some summary stats at geo level
            
                 totalIncome = d3.sum(geoDetail, d=> d.incomeAvg*d.weight);
                 totalWt =  d3.sum(geoDetail, d=> d.weight);
                 avgIncome = totalIncome/totalWt;
     
                 medianPersons = d3.median(geoDetail, d=> d.personsNum);
                 medianRooms = d3.median(geoDetail, d=> d.houseBed);
                 personsPerRoomMedian = medianPersons/medianRooms;


                 function getStatsbyId(pumaid){
                     return getOrigData().get(parseInt(pumaid)).stats;
                 }
                 
                 
                 
                 function lookupChange(){
                     selectedPumaId = pumaSelect.getValue(true);
                     selectedPumaName = cleanPumaName(pumaIdMap.get(selectedPumaId));
                     d3.select('.housing-summary').classed('loading-inline', true);
                     d3.select('.housing-data').classed('loading-inline', true);
                     setTimeout(plotAll, 50);
                 }
                 
                 
                 function cleanPumaName(sel){
                 
                     var boroughStart = sel.indexOf('-')
                     var boroughEnd = sel.indexOf(' ');
                     var borough = sel.substring(boroughStart, boroughEnd).replace('-', '');
                 
                     var lookup = 'District';
                     var startInd = sel.indexOf(lookup);    
                     var districtNum = sel.substring(startInd, startInd +lookup.length+3).replace('-', '');
                 
                     return borough + ' ' + districtNum;
                 }
                 
                 
                 function initLookup(){
                     var pumaChoices = [];
                     pumaId = Array.from(getOrigData().keys());
                     d3.csv('./data/2010pumanames.txt').then((arr) => {
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
                      
                         pumaSelect = new Choices(document.querySelector('.puma-select'), {
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
                     
                         document.querySelector('.puma-select').addEventListener('change', lookupChange);
                         return;
                     }).then(() => {
                         drawMap();
                         plotAll();
                     });
                 }
                 
                 function plotAll(){
                 
                     var currData = getOrigData().get(parseInt(selectedPumaId))
                     var currDataDetail = currData.detail;
                     var currDataStats = currData.stats;
                     console.log('processed detail data ', currDataDetail);
                     console.log('processed stats ', currDataStats)
                 
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
                 
                     generateCards(getOrigData());
                 
                     // drawFloorPlans();
                     // drawOccupants();
                     // updateOccupantColors();
                     // drawDetails();
                     // d3.select('.content').classed('loading', false);
                     // d3.select('.loading-ind').classed('loading', false);
                     // addTooltips();
                 
                 
                     updateMap();
                 }
                 
                 
                 
                 
                 function addTooltips(){
                 
                     //tooltips for stat obj not added here. 
                     //this should prob not be a function on its own
                     
                     d3.selectAll('.puma-path')
                     .on('mouseover',function(e){
                         var pumaid = parseInt(d3.select(this).data()[0].properties.puma);
                         var stats = getStatsbyId(pumaid);
                         var name = cleanPumaName(pumaIdMap.get(pumaid));
                         var txtpersonsper = '<div>' + stats.personsPerRoomMean + ' median persons per bedroom' + '</div>';
                         var txtincome = '<div>' + '$' + stats.incomeMedian + ' median income' + '</div>';
                         var txtrent = '<div>' + '$' + stats.rentMedian + ' median rent' + '</div>';
                         var tiptext = '<div class="tip-header">' + name + '</div>' + txtpersonsper + txtincome + txtrent;
                         showTooltip(tiptext, e);
                    
                     })
                     .on('mouseout', function() {
                         hideTooltip();
                     });
                 
                     
                 
                     d3.selectAll('.occ-head')
                     .on('mouseover', function(e){
                         var img = '<img style="margin: -8.5px -13.5px" src="./legend-occupant.svg"/>';
                         showTooltip(img, e);
                     })
                     .on('mouseout', hideTooltip);
                     d3.selectAll('.label-map')
                     .on('mouseover', function(e){
                         showTooltip('<div>Darker color in the map below indicates more crowdedness (lower number of rooms per person). </div>', e);
                     })
                     .on('mouseout',hideTooltip);
                 
                     d3.selectAll('.occupant-holder')
                     .on('mouseover',function(e){
                         d = d3.select(this).data()[0];
                         var tippersons = d.personsNum + ' persons';
                         var tipkids = d.personsChild + ' children';
                         var adult = (d.personsAdultElder + d.personsAdultOther) + ' adults';
                         var tiptext = '<div><div class="tip-header">Occupancy Details</div>' + tippersons + '<br>' + adult + '<br>' +  tipkids +'</div>'
                         showTooltip(tiptext, e);
                     })
                     .on('mouseout', hideTooltip);
                 }