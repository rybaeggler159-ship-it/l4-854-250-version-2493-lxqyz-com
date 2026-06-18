(function () {
  'use strict';

  var rootPrefix = document.body ? document.body.getAttribute('data-root-prefix') || '' : '';
  var movieIndex = window.MOVIE_INDEX || [];

  function withPrefix(path) {
    if (!path) {
      return rootPrefix;
    }

    if (/^https?:\/\//i.test(path) || path.charAt(0) === '#') {
      return path;
    }

    return rootPrefix + path;
  }

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupHeader() {
    var searchToggle = $('[data-search-toggle]');
    var searchPanel = $('[data-search-panel]');
    var searchInput = $('[data-global-search]');
    var resultsBox = $('[data-global-search-results]');
    var menuToggle = $('[data-menu-toggle]');
    var mobileNav = $('[data-mobile-nav]');

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener('click', function () {
        searchPanel.hidden = !searchPanel.hidden;
        if (!searchPanel.hidden && searchInput) {
          searchInput.focus();
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        mobileNav.hidden = !mobileNav.hidden;
      });
    }

    if (searchInput && resultsBox) {
      searchInput.addEventListener('input', function () {
        renderGlobalSearch(searchInput.value, resultsBox);
      });
    }
  }

  function renderGlobalSearch(query, box) {
    var q = normalize(query);
    box.innerHTML = '';

    if (!q) {
      return;
    }

    var results = movieIndex.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine]
        .map(normalize)
        .join(' ')
        .indexOf(q) !== -1;
    }).slice(0, 24);

    if (results.length === 0) {
      box.innerHTML = '<p class="search-empty">没有找到匹配影片。</p>';
      return;
    }

    box.innerHTML = results.map(function (movie) {
      return [
        '<a class="search-result-item" href="' + withPrefix(movie.url) + '">',
        '  <img src="' + withPrefix(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '  <span>',
        '    <strong>' + escapeHtml(movie.title) + '</strong>',
        '    <small>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.category) + '</small>',
        '  </span>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (slides.length === 0) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    var forms = $all('[data-filter-form]');
    forms.forEach(function (form) {
      var scope = form.closest('.section-shell') || document;
      var cards = $all('.movie-card', scope);
      var keyword = $('[data-filter-input]', form);
      var year = $('[data-filter-year]', form);
      var type = $('[data-filter-type]', form);
      var category = $('[data-filter-category]', form);
      var count = $('[data-visible-count]', form);

      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var c = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category')
          ].map(normalize).join(' ');

          var matched = true;
          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }
          if (y && normalize(card.getAttribute('data-year')) !== y) {
            matched = false;
          }
          if (t && normalize(card.getAttribute('data-type')) !== t) {
            matched = false;
          }
          if (c && normalize(card.getAttribute('data-category')) !== c) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      ['input', 'change'].forEach(function (eventName) {
        form.addEventListener(eventName, apply);
      });

      form.addEventListener('reset', function () {
        window.setTimeout(apply, 0);
      });

      apply();
    });
  }

  function setupPlayer() {
    var playerShell = $('[data-player]');
    if (!playerShell) {
      return;
    }

    var video = $('.video-player', playerShell);
    var status = $('[data-player-status]', playerShell);
    var buttons = $all('[data-play-button]');
    var source = playerShell.getAttribute('data-video-url');
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initPlayer() {
      if (!video || !source || initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('正在使用浏览器原生 HLS 播放。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成，可以开始观看。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus('播放源加载异常，请稍后重试或切换线路。');
          }
        });
        return;
      }

      setStatus('当前浏览器不支持 HLS 播放，请更换浏览器或使用支持 HLS 的环境。');
    }

    function play() {
      initPlayer();
      var overlay = $('.player-overlay', playerShell);
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('浏览器已阻止自动播放，请再次点击播放器开始播放。');
          });
        }
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', play);
    });

    if (video) {
      video.addEventListener('play', function () {
        var overlay = $('.player-overlay', playerShell);
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function setupBackToTop() {
    var button = $('[data-back-to-top]');
    if (!button) {
      return;
    }

    function update() {
      button.classList.toggle('is-visible', window.scrollY > 420);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  setupHeader();
  setupHero();
  setupLocalFilters();
  setupPlayer();
  setupBackToTop();
})();
