
(function () {
  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function getParam(name) { return new URLSearchParams(location.search).get(name) || ''; }

  // Search page
  const data = window.MOVIE_CATALOG || [];
  const searchInput = qs('[data-search-input]');
  const searchResults = qs('[data-search-results]');
  const searchMeta = qs('[data-search-meta]');

  function renderResults(list) {
    if (!searchResults) return;
    searchResults.innerHTML = list.map(item => `
      <a class="card" href="${item.href}">
        <div class="poster" style="background:${item.bg}; color:${item.fg};">
          <div class="overlay"></div>
          <div class="poster-text">
            <div class="poster-title">${item.title}</div>
            <div class="poster-sub">${item.year} · ${item.genre}</div>
          </div>
        </div>
        <div class="card-body">
          <h3>${item.title}</h3>
          <div class="meta">${item.region} · ${item.year} · ${item.type}</div>
          <div class="meta" style="margin-top:8px">${item.snip}</div>
        </div>
      </a>
    `).join('');
    if (searchMeta) searchMeta.textContent = `共找到 ${list.length} 条匹配结果`;
  }

  function filterMovies(keyword) {
    const kw = keyword.trim().toLowerCase();
    let list = data;
    if (kw) {
      list = data.filter(item => [item.title, item.year, item.region, item.genre, item.tags, item.one_line]
        .join(' ') .toLowerCase().includes(kw));
    }
    return list.map(item => ({
      ...item,
      href: item.href,
      snip: item.one_line,
      bg: item.bg,
      fg: item.fg,
    }));
  }

  if (searchInput && searchResults) {
    const initial = getParam('q');
    searchInput.value = initial;
    renderResults(filterMovies(initial));
    searchInput.addEventListener('input', () => renderResults(filterMovies(searchInput.value)));
    const form = searchInput.closest('form');
    if (form) form.addEventListener('submit', e => e.preventDefault());
  }

  // Player page: HLS binding/fallback
  const video = qs('#player');
  if (video) {
    const src = getParam('src') || video.getAttribute('data-src') || '';
    const title = getParam('title') || video.getAttribute('data-title') || '在线播放';
    const titleNode = qs('[data-player-title]');
    const srcNode = qs('[data-player-src]');
    if (titleNode) titleNode.textContent = title;
    if (srcNode) srcNode.textContent = src || '未提供片源';
    if (src) {
      if (src.endsWith('.m3u8') && window.Hls && window.Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          console.warn('HLS error', data);
        });
      } else {
        video.src = src;
      }
    }
  }

  // Smooth anchor highlight
  qsa('[data-active-nav]').forEach(link => {
    if (link.getAttribute('href') === location.pathname.split('/').pop()) link.classList.add('active');
  });
})();
