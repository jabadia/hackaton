dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query")
dojo.require("esri.tasks.geometry");

dojo.require("dojo.parser");
dojo.require("esri.dijit.BasemapGallery");

var map;
var graphic;
var currLocation;
var ptAct;
var featureLayer;
var lyrGraphicSelect;


$("#localizar").click(function() {
	localizacionActual();
});

$("#buscar").click(function() {
	bufferizar();
});

$("#adedo").click(function() {
	activarClickOnMap();
});

function init() {
	map = new esri.Map("map",{
		basemap:"streets",
		center:[-71.121865, 42.370011],
		zoom:13,
		sliderStyle:"small"
	});

	lyrGraphicSelect = new esri.layers.GraphicsLayer();
	map.addLayer(lyrGraphicSelect);

	var infoTemplate = new esri.InfoTemplate("${NOMBRE}", '<img src="${FOTO_URL}" alt="${SOBRE_TI}" height="42" width="42">');

	featureLayer = new esri.layers.FeatureLayer("http://services1.arcgis.com/w5PNyOikLERl9lIp/arcgis/rest/services/LoveHere_Features/FeatureServer/0",{
		mode: esri.layers.FeatureLayer.MODE_ONSELECT,
		outFields: ["*"],
		infoTemplate: infoTemplate
	});

	map.addLayer(featureLayer);
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
			activarClickOnMap();
			break;
		
		case error.POSITION_UNAVAILABLE:
			alert("Localización no disponible");
			activarClickOnMap();
			break;

		case error.TIMEOUT:
			alert("Finalizado el tiempo de espera");
			activarClickOnMap();
			break;

		default:
			alert("Error desconocido");
			activarClickOnMap();
			break;
	}
}

function activarClickOnMap() {
	var handle = dojo.connect(map, "onClick", function(evt) {
		map.graphics.clear();
		map.infoWindow.hide();
		var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(evt.mapPoint));
		addGraphic(pt);
		map.centerAndZoom(pt, 12);
		ptAct=pt;
		dojo.disconnect(handle);
	});
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
	lyrGraphicSelect.clear();
	if (ptAct== undefined) {
		localizacionActual();
	} else {

	var geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
		var params = new esri.tasks.BufferParameters();
		params.geometries = [ ptAct ];

		//buffer in linear units such as meters, km, miles etc.
		params.distances = [5];
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
		lyrGraphicSelect.add(graphic);
		queryElement(geometry);
	});
}		

function queryElement(bufferGeometry) {
	//query =  "http://services1.arcgis.com/w5PNyOikLERl9lIp/arcgis/rest/services/LoveHere_Features/FeatureServer";

	/*featureLayer.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(results){

    });*/

	/*var strQuery = "";
	if SEXO == "Hombre"*/ 

	var queryTask = new esri.tasks.QueryTask(userConfig.datosParoURL);		
	var query = new esri.tasks.Query();		
	query.returnGeometry = true;
	query.where = 'SEXO = ' + $("input[name='field-sex']").attr('value') + ' AND QUIERO = ' + $("input[name='field-quiero']").attr('value') ;		
	query.outFields = ["*"];
	query.geometry = bufferGeometry;
	queryTask.execute(query, showResultsInfo, error_showResultsInfo);

}

function showResultsInfo(featureSet) {
	//remove all graphics on the maps graphics layer
	lyrGraphicSelect.clear();

	if( featureSet.features.length > 0)
	{
		var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2);
		dojo.forEach(featureSet.features,function(feature) {
			var graphic = feature;
			graphic.setSymbol(symbol);
			lyrGraphicSelect.add(graphic);
			
		});
	}
}

function error_showResultsInfo(featureSet) {
	// algún error
}

dojo.ready(init);