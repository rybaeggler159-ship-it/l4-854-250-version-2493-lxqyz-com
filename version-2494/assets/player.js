(function () {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var message = document.querySelector('[data-player-message]');
  var hls = null;
  var ready = false;

  if (!video || !overlay) {
    return;
  }

  var stream = video.getAttribute('data-stream');

  var showMessage = function (text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add('show');
  };

  var setupPlayer = function () {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      ready = true;
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage('暂时无法播放，请稍后再试。');
        }
      });
      return;
    }

    showMessage('暂时无法播放，请稍后再试。');
  };

  var startPlay = function () {
    setupPlayer();
    overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();

    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  };

  overlay.addEventListener('click', startPlay);

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
