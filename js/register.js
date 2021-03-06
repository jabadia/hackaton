
dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.graphic");
dojo.require("dojo.parser");

var users_fs = "http://www.esridemos.com/arcgis/rest/services/html5mobile/LoveHere_Features/FeatureServer/0";
var map;
var featureLayer;
var photo;
var is_male = false;
var is_sad = false;

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

      is_sad = false;

      if( result.face_detection && result.face_detection.length > 0 )
      {
        $('#faces-count').html( result.face_detection.length + " caras detectadas");
        result.face_detection.forEach( function(face)
        {
          $('#capture').html('¡Te hemos reconocido!')
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

          $("input[name='field-age']").val( face.age );

          var hombre = (face.sex > 0.5)? true : false;
          setChecks(hombre);

          is_sad = (face.smile < 0.6);
  

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
        $('#capture').html(is_sad? '¿Estas triste? ... necesitas cariño' : '¡¡Bonita sonrisa ... reparte tu amor!!')
          .removeClass('disabled')
          .addClass('btn-default');
        $(".face-outline").remove();
      }, 2000);
    });  
  };

  $("#capture").click( function(e)
  {
    e.preventDefault();
    captureAndRecognize();
  });
}

function setChecks(valor)
{

  if (is_male != valor){
     is_male = !is_male;
     $("input[name='field-sex']").eq(0).attr('checked', is_male);
     $("input[name='field-sex']").eq(1).attr('checked', !is_male);
  }

  $("input[name='interested-in-men']").eq(0).attr('checked', !is_male);
  $("input[name='interested-in-women']").eq(0).attr('checked', is_male);

  checkAllToggles();
}

function addFeature(photo_url)
{  
    // var formData = $('form').serializeArray();
    // console.log(formData);
    var form = $('#register-form');
    //var is_male = $("input[name='field-sex']:checked").eq(0).val();
    
    var interest_male = ($("input[name='interested-in-men']:checked").val() === "true");
    var interest_female = ($("input[name='interested-in-women']:checked").val() === "true");
    
    var fld_busco = "";
    
    if (interest_female)  {
      if (interest_male) {
        fld_busco = "Todo";
      } else {
        fld_busco = "Mujer";
      }
    } else {
      if (interest_male) {
        fld_busco = "Hombre";
      }      
    }

    
    var geometry = map.geographicExtent.getCenter();
    var attributes = {
      'NOMBRE': $('#field-name').val(),
      'SOBRE_TI': $('#field-aboutyou').val(),
      'EMAIL': $('#field-email').val(),
      'TELEFONO': $('#field-phone').val(),
      'SEXO': is_male?"Hombre":"Mujer",
      'BUSCAS': fld_busco,
      'QUIERO': is_sad?"Que me hagan feliz":"Hacer feliz",
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
  

  $("input[name='field-sex']").click(
      function(){
           is_male = !is_male;
          $("input[name='field-sex']").eq(0).attr('checked', !is_male);
          $("input[name='field-sex']").eq(1).attr('checked', is_male);
          checkAllToggles();  
      }
  );


  //$("input[name='field-sex']").prop("checked",false).trigger("change");

})(jQuery);

function initDojo()
{
    initMap();
}




dojo.ready(initDojo);