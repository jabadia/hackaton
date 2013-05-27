(function($) {
  "use strict";


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

  $("#snap").click( function()
  {
    context.drawImage(video,0,0,320,240);
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
    }).done(function(o)
    {
      console.log('done');
      var result = JSON.parse(o);
      console.log(result);
    });
  });

})(jQuery);