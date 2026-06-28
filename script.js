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

const blogPosts = [
  {
    id: "agentic-ai-power-bi-part-1",
    slug: "power-bi-agentic-ai-part-1",
    status: "coming-soon",
    category: "Power BI / Agentic AI",
    tags: ["Finance", "Power BI", "AI workflow", "Decision tools"],
    title: {
      vi: "Xây Power BI cùng Agentic AI - Phần 1",
      en: "Building Power BI with Agentic AI - Part 1",
    },
    summary: {
      vi: "Cách tôi dùng AI agents để hỗ trợ quy trình Power BI mà vẫn giữ vai trò phán đoán tài chính.",
      en: "How I use AI agents to support a Power BI workflow without losing finance judgment.",
    },
    angle: {
      vi: "AI giúp tôi làm nhanh hơn, nhưng câu hỏi tài chính vẫn dẫn dắt toàn bộ công việc.",
      en: "AI helps me move faster, but the finance question still leads the work.",
    },
  },
];

const blogCopy = {
  vi: {
    homeKicker: "Nhật ký học hỏi",
    homeTitle: "Nơi chia sẻ kinh nghiệm từ quá trình học và xây dựng với tài chính, dữ liệu, công nghệ và AI.",
    homeIntro:
      "Tôi viết về những điều mình học được khi biến câu hỏi kinh doanh thành báo cáo, quy trình và quyết định rõ hơn.",
    homeSignalLabel: "Góc chia sẻ",
    homeSignalTitle: "Không phải blog kỹ thuật. Giống một nhật ký làm nghề hơn.",
    homeSignalBody:
      "Tôi chia sẻ bài học thực tế, lỗi đã gặp, những cải tiến nhỏ và cách suy nghĩ phía sau công việc finance. Công nghệ giúp tôi làm nhanh hơn, nhưng câu hỏi kinh doanh vẫn là điểm bắt đầu.",
    homeSignalOneLabel: "Tinh thần",
    homeSignalOneValue: "Học và chia sẻ",
    homeSignalTwoLabel: "Cách viết",
    homeSignalTwoValue: "Dễ hiểu, thực tế",
    blogPageKicker: "Nhật ký học hỏi",
    blogPageTitle: "Blog",
    blogPageIntro:
      "Nơi chia sẻ kinh nghiệm, quá trình học hỏi và những góc nhìn thực tế khi kết nối tài chính, dữ liệu, công nghệ và AI.",
    blogPagePill: "ENG / VN",
    statusComingSoon: "Sắp ra mắt",
    previewTopic: "Đọc ghi chú",
    cardMetaLabel: "Bài đầu tiên",
    articleKicker: "Power BI / Agentic AI",
    articleStatus: "Sắp ra mắt",
    articleTitle: "Xây Power BI cùng Agentic AI - Phần 1",
    articleSummary:
      "Cách tôi dùng AI agents để hỗ trợ quy trình Power BI mà vẫn giữ vai trò phán đoán tài chính.",
    articleLead:
      "Bài viết này sẽ chia sẻ cách tôi dùng AI như một người hỗ trợ: giúp đặt câu hỏi rõ hơn, phác thảo hướng làm, kiểm tra logic và chuẩn bị một báo cáo Power BI dễ hiểu hơn cho người xem.",
    articlePlanTitle: "Ghi chú này sẽ nói về",
    articlePlanOneTitle: "Bắt đầu từ câu hỏi",
    articlePlanOneBody: "Trước khi mở Power BI, cần hiểu người xem đang muốn quyết định điều gì và vì sao điều đó quan trọng.",
    articlePlanTwoTitle: "Xếp lại câu chuyện",
    articlePlanTwoBody: "Biến dữ liệu rời rạc thành một mạch xem dễ theo dõi: điều gì đang xảy ra, vì sao, và nên làm gì tiếp.",
    articlePlanThreeTitle: "Dùng AI đúng chỗ",
    articlePlanThreeBody: "AI hỗ trợ gợi ý cấu trúc, kiểm tra thiếu sót và tăng tốc thao tác, nhưng không thay phần phán đoán tài chính.",
    articlePlanFourTitle: "Kiểm tra trước khi chia sẻ",
    articlePlanFourBody: "Một báo cáo tốt cần đúng số, rõ ý, dễ đọc và giúp người xem tự tin hơn khi ra quyết định.",
    articleComingSoonTitle: "Ghi chú đầu tiên đang được chuẩn bị.",
    articleComingSoonBody:
      "Khi publish, bài sẽ ưu tiên cách nghĩ và ví dụ gần gũi, không biến AI hay Power BI thành phần quá kỹ thuật.",
    backToBlog: "Quay lại Blog",
  },
  en: {
    homeKicker: "Learning Log",
    homeTitle: "A place to share lessons from building with finance, data, technology, and AI.",
    homeIntro:
      "I write about what I learn while turning business questions into clearer reports, workflows, and decisions.",
    homeSignalLabel: "A working journal",
    homeSignalTitle: "Not a tech blog. More like a working journal.",
    homeSignalBody:
      "I share practical lessons, mistakes, small wins, and the thinking process behind finance work. Technology helps me work faster, but the business question still leads the work.",
    homeSignalOneLabel: "Spirit",
    homeSignalOneValue: "Learn and share",
    homeSignalTwoLabel: "Style",
    homeSignalTwoValue: "Clear and practical",
    blogPageKicker: "Learning Log",
    blogPageTitle: "Blog",
    blogPageIntro:
      "A place to share lessons, learning journeys, and practical reflections from connecting finance, data, technology, and AI.",
    blogPagePill: "ENG / VN",
    statusComingSoon: "Coming soon",
    previewTopic: "Read the note",
    cardMetaLabel: "First note",
    articleKicker: "Power BI / Agentic AI",
    articleStatus: "Coming soon",
    articleTitle: "Building Power BI with Agentic AI - Part 1",
    articleSummary:
      "How I use AI agents to support a Power BI workflow without losing finance judgment.",
    articleLead:
      "This note will share how I use AI as a helper: to clarify the question, shape the workflow, check the logic, and make a Power BI report easier for people to use.",
    articlePlanTitle: "This note will cover",
    articlePlanOneTitle: "Start with the question",
    articlePlanOneBody: "Before opening Power BI, understand what someone needs to decide and why that decision matters.",
    articlePlanTwoTitle: "Shape the story",
    articlePlanTwoBody: "Turn scattered data into a simple flow: what happened, why it happened, and what to do next.",
    articlePlanThreeTitle: "Use AI in the right places",
    articlePlanThreeBody: "AI can suggest structure, catch gaps, and speed up the work, but it should not replace finance judgment.",
    articlePlanFourTitle: "Check before sharing",
    articlePlanFourBody: "A good report should be accurate, clear, easy to read, and helpful for the next decision.",
    articleComingSoonTitle: "The first guide is being prepared.",
    articleComingSoonBody:
      "When published, this note will focus on practical thinking and plain examples, not a heavy technical walkthrough.",
    backToBlog: "Back to Blog",
  },
};

const blogPageMeta = {
  index: {
    vi: {
      title: "Blog | Truong Dinh Anh Tu",
      description: "Nơi chia sẻ kinh nghiệm, quá trình học hỏi và góc nhìn thực tế khi kết nối tài chính, dữ liệu, công nghệ và AI.",
    },
    en: {
      title: "Blog | Truong Dinh Anh Tu",
      description: "A place to share lessons, learning journeys, and practical reflections from connecting finance, data, technology, and AI.",
    },
  },
  article: {
    vi: {
      title: "Xây Power BI cùng Agentic AI - Phần 1 | Blog",
      description: "Bài sắp ra mắt về cách dùng AI agents để hỗ trợ quy trình Power BI mà vẫn giữ vai trò phán đoán tài chính.",
    },
    en: {
      title: "Building Power BI with Agentic AI - Part 1 | Blog",
      description: "Coming-soon note on using AI agents to support a Power BI workflow while keeping finance judgment at the center.",
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

function applyBlogLanguage(lang) {
  const selectedLang = lang === "vi" ? "vi" : "en";
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

  updateBlogPageMeta(selectedLang);
  window.lucide?.createIcons();
}

if (document.querySelector("[data-blog-shell]")) {
  document.querySelectorAll("[data-blog-lang-option]").forEach((button) => {
    button.addEventListener("click", () => applyBlogLanguage(button.dataset.blogLangOption));
  });
  applyBlogLanguage("en");
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
