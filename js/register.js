"use strict";

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
          var li = $('<li>');
          li.append( (face.sex? "Hombre": "Mujer") + "<br />");
          if( face.smile < 0.35 )
            li.append( "Serio" );
          else if( face.smile < 0.85 )
            li.append( "Neutral" );
          else
            li.append("Sonriente");
          $("#faces").append(li);

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
}

(function($) {
  "use strict";

  initWebcam();
  initForm();


})(jQuery);