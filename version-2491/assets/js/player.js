(function () {
    const video = document.querySelector('.video-player[data-stream]');
    if (!video) {
        return;
    }

    const stream = video.getAttribute('data-stream');
    const overlay = document.querySelector('.player-overlay');
    const Hls = window.Hls;

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
    }

    const playVideo = function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
}());
