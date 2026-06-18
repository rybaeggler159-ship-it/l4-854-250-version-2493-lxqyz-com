(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    var current = 0;

    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var grid = document.querySelector('[data-filter-grid]');
  var input = document.querySelector('.filter-input');
  var yearSelect = document.querySelector('[data-filter-year]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var emptyText = document.querySelector('.filter-empty');

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (input && initialQuery) {
    input.value = initialQuery;
  }

  var applyFilter = function () {
    if (!grid) {
      return;
    }

    var query = input ? input.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (region && cardRegion !== region) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyText) {
      emptyText.classList.toggle('show', visible === 0);
    }
  };

  if (grid) {
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }
    applyFilter();
  }
})();
