(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (frame) {
      var video = frame.querySelector('video');
      var overlay = frame.querySelector('.play-overlay');
      if (!video) {
        return;
      }

      var source = video.getAttribute('src');
      var hls = null;
      if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (source && window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      }

      function begin() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', begin);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          begin();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (overlay && !video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });

      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
