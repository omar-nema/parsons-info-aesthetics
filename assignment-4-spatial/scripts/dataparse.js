
var dataCleaned = new Map();

document.addEventListener("DOMContentLoaded", function() {

    var url = 'https://api.census.gov/data/2019/acs/acs1/pums?get=WGTP,PWGTP,HINCP,GRNTP,RNTP,NRC,TEL,HFL,HHT2,ADJINC,ADJHSG,BATH,HHT,ACCESS,KIT,R65&NOC=00&NOC=1:19&NP=01&NP=2:20&RMSP=1:99&BDSP=0:99&ucgid=7950000US3604110'

    d3.csv(url).then((arr) => {
        return arr.map((d) => {
            var internet = 0;
            var partner = 0;
            var kitchen = 0;
            var fuel = 0;
            var phone = 0;
            if (d.ACCESS > 0){
                internet = 1;
            }
            if (parseInt(d.HHT2) > 0 && parseInt(d.HHT2) < 5 ){
                partner = 1;
            }
            var houseWt = d['[["WGTP"'].replace('[', '').replace('"', ''); 
            //var houseWt = d['[["PWGTP"'].replace('[', '').replace('"', ''); 
    

            if (d.NOC == -1){
                d.NOC = 0;
            }
            if (d.NRC == -1){
                d.NRC = 0;
            }
            if (parseInt(d.HFL) !== 9){
                fuel = 1;
            }

            var numAdultsOther = parseInt(d.NP) - parseInt(d.NOC) - parseInt(d.R65);

            //telephone, fuel
           if ( parseInt(d.NP) !== 0 && parseInt(d.BDSP) !== -1 ){
            return {
                geo: d.PUMA,
                weight: parseInt(houseWt),
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
                rent: parseInt(d.RNTP),
                income: parseInt(d.ADJINC)*parseInt(d.HINCP)
            }
           }
      
        }); 
    }).then((pcd) => {
        
        //aggregate data
        var distinct = d3.groups(pcd, d => d.geo, d=> d.personsNum+'-'+d.personsAdultTotal+'-'+d.houseBed+'-'+d.houseRoom);        
        //for each geo, aggregate income and other stats based on distinct housing type
        distinct.forEach((geosplit) => {

            //calculate median values
            var incomes = [];
            var bedrooms = [];
            var persons = [];
            var children = [];
            var rent = [];
            geosplit[1].forEach((geoCluster)=>{
                geoCluster[1].forEach((rowVal)=>{
                    for (i=0; i<rowVal.weight; i++){
                        incomes.push(rowVal.income);
                        bedrooms.push(rowVal.houseBed);
                        persons.push(rowVal.personsNum);
                        children.push(rowVal.personsChild);
                        if (rowVal.rent > 0){
                            rent.push(rowVal.rent)
                        }
                    }
                })
            });
            var incomeMedian = d3.median(incomes);
            var bedroomMedian  = d3.median(bedrooms);
            var bedroomMean  = d3.mean(bedrooms);
            var personsMedian  = d3.median(persons);
            var personsMean  = d3.mean(persons);
            var childrenMedian  = d3.median(children);
            var childrenMean  = d3.mean(children);
            var rentMedian = d3.median(rent);
            //stats at PUMA level
            var summaryStats = {
                incomeMedian: incomeMedian,
                rentMedian: rentMedian,
                bedroomMedian: bedroomMedian,
                bedroomMean: bedroomMean,
                personsMedian: personsMedian,
                personsMean: personsMean,
                childrenMedian: childrenMedian,
                childrenMean: childrenMean,
                personsPerRoom: personsMedian/bedroomMedian
            }

            //detailed data at housing combo level
            var geoDetail = geosplit[1].map((grped)=> {
                var weightTotal = d3.sum(grped[1], d => d.weight);
                detailIncome = [];
                detailRent = [];
                grped[1].forEach((rowVal)=>{
                    for (i=0; i<rowVal.weight; i++){
                        detailIncome.push(rowVal.income);
                        if (rowVal.rent > 0){
                            detailRent.push(rowVal.rent)
                        }
                    }
                })
                detailIncomeMedian = d3.median(detailIncome);
                detailRentMedian = d3.median(detailRent);
                d = grped[1][0];
                return {
                    weight: weightTotal,
                    geo: d.geo,
                    personsNum: d.personsNum,
                    personsAdultElder: d.personsAdultElder,
                    personsChild: d.personsChild,
                    personsPartnered: d.personsPartnered,
                    personsAdultOther: d.personsAdultOther,
                    houseBed: d.houseBed,
                    houseRoom: d.houseRoom,
                    amenityInternet: d.amenityInternet,
                    amenityHeat: d.amenityHeat,
                    statsIncome: detailIncomeMedian,
                    statsRent: detailRentMedian
                }
             
            }); 
   
            //create new clean data object
            geoDetail = d3.sort(geoDetail, (a,b)=> b.weight - a.weight); //sort by weight desc    
            geoKey = geosplit[0]
            var detailObj = {
                detail: geoDetail,
                stats: summaryStats
            }
            dataCleaned.set(geoKey, detailObj)
      
        });
 
        initSketch();
    })
    
});

function getOrigData(){
    return dataCleaned;
}


//later: add language, fuel, heat