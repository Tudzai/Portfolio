(function () {
  const body = document.body;
  const header = document.querySelector("[data-home-header]");
  const menuButton = document.querySelector("[data-home-menu-button]");
  const mobileNav = document.querySelector("[data-home-mobile-nav]");
  const mobileLinks = mobileNav ? Array.from(mobileNav.querySelectorAll("a")) : [];
  const scrollSentinel = document.querySelector("[data-scroll-sentinel]");
  const backToTop = document.querySelector("[data-back-to-top]");
  const hero = document.querySelector(".home-hero");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopLayout = window.matchMedia("(min-width: 1101px)");

  let menuAnimation = null;
  let lensAnimation = null;
  let revealObserver = null;

  function cancelAnimation(animation) {
    if (!animation) return;

    try {
      animation.cancel();
    } catch (_error) {
      // The animation may already be finished.
    }
  }

  function finishMenuClose(animation) {
    if (!mobileNav || menuAnimation !== animation || menuButton?.getAttribute("aria-expanded") === "true") return;
    mobileNav.hidden = true;
    cancelAnimation(animation);
    menuAnimation = null;
  }

  function setMenu(open, returnFocus) {
    if (!menuButton || !mobileNav) return;

    cancelAnimation(menuAnimation);
    menuAnimation = null;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    body.classList.toggle("menu-open", open);
    header?.classList.toggle("menu-visible", open);

    if (open) {
      mobileNav.hidden = false;

      if (!reducedMotion.matches && typeof mobileNav.animate === "function") {
        const animation = mobileNav.animate(
          [
            { opacity: 0, transform: "translateY(-8px) scale(0.99)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        menuAnimation = animation;
        animation.finished
          .then(function () {
            if (menuAnimation === animation) {
              cancelAnimation(animation);
              menuAnimation = null;
            }
          })
          .catch(function () {});
      }

      window.requestAnimationFrame(function () {
        mobileLinks[0]?.focus();
      });
      return;
    }

    if (returnFocus) menuButton.focus();
    if (mobileNav.hidden) return;

    if (reducedMotion.matches || typeof mobileNav.animate !== "function") {
      mobileNav.hidden = true;
      return;
    }

    const animation = mobileNav.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(-8px) scale(0.99)" },
      ],
      { duration: 140, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
    );
    menuAnimation = animation;
    animation.finished.then(function () { finishMenuClose(animation); }).catch(function () {});
  }

  menuButton?.addEventListener("click", function () {
    const shouldOpen = menuButton.getAttribute("aria-expanded") !== "true";
    setMenu(shouldOpen, !shouldOpen);
  });

  mobileLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      setMenu(false, true);
      return;
    }

    if (event.key !== "Tab" || menuButton?.getAttribute("aria-expanded") !== "true" || !mobileLinks.length) return;

    const firstLink = mobileLinks[0];
    const lastLink = mobileLinks[mobileLinks.length - 1];
    if (event.shiftKey && document.activeElement === firstLink) {
      event.preventDefault();
      lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      firstLink.focus();
    }
  });

  desktopLayout.addEventListener("change", function (event) {
    if (event.matches) setMenu(false);
  });

  function setBackToTopVisible(visible) {
    if (!backToTop) return;
    backToTop.classList.toggle("is-visible", visible);
    backToTop.setAttribute("aria-hidden", String(!visible));
    backToTop.tabIndex = visible ? 0 : -1;
  }

  setBackToTopVisible(false);

  if ("IntersectionObserver" in window && scrollSentinel) {
    const headerObserver = new IntersectionObserver(function (entries) {
      header?.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    });
    headerObserver.observe(scrollSentinel);
  } else {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  if ("IntersectionObserver" in window && hero) {
    const heroObserver = new IntersectionObserver(function (entries) {
      const entry = entries[0];
      setBackToTopVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    heroObserver.observe(hero);
  }

  const navigationSections = Array.from(document.querySelectorAll("#work, #value, #experience, #approach"));
  const sectionLinks = Array.from(document.querySelectorAll('.home-nav a[href^="#"], .home-mobile-nav a[href^="#"]'));

  function setActiveSection(id) {
    sectionLinks.forEach(function (link) {
      const active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window && navigationSections.length) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        const activeEntry = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top); })[0];

        if (activeEntry) setActiveSection(activeEntry.target.id);
      },
      { rootMargin: "-24% 0px -64% 0px", threshold: 0 },
    );
    navigationSections.forEach(function (section) { sectionObserver.observe(section); });
  }

  const revealGroups = [
    ".section-heading-row",
    ".flagship-grid > .flagship-case",
    ".value-grid > article",
    ".career-timeline > .career-item",
    ".capability-panel",
    ".approach-steps",
    ".evidence-policy",
    ".library-grid > .library-card",
    ".contact-shell",
  ];

  const revealItems = [];
  revealGroups.forEach(function (selector) {
    Array.from(document.querySelectorAll(selector)).forEach(function (element, index) {
      element.classList.add("reveal-item");
      element.style.setProperty("--reveal-delay", Math.min(index, 4) * 40 + "ms");
      revealItems.push(element);
    });
  });

  function revealElement(element) {
    element.classList.add("is-visible");
    element.querySelector(".automation-visual")?.classList.add("is-flow-visible");
  }

  function configureRevealMotion() {
    revealObserver?.disconnect();
    revealObserver = null;
    cancelAnimation(lensAnimation);
    lensAnimation = null;

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      body.classList.remove("motion-ready");
      revealItems.forEach(revealElement);
      document.querySelectorAll(".automation-visual").forEach(function (element) {
        element.classList.add("is-flow-visible");
      });
      return;
    }

    body.classList.add("motion-ready");
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          revealElement(entry.target);
          revealObserver?.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    revealItems.forEach(function (element) {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.88) revealElement(element);
      else {
        element.classList.remove("is-visible");
        element.querySelector(".automation-visual")?.classList.remove("is-flow-visible");
        revealObserver.observe(element);
      }
    });
  }

  configureRevealMotion();

  const decisionLens = document.querySelector("[data-decision-lens]");
  const lensTabs = decisionLens ? Array.from(decisionLens.querySelectorAll('[role="tab"]')) : [];
  const lensReadout = decisionLens?.querySelector('[role="tabpanel"]');
  const lensLabel = decisionLens?.querySelector("[data-lens-readout-label]");
  const lensQuestion = decisionLens?.querySelector("[data-lens-readout-question]");
  const lensAnswer = decisionLens?.querySelector("[data-lens-readout-answer]");

  function selectLens(tab, moveFocus) {
    if (!tab || !lensReadout) return;

    lensTabs.forEach(function (candidate) {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });

    lensReadout.setAttribute("aria-labelledby", tab.id);
    if (lensLabel) lensLabel.textContent = tab.dataset.lensLabel || "Decision lens";
    if (lensQuestion) lensQuestion.textContent = tab.dataset.lensQuestion || "";
    if (lensAnswer) lensAnswer.textContent = tab.dataset.lensAnswer || "";

    cancelAnimation(lensAnimation);
    lensAnimation = null;
    if (!reducedMotion.matches && typeof lensReadout.animate === "function") {
      lensAnimation = lensReadout.animate(
        [
          { opacity: 0.35, transform: "translateY(3px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 160, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }

    if (moveFocus) tab.focus();
  }

  lensTabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { selectLens(tab, false); });
    tab.addEventListener("keydown", function (event) {
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % lensTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + lensTabs.length) % lensTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = lensTabs.length - 1;

      if (nextIndex === null) return;
      event.preventDefault();
      selectLens(lensTabs[nextIndex], true);
    });
  });

  reducedMotion.addEventListener("change", function () {
    if (reducedMotion.matches && menuButton?.getAttribute("aria-expanded") !== "true") {
      cancelAnimation(menuAnimation);
      menuAnimation = null;
      if (mobileNav) mobileNav.hidden = true;
    }
    configureRevealMotion();
  });

  document.querySelectorAll("[data-track-event]").forEach(function (element) {
    element.addEventListener("click", function () {
      if (!window.portfolioAnalytics || typeof window.portfolioAnalytics.capture !== "function") return;

      window.portfolioAnalytics.capture(element.dataset.trackEvent, {
        cta_label: element.dataset.trackLabel || element.textContent.replace(/\s+/g, " ").trim(),
        cta_location: element.dataset.trackLocation || "homepage",
        destination: element.getAttribute("href") || null,
      });
    });
  });

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
