(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
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

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
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

    var filterPanel = document.querySelector('[data-filter-panel]');
    var cardList = document.querySelector('[data-card-list]');
    if (filterPanel && cardList) {
      var input = filterPanel.querySelector('[data-card-search]');
      var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
      var empty = filterPanel.querySelector('[data-empty-state]');
      var active = {
        type: 'all',
        region: 'all'
      };

      function applyFilters() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var type = card.getAttribute('data-type') || '';
          var region = card.getAttribute('data-region') || '';
          var okQuery = !query || haystack.indexOf(query) !== -1;
          var okType = active.type === 'all' || type === active.type;
          var okRegion = active.region === 'all' || region === active.region;
          var show = okQuery && okType && okRegion;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      filterPanel.addEventListener('click', function (event) {
        var button = event.target.closest('[data-filter-kind]');
        if (!button) {
          return;
        }
        var kind = button.getAttribute('data-filter-kind');
        var value = button.getAttribute('data-filter-value') || 'all';
        active[kind] = value;
        Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-kind="' + kind + '"]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
        input.addEventListener('input', applyFilters);
      }
      applyFilters();
    }
  });
})();
