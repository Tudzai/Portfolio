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
})();
