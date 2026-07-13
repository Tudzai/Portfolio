(function () {
  const body = document.body;
  const header = document.querySelector("[data-home-header]");
  const menuButton = document.querySelector("[data-home-menu-button]");
  const mobileNav = document.querySelector("[data-home-mobile-nav]");
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll("a") : [];

  function updateHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  function setMenu(open, returnFocus) {
    if (!menuButton || !mobileNav) return;

    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
    body.classList.toggle("menu-open", open);
    header?.classList.toggle("menu-visible", open);

    if (open) {
      window.requestAnimationFrame(function () {
        mobileNav.querySelector("a")?.focus();
      });
    } else if (returnFocus) {
      menuButton.focus();
    }
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
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1100) setMenu(false);
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

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
