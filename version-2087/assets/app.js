(function () {
  function toggleMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-to]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-to')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function textForCard(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function setupFilterPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var target = panel.getAttribute('data-target');
      var grid = target ? document.querySelector(target) : null;

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
      var input = panel.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-button]'));
      var sort = panel.querySelector('[data-sort-select]');
      var counter = panel.querySelector('[data-result-count]');
      var empty = grid.parentElement ? grid.parentElement.querySelector('[data-empty-state]') : null;
      var activeField = 'all';
      var activeValue = '';

      function sortCards() {
        if (!sort) {
          return;
        }

        var value = sort.value;
        var sorted = cards.slice();

        if (value === 'year-desc') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          });
        } else if (value === 'year-asc') {
          sorted.sort(function (a, b) {
            return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
          });
        } else if (value === 'title-asc') {
          sorted.sort(function (a, b) {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
          });
        } else {
          sorted.sort(function (a, b) {
            return Number(a.getAttribute('data-index')) - Number(b.getAttribute('data-index'));
          });
        }

        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matchesKeyword = !keyword || textForCard(card).indexOf(keyword) !== -1;
          var matchesFilter = true;

          if (activeField !== 'all' && activeValue) {
            matchesFilter = String(card.getAttribute('data-' + activeField) || '').indexOf(activeValue) !== -1;
          }

          var shouldShow = matchesKeyword && matchesFilter;
          card.classList.toggle('is-hidden', !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        sortCards();

        if (counter) {
          counter.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
        }

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (other) {
            other.classList.remove('is-active');
          });

          button.classList.add('is-active');
          activeField = button.getAttribute('data-filter-field') || 'all';
          activeValue = button.getAttribute('data-filter-value') || '';
          apply();
        });
      });

      if (sort) {
        sort.addEventListener('change', apply);
      }

      apply();
    });
  }

  function setupPlayer() {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video[data-video-src]');
    var overlay = shell.querySelector('[data-play-overlay]');
    var status = document.querySelector('[data-player-status]');
    var hlsInstance = null;
    var initialized = false;

    function writeStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initializeSource() {
      if (!video || initialized) {
        return;
      }

      var source = video.getAttribute('data-video-src');

      if (!source) {
        writeStatus('当前影片缺少播放源。');
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            writeStatus('播放源加载遇到问题，请刷新页面或稍后重试。');
          }
        });

        writeStatus('HLS 播放源已加载，可以开始观看。');
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        writeStatus('浏览器原生 HLS 播放源已加载，可以开始观看。');
        return;
      }

      video.src = source;
      writeStatus('已尝试直接加载播放源；若无法播放，请换用支持 HLS 的浏览器。');
    }

    function playVideo() {
      initializeSource();

      if (!video) {
        return;
      }

      var promise = video.play();

      if (promise && typeof promise.then === 'function') {
        promise
          .then(function () {
            if (overlay) {
              overlay.classList.add('is-hidden');
            }
          })
          .catch(function () {
            writeStatus('浏览器阻止了自动播放，请再次点击播放器开始观看。');
          });
      } else if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        writeStatus('视频已暂停，可继续播放或拖动进度。');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  function markBrokenImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileMenu();
    setupHero();
    setupFilterPanels();
    setupPlayer();
    markBrokenImages();
  });
})();
