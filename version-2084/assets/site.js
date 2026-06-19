(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === heroIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === heroIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
        });
    });

    if (slides.length > 1) {
        showHero(0);
        window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5600);
    }

    var homeSearch = document.querySelector('[data-home-search]');
    if (homeSearch) {
        homeSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = homeSearch.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = './all.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var queryInput = filterPanel.querySelector('[data-filter-query]');
        var categorySelect = filterPanel.querySelector('[data-filter-category]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var regionSelect = filterPanel.querySelector('[data-filter-region]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var emptyState = filterPanel.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }

        function norm(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = norm(queryInput && queryInput.value);
            var category = categorySelect ? categorySelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var search = norm(card.getAttribute('data-search'));
                var ok = true;

                if (query && search.indexOf(query) === -1) {
                    ok = false;
                }
                if (category && card.getAttribute('data-category') !== category) {
                    ok = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }

                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [queryInput, categorySelect, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function attachStream(video, done) {
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            return;
        }
        if (video.dataset.ready === '1') {
            done();
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.dataset.ready = '1';
            done();
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.dataset.ready = '1';
                done();
            } else {
                video.src = stream;
                video.dataset.ready = '1';
                done();
            }
        });
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-overlay]');
        var buttons = player.querySelectorAll('[data-play-trigger]');

        function startPlayback() {
            if (!video) {
                return;
            }
            attachStream(video, function () {
                if (overlay) {
                    overlay.classList.add('hide');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        Array.prototype.forEach.call(buttons, function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        });

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }
    }
})();
