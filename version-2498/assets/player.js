(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var trigger = document.querySelector("[data-play-trigger]");
    var playlist = window.videoPlaylist;
    var loaded = false;
    var hlsInstance = null;

    function loadAndPlay() {
      if (!video || !playlist) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playlist;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(playlist);
          hlsInstance.attachMedia(video);
        } else {
          video.src = playlist;
        }
        loaded = true;
      }

      if (trigger) {
        trigger.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (trigger) {
            trigger.classList.remove("is-hidden");
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", loadAndPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          loadAndPlay();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
