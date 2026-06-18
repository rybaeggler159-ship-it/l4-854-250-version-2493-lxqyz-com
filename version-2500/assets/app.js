(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mainNav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let index = 0;

    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    if (slides.length > 1) {
      setInterval(() => show(index + 1), 5200);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const localFilter = document.querySelector('.local-filter');
  if (query && localFilter) {
    localFilter.value = query;
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const catalog = document.querySelector('.catalog-page');
  if (catalog && localFilter) {
    const cards = Array.from(catalog.querySelectorAll('.movie-card'));
    const sortSelect = catalog.querySelector('.sort-select');

    const filterCards = () => {
      const value = normalize(localFilter.value);
      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.category,
          card.textContent
        ].join(' '));
        card.classList.toggle('is-filtered-out', value && !haystack.includes(value));
      });
    };

    const sortCards = () => {
      if (!sortSelect) {
        return;
      }
      const grid = catalog.querySelector('.catalog-grid');
      if (!grid) {
        return;
      }
      const value = sortSelect.value;
      const visibleCards = cards.slice();
      if (value === 'title') {
        visibleCards.sort((a, b) => normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN'));
      }
      if (value === 'year') {
        visibleCards.sort((a, b) => normalize(b.dataset.year).localeCompare(normalize(a.dataset.year), 'zh-Hans-CN'));
      }
      visibleCards.forEach((card) => grid.appendChild(card));
    };

    localFilter.addEventListener('input', filterCards);
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
    filterCards();
  }
})();
