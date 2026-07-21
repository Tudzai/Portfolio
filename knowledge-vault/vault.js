(() => {
  "use strict";

  const AUTO_LOCK_MS = 15 * 60 * 1000;
  const VAULT_AAD = "knowledge-vault:v1";
  const STORAGE_COMPLETED = "fintech-domain:completed:v1";
  const STORAGE_THEME = "fintech-domain:theme:v1";
  const SECTION_TITLES = [
    "Mục tiêu của bài học",
    "Khái niệm chính",
    "Vì sao nội dung này quan trọng",
    "Cách nó hoạt động",
    "Các bên liên quan",
    "Ví dụ thực tế đơn giản",
    "Mô hình doanh thu hoặc tác động tài chính",
    "Rủi ro và hạn chế",
    "Sự khác biệt giữa các thị trường hoặc quy định",
    "Các thuật ngữ cần nhớ",
    "Tóm tắt bài học",
    "Nguồn tham khảo",
  ];
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const unlockView = document.querySelector("[data-unlock-view]");
  const vaultView = document.querySelector("[data-vault-view]");
  const unlockCard = document.querySelector("[data-unlock-card]");
  const unlockForm = document.querySelector("[data-unlock-form]");
  const passwordInput = document.querySelector("[data-password-input]");
  const passwordToggle = document.querySelector("[data-password-toggle]");
  const unlockButton = document.querySelector("[data-unlock-button]");
  const unlockButtonLabel = unlockButton?.querySelector("span");
  const unlockStatus = document.querySelector("[data-unlock-status]");
  const headerStatus = document.querySelector("[data-header-status]");
  const lockButton = document.querySelector("[data-lock-button]");
  const domainHomeButton = document.querySelector("[data-domain-home]");
  const curriculumMeta = document.querySelector("[data-curriculum-meta]");
  const moduleList = document.querySelector("[data-module-list]");
  const progressLabel = document.querySelector("[data-progress-label]");
  const progressDetail = document.querySelector("[data-progress-detail]");
  const sidebarProgress = document.querySelector("[data-sidebar-progress]");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const sidebarOpenButton = document.querySelector("[data-sidebar-open]");
  const sidebarCloseButton = document.querySelector("[data-sidebar-close]");
  const sidebarScrim = document.querySelector("[data-sidebar-scrim]");
  const workspace = document.querySelector(".workspace");
  const readingProgress = document.querySelector("[data-reading-progress]");
  const lessonReader = document.querySelector("[data-lesson-reader]");
  const toast = document.querySelector("[data-toast]");

  const state = {
    data: null,
    sourceMap: new Map(),
    selectedId: null,
    selectedCollectionId: null,
    openCollections: new Set(),
    openModules: new Set(),
    completed: new Set(),
    autoLockTimer: null,
    lastActivityAt: 0,
    toastTimer: null,
  };

  function decodeBase64(value) {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function normalizeString(value, fallback = "") {
    return typeof value === "string" ? value.trim() : fallback;
  }

  function normalizeStringArray(value) {
    return Array.isArray(value) ? value.map((item) => normalizeString(item)).filter(Boolean) : [];
  }

  function safeExternalUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function normalizeSource(source, index) {
    return {
      id: normalizeString(source?.id, `source-${index + 1}`),
      title: normalizeString(source?.title, "Nguồn chưa đặt tên"),
      organization: normalizeString(source?.organization, "Tổ chức chưa xác định"),
      publishedAt: normalizeString(source?.publishedAt, "Không nêu ngày"),
      url: safeExternalUrl(source?.url),
      scope: normalizeString(source?.scope),
      sourceType: normalizeString(source?.sourceType, "Nguồn chính thống"),
    };
  }

  function normalizeBlock(block) {
    if (!block || typeof block !== "object") return null;
    const type = normalizeString(block.type);
    if (type === "paragraph") return { type, text: normalizeString(block.text) };
    if (type === "list") return { type, items: normalizeStringArray(block.items), ordered: Boolean(block.ordered) };
    if (type === "callout") {
      return {
        type,
        label: normalizeString(block.label, "Lưu ý"),
        text: normalizeString(block.text),
        tone: normalizeString(block.tone, "note"),
      };
    }
    if (type === "table") {
      return {
        type,
        headers: normalizeStringArray(block.headers),
        rows: Array.isArray(block.rows) ? block.rows.map((row) => normalizeStringArray(row)) : [],
      };
    }
    if (type === "flow") {
      return {
        type,
        steps: Array.isArray(block.steps)
          ? block.steps.map((step, index) => ({
              label: normalizeString(step?.label, `Bước ${index + 1}`),
              title: normalizeString(step?.title),
              detail: normalizeString(step?.detail),
            }))
          : [],
      };
    }
    return null;
  }

  function normalizeLesson(lesson, moduleId, index) {
    const sections = Array.isArray(lesson?.sections)
      ? lesson.sections.map((section, sectionIndex) => ({
          id: normalizeString(section?.id, `section-${sectionIndex + 1}`),
          title: normalizeString(section?.title, SECTION_TITLES[sectionIndex] || `Phần ${sectionIndex + 1}`),
          blocks: Array.isArray(section?.blocks) ? section.blocks.map(normalizeBlock).filter(Boolean) : [],
        }))
      : [];

    return {
      id: normalizeString(lesson?.id, `${moduleId}-lesson-${index + 1}`),
      title: normalizeString(lesson?.title, `Bài ${index + 1}`),
      summary: normalizeString(lesson?.summary, "Nội dung sẽ được nghiên cứu và bổ sung theo lộ trình."),
      status: lesson?.status === "published" ? "published" : "planned",
      estimatedMinutes: Number.isFinite(lesson?.estimatedMinutes) ? lesson.estimatedMinutes : null,
      lastReviewed: normalizeString(lesson?.lastReviewed),
      keywords: normalizeStringArray(lesson?.keywords),
      sections,
      references: normalizeStringArray(lesson?.references),
    };
  }

  function normalizeModule(module, index, collectionId = "fintech-domain") {
    const id = normalizeString(module?.id, `module-${index + 1}`);
    return {
      id,
      collectionId,
      number: normalizeString(module?.number, String(index + 1).padStart(2, "0")),
      title: normalizeString(module?.title, `Module ${index + 1}`),
      level: normalizeString(module?.level, "Foundation"),
      description: normalizeString(module?.description),
      lessons: Array.isArray(module?.lessons)
        ? module.lessons.map((lesson, lessonIndex) => normalizeLesson(lesson, id, lessonIndex))
        : [],
    };
  }

  function legacyData(value) {
    const legacySources = [];
    const lessons = (value.notes || []).map((note, index) => {
      const sourceId = `legacy-source-${index + 1}`;
      if (note.sourceLabel || note.sourceUrl) {
        legacySources.push({
          id: sourceId,
          title: normalizeString(note.sourceLabel, "Nguồn ghi chú cũ"),
          organization: "Kho ghi chú cá nhân",
          publishedAt: normalizeString(note.updatedAt, "Không nêu ngày"),
          url: note.sourceUrl,
          scope: "Nguồn được chuyển đổi từ schema vault trước đây.",
        });
      }
      return {
        id: normalizeString(note.id, `legacy-note-${index + 1}`),
        title: normalizeString(note.title, `Ghi chú ${index + 1}`),
        summary: normalizeString(note.summary),
        status: "published",
        estimatedMinutes: null,
        lastReviewed: normalizeString(note.updatedAt),
        keywords: normalizeStringArray(note.tags),
        sections: [
          {
            id: "legacy-content",
            title: "Nội dung ghi chú",
            blocks: (note.content || []).map((text) => ({ type: "paragraph", text })),
          },
        ],
        references: legacySources.some((source) => source.id === sourceId) ? [sourceId] : [],
      };
    });

    return {
      title: normalizeString(value.title, "Personal Knowledge Vault"),
      owner: normalizeString(value.owner),
      updatedAt: normalizeString(value.updatedAt),
      reviewedAt: normalizeString(value.updatedAt),
      description: "Các ghi chú đã có trong phiên bản thư viện trước được giữ nguyên để tiếp tục đọc và tra cứu.",
      mentalModel: [],
      sourcePolicy: [],
      primarySources: legacySources,
      modules: [
        {
          id: "legacy-notes",
          number: "00",
          title: "Ghi chú hiện có",
          level: "Legacy",
          description: "Nội dung từ phiên bản Knowledge Vault trước.",
          lessons,
        },
      ],
    };
  }

  function normalizeVaultData(value) {
    if (!value || typeof value !== "object") throw new Error("Invalid library data.");
    if (!Array.isArray(value.modules)) {
      if (Array.isArray(value.notes)) {
        return normalizeVaultData({
          title: "Knowledge Library",
          owner: value.owner,
          updatedAt: value.updatedAt,
          reviewedAt: value.updatedAt,
          description: "Thư viện tri thức cá nhân.",
          mentalModel: [],
          sourcePolicy: [],
          primarySources: [],
          modules: [],
          archivedVault: value,
        });
      }
      throw new Error("Library data must include a module list.");
    }

    const finTechSources = Array.isArray(value.primarySources) ? value.primarySources.map(normalizeSource) : [];
    const finTechPolicy = Array.isArray(value.sourcePolicy)
      ? value.sourcePolicy.map((item, index) => ({
          title: normalizeString(item?.title, `Nguyên tắc ${index + 1}`),
          description: normalizeString(item?.description),
        }))
      : [];
    const collections = [];
    const allSources = [];

    if (value.archivedVault && Array.isArray(value.archivedVault.notes) && value.archivedVault.notes.length) {
      const archived = legacyData(value.archivedVault);
      const archivedSources = archived.primarySources.map(normalizeSource);
      const archivedModules = archived.modules.map((module, index) => normalizeModule(module, index, "personal-notes"));
      collections.push({
        id: "personal-notes",
        mark: "PN",
        kind: "notes",
        title: normalizeString(archived.title, "Ghi chú của tôi"),
        description: archived.description,
        updatedAt: normalizeString(archived.updatedAt),
        reviewedAt: normalizeString(archived.reviewedAt),
        mentalModel: [],
        sourcePolicy: [],
        primarySources: archivedSources,
        modules: archivedModules,
      });
      allSources.push(...archivedSources);
    }

    if (value.modules.length) {
      const finTechModules = value.modules.map((module, index) => normalizeModule(module, index, "fintech-domain"));
      collections.push({
        id: "fintech-domain",
        mark: "FT",
        kind: "curriculum",
        title: normalizeString(value.title, "FinTech Domain"),
        description: normalizeString(value.description),
        updatedAt: normalizeString(value.updatedAt),
        reviewedAt: normalizeString(value.reviewedAt),
        mentalModel: normalizeStringArray(value.mentalModel),
        sourcePolicy: finTechPolicy,
        primarySources: finTechSources,
        modules: finTechModules,
      });
      allSources.push(...finTechSources);
    }

    if (!collections.length) throw new Error("The library must contain at least one collection.");

    const data = {
      title: "Personal Knowledge Library",
      owner: normalizeString(value.owner),
      updatedAt: normalizeString(value.updatedAt),
      description: "A home for knowledge gathered across different subjects. FinTech is one collection, with more topics added over time.",
      collections,
      primarySources: allSources,
      modules: collections.flatMap((collection) => collection.modules),
    };

    const ids = [];
    data.modules.forEach((module) => module.lessons.forEach((lesson) => ids.push(lesson.id)));
    if (new Set(ids).size !== ids.length) throw new Error("Every reading item must have a unique ID.");
    return data;
  }

  async function deriveVaultKey(password, payload) {
    const sourceKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        hash: payload.kdf.hash,
        salt: decodeBase64(payload.kdf.salt),
        iterations: payload.kdf.iterations,
      },
      sourceKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
  }

  async function decryptVault(password) {
    const payload = window.__KNOWLEDGE_VAULT_DATA__;
    if (!payload || payload.version !== 1) throw new Error("Encrypted library data was not found.");
    const key = await deriveVaultKey(password, payload);
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: decodeBase64(payload.cipher.iv),
        additionalData: encoder.encode(VAULT_AAD),
        tagLength: 128,
      },
      key,
      decodeBase64(payload.ciphertext),
    );
    return normalizeVaultData(JSON.parse(decoder.decode(decrypted)));
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
  }

  function loadCompleted() {
    try {
      const value = JSON.parse(window.localStorage.getItem(STORAGE_COMPLETED) || "[]");
      return new Set(Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);
    } catch {
      return new Set();
    }
  }

  function saveCompleted() {
    try {
      window.localStorage.setItem(STORAGE_COMPLETED, JSON.stringify(Array.from(state.completed)));
    } catch {
      showToast("Progress could not be saved on this device.");
    }
  }

  function allLessons() {
    if (!state.data) return [];
    return state.data.collections.flatMap((collection) =>
      collection.modules.flatMap((module) => module.lessons.map((lesson) => ({ collection, module, lesson }))),
    );
  }

  function publishedLessons() {
    return allLessons().filter(({ lesson }) => lesson.status === "published");
  }

  function currentEntry() {
    return allLessons().find(({ lesson }) => lesson.id === state.selectedId) || null;
  }

  function blockSearchText(block) {
    if (block.type === "paragraph") return block.text;
    if (block.type === "list") return block.items.join(" ");
    if (block.type === "callout") return `${block.label} ${block.text}`;
    if (block.type === "table") return [...block.headers, ...block.rows.flat()].join(" ");
    if (block.type === "flow") return block.steps.map((step) => `${step.label} ${step.title} ${step.detail}`).join(" ");
    return "";
  }

  function lessonSearchText(entry) {
    return [
      entry.collection.title,
      entry.module.title,
      entry.lesson.title,
      entry.lesson.summary,
      ...entry.lesson.keywords,
      ...entry.lesson.sections.flatMap((section) => [section.title, ...section.blocks.map(blockSearchText)]),
    ]
      .join(" ")
      .toLocaleLowerCase("vi");
  }

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    state.toastTimer = window.setTimeout(() => {
      toast.hidden = true;
      toast.textContent = "";
    }, 2600);
  }

  function setTheme(theme, persist = true) {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f3f6f5" : "#0a1118");
    themeLabel.textContent = next === "light" ? "Dark" : "Light";
    themeToggle.setAttribute("aria-label", next === "light" ? "Switch to dark mode" : "Switch to light mode");
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_THEME, next);
      } catch {
        // Theme remains applied for the current session.
      }
    }
  }

  function initializeTheme() {
    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_THEME);
    } catch {
      stored = null;
    }
    const preferred = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(stored || preferred, false);
  }

  function updateProgress() {
    const published = publishedLessons();
    const validIds = new Set(published.map(({ lesson }) => lesson.id));
    const completed = Array.from(state.completed).filter((id) => validIds.has(id)).length;
    const percent = published.length ? Math.round((completed / published.length) * 100) : 0;
    progressLabel.textContent = `${percent}%`;
    progressDetail.textContent = `${completed} / ${published.length} available reading items completed`;
    sidebarProgress.style.width = `${percent}%`;
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  function openSidebar() {
    document.body.classList.add("sidebar-open");
  }

  function renderNavigation() {
    moduleList.replaceChildren();
    state.data.collections.forEach((collection) => {
      const collectionGroup = document.createElement("section");
      collectionGroup.className = "collection-nav";
      const collectionExpanded = state.openCollections.has(collection.id);

      const collectionButton = document.createElement("button");
      collectionButton.type = "button";
      collectionButton.className = "collection-nav__head";
      collectionButton.dataset.collectionId = collection.id;
      collectionButton.setAttribute("aria-expanded", String(collectionExpanded));
      if (collection.id === state.selectedCollectionId) {
        collectionButton.classList.add("is-current");
        collectionButton.setAttribute("aria-current", "page");
      }
      const mark = document.createElement("span");
      mark.className = "collection-nav__mark";
      mark.textContent = collection.mark;
      const collectionCopy = document.createElement("span");
      const collectionTitle = document.createElement("strong");
      collectionTitle.textContent = collection.title;
      const collectionMeta = document.createElement("small");
      const collectionEntries = collection.modules.reduce((total, module) => total + module.lessons.length, 0);
      const collectionLive = collection.modules.reduce(
        (total, module) => total + module.lessons.filter((lesson) => lesson.status === "published").length,
        0,
      );
      collectionMeta.textContent = collection.kind === "notes"
        ? `${collectionEntries} preserved ${collectionEntries === 1 ? "note" : "notes"}`
        : `${collection.modules.length} modules · ${collectionLive} available lessons`;
      collectionCopy.append(collectionTitle, collectionMeta);
      const collectionArrow = document.createElement("span");
      collectionArrow.className = "collection-nav__chevron";
      collectionArrow.setAttribute("aria-hidden", "true");
      collectionArrow.textContent = "›";
      collectionButton.append(mark, collectionCopy, collectionArrow);

      const collectionBody = document.createElement("div");
      collectionBody.className = "collection-nav__body";
      collectionBody.id = `collection-${collection.id}`;
      collectionBody.hidden = !collectionExpanded;
      collectionButton.setAttribute("aria-controls", collectionBody.id);

      collection.modules.forEach((module) => {
        const group = document.createElement("section");
        group.className = "module-group";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "module-toggle";
        toggle.dataset.moduleId = module.id;
        const expanded = state.openModules.has(module.id);
        toggle.setAttribute("aria-expanded", String(expanded));

        const number = document.createElement("span");
        number.className = "module-number";
        number.textContent = module.number;
        const copy = document.createElement("span");
        copy.className = "module-toggle__copy";
        const title = document.createElement("strong");
        title.textContent = module.title;
        const meta = document.createElement("small");
        const liveCount = module.lessons.filter((lesson) => lesson.status === "published").length;
        meta.textContent = collection.kind === "notes"
          ? `${module.lessons.length} ${module.lessons.length === 1 ? "note" : "notes"}`
          : `${module.lessons.length} lessons${liveCount ? ` · ${liveCount} available` : " · research pending"}`;
        copy.append(title, meta);
        const chevron = document.createElement("span");
        chevron.className = "module-chevron";
        chevron.setAttribute("aria-hidden", "true");
        chevron.textContent = "›";
        toggle.append(number, copy, chevron);

        const lessons = document.createElement("div");
        lessons.className = "lesson-list";
        lessons.hidden = !expanded;
        lessons.id = `lessons-${module.id}`;
        toggle.setAttribute("aria-controls", lessons.id);

        module.lessons.forEach((lesson) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = `lesson-link ${lesson.status === "planned" ? "is-planned" : ""} ${state.completed.has(lesson.id) ? "is-complete" : ""}`;
          button.dataset.lessonId = lesson.id;
          if (lesson.id === state.selectedId) button.setAttribute("aria-current", "page");
          const label = document.createElement("span");
          label.textContent = lesson.title;
          const lessonState = document.createElement("span");
          lessonState.className = "lesson-link__state";
          lessonState.setAttribute("aria-hidden", "true");
          lessonState.textContent = state.completed.has(lesson.id) ? "✓" : "";
          button.append(label, lessonState);
          lessons.append(button);
        });

        group.append(toggle, lessons);
        collectionBody.append(group);
      });

      collectionGroup.append(collectionButton, collectionBody);
      moduleList.append(collectionGroup);
    });
    updateProgress();
  }

  function appendRichText(element, text, lesson) {
    const pattern = /\[\[([a-z0-9-]+)\]\]/gi;
    let cursor = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > cursor) element.append(document.createTextNode(text.slice(cursor, match.index)));
      const sourceId = match[1];
      const source = state.sourceMap.get(sourceId);
      const referenceIndex = lesson?.references.indexOf(sourceId) ?? -1;
      if (source && referenceIndex >= 0) {
        const citation = document.createElement("a");
        citation.className = "inline-citation";
        citation.href = `#ref-${sourceId}`;
        citation.textContent = String(referenceIndex + 1);
        citation.title = `${source.organization}: ${source.title}`;
        citation.setAttribute("aria-label", `Source ${referenceIndex + 1}: ${source.title}`);
        element.append(citation);
      } else {
        element.append(document.createTextNode(match[0]));
      }
      cursor = pattern.lastIndex;
    }
    if (cursor < text.length) element.append(document.createTextNode(text.slice(cursor)));
  }

  function renderBlock(block, lesson) {
    if (block.type === "paragraph") {
      const paragraph = document.createElement("p");
      paragraph.className = "content-block content-paragraph";
      appendRichText(paragraph, block.text, lesson);
      return paragraph;
    }
    if (block.type === "list") {
      const list = document.createElement(block.ordered ? "ol" : "ul");
      list.className = "content-block content-list";
      block.items.forEach((item) => {
        const row = document.createElement("li");
        appendRichText(row, item, lesson);
        list.append(row);
      });
      return list;
    }
    if (block.type === "callout") {
      const callout = document.createElement("aside");
      callout.className = "content-block content-callout";
      callout.dataset.tone = block.tone;
      const label = document.createElement("strong");
      label.textContent = block.label;
      const paragraph = document.createElement("p");
      appendRichText(paragraph, block.text, lesson);
      callout.append(label, paragraph);
      return callout;
    }
    if (block.type === "table") {
      const wrap = document.createElement("div");
      wrap.className = "content-block table-wrap";
      wrap.setAttribute("tabindex", "0");
      wrap.setAttribute("aria-label", "Scrollable comparison table");
      const table = document.createElement("table");
      table.className = "content-table";
      const head = document.createElement("thead");
      const headRow = document.createElement("tr");
      block.headers.forEach((header) => {
        const cell = document.createElement("th");
        cell.scope = "col";
        appendRichText(cell, header, lesson);
        headRow.append(cell);
      });
      head.append(headRow);
      const body = document.createElement("tbody");
      block.rows.forEach((row) => {
        const tableRow = document.createElement("tr");
        row.forEach((value) => {
          const cell = document.createElement("td");
          appendRichText(cell, value, lesson);
          tableRow.append(cell);
        });
        body.append(tableRow);
      });
      table.append(head, body);
      wrap.append(table);
      return wrap;
    }
    if (block.type === "flow") {
      const flow = document.createElement("div");
      flow.className = "content-block flow-diagram";
      flow.setAttribute("role", "img");
      flow.setAttribute("aria-label", `Flow with ${block.steps.length} steps`);
      block.steps.forEach((step) => {
        const card = document.createElement("div");
        card.className = "flow-step";
        const label = document.createElement("span");
        label.textContent = step.label;
        const title = document.createElement("strong");
        title.textContent = step.title;
        const detail = document.createElement("small");
        detail.textContent = step.detail;
        card.append(label, title, detail);
        flow.append(card);
      });
      return flow;
    }
    return document.createDocumentFragment();
  }

  function createReaderHero(entry) {
    const { collection, module, lesson } = entry;
    const hero = document.createElement("header");
    hero.className = "reader-hero";
    const breadcrumb = document.createElement("p");
    breadcrumb.className = "reader-breadcrumb";
    const domain = document.createElement("span");
    domain.textContent = "Library";
    const separator = document.createElement("span");
    separator.textContent = "/";
    const collectionName = document.createElement("span");
    collectionName.textContent = collection.title;
    const secondSeparator = document.createElement("span");
    secondSeparator.textContent = "/";
    const moduleName = document.createElement("span");
    moduleName.textContent = `${module.number}. ${module.title}`;
    breadcrumb.append(domain, separator, collectionName, secondSeparator, moduleName);
    const title = document.createElement("h1");
    title.textContent = lesson.title;
    const deck = document.createElement("p");
    deck.className = "reader-deck";
    deck.textContent = lesson.summary;
    const meta = document.createElement("div");
    meta.className = "reader-meta";
    const status = document.createElement("span");
    status.className = lesson.status === "published" ? "status-live" : "status-planned";
    status.textContent = collection.kind === "notes"
      ? "Saved"
      : lesson.status === "published"
        ? "Verified"
        : "Research pending";
    const level = document.createElement("span");
    level.textContent = module.level;
    meta.append(status, level);
    if (lesson.estimatedMinutes) {
      const duration = document.createElement("span");
      duration.textContent = `${lesson.estimatedMinutes} min read`;
      meta.append(duration);
    }
    if (lesson.lastReviewed) {
      const reviewed = document.createElement("span");
      reviewed.textContent = `Reviewed: ${formatDate(lesson.lastReviewed)}`;
      meta.append(reviewed);
    }

    const tools = document.createElement("div");
    tools.className = "reader-tools";
    const complete = document.createElement("button");
    complete.type = "button";
    complete.className = "complete-button";
    complete.dataset.completeLesson = lesson.id;
    complete.disabled = lesson.status !== "published";
    complete.setAttribute("aria-pressed", String(state.completed.has(lesson.id)));
    const check = document.createElement("span");
    check.className = "complete-button__check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = state.completed.has(lesson.id) ? "✓" : "";
    const completeText = document.createElement("span");
    completeText.textContent = lesson.status === "published"
      ? state.completed.has(lesson.id)
        ? "Completed"
        : "Mark as completed"
      : "Not yet available";
    complete.append(check, completeText);
    const policy = document.createElement("button");
    policy.type = "button";
    policy.className = "source-policy-link";
    policy.dataset.showSources = "true";
    policy.dataset.collectionId = collection.id;
    policy.textContent = collection.kind === "curriculum" ? "Methodology & primary sources" : "About this notes collection";
    tools.append(complete, policy);
    hero.append(breadcrumb, title, deck, meta, tools);
    return hero;
  }

  function renderReferences(lesson, collectionKind = "curriculum") {
    const section = document.createElement("section");
    section.className = "lesson-section";
    section.id = "section-references";
    const heading = document.createElement("div");
    heading.className = "section-heading";
    const number = document.createElement("span");
    number.textContent = String(lesson.sections.length + 1).padStart(2, "0");
    const title = document.createElement("h2");
    title.textContent = "Nguồn tham khảo";
    heading.append(number, title);
    const list = document.createElement("ol");
    list.className = "reference-list";
    lesson.references.forEach((sourceId, index) => {
      const source = state.sourceMap.get(sourceId);
      if (!source) return;
      const item = document.createElement("li");
      item.className = "reference-item";
      item.id = `ref-${sourceId}`;
      const numberLabel = document.createElement("span");
      numberLabel.className = "reference-item__number";
      numberLabel.textContent = String(index + 1).padStart(2, "0");
      const copy = document.createElement("div");
      const sourceTitle = document.createElement("strong");
      sourceTitle.textContent = source.title;
      const organization = document.createElement("span");
      organization.textContent = source.organization;
      const date = document.createElement("small");
      date.textContent = `${source.publishedAt} · ${source.sourceType}`;
      copy.append(sourceTitle, organization, date);
      item.append(numberLabel, copy);
      if (source.url) {
        const link = document.createElement("a");
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        link.textContent = "Open source ↗";
        item.append(link);
      }
      list.append(item);
    });
    if (!list.children.length) {
      const empty = document.createElement("p");
      empty.className = "content-paragraph";
      empty.textContent = collectionKind === "notes"
        ? "No reference has been saved for this note."
        : "References will be added after this lesson has been researched and cross-checked.";
      section.append(heading, empty);
      return section;
    }
    section.append(heading, list);
    return section;
  }

  function renderLessonNavigation(entry) {
    const entries = allLessons().filter(({ collection }) => collection.id === entry.collection.id);
    const index = entries.findIndex(({ lesson }) => lesson.id === entry.lesson.id);
    const previous = entries[index - 1] || null;
    const next = entries[index + 1] || null;
    const nav = document.createElement("nav");
    nav.className = "lesson-nav";
    nav.setAttribute("aria-label", "Previous and next reading items");
    [
      { label: "← Previous", entry: previous },
      { label: "Next →", entry: next },
    ].forEach(({ label, entry: target }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = !target;
      if (target) button.dataset.lessonId = target.lesson.id;
      const small = document.createElement("small");
      small.textContent = label;
      const title = document.createElement("strong");
      title.textContent = target ? target.lesson.title : "No item";
      button.append(small, title);
      nav.append(button);
    });
    return nav;
  }

  function renderPublishedLesson(entry) {
    const fragment = document.createDocumentFragment();
    fragment.append(createReaderHero(entry));
    const body = document.createElement("div");
    body.className = "lesson-body";
    entry.lesson.sections.forEach((sectionData, index) => {
      const section = document.createElement("section");
      section.className = "lesson-section";
      section.id = `section-${sectionData.id}`;
      const heading = document.createElement("div");
      heading.className = "section-heading";
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("h2");
      title.textContent = sectionData.title;
      heading.append(number, title);
      section.append(heading);
      sectionData.blocks.forEach((block) => section.append(renderBlock(block, entry.lesson)));
      body.append(section);
    });
    body.append(renderReferences(entry.lesson, entry.collection.kind));
    fragment.append(body, renderLessonNavigation(entry));
    return fragment;
  }

  function renderPlannedLesson(entry) {
    const fragment = document.createDocumentFragment();
    fragment.append(createReaderHero(entry));
    const template = document.createElement("section");
    template.className = "planned-template";
    const title = document.createElement("h2");
    title.textContent = "Lesson framework ready";
    const description = document.createElement("p");
    description.textContent =
      "This lesson has not been published, keeping unverified knowledge out of the library. Once researched, it will follow the same structure, inline citation format, and source standard as Module 1.";
    const sections = document.createElement("div");
    sections.className = "planned-sections";
    SECTION_TITLES.forEach((sectionTitle, index) => {
      const row = document.createElement("span");
      row.textContent = `${String(index + 1).padStart(2, "0")} · ${sectionTitle}`;
      sections.append(row);
    });
    template.append(title, description, sections);
    fragment.append(template, renderLessonNavigation(entry));
    return fragment;
  }

  function createHomeStats(items) {
    const stats = document.createElement("div");
    stats.className = "home-stats";
    items.forEach(([value, label]) => {
      const card = document.createElement("div");
      const number = document.createElement("strong");
      number.textContent = String(value);
      const text = document.createElement("span");
      text.textContent = label;
      card.append(number, text);
      stats.append(card);
    });
    return stats;
  }

  function createHomeHero(eyebrowText, titleText, ledeText, stats) {
    const hero = document.createElement("section");
    hero.className = "home-hero";
    const copy = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    const line = document.createElement("span");
    line.setAttribute("aria-hidden", "true");
    eyebrow.append(line, document.createTextNode(eyebrowText));
    const title = document.createElement("h1");
    title.textContent = titleText;
    const lede = document.createElement("p");
    lede.className = "home-hero__lede";
    lede.textContent = ledeText;
    copy.append(eyebrow, title, lede);
    hero.append(copy, createHomeStats(stats));
    return hero;
  }

  function createHomeSectionHead(titleText, copyText) {
    const head = document.createElement("div");
    head.className = "home-section__head";
    const title = document.createElement("h2");
    title.textContent = titleText;
    const copy = document.createElement("p");
    copy.textContent = copyText;
    head.append(title, copy);
    return head;
  }

  function finishHomeRender() {
    renderNavigation();
    workspace.scrollTo({ top: 0, behavior: "auto" });
    updateReadingProgress();
  }

  function renderHome() {
    state.selectedId = null;
    state.selectedCollectionId = null;
    document.title = "Knowledge Library | Private Learning Space";
    lessonReader.replaceChildren();
    const all = allLessons();
    const live = publishedLessons();
    const hero = createHomeHero(
      "Private learning library",
      state.data.title,
      state.data.description,
      [
        [state.data.collections.length, "knowledge collections"],
        [state.data.modules.length, "structured content groups"],
        [all.length, "lessons and notes"],
        [live.length, "available reading items"],
      ],
    );

    const collections = document.createElement("section");
    collections.className = "home-section";
    collections.append(createHomeSectionHead(
      "My collections",
      "Each subject has its own structure. Existing knowledge stays intact, while FinTech is one of the learning areas growing over time.",
    ));
    const grid = document.createElement("div");
    grid.className = "collection-grid";
    state.data.collections.forEach((collection) => {
      const entries = collection.modules.flatMap((module) => module.lessons);
      const liveCount = entries.filter((lesson) => lesson.status === "published").length;
      const card = document.createElement("article");
      card.className = "collection-card";
      const top = document.createElement("div");
      top.className = "collection-card__top";
      const mark = document.createElement("span");
      mark.textContent = collection.mark;
      const type = document.createElement("span");
      type.textContent = collection.kind === "notes" ? "Personal notes" : "Learning domain";
      top.append(mark, type);
      const title = document.createElement("h2");
      title.textContent = collection.title;
      const description = document.createElement("p");
      description.textContent = collection.description;
      const metrics = document.createElement("div");
      metrics.className = "collection-card__metrics";
      metrics.append(
        Object.assign(document.createElement("span"), { textContent: `${collection.modules.length} groups` }),
        Object.assign(document.createElement("span"), { textContent: `${entries.length} reading items` }),
        Object.assign(document.createElement("span"), { textContent: `${liveCount} available` }),
      );
      const open = document.createElement("button");
      open.type = "button";
      open.dataset.openCollection = collection.id;
      open.textContent = "Open collection →";
      card.append(top, title, description, metrics, open);
      grid.append(card);
    });
    collections.append(grid);
    lessonReader.append(hero, collections);
    finishHomeRender();
  }

  function renderCollectionHome(collectionId) {
    const collection = state.data.collections.find((item) => item.id === collectionId);
    if (!collection) return;
    state.selectedId = null;
    state.selectedCollectionId = collection.id;
    state.openCollections.add(collection.id);
    document.title = `${collection.title} | Knowledge Library`;
    lessonReader.replaceChildren();
    const entries = collection.modules.flatMap((module) => module.lessons);
    const live = entries.filter((lesson) => lesson.status === "published");
    const hero = createHomeHero(
      collection.kind === "notes" ? "Personal notes collection" : "Structured learning domain",
      collection.title,
      collection.description,
      [
        [collection.modules.length, collection.kind === "notes" ? "note groups" : "learning modules"],
        [entries.length, "reading items in this collection"],
        [live.length, "currently available"],
        [collection.primarySources.length, "saved sources"],
      ],
    );
    const sections = [hero];

    if (collection.kind === "notes") {
      const notes = document.createElement("section");
      notes.className = "home-section";
      notes.append(createHomeSectionHead(
        "Preserved notes",
        "This content comes from the previous library. You can keep reading, searching, and marking items as completed.",
      ));
      const noteGrid = document.createElement("div");
      noteGrid.className = "module-overview note-overview";
      collection.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          const card = document.createElement("article");
          card.className = "module-card note-card";
          const top = document.createElement("div");
          top.className = "module-card__top";
          const type = document.createElement("span");
          type.textContent = "NOTE";
          const date = document.createElement("span");
          date.textContent = lesson.lastReviewed ? formatDate(lesson.lastReviewed) : "Saved";
          top.append(type, date);
          const title = document.createElement("h3");
          title.textContent = lesson.title;
          const summary = document.createElement("p");
          summary.textContent = lesson.summary;
          const open = document.createElement("button");
          open.type = "button";
          open.dataset.lessonId = lesson.id;
          open.textContent = "Read note →";
          card.append(top, title, summary, open);
          noteGrid.append(card);
        });
      });
      notes.append(noteGrid);
      sections.push(notes);
    } else {
      if (collection.mentalModel.length) {
        const mental = document.createElement("section");
        mental.className = "home-section";
        mental.append(createHomeSectionHead(
          "Seven-layer mental model",
          "Use one consistent framework to understand every FinTech product, company, and business model.",
        ));
        const mentalGrid = document.createElement("div");
        mentalGrid.className = "mental-model";
        collection.mentalModel.forEach((item, index) => {
          const card = document.createElement("article");
          const number = document.createElement("span");
          number.textContent = String(index + 1).padStart(2, "0");
          const label = document.createElement("strong");
          label.textContent = item;
          card.append(number, label);
          mentalGrid.append(card);
        });
        mental.append(mentalGrid);
        sections.push(mental);
      }

      const curriculum = document.createElement("section");
      curriculum.className = "home-section";
      curriculum.append(createHomeSectionHead(
        "Curriculum from beginner to industry level",
        "Unresearched lessons remain clearly marked and are published only after their sources have been validated.",
      ));
      const moduleGrid = document.createElement("div");
      moduleGrid.className = "module-overview";
      collection.modules.forEach((module) => {
        const card = document.createElement("article");
        card.className = "module-card";
        const top = document.createElement("div");
        top.className = "module-card__top";
        const number = document.createElement("span");
        number.textContent = `MODULE ${module.number}`;
        const count = document.createElement("span");
        count.textContent = `${module.lessons.length} lessons`;
        top.append(number, count);
        const title = document.createElement("h3");
        title.textContent = module.title;
        const description = document.createElement("p");
        description.textContent = module.description;
        const open = document.createElement("button");
        open.type = "button";
        open.dataset.openModule = module.id;
        open.textContent = "Open module →";
        card.append(top, title, description, open);
        moduleGrid.append(card);
      });
      curriculum.append(moduleGrid);
      sections.push(curriculum);

      if (collection.sourcePolicy.length) {
        const policy = document.createElement("section");
        policy.className = "home-section";
        policy.id = "source-policy";
        policy.append(createHomeSectionHead(
          "Research & citation standard",
          `Time-sensitive information was last reviewed on ${formatDate(collection.reviewedAt)}.`,
        ));
        const policyGrid = document.createElement("div");
        policyGrid.className = "policy-grid";
        collection.sourcePolicy.forEach((item) => {
          const card = document.createElement("article");
          card.className = "policy-card";
          const title = document.createElement("strong");
          title.textContent = item.title;
          const description = document.createElement("p");
          description.textContent = item.description;
          card.append(title, description);
          policyGrid.append(card);
        });
        policy.append(policyGrid);
        sections.push(policy);
      }

      if (collection.primarySources.length) {
        const sources = document.createElement("section");
        sources.className = "home-section";
        sources.id = "primary-sources";
        sources.append(createHomeSectionHead(
          "Primary sources used throughout",
          "Each lesson still has its own references and uses only sources relevant to its specific claims.",
        ));
        const sourceGrid = document.createElement("div");
        sourceGrid.className = "source-library";
        collection.primarySources.forEach((source) => {
          const card = document.createElement("article");
          card.className = "source-card";
          const organization = document.createElement("p");
          organization.className = "source-card__org";
          organization.textContent = source.organization;
          const title = document.createElement("h3");
          title.textContent = source.title;
          const scope = document.createElement("p");
          scope.textContent = `${source.publishedAt} · ${source.scope}`;
          card.append(organization, title, scope);
          if (source.url) {
            const link = document.createElement("a");
            link.href = source.url;
            link.target = "_blank";
            link.rel = "noreferrer noopener";
            link.textContent = "Open primary source ↗";
            card.append(link);
          }
          sourceGrid.append(card);
        });
        sources.append(sourceGrid);
        sections.push(sources);
      }
    }

    lessonReader.append(...sections);
    finishHomeRender();
  }

  function selectLesson(lessonId) {
    const entry = allLessons().find(({ lesson }) => lesson.id === lessonId);
    if (!entry) return;
    state.selectedId = lessonId;
    state.selectedCollectionId = entry.collection.id;
    state.openCollections.add(entry.collection.id);
    state.openModules.add(entry.module.id);
    document.title = `${entry.lesson.title} | ${entry.collection.title}`;
    lessonReader.replaceChildren(
      entry.lesson.status === "published" ? renderPublishedLesson(entry) : renderPlannedLesson(entry),
    );
    renderNavigation();
    closeSidebar();
    closeSearch();
    workspace.scrollTo({ top: 0, behavior: "auto" });
    updateReadingProgress();
  }

  function renderSearchResults(query) {
    const normalized = query.trim().toLocaleLowerCase("vi");
    searchResults.replaceChildren();
    if (!normalized) {
      searchResults.hidden = true;
      return;
    }
    const matches = allLessons().filter((entry) => lessonSearchText(entry).includes(normalized)).slice(0, 12);
    const head = document.createElement("div");
    head.className = "search-results__head";
    const label = document.createElement("span");
    label.textContent = `${matches.length} results`;
    const hint = document.createElement("span");
    hint.textContent = "Esc to close";
    head.append(label, hint);
    searchResults.append(head);
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = "No matching lesson, note, or concept was found.";
      searchResults.append(empty);
    } else {
      matches.forEach(({ collection, module, lesson }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.dataset.lessonId = lesson.id;
        const number = document.createElement("span");
        number.className = "search-result__number";
        number.textContent = module.number;
        const copy = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = lesson.title;
        const moduleName = document.createElement("small");
        moduleName.textContent = `${collection.title} · ${module.title}`;
        copy.append(title, moduleName);
        const status = document.createElement("span");
        status.className = "search-result__status";
        status.textContent = collection.kind === "notes"
          ? "Saved"
          : lesson.status === "published"
            ? "Verified"
            : "Roadmap";
        button.append(number, copy, status);
        searchResults.append(button);
      });
    }
    searchResults.hidden = false;
  }

  function closeSearch() {
    searchResults.hidden = true;
  }

  function toggleCompleted(lessonId) {
    const entry = allLessons().find(({ lesson }) => lesson.id === lessonId);
    if (!entry || entry.lesson.status !== "published") return;
    if (state.completed.has(lessonId)) {
      state.completed.delete(lessonId);
      showToast("Completion mark removed.");
    } else {
      state.completed.add(lessonId);
      showToast("Progress saved on this device.");
    }
    saveCompleted();
    selectLesson(lessonId);
  }

  function updateReadingProgress() {
    const available = workspace.scrollHeight - workspace.clientHeight;
    const percent = available > 0 ? Math.min(100, Math.max(0, (workspace.scrollTop / available) * 100)) : 0;
    readingProgress.style.width = `${percent}%`;
  }

  function touchActivity() {
    if (document.body.classList.contains("is-locked")) return;
    const now = Date.now();
    if (now - state.lastActivityAt < 1000) return;
    state.lastActivityAt = now;
    window.clearTimeout(state.autoLockTimer);
    state.autoLockTimer = window.setTimeout(() => lockVault(true), AUTO_LOCK_MS);
  }

  function lockVault(auto = false) {
    window.clearTimeout(state.autoLockTimer);
    state.data = null;
    state.sourceMap = new Map();
    state.selectedId = null;
    state.selectedCollectionId = null;
    state.openCollections.clear();
    state.openModules.clear();
    state.completed = new Set();
    lessonReader.replaceChildren();
    moduleList.replaceChildren();
    searchResults.replaceChildren();
    searchInput.value = "";
    passwordInput.value = "";
    document.body.classList.add("is-locked");
    document.body.classList.remove("sidebar-open");
    vaultView.hidden = true;
    unlockView.hidden = false;
    headerStatus.textContent = "Locked";
    document.title = "Knowledge Library | Private Learning Space";
    unlockStatus.textContent = auto ? "The library locked automatically after 15 minutes of inactivity." : "";
    unlockCard.classList.remove("is-error");
    passwordInput.focus();
  }

  async function unlockVault(event) {
    event.preventDefault();
    const password = passwordInput.value;
    if (!password) {
      unlockStatus.textContent = "Enter the library password.";
      passwordInput.focus();
      return;
    }
    unlockButton.disabled = true;
    unlockButtonLabel.textContent = "Decrypting…";
    unlockStatus.textContent = "";
    try {
      const data = await decryptVault(password);
      state.data = data;
      state.sourceMap = new Map(data.primarySources.map((source) => [source.id, source]));
      state.completed = loadCompleted();
      state.openCollections = new Set();
      state.openModules = new Set();
      passwordInput.value = "";
      document.body.classList.remove("is-locked");
      unlockView.hidden = true;
      vaultView.hidden = false;
      headerStatus.textContent = "Open · locally decrypted";
      curriculumMeta.textContent = `${data.collections.length} collections · ${allLessons().length} reading items`;
      renderHome();
      touchActivity();
      searchInput.focus({ preventScroll: true });
    } catch {
      unlockStatus.textContent = "Unable to decrypt. Check the password and try again.";
      passwordInput.select();
    } finally {
      unlockButton.disabled = false;
      unlockButtonLabel.textContent = "Open library";
    }
  }

  unlockForm?.addEventListener("submit", unlockVault);
  passwordToggle?.addEventListener("click", () => {
    const reveal = passwordInput.type === "password";
    passwordInput.type = reveal ? "text" : "password";
    passwordToggle.textContent = reveal ? "Hide" : "Show";
    passwordToggle.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
    passwordInput.focus();
  });
  lockButton?.addEventListener("click", () => lockVault(false));
  domainHomeButton?.addEventListener("click", () => {
    renderHome();
    closeSidebar();
  });
  moduleList?.addEventListener("click", (event) => {
    const collectionButton = event.target.closest("[data-collection-id]");
    if (collectionButton) {
      const id = collectionButton.dataset.collectionId;
      if (state.openCollections.has(id)) {
        state.openCollections.delete(id);
        state.selectedCollectionId = id;
        renderNavigation();
      } else {
        state.openCollections.add(id);
        renderCollectionHome(id);
      }
      return;
    }
    const moduleToggle = event.target.closest("[data-module-id]");
    if (moduleToggle) {
      const id = moduleToggle.dataset.moduleId;
      if (state.openModules.has(id)) state.openModules.delete(id);
      else state.openModules.add(id);
      renderNavigation();
      return;
    }
    const lessonButton = event.target.closest("[data-lesson-id]");
    if (lessonButton) selectLesson(lessonButton.dataset.lessonId);
  });
  lessonReader?.addEventListener("click", (event) => {
    const collectionButton = event.target.closest("[data-open-collection]");
    if (collectionButton) {
      renderCollectionHome(collectionButton.dataset.openCollection);
      return;
    }
    const lessonButton = event.target.closest("[data-lesson-id]");
    if (lessonButton) {
      selectLesson(lessonButton.dataset.lessonId);
      return;
    }
    const completeButton = event.target.closest("[data-complete-lesson]");
    if (completeButton) {
      toggleCompleted(completeButton.dataset.completeLesson);
      return;
    }
    const moduleButton = event.target.closest("[data-open-module]");
    if (moduleButton) {
      const module = state.data.modules.find((item) => item.id === moduleButton.dataset.openModule);
      if (module) {
        state.openModules.add(module.id);
        renderNavigation();
        if (module.lessons[0]) selectLesson(module.lessons[0].id);
      }
      return;
    }
    const sourceButton = event.target.closest("[data-show-sources]");
    if (sourceButton) {
      renderCollectionHome(sourceButton.dataset.collectionId);
      window.requestAnimationFrame(() => document.querySelector("#source-policy")?.scrollIntoView({ behavior: "smooth" }));
    }
  });
  searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchInput?.addEventListener("focus", () => {
    if (searchInput.value.trim()) renderSearchResults(searchInput.value);
  });
  searchResults?.addEventListener("click", (event) => {
    const result = event.target.closest("[data-lesson-id]");
    if (result) selectLesson(result.dataset.lessonId);
  });
  themeToggle?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    setTheme(next);
  });
  sidebarOpenButton?.addEventListener("click", openSidebar);
  sidebarCloseButton?.addEventListener("click", closeSidebar);
  sidebarScrim?.addEventListener("click", closeSidebar);
  workspace?.addEventListener("scroll", () => {
    updateReadingProgress();
    touchActivity();
  }, { passive: true });
  document.addEventListener("keydown", (event) => {
    touchActivity();
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      searchInput?.focus();
    }
    if (event.key === "Escape") {
      closeSearch();
      closeSidebar();
    }
  });
  ["pointerdown", "touchstart"].forEach((eventName) =>
    document.addEventListener(eventName, touchActivity, { passive: true }),
  );
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !document.body.classList.contains("is-locked")) {
      if (Date.now() - state.lastActivityAt >= AUTO_LOCK_MS) lockVault(true);
      else touchActivity();
    }
  });

  initializeTheme();
})();
