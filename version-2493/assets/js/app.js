(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './search.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  function normalize(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function filterWithin(scope, query) {
    var text = normalize(query);
    scope.querySelectorAll('.movie-card').forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search') || card.textContent);
      card.classList.toggle('is-filtered-out', text && haystack.indexOf(text) === -1);
    });
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (input) {
    var section = input.closest('main') || document;
    var scope = section.querySelector('[data-filter-scope]') || section;
    input.addEventListener('input', function () {
      filterWithin(scope, input.value);
    });
  });

  var searchPageInput = document.querySelector('[data-search-page-input]');
  if (searchPageInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchPageInput.value = query;
    var searchScope = document.querySelector('[data-filter-scope]') || document;
    filterWithin(searchScope, query);
    searchPageInput.addEventListener('input', function () {
      filterWithin(searchScope, searchPageInput.value);
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(nextSlide, 5600);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  document.querySelectorAll('.movie-player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-layer');
    var url = video ? video.getAttribute('data-video-url') : '';
    var loaded = false;
    var hls = null;

    function setPlaying(isPlaying) {
      player.classList.toggle('is-playing', isPlaying);
      if (button) {
        button.classList.toggle('is-hidden', isPlaying);
      }
    }

    function attach() {
      if (!video || !url || loaded) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = url;
      } else {
        video.src = url;
      }

      loaded = true;
    }

    function play() {
      attach();
      if (!video) {
        return;
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        setPlaying(true);
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          setPlaying(false);
        }
      });

      video.addEventListener('ended', function () {
        setPlaying(false);
      });

      player.addEventListener('click', function (event) {
        if (event.target && event.target.closest && event.target.closest('video')) {
          return;
        }
        play();
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
