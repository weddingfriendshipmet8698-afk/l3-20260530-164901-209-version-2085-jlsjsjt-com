(function() {
  var video = document.querySelector('[data-player]');
  var overlay = document.querySelector('[data-player-overlay]');

  if (!video || typeof playerSource !== 'string' || !playerSource) {
    return;
  }

  var attached = false;

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playerSource;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(playerSource);
      hls.attachMedia(video);
      return;
    }

    video.src = playerSource;
  }

  function play() {
    attach();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      play();
    }
  });
})();
