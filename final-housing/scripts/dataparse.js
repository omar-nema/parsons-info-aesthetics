// 1) Parse data and create map + array, with getter and setter
// 2) Initialize sketching
document.addEventListener("DOMContentLoaded", async function() {
    initIntro();
    await createPumaIdMap();
    await parseTabularData();
    await addHighlightData();
    setCurrentData();
    console.log('processed data ', dataCleaned)
    createComparisonData();
    initFilters();
    initUI();
    d3.select('.loading-ind').classed('disabled', true);
    d3.select('.content').classed('disabled', false);
});


//core data parsing functions
var dataCleaned = new Map();

//calculate medians from all geos in order to get quantile values later
var allGeoMedians = {
    incomes: [],
    rent: [],
    personsPerRoom: [],
    personsPerRoomRatio: [],
    persons: [],
    buildings: []
};

async function parseTabularData() {
    await d3.csv('./data/pumaAllBuilding.json').then((arr) => {
            return dataProcessRaw(arr);
        })
        .then(async (pcd) => {

            //sort data by metro area
            pcd = pcd.sort(function(x, y) {
                return d3.ascending(parseInt(x.geo), parseInt(y.geo));
            });

            //BAD no idea why this is necessary. somehow filtering for > 0 bedrooms brings in blank data that need to be filtered
            pcd = pcd.filter(d => {
                if (d) return d
            })
            //aggregate data
            var distinct = d3.groups(pcd, d => d.geo, d => d.personsNum + '-' + d.personsAdultTotal + '-' + d.houseBed + '-' + d.houseRoom);
            await dataProcessMetroArea(distinct);

            //calculate percentile value of stats for each metro area
            for (statgrp in allGeoMedians) {
                statarr = allGeoMedians[statgrp];
                statarr.sort((a, b) => d3.ascending(a, b));
            };
            var incomelen = allGeoMedians.incomes.length;
            var rentlen = allGeoMedians.rent.length;
            var personsperlen = allGeoMedians.personsPerRoom.length;
            var personslen = allGeoMedians.persons.length;
            var buildings = allGeoMedians.persons.length;
         
            dataCleaned.forEach(d => {
                var incomeindex = allGeoMedians.incomes.indexOf(d.stats.incomeMedian)
                d.stats.incomePercentile = Math.round(100 * (incomeindex) / incomelen);
                var rentindex = allGeoMedians.rent.indexOf(d.stats.rentMedian)
                d.stats.rentPercentile = Math.round(100 * (rentindex) / rentlen);
                var personsperindex = allGeoMedians.personsPerRoom.indexOf(d.stats.personsPerRoomMean);
                d.stats.personsPerRoomPercentile = Math.round(100 * (personsperindex) / personsperlen);
                var personsindex = allGeoMedians.persons.indexOf(d.stats.personsMean);
                d.stats.personsMeanPercentile = Math.round(100 * (personsindex) / personslen);

            });

            return dataCleaned;
        });
};




function dataProcessRaw(arr) {
    //data from ACS comes in at person level. need to change to household level
    var dedupeCluster = d3.groups(arr, d => d['[["WGTP"'] + d.GRNTP + d.HINCP + d.NRC + d.NP);
    console.log('raw data ', arr);
    var dedupeFlat = [];
    dedupeCluster.forEach((x) => {
        dedupeFlat.push(x[1][0])
    });
    return dedupeFlat.map((d) => {
        var internet = 0;
        var partner = 0;
        var kitchen = 0;
        var fuel = 0;
        var phone = 0;
        if (d.ACCESS > 0) {
            internet = 1;
        }
        if (parseInt(d.HHT2) > 0 && parseInt(d.HHT2) < 5) {
            partner = 1;
        }
        var houseWt = d['[["WGTP"'].replace('[', '').replace('"', '');
        //var houseWt = d['[["PWGTP"'].replace('[', '').replace('"', ''); 
        if (d.NRC == -1) {
            d.NRC = 0;
        }
        if (parseInt(d.HFL) !== 9) {
            fuel = 1;
        }
        var numAdultsOther = parseInt(d.NP) - parseInt(d.NRC) - parseInt(d.R65);

        // && parseInt(d.GRNTP) > 0 && parseInt(d.TEN) == 3
        if (parseInt(d.NP) !== 0 && parseInt(d.BDSP) !== -1 && d.BDSP > 0 && parseInt(d.NP) > 0) {
            return {
                geo: d.PUMA,
                weight: parseInt(houseWt),
                weightPersons: parseInt(houseWt) * parseInt(d.NP),
                personsNum: +d.NP,
                personsAdultElder: +d.R65,
                personsAdultOther: numAdultsOther,
                personsAdultTotal: parseInt(d.R65) + numAdultsOther,
                personsChild: parseInt(d.NRC),
                personsPartnered: partner,
                houseBed: +d.BDSP,
                houseRoom: +d.RMSP,
                amenityInternet: internet,
                amenityHeat: fuel,
                rent: parseInt(d.GRNTP),
                income: parseInt(d.ADJINC) * parseInt(d.HINCP),
                multiLang: +d.LANX,
                building: +d.BLD
            }


        }

    });
}


function dataProcessMetroArea(distinct) {
    //for each geo, aggregate income and other stats based on distinct housing type
    distinct.forEach((geosplit) => {

        //calculate median values
        var geoIncomes = [];
        var geoBedrooms = [];
        var geoPersons = [];
        var geoChildren = [];
        var geoRent = [];
        var geoWtScaledPerson = [];
        var geoRooms = [];
        var geoBuildings = [];
        var geoPersonsPerRoomRatio = [];

        //stats within metro area 
        geosplit[1].forEach((geoCluster) => {
            geoCluster[1].forEach((rowVal) => { //housing type level
                for (i = 0; i < rowVal.weight; i++) { //individual response level
                    if (rowVal.income > 0){
                        geoIncomes.push(rowVal.income);
                    }
                    geoBedrooms.push(rowVal.houseBed);
                    geoPersons.push(rowVal.personsNum);
                    geoChildren.push(rowVal.personsChild);
                    geoRooms.push(rowVal.houseRoom)
                    geoPersonsPerRoomRatio.push(rowVal.personsNum/rowVal.houseBed);
                    if (rowVal.rent > 0) {
                        geoRent.push(rowVal.rent)
                    }
                    if (rowVal.building > 0){
                        geoBuildings.push(rowVal.building);
                    }
                }
                geoWtScaledPerson.push(rowVal.weight * rowVal.personsNum)
            })
        });


        //stat at metro area level
        var geoPersonsWt = d3.sum(geoWtScaledPerson);
        var geoWt = geoBedrooms.length; //basically we pushed 1 row per weight value. so taking length array gives you total weight.
        var incomeMedian = d3.median(geoIncomes);
        var bedroomMedian = d3.median(geoBedrooms);
        var bedroomMean = d3.mean(geoBedrooms);
        var personsMedian = d3.median(geoPersons);
        var personsMean = Math.round(d3.mean(geoPersons) * 10) / 10;
        var childrenMedian = d3.median(geoChildren);
        var childrenMean = d3.mean(geoChildren);
        var rentMedian = d3.median(geoRent);
        var roomsMedian = d3.median(geoRooms);
        var personsPerRoomMean = Math.round(personsMean / bedroomMean * 100) / 100;
        var personsPerRoomRatioMedian = d3.median(geoPersonsPerRoomRatio);

        var buildingsMedian = d3.median(geoBuildings);
        allGeoMedians.incomes.push(incomeMedian);
        allGeoMedians.rent.push(rentMedian);
        allGeoMedians.personsPerRoom.push(personsPerRoomMean);
        allGeoMedians.persons.push(personsMean);
        allGeoMedians.buildings.push(buildingsMedian);
        allGeoMedians.personsPerRoomRatio.push(personsPerRoomRatioMedian);


        //stats at PUMA level - except for floor plan
        var summaryStats = {
            incomeMedian: incomeMedian,
            rentMedian: rentMedian,
            buildingTop: buildingsMedian,
            bedroomMedian: bedroomMedian,
            bedroomMean: Math.round(bedroomMean * 10) / 10,
            personsMedian: personsMedian,
            personsMean: Math.round(personsMean * 10) / 10,
            childrenMedian: childrenMedian,
            childrenMean: childrenMean,
            personsPerRoom: Math.round(personsMedian / bedroomMedian * 10) / 10,
            personsPerRoomMean: personsPerRoomMean,
            personsPerRoomRatio: personsPerRoomRatioMedian,
            weightTotal: geoWt,
            weightTotalScaled: geoPersonsWt,
        };

        //detailed data at housing combo level
        var geoDetail = geosplit[1].map((grped) => {
            var weightTotal = d3.sum(grped[1], d => d.weight);
            var weightPersonsTotal = d3.sum(grped[1], d => d.weightPersons);
            detailIncome = [];
            detailRent = [];
            grped[1].forEach((rowVal) => {
                for (i = 0; i < rowVal.weight; i++) {
                    detailIncome.push(rowVal.income);
                    if (rowVal.rent > 0) {
                        detailRent.push(rowVal.rent)
                    }
                }
            })
            detailIncomeMedian = d3.median(detailIncome);
            detailRentMedian = d3.median(detailRent);
            d = grped[1][0];
            d.personsPartnered = d.personsPartnered * 2;

            return {
                weight: weightTotal,
                weightPct: 100 * weightPersonsTotal / geoPersonsWt,
                weightPersons: weightPersonsTotal,
                geo: d.geo,
                personsNum: d.personsNum,
                personsAdultElder: d.personsAdultElder,
                personsChild: d.personsChild,
                personsPartnered: d.personsPartnered,
                personsAdultOther: d.personsAdultOther,
                personsAdultNonPartnered: d.personsAdultOther - d.personsPartnered,
                houseBed: d.houseBed,
                houseRoom: d.houseRoom,
                houseData: {
                    houseArray: createFloorPlans(d.personsAdultTotal, d.personsChild, d.houseBed),
                    roomsOther: d.houseRoom - d.houseBed,
                },
                houseArray: createFloorPlans(d.personsAdultTotal, d.personsChild, d.houseBed),
                amenityInternet: d.amenityInternet,
                amenityHeat: d.amenityHeat,
                statsIncome: detailIncomeMedian,
                statsRent: detailRentMedian
            }

        });

        //for highlight cards, get 2 and 4 person bed avgs
    
        var dataFilteredBy2 = geoDetail.filter(d=> d.personsNum == 2);
        var dataFilteredBy4 = geoDetail.filter(d=> d.personsNum == 4);
        var stats2Person = {
            children: d3.median(dataFilteredBy2.map(d => d.personsChild)),
            bedrooms: d3.median(dataFilteredBy2.map(d => d.houseBed)),
            rooms: d3.median(dataFilteredBy2.map(d => d.houseRoom))
        };
        var stats4Person = {
            children: d3.median(dataFilteredBy4.map(d => d.personsChild)),
            bedrooms: d3.median(dataFilteredBy4.map(d => d.houseBed)),
            rooms: d3.median(dataFilteredBy4.map(d => d.houseRoom))
        };
        var houseData = [
            {
                houseArray: createFloorPlans(2-stats2Person.children, stats2Person.children, stats2Person.bedrooms),
                roomsOther: stats2Person.rooms-stats2Person.bedrooms,
                type: '2'
            },
            {
                houseArray: createFloorPlans(4-stats4Person.children, stats4Person.children, stats4Person.bedrooms),
                roomsOther: stats4Person.rooms-stats4Person.bedrooms, 
                type: '4'
            },
        ];
        summaryStats.houseData = houseData;

        // summaryStats.houseArray = createFloorPlans(4, 0, dataFilteredByMedianBedrooms);
        // summaryStats.houseRoom = dataFilteredByMedianTotalRooms;

        //create new clean data object
        geoDetail = d3.sort(geoDetail, (a, b) => b.weightPersons - a.weightPersons); //sort by weight desc    
        geoKey = geosplit[0];

        var detailObj = {
            detail: geoDetail,
            stats: summaryStats,
            borough: helperGetBorough(geoKey),
            district: parseInt(pumaIdMap.get(parseInt(geoKey)).match(/\d+/g).join(''))
         
        }
        dataCleaned.set(parseInt(geoKey), detailObj);

    });

    dataCleaned = new Map([...dataCleaned.entries()].sort((a,b)=> {
        return a[1].district - b[1].district
    }));
  
    return dataCleaned;

}


function createFloorPlans(adults, children, bedrooms){
    var personsArray = [];
    for (var z = 0; z < adults; z++) {
        personsArray.push('adult');
    }
    for (var z = 0; z < children; z++) {
        personsArray.push('child');
    }
    var houseArray = [];
    for (var i = 0; i < bedrooms; i++) {
        houseArray.push([]);
    }
    if (bedrooms> 0) {
        var ind = 0;
        for (var i = 0; i < personsArray.length; i++) {
            houseArray[ind].push(personsArray[i]);
            if (ind < houseArray.length - 1) {
                ind++;
            } else {
                ind = 0;
            }
        }
    }; 
    return houseArray;
}


function addHighlightData() {

    var dataCleanedArray = Array.from(dataCleaned);
    var statTypes = [{
            key: 'personsMin',
            statKey: 'personsPerRoomMean',
            statQualifier: 'min',
            displayName: 'Metro Area with Least Crowded Housing', 
            displayOrder: 1
        },
        {
            key: 'personsMax',
            statKey: 'personsPerRoomMean',
            statQualifier: 'max',
            displayName: 'Metro Area with Most Crowded Housing', 
            displayOrder: 2
        },
        {
            key: 'incomeMedianMin',
            statKey: 'incomeMedian',
            statQualifier: 'min',
            displayName: 'Metro Area with Lowest Income', 
            displayOrder: 5
        },
        {
            key: 'incomeMedianMax',
            statKey: 'incomeMedian',
            statQualifier: 'max',
            displayName: 'Metro Area with Highest Income', 
            displayOrder: 6
        },
        {
            key: 'rentMin',
            statKey: 'rentMedian',
            statQualifier: 'min',
            displayName: 'Metro Area with Lowest Rent', 
            displayOrder: 3
        },
        {
            key: 'rentMax',
            statKey: 'rentMedian',
            statQualifier: 'max',
            displayName: 'Metro Area with Highest Rent', 
            displayOrder: 4
        },

    ];
    statTypes.forEach(statType => {
        var index, val;
        if (statType.statQualifier == 'max') {
            index = d3.maxIndex(dataCleanedArray, d => d[1].stats[statType.statKey]);
            val = d3.max(dataCleanedArray, d => d[1].stats[statType.statKey]);
        } else {
            index = d3.minIndex(dataCleanedArray, d => d[1].stats[statType.statKey]);
            val = d3.min(dataCleanedArray, d => d[1].stats[statType.statKey]);
        };

        var median = d3.median(dataCleanedArray, d => d[1].stats[statType.statKey]);
        var row = dataCleanedArray[index];
        var statobj = {};
        var metro = row[0];
        statobj['value'] = val;
        statobj['median'] = median;
        statobj['qualifier'] = statType.statQualifier;
        statobj['metro'] = row[0];
        statobj['displayOrder'] = statType.displayOrder;
        statobj.displayName = statType.displayName;
        statobj.displayString = helperGetHighlightString(statType.statKey, statobj);
        dataCleaned.get(metro).highlightData = statobj;
    });
    return;


}

//get and set: orig data, comparison data, puma id to name map
var pumaIdMap;
var pumaNames = new Map();
async function createPumaIdMap() {
    await d3.csv('./data/2010pumanames.txt').then((arr) => {
        nypumas = arr.filter(d => d.STATEFP == '36');
        nypumas.forEach((d) => {
            var cleanpuma = d['PUMA NAME'].replace('--', ' • ');
            pumaNames.set(cleanpuma, parseInt(d.PUMA5CE))
            pumaIdMap.set(parseInt(d.PUMA5CE), cleanpuma)
        });
        return pumaIdMap;
    });
};

function getPumaNames() {
    return pumaNames;
}

function getPumaIdMap() {
    return pumaIdMap;
};
var comparisonData;

function createComparisonData() {
    var dataCleanedArray = Array.from(dataCleaned);
    var statTypes = ['personsPerRoomMean', 'incomeMedian', 'rentMedian', 'personsMean'];
    statobj = {};
    statTypes.forEach(s => {
        var statvals = {
            min: d3.min(dataCleanedArray, d => d[1].stats[s]),
            median: d3.median(dataCleanedArray, d => d[1].stats[s]),
            max: d3.max(dataCleanedArray, d => d[1].stats[s])
        };
        statobj[s] = statvals;

    });
    comparisonData = statobj;
};

function getComparisonData() {
    return comparisonData;
}

function getOrigData() {
    return {
        map: dataCleaned,
        array: Array.from(dataCleaned)
    }
}


//helpers for parsing data
function helperGetBorough(pumaid) {
    var sel = getPumaIdMap().get(parseInt(pumaid));
    var boroughStart = sel.indexOf('-')
    var boroughEnd = sel.indexOf(' ');
    var borough = sel.substring(boroughStart, boroughEnd).replace('-', '');
    return borough.toLowerCase();
}

function helperGetHighlightString(statKey, statData) {

    var highlightString = '';
    var neighborhood = longPumaNameById(statData.metro);
    var qualifier = (statData.qualifier == 'min') ? "lowest" : "highest";
    var value = statData.value;
    var median = statData.median;
    if (statKey == 'rentMedian') {
        highlightString = `Residents of <strong>${neighborhood}</strong> pay the ${qualifier} in rent: $${value} as compared to a median of $${median}.`;
    } else if (statKey == 'incomeMedian') {
        highlightString = `<strong>${neighborhood}</strong> has the ${qualifier} average income: $${value} as compared to a median of $${median}.`;
    } else if (statKey == 'personsPerRoomMean') {
        var qualifier = (statData.qualifier == 'min') ? "least" : "most";
        highlightString = `<strong>${neighborhood}</strong> is the ${qualifier} crowded neighorhood, with ${value} occupants per room (as compared to a median of ${median}).`;
    }
    return highlightString;
}