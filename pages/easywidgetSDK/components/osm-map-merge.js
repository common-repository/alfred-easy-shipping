const {
  Observable,
  from,
  defer,
  BehaviourSubject,
  pluck,
  of,
  range,
  merge,
  Subject,
} = rxjs;
const {
  flatMap,
  flatMapLatest,
  toArray,
  finalize,
  takeLast,
  findIndex,
  takeUntil,
  defaultIfEmpty,
} = rxjs.operators;
//import Layer from 'ol/layer/Layer';
const Layer = ol.layer.Layers;
const { Source } = ol.source;

var submitPress = false;
var lockerLocations = [];
let typeFilterData = [],
  districtFilterData = [],
  regionFilterData = [],
  areaFilterData = [];
let reactiveFilterData,
  reactiveDistrictData,
  reactiveRegionData,
  reactiveAreaData;
let filtDis = [];

let filteredRegionName = "";
let filteredDistrictName = "";
let filteredDistrict = [];
let filteredArea = [];
let dropDownSelectedItemContainer;
let locDataObservable = getResponse(baseURL, _userAuthObject);

let multiFilterObject = {};

let styleRed = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [0.5, 46],
    anchorXUnits: "fraction",
    anchorYUnits: "pixels",
    //src: 'https://alfred-geowidget.s3-ap-southeast-1.amazonaws.com/images/location_point.png'
    src: word_press_path + "pages/easywidgetSDK/images/location_point_red.png",
  }),
});

let styleOriginal = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [0.5, 46],
    anchorXUnits: "fraction",
    anchorYUnits: "pixels",
    //src: 'https://alfred-geowidget.s3-ap-southeast-1.amazonaws.com/images/location_point.png'
    src: word_press_path + "pages/easywidgetSDK/images/location_point.png",
  }),
});

//NEW CODE
var numberOfFilteredItems = [];

let dropDownElement;
let dropDownElementList = [];
let clickedIndex = 0;
let selectedLocationNameId;

let callBackObject = {};

let popup = new ol.Overlay.Popup();

//check if need to add dropDown

if (_mode === "dropdown") {
  // create custom dropdown component
  dropDownElement = document.createElement("div");
  dropDownElement.className = "customDropDown";
  let customDropDownSelect = document.createElement("div");
  Object.assign(customDropDownSelect, {
    className: "customDropDownSelect",
    onclick: (e) => {
      // onClick function: toggle dropdown open
      document
        .getElementsByClassName("customDropDownContainer")[0]
        .classList.toggle("customDropDownOpen");
    },
  });

  // dropdown placeholder
  let customDropDownSelectText = document.createElement("p");
  if (_locale === "en") {
    Object.assign(customDropDownSelectText, {
      className: "customDropDownSelectText",
      innerHTML: "Alfred Click & Collect Options",
    });
  } else if (_locale === "zh") {
    Object.assign(customDropDownSelectText, {
      className: "customDropDownSelectText",
      innerHTML: "Alfred智能櫃地點",
    });
  }
  else if (_locale === "it") {
    Object.assign(customDropDownSelectText, {
      className: "customDropDownSelectText",
      innerHTML: "Alfred Easy Shipping",
    });
  }

  customDropDownSelect.appendChild(customDropDownSelectText);
  dropDownElement.appendChild(customDropDownSelect);

  // Function on window click, click anywhere on window and close the dropdown
  window.onclick = function (e) {
    let box = document.getElementsByClassName("customDropDownContainer")[0];
    let selectBox = document.getElementsByClassName("customDropDownSelect")[0];
    let selectText = document.getElementsByClassName(
      "customDropDownSelectText"
    )[0];

    if (e.target != selectBox && e.target != selectText) {
      if (Object.values(box.classList).indexOf("customDropDownOpen") > -1) {
        box.classList.remove("customDropDownOpen");
      }
    }
  };
}

function isEmptyObject(obj) {
  return !!obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}
const closeModalSelection = () => {
  console.log(callBackObject);
  console.log("submit pressed");
  if (!isEmptyObject(callBackObject)) {
    //

    /*jQuery.ajax({
      url: document.URL,
      type: "POST",
      processData: true,
      data: {
        shippingAddress1: arg.address1En,
        shippingAddress2: arg.address2En,
        locationId: arg.locationId,
        region: arg.province,
        country: arg.country,
        locationType: arg.locationType,
      },
      success: function (data) {
        console.log("hello how this");

        location.reload();
      },
    });

    submitPress = true;
    console.log("inside close modal selection");*/

    delete multiFilterObject["province"];
    delete multiFilterObject["city"];
    delete multiFilterObject["district"];

    const modal = document.getElementById("modal");
    modal.classList.remove("showModal");
    location.reload();
  }
};

console.log("inside map merge mode is ", _mode);
// Create modal unique elements
if (_mode === "modal") {
  var modal = document.getElementById("modal");
  const closeModal = () => {
    delete multiFilterObject["province"];
    delete multiFilterObject["city"];
    delete multiFilterObject["district"];

    // console.log("multiFilterObject after close  ", multiFilterObject);
    const modal = document.getElementById("modal");
    modal.classList.remove("showModal");
    var radioBtns = document.querySelectorAll('input[type="radio"]');

    radioBtns.forEach((item) => {
      item.style.display = null;
      console.log(item.style);
    });

    location.reload();
  };

  const openModal = () => {
    const modal = document.getElementById("modal");
    modal.classList.add("showModal");
  };

  //var modalOpenBtn = document.getElementById("modalOpenBtn");
  //modalOpenBtn.addEventListener("click", openModal);

  // create top bar elements
  var topBar = document.createElement("div");
  topBar.className = "modalTopBar";

  let closeBtn = document.createElement("span");
  Object.assign(closeBtn, {
    className: "modalCloseBtn",
    onclick: closeModal,
    innerHTML: "✕",
  });

  var modalTitle = document.createElement("span");
  if (_locale === "en") {
    modalTitle.innerHTML = "Shipping method";
  } else if (_locale === "zh") {
    modalTitle.innerHTML = "郵寄方式";
  }
  else if (_locale === "it") {
    modalTitle.innerHTML = "Spese di spedizione";
  }

  topBar.appendChild(modalTitle);
  topBar.appendChild(closeBtn);

  modal.insertBefore(topBar, modal.firstChild);
  // create top bar elements End

  // create confirm button
  var modalConfirmBtnWrapper = document.createElement("div");
  modalConfirmBtnWrapper.className = "modalConfirmBtnWrapper";
  var modalConfirmBtn = document.createElement("button");

  if (_locale === "en") {
    Object.assign(modalConfirmBtn, {
      className: "modalConfirmBtn",
      innerHTML: "Confirm",
      onclick: closeModalSelection,
      //onclick: confirm
      /*onclick: () => {
        console.log("confirm en");
      },*/
    });
  } else if (_locale === "zh") {
    Object.assign(modalConfirmBtn, {
      className: "modalConfirmBtn",
      innerHTML: "確定",
      onclick: closeModalSelection,
      /*onclick: () => {
        console.log("confirm dd");
      },*/
    });
  }
  else if (_locale === "it") {
    Object.assign(modalConfirmBtn, {
      className: "modalConfirmBtn",
      innerHTML: "Conferma",
      onclick: closeModalSelection,
      /*onclick: () => {
        console.log("confirm dd");
      },*/
    });
  }

  modalConfirmBtnWrapper.appendChild(modalConfirmBtn);
  modal.appendChild(modalConfirmBtnWrapper);
}
// Create modal unique element End

// create top level container HTML
let containerDiv = document.createElement("div");
containerDiv.className = "containerDiv";
let containerMapBox = document.getElementById("mapBox");
if (_mode === "dropdown") {
  containerMapBox.style = "width: 100%";
}
containerDiv.appendChild(containerMapBox);

//Added from the onset so map can be displayed
if (_mode === "modal") {
  document.getElementById("mapWrapper").appendChild(containerDiv);
} else {
  document.body.appendChild(containerDiv);
}

// create left side dropdown and list
let leftWrapper = document.createElement("div");
leftWrapper.className = "mapLeftWrapper";
let filtersWrapper = document.createElement("div");
filtersWrapper.className = "mapFiltersWrapper";

let typeFilter = document.createElement("SELECT");
typeFilter.className = "typeFilter mapFilter";

let districtFilter = document.createElement("SELECT");
districtFilter.className = "districtFilter mapFilter";

let regionFilter = document.createElement("SELECT");
regionFilter.className = "regionFilter mapFilter";

let areaFilter = document.createElement("SELECT");
areaFilter.className = "areaFilter mapFilter";

// Create section wrapper:
// If dropdown, create top filters bar / If not dropdown, create left radio button list
if (_mode === "dropdown") {
  document.getElementById("mapBarWrapper").appendChild(filtersWrapper);

  //create div to show selected item details from the list
  dropDownSelectedItemContainer = document.createElement("div");
  dropDownSelectedItemContainer.className = "dropDownSelectedItemContainer";
  containerDiv.appendChild(dropDownSelectedItemContainer);
} else {
  leftWrapper.appendChild(filtersWrapper);
}

let containerParentDiv = document.createElement("div");
containerParentDiv.className = "containerParentTextDiv";

let searchBar;
// Create search bar
if (_withSearchBar) {
  searchBar = document.getElementById("searchBar");
}

let mapView;
if (_defaultLocation === "HK") {
  mapView = new ol.View({
    center: ol.proj.fromLonLat([114.177216, 22.302711]),
    zoom: 12,
  });
} else if (_defaultLocation === "AU") {
  mapView = new ol.View({
    center: ol.proj.fromLonLat([133.7751, 25.2744]),
    zoom: 12,
  });
}
else if (_defaultLocation === "IT") {
  mapView = new ol.View({
    center: ol.proj.fromLonLat([12.56738, 41.87194]),
    zoom: 5,
  });
}

/*var vectorSource = new VectorSource({
    url: 'publish/components/osm_liberty.json'
  });*/

function capitaliseString(str) {
  if (str.includes("_")) {
    var res = str.split("_");

    var first = res[0][0].toUpperCase() + res[0].slice(1).toLowerCase();
    var last = res[1][0].toUpperCase() + res[1].slice(1).toLowerCase();

    return first + " " + last;
  } else {
    return str;
  }
}

var vectorLayer = new ol.layer.Vector({
  //source: 'https://alfred-geowidget.s3-ap-southeast-1.amazonaws.com/easywidgetSDK/components/osm_liberty.json?key=PXShsbUVPsSjgNaNzdkp',

  source: new ol.source.Vector(),
  style: new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 46],
      anchorXUnits: "fraction",
      anchorYUnits: "pixels",
      //src: 'https://alfred-geowidget.s3-ap-southeast-1.amazonaws.com/images/location_point.png'
      src: word_press_path + "pages/easywidgetSDK/images/location_point.png",
    }),
  }),
});

vectorLayer.setZIndex(1001);

var vectorLayerSelected = new ol.layer.Vector({
  source: new ol.source.Vector(),

  style: new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 46],
      anchorXUnits: "fraction",
      anchorYUnits: "pixels",
      //src: 'https://alfred-geowidget.s3-ap-southeast-1.amazonaws.com/images/location_point.png'
      src:
        word_press_path + "pages/easywidgetSDK/images/location_point_red.png",
    }),
  }),
});
vectorLayerSelected.setZIndex(1001);

var mapBox = showMap();

locDataObservable.subscribe({
  next: (result) => {

    let lat = result.latitude;
    let long = result.longitude;
    let coordinates = ol.proj.fromLonLat([long, lat]);

    numberOfFilteredItems.push(result);
    lockerLocations.push(

      new ol.Feature({
        type: "click",
        address1: result.address1,
        address1En: result.address1En,
        address2: result.address2,
        address2En: result.address2En,
        city: result.city,
        companyId: result.companyId,
        companyName: result.companyName,
        country: result.country,
        description: result.description,
        district: result.district,
        province: result.province,
        latitude: lat,
        longitude: long,
        locationEn: result.locationEn,
        locationGroup: result.locationGroup,
        locationId: result.locationId,
        locationName: result.locationName,
        locationType: capitaliseString(result.locationType),
        services: result.services,
        operatingTime: result.displayHours,
        operatingTimeCN: result.displayHoursCN,
        //operatingTime: result.operatingTime,
        postalCode: result.postalCode,
        availableCompartments: result.availableCompartments,
        geometry: new ol.geom.Point(coordinates),
      })
    );

    //console.log("before complete vectorlayer", vectorLayer)
    //Important: check answer here: https://stackoverflow.com/questions/56145477/how-to-delete-markers-from-osm
    vectorLayer.getSource().addFeature(
      new ol.Feature({
        type: "click",
        address1: result.address1,
        address1En: result.address1En,
        address2: result.address2,
        address2En: result.address2En,
        city: result.city,
        companyId: result.companyId,
        companyName: result.companyName,
        country: result.country,
        description: result.description,
        district: result.district,
        province: result.province,
        latitude: lat,
        longitude: long,
        locationEn: result.locationEn,
        locationGroup: result.locationGroup,
        locationId: result.locationId,
        locationName: result.locationName,
        locationType: capitaliseString(result.locationType),
        services: result.services,
        //operatingTime: result.operatingTime,
        operatingTime: result.displayHours,
        operatingTimeCN: result.displayHoursCN,
        postalCode: result.postalCode,
        availableCompartments: result.availableCompartments,
        geometry: new ol.geom.Point(coordinates),
      })
    );

    var containerTextDiv = document.createElement("div");
    containerTextDiv.className = "containerChildTextDiv";

    // var locationContainer = document.createElement("div");
    // locationContainer.className = result.locationId
    var locationContainer = document.createElement("INPUT");
    Object.assign(locationContainer, {
      type: "radio",
      name: "list",
      id: result.locationId,
      className: "mapRadioBtn",
    });

    var locationContentDiv = document.createElement("label");
    Object.assign(locationContentDiv, {
      htmlFor: result.locationId,
      className: "label",
    });

    var logo = document.createElement("img");
    Object.assign(logo, {
      src: word_press_path + "pages/easywidgetSDK/images/alfred-logo.png",
      //src: "https://alfred.delivery//////wp-content/uploads/2018/10/Alfred-logo_gradient_Small.png",
      className: "alfred-logo",
    });
    locationContentDiv.appendChild(logo);

    var locationContentText = document.createElement("div");

    if (result.locationName || result.locationId) {
      var locationName = document.createElement("P"); // Create a <p> element
      locationName.setAttribute("class", "locationName");
      if (_locale === "en") {
        locationName.innerHTML =
          result.locationId + " - " + (result?.locationEn ?? ""); // Insert text
      } else if (_locale === "zh") {
        locationName.innerHTML =
          result.locationId + " - " + (result?.locationName ?? ""); // Insert text
      }
      else if (_locale === "it") {
        locationName.innerHTML =
          result.locationId + " - " + (result?.locationName ?? ""); // Insert text
      }
      locationContentText.appendChild(locationName);
    }

    /*if (result.operatingTime) {
                var operatingTime = document.createElement("P");
                operatingTime.setAttribute("class", "operatingTime")
                operatingTime.innerHTML = result.operatingTime; 
                locationContentText.appendChild(operatingTime);
            }*/

    if (result.displayHours) {
      var operatingTime = document.createElement("P");
      operatingTime.setAttribute("class", "operatingTime");

      if (_locale === "en") {
        operatingTime.innerHTML = result.displayHours;
      } else if (_locale === "zh") {
        operatingTime.innerHTML = result.displayHoursCN;
      }
      else if (_locale === "it") {
        operatingTime.innerHTML = result.displayHours;
      }

      locationContentText.appendChild(operatingTime);
    }

    var address = document.createElement("P");
    if (_locale === "en") {
      address.innerHTML = result.address1En;
    } else if (_locale === "zh") {
      address.innerHTML = result.address1;
    }
    else if (_locale === "it") {
      address.innerHTML = result.address1En;
    }
    address.setAttribute("class", "contentAddress");
    locationContentText.appendChild(address);

    var locationType = document.createElement("P");
    if (result.locationType) {
      Object.assign(locationType, {
        innerHTML: capitaliseString(result.locationType),
        className: "contentLocationType",
      });
    }
    locationContentText.appendChild(locationType);

    var city = document.createElement("P");
    if (result.locationType) {
      Object.assign(city, {
        innerHTML:
          capitaliseString(result.locationType) + " | " + (result?.city ?? ""),
        className: "contentCity",
      });
    } else {
      Object.assign(city, {
        innerHTML: result?.city ?? "",
        className: "contentCity",
      });
    }
    locationContentText.appendChild(city);

    var coords = document.createElement("P");
    coords.setAttribute("hidden", true);
    coords.className = "coords";
    coords.innerHTML = long + "-" + lat;
    locationContentText.appendChild(coords);

    var howToGetThere = document.createElement("a");
    if (_locale === "en") {
      Object.assign(howToGetThere, {
        href: "#",
        className: "howToGetThere",
        id: "howToGetThere",
        style: "display: none",

        innerHTML: "How to get there",
      });
    } else if (_locale === "zh") {
      Object.assign(howToGetThere, {
        href: "#",
        className: "howToGetThere",
        id: "howToGetThere",
        style: "display: none",
        innerHTML: "如何找到智能櫃？",
      });
    }
    else if (_locale === "it") {
      Object.assign(howToGetThere, {
        href: "#",
        className: "howToGetThere",
        id: "howToGetThere",
        style: "display: none",
        innerHTML: "Come arrivare？",
      });
    }
    var browseIcon = document.createElement("img");
    browseIcon.style.width = "18px";
    browseIcon.setAttribute(
      "src",
      word_press_path + "pages/easywidgetSDK/images/browse-icon-transparent.png"
    );
    howToGetThere.appendChild(browseIcon);

    //document.getElementById("howToGetThere").innerHTML.style.display = "none";
    locationContentText.appendChild(howToGetThere);
    //console.log( document.getElementById('howToGetThere'))//setAttribute("hidden",true)

    locationContentDiv.appendChild(locationContentText);

    containerTextDiv.appendChild(locationContainer);
    containerTextDiv.appendChild(locationContentDiv);
    containerParentDiv.appendChild(containerTextDiv);
    if (_mode !== "dropdown") {
      leftWrapper.appendChild(containerParentDiv);
      containerDiv.appendChild(leftWrapper);
    }

    containerDiv.appendChild(containerMapBox);

    //add to dropdownlist
    if (_mode === "dropdown") {
      var sb = new StringBuilder();
      sb.append(result.locationId || "empty");
      sb.append(" - ");
      if (_locale === "en") {
        sb.append(result.locationEn);
      } else if (_locale === "zh") {
        sb.append(result.locationName);
      }
      else if (_locale === "it") {
        sb.append(result.locationName);
      }
      var myString = sb.toString();

      let customDropDownItem = document.createElement("div");
      customDropDownItem.className = "customDropDownItem";
      customDropDownItem.id = result.locationId;
      let customDropDownItemLocationName = document.createElement("p");
      let customDropDownItemLocationTypeCity = document.createElement("p");
      let customDropDownItemCoords = document.createElement("p");

      Object.assign(customDropDownItemLocationName, {
        className: "customDropDownItemLocationName",
        innerHTML: myString,
      });

      Object.assign(customDropDownItemLocationTypeCity, {
        className: "customDropDownItemLocationTypeCity",
        innerHTML: capitaliseString(result.locationType) + "  " + result.city,
      });

      Object.assign(customDropDownItemCoords, {
        hidden: true,
        className: "customDropDownItemCoords",
        innerHTML: long + "-" + lat,
      });

      //    customDropDownItem.appendChild(customDropdownRadioHidden);
      customDropDownItem.appendChild(customDropDownItemLocationName);
      customDropDownItem.appendChild(customDropDownItemLocationTypeCity);
      customDropDownItem.appendChild(customDropDownItemCoords);

      dropDownElementList.push(customDropDownItem);
    }
  },
  complete: () => {
    if (_mode === "dropdown") {
      let customDropDownContainer = document.createElement("div");
      customDropDownContainer.className = "customDropDownContainer";

      let customDropDownBox = document.createElement("div");
      customDropDownBox.className = "customDropDownBox";

      for (var i = 0; i < dropDownElementList.length; i++) {
        customDropDownBox.appendChild(dropDownElementList[i]);
      }
      customDropDownContainer.appendChild(customDropDownBox);
      dropDownElement.appendChild(customDropDownContainer);
      document.getElementById("mapBarWrapper").appendChild(dropDownElement);
      document.getElementById("mapBox").style.display = "none";

      //dropDownSelectedItemContainer

      assignOnClickToDropDownItems();
    }
    if (_mode === "modal") {
      document.getElementById("mapWrapper").appendChild(containerDiv);
    } else {
      document.body.appendChild(containerDiv);
    }

    typeFilterData = Array.from(new Set(typeFilterData));
    if (typeFilterData.includes("HKPost Locker")) {
      moveItem(
        typeFilterData.indexOf("HKPost Locker"),
        typeFilterData.length - 1,
        typeFilterData
      );
    }
    if (typeFilterData.includes("4PX Locker")) {
      moveItem(
        typeFilterData.indexOf("4PX Locker"),
        typeFilterData.length - 2,
        typeFilterData
      );
    }
    if (typeFilterData.includes("4PX Pickup Point")) {
      moveItem(
        typeFilterData.indexOf("4PX Pickup Point"),
        typeFilterData.length - 3,
        typeFilterData
      );
    }
    if (typeFilterData.includes("7 Eleven")) {
      moveItem(
        typeFilterData.indexOf("7 Eleven"),
        typeFilterData.length - 4,
        typeFilterData
      );
    }
    if (typeFilterData.includes("Alfred Point")) {
      moveItem(
        typeFilterData.indexOf("Alfred Point"),
        typeFilterData.length - 5,
        typeFilterData
      );
    }
    if (typeFilterData.includes("Alfred Locker")) {
      moveItem(
        typeFilterData.indexOf("Alfred Locker"),
        typeFilterData.length - 6,
        typeFilterData
      );
    }

    /*
       sort based on following:
             Naming and Ordering should be:
              Alfred Locker
              Alfred Point
              7 Eleven
              4PX Pickup Point
              4PX Locker
              HKPost Locker

 
       */

    (districtFilterData = Array.from(new Set(districtFilterData))),
      (regionFilterData = Array.from(new Set(regionFilterData))),
      (areaFilterData = Array.from(new Set(areaFilterData))),
      (reactiveFilterData = from(typeFilterData).subscribe({
        next: (result) => {
          //console.log(result)
          let typeFilterItem = document.createElement("option");
          typeFilterItem.innerHTML = result;
          typeFilter.appendChild(typeFilterItem);
        },
        complete: () => {
          var dropDownSelectionEmpty = document.createElement("OPTION");
          Object.assign(dropDownSelectionEmpty, {
            disabled: true,
            selected: true,
          });
          if (_locale === "en") {
            dropDownSelectionEmpty.innerHTML = "Type";
          } else if (_locale === "zh") {
            dropDownSelectionEmpty.innerHTML = "智能櫃種類";
          }
          else if (_locale === "it") {
            dropDownSelectionEmpty.innerHTML = "Tipo";
          }
          typeFilter.insertBefore(
            dropDownSelectionEmpty,
            typeFilter.firstChild
          );
          //console.log("typeFilter is ",typeFilter)
          let typeFilterTitle = document.createElement("p");
          typeFilterTitle.innerHTML = "1. Select Locker Type";
          typeFilterTitle.className = "typeFilterTitle";
          typeFilterTitle.style.display = "none";
          filtersWrapper.appendChild(typeFilterTitle);
          filtersWrapper.appendChild(typeFilter);
        },
      }));

    reactiveRegionData = from(regionFilterData).subscribe({
      next: (result) => {
        let regionFilterItem = document.createElement("option");

        regionFilterItem.innerHTML = result;
        regionFilter.appendChild(regionFilterItem);
      },
      complete: () => {
        var dropDownSelectionEmpty = document.createElement("OPTION");
        Object.assign(dropDownSelectionEmpty, {
          disabled: true,
          selected: true,
        });
        if (_locale === "en") {
          dropDownSelectionEmpty.innerHTML = "Region";
        } else if (_locale === "zh") {
          dropDownSelectionEmpty.innerHTML = "區域";
        }
        else if (_locale === "it") {
          dropDownSelectionEmpty.innerHTML = "Regione";
        }

        console.log("HAHAH 789");
        console.log(regionFilter.firstChild);
        // if (regionFilter.firstChild.innerHTML === "All Regions") {
        //   regionFilter.insertBefore(
        //     dropDownSelectionEmpty,
        //     regionFilter.firstChild
        //   );
        // }

        let regionFilterTitle = document.createElement("p");
        if (_filterCriteria === null)
          regionFilterTitle.innerHTML = "2. Select Region";
        else {
          regionFilterTitle.innerHTML = "1. Select Region";
        }
        regionFilterTitle.className = "regionFilterTitle";
        filtersWrapper.appendChild(regionFilterTitle);
        filtersWrapper.appendChild(regionFilter);
      },
    });

    reactiveDistrictData = from(districtFilterData).subscribe({
      next: (result) => {
        let districtFilterItem = document.createElement("option");
        districtFilterItem.innerHTML = result;
        districtFilter.appendChild(districtFilterItem);
      },
      complete: () => {
        var dropDownSelectionEmpty = document.createElement("OPTION");
        Object.assign(dropDownSelectionEmpty, {
          disabled: true,
          selected: true,
        });
        if (_locale === "en") {
          dropDownSelectionEmpty.innerHTML = "District";
        } else if (_locale === "zh") {
          dropDownSelectionEmpty.innerHTML = "地區";
        }
        else if (_locale === "it") {
          dropDownSelectionEmpty.innerHTML = "Distretto";
        }

        if (districtFilter.firstChild.innerHTML === "All Districts") {
          districtFilter.insertBefore(
            dropDownSelectionEmpty,
            districtFilter.firstChild
          );
        }

        let districtFilterTitle = document.createElement("p");
        if (_filterCriteria === null)
          districtFilterTitle.innerHTML = "3. Select District";
        else districtFilterTitle.innerHTML = "2. Select District";
        districtFilterTitle.className = "districtFilterTitle";
        filtersWrapper.appendChild(districtFilterTitle);
        filtersWrapper.appendChild(districtFilter);
      },
    });

    reactiveAreaData = from(areaFilterData).subscribe({
      next: (result) => {
        let areaFilterItem = document.createElement("option");
        areaFilterItem.innerHTML = result;
        areaFilter.appendChild(areaFilterItem);
      },
      complete: () => {
        var dropDownSelectionEmpty = document.createElement("OPTION");
        Object.assign(dropDownSelectionEmpty, {
          disabled: true,
          selected: true,
        });
        if (_locale === "en") {
          dropDownSelectionEmpty.innerHTML = "Area";
        } else if (_locale === "zh") {
          dropDownSelectionEmpty.innerHTML = "範圍";
        }
        else if (_locale === "it") {
          dropDownSelectionEmpty.innerHTML = "範圍";
        }
        console.log("area filter 90 ", areaFilter.firstChild);
        if (areaFilter.firstChild.innerHTML === "All Areas") {
          areaFilter.insertBefore(
            dropDownSelectionEmpty,
            areaFilter.firstChild
          );
        }

        let areaFilterTitle = document.createElement("p");
        if (_filterCriteria === null) {
          areaFilterTitle.innerHTML = "4. Select Area";
        } else {
          areaFilterTitle.innerHTML = "3. Select Area";
        }

        areaFilterTitle.className = "areaFilterTitle";
        filtersWrapper.appendChild(areaFilterTitle);
        filtersWrapper.appendChild(areaFilter);
      },
    });

    if (_withSearchBar) {
      document.getElementsByClassName("mapFiltersWrapper")[0].style.display =
        "none";
    }
    document.getElementById("loader").style.display = "none";
    //vectorLayer.getSource().clear()

    //mapBox = showMap()

    if (_filterCriteria !== null) {
      console.log(_filterCriteria);
      document.getElementsByClassName("typeFilterTitle")[0].style.display =
        "none";
      document.getElementsByClassName("typeFilter mapFilter")[0].style.display =
        "none";
    }

    console.log("Tea cup storm");
    console.log("inside complete");
    mapOnclick();
  },
});

function refreshData() {
  //
  document.getElementsByClassName("mapFiltersWrapper")[0].innerHTML = "";
  document.getElementById("loader").style.display = "block";
  locDataObservable.subscribe({
    next: (result) => {
      let lat = result.latitude;
      let long = result.longitude;
      let coordinates = ol.proj.fromLonLat([long, lat]);

      numberOfFilteredItems.push(result);
      lockerLocations.push(
        new ol.Feature({
          type: "click",
          address1: result.address1,
          address1En: result.address1En,
          address2: result.address2,
          address2En: result.address2En,
          city: result.city,
          companyId: result.companyId,
          companyName: result.companyName,
          country: result.country,
          description: result.description,
          district: result.district,
          province: result.province,
          latitude: lat,
          longitude: long,
          locationEn: result.locationEn,
          locationGroup: result.locationGroup,
          locationId: result.locationId,
          locationName: result.locationName,
          locationType: capitaliseString(result.locationType),
          services: result.services,
          operatingTime: result.displayHours,
          operatingTimeCN: result.displayHoursCN,
          //operatingTime: result.operatingTime,
          postalCode: result.postalCode,
          availableCompartments: result.availableCompartments,
          geometry: new ol.geom.Point(coordinates),
        })
      );

      //console.log("before complete vectorlayer", vectorLayer)
      //Important: check answer here: https://stackoverflow.com/questions/56145477/how-to-delete-markers-from-osm
      vectorLayer.getSource().addFeature(
        new ol.Feature({
          type: "click",
          address1: result.address1,
          address1En: result.address1En,
          address2: result.address2,
          address2En: result.address2En,
          city: result.city,
          companyId: result.companyId,
          companyName: result.companyName,
          country: result.country,
          description: result.description,
          district: result.district,
          province: result.province,
          latitude: lat,
          longitude: long,
          locationEn: result.locationEn,
          locationGroup: result.locationGroup,
          locationId: result.locationId,
          locationName: result.locationName,
          locationType: capitaliseString(result.locationType),
          services: result.services,
          //operatingTime: result.operatingTime,
          operatingTime: result.displayHours,
          operatingTimeCN: result.displayHoursCN,
          postalCode: result.postalCode,
          availableCompartments: result.availableCompartments,
          geometry: new ol.geom.Point(coordinates),
        })
      );

      var containerTextDiv = document.createElement("div");
      containerTextDiv.className = "containerChildTextDiv";

      // var locationContainer = document.createElement("div");
      // locationContainer.className = result.locationId
      var locationContainer = document.createElement("INPUT");
      Object.assign(locationContainer, {
        type: "radio",
        name: "list",
        id: result.locationId,
        className: "mapRadioBtn",
      });

      var locationContentDiv = document.createElement("label");
      Object.assign(locationContentDiv, {
        htmlFor: result.locationId,
        className: "label",
      });

      var logo = document.createElement("img");
      Object.assign(logo, {
        src: word_press_path + "pages/easywidgetSDK/images/alfred-logo.png",
        //src: "https://alfred.delivery//////wp-content/uploads/2018/10/Alfred-logo_gradient_Small.png",
        className: "alfred-logo",
      });
      locationContentDiv.appendChild(logo);

      var locationContentText = document.createElement("div");

      if (result.locationName || result.locationId) {
        var locationName = document.createElement("P"); // Create a <p> element
        locationName.setAttribute("class", "locationName");
        if (_locale === "en") {
          locationName.innerHTML =
            result.locationId + " - " + (result?.locationEn ?? ""); // Insert text
        } else if (_locale === "zh") {
          locationName.innerHTML =
            result.locationId + " - " + (result?.locationName ?? ""); // Insert text
        }
        else if (_locale === "it") {
          locationName.innerHTML =
            result.locationId + " - " + (result?.locationName ?? ""); // Insert text
        }
        locationContentText.appendChild(locationName);
      }

      /*if (result.operatingTime) {
                var operatingTime = document.createElement("P");
                operatingTime.setAttribute("class", "operatingTime")
                operatingTime.innerHTML = result.operatingTime; 
                locationContentText.appendChild(operatingTime);
            }*/

      if (result.displayHours) {
        var operatingTime = document.createElement("P");
        operatingTime.setAttribute("class", "operatingTime");

        if (_locale === "en") {
          operatingTime.innerHTML = result.displayHours;
        } else if (_locale === "zh") {
          operatingTime.innerHTML = result.displayHoursCN;
        }
        else if (_locale === "it") {
          operatingTime.innerHTML = result.displayHoursCN;
        }

        locationContentText.appendChild(operatingTime);
      }

      var address = document.createElement("P");
      if (_locale === "en") {
        address.innerHTML = result.address1En;
      } else if (_locale === "zh") {
        address.innerHTML = result.address1;
      }
      else if (_locale === "it") {
        address.innerHTML = result.address1;
      }
      address.setAttribute("class", "contentAddress");
      locationContentText.appendChild(address);

      var locationType = document.createElement("P");
      if (result.locationType) {
        Object.assign(locationType, {
          innerHTML: capitaliseString(result.locationType),
          className: "contentLocationType",
        });
      }
      locationContentText.appendChild(locationType);

      var city = document.createElement("P");
      if (result.locationType) {
        Object.assign(city, {
          innerHTML:
            capitaliseString(result.locationType) +
            " | " +
            (result?.city ?? ""),
          className: "contentCity",
        });
      } else {
        Object.assign(city, {
          innerHTML: result?.city ?? "",
          className: "contentCity",
        });
      }
      locationContentText.appendChild(city);

      var coords = document.createElement("P");
      coords.setAttribute("hidden", true);
      coords.className = "coords";
      coords.innerHTML = long + "-" + lat;
      locationContentText.appendChild(coords);

      var howToGetThere = document.createElement("a");
      if (_locale === "en") {
        Object.assign(howToGetThere, {
          href: "#",
          className: "howToGetThere",
          id: "howToGetThere",
          style: "display: none",

          innerHTML: "How to get there",
        });
      } else if (_locale === "zh") {
        Object.assign(howToGetThere, {
          href: "#",
          className: "howToGetThere",
          id: "howToGetThere",
          style: "display: none",
          innerHTML: "如何找到智能櫃？",
        });
      }
      else if (_locale === "it") {
        Object.assign(howToGetThere, {
          href: "#",
          className: "howToGetThere",
          id: "howToGetThere",
          style: "display: none",
          innerHTML: "Come arrivare？",
        });
      }
      var browseIcon = document.createElement("img");
      browseIcon.style.width = "18px";
      browseIcon.setAttribute(
        "src",
        word_press_path +
          "pages/easywidgetSDK/images/browse-icon-transparent.png"
      );
      howToGetThere.appendChild(browseIcon);

      //document.getElementById("howToGetThere").innerHTML.style.display = "none";
      locationContentText.appendChild(howToGetThere);
      //console.log( document.getElementById('howToGetThere'))//setAttribute("hidden",true)

      locationContentDiv.appendChild(locationContentText);

      containerTextDiv.appendChild(locationContainer);
      containerTextDiv.appendChild(locationContentDiv);
      containerParentDiv.appendChild(containerTextDiv);
      if (_mode !== "dropdown") {
        leftWrapper.appendChild(containerParentDiv);
        containerDiv.appendChild(leftWrapper);
      }

      containerDiv.appendChild(containerMapBox);

      //add to dropdownlist
      if (_mode === "dropdown") {
        var sb = new StringBuilder();
        sb.append(result.locationId || "empty");
        sb.append(" - ");
        if (_locale === "en") {
          sb.append(result.locationEn);
        } else if (_locale === "zh") {
          sb.append(result.locationName);
        }
        else if (_locale === "it") {
          sb.append(result.locationName);
        }
        var myString = sb.toString();

        let customDropDownItem = document.createElement("div");
        customDropDownItem.className = "customDropDownItem";
        customDropDownItem.id = result.locationId;
        let customDropDownItemLocationName = document.createElement("p");
        let customDropDownItemLocationTypeCity = document.createElement("p");
        let customDropDownItemCoords = document.createElement("p");

        Object.assign(customDropDownItemLocationName, {
          className: "customDropDownItemLocationName",
          innerHTML: myString,
        });

        Object.assign(customDropDownItemLocationTypeCity, {
          className: "customDropDownItemLocationTypeCity",
          innerHTML: capitaliseString(result.locationType) + "  " + result.city,
        });

        Object.assign(customDropDownItemCoords, {
          hidden: true,
          className: "customDropDownItemCoords",
          innerHTML: long + "-" + lat,
        });

        //    customDropDownItem.appendChild(customDropdownRadioHidden);
        customDropDownItem.appendChild(customDropDownItemLocationName);
        customDropDownItem.appendChild(customDropDownItemLocationTypeCity);
        customDropDownItem.appendChild(customDropDownItemCoords);

        dropDownElementList.push(customDropDownItem);
      }
    },
    complete: () => {
      if (_mode === "dropdown") {
        let customDropDownContainer = document.createElement("div");
        customDropDownContainer.className = "customDropDownContainer";

        let customDropDownBox = document.createElement("div");
        customDropDownBox.className = "customDropDownBox";

        for (var i = 0; i < dropDownElementList.length; i++) {
          customDropDownBox.appendChild(dropDownElementList[i]);
        }
        customDropDownContainer.appendChild(customDropDownBox);
        dropDownElement.appendChild(customDropDownContainer);
        document.getElementById("mapBarWrapper").appendChild(dropDownElement);
        document.getElementById("mapBox").style.display = "none";

        //dropDownSelectedItemContainer

        assignOnClickToDropDownItems();
      }
      if (_mode === "modal") {
        document.getElementById("mapWrapper").appendChild(containerDiv);
      } else {
        document.body.appendChild(containerDiv);
      }

      typeFilterData = Array.from(new Set(typeFilterData));
      if (typeFilterData.includes("HKPost Locker")) {
        moveItem(
          typeFilterData.indexOf("HKPost Locker"),
          typeFilterData.length - 1,
          typeFilterData
        );
      }
      if (typeFilterData.includes("4PX Locker")) {
        moveItem(
          typeFilterData.indexOf("4PX Locker"),
          typeFilterData.length - 2,
          typeFilterData
        );
      }
      if (typeFilterData.includes("4PX Pickup Point")) {
        moveItem(
          typeFilterData.indexOf("4PX Pickup Point"),
          typeFilterData.length - 3,
          typeFilterData
        );
      }
      if (typeFilterData.includes("7 Eleven")) {
        moveItem(
          typeFilterData.indexOf("7 Eleven"),
          typeFilterData.length - 4,
          typeFilterData
        );
      }
      if (typeFilterData.includes("Alfred Point")) {
        moveItem(
          typeFilterData.indexOf("Alfred Point"),
          typeFilterData.length - 5,
          typeFilterData
        );
      }
      if (typeFilterData.includes("Alfred Locker")) {
        moveItem(
          typeFilterData.indexOf("Alfred Locker"),
          typeFilterData.length - 6,
          typeFilterData
        );
      }

      (districtFilterData = Array.from(new Set(districtFilterData))),
        (regionFilterData = Array.from(new Set(regionFilterData))),
        (areaFilterData = Array.from(new Set(areaFilterData))),
        (reactiveFilterData = from(typeFilterData).subscribe({
          next: (result) => {
            //console.log(result)
            let typeFilterItem = document.createElement("option");
            typeFilterItem.innerHTML = result;
            typeFilter.appendChild(typeFilterItem);
          },
          complete: () => {
            var dropDownSelectionEmpty = document.createElement("OPTION");
            Object.assign(dropDownSelectionEmpty, {
              disabled: true,
              selected: true,
            });
            if (_locale === "en") {
              dropDownSelectionEmpty.innerHTML = "Type";
            } else if (_locale === "zh") {
              dropDownSelectionEmpty.innerHTML = "智能櫃種類";
            }
            else if (_locale === "it") {
              dropDownSelectionEmpty.innerHTML = "Tipo";
            }
            /*typeFilter.insertBefore(
              dropDownSelectionEmpty,
              typeFilter.firstChild
            );*/
            //console.log("typeFilter is ",typeFilter)
            let typeFilterTitle = document.createElement("p");
            typeFilterTitle.innerHTML = "1. Select Locker Type";
            typeFilterTitle.className = "typeFilterTitle";
            typeFilterTitle.style.display = "none";
            filtersWrapper.appendChild(typeFilterTitle);
            filtersWrapper.appendChild(typeFilter);
          },
        }));

      reactiveRegionData = from(regionFilterData).subscribe({
        next: (result) => {
          let regionFilterItem = document.createElement("option");
          regionFilterItem.innerHTML = result;
          //regionFilter.appendChild(regionFilterItem);
        },
        complete: () => {
          var dropDownSelectionEmpty = document.createElement("OPTION");
          Object.assign(dropDownSelectionEmpty, {
            disabled: true,
            selected: true,
          });
          if (_locale === "en") {
            dropDownSelectionEmpty.innerHTML = "Region";
          } else if (_locale === "zh") {
            dropDownSelectionEmpty.innerHTML = "區域";
          }
          else if (_locale === "it") {
            dropDownSelectionEmpty.innerHTML = "Regione";
          }

          let regionFilterTitle = document.createElement("p");
          if (_filterCriteria === null)
            regionFilterTitle.innerHTML = "2. Select Region";
          else {
            regionFilterTitle.innerHTML = "1. Select Region";
          }
          regionFilterTitle.className = "regionFilterTitle";
          filtersWrapper.appendChild(regionFilterTitle);
          filtersWrapper.appendChild(regionFilter);
        },
      });

      reactiveDistrictData = from(districtFilterData).subscribe({
        next: (result) => {
          let districtFilterItem = document.createElement("option");
          districtFilterItem.innerHTML = result;
          //districtFilter.appendChild(districtFilterItem);
        },
        complete: () => {
          var dropDownSelectionEmpty = document.createElement("OPTION");
          Object.assign(dropDownSelectionEmpty, {
            disabled: true,
            selected: true,
          });
          if (_locale === "en") {
            dropDownSelectionEmpty.innerHTML = "District";
          } else if (_locale === "zh") {
            dropDownSelectionEmpty.innerHTML = "地區";
          }
          else if (_locale === "it") {
            dropDownSelectionEmpty.innerHTML = "Distretto";
          }

          let districtFilterTitle = document.createElement("p");
          if (_filterCriteria === null)
            districtFilterTitle.innerHTML = "3. Select District";
          else districtFilterTitle.innerHTML = "2. Select District";
          districtFilterTitle.className = "districtFilterTitle";
          filtersWrapper.appendChild(districtFilterTitle);
          filtersWrapper.appendChild(districtFilter);
        },
      });

      reactiveAreaData = from(areaFilterData).subscribe({
        next: (result) => {
          let areaFilterItem = document.createElement("option");
          areaFilterItem.innerHTML = result;
          //areaFilter.appendChild(areaFilterItem);
        },
        complete: () => {
          var dropDownSelectionEmpty = document.createElement("OPTION");
          Object.assign(dropDownSelectionEmpty, {
            disabled: true,
            selected: true,
          });
          if (_locale === "en") {
            dropDownSelectionEmpty.innerHTML = "Area";
          } else if (_locale === "zh") {
            dropDownSelectionEmpty.innerHTML = "範圍";
          }
          else if (_locale === "it") {
            dropDownSelectionEmpty.innerHTML = "Area";
          }

          let areaFilterTitle = document.createElement("p");
          if (_filterCriteria === null) {
            areaFilterTitle.innerHTML = "4. Select Area";
          } else {
            areaFilterTitle.innerHTML = "3. Select Area";
          }

          areaFilterTitle.className = "areaFilterTitle";
          filtersWrapper.appendChild(areaFilterTitle);
          filtersWrapper.appendChild(areaFilter);
        },
      });

      console.log(regionFilterData.length);

      //<div class="loader" id="loader"></div>

      if (_withSearchBar) {
        document.getElementsByClassName("mapFiltersWrapper")[0].style.display =
          "none";
      }
      document.getElementById("loader").style.display = "none";
      //vectorLayer.getSource().clear()

      //mapBox = showMap()

      /*if (_filterCriteria !== null) {
        console.log(_filterCriteria);
        document.getElementsByClassName("typeFilterTitle")[0].style.display =
          "none";
        document.getElementsByClassName(
          "typeFilter mapFilter"
        )[0].style.display = "none";
      }*/

      // console.log("Tea cup, storm");

      console.log("inside complete after refresh");

      mapOnclick();
    },
  });
}

//sort location type data
function moveItem(from, to, data) {
  // remove `from` item and store it
  var f = data.splice(from, 1)[0];
  // insert stored item into position `to`
  return data.splice(to, 0, f);
}

// returns [1, 3, 2]
// Assign Onclick function to dropdown items
const assignOnClickToDropDownItems = () => {
  let dropdownItem = document.getElementsByClassName("customDropDownItem");
  Object.keys(dropdownItem).forEach((key, index) => {
    dropdownItem[key].addEventListener("click", () => {
      document
        .getElementsByClassName("customDropDownContainer")[0]
        .classList.toggle("customDropDownOpen");
      dropdownItem[clickedIndex].classList.remove("customDropDownItemSelected");
      dropdownItem[index].classList.add("customDropDownItemSelected");
      selectedLocationNameId = dropdownItem[key].getElementsByClassName(
        "customDropDownItemLocationName"
      )[0].innerHTML;
      document.getElementsByClassName(
        "customDropDownSelectText"
      )[0].innerHTML = selectedLocationNameId;
      clickedIndex = index;

      var selocationId = selectedLocationNameId.split(" - ")[0];
      for (let i = 0; i < lockerLocations.length; i++) {
        //console.log(lockerLocations[i].values_.locationId)
        console.log(lockerLocations[i].values_);
        if (lockerLocations[i].values_.locationId === selocationId) {
          console.log("match found");
          callBackObject = lockerLocations[i].values_;
          console.log("callback object", callBackObject);
          showDropDownSelection(callBackObject);
          _onSelect(callBackObject);
          showPopUp(callBackObject);
          let long = lockerLocations[i].values_.longitude;
          let lat = lockerLocations[i].values_.latitude;

          mapView.values_.center = ol.proj.fromLonLat([long, lat]);
          mapView.setZoom(18);

          if (mapBox !== undefined) mapBox.render();
        } else {
          console.log("match not found");
        }
      }
    });
  });
  //console.log(selectedLocationNameId, "selectedLocationNameId")
};

var reactiveList = from(lockerLocations);

//function filterListByRegion()

const filterByDistrictParams$ = fromEvent([districtFilter], "change").pipe(
  map(($event) => {
    filteredDistrict = [];
    filteredArea = [];
    let selectElement = $event.target;
    var optionIndex = selectElement.selectedIndex;
    var optionText = selectElement.options[optionIndex];
    //console.log(event)
    return optionText.innerHTML;
  }),
  debounceTime(1000),
  distinctUntilChanged(),
  filter(function (value) {
    return value.length > 2;
  })
  //flatMap(filterListByDistrictParams),
);

const filterByRegionParams$ = fromEvent([regionFilter], "change").pipe(
  map(($event) => {
    let selectElement = $event.target;
    var optionIndex = selectElement.selectedIndex;
    var optionText = selectElement.options[optionIndex];
    //console.log(event);
    return optionText.innerHTML;
  }),
  debounceTime(1000),
  distinctUntilChanged(),
  filter(function (value) {
    return value.length > 2;
  })
  //flatMap(filterListByRegionParams),
);

const filterByTypeParams$ = fromEvent([typeFilter], "change").pipe(
  map(($event) => {
    let selectElement = $event.target;
    var optionIndex = selectElement.selectedIndex;
    var optionText = selectElement.options[optionIndex];

    console.log("optionText inner html ", optionText.innerText);
    let locationType1 = optionText.innerHTML;
    let locationType = "";
    if (locationType1 === "7 Eleven") {
      locationType = "Seven Eleven";
    } else if (locationType1 === "4PX Locker") {
      locationType = "Fpx Locker";
    } else if (locationType1 === "4PX Pickup Point") {
      locationType = "Fpx Redemption";
    } else if (locationType1 === "HKPost Locker") {
      locationType = "Hkpost Locker";
    } else {
      locationType = locationType1;
    }
    //let locationType = optionText.innerHTML
    /*if (String(optionText.innerHTML) === '4PX Locker') {
            locationtype = 'Fpx Locker'
        }
        else if (optionText.innerHTML === '4PX Pickup Point') {
            locationtype = 'Fpx Redemption'
        }
        else if (String(optionText.innerHTML) === '7 Eleven') {
            locationtype = 'Seven Eleven'
        }
        

        else if (optionText.innerHTML === 'HKPost Locker') {

            locationtype = 'Hkpost Locker'

        }
        else { 
            locationType = optionText.innerHTML
        }*/
    console.log("location type sent ", locationType);
    return locationType;
  }),
  debounceTime(1000),
  distinctUntilChanged(),
  filter(function (value) {
    return value.length > 2;
  })
  //flatMap(filterListByTypeParams),
);

const filterByAreaParams$ = fromEvent([areaFilter], "change").pipe(
  map(($event) => {
    filteredArea = [];
    let selectElement = $event.target;
    var optionIndex = selectElement.selectedIndex;
    var optionText = selectElement.options[optionIndex];

    return optionText.innerHTML;
  }),
  debounceTime(1000),
  distinctUntilChanged(),
  filter(function (value) {
    return value.length > 2;
  })
  //flatMap(filterListByTypeParams),
);

//combine the above:
//var end$ = new Subject();  ....use this if you want to end the observable
const multiFilter = merge(
  filterByTypeParams$.pipe(
    map((x) => {
      //NEW CODE
      clickedIndex = 0;
      vectorLayer.getSource().clear();
      hidePopUp();
      numberOfFilteredItems = [];
      containerParentDiv.innerHTML = ""; //HACK!!!!!!
      if (_mode === "dropdown") {
        document.getElementsByClassName("customDropDownBox")[0].innerHTML = "";
      }
      if (x !== "All Locker Types" && x !== "全部地點類型") {
        console.log("x value after filter is ", x);
        multiFilterObject["locationType"] = x;
      } else {
        delete multiFilterObject["locationType"];
      }
      return multiFilterObject;
    })
    //takeUntil(end$)
  ),

  filterByRegionParams$.pipe(
    map((x) => {
      //NEW CODE

      //console.log("hossa 20", x, completeResultArray);
      filteredDistrict = [];
      filteredArea = [];
      clickedIndex = 0;
      vectorLayer.getSource().clear();
      hidePopUp();
      numberOfFilteredItems = [];
      containerParentDiv.innerHTML = ""; //HACK!!!!!!!!
      if (_mode === "dropdown") {
        document.getElementsByClassName("customDropDownBox")[0].innerHTML = "";
      }

      if (x !== "All Regions" && x !== "全部區域") {
        multiFilterObject["province"] = x;
        delete multiFilterObject["city"];
        delete multiFilterObject["district"];
        filteredRegionName = x;
      } else {
        delete multiFilterObject["province"];
        delete multiFilterObject["city"];
        delete multiFilterObject["district"];
        filteredRegionName = "All Regions";
      }
      return multiFilterObject;
    })
    //takeUntil(end$),
  ),
  filterByDistrictParams$.pipe(
    map((x) => {
      //NEW CODE
      filteredDistrict = [];
      filteredArea = [];
      clickedIndex = 0;
      vectorLayer.getSource().clear();
      hidePopUp();
      numberOfFilteredItems = [];
      containerParentDiv.innerHTML = "";
      if (_mode === "dropdown") {
        document.getElementsByClassName("customDropDownBox")[0].innerHTML = "";
      }
      if (x !== "All Districts" && x !== "全部地區") {
        multiFilterObject["city"] = x;
        filteredDistrictName = x;
        //delete multiFilterObject["city"];
        delete multiFilterObject["district"];
      } else {
        filteredDistrictName = x;
        delete multiFilterObject["city"];
        delete multiFilterObject["district"];
      }

      return multiFilterObject;
      //return x
    })
    //takeUntil(end$)
  ),

  filterByAreaParams$.pipe(
    map((x) => {
      //NEW CODE
      filteredDistrict = [];
      filteredArea = [];
      clickedIndex = 0;
      vectorLayer.getSource().clear();
      hidePopUp();
      numberOfFilteredItems = [];
      containerParentDiv.innerHTML = ""; //HACK!!!!!!!!
      if (_mode === "dropdown") {
        document.getElementsByClassName("customDropDownBox")[0].innerHTML = "";
      }

      if (x !== "All Areas" && x !== "全部範圍") {
        multiFilterObject["district"] = x;
      } else {
        delete multiFilterObject["district"];
      }
      return multiFilterObject;
    })
    //takeUntil(end$),
  )
).pipe(flatMap(multiFilterList));

//NEW CODE (but no implemented yet, was giving error)
//get center from array of long lat
function averageGeolocation(coords) {
  if (coords.length === 1) {
    return coords[0];
  }

  let x = 0.0;
  let y = 0.0;
  let z = 0.0;

  for (let coord of coords) {
    let latitude = (coord.latitude * Math.PI) / 180;
    let longitude = (coord.longitude * Math.PI) / 180;

    x += Math.cos(latitude) * Math.cos(longitude);
    y += Math.cos(latitude) * Math.sin(longitude);
    z += Math.sin(latitude);
  }

  let total = coords.length;

  x = x / total;
  y = y / total;
  z = z / total;

  let centralLongitude = Math.atan2(y, x);
  let centralSquareRoot = Math.sqrt(x * x + y * y);
  let centralLatitude = Math.atan2(z, centralSquareRoot);

  return {
    latitude: (centralLatitude * 180) / Math.PI,
    longitude: (centralLongitude * 180) / Math.PI,
  };
}

//lodash function (src:https://github.com/lodash/lodash), to check if filter criteria matches location object
function isSubset(obj1, obj2) {
  let matched = true;
  _.forEach(obj1, (value, key) => {
    if (!_.isEqual(value, obj2[key])) {
      matched = false;
      return;
    }
  });
  return matched;
}

function multiFilterList(filterCriteria) {
  return reactiveList.pipe(
    filter((locationObject) => {
      let matchFound = isSubset(filterCriteria, locationObject.values_);
      if (matchFound) {
        //console.log("FemaleWriters", locationObject.values_.district);
        filteredDistrict.push(locationObject.values_.city);
        //filteredArea.push(locationObject.values_.district);

        return locationObject;
      }
    }),
    filter((locationObject) => {
      //let matchFound = isSubset(filterCriteria, locationObject.values_);
      //if (matchFound) {
      //console.log("FemaleWriters", locationObject.values_.district);
      //  filteredDistrict.push(locationObject.values_.city);
      filteredArea.push(locationObject.values_.district);

      return locationObject;
      //}
    }),
    //NEW CODE
    defaultIfEmpty(undefined)
  );
}

multiFilter.subscribe({
  next: (r) => {
    //NEW CODE
    //document.getElementById("loader").style.display = "block";
    //setTimeout(function updateMap(){
    if (r === null) {
      console.log("inside null");
      let noResultText = document.createElement("p");
      noResultText.setAttribute("style", "text-align: center");
      if (_locale === "en") {
        noResultText.innerHTML =
          "The location you have searched for does not have any Alfred Locations available";
      } else if (_locale === "zh") {
        noResultText.innerHTML = "你搜尋的地方沒有任何智能櫃服務";
      }
      else if (_locale === "it") {
        noResultText.innerHTML = "Nessun point trovato";
      }
      if (_mode === "dropdown") {
        document
          .getElementsByClassName("customDropDownBox")[0]
          .appendChild(noResultText);
      } else {
        containerParentDiv.appendChild(noResultText);
      }
      mapView.values_.center = ol.proj.fromLonLat([12.56738, 41.87194]);
      mapView.setZoom(12);
      mapBox.render();
    } else {
      let result = r.values_;

      updateList(result);
      updateMap(result);

      mapView.values_.center = ol.proj.fromLonLat([
        r.values_.longitude,
        r.values_.latitude,
      ]);
      //mapView.values_.center = ol.proj.fromLonLat([114.177216,  22.302711])
      mapView.setZoom(12);
      if (mapBox !== undefined) mapBox.render();

      filteredDistrict = Array.from(new Set(filteredDistrict));
      filteredArea = Array.from(new Set(filteredArea));

      let disFilter = document.getElementsByClassName("districtFilter")[0];
      let areFilter = document.getElementsByClassName("areaFilter")[0];

      if (filteredRegionName == "") {
        console.log("8901", filteredRegionName);

        if (filteredDistrictName === "") {
          //do nothing
        } else {
          removeOptions(areFilter);
          for (let j = 0; j < filteredArea.length; j++) {
            var option = document.createElement("option");
            option.text = filteredArea[j];
            areFilter.add(option);
          }
        }
      } else {
        console.log("8901", multiFilterObject);
        removeOptions(disFilter);
        removeOptions(areFilter);
        for (let j = 0; j < filteredDistrict.length; j++) {
          var option = document.createElement("option");
          option.text = filteredDistrict[j];
          disFilter.add(option);
        }
        console.log("multifilterObject", multiFilterObject);
        for (let j = 0; j < filteredArea.length; j++) {
          var option = document.createElement("option");
          option.text = filteredArea[j];

          areFilter.add(option);
        }
      }

      let cityName = multiFilterObject["city"];
      let districtName = multiFilterObject["district"];

      if (cityName === undefined) {
        disFilter.options.selectedIndex = 1;
      } else {
        for (let j = 0; j < disFilter.options.length; j++) {
          if (disFilter.options[j].text === cityName) {
            disFilter.options.selectedIndex = j;
          }
        }
      }

      if (districtName === undefined) {
        areFilter.options.selectedIndex = 1;
      } else {
        for (let j = 0; j < areFilter.options.length; j++) {
          if (areFilter.options[j].text === districtName) {
            areFilter.options.selectedIndex = j;
          }
        }
      }

      //now remove all dups.
    }

    //}, 1000);
  },

  complete: () => {},
});

function removeOptions(selectElement) {
  var i,
    L = selectElement.options.length - 1;
  for (i = L; i >= 2; i--) {
    selectElement.remove(i);
  }
}

function updateMap(result) {
  let lat = result.latitude;
  let long = result.longitude;
  let coordinates = ol.proj.fromLonLat([long, lat]);

  console.log("features");
  console.log("features", vectorLayer.getSource().features);
  vectorLayer.getSource().addFeature(
    new ol.Feature({
      type: "click",
      address1: result.address1,
      address1En: result.address1En,
      address2: result.address2,
      address2En: result.address2En,
      city: result.city,
      companyId: result.companyId,
      companyName: result.companyName,
      country: result.country,
      description: result.description,
      district: result.district,
      province: result.province,
      latitude: lat,
      longitude: long,
      locationEn: result.locationEn,
      locationGroup: result.locationGroup,
      locationId: result.locationId,
      locationName: result.locationName,
      locationType: result.locationType,
      services: result.services,
      //operatingTime: result.operatingTime,
      operatingTime: result.displayHours,
      operatingTimeCN: result.displayHoursCN,
      postalCode: result.postalCode,
      availableCompartments: result.availableCompartments,
      geometry: new ol.geom.Point(coordinates),
    })
  );
  //console.log(lockerLocations.length)
}

//update LIST also hack, fix
function updateList(result) {
  console.log("update list result", result);
  //console.log("update list result", result === null)
  numberOfFilteredItems.push(result);
  let lat = result.latitude;
  let long = result.longitude;

  /****START**/
  //inner HTML elements
  var containerTextDiv = document.createElement("div");
  containerTextDiv.className = "containerChildTextDiv";

  // var locationContainer = document.createElement("div");
  // locationContainer.className = result.locationId
  var locationContainer = document.createElement("INPUT");
  Object.assign(locationContainer, {
    type: "radio",
    name: "list",
    id: result.locationId,
    className: "mapRadioBtn",
  });

  var locationContentDiv = document.createElement("label");
  Object.assign(locationContentDiv, {
    htmlFor: result.locationId,
    className: "label",
  });

  var logo = document.createElement("img");
  Object.assign(logo, {
    src: word_press_path + "pages/easywidgetSDK/images/alfred-logo.png",
    className: "alfred-logo",
  });
  locationContentDiv.appendChild(logo);

  var locationContentText = document.createElement("div");

  // var locationName = document.createElement("P");                 // Create a <p> element
  // locationName.innerHTML = result.locationName;                // Insert text
  // locationContainer.appendChild(locationName);
  if (result.locationName || result.locationId) {
    var locationName = document.createElement("P"); // Create a <p> element
    locationName.setAttribute("class", "locationName");
    if (_locale === "en") {
      locationName.innerHTML =
        result.locationId + " - " + (result?.locationEn ?? ""); // Insert text
    } else if (_locale === "zh") {
      locationName.innerHTML =
        result.locationId + " - " + (result?.locationName ?? ""); // Insert text
    } // Insert text
    else if (_locale === "it") {
      locationName.innerHTML =
        result.locationId + " - " + (result?.locationName ?? ""); // Insert text
    } 
    locationContentText.appendChild(locationName);
  }

  // var operatingTime = document.createElement("P");                 // Create a <p> element
  // operatingTime.innerHTML = result.operatingTime;
  // locationContainer.appendChild(operatingTime);
  if (result.operatingTime) {
    var operatingTime = document.createElement("P");
    operatingTime.setAttribute("class", "operatingTime");
    //operatingTime.innerHTML = result.operatingTime;

    if (_locale === "en") {
      operatingTime.innerHTML = result?.displayHours ?? "";
    } else if (_locale === "zh") {
      operatingTime.innerHTML = result?.displayHoursCN ?? "";
    }
    else if (_locale === "it") {
      operatingTime.innerHTML = result?.displayHoursCN ?? "";
    }
    locationContentText.appendChild(operatingTime);
  }

  var address = document.createElement("P");
  console.log(result);
  if (_locale === "en") {
    address.innerHTML = result?.address1En ?? "";
  } else if (_locale === "zh") {
    address.innerHTML = result?.address1 ?? "";
  }
  else if (_locale === "it") {
    address.innerHTML = result?.address1 ?? "";
  }
  address.setAttribute("class", "contentAddress");
  locationContentText.appendChild(address);

  // var services = document.createElement("P")
  // services.innerHTML = result.services
  // locationContentText.appendChild(services)

  // var city = document.createElement("P");                 // Create a <p> element
  // city.innerHTML = result.city;
  // locationContainer.appendChild(city);
  var city = document.createElement("P");
  if (result.locationType) {
    Object.assign(city, {
      innerHTML:
        capitaliseString(result.locationType) + " | " + (result?.city ?? ""),
      className: "contentCity",
    });
  } else {
    Object.assign(city, {
      innerHTML: result.city,
      className: "contentCity",
    });
  }

  locationContentText.appendChild(city);

  var locationType = document.createElement("P");
  if (result.locationType) {
    Object.assign(locationType, {
      innerHTML: capitaliseString(result.locationType),
      className: "contentLocationType",
    });
  }
  locationContentText.appendChild(locationType);

  var coords = document.createElement("P");
  coords.setAttribute("hidden", true);
  coords.className = "coords";
  coords.innerHTML = long + "-" + lat;
  locationContentText.appendChild(coords);

  var howToGetThere = document.createElement("a");

  //How to get there popup
  if (_locale === "en") {
    Object.assign(howToGetThere, {
      href: "#",
      className: "howToGetThere",
      style: "display: none",

      innerHTML: "How to get there",
    });
  } else if (_locale === "zh") {
    Object.assign(howToGetThere, {
      href: "#",
      className: "howToGetThere",
      style: "display: none",

      innerHTML: "如何找到智能櫃？",
    });
  }
  else if (_locale === "it") {
    Object.assign(howToGetThere, {
      href: "#",
      className: "howToGetThere",
      style: "display: none",

      innerHTML: "Come arrivare？",
    });
  }
  var browseIcon = document.createElement("img");
  browseIcon.style.width = "18px";
  browseIcon.setAttribute(
    "src",
    word_press_path + "pages/easywidgetSDK/images/browse-icon-transparent.png"
  );
  howToGetThere.appendChild(browseIcon);
  locationContentText.appendChild(howToGetThere);

  //locationContentText.appendChild(howToGetThere);

  locationContentDiv.appendChild(locationContentText);

  // locationContainer.appendChild(document.createElement("hr"))
  // containerTextDiv.appendChild(locationContainer)
  // containerParentDiv.appendChild(containerTextDiv)
  // containerDiv.appendChild(containerParentDiv)
  containerTextDiv.appendChild(locationContainer);
  containerTextDiv.appendChild(locationContentDiv);
  containerParentDiv.appendChild(containerTextDiv);
  if (_mode !== "dropdown") {
    leftWrapper.appendChild(containerParentDiv);
    containerDiv.appendChild(leftWrapper);
  }
  containerDiv.appendChild(containerMapBox);

  //add to dropdownlist
  if (_mode === "dropdown") {
    var sb = new StringBuilder();
    sb.append(result.locationId || "empty");
    sb.append(" - ");
    console.log(result.locationEn);
    if (_locale === "en") {
      sb.append(result.locationEn);
    } else if (_locale === "zh") {
      sb.append(result.locationName);
    }
    else if (_locale === "it") {
      sb.append(result.locationName);
    }
    var myString = sb.toString();

    let customDropDownItem = document.createElement("div");
    customDropDownItem.className = "customDropDownItem";
    customDropDownItem.id = result.locationId;
    let customDropDownItemLocationName = document.createElement("p");
    let customDropDownItemLocationTypeCity = document.createElement("p");
    let customDropDownItemCoords = document.createElement("p");

    Object.assign(customDropDownItemLocationName, {
      className: "customDropDownItemLocationName",
      innerHTML: myString,
    });

    console.log(customDropDownItemLocationName);

    Object.assign(customDropDownItemLocationTypeCity, {
      className: "customDropDownItemLocationTypeCity",
      innerHTML: capitaliseString(result.locationType) + "  " + result.city,
    });

    Object.assign(customDropDownItemCoords, {
      hidden: true,
      className: "customDropDownItemCoords",
      innerHTML: long + "-" + lat,
    });

    customDropDownItem.appendChild(customDropDownItemLocationName);
    customDropDownItem.appendChild(customDropDownItemLocationTypeCity);
    customDropDownItem.appendChild(customDropDownItemCoords);

    customDropDownItem.addEventListener("click", () => {
      let dropdownItem = document.getElementsByClassName("customDropDownItem");
      dropdownItem[clickedIndex].classList.remove("customDropDownItemSelected");
      customDropDownItem.classList.add("customDropDownItemSelected");
      selectedLocationNameId = customDropDownItemLocationName.innerHTML;
      callBackObject = result;

      showDropDownSelection(result);
      _onSelect(callBackObject);
      showPopUp(callBackObject);
      document.getElementsByClassName(
        "customDropDownSelectText"
      )[0].innerHTML = selectedLocationNameId;
      let selectedItemIndex = numberOfFilteredItems.findIndex(
        (item) => item.locationId === result.locationId
      );
      clickedIndex = selectedItemIndex;

      var selocationId = selectedLocationNameId.split(" - ")[0];
      for (let i = 0; i < lockerLocations.length; i++) {
        //console.log(lockerLocations[i].values_.locationId)
        console.log(lockerLocations[i].values_.locationId);
        if (lockerLocations[i].values_.locationId === selocationId) {
          console.log("match found");
          let long = lockerLocations[i].values_.longitude;
          let lat = lockerLocations[i].values_.latitude;

          mapView.values_.center = ol.proj.fromLonLat([long, lat]);
          mapView.setZoom(18);
          if (mapBox !== undefined) mapBox.render();
        } else {
          console.log("match not found uuuu");
        }
      }
    });

    document
      .getElementsByClassName("customDropDownBox")[0]
      .appendChild(customDropDownItem);
    // dropDownElementList.push(customDropDownItem)
    // assignOnClickToDropDownItems()
  }
}

function showDropDownSelection(result) {
  dropDownSelectedItemContainer.innerHTML = "";

  /*
    var info  =   '<div style="width:220px; margin-top:3px">' + (result?.locationId?? "") + '</div>' +
           '<div style="width:220px; margin-top:3px">' + capitaliseString((result?.locationType ?? "")) + " | " + (result?.district ?? "") + '</div>'+
           '<div style="width:220px; margin-top:3px">' + location + '</div>'+
           '<div style="width:220px; margin-top:3px; color: grey">' + address + '</div>'+
           '<div style="width:220px; margin-top:3px; color: grey">' + operatingTime + '</div>'+
           '<div style="width:220px; margin-top:3px; color: grey">' + (result?.city?? "") + '</div>' //+
   */

  let containerTextDiv = document.createElement("div");
  containerTextDiv.className = "containerChildTextDiv";

  // var locationContainer = document.createElement("div");
  // locationContainer.className = result.locationId
  let locationContainer = document.createElement("INPUT");
  Object.assign(locationContainer, {
    type: "radio",
    name: "list",
    id: result.locationId,
    className: "mapRadioBtn",
  });

  let locationContentDiv = document.createElement("label");
  Object.assign(locationContentDiv, {
    htmlFor: result.locationId,
    className: "label",
  });

  let logo = document.createElement("img");
  Object.assign(logo, {
    src: word_press_path + "pages/easywidgetSDK/images/alfred-logo.png",
    //src: "https://alfred.delivery//////wp-content/uploads/2018/10/Alfred-logo_gradient_Small.png",
    className: "alfred-logo",
  });
  locationContentDiv.appendChild(logo);

  let locationContentText = document.createElement("div");

  if (result.locationName || result.locationId) {
    let locationName = document.createElement("P"); // Create a <p> element
    locationName.setAttribute("class", "locationName");
    if (_locale === "en") {
      locationName.innerHTML =
        result.locationId + " - " + (result?.locationEn ?? ""); // Insert text
    } else if (_locale === "zh") {
      locationName.innerHTML =
        result.locationId + " - " + (result?.locationName ?? ""); // Insert text
    }
    else if (_locale === "it") {
      locationName.innerHTML =
        result.locationId + " - " + (result?.locationName ?? ""); // Insert text
    }
    locationContentText.appendChild(locationName);
  }

  /*if (result.operatingTime) {
                var operatingTime = document.createElement("P");
                operatingTime.setAttribute("class", "operatingTime")
                operatingTime.innerHTML = result.operatingTime; 
                locationContentText.appendChild(operatingTime);
            }*/

  if (result.operatingTime) {
    let operatingTime = document.createElement("P");
    operatingTime.setAttribute("class", "operatingTime display-block");

    if (_locale === "en") {
      operatingTime.innerHTML = result.operatingTime;
    } else if (_locale === "zh") {
      operatingTime.innerHTML = result.operatingTimeCN;
    }
    else if (_locale === "it") {
      operatingTime.innerHTML = result.operatingTimeCN;
    }

    locationContentText.appendChild(operatingTime);
  }

  let address = document.createElement("P");
  if (_locale === "en") {
    address.innerHTML = result.address1En;
  } else if (_locale === "zh") {
    address.innerHTML = result.address1;
  }
  else if (_locale === "it") {
    address.innerHTML = result.address1;
  }
  address.setAttribute("class", "contentAddress display-block");
  locationContentText.appendChild(address);

  /*let locationType = document.createElement("P");
    if (result.locationType) {
      Object.assign(locationType, {
        innerHTML: capitaliseString(result.locationType),
        className: "contentLocationType display-block",
      });
    }
    locationContentText.appendChild(locationType);*/

  let city = document.createElement("P");
  if (result.locationType) {
    Object.assign(city, {
      innerHTML:
        capitaliseString(result.locationType) + " | " + (result?.city ?? ""),
      className: "contentCityDropdown",
    });
  } else {
    Object.assign(city, {
      innerHTML: result?.city ?? "",
      className: "contentCityDropdown",
    });
  }
  locationContentText.appendChild(city);

  /* let coords = document.createElement("P");
    coords.setAttribute("hidden", true);
    coords.className = "coords";
    coords.innerHTML = long + "-" + lat;
    locationContentText.appendChild(coords);*/

  let howToGetThere = document.createElement("a");
  if (_locale === "en") {
    Object.assign(howToGetThere, {
      href: "#",
      className: "howToGetThere display-block",
      id: "howToGetThere",
      style: "display: none",

      innerHTML: "How to get there",
    });
  } else if (_locale === "zh") {
    Object.assign(howToGetThere, {
      href: "#",
      className: "howToGetThere",
      id: "howToGetThere",
      style: "display: none",
      innerHTML: "如何找到智能櫃？",
    });
  }
  else if (_locale === "it") {
    Object.assign(howToGetThere, {
      href: "#",
      className: "howToGetThere",
      id: "howToGetThere",
      style: "display: none",
      innerHTML: "Come arrivare？",
    });
  }
  let browseIcon = document.createElement("img");
  browseIcon.style.width = "18px";
  browseIcon.setAttribute(
    "src",
    word_press_path + "pages/easywidgetSDK/images/browse-icon-transparent.png"
  );
  howToGetThere.appendChild(browseIcon);

  //document.getElementById("howToGetThere").innerHTML.style.display = "none";
  locationContentText.appendChild(howToGetThere);
  //console.log( document.getElementById('howToGetThere'))//setAttribute("hidden",true)

  locationContentDiv.appendChild(locationContentText);

  console.log("inside llll");
  dropDownSelectedItemContainer.appendChild(locationContentDiv);
}

// search bar filtering
function filterListByCity(filterVal) {
  return reactiveList.pipe(
    filter((x) => {
      //let cityLowerCase = x.values_.city.trim().toLowerCase();
      let filterValLowerCase = filterVal.trim().toLowerCase();

      let regionFilterValue = x.values_.province.trim().toLowerCase();
      let districtFilterValue = x.values_.city.trim().toLowerCase();
      let areaFilterValue = x.values_.district.trim().toLowerCase();
      let locationNameFilterVal = x.values_.locationName.trim().toLowerCase();
      let locationIdFilterVal = x.values_.locationId.trim().toLowerCase();
      let addressFilterVal = x.values_.address1En.trim().toLowerCase();
      //region, district, area, location name, location ID and address

      /*if (regionFilterValue.indexOf(filterVal) !== -1) { 
                return x;
            }*/
      if (
        stringSimilarity.compareTwoStrings(
          filterValLowerCase,
          regionFilterValue
        ) >= 0.6
      ) {
        console.log(x.values_);
        return x;
      } else if (
        stringSimilarity.compareTwoStrings(
          filterValLowerCase,
          districtFilterValue
        ) >= 0.6
      ) {
        return x;
      } else if (
        stringSimilarity.compareTwoStrings(
          filterValLowerCase,
          areaFilterValue
        ) >= 0.6
      ) {
        return x;
      } else if (
        stringSimilarity.compareTwoStrings(
          filterValLowerCase,
          locationNameFilterVal
        ) >= 0.6
      ) {
        return x;
      } else if (
        stringSimilarity.compareTwoStrings(
          filterValLowerCase,
          locationIdFilterVal
        ) >= 0.6
      ) {
        return x;
      } else if (
        stringSimilarity.compareTwoStrings(
          filterValLowerCase,
          addressFilterVal
        ) >= 0.6
      ) {
        return x;
      }
    }),
    takeLast(1), //return only last value and set center to its coordinates
    defaultIfEmpty(undefined)
  );
}

if (_withSearchBar) {
  //filter data from search bar
  const filterData$ = fromEvent(searchBar, "input").pipe(
    map((e) => {
      return e.target.value;
    }),
    debounceTime(1000),
    distinctUntilChanged(),
    filter(function (value) {
      return value.length > 2;
    }),
    flatMap(filterListByCity)
  );

  filterData$.subscribe({
    next: (result) => {
      //    console.log(result);
      if (result === null) {
        searchBar.value = "";
        alert("No match found");
      } else {
        mapView.values_.center = ol.proj.fromLonLat([
          result.values_.longitude,
          result.values_.latitude,
        ]);
        mapView.setZoom(14);
        mapBox.render();
        let radioBtnList = document.getElementsByClassName("mapRadioBtn");
        // console.log(radioBtnList.length)
        Object.keys(radioBtnList).forEach((key, index) => {
          if (radioBtnList[key].id === result.values_.locationId) {
            setFocus(index);
          }
        });
      }
    },
    complete: () => {
      return console.log("done filter data");
    },
  });
}

//const filterDropDownData = fromEvent(dro)

function showMap() {
  if (_mode !== "dropdown") {
    /*var mbMap = new mapboxgl.Map({
        container: 'mapBox',
        style: './easyWidgetSDK/components/osm_liberty.json',
       
      });

      
      var mbLayer = new ol.layer.Layer({
        render: function (frameState) {
          var canvas = mbMap.getCanvas();
          var viewState = frameState.viewState;
      
          var visible = mbLayer.getVisible();
          canvas.style.display = visible ? 'block' : 'none';
      
          var opacity = mbLayer.getOpacity();
          canvas.style.opacity = opacity;
      
    
          if (mbMap._frame) {
            mbMap._frame.cancel();
            mbMap._frame = null;
          }
          mbMap._render();
      
          return canvas;
        },
        
      });*/

    /*return new mapboxgl.Map({
            container: 'mapBox',
            style: './easyWidgetSDK/components/osm_liberty.json',
            center: [8.538961,47.372476],
            zoom: 5,
            hash: true
        });*/

    /*source: new ol.source.TileJSON({
                  
                    url: 'https://api.maptiler.com/maps/basic/tiles.json?key=PXShsbUVPsSjgNaNzdkp',
                    
                    //url: 'https://alfred-geowidget.s3-ap-southeast-1.amazonaws.com/easywidgetSDK/components/osm_liberty.json?key=PXShsbUVPsSjgNaNzdkp',
                    crossOrigin: 'anonymous'
                 
                })*/
    //var mapBox1  =olms.apply('mapBox', './easyWidgetSDK/components/osm_liberty.json')
    //mapBox1.addLayer(vectorLayer)
    //mapBox1.addView(mapView)

    /*let mapBox = new ol.Map({
         target: 'mapBox',
         layers: [
           new ol.layer.Tile({
               
                source: new ol.source.OSM(),
                
            }),
            vectorLayer
            
          ],
          view: mapView
       });*/

    //var mapBox = olms.apply('mapBox','https://alfred-geowidget.s3-ap-southeast-1.amazonaws.com/easywidgetSDK/components/osm_liberty.json')
    console.log("map merge first");
    var mapBox = olms.apply(
      "mapBox",
      word_press_path + "pages/easywidgetSDK/components/osm_liberty.json"
    );
    console.log("map merge second");
    mapBox.setView(mapView);
    //m.setLayer(vectorLayer)
    mapBox.getLayers().clear();
    mapBox.addLayer(vectorLayer);
    // mapBox.addLayer(vectorLayer)

    return mapBox;
  }
}

function setFocus(num) {
  const textDiv = document.getElementsByClassName("containerChildTextDiv");
  Object.keys(textDiv).forEach((key, index) => {
    textDiv[key].classList.remove("selected-background");
    if (textDiv[key].getElementsByClassName("contentCity")[0] !== undefined) {
      textDiv[key]
        .getElementsByClassName("contentCity")[0]
        .classList.remove("display-none");
    }

    if (
      textDiv[key].getElementsByClassName("contentAddress")[0] !== undefined
    ) {
      textDiv[key]
        .getElementsByClassName("contentAddress")[0]
        .classList.remove("display-block");
    }
    if (textDiv[key].getElementsByClassName("operatingTime")[0] !== undefined) {
      textDiv[key]
        .getElementsByClassName("operatingTime")[0]
        .classList.remove("display-block");
    }
    if (textDiv[key].getElementsByClassName("howToGetThere")[0] !== undefined) {
      textDiv[key]
        .getElementsByClassName("howToGetThere")[0]
        .classList.remove("display-flex");
    }
  });
  // document.getElementsByTagName("input")[num].checked = true;
  // document.getElementsByTagName("input")[num].parentNode.classList.add("selected-background");
  textDiv[num].getElementsByClassName("mapRadioBtn")[0].checked = true;
  textDiv[num].classList.add("selected-background");
  textDiv[num]
    .getElementsByClassName("contentAddress")[0]
    .classList.add("display-block");
  if (textDiv[num].getElementsByClassName("operatingTime")[0]) {
    textDiv[num]
      .getElementsByClassName("operatingTime")[0]
      .classList.add("display-block");
  }
  textDiv[num]
    .getElementsByClassName("howToGetThere")[0]
    .classList.add("display-flex");
  textDiv[num]
    .getElementsByClassName("contentCity")[0]
    .classList.add("display-none");
  //textDiv[num].getElementsByClassName("contentLocationType")[0].classList.add("display-none");
  textDiv[num].getElementsByClassName("mapRadioBtn")[0].focus();
}

// var popup = new ol.Overlay.Popup();
function mapOnclick() {
  console.log("inside mapOnClick");

  if (mapBox !== undefined) {
    console.log(mapBox);
    mapBox.addOverlay(popup);
    // Add an event handler for when someone clicks on a marker
    mapBox.on("singleclick", function (evt) {
      // Hide existing popup and reset it's offset
      popup.hide();
      popup.setOffset([0, 0]);

      //change all markers to orignal blue marker
      let features = vectorLayer.getSource().getFeatures();
      //console.log("vectorlayer")
      //console.log("vectorlayer ", vectorLayer.getSource().getFeatures())
      features.forEach(function (features, index) {
        features.setStyle(styleOriginal);
      });

      // Attempt to find a feature in one of the visible vector layers
      var feature = mapBox.forEachFeatureAtPixel(evt.pixel, function (
        feature,
        layer
      ) {
        console.log("features ", feature);

        //change selected marker to red
        feature.setStyle(styleRed);
        return feature;
      });

      if (feature) {
        var coord = feature.getGeometry().getCoordinates();
        var props = feature.getProperties();

        if (_mode === "dropdown") {
          let dropdownItemSelectedByMapMarker = document.getElementById(
            props.locationId
          );
          let dropdownItem = document.getElementsByClassName(
            "customDropDownItem"
          );
          dropdownItem[clickedIndex].classList.remove(
            "customDropDownItemSelected"
          );
          //dropdownItemSelectedByMapMarker.classList.add("customDropDownItemSelected");
          selectedLocationNameId = dropdownItemSelectedByMapMarker.getElementsByClassName(
            "customDropDownItemLocationName"
          )[0].innerHTML;
          document.getElementsByClassName(
            "customDropDownSelectText"
          )[0].innerHTML = selectedLocationNameId;
          let selectedItemIndex = numberOfFilteredItems.findIndex(
            (item) => item.locationId === props.locationId
          );
          clickedIndex = selectedItemIndex;
          dropdownItemSelectedByMapMarker.scrollIntoView();
        }

        console.log("feature", "inside the popup");
        var location;
        var howToGetThere;
        var address;
        var operatingTime;
        if (_locale === "en") {
          location = props?.locationEn ?? "";
          howToGetThere = "How to get there";
          address = props?.address1En ?? "";
          operatingTime = props?.operatingTime ?? "";
        } else if (_locale === "zh") {
          location = props?.locationName ?? "";
          howToGetThere = "如何找到智能櫃？";
          address = props?.address1 ?? "";
          operatingTime = props?.operatingTimeCN ?? "";
        }
        else if (_locale === "it") {
          location = props?.locationName ?? "";
          howToGetThere = "Come arrivare？";
          address = props?.address1 ?? "";
          operatingTime = props?.operatingTimeCN ?? "";
        }

        console.log("operatinon TIme", props?.operatingTime);
        //  '<div style="width:220px; margin-top:3px">' + capitaliseString((result?.locationType ?? "")) + " - " + (result?.district ?? "") + '</div>'+
        var info =
          '<div style="width:220px; margin-top:3px">' +
          (props?.locationId ?? "") +
          "</div>" +
          '<div style="width:220px; margin-top:3px">' +
          props.locationType +
          " | " +
          (props?.district ?? "") +
          "</div>" +
          '<div style="width:220px; margin-top:3px">' +
          location +
          "</div>" +
          '<div style="width:220px; margin-top:3px; color: grey">' +
          address +
          "</div>" +
          '<div style="width:220px; margin-top:3px; color: grey">' +
          operatingTime +
          "</div>" +
          '<div style="width:220px; margin-top:3px; color: grey">' +
          (props?.city ?? "") +
          "</div>"; //+
        //'<a style="width:220px; margin-top:3px; ; color: grey; text-decoration: none; cursor: pointer; display: flex; align-items: flex-start">' + 'howToGetThere 89' + '<img style="width: 15px" src="./images/browse-icon-transparent.png"/></a>'

        /*  var info  =   '<div style="width:220px; margin-top:3px">' + props.locationId + '</div>' +
       '<div style="width:220px; margin-top:3px">' + location + '</div>'+
       '<div style="width:220px; margin-top:3px; color: grey">' + address + '</div>'+
       '<div style="width:220px; margin-top:3px; color: grey">' + props.operatingTime + '</div>'+
       '<div style="width:220px; margin-top:3px; color: grey">' + props.city + '</div>' +
       '<a style="width:220px; margin-top:3px; ; color: grey; text-decoration: none; cursor: pointer; display: flex; align-items: flex-start">' + howToGetThere + '<img style="width: 15px" src="./images/browse-icon-transparent.png"/></a>'*/

        // Offset the popup so it points at the middle of the marker not the tip
        popup.setOffset([0, -32]);
        popup.show(coord, info);
        // mapView.values_.center = ol.proj.fromLonLat([props.longitude,  props.latitude])
        // mapView.setZoom(18);
        callBackObject = props;
        _onSelect(callBackObject);

        let radioBtnList = document.getElementsByClassName("mapRadioBtn");
        // console.log(radioBtnList.length)
        Object.keys(radioBtnList).forEach((key, index) => {
          if (radioBtnList[key].id === feature.values_.locationId) {
            setFocus(index);
          }
        });
      }
    });

    // Add an event handler for when someone hovers over a marker
    // This changes the cursor to a pointer
    mapBox.on("pointermove", function (evt) {
      var hit = mapBox.forEachFeatureAtPixel(evt.pixel, function (
        feature,
        layer
      ) {
        return true;
      });
      if (hit) {
        this.getTargetElement().style.cursor = "pointer";
      } else {
        this.getTargetElement().style.cursor = "";
      }
    });
  }
}

const onListClick$ = fromEvent(containerParentDiv, "click").pipe(
  map((event) => {
    hidePopUp();
    const textDiv = document.getElementsByClassName("containerChildTextDiv");
    Object.keys(textDiv).forEach((key, index) => {
      textDiv[key].classList.remove("selected-background");
      if (textDiv[key].getElementsByClassName("contentCity")[0] !== undefined) {
        textDiv[key]
          .getElementsByClassName("contentCity")[0]
          .classList.remove("display-none");
      }

      if (
        textDiv[key].getElementsByClassName("contentAddress")[0] !== undefined
      ) {
        textDiv[key]
          .getElementsByClassName("contentAddress")[0]
          .classList.remove("display-block");
      }
      if (
        textDiv[key].getElementsByClassName("contentLocationType")[0] !==
        undefined
      ) {
        textDiv[key]
          .getElementsByClassName("contentLocationType")[0]
          .classList.remove("display-block");
      }
      if (
        textDiv[key].getElementsByClassName("operatingTime")[0] !== undefined
      ) {
        textDiv[key]
          .getElementsByClassName("operatingTime")[0]
          .classList.remove("display-block");
      }
      if (
        textDiv[key].getElementsByClassName("howToGetThere")[0] !== undefined
      ) {
        textDiv[key]
          .getElementsByClassName("howToGetThere")[0]
          .classList.remove("display-flex");
      }
    });

    if (
      event.srcElement.parentNode.closest(".containerChildTextDiv") !== null
    ) {
      let selectedLocationId = event.srcElement.parentNode
        .getElementsByClassName("locationName")[0]
        .innerHTML.split(" - ")[0];
      let selectedItemIndex = numberOfFilteredItems.findIndex(
        (item) => item.locationId === selectedLocationId
      );
      callBackObject = numberOfFilteredItems[selectedItemIndex];
      showPopUp(callBackObject);
      _onSelect(callBackObject);

      event.srcElement.parentNode
        .closest(".containerChildTextDiv")
        .classList.add("selected-background");
      event.srcElement.parentNode
        .getElementsByClassName("contentAddress")[0]
        .classList.add("display-block");
      if (
        event.srcElement.parentNode.getElementsByClassName(
          "operatingTime"
        )[0] !== undefined
      ) {
        event.srcElement.parentNode
          .getElementsByClassName("operatingTime")[0]
          .classList.add("display-block");
      }
      event.srcElement.parentNode
        .getElementsByClassName("howToGetThere")[0]
        .classList.add("display-flex");
      event.srcElement.parentNode
        .getElementsByClassName("contentLocationType")[0]
        .classList.add("display-block");

      //event.srcElement.parentNode.getElementsByClassName("contentCity")[0].classList.add("selected-background");
      event.srcElement.parentNode
        .getElementsByClassName("contentCity")[0]
        .classList.add("display-none");
    }
    if (event.srcElement.parentNode.className !== "containerParentTextDiv") {
      console.log("hello here i am b");
      // Special handle for clicking on no result text
      if (
        event.srcElement.parentNode.closest(".containerChildTextDiv") !==
          undefined &&
        event.srcElement.parentNode.closest(".containerChildTextDiv") !== null
      ) {
        return event.srcElement.parentNode
          .closest(".containerChildTextDiv")
          .getElementsByClassName("coords")[0].innerHTML;
      } else {
        return null;
      }
    } else {
      return null;
      /*if(event.srcElement.parentNode.getElementsByClassName("coords")[0] !== undefined && event.srcElement.parentNode.getElementsByClassName("coords")[0] !== null) {
                console.log("CCC444")
                return event.srcElement.parentNode.getElementsByClassName("coords")[0].innerHTML
            } else {
                return null
            }*/
    }
  })
);

onListClick$.subscribe({
  next: (result) => {
    if (result === null) return false;
    //format => [long, lat]
    let coordArray = result.split("-");
    let long = coordArray[0];
    let lat = coordArray[1];

    //long lat are string so convert to float first
    mapView.values_.center = ol.proj.fromLonLat([Number(long), Number(lat)]);
    //console.log("selection",Number(long))
    let features = vectorLayer.getSource().getFeatures();
    features.forEach(function (feature, index) {
      var coord = feature.getGeometry().getCoordinates();
      if (JSON.stringify(coord) === JSON.stringify(mapView.values_.center)) {
        feature.setStyle(styleRed);
      } else {
        feature.setStyle(styleOriginal);
      }
    });

    var center = mapView.getCenter()
    var resolution = mapView.getResolution()
    mapView.setCenter([center[0] + 100 * resolution, center[1] + 100 * resolution])


    mapView.setZoom(18);
    mapBox.render();
  },
});

const hidePopUp = () => {
  popup.hide();
  popup.setOffset([0, 0]);
};

const showPopUp = (result) => {
  let coordinates = ol.proj.fromLonLat([result.longitude, result.latitude]);
  let location;
  let howToGetThere;
  let address;

  var operatingTime;

  if (_locale === "en") {
    location = result?.locationEn ?? "";
    howToGetThere = "How to get there";
    address = result?.address1En ?? "";
    operatingTime = result?.displayHours ?? "";
  } else if (_locale === "zh") {
    location = result?.locationName ?? "";
    howToGetThere = "如何找到智能櫃？";
    address = result?.address1 ?? "";
    operatingTime = result?.displayHoursCN ?? "";
  }
  else if (_locale === "it") {
    location = result?.locationName ?? "";
    howToGetThere = "Come arrivare?";
    address = result?.address1 ?? "";
    operatingTime = result?.displayHoursCN ?? "";
  }
  var info =
    '<div style="width:220px; margin-top:3px">' +
    (result?.locationId ?? "") +
    "</div>" +
    '<div style="width:220px; margin-top:3px">' +
    capitaliseString(result?.locationType ?? "") +
    " | " +
    (result?.district ?? "") +
    "</div>" +
    '<div style="width:220px; margin-top:3px">' +
    location +
    "</div>" +
    '<div style="width:220px; margin-top:3px; color: grey">' +
    address +
    "</div>" +
    '<div style="width:220px; margin-top:3px; color: grey">' +
    operatingTime +
    "</div>" +
    '<div style="width:220px; margin-top:3px; color: grey">' +
    (result?.city ?? "") +
    "</div>"; //+
  //'<a style="width:220px; margin-top:3px; ; color: grey; text-decoration: none; cursor: pointer; display: flex; align-items: flex-start">' + 'howToGetThere 89' + '<img style="width: 15px" src="./images/browse-icon-transparent.png"/></a>'

  // Offset the popup so it points at the middle of the marker not the tip
  popup.setOffset([0, -32]);
  popup.show(coordinates, info);
};
