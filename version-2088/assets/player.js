(function () {
  var configNode = document.getElementById('player-stream');
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var trigger = document.querySelector('[data-player-trigger]');

  if (!configNode || !video) {
    return;
  }

  var streamUrl = '';

  try {
    streamUrl = JSON.parse(configNode.textContent).url || '';
  } catch (error) {
    streamUrl = '';
  }

  if (!streamUrl) {
    return;
  }

  var hlsInstance = null;
  var loaded = false;

  function loadStream() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayer() {
    loadStream();
    video.controls = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (trigger) {
    trigger.addEventListener('click', startPlayer);
  }

  if (overlay && overlay !== trigger) {
    overlay.addEventListener('click', startPlayer);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayer();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
