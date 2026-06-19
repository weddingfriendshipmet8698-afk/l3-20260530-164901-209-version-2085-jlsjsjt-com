document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    var bg = hero.querySelector(".hero-bg");
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
      if (bg && slides[index]) {
        bg.style.backgroundImage = "url('" + slides[index].getAttribute("data-bg") + "')";
      }
    };
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")));
      });
    });
    show(0);
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  var keyword = document.querySelector("[data-filter-keyword]");
  var year = document.querySelector("[data-filter-year]");
  var region = document.querySelector("[data-filter-region]");
  var type = document.querySelector("[data-filter-type]");
  var category = document.querySelector("[data-filter-category]");
  var applyFilters = function () {
    var q = keyword ? keyword.value.trim().toLowerCase() : "";
    var y = year ? year.value : "";
    var r = region ? region.value : "";
    var t = type ? type.value : "";
    var c = category ? category.value : "";
    cards.forEach(function (card) {
      var haystack = card.innerText.toLowerCase() + " " + card.getAttribute("data-title").toLowerCase() + " " + card.getAttribute("data-genre").toLowerCase();
      var ok = true;
      if (q && !haystack.includes(q)) {
        ok = false;
      }
      if (y && card.getAttribute("data-year") !== y) {
        ok = false;
      }
      if (r && card.getAttribute("data-region") !== r) {
        ok = false;
      }
      if (t && card.getAttribute("data-type") !== t) {
        ok = false;
      }
      if (c && card.getAttribute("data-category") !== c) {
        ok = false;
      }
      card.classList.toggle("is-hidden", !ok);
    });
  };
  [keyword, year, region, type, category].forEach(function (node) {
    if (node) {
      node.addEventListener("input", applyFilters);
      node.addEventListener("change", applyFilters);
    }
  });

  var shell = document.querySelector("[data-video-shell]");
  var video = document.querySelector("video[data-stream]");
  var start = document.querySelector("[data-video-start]");
  var prepared = false;
  var prepareVideo = function () {
    if (!video || prepared) {
      return;
    }
    prepared = true;
    var url = video.getAttribute("data-stream");
    if (!url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else {
      video.src = url;
    }
  };
  var playVideo = function () {
    prepareVideo();
    if (video) {
      var request = video.play();
      if (request && request.catch) {
        request.catch(function () {});
      }
    }
    if (shell) {
      shell.classList.add("playing");
    }
  };
  if (start) {
    start.addEventListener("click", playVideo);
  }
  if (video) {
    video.addEventListener("click", prepareVideo);
    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("playing");
      }
    });
  }
});
