       // var distinct = d3.groups(pcd, d => d.geo+'-'+d.personsNum+'-'+d.personsAdultElder+'-'+d.personsChild+'-'+d.personsPartnered+'-'+d.personsAdultOther+'-'+d.houseBed+'-'+d.houseRoom+'-'+d.amenityInternet+'-'+d.amenityHeat);

        // var distinct = d3.groups(pcd, d => d.geo+'-'+d.personsNum+'-'+d.personsAdultTotal+'-'+d.personsPartnered+'-'+d.houseBed+'-'+d.houseRoom);


                 //get some summary stats at geo level
            
                 totalIncome = d3.sum(geoDetail, d=> d.incomeAvg*d.weight);
                 totalWt =  d3.sum(geoDetail, d=> d.weight);
                 avgIncome = totalIncome/totalWt;
     
                 medianPersons = d3.median(geoDetail, d=> d.personsNum);
                 medianRooms = d3.median(geoDetail, d=> d.houseBed);
                 personsPerRoomMedian = medianPersons/medianRooms;