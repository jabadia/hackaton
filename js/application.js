(function($) {
  "use strict";

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
    $.ajax({
      type: "POST",
      url: "upload.php",
      data: { imgBase64: data }
    }).done(function(o)
    {
      console.log('saved');
      console.log(o);
    });
  });

})(jQuery);