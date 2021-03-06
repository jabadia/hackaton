dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query")
dojo.require("esri.tasks.geometry");

dojo.require("dojo.parser");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("esri.dijit.PopupMobile");


var map;
var graphic;
var currLocation;
var ptAct;
var featureLayer;
var lyrGraphicSelect;
var is_male=true;
var is_dar=true;




function init() {

	var popup = new esri.dijit.PopupMobile(null, dojo.create("div"));
	map = new esri.Map("map",{
		basemap: "streets", 
		center: [-3.9552, 40.3035],
    	zoom: 5,
    	infoWindow:popup
	});

	lyrGraphicSelect = new esri.layers.GraphicsLayer();
	map.addLayer(lyrGraphicSelect);

	var infoTemplate = new esri.InfoTemplate("${NOMBRE}", 'Soy ${SEXO} Busco ${BUSCAS} y quiero ${QUIERO} <BR> <img src="${FOTO_URL}" alt="${SOBRE_TI}" >');

	featureLayer = new esri.layers.FeatureLayer("http://www.esridemos.com/arcgis/rest/services/html5mobile/LoveHere_Features/FeatureServer/0",{
		mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
		outFields: ["*"],
		infoTemplate: infoTemplate
	});

	map.addLayer(featureLayer);

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
			alert("Sin permisos de localización - selecciona un punto en el mapa");
			activarClickOnMap();
			break;
		
		case error.POSITION_UNAVAILABLE:
			alert("Localización no disponible - selecciona un punto en el mapa");
			activarClickOnMap();
			break;

		case error.TIMEOUT:
			alert("Finalizado el tiempo de espera - selecciona un punto en el mapa");
			activarClickOnMap();
			break;

		default:
			alert("Error desconocido - selecciona un punto en el mapa");
			activarClickOnMap();
			break;
	}
}

function activarClickOnMap() {
	var handle = dojo.connect(map, "onClick", function(evt) {
		lyrGraphicSelect.clear();
		map.graphics.clear();
		map.infoWindow.hide();
		var pt = evt.mapPoint;
		addGraphic(pt);
		map.centerAndZoom(pt, 17);
		ptAct=pt;
		dojo.disconnect(handle);
	});
}


function zoomToLocation(location) {
	var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
	addGraphic(pt);
	map.centerAndZoom(pt, 17);
	ptAct=pt;
}


function addGraphic(pt){
	var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, 
	new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
		new dojo.Color([210, 105, 30, 0.5]), 8), 
		new dojo.Color([210, 105, 30, 0.9])
	);
	graphic = new esri.Graphic(pt, symbol);
	lyrGraphicSelect.add(graphic);

}

function bufferizar(){
	//define input buffer parameters
	lyrGraphicSelect.clear();
	if (ptAct== undefined) {
		localizacionActual();
	} else {
	addGraphic(ptAct);
	var geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
		var params = new esri.tasks.BufferParameters();
		params.geometries = [ ptAct ];
		var valorBuff =$("input[name='distanciaBuffer']").attr('value');
		params.distances = JSON.parse("[" + valorBuff + "]");
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
		map.setExtent(geometry.getExtent());
	});
}		

function queryElement(bufferGeometry) {
	var geom = new esri.geometry.Polygon(bufferGeometry);
	var queryTask = new esri.tasks.QueryTask("http://www.esridemos.com/arcgis/rest/services/html5mobile/LoveHere_Features/FeatureServer/0");	
	var query = new esri.tasks.Query();		
	query.returnGeometry = true;
	var form = $('#search-form');
	var strS =  is_male?"Hombre":"Mujer"; 
	var strQ =  !is_dar?"Hacer feliz":"Que me hagan feliz"; 
	var str = " SEXO = '" +  strS + "'";
	str = str + " AND QUIERO = '" + strQ + "'";
	
	query.where = str;
	console.log(query.where);
	query.outFields = ["*"];
	query.geometry = geom;
	queryTask.execute(query, showResultsInfo, error_showResultsInfo);
}

function showResultsInfo(featureSet) {
	//remove all graphics on the maps graphics layer

	var markerSymbol  = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 30,   new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,    new dojo.Color([255,0,0]), 1),   new dojo.Color([0,255,0,0.25]));
	if( featureSet.features.length > 0)
	{
		dojo.forEach(featureSet.features,function(feature) {
			var graphic = new esri.Graphic(feature.geometry);
			var graphic = feature;
            graphic.setSymbol(markerSymbol);
			lyrGraphicSelect.add(graphic);

		});
	} else {
		alert("Sin coincidencias.");
	}
}

function error_showResultsInfo(featureSet) {
	// algún error
	alert("error en query");
}


$(document).ready(function() {
 // executes when HTML-Document is loaded and DOM is ready
	jqueryLoaded = true;

	$("#localizar").click(function() {
		localizacionActual();
	});

	$("#buscar").click(function() {
		bufferizar();
	});

	$("#adedo").click(function() {
		activarClickOnMap();
	});

	$("input[name='field-sex']").click(
      function(){
           is_male = !is_male;  
      }
  	);
  	$("input[name='field-sex']").prop("checked",false).trigger("change");

	$("input[name='field-quiero']").click(
      function(){
           is_dar = !is_dar;  
      }
  	);
  	$("input[name='field-quiero']").prop("checked",false).trigger("change");


	dojo.ready(init);

});