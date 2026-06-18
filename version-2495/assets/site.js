(function () {
  function selectAll(query, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(query));
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = selectAll('[data-hero-slide]');
  var dots = selectAll('[data-hero-dot]');
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === heroIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, itemIndex) {
    dot.addEventListener('click', function () {
      showHero(itemIndex);
    });
  });

  if (slides.length) {
    showHero(0);
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var catalog = document.querySelector('[data-catalog]');

  if (catalog) {
    var keywordInput = document.querySelector('[data-catalog-keyword]');
    var categorySelect = document.querySelector('[data-catalog-category]');
    var sortSelect = document.querySelector('[data-catalog-sort]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = selectAll('[data-title]', catalog);
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q');

    if (initialKeyword && keywordInput) {
      keywordInput.value = initialKeyword;
    }

    function applyCatalog() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.tags, card.dataset.year].join(' ').toLowerCase();
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = category === 'all' || card.dataset.category === category;
        var show = matchedKeyword && matchedCategory;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    function sortCatalog() {
      if (!sortSelect) {
        return;
      }

      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.dataset.year) - Number(a.dataset.year);
        }
        if (mode === 'score') {
          return Number(b.dataset.score) - Number(a.dataset.score);
        }
        return a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN');
      });

      sorted.forEach(function (card) {
        catalog.appendChild(card);
      });
      applyCatalog();
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', applyCatalog);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', applyCatalog);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCatalog);
    }

    sortCatalog();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var start = document.getElementById('player-start');
    var hlsInstance = null;
    var prepared = false;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlay() {
      prepare();
      if (start) {
        start.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener('click', startPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
