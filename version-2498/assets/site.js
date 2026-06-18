(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 480) {
          backTop.classList.add("is-visible");
        } else {
          backTop.classList.remove("is-visible");
        }
      });

      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var next = slider.querySelector("[data-hero-next]");
      var prev = slider.querySelector("[data-hero-prev]");
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }

        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
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
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var panelFilter = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card, [data-card-list] .rank-item"));
    var empty = document.querySelector("[data-empty-state]");

    if (panelFilter && cards.length) {
      var input = panelFilter.querySelector("[data-filter-input]");
      var region = panelFilter.querySelector("[data-filter-region]");
      var type = panelFilter.querySelector("[data-filter-type]");
      var year = panelFilter.querySelector("[data-filter-year]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";

      if (input && q) {
        input.value = q;
      }

      function matchValue(card, name, value) {
        if (!value) {
          return true;
        }
        return (card.getAttribute(name) || "") === value;
      }

      function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (!matchValue(card, "data-region", regionValue)) {
            ok = false;
          }
          if (!matchValue(card, "data-type", typeValue)) {
            ok = false;
          }
          if (!matchValue(card, "data-year", yearValue)) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";

          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", applyFilters);
          el.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
