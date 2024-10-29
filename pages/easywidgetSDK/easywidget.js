//init variables
let _mapBoxClassName,
  _defaultLocation,
  _mapType,
  _locale,
  _mode,
  _filterCriteria,
  _key,
  _onSelect,
  _userAuthObject,
  _withSearchBar;
let baseURL;

//let completeResultArray = [];

let word_press_path = scriptParams.path;

//initialise widget
var easyWidget =
  easyWidget ||
  (function () {
    return {
      init: function (obj) {
        let {
          mapType,
          locale,
          defaultLocation,
          mapBoxClassName,
          mode,
          filter,
          apiKey,
          onSelect,
          userAuthObject,
          searchBar,
        } = obj;
        //set variable names
        _mapBoxClassName = mapBoxClassName || "mapBox";
        _defaultLocation = defaultLocation || "IT";
        _mapType = mapType || "osm";
        _locale = locale || "it";
        _mode = mode || "basic";
        _filterCriteria = filter || null;
        _key = apiKey || "";
        _onSelect = onSelect;
        // _onSelectionCloseModal = onSelectionCloseModal
        _userAuthObject = userAuthObject || null;
        _withSearchBar = searchBar || false;

        onLoadComplete();
        console.log("hello inside here obj is ", obj);
      },
      changeLanguage: function (lang) {
        localStorage.setItem("language", lang);
        let script = document.getElementsByTagName("script");
        console.log(script, typeof script);
      },
      reset: function (obj) {
        let { filter } = obj;
        //set variable names
        console.log("inside filter", filter);
        _filterCriteria = filter || null;

        onLoadUpdate();
        //onLoadComplete();
      },
    };
  })();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//loadscripts
async function loadScripts(scriptURL, obj) {
  await new Promise(function (resolve, reject) {
    var link = document.createElement("script");

    link.src = scriptURL;
    link.id = scriptURL;
    Object.assign(link, obj);
    document.body.appendChild(link);

    link.onload = function () {
      resolve();
    };
  });
}

async function LoadCSS(cssURL) {
  // 'cssURL' is the stylesheet's URL, i.e. /css/styles.css

  await new Promise(function (resolve, reject) {
    var link = document.createElement("link");

    link.rel = "stylesheet";

    link.href = cssURL;

    document.head.appendChild(link);

    link.onload = function () {
      resolve();

      console.log("CSS has loaded!");
    };
  });
}

function removejscssfile(filename, filetype) {
  var targetelement =
    filetype == "js" ? "script" : filetype == "css" ? "link" : "none"; //determine element type to create nodelist from
  var targetattr =
    filetype == "js" ? "src" : filetype == "css" ? "href" : "none"; //determine corresponding attribute to test for
  var allsuspects = document.getElementsByTagName(targetelement);
  for (var i = allsuspects.length; i >= 0; i--) {
    //search backwards within nodelist for matching elements to remove
    if (
      allsuspects[i] &&
      allsuspects[i].getAttribute(targetattr) != null &&
      allsuspects[i].getAttribute(targetattr).indexOf(filename) != -1
    )
      allsuspects[i].parentNode.removeChild(allsuspects[i]); //remove element by calling parentNode.removeChild()
  }
}

async function onLoadComplete() {
  //add search bar
  let mapBarWrapper = document.createElement("div");
  mapBarWrapper.className = "mapBarWrapper";
  mapBarWrapper.id = "mapBarWrapper";
  document.body.appendChild(mapBarWrapper);

  console.log(Date.now().toString());
  await loadScripts(
    word_press_path + "pages/easywidgetSDK/lib/string-similarity.min.js?" +
    Date.now().toString()
  );
  await loadScripts( word_press_path + "pages/easywidgetSDK/lib/rxjs.umd.min.js?" +
  Date.now().toString())
  await loadScripts(
    word_press_path + "pages/easywidgetSDK/lib/lodash.core.min.js?" +
    Date.now().toString()
  );
  await loadScripts( word_press_path + "pages/easywidgetSDK/lib/mapbox-gl.js?" +
  Date.now().toString());
  await LoadCSS(word_press_path + "pages/easywidgetSDK/styles/mapbox-gl.css?" +
  Date.now().toString());

  //internal scripts
  await loadScripts(
    word_press_path +
      "pages/easywidgetSDK/lib/constants.js?" +
      Date.now().toString()
  );

  await loadScripts(
    word_press_path +
      "pages/easywidgetSDK/lib/ol_v5.2.0.js?" +
      Date.now().toString()
  ); //load first
  await loadScripts(
    word_press_path + "pages/easywidgetSDK/lib/olms.js?" + Date.now().toString()
  );
  await loadScripts(
    word_press_path +
      "pages/easywidgetSDK/lib/ol-popup.js?" +
      Date.now().toString()
  );
  await loadScripts(
    word_press_path +
      "pages/easywidgetSDK/lib/stringBuilder.js?" +
      Date.now().toString()
  );
  await loadScripts(
    word_press_path +
      "pages/easywidgetSDK/lib/createHTMLElement.js?" +
      Date.now().toString()
  );
  await loadScripts(
    word_press_path +
      "pages/easywidgetSDK/service/paths.js?" +
      Date.now().toString()
  );
  await loadScripts(
    word_press_path +
      "pages/easywidgetSDK/service/apiservice.js?" +
      Date.now().toString()
  );

  //load stylesheet
  await LoadCSS(
    word_press_path +
      "pages/easywidgetSDK/styles/styles.css?" +
      Date.now().toString()
  );

  switch (_defaultLocation) {
    case "HK":
      baseURL = locationConstant.HK.urlProd;
      break;
    case "AU":
      baseURL = locationConstant.AU.urlProd;
      break;
    case "IT":
      baseURL = locationConstant.IT.urlProd;
    break;
  }

  //_mapType = "osm";
  switch (_mapType) {
    case "osm":
      await loadScripts(
        word_press_path +
          "pages/easywidgetSDK/components/osm-map-merge.js?" +
          Date.now().toString()
      );
      break;
    case "gmap":
      await loadScripts(
        word_press_path + "pages/easywidgetSDK/components/google-map-merge.js"
      );
      await loadScripts(
        "https://polyfill.io/v3/polyfill.min.js?features=default"
      );
      await loadScripts(
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyDClncaGv1LsWxOUd6JJQ4ZOhQcFLnsK4k&callback=initMap&libraries=&v=weekly"
      );
      // await loadScripts('./easywidgetSDK/components/google-map.js')
      break;
  }
}

async function onLoadUpdate() {
  document.getElementsByClassName("containerParentTextDiv")[0].innerHTML = "";
  document.getElementsByClassName("mapFiltersWrapper")[0].innerHTML = "";
  vectorLayer.getSource().clear();
  //document.getElementsByClassName("mapBox")[0].innerHTML = "";
  refreshData();
}
