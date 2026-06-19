
(function () {
  function qs(root, sel) { return root.querySelector(sel); }
  function qsa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

  // Mobile menu
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-toggle');
  if (header && menuBtn) {
    menuBtn.addEventListener('click', () => header.classList.toggle('open'));
  }

  // Hero carousel
  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = qsa(carousel, '[data-slide]');
    const dotsWrap = document.querySelector('[data-dots]');
    const prevBtn = document.querySelector('[data-prev]');
    const nextBtn = document.querySelector('[data-next]');
    let active = 0;
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.className = 'carousel-dot';
      b.type = 'button';
      b.addEventListener('click', () => show(i));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    function show(i) {
      if (!slides.length) return;
      active = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === active));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === active));
    }
    prevBtn && prevBtn.addEventListener('click', () => show(active - 1));
    nextBtn && nextBtn.addEventListener('click', () => show(active + 1));
    show(0);
    setInterval(() => show(active + 1), 6000);
  }

  // Search & sort
  qsa(document, '[data-card-grid]').forEach(grid => {
    const input = document.querySelector('[data-search-input]');
    const sort = document.querySelector('[data-sort]');
    let cards = qsa(grid, '[data-search]');

    function apply() {
      const q = (input?.value || '').trim().toLowerCase();
      const mode = sort?.value || 'hot';
      cards.forEach(card => {
        const txt = (card.dataset.search || '').toLowerCase();
        card.style.display = !q || txt.includes(q) ? '' : 'none';
      });
      const visible = cards.filter(c => c.style.display !== 'none');
      if (mode === 'year-desc' || mode === 'year-asc' || mode === 'title-asc') {
        const ordered = [...visible].sort((a, b) => {
          const ya = parseInt(a.dataset.year || '0', 10);
          const yb = parseInt(b.dataset.year || '0', 10);
          if (mode === 'year-desc') return yb - ya;
          if (mode === 'year-asc') return ya - yb;
          return (a.textContent || '').localeCompare(b.textContent || '', 'zh-Hans-CN');
        });
        ordered.forEach(el => grid.appendChild(el));
        cards = qsa(grid, '[data-search]');
      }
    }
    input && input.addEventListener('input', apply);
    sort && sort.addEventListener('change', apply);
  });

  // Detail page player
  const shell = document.querySelector('[data-player-shell]');
  if (shell) {
    const video = qs(shell, 'video');
    const playBtn = document.querySelector('[data-play-btn]');
    const sourceBtns = qsa(document, '[data-source-btn]');
    const mp4 = shell.dataset.mp4;
    const hls = shell.dataset.hls;
    let hlsInstance = null;

    function destroyHls() {
      if (hlsInstance) {
        try { hlsInstance.destroy(); } catch (e) {}
        hlsInstance = null;
      }
    }

    function loadMp4() {
      destroyHls();
      video.src = mp4;
      video.load();
    }

    function loadHls() {
      destroyHls();
      if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(hls);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) loadMp4();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hls;
      } else {
        loadMp4();
      }
    }

    sourceBtns.forEach(btn => btn.addEventListener('click', () => {
      sourceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.source === 'm3u8') loadHls(); else loadMp4();
      video.play().catch(() => {});
    }));
    playBtn && playBtn.addEventListener('click', () => video.play().catch(() => {}));
    loadMp4();
  }
})();
