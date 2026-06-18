(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            const isOpen = mobileMenu.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.textContent = isOpen ? '×' : '☰';
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dots button'));
        let activeIndex = 0;

        const setActive = function (index) {
            activeIndex = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setActive(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                setActive((activeIndex + 1) % slides.length);
            }, 5200);
        }
    }

    const fillFilterOptions = function (scope) {
        ['year', 'region', 'type'].forEach(function (name) {
            const select = scope.querySelector('[data-filter="' + name + '"]');
            if (!select || select.options.length > 1) {
                return;
            }
            const values = Array.from(scope.querySelectorAll('[data-' + name + ']'))
                .map(function (item) {
                    return item.getAttribute('data-' + name) || '';
                })
                .filter(Boolean)
                .filter(function (value, index, array) {
                    return array.indexOf(value) === index;
                })
                .sort(function (a, b) {
                    if (name === 'year') {
                        return String(b).localeCompare(String(a));
                    }
                    return String(a).localeCompare(String(b), 'zh-Hans-CN');
                });
            values.forEach(function (value) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });
    };

    const filterScope = document.querySelector('[data-filter-page]');
    if (filterScope) {
        fillFilterOptions(filterScope);
        const keywordInput = filterScope.querySelector('[data-filter="keyword"]');
        const yearSelect = filterScope.querySelector('[data-filter="year"]');
        const regionSelect = filterScope.querySelector('[data-filter="region"]');
        const typeSelect = filterScope.querySelector('[data-filter="type"]');
        const cards = Array.from(filterScope.querySelectorAll('.movie-card, .rank-row'));
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';

        if (keywordInput && query) {
            keywordInput.value = query;
        }

        const runFilter = function () {
            const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            const year = yearSelect ? yearSelect.value : '';
            const region = regionSelect ? regionSelect.value : '';
            const type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                const data = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-genre') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                const okKeyword = !keyword || data.indexOf(keyword) !== -1;
                const okYear = !year || card.getAttribute('data-year') === year;
                const okRegion = !region || card.getAttribute('data-region') === region;
                const okType = !type || card.getAttribute('data-type') === type;
                card.classList.toggle('is-hidden-card', !(okKeyword && okYear && okRegion && okType));
            });
        };

        [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runFilter);
                control.addEventListener('change', runFilter);
            }
        });

        runFilter();
    }
}());
