(function() {
  var width = 320;
  var height = 0;
  var streaming = false;
  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var filters = ["blur", "brightness", "contrast", "drop-shadow", "grayscale", "hue-rotate", "invert", "opacity", "saturate", "sepia"];
  var degreeUnitFilters = new Set(["hue-rotate"]);
  var pixelUnitFilters = new Set(["blur", "drop-shadow", "offset-x", "offset-y", "blur-radius", "spread-radius"]);
  var percentileUnitFilters = new Set(["blur", "contrast", "grayscale", "invert", "opacity", "saturate", "sepia"]);

  function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.log("An error occured! " + err);
    });

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startbutton.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
    }, false);

    clearphoto();

    document.querySelectorAll("#controls input[type='range']").forEach(function(element){
      var video = document.getElementById("video");
      var checkbox = element.parentNode.querySelector("input[type='checkbox']");
      // var classes = video.className.split(" ")

      checkbox.onchange = function(e) {
        var classes;
        if(checkbox.checked){
          // video.classList.remove(element.name)
          classes = Array.from(video.classList).reduce(function(filters,filter) {
              if(element.name != filter) {
                filters.push(element.name);
              }
              return filters;
            }, []);
          video.className = classes.join(" ");
        } else {
          // video.classList.add(element.name)
          classes = new Set(video.classList)
          classes.delete(element.name)
          classes = Array.from(classes)
        }
        video.className = classes.join(" ")

        applyFilter(video, null);
      };

      element.onchange = function(e) {
        var id = element.name + "Output"
        document.getElementById(id).innerText= e.target.value;
        checkbox.checked = true;
        applyFilter(video, element.name);
      };
    });
  }

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }

  function takepicture() {
    var context = canvas.getContext('2d');
    var video = document.getElementById("video")

    if (width && height) {
      canvas.width = width;
      canvas.height = height;

      var filters = Array.from(video.classList).map(_applyFilter);

      context.filter = filters.join(" ");
      context.drawImage(video, 0, 0, width, height);
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    } else {
      clearphoto();
    }
  }

  window.addEventListener('load', startup, false);

  var _applyFilter = function(filterName) {
    var elem = document.getElementsByName(filterName)[0]
    var filterValue = (elem != null) ? elem.value : 0;
    var suffix = "%";
    if(degreeUnitFilters.has(filterName)) suffix = "deg"
    if(pixelUnitFilters.has(filterName)) suffix = "px"

    var filterString = filterName + "(" + filterValue + suffix + ")";
    return filterString;
  }

  var applyFilter = function(videoElement, filter) {
    var filters = [];
    if(filter) videoElement.classList.add(filter);
    filters = Array.from(videoElement.classList).map(_applyFilter);
    videoElement.style.setProperty('filter', filters.join(" "))
  }
})();
