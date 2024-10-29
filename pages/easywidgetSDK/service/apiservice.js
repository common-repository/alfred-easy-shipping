const { fromEvent, EMPTY, forkJoin } = rxjs;
const { fromFetch } = rxjs.fetch;
const { ajax } = rxjs.ajax;
const {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  switchMap,
  tap,
  delay,
} = rxjs.operators;

let completeResultArray = [];
function getResponse(url, authUserObject) {
  
  const data$ = fromFetch(url + locationApiIta, {
    method: "post",
    body: JSON.stringify({apitoken:authUserObject.token}),
    // headers: {
    //   "Content-Type": "application/json",
    // },
  }).pipe(
    switchMap((response) => {
      console.log("RES2",response)
      if (response.ok) {
        // OK return data

        return response.json();
      } else {
        // Server is returning a status requiring the client to try something else.
        return of({ error: true, message: `Error ${response.status}` });
      }
    }),
    map((response) => {
      console.log(response)
      return response.items
    }),

    // map((response) => {
    //   return response.pagination;
    // }),
    mergeMap((locationObject) => locationObject),
    filter((locationObject) => {
     
      let lat = locationObject.latitude;
      let long = locationObject.longitude;

      //filtered out locations that have empty/missing values for lat/long

      if (
        lat % 1 != 0 &&
        long % 1 != 0 &&
        lat !== null &&
        long !== null &&
        !isNaN(lat) &&
        !isNaN(long)
      ) {
        
        let coordinates = ol.proj.fromLonLat([long, lat]);
       

        if (!isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
          //console.log(locationObject)
          return locationObject;
        }
      }
    }),
    filter((locationObject) => {
      if (locationObject.pointCity !== null) {
        return locationObject;
      }
    }),
    filter((locationObject) => {
      if (locationObject.pointAddress !== null) {
        return locationObject;
      }
    }),
    filter((locationObject) => {
      locationObject.locationType = "ALFRED_POINT"
      if (locationObject.locationType !== "THIRD_PARTY_LOCKER") {
        return locationObject;
      }
    }),
    filter((locationObject) => {
      //filter according to _filterCriteria
      if (_filterCriteria !== null) {
        let matchFound;
        for (var prop in _filterCriteria) {
          if (Object.prototype.hasOwnProperty.call(locationObject, prop)) {
            //check if locationObject has property defined in filterCriteria
            matchFound = false;
            for (var i = 0; i < _filterCriteria[prop].length; i++) {
              //check if locationObject[prop] is an array
              if (Array.isArray(locationObject[prop])) {
                console.log("is array");

                for (var j = 0; j < locationObject[prop].length; j++) {
                  if (locationObject[prop][j] === _filterCriteria[prop][i]) {
                    matchFound = true;
                  }
                }
              } else {
                if (locationObject[prop] === _filterCriteria[prop][i]) {
                  matchFound = true;
                }
              }
            }
          } else {
            console.log("spelling mistake in filter");
          }
        }
        if (matchFound) return locationObject;
      } else {

        return locationObject;
      }
    }),
    
    catchError((err) => {
      // Network or other error, handle appropriately
      //console.error(err);
      return of({ error: true, message: err.message });
    }),
    filter((locationObject) => {
      if (_locale === "en") {
        typeFilterData.push("All Locker Types");
      } else if (_locale === "zh") {
        typeFilterData.push("全部地點類型");
      }
      else if (_locale === "it") {
        typeFilterData.push("All Locker Types");
      }
      //typeFilterData.push("ALL LOCKER TYPES")

      let locationtype = capitaliseString("alfred_point");

      typeFilterData.push(locationtype);
      if (_locale === "en") {
        //districtfilterdata
        districtFilterData.push("All Districts");
      } else if (_locale === "zh") {
        districtFilterData.push("全部地區");
      }
      else if (_locale === "it") {
        districtFilterData.push("Tutte le città");
      }

      districtFilterData.push(locationObject.pointCity);
      //NEW CODE
      if (_locale === "en") {
        regionFilterData.push("All Regions");
      } else if (_locale === "zh") {
        regionFilterData.push("全部區域");
      }
      else if (_locale === "it") {
        regionFilterData.push("Tutte le province");
      }
      regionFilterData.push(locationObject.province);

      if (_locale === "en") {
        areaFilterData.push("All Areas");
      } else if (_locale === "zh") {
        areaFilterData.push("全部範圍");
      }
      else if (_locale === "it") {
        areaFilterData.push("Tutte le regioni");
      }
      areaFilterData.push(locationObject.district);
      //NEW CODE

      return locationObject;
    }),
    filter((locationObject) => {
      completeResultArray = Array.from(new Set(completeResultArray));
      completeResultArray.push(locationObject);
      return locationObject;
    }),
  );
  console.log(data$)
  return data$;
}

function capitaliseString(str) {
  var res = str.split("_");
  var first = res[0][0].toUpperCase() + res[0].slice(1).toLowerCase();
  var last = res[1][0].toUpperCase() + res[1].slice(1).toLowerCase();

  return first + " " + last;
}
