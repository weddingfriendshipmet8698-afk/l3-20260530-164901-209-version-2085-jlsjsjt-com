(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startSlider() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        showSlide(index);
        startSlider();
      });
    });

    showSlide(0);
    startSlider();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFiltering(scope) {
    var searchInput = scope.querySelector("[data-live-search]");
    var filters = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-field]"));
    var items = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-item"));

    if (!searchInput && !filters.length) {
      return;
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : "");

      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-year"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-category"),
          item.getAttribute("data-genre")
        ].join(" "));

        var matched = !query || haystack.indexOf(query) !== -1;

        filters.forEach(function (filter) {
          var key = filter.getAttribute("data-filter-field");
          var value = normalize(filter.value);

          if (value && normalize(item.getAttribute("data-" + key)) !== value) {
            matched = false;
          }
        });

        item.classList.toggle("is-hidden", !matched);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    filters.forEach(function (filter) {
      filter.addEventListener("change", applyFilters);
    });

    applyFilters();
  }

  setupFiltering(document);

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-start");
    var source = player.getAttribute("data-src");
    var attached = false;
    var hlsInstance = null;

    if (!video || !source || !button) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function playVideo() {
      attachSource();
      player.classList.add("is-playing");

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo();
    });

    player.addEventListener("click", function (event) {
      if (event.target === video) {
        return;
      }

      if (!player.classList.contains("is-playing")) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        player.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      player.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(setupPlayer);
})();
