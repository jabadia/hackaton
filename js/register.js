
dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("dojo.parser");

var users_fs = "http://services1.arcgis.com/w5PNyOikLERl9lIp/arcgis/rest/services/LoveHere_Features/FeatureServer";
var map = null;

function initWebcam()
{ 
  var canvas = $('#canvas').get(0);
  console.log(canvas);
  var context = canvas.getContext("2d");
  var video = $('#video').get(0);
  var videoProperties = { "video": true };
  var errBack = function(error) {
    console.log("Video capture error: ", error.code);
  }

  if(navigator.getUserMedia)
  {
    navigator.getUserMedia(videoProperties, function(stream)
    {
      video.src = stream;
      video.play();
    }, errBack);
  } 
  else if (navigator.webkitGetUserMedia)
  {
    navigator.webkitGetUserMedia(videoProperties, function(stream)
    {
      video.src = window.webkitURL.createObjectURL(stream);
      video.play();
    }, errBack);
  }

  function dataURLtoBlob(dataUrl) 
  {
    // Decode the dataURL    
    var binary = atob(dataUrl.split(',')[1]);

    // Create 8-bit unsigned array
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    // Return our Blob object
    return new Blob([new Uint8Array(array)], {
      type: 'image/png'
    });
  }

  function captureAndRecognize()
  {
    $(".face-outline").remove();

    $('#capture').html('reconociendo tu cara')
      .addClass('disabled')
      .removeClass('btn-default');


    context.drawImage(video,0,0,300,220);
    $('#canvas').css('opacity',1);
    var data = canvas.toDataURL();
    var file = dataURLtoBlob(data);
    var size = file.size;

    var post_data = new FormData();
    post_data.append('uploaded_file', file);
    post_data.append('api_key',1234);
    post_data.append('api_secret',5678);
    post_data.append('jobs','face_part_emotion_gender_age');
    post_data.append('name_space','default');
    post_data.append('user_id','default');

    $.ajax({
      type: "POST",
      url: "http://rekognition.com/func/api/",
      data: post_data,
      processData: false,
      contentType: false,
      dataType: 'json',
    }).done(function(result)
    {
      console.log('done');
      console.log(result);

      if( result.face_detection && result.face_detection.length > 0 )
      {
        $('#faces-count').html( result.face_detection.length + " caras detectadas");
        result.face_detection.forEach( function(face)
        {
          /*
          var li = $('<li>');
          li.append( (face.sex? "Hombre": "Mujer") + "<br />");
          if( face.smile < 0.35 )
            li.append( "Serio" );
          else if( face.smile < 0.85 )
            li.append( "Neutral" );
          else
            li.append("Sonriente");
          $("#faces").append(li);
          */
          if( face.sex > 0.5 )
          {

          }

          /* cuadro */
          var face_area = $('<div>');
          face_area.css('position','absolute');
          face_area.addClass('face-outline');
          face_area.css({
            'left': face.boundingbox.tl.x,
            'top' : face.boundingbox.tl.y,
            'width': face.boundingbox.size.width,
            'height': face.boundingbox.size.height});          
          $("#face-canvas").append(face_area);
        });
      }

      window.setTimeout(function()
      {
        $('#canvas').css('opacity',0);
        $('#capture').html('¿Quieres probar de nuevo?')
          .removeClass('disabled')
          .addClass('btn-default');
        $(".face-outline").remove();
      }, 1000);
    });  
  };

  $("#capture").click( function(e)
  {
    e.preventDefault();
    captureAndRecognize();
  });
}

function initForm()
{
  $('#field-name').focus();
}

function initMap()
{
  common.localizacionActual(zoomToCurrentLocation);  

  map = new esri.Map("map", {
    basemap: "streets",
    center: [-3.9552, 40.3035],
    zoom: 5
  });
}

function zoomToCurrentLocation(location) 
{
  var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
  userLocation = pt;
  if( map.loaded )
    map.centerAndZoom(pt,12);
  else
    dojo.connect(map, "onLoad", function()  {  map.centerAndZoom(pt,14); });

  /*
  addGraphic(pt);
  map.centerAndZoom(pt, 12);
  ptAct=pt;
  */
}


(function($) {
  "use strict";

  //initWebcam();
  initForm();


})(jQuery);

function initDojo()
{
    initMap();
}

dojo.ready(initDojo);