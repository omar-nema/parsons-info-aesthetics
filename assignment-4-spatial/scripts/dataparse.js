
var dataProcessed;

document.addEventListener("DOMContentLoaded", function() {

    var url = 'https://api.census.gov/data/2019/acs/acs1/pums?get=WGTP,NRC,TEL,HFL,HHT2,BATH,HHT,ACCESS,KIT,R65,R18,FES&NOC=00&NOC=1:19&NP=01&NP=2:20&RMSP=1:99&BDSP=0:99&ucgid=7950000US3604110';

    d3.csv(url).then((arr) => {
        return arr.map((d) => {
            var internet = 0;
            var partner = 0;
            var kitchen = 0;
            if (d.ACCESS > 0){
                internet = 1;
            }
            if (parseInt(d.HHT2) > 0 && parseInt(d.HHT2) < 5 ){
                partner = 1;
            }
            var houseWt = d['[["WGTP"'].replace('[', '').replace('"', ''); 
            if (d.NOC == -1){
                d.NOC = 0;
            }
            if (d.NRC == -1){
                d.NRC = 0;
            }
            var numAdultsOther = parseInt(d.NP) - parseInt(d.NOC) -  parseInt(d.NRC) - parseInt(d.R65);

            //telephone, fuel
           if ( parseInt(d.NP) !== 0 && parseInt(d.BDSP) !== -1){
            return {
                geo: d.PUMA,
                weight: parseInt(houseWt),
                personsNum: +d.NP,
                personsAdultElder: +d.R65,
                personsChild: parseInt(d.NOC) + parseInt(d.NRC),
                personsPartnered: partner,
                personsAdultOther: numAdultsOther,
                houseBed: +d.BDSP,
                amenInternet: +d.ACCESS
            }
           }
      
        });
    }).then((pcd) => {
        //aggregate data
        var distinct = d3.groups(pcd, d => d.geo+'-'+d.personsNum+'-'+d.personsAdultElder+'-'+d.personsChild+'-'+d.personsPartnered+'-'+d.personsAdultOther+'-'+d.houseBed+'-'+d.amenInternet);

        var aggregated = distinct.map((grped)=> {

            weightTotal = d3.sum(grped[1], d => d.weight);
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
                amenInternet: d.amenInternet
            }
         
        });
        aggregated = d3.sort(aggregated, (a,b)=> b.weight - a.weight)
        var totalWeight = d3.sum(aggregated, d=> d.weight);
        aggregated.forEach((d) => {d.pctTotal = d.weight/totalWeight});
        dataProcessed = aggregated;
        initSketch();
    })
    
});

function getOrigData(){
    return dataProcessed;
}