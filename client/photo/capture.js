/**
 * Based on MDN Web Docs tutorial
 * https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
 */
(function() {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  let width = 320;    // We will scale the photo width to this
  let height = 0;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  let streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  let video = null;
  let canvas = null;
  let photo = null;

  /**
   * The startup() function is run when the page has finished loading.
   * This function's job is to request access to the user's webcam,
   * initialize the output <img> to a default state, and to establish the event
   * listeners needed to receive each frame of video from the camera and react
   * when the button is clicked to capture an image.
   */
  function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');

    navigator.getMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );

    video.addEventListener('canplay', function(ev) {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4/3);
        }

        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    window.setInterval(function() {
      takepicture();
      uploadpicture();
    }, 10000);

    clearphoto();
  }

  /**
   * Fill the photo with an indication that none has been captured.
   *
   * Clearing the photo box involves creating an image, then
   * converting it into a format usable by the <img> element that displays
   * the most recently captured frame.
   */
  function clearphoto() {
    const context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }

  /**
   * Capture the currently displayed video frame, convert it into a PNG file,
   * and display it in the captured frame box.
   *
   * Capture a photo by fetching the current contents of the video
   * and drawing it into a canvas, then converting that to a PNG
   * format data URL. By drawing it on an offscreen canvas and then
   * drawing that to the screen, we can change its size and/or apply
   * other changes before drawing it.
   */
  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {  // There is potentially valid image data
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    } else {
      clearphoto();
    }
  }

  /**
   * Upload picture on canvas to AWS S3.
   */
  function uploadpicture() {
    canvas.toBlob(function(blob) {
      const filename = Date.now().toString();
      s3.upload({
        Key: filename,
        Body: blob,
        ACL: 'public-read',
      }, function(err, data) {
        if (err) {
          return console.log('There was an error uploading your photo: ', err.message);
        }
        return console.log('Photo uploaded.');
      });
    });
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();
