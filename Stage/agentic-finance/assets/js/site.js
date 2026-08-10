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

  const stageBackToTop = document.querySelector('.stage-back-to-top');
  if (stageBackToTop) {
    const syncBackToTop = () => {
      const threshold = Math.max(360, window.innerHeight * 0.55);
      const isVisible = window.scrollY > threshold;
      stageBackToTop.classList.toggle('is-visible', isVisible);
      stageBackToTop.tabIndex = isVisible ? 0 : -1;
    };

    syncBackToTop();
    window.addEventListener('scroll', syncBackToTop, { passive: true });
  }

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

  const fitDeckStage = () => {
    if (document.body.dataset.stageTemplate !== 'deck') return;
    const viewport = document.querySelector('.deck-viewport');
    const stage = viewport?.querySelector('.deck-stage');
    if (!viewport || !stage) return;

    const bounds = viewport.getBoundingClientRect();
    const factor = Math.min(bounds.width / 1920, bounds.height / 1080);
    const x = (bounds.width - 1920 * factor) / 2;
    const y = (bounds.height - 1080 * factor) / 2;
    stage.style.transform = `translate(${x}px, ${y}px) scale(${factor})`;
  };

  const scheduleDeckFit = () => requestAnimationFrame(fitDeckStage);

  if (document.body.dataset.stageTemplate === 'deck') {
    const viewport = document.querySelector('.deck-viewport');
    scheduleDeckFit();
    window.addEventListener('load', scheduleDeckFit, { once: true });
    window.addEventListener('resize', scheduleDeckFit, { passive: true });
    if (viewport && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(scheduleDeckFit).observe(viewport);
    }
  }
})();
