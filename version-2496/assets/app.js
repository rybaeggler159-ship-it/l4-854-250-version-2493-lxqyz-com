(function () {
    const body = document.body;
    const menuButton = document.querySelector('.menu-toggle');

    if (menuButton) {
        menuButton.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let index = 0;
        let timer = null;

        const showSlide = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(nextIndex);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get('q') || '';
    const searchInput = document.querySelector('.movie-search');

    if (searchInput && queryValue) {
        searchInput.value = queryValue;
    }

    const cardNodes = Array.from(document.querySelectorAll('.movie-card'));
    const filterControls = Array.from(document.querySelectorAll('.movie-filter'));
    const emptyState = document.querySelector('.empty-state');

    const normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    const collectText = function (card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-keywords'),
            card.textContent
        ].join(' '));
    };

    const applyFilters = function () {
        if (!cardNodes.length) {
            return;
        }

        const keyword = normalize(searchInput ? searchInput.value : '');
        const filters = {};

        filterControls.forEach(function (control) {
            const key = control.getAttribute('data-filter');
            filters[key] = normalize(control.value);
        });

        let visible = 0;

        cardNodes.forEach(function (card) {
            const haystack = collectText(card);
            let matched = !keyword || haystack.indexOf(keyword) !== -1;

            Object.keys(filters).forEach(function (key) {
                const value = filters[key];
                if (value && normalize(card.getAttribute('data-' + key)).indexOf(value) === -1) {
                    matched = false;
                }
            });

            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterControls.forEach(function (control) {
        control.addEventListener('change', applyFilters);
    });

    if (cardNodes.length) {
        applyFilters();
    }

    const playerShells = Array.from(document.querySelectorAll('.player-shell'));

    playerShells.forEach(function (shell) {
        const video = shell.querySelector('video');
        const button = shell.querySelector('.player-button');
        const streamUrl = shell.getAttribute('data-stream');
        let ready = false;
        let hls = null;

        const markPlaying = function () {
            shell.classList.add('is-playing');
        };

        const requestPlay = function () {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(markPlaying).catch(function () {
                    shell.classList.remove('is-playing');
                });
            } else {
                markPlaying();
            }
        };

        const attachStream = function () {
            if (ready || !streamUrl || !video) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', requestPlay, { once: true });
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
            } else {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', requestPlay, { once: true });
                video.load();
            }

            ready = true;
        };

        const start = function (event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            attachStream();
            requestPlay();
        };

        if (button) {
            button.addEventListener('click', start);
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            start(event);
        });

        video.addEventListener('playing', markPlaying);
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
