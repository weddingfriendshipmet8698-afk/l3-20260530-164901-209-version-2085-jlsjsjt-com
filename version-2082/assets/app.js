(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      thumbs.forEach(function(thumb, thumbIndex) {
        thumb.classList.toggle('active', thumbIndex === current);
      });
    }

    thumbs.forEach(function(thumb) {
      thumb.addEventListener('click', function() {
        showHero(Number(thumb.getAttribute('data-hero-thumb')));
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showHero(current + 1);
      }, 6200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function(panel) {
    var input = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var sortSelect = panel.querySelector('[data-sort-select]');
    var scope = panel.parentElement;
    var grid = scope.querySelector('[data-card-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.children);

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type')
        ].join(' '));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('hidden-card', !(matchedKeyword && matchedYear));
      });
    }

    function applySort() {
      var value = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();

      if (value === 'year-desc') {
        sorted.sort(function(a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      }

      if (value === 'year-asc') {
        sorted.sort(function(a, b) {
          return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
        });
      }

      if (value === 'title-asc') {
        sorted.sort(function(a, b) {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
        });
      }

      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function() {
        applySort();
        applyFilter();
      });
    }
  });
})();
