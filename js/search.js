
function orientationChanged() {
        if(map){
          map.reposition();
          map.resize();
        }
}

function initFunc(map) {
       dojo.connect(window, 'resize', map,map.resize);
        if(navigator.geolocation){  
          navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
          watchId = navigator.geolocation.watchPosition(showLocation, locationError);
        }
        else{
          alert("Browser doesn't support Geolocation. Visit http://caniuse.com to discover browser support for the Geolocation API.");
        }
      }

function locationError(error) {
        //error occurred so stop watchPosition
        if(navigator.geolocation){
          navigator.geolocation.clearWatch(watchId);
        }
        switch (error.code) {
        case error.PERMISSION_DENIED:
          alert("Location not provided");
          break;

        case error.POSITION_UNAVAILABLE:
          alert("Current location not available");
          break;

        case error.TIMEOUT:
          alert("Timeout");
          break;

        default:
          alert("unknown error");
          break;
        }
      }

function zoomToLocation(location) {
        var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
        addGraphic(pt);    
        map.centerAndZoom(pt, 12);
      }

function showLocation(location) {
        //zoom to the users location and add a graphic
        var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
        if (!graphic) {
          addGraphic(pt);
        }
        else { //move the graphic if it already exists
          graphic.setGeometry(pt);
        }
        map.centerAt(pt);
}
      
function addGraphic(pt){
	var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, 
          new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
          new dojo.Color([210, 105, 30, 0.5]), 8), 
          new dojo.Color([210, 105, 30, 0.9])
        );
        graphic = new esri.Graphic(pt, symbol);
        map.graphics.add(graphic);
}