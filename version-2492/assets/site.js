import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMenu() {
  const toggle = $('[data-menu-toggle]');
  const panel = $('[data-mobile-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
  });
}

function setupSearchForms() {
  $$('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const target = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
      window.location.href = target;
    });
  });
}

function setupHero() {
  const hero = $('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  const prev = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  const start = () => {
    if (timer || slides.length <= 1) {
      return;
    }
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = null;
  };

  prev?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => show(dotIndex)));
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function setupFilters() {
  $$('[data-filter-panel]').forEach((panel) => {
    const list = panel.parentElement?.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    const cards = $$('.movie-card', list);
    const keywordInput = $('[data-filter-keyword]', panel);
    const categorySelect = $('[data-filter-category]', panel);
    const yearSelect = $('[data-filter-year]', panel);
    const typeSelect = $('[data-filter-type]', panel);
    const count = $('[data-filter-count]', panel);
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && keywordInput) {
      keywordInput.value = query;
    }

    const apply = () => {
      const keyword = normalize(keywordInput?.value);
      const category = normalize(categorySelect?.value);
      const year = normalize(yearSelect?.value);
      const type = normalize(typeSelect?.value);
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.category,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.genre,
        ].join(' '));

        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesCategory = !category || normalize(card.dataset.category) === category;
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const matchesType = !type || normalize(card.dataset.type).includes(type);
        const isVisible = matchesKeyword && matchesCategory && matchesYear && matchesType;

        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `共 ${visible} 部`;
      }
    };

    [keywordInput, categorySelect, yearSelect, typeSelect].forEach((control) => {
      control?.addEventListener('input', apply);
      control?.addEventListener('change', apply);
    });

    apply();
  });
}

function setupPlayers() {
  $$('.js-player').forEach((player) => {
    const video = $('video', player);
    const source = player.dataset.src;
    const overlay = $('.play-overlay', player);

    if (!video || !source) {
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal) {
          console.warn('HLS fatal error', data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }

    const togglePlayback = async () => {
      try {
        if (video.paused) {
          await video.play();
        } else {
          video.pause();
        }
      } catch (error) {
        console.warn('Video playback was blocked by the browser.', error);
      }
    };

    overlay?.addEventListener('click', togglePlayback);
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
    video.addEventListener('ended', () => player.classList.remove('is-playing'));
  });
}

function setupPlayerScroll() {
  $$('[data-scroll-player]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const player = $('.player-card');
      player?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

setupMenu();
setupSearchForms();
setupHero();
setupFilters();
setupPlayers();
setupPlayerScroll();
