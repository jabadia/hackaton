dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query")
dojo.require("esri.tasks.geometry");
dojo.require("esri.layers.FeatureLayer");
dojo.require("dojo.parser");
dojo.require("esri.dijit.BasemapGallery");

var map;
var graphic;
var currLocation;
var watchId;
var ptAct;


$("#localizar").click(function() {
	localizacionActual();
});

$("#buscar").click(function() {
	bufferizar();
});

function init() {
	map = new esri.Map("map",{
		basemap:"streets",
		center:[-71.121865, 42.370011],
		zoom:13,
		sliderStyle:"small"
	});

	/*var basemapGallery = new esri.dijit.BasemapGallery({
		showArcGISBasemaps: true,
		map: map
	}, "basemapGallery");
	basemapGallery.startup();*/

}


function localizacionActual() {
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
	} else {
		alert("Este navegado no soporta la Geolocation.");
	}
}

 function locationError(error) {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			alert("Sin permisos de localización");
			break;
		
		case error.POSITION_UNAVAILABLE:
			alert("Localización no disponible");
			break;

		case error.TIMEOUT:
			alert("Finalizado el tiempo de espera");
			break;

		default:
			alert("Error desconocido");
			break;
	}
}

function zoomToLocation(location) {
	var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
	addGraphic(pt);
	map.centerAndZoom(pt, 12);
	ptAct=pt;
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

function bufferizar(){
	//define input buffer parameters
	if (ptAct== "undefined") {
		localizacionActual();
	} else {

	var geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
		var params = new esri.tasks.BufferParameters();
		params.geometries = [ ptAct ];

		//buffer in linear units such as meters, km, miles etc.
		params.distances = [ 5];
		params.unit = esri.tasks.GeometryService.UNIT_KILOMETER;
		params.outSpatialReference = map.spatialReference;
		geometryService.buffer(params, showBuffer);
	}
}

function showBuffer(geometries) {
	var symbol = new esri.symbol.SimpleFillSymbol(
		esri.symbol.SimpleFillSymbol.STYLE_SOLID,
		new esri.symbol.SimpleLineSymbol(
		esri.symbol.SimpleLineSymbol.STYLE_SOLID,
		new dojo.Color([0,0,255,0.65]), 2
		),
		new dojo.Color([0,0,255,0.35])
	);

	dojo.forEach(geometries, function(geometry) {
		var graphic = new esri.Graphic(geometry,symbol);
		map.graphics.add(graphic);
	});
}		


dojo.ready(init);