const officialPortfolioUrl = "https://tudzai.github.io/Portfolio/";

if (
  window.location.hostname === "tudzai.github.io" &&
  window.location.pathname.startsWith("/Portfolio/https://tudzai.github.io/Portfolio")
) {
  window.location.replace(`${officialPortfolioUrl}${window.location.search}${window.location.hash}`);
}

const root = document.documentElement;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const internalLinks = document.querySelectorAll('a[href^="#"]');
const momentumFlow = document.querySelector("[data-momentum-flow]");
const commandCenter = document.querySelector("[data-command-center]");
const fitLens = document.querySelector("[data-fit-lens]");
const welcomeGate = document.querySelector("[data-welcome-gate]");
const welcomeCloseTriggers = document.querySelectorAll("[data-welcome-close]");
const hero = document.querySelector(".hero");
const forceSolidHeader = document.body.classList.contains("detail-page");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const welcomePendingClass = "welcome-pending";

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

function readSessionFlag(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionFlag(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    return false;
  }
  return true;
}

function getTrackedText(element) {
  return element.textContent.replace(/\s+/g, " ").trim();
}

function trackPortfolioEvent(eventName, properties = {}) {
  if (!window.posthog || typeof window.posthog.capture !== "function") return;

  window.posthog.capture(eventName, {
    page_path: window.location.pathname,
    page_url: window.location.href,
    page_title: document.title,
    ...properties,
  });
}

document.querySelectorAll("[data-track-event]").forEach((element) => {
  element.addEventListener("click", () => {
    trackPortfolioEvent(element.dataset.trackEvent, {
      cta_label: element.dataset.trackLabel || getTrackedText(element),
      cta_location: element.dataset.trackLocation || "unspecified",
      destination: element.getAttribute("href") || null,
    });
  });
});

const blogLangKey = "blogLang";
const blogLangVersionKey = "blogLangVersion";
const blogLangVersion = "20260629-eng-default";
const blogPosts = [
  {
    id: "agentic-ai-power-bi-part-1",
    slug: "power-bi-agentic-ai-part-1",
    status: "coming-soon",
    category: "Power BI / Agentic AI",
    tags: ["Power BI", "Agentic AI", "FP&A Automation", "Governance"],
    title: {
      vi: "Xây Power BI bằng Agentic AI - Phần 1",
      en: "Building Power BI with Agentic AI - Part 1",
    },
    summary: {
      vi: "Cách biến yêu cầu kinh doanh thành dashboard logic, model plan và checklist triển khai với sự hỗ trợ của Agentic AI.",
      en: "How to turn business questions into dashboard logic, model planning, and implementation checklists with Agentic AI.",
    },
    angle: {
      vi: "Từ business question đến semantic model, visual logic, QA checklist và governance trước khi publish.",
      en: "From business question to semantic model, visual logic, QA checklist, and governance before publishing.",
    },
  },
];

const blogCopy = {
  vi: {
    homeKicker: "Learning Notes / Blog",
    homeTitle: "Ghi chú về tài chính, công nghệ, AI và những bài học mình học được trong quá trình xây dựng.",
    homeIntro:
      "Đây là nơi mình chia sẻ trải nghiệm học hỏi, góc nhìn thực chiến và những bài học hữu ích cho người quan tâm tới tài chính, dữ liệu, công nghệ và AI.",
    homeSignalLabel: "Góc chia sẻ",
    homeSignalTitle: "Mục tiêu không phải là nói cho thật kỹ thuật. Mục tiêu là biến việc học thành giá trị hữu ích.",
    homeSignalBody:
      "Mình viết về cách tư duy tài chính, công cụ dữ liệu và AI workflow có thể giúp mọi người làm việc rõ hơn, học nhanh hơn và ra quyết định tốt hơn.",
    homeSignalOneLabel: "Theme",
    homeSignalOneValue: "Finance, tech, AI",
    homeSignalTwoLabel: "Style",
    homeSignalTwoValue: "Bài học thực tế",
    blogPageKicker: "Learning Notes / Blog",
    blogPageTitle: "Blog",
    blogPageIntro:
      "Đây là nơi mình chia sẻ trải nghiệm học hỏi, góc nhìn thực chiến và những bài học hữu ích cho người quan tâm tới tài chính, dữ liệu, công nghệ và AI.",
    blogPagePill: "ENG / VN",
    statusComingSoon: "Sắp ra mắt",
    previewTopic: "Xem chủ đề",
    cardMetaLabel: "Bài đầu tiên",
    articleKicker: "Power BI / Agentic AI",
    articleStatus: "Sắp ra mắt",
    articleTitle: "Xây Power BI bằng Agentic AI - Phần 1",
    articleSummary:
      "Cách biến yêu cầu kinh doanh thành dashboard logic, model plan và checklist triển khai với sự hỗ trợ của Agentic AI.",
    articleLead:
      "Bài viết này sẽ tập trung vào cách dùng Agentic AI như một cộng sự phân tích: hỏi đúng business question, phác thảo model, kiểm tra logic, và chuẩn bị Power BI output có thể review được.",
    articlePlanTitle: "Nội dung sẽ bao gồm",
    articlePlanOneTitle: "Business question",
    articlePlanOneBody: "Chuyển yêu cầu mơ hồ thành câu hỏi quản trị rõ: ai cần quyết định gì, theo KPI nào, trong kỳ nào.",
    articlePlanTwoTitle: "Dashboard logic",
    articlePlanTwoBody: "Thiết kế page flow, KPI hierarchy, drill path và owner/action để dashboard không chỉ đẹp mà còn dùng được.",
    articlePlanThreeTitle: "Model plan",
    articlePlanThreeBody: "Tách fact/dimension, định nghĩa measure, kiểm soát relationship và chuẩn bị semantic model dễ audit.",
    articlePlanFourTitle: "QA / governance",
    articlePlanFourBody: "Dùng AI để tạo checklist kiểm tra tie-out, variance logic, filter behavior, naming và public-safe review.",
    articleComingSoonTitle: "Đang chuẩn bị bản hướng dẫn đầu tiên.",
    articleComingSoonBody:
      "Placeholder này giữ chỗ cho Part 1. Khi publish, bài sẽ ưu tiên workflow thực chiến và finance judgment thay vì chỉ liệt kê prompt.",
    backToBlog: "Quay lại Blog",
  },
  en: {
    homeKicker: "Learning Notes / Blog",
    homeTitle: "Notes on finance, technology, AI, and the lessons I am learning while building.",
    homeIntro:
      "A place for practical reflections from a finance enthusiast who likes learning in public, connecting business judgment with tools, and sharing useful lessons for others.",
    homeSignalLabel: "Editorial angle",
    homeSignalTitle: "The goal is not to sound technical. It is to make learning useful.",
    homeSignalBody:
      "I write about how finance thinking, data tools, and AI workflows can help people work clearer, learn faster, and make better decisions.",
    homeSignalOneLabel: "Theme",
    homeSignalOneValue: "Finance, tech, AI",
    homeSignalTwoLabel: "Style",
    homeSignalTwoValue: "Practical lessons",
    blogPageKicker: "Learning Notes / Blog",
    blogPageTitle: "Blog",
    blogPageIntro:
      "A place for practical reflections from a finance enthusiast who likes learning in public, connecting business judgment with tools, and sharing useful lessons for others.",
    blogPagePill: "ENG / VN",
    statusComingSoon: "Coming soon",
    previewTopic: "Preview topic",
    cardMetaLabel: "First article",
    articleKicker: "Power BI / Agentic AI",
    articleStatus: "Coming soon",
    articleTitle: "Building Power BI with Agentic AI - Part 1",
    articleSummary:
      "How to turn business questions into dashboard logic, model planning, and implementation checklists with Agentic AI.",
    articleLead:
      "This article will focus on using Agentic AI as an analytical partner: framing the business question, drafting the model, checking logic, and preparing a Power BI output that can be reviewed.",
    articlePlanTitle: "What it will cover",
    articlePlanOneTitle: "Business question",
    articlePlanOneBody: "Turn a vague request into a clear management question: who needs to decide what, by which KPI, and in which period.",
    articlePlanTwoTitle: "Dashboard logic",
    articlePlanTwoBody: "Design page flow, KPI hierarchy, drill paths, and owner/action framing so the dashboard is useful, not just polished.",
    articlePlanThreeTitle: "Model plan",
    articlePlanThreeBody: "Separate facts and dimensions, define measures, control relationships, and prepare an auditable semantic model.",
    articlePlanFourTitle: "QA / governance",
    articlePlanFourBody: "Use AI to build checks for tie-outs, variance logic, filter behavior, naming, and public-safe review.",
    articleComingSoonTitle: "The first guide is being prepared.",
    articleComingSoonBody:
      "This placeholder reserves Part 1. When published, the article will prioritize practical workflow and finance judgment over prompt lists.",
    backToBlog: "Back to Blog",
  },
};

const blogPageMeta = {
  index: {
    vi: {
      title: "Blog | Truong Dinh Anh Tu",
      description: "Ghi chú học hỏi và chia sẻ về tài chính, dữ liệu, công nghệ, AI và cách biến kiến thức thành giá trị thực tế.",
    },
    en: {
      title: "Blog | Truong Dinh Anh Tu",
      description: "Learning notes on finance, data, technology, AI, and turning practical curiosity into useful value.",
    },
  },
  article: {
    vi: {
      title: "Xây Power BI bằng Agentic AI - Phần 1 | Blog",
      description: "Bài sắp ra mắt về cách xây Power BI bằng Agentic AI với business question, model plan và QA governance.",
    },
    en: {
      title: "Building Power BI with Agentic AI - Part 1 | Blog",
      description: "Coming-soon guide to building Power BI with Agentic AI through business questions, model planning, and QA governance.",
    },
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStoredBlogLang() {
  try {
    if (localStorage.getItem(blogLangVersionKey) !== blogLangVersion) {
      localStorage.setItem(blogLangKey, "en");
      localStorage.setItem(blogLangVersionKey, blogLangVersion);
      return "en";
    }
    const savedLang = localStorage.getItem(blogLangKey);
    return savedLang === "en" || savedLang === "vi" ? savedLang : "en";
  } catch {
    return "en";
  }
}

function storeBlogLang(lang) {
  try {
    localStorage.setItem(blogLangKey, lang);
    localStorage.setItem(blogLangVersionKey, blogLangVersion);
  } catch {
    return false;
  }
  return true;
}

function renderBlogCards(rootElement, lang) {
  const copy = blogCopy[lang];
  const basePath = rootElement.dataset.blogBase || "";
  const cards = blogPosts
    .map((post) => {
      const href = `${basePath}${post.slug}/`;
      const tagMarkup = post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

      return `
        <article class="blog-card">
          <div class="blog-card-main">
            <div class="blog-card-topline">
              <span class="blog-status-badge">${escapeHtml(copy.statusComingSoon)}</span>
              <span>${escapeHtml(copy.cardMetaLabel)}</span>
            </div>
            <p class="case-label">${escapeHtml(post.category)}</p>
            <h3><a href="${escapeHtml(href)}">${escapeHtml(post.title[lang])}</a></h3>
            <p>${escapeHtml(post.summary[lang])}</p>
            <p class="blog-angle">${escapeHtml(post.angle[lang])}</p>
            <div class="product-tags" aria-label="Blog tags">${tagMarkup}</div>
          </div>
          <div class="blog-card-action">
            <a class="button quiet" href="${escapeHtml(href)}">
              <i data-lucide="book-open-text"></i>
              ${escapeHtml(copy.previewTopic)}
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  rootElement.innerHTML = cards;
}

function updateBlogPageMeta(lang) {
  const pageType = document.body.dataset.blogPageType;
  const meta = pageType ? blogPageMeta[pageType]?.[lang] : null;
  if (!meta) return;

  document.documentElement.lang = lang === "vi" ? "vi" : "en";
  document.title = meta.title;

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", meta.description);
}

function applyBlogLanguage(lang, shouldStore = true) {
  const selectedLang = lang === "en" ? "en" : "vi";
  const copy = blogCopy[selectedLang];

  document.querySelectorAll("[data-blog-copy]").forEach((element) => {
    const key = element.dataset.blogCopy;
    if (copy[key]) element.textContent = copy[key];
  });

  document.querySelectorAll("[data-blog-root]").forEach((rootElement) => {
    renderBlogCards(rootElement, selectedLang);
  });

  document.querySelectorAll("[data-blog-lang-option]").forEach((button) => {
    const isActive = button.dataset.blogLangOption === selectedLang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (shouldStore) storeBlogLang(selectedLang);
  updateBlogPageMeta(selectedLang);
  window.lucide?.createIcons();
}

if (document.querySelector("[data-blog-shell]")) {
  const initialBlogLang = getStoredBlogLang();
  document.querySelectorAll("[data-blog-lang-option]").forEach((button) => {
    button.addEventListener("click", () => applyBlogLanguage(button.dataset.blogLangOption));
  });
  applyBlogLanguage(initialBlogLang, false);
}

if (welcomeGate) {
  const welcomeSeenKey = "portfolio-welcome-seen";
  const forceWelcomeGate = new URLSearchParams(window.location.search).get("welcome") === "1";
  const shouldShowWelcome =
    !forceSolidHeader && !window.location.hash && (forceWelcomeGate || readSessionFlag(welcomeSeenKey) !== "true");

  function revealPortfolio() {
    document.body.classList.remove(welcomePendingClass);
    window.dispatchEvent(new CustomEvent("portfolio:visible"));
  }

  function closeWelcomeGate() {
    if (welcomeGate.hidden) return;
    window.dispatchEvent(new CustomEvent("portfolio:prepare"));
    revealPortfolio();
    welcomeGate.classList.remove("is-open");
    welcomeGate.classList.add("is-leaving");
    document.body.classList.remove("welcome-active");
    writeSessionFlag(welcomeSeenKey, "true");

    window.setTimeout(() => {
      welcomeGate.hidden = true;
      welcomeGate.classList.remove("is-leaving");
    }, 320);
  }

  function showWelcomeGate() {
    welcomeGate.hidden = false;
    document.body.classList.add("welcome-active");
    const openGate = () => {
      welcomeGate.classList.add("is-open");
      welcomeGate.focus({ preventScroll: true });
    };
    window.requestAnimationFrame(openGate);
    window.setTimeout(openGate, 32);
  }

  welcomeCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", closeWelcomeGate);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !welcomeGate.hidden) {
      closeWelcomeGate();
    }
  });

  if (shouldShowWelcome) {
    showWelcomeGate();
  } else {
    revealPortfolio();
  }
} else {
  document.body.classList.remove(welcomePendingClass);
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

const heroEntranceElements = hero
  ? hero.querySelectorAll(
      [
        ".eyebrow",
        "h1",
        ".hero-copy",
        ".brand-thesis span",
        ".tdat-signal",
        ".hero-actions .button",
        ".hero-command-card",
        ".hero-facts div",
        ".hero-scroll-indicator",
      ].join(", ")
    )
  : [];

function clearInlineMotionStyles(element) {
  element.style.opacity = "";
  element.style.transform = "";
  element.style.translate = "";
  element.style.rotate = "";
  element.style.scale = "";
}

if (hero && window.gsap && !prefersReducedMotion) {
  let heroEntrancePrepared = false;
  let heroEntrancePlayed = false;

  function prepareHeroEntrance() {
    if (heroEntrancePrepared || heroEntrancePlayed) return;
    heroEntrancePrepared = true;
    window.gsap.set(heroEntranceElements, { opacity: 0, y: 30 });
  }

  function playHeroEntrance() {
    if (heroEntrancePlayed) return;
    prepareHeroEntrance();
    heroEntrancePlayed = true;

    const heroTimeline = window.gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline
      .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.55 })
      .to(".hero h1", { opacity: 1, y: 0, duration: 0.8 }, "-=0.25")
      .to(".hero-copy", { opacity: 1, y: 0, duration: 0.58 }, "-=0.48")
      .to(".brand-thesis span", { opacity: 1, y: 0, duration: 0.42, stagger: 0.06 }, "-=0.34")
      .to(".tdat-signal", { opacity: 1, y: 0, duration: 0.42 }, "-=0.28")
      .to(".hero-actions .button", { opacity: 1, y: 0, duration: 0.42, stagger: 0.08 }, "-=0.28")
      .to(".hero-command-card", { opacity: 1, y: 0, duration: 0.62 }, "-=0.52")
      .to(".hero-facts div", { opacity: 1, y: 0, duration: 0.42, stagger: 0.08 }, "-=0.3")
      .to(".hero-scroll-indicator", { opacity: 1, y: 0, duration: 0.36 }, "-=0.2");

    window.setTimeout(() => {
      heroEntranceElements.forEach((element) => {
        if (getComputedStyle(element).opacity === "0") {
          clearInlineMotionStyles(element);
        }
      });
    }, 2600);
  }

  function requestHeroEntrance() {
    const delay = document.body.classList.contains("welcome-active") ? 90 : 0;
    window.setTimeout(() => window.requestAnimationFrame(playHeroEntrance), delay);
  }

  window.addEventListener("portfolio:prepare", prepareHeroEntrance, { once: true });

  if (document.body.classList.contains(welcomePendingClass) || document.body.classList.contains("welcome-active")) {
    window.addEventListener("portfolio:visible", requestHeroEntrance, { once: true });
  } else {
    requestHeroEntrance();
  }

  const canUseMouseParallax = !window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (canUseMouseParallax) {
    hero.addEventListener("mousemove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      window.gsap.to(".hero-content", { x: x * 5, y: y * 3, duration: 0.8, overwrite: true });
    });

    hero.addEventListener("mouseleave", () => {
      window.gsap.to(".hero-content", {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }
} else {
  heroEntranceElements.forEach(clearInlineMotionStyles);
}

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
  const tabGrid = commandCenter.querySelector(".command-tabs");
  const title = commandCenter.querySelector("[data-command-title]");
  const kpi = commandCenter.querySelector("[data-command-kpi]");
  const copy = commandCenter.querySelector("[data-command-copy]");
  const readout = commandCenter.querySelector(".command-readout");
  const sparklineBars = commandCenter.querySelectorAll(".command-sparkline span");

  function activateCommandTab(activeTab) {
    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });

    if (tabGrid) {
      const activeIndex = Array.from(tabs).indexOf(activeTab);
      tabGrid.style.setProperty("--active-col", String(Math.max(0, activeIndex % 2)));
      tabGrid.style.setProperty("--active-row", String(Math.max(0, Math.floor(activeIndex / 2))));
    }

    title.textContent = activeTab.dataset.title || "";
    kpi.textContent = activeTab.dataset.kpi || "";
    copy.textContent = activeTab.dataset.copy || "";

    const barValues = (activeTab.dataset.bars || "")
      .split(",")
      .map((value) => Number.parseFloat(value))
      .filter((value) => Number.isFinite(value));

    sparklineBars.forEach((bar, index) => {
      const nextHeight = barValues[index] || 50;
      bar.style.setProperty("--bar-height", `${Math.max(18, Math.min(nextHeight, 96))}%`);
    });

    if (readout && !prefersReducedMotion) {
      readout.classList.remove("is-pulsing");
      void readout.offsetWidth;
      readout.classList.add("is-pulsing");
      window.setTimeout(() => readout.classList.remove("is-pulsing"), 520);
    }
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
    ".fit-lens-readout",
    ".snapshot-list div",
    ".brand-principles article",
    ".ability-card",
    ".proof-path-card",
    ".decision-card",
    ".bi-product-card",
    ".blog-feature-note",
    ".blog-card",
    ".blog-placeholder-panel",
    ".blog-plan-card",
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
  function revealItem(item) {
    item.classList.add("is-revealed");
    window.setTimeout(() => {
      item.style.transitionDelay = "";
    }, 700);
  }

  function revealVisibleItems() {
    revealItems.forEach((item) => {
      if (item.classList.contains("is-revealed")) return;
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        revealItem(item);
      }
    });
  }

  revealItems.forEach((item) => {
    item.dataset.reveal = "";
  });

  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.set(revealItems, {
      opacity: 0,
      y: 55,
    });

    window.ScrollTrigger.batch(revealItems, {
      start: "top 80%",
      onEnter: (batch) => {
        batch.forEach((item) => item.classList.add("is-revealed"));
        window.gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform",
        });
      },
      once: true,
    });
  } else if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealItem(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
      revealObserver.observe(item);
    });
    window.requestAnimationFrame(revealVisibleItems);
  } else {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  }
}

window.lucide?.createIcons();
