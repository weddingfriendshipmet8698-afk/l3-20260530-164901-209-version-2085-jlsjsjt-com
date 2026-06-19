(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length <= 1) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    restart();
  }

  function setupSearch() {
    var input = document.querySelector(".movie-search");
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-movie-list]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    if (!input && chips.length === 0) {
      return;
    }
    var activeKind = "全部";

    function normalize(text) {
      return String(text || "").toLowerCase().trim();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var shown = 0;
      cards.forEach(function (card) {
        var meta = normalize((card.dataset.title || "") + " " + (card.dataset.meta || ""));
        var kind = card.dataset.kind || "";
        var kindMatch = activeKind === "全部" || kind.indexOf(activeKind) !== -1 || meta.indexOf(normalize(activeKind)) !== -1;
        var queryMatch = query === "" || meta.indexOf(query) !== -1;
        var visible = kindMatch && queryMatch;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
      lists.forEach(function (list) {
        list.dataset.filtered = String(shown);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeKind = chip.dataset.filter || "全部";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        apply();
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();

function initVideoPlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button || !source) {
    return;
  }
  var hlsInstance = null;
  var loaded = false;

  function load() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = source;
    video.load();
  }

  function play() {
    load();
    button.classList.add("hidden");
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        button.classList.remove("hidden");
      });
    }
  }

  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      button.classList.remove("hidden");
    }
  });
  video.addEventListener("ended", function () {
    button.classList.remove("hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
