(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === activeIndex);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === activeIndex);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  var input = document.querySelector('[data-filter-input]');
  var region = document.querySelector('[data-region-filter]');
  var list = document.querySelector('[data-filter-list]');
  var empty = document.querySelector('[data-empty-state]');

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function filterCards() {
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var regionValue = region ? region.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var search = (card.getAttribute('data-search') || '').toLowerCase();
      var cardRegion = card.getAttribute('data-region') || '';
      var keywordMatched = !keyword || search.indexOf(keyword) !== -1;
      var regionMatched = !regionValue || cardRegion.indexOf(regionValue) !== -1;
      var matched = keywordMatched && regionMatched;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (input) {
    var initialQuery = readQuery();

    if (initialQuery) {
      input.value = initialQuery;
    }

    input.addEventListener('input', filterCards);
  }

  if (region) {
    region.addEventListener('change', filterCards);
  }

  filterCards();
})();
