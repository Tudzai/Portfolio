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
    backToTop.addEventListener('click', (event) => {
      event.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });

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

  const deckStage = deckViewport?.querySelector('.deck-stage');
  const deckSlides = deckStage ? [...deckStage.querySelectorAll(':scope > .slide')] : [];
  if (deckStage && deckSlides.length > 1 && !window.presentation) {
    const preferredOrder = ['.intro-slide', '.journey-slide', '.bx-slide', '.upcoming-slide', '.rx-slide', '.qa-slide'];
    const orderedSlides = preferredOrder
      .map((selector) => deckStage.querySelector(selector))
      .filter(Boolean);
    deckSlides.forEach((slide) => {
      if (!orderedSlides.includes(slide)) orderedSlides.push(slide);
    });

    const controls = document.createElement('nav');
    controls.className = 'deck-controls';
    controls.setAttribute('aria-label', 'Presentation controls');
    controls.innerHTML = `
      <button type="button" data-deck-prev aria-label="Previous slide">&larr;</button>
      <span data-deck-counter aria-live="polite">1 / ${orderedSlides.length}</span>
      <button type="button" data-deck-next aria-label="Next slide">&rarr;</button>
    `;

    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress-track';
    progressTrack.setAttribute('aria-hidden', 'true');
    progressTrack.innerHTML = '<div class="progress-bar" data-deck-progress></div>';
    document.body.append(controls, progressTrack);

    const previousButton = controls.querySelector('[data-deck-prev]');
    const nextButton = controls.querySelector('[data-deck-next]');
    const counter = controls.querySelector('[data-deck-counter]');
    const progress = progressTrack.querySelector('[data-deck-progress]');
    let currentSlide = Math.max(0, orderedSlides.findIndex((slide) => slide.classList.contains('active')));
    const slideScenes = new Map();
    let touchStartX = 0;
    let touchStartY = 0;

    const qaRecap = deckStage.querySelector('.qa-recap-stage');
    const qaSingle = deckStage.querySelector('.qa-single-stage');
    if (qaRecap && qaSingle) {
      qaSingle.setAttribute('aria-hidden', 'true');
      qaRecap.setAttribute('aria-hidden', 'false');
      qaRecap.querySelectorAll('[data-qa-recap-scene]').forEach((scene) => scene.setAttribute('aria-hidden', 'true'));
    }

    const sceneCount = (slide) => {
      if (slide.classList.contains('intro-slide')) return 4;
      if (slide.classList.contains('journey-slide')) return 19;
      if (slide.classList.contains('bx-slide')) return 5;
      if (slide.classList.contains('rx-slide')) return 6;
      if (slide.classList.contains('qa-slide') && qaRecap) return 3;
      return 1;
    };

    const renderScene = (slide, scene) => {
      const bounded = Math.max(0, Math.min(scene, sceneCount(slide) - 1));
      slideScenes.set(slide, bounded);
      if (slide.classList.contains('intro-slide')) {
        slide.dataset.introScene = String(bounded);
        slide.dataset.step = String(bounded);
        [...slide.classList].filter((name) => name.startsWith('intro-scene-')).forEach((name) => slide.classList.remove(name));
        slide.classList.add(`intro-scene-${bounded}`);
      }
      if (slide.classList.contains('journey-slide')) {
        slide.dataset.journeyScene = String(bounded);
        [...slide.classList].filter((name) => name.startsWith('s2x-scene-')).forEach((name) => slide.classList.remove(name));
        slide.classList.add(`s2x-scene-${bounded}`);
      }
      if (slide.classList.contains('bx-slide')) slide.dataset.benefitScene = String(bounded);
      if (slide.classList.contains('rx-slide')) {
        slide.dataset.roadmapScene = String(bounded);
        slide.querySelectorAll('[data-roadmap-target]').forEach((button) => {
          const active = Number.parseInt(button.dataset.roadmapTarget ?? '', 10) === bounded;
          button.classList.toggle('active', active);
          button.setAttribute('aria-current', active ? 'step' : 'false');
        });
      }
      if (slide.classList.contains('qa-slide') && qaRecap) {
        slide.dataset.qaScene = String(bounded);
        qaRecap.querySelectorAll('[data-qa-recap-scene]').forEach((scene) => {
          const active = Number.parseInt(scene.dataset.qaRecapScene ?? '', 10) === bounded;
          scene.setAttribute('aria-hidden', String(!active));
        });
        qaRecap.querySelectorAll('[data-qa-target]').forEach((button) => {
          const active = Number.parseInt(button.dataset.qaTarget ?? '', 10) === bounded;
          button.classList.toggle('active', active);
          button.setAttribute('aria-current', active ? 'step' : 'false');
        });
      }
    };

    const moveScene = (direction) => {
      const slide = orderedSlides[currentSlide];
      const currentScene = slideScenes.get(slide) ?? 0;
      const nextScene = currentScene + direction;
      if (nextScene < 0 || nextScene >= sceneCount(slide)) return false;
      renderScene(slide, nextScene);
      return true;
    };

    const showSlide = (index, scenePosition = 'preserve') => {
      currentSlide = Math.max(0, Math.min(index, orderedSlides.length - 1));
      orderedSlides.forEach((slide, slideIndex) => {
        const active = slideIndex === currentSlide;
        slide.classList.toggle('active', active);
        slide.classList.toggle('visible', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      counter.textContent = `${currentSlide + 1} / ${orderedSlides.length}`;
      progress.style.width = `${((currentSlide + 1) / orderedSlides.length) * 100}%`;
      previousButton.disabled = currentSlide === 0;
      nextButton.disabled = currentSlide === orderedSlides.length - 1;
      const activeSlide = orderedSlides[currentSlide];
      if (!slideScenes.has(activeSlide) || scenePosition === 'first') renderScene(activeSlide, 0);
      if (scenePosition === 'last') renderScene(activeSlide, sceneCount(activeSlide) - 1);
      const url = new URL(window.location.href);
      url.searchParams.set('slide', String(currentSlide + 1));
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    };

    const moveSlide = (direction) => {
      if (moveScene(direction)) return;
      showSlide(currentSlide + direction, direction > 0 ? 'first' : 'last');
    };
    previousButton.addEventListener('click', () => moveSlide(-1));
    nextButton.addEventListener('click', () => moveSlide(1));
    document.addEventListener('keydown', (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault();
        moveSlide(1);
      }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        moveSlide(-1);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        showSlide(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        showSlide(orderedSlides.length - 1);
      }
    });
    deckViewport.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });
    deckViewport.addEventListener('touchend', (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      moveSlide(deltaX < 0 ? 1 : -1);
    }, { passive: true });

    orderedSlides.forEach((slide) => {
      slide.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof Element && target.closest('a, button, video, input, textarea, select, [contenteditable="true"]')) return;
        moveSlide(1);
      });
    });
    deckStage.querySelectorAll('[data-roadmap-target]').forEach((button) => {
      button.addEventListener('click', () => {
        const slide = button.closest('.slide');
        if (!slide) return;
        renderScene(slide, Number.parseInt(button.dataset.roadmapTarget ?? '0', 10));
      });
    });
    deckStage.querySelectorAll('.qa-recap-stage [data-qa-target]').forEach((button) => {
      button.addEventListener('click', () => {
        const slide = button.closest('.slide');
        if (!slide) return;
        renderScene(slide, Number.parseInt(button.dataset.qaTarget ?? '0', 10));
      });
    });

    const requestedSlide = Number.parseInt(new URLSearchParams(window.location.search).get('slide') ?? '', 10);
    showSlide(Number.isFinite(requestedSlide) ? requestedSlide - 1 : currentSlide);
    window.presentation = {
      showSlide,
      next: () => moveSlide(1),
      prev: () => moveSlide(-1),
      getCurrentSlide: () => currentSlide,
      getCurrentScene: () => slideScenes.get(orderedSlides[currentSlide]) ?? 0,
    };
  }

  const article = document.querySelector('.aabw-article-page article');
  if (article) {
    const articleSections = [...article.querySelectorAll('.article-section')]
      .map((section) => {
        const heading = section.querySelector('h2[id]');
        if (!heading || !section.getClientRects().length) return null;
        const kicker = section.querySelector('.section-kicker');
        return {
          id: heading.id,
          label: kicker?.textContent.trim() || heading.textContent.trim(),
          section,
        };
      })
      .filter(Boolean);

    document.querySelectorAll('[data-article-toc]').forEach((toc) => {
      const fragment = document.createDocumentFragment();
      articleSections.forEach(({ id, label }, index) => {
        const link = document.createElement('a');
        link.href = `#${id}`;

        const number = document.createElement('span');
        number.textContent = String(index + 1).padStart(2, '0');
        const text = document.createElement('span');
        text.textContent = label;
        link.append(number, text);

        link.addEventListener('click', () => {
          const mobileToc = link.closest('details');
          if (mobileToc) mobileToc.open = false;
        });
        fragment.append(link);
      });
      toc.replaceChildren(fragment);
    });

    document.querySelectorAll('.article-mobile-toc summary span').forEach((count) => {
      count.textContent = `${articleSections.length} ${articleSections.length === 1 ? 'section' : 'sections'}`;
    });

    const articleHeader = document.querySelector('[data-header]');
    let progressBar = document.querySelector('[data-article-progress]');
    if (articleHeader && !progressBar) {
      const progressTrack = document.createElement('div');
      progressTrack.className = 'article-progress';
      progressTrack.setAttribute('aria-hidden', 'true');
      progressBar = document.createElement('span');
      progressBar.dataset.articleProgress = '';
      progressTrack.append(progressBar);
      articleHeader.append(progressTrack);
    }

    const setActiveSection = (id) => {
      document.querySelectorAll('[data-article-toc] a').forEach((link) => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };

    let articleFrame = 0;
    const syncArticleNavigation = () => {
      articleFrame = 0;
      const marker = (articleHeader?.offsetHeight || 72) + 48;
      let activeSection = articleSections[0];
      articleSections.forEach((candidate) => {
        if (candidate.section.getBoundingClientRect().top <= marker) activeSection = candidate;
      });
      if (activeSection) setActiveSection(activeSection.id);

      if (progressBar) {
        const articleTop = article.getBoundingClientRect().top + window.scrollY;
        const articleDistance = Math.max(article.offsetHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max((window.scrollY - articleTop) / articleDistance, 0), 1);
        progressBar.style.transform = `scaleX(${progress})`;
      }
    };
    const scheduleArticleNavigation = () => {
      if (articleFrame) return;
      articleFrame = window.requestAnimationFrame(syncArticleNavigation);
    };
    window.addEventListener('scroll', scheduleArticleNavigation, { passive: true });
    window.addEventListener('resize', scheduleArticleNavigation);
    syncArticleNavigation();
  }
})();
