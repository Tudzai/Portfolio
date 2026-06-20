const root = document.documentElement;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const copyButtons = document.querySelectorAll("[data-copy]");
const internalLinks = document.querySelectorAll('a[href^="#"]');
const momentumFlow = document.querySelector("[data-momentum-flow]");
const commandCenter = document.querySelector("[data-command-center]");
const fitLens = document.querySelector("[data-fit-lens]");
const forceSolidHeader = document.body.classList.contains("detail-page");

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme) {
  root.dataset.theme = savedTheme;
}

function updateHeaderState() {
  header.classList.toggle("is-scrolled", forceSolidHeader || window.scrollY > 24);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  header?.classList.remove("menu-visible");
  mobileNav?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-label", "Open menu");
}

function scrollToTarget(target) {
  const headerOffset = header?.offsetHeight || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 8;
  window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
}

function scrollToHash(hash) {
  const target = hash && hash.length > 1 ? document.querySelector(hash) : null;
  if (!target) return false;
  scrollToTarget(target);
  return true;
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  header.classList.toggle("menu-visible", isOpen);
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!scrollToHash(hash)) return;

    event.preventDefault();
    closeMenu();
    history.pushState(null, "", hash);
    scrollToHash(hash);
  });
});

window.addEventListener("hashchange", () => {
  closeMenu();
  scrollToHash(window.location.hash);
});

if (window.location.hash) {
  window.setTimeout(() => scrollToHash(window.location.hash), 0);
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  if (nextTheme === "light") {
    delete root.dataset.theme;
    localStorage.setItem("portfolio-theme", "light");
  } else {
    root.dataset.theme = "dark";
    localStorage.setItem("portfolio-theme", "dark");
  }
});

copyButtons.forEach((button) => {
  const defaultLabel = button.textContent.trim();

  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      button.innerHTML = '<i data-lucide="check"></i> Email copied';
      window.lucide?.createIcons();
      window.setTimeout(() => {
        button.innerHTML = '<i data-lucide="copy"></i> ' + defaultLabel;
        window.lucide?.createIcons();
      }, 1800);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  });
});

if (momentumFlow) {
  const steps = momentumFlow.querySelectorAll(".momentum-step");
  const title = momentumFlow.querySelector("[data-momentum-title]");
  const metric = momentumFlow.querySelector("[data-momentum-metric]");
  const copy = momentumFlow.querySelector("[data-momentum-copy]");

  function activateMomentumStep(activeStep) {
    steps.forEach((step) => {
      const isActive = step === activeStep;
      step.classList.toggle("is-active", isActive);
      step.setAttribute("aria-pressed", String(isActive));
    });

    title.textContent = activeStep.dataset.title || "";
    metric.textContent = activeStep.dataset.metric || "";
    copy.textContent = activeStep.dataset.copy || "";
  }

  steps.forEach((step) => {
    step.addEventListener("click", () => activateMomentumStep(step));
    step.addEventListener("mouseenter", () => activateMomentumStep(step));
    step.addEventListener("focus", () => activateMomentumStep(step));
  });
}

if (commandCenter) {
  const tabs = commandCenter.querySelectorAll(".command-tab");
  const title = commandCenter.querySelector("[data-command-title]");
  const kpi = commandCenter.querySelector("[data-command-kpi]");
  const copy = commandCenter.querySelector("[data-command-copy]");

  function activateCommandTab(activeTab) {
    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });

    title.textContent = activeTab.dataset.title || "";
    kpi.textContent = activeTab.dataset.kpi || "";
    copy.textContent = activeTab.dataset.copy || "";
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateCommandTab(tab));
    tab.addEventListener("mouseenter", () => activateCommandTab(tab));
    tab.addEventListener("focus", () => activateCommandTab(tab));
  });
}

if (fitLens) {
  const tabs = fitLens.querySelectorAll(".fit-lens-tab");
  const title = fitLens.querySelector("[data-fit-title]");
  const tag = fitLens.querySelector("[data-fit-tag]");
  const copy = fitLens.querySelector("[data-fit-copy]");
  const link = fitLens.querySelector("[data-fit-link]");

  function activateFitLens(activeTab) {
    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });

    title.textContent = activeTab.dataset.title || "";
    tag.textContent = activeTab.dataset.tag || "";
    copy.textContent = activeTab.dataset.copy || "";
    link.textContent = activeTab.dataset.linkLabel || "Review details";
    link.setAttribute("href", activeTab.dataset.link || "#proof");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateFitLens(tab));
    tab.addEventListener("mouseenter", () => activateFitLens(tab));
    tab.addEventListener("focus", () => activateFitLens(tab));
  });
}

const revealItems = document.querySelectorAll(
  [
    ".hero-command-card",
    ".fit-lens-readout",
    ".snapshot-list div",
    ".brand-principles article",
    ".ability-card",
    ".proof-path-card",
    ".decision-card",
    ".bi-product-card",
    ".process-main",
    ".process-proof",
    ".python-lab-main",
    ".python-code-card",
    ".timeline",
    ".skill-group",
    ".global-readiness-strip div",
  ].join(", ")
);

if (revealItems.length) {
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          window.setTimeout(() => {
            entry.target.style.transitionDelay = "";
          }, 700);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item, index) => {
      item.dataset.reveal = "";
      item.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  }
}

window.lucide?.createIcons();
