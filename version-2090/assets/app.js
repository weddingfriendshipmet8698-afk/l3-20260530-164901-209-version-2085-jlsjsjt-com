(() => {
  const catalog = window.SITE_CATALOG || [];
  const normalize = (s) => (s || '')
    .toString()
    .toLowerCase()
    .replace(/[\s\-_/]+/g, '')
    .replace(/[，,。\.！!？?、·]/g, '');

  const queryFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return {
      q: params.get('q') || '',
      type: params.get('type') || '',
      year: params.get('year') || '',
      region: params.get('region') || '',
    };
  };

  const buildCard = (item, index = 0) => {
    const chips = [...(item.genre || []).slice(0, 2), ...(item.tags || []).slice(0, 2)].slice(0, 4)
      .map((t) => `<span class="chip">${escapeHtml(t)}</span>`)
      .join('');
    const year = item.year || '未知年份';
    const genre = (item.genre || []).slice(0, 2).join(' / ') || item.type || '';
    return `
      <article class="film-card" style="--p1:${item.poster_a};--p2:${item.poster_b};--p3:${item.poster_c};" data-title="${escapeHtml(normalize(item.title + ' ' + item.summary + ' ' + (item.tags || []).join(' ') + ' ' + item.region + ' ' + item.type + ' ' + (item.genre || []).join(' ')))}" data-type="${escapeHtml(item.type || '')}" data-region="${escapeHtml(item.region || '')}" data-year="${escapeHtml(String(item.year || ''))}">
        <a class="film-card__link" href="/films/${item.slug}.html">
          <div class="film-card__poster">
            <div class="film-card__glow"></div>
            <div class="film-card__title">${escapeHtml(item.title)}</div>
            <div class="film-card__meta">${escapeHtml(item.type)} · ${escapeHtml(String(year))}</div>
            <div class="film-card__chips">${chips}</div>
          </div>
          <div class="film-card__body">
            <div class="film-card__topline"><span>${escapeHtml(item.region || '')}</span><span>评分 ${Number(item.score || 0).toFixed(1)}</span></div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml((item.one_line || item.summary || '').slice(0, 72))}${(item.one_line || item.summary || '').length > 72 ? '…' : ''}</p>
            <div class="film-card__footer"><span>${escapeHtml(genre)}</span><span>${escapeHtml(String(year))}</span></div>
          </div>
        </a>
      </article>`;
  };

  const escapeHtml = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Hero spotlight carousel.
  const stage = document.querySelector('[data-hero-stage]');
  const featureCards = Array.from(document.querySelectorAll('[data-hero-target]'));
  const heroTitle = document.querySelector('[data-hero-title]');
  const heroDesc = document.querySelector('[data-hero-desc]');
  const heroMeta = document.querySelector('[data-hero-meta]');
  const heroCtas = document.querySelector('[data-hero-ctas]');

  if (stage && featureCards.length) {
    const featuresBySlug = new Map(catalog.map((item) => [item.slug, item]));
    let activeIndex = 0;
    let timer = null;

    const apply = (index) => {
      activeIndex = (index + featureCards.length) % featureCards.length;
      const slug = featureCards[activeIndex].dataset.heroTarget;
      const item = featuresBySlug.get(slug);
      if (!item) return;
      featureCards.forEach((btn, i) => btn.classList.toggle('is-active', i === activeIndex));
      if (heroTitle) heroTitle.textContent = item.title;
      if (heroDesc) heroDesc.textContent = item.one_line || item.summary || '';
      if (heroMeta) heroMeta.textContent = `${item.type} · ${item.region} · ${item.year} · ${item.genre.join(' / ')}`;
      if (heroCtas) {
        heroCtas.innerHTML = `
          <a class="btn" href="/films/${item.slug}.html">立即观看</a>
          <a class="btn-secondary" href="/films/${item.slug}.html">查看详情</a>
        `;
      }
      if (stage) {
        stage.dataset.poster = item.slug;
        stage.style.setProperty('--p1', item.poster_a);
        stage.style.setProperty('--p2', item.poster_b);
        stage.style.setProperty('--p3', item.poster_c);
      }
    };

    featureCards.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        apply(idx);
        restart();
      });
    });

    const restart = () => {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => apply(activeIndex + 1), 5200);
    };

    apply(0);
    restart();
  }

  // Search page and filterable listings.
  const resultRoot = document.querySelector('[data-search-results]');
  const resultCount = document.querySelector('[data-search-count]');
  const searchInput = document.querySelector('[data-search-input]');
  const typeSelect = document.querySelector('[data-search-type]');
  const regionSelect = document.querySelector('[data-search-region]');
  const yearSelect = document.querySelector('[data-search-year]');
  const sortSelect = document.querySelector('[data-search-sort]');
  const pageCount = document.querySelector('[data-page-count]');
  const prevBtn = document.querySelector('[data-page-prev]');
  const nextBtn = document.querySelector('[data-page-next]');
  const pageInfo = document.querySelector('[data-page-info]');

  if (resultRoot) {
    let state = {
      q: searchInput ? searchInput.value.trim() : '',
      type: typeSelect ? typeSelect.value : '',
      region: regionSelect ? regionSelect.value : '',
      year: yearSelect ? yearSelect.value : '',
      sort: sortSelect ? sortSelect.value : 'score',
      page: 1,
      perPage: Number(resultRoot.dataset.perPage || 60),
    };

    const filtered = () => {
      const q = normalize(state.q);
      let items = catalog.filter((item) => {
        const hay = normalize([
          item.title,
          item.type,
          item.region,
          item.year,
          (item.genre || []).join(' '),
          (item.tags || []).join(' '),
          item.one_line,
          item.summary,
        ].join(' '));
        const okQ = !q || hay.includes(q);
        const okType = !state.type || item.type === state.type;
        const okRegion = !state.region || item.region === state.region;
        const okYear = !state.year || String(item.year) === String(state.year);
        return okQ && okType && okRegion && okYear;
      });

      switch (state.sort) {
        case 'year':
          items.sort((a, b) => (b.year - a.year) || (b.score - a.score) || a.title.localeCompare(b.title, 'zh-Hans-CN'));
          break;
        case 'title':
          items.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
          break;
        case 'year-asc':
          items.sort((a, b) => (a.year - b.year) || (b.score - a.score));
          break;
        default:
          items.sort((a, b) => (b.score - a.score) || (b.year - a.year) || a.title.localeCompare(b.title, 'zh-Hans-CN'));
      }
      return items;
    };

    const render = () => {
      const items = filtered();
      const total = items.length;
      const pages = Math.max(1, Math.ceil(total / state.perPage));
      if (state.page > pages) state.page = pages;
      const start = (state.page - 1) * state.perPage;
      const pageItems = items.slice(start, start + state.perPage);
      resultRoot.innerHTML = pageItems.map((item, i) => buildCard(item, start + i)).join('');
      if (resultCount) resultCount.textContent = `${total} / ${catalog.length}`;
      if (pageCount) pageCount.textContent = `${pages}`;
      if (pageInfo) pageInfo.textContent = `第 ${state.page} / ${pages} 页`;
      if (prevBtn) prevBtn.disabled = state.page <= 1;
      if (nextBtn) nextBtn.disabled = state.page >= pages;
    };

    const syncUrl = () => {
      const params = new URLSearchParams();
      if (state.q) params.set('q', state.q);
      if (state.type) params.set('type', state.type);
      if (state.region) params.set('region', state.region);
      if (state.year) params.set('year', state.year);
      if (state.sort && state.sort !== 'score') params.set('sort', state.sort);
      if (state.page > 1) params.set('page', String(state.page));
      history.replaceState(null, '', `${location.pathname}${params.toString() ? '?' + params.toString() : ''}`);
    };

    const setStateFromUrl = () => {
      const p = queryFromUrl();
      state.q = p.q;
      state.type = p.type;
      state.region = p.region;
      state.year = p.year;
      state.page = Math.max(1, Number(new URLSearchParams(location.search).get('page') || 1));
      if (searchInput) searchInput.value = state.q;
      if (typeSelect) typeSelect.value = state.type;
      if (regionSelect) regionSelect.value = state.region;
      if (yearSelect) yearSelect.value = state.year;
      if (sortSelect) state.sort = sortSelect.value;
    };

    setStateFromUrl();
    render();
    syncUrl();

    const bind = (el, key) => {
      if (!el) return;
      el.addEventListener('input', () => {
        state[key] = el.value;
        state.page = 1;
        syncUrl();
        render();
      });
      el.addEventListener('change', () => {
        state[key] = el.value;
        state.page = 1;
        syncUrl();
        render();
      });
    };

    bind(searchInput, 'q');
    bind(typeSelect, 'type');
    bind(regionSelect, 'region');
    bind(yearSelect, 'year');
    bind(sortSelect, 'sort');

    if (prevBtn) prevBtn.addEventListener('click', () => { state.page = Math.max(1, state.page - 1); syncUrl(); render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { state.page += 1; syncUrl(); render(); });
  }

  // Static category page filter on rendered cards.
  const categorySearch = document.querySelector('[data-category-filter]');
  const categoryCards = Array.from(document.querySelectorAll('[data-category-card]'));
  if (categorySearch && categoryCards.length) {
    const setVisible = () => {
      const q = normalize(categorySearch.value.trim());
      let count = 0;
      categoryCards.forEach((card) => {
        const hay = normalize(card.dataset.search || '');
        const ok = !q || hay.includes(q);
        card.style.display = ok ? '' : 'none';
        if (ok) count += 1;
      });
      const counter = document.querySelector('[data-category-count]');
      if (counter) counter.textContent = count;
    };
    categorySearch.addEventListener('input', setVisible);
    setVisible();
  }

  // Player quick play button.
  const playBtn = document.querySelector('[data-play-btn]');
  const video = document.querySelector('video[data-trailer]');
  if (playBtn && video) {
    playBtn.addEventListener('click', () => {
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
  }
})();
