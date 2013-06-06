
dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.graphic");
dojo.require("dojo.parser");

var users_fs = "http://services1.arcgis.com/w5PNyOikLERl9lIp/arcgis/rest/services/LoveHere_Features/FeatureServer/0";
var map;
var featureLayer;
var photo;

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
    photo = data;
    var file = dataURLtoBlob(data);
    var size = file.size;

    var post_data = new FormData();
    post_data.append('uploaded_file', file);
    post_data.append('api_key','61d8293305ed46cba1efa0324c41b238');
    post_data.append('api_secret','d3f5652ac9414cf4ad6bd1fbf70ed420'); // uuuggghhhggg!!!
    post_data.append('attributes','all');

    $.ajax({
      type: "POST",
      url: "http://api.skybiometry.com/fc/faces/detect",
      data: post_data,
      processData: false,
      contentType: false,
      dataType: 'json',
    }).done(function(result)
    {
      console.log('done');
      console.log(result);

      var is_sad = false;
      var is_recognized = false;

      if( result.photos && result.photos.length > 0 )
      {
        result.photos.forEach( function(photo)
        {
          photo.tags.forEach( function(face)
          {
            $('#capture').html('¡Te hemos reconocido!')

            $("input[name='field-age']").val( face.age );

            var is_male = (face.attributes.gender.value == "male");
            setChecks(is_male);

            is_sad = (face.attributes.smiling.value == "false" );
    
            /* cuadro */
            var face_area = $('<div>');
            face_area.css('position','absolute');
            face_area.addClass('face-outline');
            face_area.css({
              'left': (face.center.x - face.width / 2.0) * photo.width / 100.0,
              'top' : (face.center.y - face.height / 2.0) * photo.height / 100.0,
              'width': face.width * photo.width / 100.0,
              'height': face.height * photo.height / 100.0});          
            $("#face-canvas").append(face_area);

            is_recognized = true;
          }); // forEach(face)
        }); // forEach(photo)
      }

      if(!is_recognized)
      {
          $('#canvas').css('opacity',0);
          $('#capture').html('¡¡Vuelve a intentarlo !!')
            .removeClass('disabled')
            .addClass('btn-default');
          $(".face-outline").remove();
      }
      else
      {
        window.setTimeout(function()
        {
          $('#canvas').css('opacity',0);
          $('#capture').html(is_sad? '¡¡ Sonrie y vuelve a intentarlo !!' : '¡¡Muy bien!!')
            .removeClass('disabled')
            .addClass('btn-default');
          $(".face-outline").remove();
        }, 2000);
      }
    });  
  };

  $("#capture").click( function(e)
  {
    e.preventDefault();
    captureAndRecognize();
  });
}

function setChecks(is_male)
{
  console.log(is_male);

  $("input[name='field-sex']").val( is_male? 'male' : 'female' );
  $("input[name='interested-in-men']").val( !is_male? 'interested-in-men-true' : 'interested-in-men-false');
  $("input[name='interested-in-women']").val( is_male? 'interested-in-women-true' : 'interested-in-women-false');

  $("input[name='field-sex']").eq(0).attr( 'checked', is_male );
  $("input[name='interested-in-men']").eq(0).attr('checked', !is_male);
  $("input[name='interested-in-women']").eq(0).attr('checked', is_male);

  checkAllToggles();
}

function addFeature(photo_url)
{  
    // var formData = $('form').serializeArray();
    // console.log(formData);
    var form = $('#register-form');
    console.log( $('#field-name').val() );
    console.log($("input[name='field-sex']").val());

    var is_male = $("input[name='field-sex']").eq(0).attr( 'checked' );
    console.log(is_male? "Hombre":"Mujer");

    var geometry = map.geographicExtent.getCenter();
    var attributes = {
      'NOMBRE': $('#field-name').val(),
      'SOBRE_TI': $('#field-aboutyou').val(),
      'EMAIL': $('#field-email').val(),
      'TELEFONO': $('#field-phone').val(),
      'SEXO': is_male? "Hombre" : "Mujer",
      'BUSCAS': !is_male? "Hombre" : "Mujer",
      'QUIERO': "Que me hagan feliz",
      'FOTO_URL': photo_url,
      'Edad': Math.floor($("#field-age").val()),
      'Nick': $("#field-nick").val()
    };

    var newfeature = new esri.Graphic( geometry, null, attributes );
    console.log(newfeature);

    featureLayer.applyEdits([newfeature],null,null, function(o)
      {
        console.log("success");
        console.log(o);
      },
      function()
      {
        console.log("error");
      }
    ); 
}


function initForm()
{
  $('#field-nick').focus();
  $('#goforit').click(function(e)
  {
    e.preventDefault();

    // subo la imagen
    var photo_url = "";
    if( photo )
    {
      $.ajax({
        type: "POST",
        url: "upload.php",
        data: { imgBase64: photo }
      }).done(function(o)
      {
        console.log('saved');
        console.log(o);
        photo_url = o.split('|')[1];
        addFeature(photo_url);
      });      
    }
    else
    {
      console.log('no-photo');
      addFeature('no-photo');
    }
  });
}

function initMap()
{
  common.localizacionActual(zoomToCurrentLocation);  

  map = new esri.Map("map", {
    basemap: "gray",
    center: [-3.9552, 40.3035],
    zoom: 5
  });

  featureLayer = new esri.layers.FeatureLayer(users_fs,{
    mode: esri.layers.FeatureLayer.MODE_ONSELECT,
    outFields: ["*"]
  });

  map.addLayer(featureLayer);

}

function zoomToCurrentLocation(location) 
{
  var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
  if( map.loaded )
    map.centerAndZoom(pt,16);
  else
    dojo.connect(map, "onLoad", function()  {  map.centerAndZoom(pt,16); });
}




(function($) {
  "use strict";

  initWebcam();
  initForm();


})(jQuery);

function initDojo()
{
    initMap();
}

dojo.ready(initDojo);