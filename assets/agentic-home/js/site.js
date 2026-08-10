(() => {
  document.documentElement.classList.add('stage-ready');
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.stageFallback === 'true') return;
      image.dataset.stageFallback = 'true';
      const fallback = document.createElement('span');
      fallback.className = 'stage-media-fallback';
      fallback.textContent = 'Media unavailable in this preview';
      image.replaceWith(fallback);
    }, { once: true });
  });

  const filterGroups = [...document.querySelectorAll('[data-stage-filter]')];
  filterGroups.forEach((group) => {
    const items = [...group.querySelectorAll('[data-filter-value]')];
    const empty = group.querySelector('[data-filter-empty]');
    const controls = [...group.querySelectorAll('[data-filter-control]')];
    if (!items.length || !controls.length) return;

    const applyFilter = (value) => {
      let visible = 0;
      items.forEach((item) => {
        const show = value === 'all' || item.dataset.filterValue === value;
        item.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
      controls.forEach((control) => control.setAttribute('aria-pressed', String(control.dataset.filterControl === value)));
    };

    controls.forEach((control) => control.addEventListener('click', () => applyFilter(control.dataset.filterControl)));
    applyFilter('all');
  });

  const backToTop = document.querySelector('.stage-back-to-top');
  if (backToTop) {
    let scrollFrame = 0;
    const syncBackToTop = () => {
      scrollFrame = 0;
      const visible = window.scrollY > Math.max(360, window.innerHeight * 0.65);
      backToTop.classList.toggle('is-visible', visible);
      backToTop.tabIndex = visible ? 0 : -1;
    };
    const scheduleBackToTop = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(syncBackToTop);
    };
    window.addEventListener('scroll', scheduleBackToTop, { passive: true });
    window.addEventListener('resize', scheduleBackToTop);
    syncBackToTop();
  }

  const fitDeckStage = () => {
    const viewport = document.querySelector('.deck-viewport');
    const deckStage = viewport?.querySelector('.deck-stage');
    if (!viewport || !deckStage) return;

    const bounds = viewport.getBoundingClientRect();
    const scale = Math.min(bounds.width / 1920, bounds.height / 1080);
    const offsetX = Math.max(0, (bounds.width - (1920 * scale)) / 2);
    const offsetY = Math.max(0, (bounds.height - (1080 * scale)) / 2);
    deckStage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  };
  let deckFitFrame = 0;
  const scheduleDeckFit = () => {
    if (deckFitFrame) window.cancelAnimationFrame(deckFitFrame);
    deckFitFrame = window.requestAnimationFrame(() => {
      deckFitFrame = 0;
      fitDeckStage();
    });
  };
  const deckViewport = document.querySelector('.deck-viewport');
  if (deckViewport) {
    window.addEventListener('load', scheduleDeckFit);
    window.addEventListener('resize', scheduleDeckFit);
    new ResizeObserver(scheduleDeckFit).observe(deckViewport);
    scheduleDeckFit();
  }
})();
