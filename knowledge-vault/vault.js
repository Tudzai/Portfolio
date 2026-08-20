(() => {
  "use strict";

  const VAULT_AAD = "knowledge-vault:v1";
  const STORAGE_COMPLETED = "knowledge-library:completed:v2";
  const STORAGE_COMPLETED_LEGACY = "fintech-domain:completed:v1";
  const STORAGE_THEME = "knowledge-library:theme-preset:v2";
  const STORAGE_THEME_LEGACY = "fintech-domain:theme:v1";
  const STORAGE_SIDEBAR_WIDTH = "knowledge-library:sidebar-width:v1";
  const STORAGE_SIDEBAR_COLLAPSED = "knowledge-library:sidebar-collapsed:v1";
  const STORAGE_BOOKMARKS = "knowledge-library:bookmarks:v1";
  const STORAGE_RECENT = "knowledge-library:recent:v1";
  const STORAGE_LAST_READ = "knowledge-library:last-read:v1";
  const STORAGE_READING_MODE = "knowledge-library:reading-mode:v1";
  const STORAGE_TEXT_SIZE = "knowledge-library:text-size:v1";
  const DOMAIN_TONES = ["violet", "cyan", "gold", "rose", "mint", "indigo"];
  const ESSENTIAL_SECTION_INDEXES = new Set([0, 1, 2, 5, 9, 10]);
  const EXPECTED_SECTION_COUNT = 11;
  const SIDEBAR_MIN_WIDTH = 260;
  const SIDEBAR_MAX_WIDTH = 460;
  const SIDEBAR_DEFAULT_WIDTH = 328;
  const SIDEBAR_WIDTH_STEPS = [260, 292, 328, 364, 400, 436, 460];
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
  const THEME_PRESETS = Object.freeze({
    midnight: { label: "Midnight", mode: "dark", color: "#090812" },
    pearl: { label: "Pearl", mode: "light", color: "#f5f2f8" },
    nebula: { label: "Nebula", mode: "dark", color: "#10091e" },
    aurora: { label: "Aurora", mode: "dark", color: "#061615" },
  });
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
  const curriculum = document.querySelector(".curriculum");
  const moduleList = document.querySelector("[data-module-list]");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeToolButton = document.querySelector("[data-theme-tool-button]");
  const themeToolMeta = document.querySelector("[data-theme-tool-meta]");
  const themeDialog = document.querySelector("[data-theme-dialog]");
  const themeCloseButtons = document.querySelectorAll("[data-theme-close]");
  const themeOptions = document.querySelectorAll("[data-theme-option]");
  const sidebarOpenButton = document.querySelector("[data-sidebar-open]");
  const sidebarCloseButton = document.querySelector("[data-sidebar-close]");
  const sidebarCollapseButton = document.querySelector("[data-sidebar-collapse]");
  const sidebarResizeHandle = document.querySelector("[data-sidebar-resize]");
  const sidebarScrim = document.querySelector("[data-sidebar-scrim]");
  const workspace = document.querySelector(".workspace");
  const readingProgress = document.querySelector("[data-reading-progress]");
  const lessonReader = document.querySelector("[data-lesson-reader]");
  const toast = document.querySelector("[data-toast]");
  const toolsToggle = document.querySelector("[data-tools-toggle]");
  const toolsPanel = document.querySelector("[data-tools-panel]");
  const toolsClose = document.querySelector("[data-tools-close]");
  const resumeButton = document.querySelector("[data-resume-button]");
  const resumeMeta = document.querySelector("[data-resume-meta]");
  const randomButton = document.querySelector("[data-random-button]");
  const bookmarksButton = document.querySelector("[data-bookmarks-button]");
  const bookmarksMeta = document.querySelector("[data-bookmarks-meta]");
  const readingModeButton = document.querySelector("[data-reading-mode-button]");
  const readingModeLabel = document.querySelector("[data-reading-mode-label]");
  const readingModeMeta = document.querySelector("[data-reading-mode-meta]");
  const textSizeButton = document.querySelector("[data-text-size-button]");
  const textSizeMeta = document.querySelector("[data-text-size-meta]");
  const focusButton = document.querySelector("[data-focus-button]");
  const focusLabel = document.querySelector("[data-focus-label]");
  const shortcutsButton = document.querySelector("[data-shortcuts-button]");
  const shortcutsDialog = document.querySelector("[data-shortcuts-dialog]");
  const shortcutsCloseButtons = document.querySelectorAll("[data-shortcuts-close]");

  const state = {
    data: null,
    sourceMap: new Map(),
    selectedId: null,
    selectedCollectionId: null,
    openCollections: new Set(),
    openModules: new Set(),
    completed: new Set(),
    bookmarks: new Set(),
    recent: [],
    lastRead: null,
    readingMode: "full",
    textSize: "comfortable",
    focusMode: false,
    searchMatches: [],
    searchIndex: -1,
    shortcutPrefix: "",
    shortcutTimer: null,
    previousFocus: null,
    sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
    sidebarResize: null,
    compactSidebar: null,
    toastTimer: null,
  };

  function decodeBase64(value) {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function hasExactKeys(value, expected) {
    return value
      && typeof value === "object"
      && !Array.isArray(value)
      && Object.keys(value).sort().join("|") === [...expected].sort().join("|");
  }

  function isCanonicalBase64(value, expectedBytes = null) {
    if (typeof value !== "string" || !value.length || value.length % 4 !== 0) return false;
    const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
    const contentLength = value.length - padding;
    for (let index = 0; index < contentLength; index += 1) {
      const code = value.charCodeAt(index);
      const allowed = (code >= 48 && code <= 57)
        || (code >= 65 && code <= 90)
        || (code >= 97 && code <= 122)
        || code === 43
        || code === 47;
      if (!allowed) return false;
    }
    if (value.slice(0, contentLength).includes("=") || /[^=]/.test(value.slice(contentLength))) return false;
    try {
      const decoded = window.atob(value);
      return window.btoa(decoded) === value && (expectedBytes === null || decoded.length === expectedBytes);
    } catch {
      return false;
    }
  }

  function validateEncryptedEnvelope(payload) {
    const valid = hasExactKeys(payload, ["version", "kdf", "cipher", "ciphertext"])
      && payload.version === 1
      && hasExactKeys(payload.kdf, ["name", "hash", "iterations", "salt"])
      && payload.kdf.name === "PBKDF2"
      && payload.kdf.hash === "SHA-256"
      && payload.kdf.iterations === 600_000
      && isCanonicalBase64(payload.kdf.salt, 16)
      && hasExactKeys(payload.cipher, ["name", "keyLength", "tagLength", "iv"])
      && payload.cipher.name === "AES-GCM"
      && payload.cipher.keyLength === 256
      && payload.cipher.tagLength === 128
      && isCanonicalBase64(payload.cipher.iv, 12)
      && isCanonicalBase64(payload.ciphertext)
      && window.atob(payload.ciphertext).length > 16;
    if (!valid) throw new Error("The encrypted library envelope is invalid.");
    return payload;
  }

  function normalizeString(value, fallback = "") {
    return typeof value === "string" ? value.trim() : fallback;
  }

  function normalizeStringArray(value) {
    return Array.isArray(value) ? value.map((item) => normalizeString(item)).filter(Boolean) : [];
  }

  function markVietnamese(...elements) {
    const vietnameseText = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/iu;
    elements.filter(Boolean).forEach((element) => {
      if (vietnameseText.test(element.textContent || "")) element.lang = "vi";
    });
  }

  function safeExternalUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function normalizeSource(source, index) {
    return {
      id: normalizeString(source?.id, `source-${index + 1}`),
      title: normalizeString(source?.title, "Nguồn chưa đặt tên"),
      organization: normalizeString(source?.organization, "Tổ chức chưa xác định"),
      publishedAt: normalizeString(source?.publishedAt),
      adoptedAt: normalizeString(source?.adoptedAt),
      updatedAt: normalizeString(source?.updatedAt),
      reviewedAt: normalizeString(source?.reviewedAt),
      accessedAt: normalizeString(source?.accessedAt),
      url: safeExternalUrl(source?.url),
      scope: normalizeString(source?.scope),
      sourceType: normalizeString(source?.sourceType, "Nguồn chính thống"),
    };
  }

  function sourceDateLabels(source) {
    const labels = [];
    if (source.publishedAt) labels.push(`Published: ${source.publishedAt}`);
    if (source.adoptedAt) labels.push(`Adopted: ${source.adoptedAt}`);
    if (source.updatedAt) labels.push(`Updated: ${source.updatedAt}`);
    if (source.reviewedAt) labels.push(`Reviewed: ${source.reviewedAt}`);
    if (source.accessedAt) labels.push(`Accessed: ${source.accessedAt}`);
    return labels.length ? labels : ["Date not stated"];
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

  function validateRawVaultData(value) {
    const releaseCounts = [
      { modules: 12, lessons: 67, sources: 179 },
      { modules: 15, lessons: 74, sources: 97 },
      { modules: 18, lessons: 89, sources: 68 },
      { modules: 14, lessons: 68, sources: 41 },
      { modules: 15, lessons: 60, sources: 56 },
    ];
    const claimedIds = new Set();
    const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    let invalid = false;
    const present = (item) => typeof item === "string" && item === item.trim() && Boolean(item);
    const claimId = (item) => {
      if (!present(item) || !idPattern.test(item) || claimedIds.has(item)) {
        invalid = true;
        return false;
      }
      claimedIds.add(item);
      return true;
    };
    const validBlock = (block) => {
      if (!block || typeof block !== "object") return false;
      if (block.type === "paragraph") return present(block.text) && block.text.length <= 1_600;
      if (block.type === "list") {
        return Array.isArray(block.items)
          && block.items.length > 0
          && block.items.every((item) => present(item) && item.length <= 1_000);
      }
      if (block.type === "callout") {
        return present(block.label)
          && present(block.text)
          && block.text.length <= 1_600
          && new Set(["note", "caution"]).has(block.tone);
      }
      if (block.type === "table") {
        return Array.isArray(block.headers)
          && block.headers.length > 0
          && block.headers.every(present)
          && Array.isArray(block.rows)
          && block.rows.length > 0
          && block.rows.every((row) =>
            Array.isArray(row)
            && row.length === block.headers.length
            && row.every((cell) => present(cell) && cell.length <= 800),
          );
      }
      if (block.type === "flow") {
        return Array.isArray(block.steps)
          && block.steps.length > 0
          && block.steps.every((step) =>
            present(step?.label) && present(step?.title) && present(step?.detail) && step.detail.length <= 900,
          );
      }
      return false;
    };

    if (
      !value
      || typeof value !== "object"
      || !present(value.title)
      || !present(value.description)
      || !value.archivedVault
      || !Array.isArray(value.archivedVault.notes)
      || value.archivedVault.notes.length === 0
      || !Array.isArray(value.domains)
      || value.domains.length !== releaseCounts.length
    ) {
      throw new Error("The decrypted library source is incomplete.");
    }

    value.domains.forEach((domain, domainIndex) => {
      const expected = releaseCounts[domainIndex];
      if (
        !domain
        || typeof domain !== "object"
        || !claimId(domain.id)
        || !present(domain.mark)
        || !present(domain.title)
        || !present(domain.description)
        || !present(domain.reviewedAt)
        || !Array.isArray(domain.mentalModel)
        || domain.mentalModel.length < 3
        || !domain.mentalModel.every(present)
        || !Array.isArray(domain.sourcePolicy)
        || domain.sourcePolicy.length < 3
        || !domain.sourcePolicy.every((item) => present(item?.title) && present(item?.description))
        || !Array.isArray(domain.primarySources)
        || domain.primarySources.length !== expected.sources
        || !Array.isArray(domain.modules)
        || domain.modules.length !== expected.modules
      ) invalid = true;

      const sourceMap = new Map();
      domain.primarySources?.forEach((source) => {
        if (
          !source
          || typeof source !== "object"
          || !claimId(source.id)
          || !present(source.title)
          || !present(source.organization)
          || !present(source.scope)
          || !present(source.sourceType)
          || !safeExternalUrl(source.url)
          || ![source.publishedAt, source.adoptedAt, source.updatedAt, source.reviewedAt, source.accessedAt].some(present)
        ) invalid = true;
        else sourceMap.set(source.id, source);
      });

      const moduleNumbers = new Set();
      let lessonCount = 0;
      domain.modules?.forEach((module) => {
        lessonCount += Array.isArray(module?.lessons) ? module.lessons.length : 0;
        const number = typeof module?.number === "number" ? String(module.number) : module?.number;
        if (
          !module
          || typeof module !== "object"
          || !claimId(module.id)
          || !present(number)
          || moduleNumbers.has(number)
          || !present(module.title)
          || !present(module.level)
          || !present(module.description)
          || !Array.isArray(module.lessons)
          || module.lessons.length === 0
        ) invalid = true;
        moduleNumbers.add(number);

        module.lessons?.forEach((lesson) => {
          const sectionIds = Array.isArray(lesson?.sections) ? lesson.sections.map((section) => section?.id) : [];
          const references = Array.isArray(lesson?.references) ? lesson.references : [];
          if (
            !lesson
            || typeof lesson !== "object"
            || !claimId(lesson.id)
            || !present(lesson.title)
            || !present(lesson.summary)
            || lesson.status !== "published"
            || (lesson.estimatedMinutes !== undefined
              && lesson.estimatedMinutes !== null
              && (!Number.isFinite(lesson.estimatedMinutes) || lesson.estimatedMinutes <= 0))
            || sectionIds.length !== EXPECTED_SECTION_COUNT
            || new Set(sectionIds).size !== EXPECTED_SECTION_COUNT
            || sectionIds.some((id) => !present(id) || !idPattern.test(id))
            || !lesson.sections.every((section) =>
              present(section?.title)
              && Array.isArray(section.blocks)
              && section.blocks.length > 0
              && section.blocks.every(validBlock),
            )
            || new Set(references).size < 3
            || references.some((sourceId) => !sourceMap.has(sourceId))
          ) invalid = true;

          const serialized = JSON.stringify(lesson?.sections || []);
          const citations = [...serialized.matchAll(/\[\[([a-z0-9-]+)\]\]/gi)].map((match) => match[1]);
          const organizations = new Set(
            references
              .map((sourceId) => sourceMap.get(sourceId)?.organization?.trim().toLocaleLowerCase("en-US"))
              .filter(Boolean),
          );
          if (
            references.some((sourceId) => !citations.includes(sourceId))
            || citations.some((sourceId) => !references.includes(sourceId))
            || organizations.size < 2
          ) invalid = true;
        });
      });
      if (lessonCount !== expected.lessons) invalid = true;
    });

    if (invalid) throw new Error("The decrypted library did not pass its release schema checks.");
    return value;
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
    const title = normalizeString(module?.title, `Module ${index + 1}`);
    return {
      id,
      collectionId,
      number: normalizeString(module?.number, String(index + 1).padStart(2, "0")),
      title,
      level: normalizeString(module?.level, "Foundation"),
      description: normalizeString(module?.description),
      evidenceOutcome: normalizeString(
        module?.evidenceOutcome,
        `Bạn có thể giải thích ${title} bằng từ ngữ đơn giản và áp dụng ý chính vào một tình huống thực tế.`,
      ),
      lessons: Array.isArray(module?.lessons)
        ? module.lessons.map((lesson, lessonIndex) => normalizeLesson(lesson, id, lessonIndex))
        : [],
    };
  }

  function normalizePolicy(value) {
    return Array.isArray(value)
      ? value.map((item, index) => ({
          title: normalizeString(item?.title, `Nguyên tắc ${index + 1}`),
          description: normalizeString(item?.description),
        }))
      : [];
  }

  function normalizeDomain(domain, index, libraryUpdatedAt) {
    const id = normalizeString(domain?.id, `knowledge-domain-${index + 1}`);
    const sources = Array.isArray(domain?.primarySources) ? domain.primarySources.map(normalizeSource) : [];
    return {
      id,
      mark: normalizeString(domain?.mark, "KD").slice(0, 3).toUpperCase(),
      kind: "curriculum",
      title: normalizeString(domain?.title, `Knowledge domain ${index + 1}`),
      description: normalizeString(domain?.description),
      updatedAt: normalizeString(domain?.updatedAt, normalizeString(libraryUpdatedAt)),
      reviewedAt: normalizeString(domain?.reviewedAt),
      mentalModel: normalizeStringArray(domain?.mentalModel),
      sourcePolicy: normalizePolicy(domain?.sourcePolicy),
      primarySources: sources,
      modules: Array.isArray(domain?.modules)
        ? domain.modules.map((module, moduleIndex) => normalizeModule(module, moduleIndex, id))
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
    if (Array.isArray(value.notes) && !Array.isArray(value.modules) && !Array.isArray(value.domains)) {
      return normalizeVaultData({
        title: "Knowledge Library",
        owner: value.owner,
        updatedAt: value.updatedAt,
        reviewedAt: value.updatedAt,
        description: "Thư viện tri thức cá nhân.",
        domains: [],
        archivedVault: value,
      });
    }

    const rawDomains = Array.isArray(value.domains)
      ? value.domains
      : Array.isArray(value.modules)
        ? [
            {
              id: "fintech-domain",
              mark: "FT",
              title: value.title,
              description: value.description,
              updatedAt: value.updatedAt,
              reviewedAt: value.reviewedAt,
              mentalModel: value.mentalModel,
              sourcePolicy: value.sourcePolicy,
              primarySources: value.primarySources,
              modules: value.modules,
            },
          ]
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

    rawDomains.forEach((domain, index) => {
      const normalized = normalizeDomain(domain, index, value.updatedAt);
      if (!normalized.modules.length) return;
      collections.push(normalized);
      allSources.push(...normalized.primarySources);
    });

    if (!collections.length) throw new Error("The library must contain at least one collection.");

    const data = {
      title: normalizeString(value.title, "Personal Knowledge Library"),
      owner: normalizeString(value.owner),
      updatedAt: normalizeString(value.updatedAt),
      description: normalizeString(
        value.description,
        "A private, source-backed library for learning several knowledge domains from first principles.",
      ),
      collections,
      primarySources: allSources,
      modules: collections.flatMap((collection) => collection.modules),
    };

    const collectionIds = data.collections.map((collection) => collection.id);
    if (new Set(collectionIds).size !== collectionIds.length) {
      throw new Error("Every collection must have a unique ID.");
    }

    const ids = [];
    data.modules.forEach((module) => module.lessons.forEach((lesson) => ids.push(lesson.id)));
    if (new Set(ids).size !== ids.length) throw new Error("Every reading item must have a unique ID.");
    return data;
  }

  function blockHasContent(block) {
    if (block.type === "paragraph") return Boolean(block.text);
    if (block.type === "list") return block.items.length > 0 && block.items.every(Boolean);
    if (block.type === "callout") return Boolean(block.label && block.text) && new Set(["note", "caution"]).has(block.tone);
    if (block.type === "table") {
      return block.headers.length > 0
        && block.rows.length > 0
        && block.rows.every((row) => row.length === block.headers.length && row.every(Boolean));
    }
    if (block.type === "flow") {
      return block.steps.length > 0 && block.steps.every((step) => step.label && step.title && step.detail);
    }
    return false;
  }

  function validateLibraryCompleteness(data) {
    const errors = [];
    const collectionIds = new Set();
    const moduleIds = new Set();
    const lessonIds = new Set();
    const sourceIds = new Set();

    data.collections.forEach((collection) => {
      if (collectionIds.has(collection.id)) errors.push("duplicate collection");
      collectionIds.add(collection.id);
      if (!collection.title || !collection.description || !collection.modules.length) errors.push("incomplete collection");

      const localSources = new Set();
      collection.primarySources.forEach((source) => {
        if (sourceIds.has(source.id)) errors.push("duplicate source");
        sourceIds.add(source.id);
        localSources.add(source.id);
        if (!source.title || !source.organization) errors.push("incomplete source");
      });

      if (collection.kind === "curriculum" && (!collection.mentalModel.length || !collection.sourcePolicy.length)) {
        errors.push("incomplete domain framing");
      }

      collection.modules.forEach((module) => {
        if (moduleIds.has(module.id)) errors.push("duplicate module");
        moduleIds.add(module.id);
        if (!module.title || !module.lessons.length) errors.push("incomplete module");
        if (collection.kind === "curriculum" && (!module.description || !module.evidenceOutcome)) {
          errors.push("incomplete module guidance");
        }

        module.lessons.forEach((lesson) => {
          if (lessonIds.has(lesson.id)) errors.push("duplicate lesson");
          lessonIds.add(lesson.id);
          if (!lesson.title || !lesson.summary) errors.push("incomplete lesson framing");
          if (collection.kind !== "curriculum" || lesson.status !== "published") return;
          if (lesson.sections.length !== 11) errors.push("incomplete lesson sections");
          const sectionIds = new Set();
          lesson.sections.forEach((section) => {
            if (!section.id || sectionIds.has(section.id)) errors.push("invalid section id");
            sectionIds.add(section.id);
            if (!section.title || !section.blocks.length || !section.blocks.every(blockHasContent)) {
              errors.push("incomplete lesson content");
            }
          });
          const references = new Set(lesson.references);
          if (references.size < 3 || lesson.references.some((sourceId) => !localSources.has(sourceId))) {
            errors.push("incomplete lesson sources");
          }
        });
      });
    });

    if (errors.length) throw new Error("The decrypted library did not pass its completeness checks.");
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
    const payload = validateEncryptedEnvelope(window.__KNOWLEDGE_VAULT_DATA__);
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
    const parsed = validateRawVaultData(JSON.parse(decoder.decode(decrypted)));
    return validateLibraryCompleteness(normalizeVaultData(parsed));
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
  }

  function readStorage(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value, errorMessage = "This preference could not be saved on this device.") {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast(errorMessage);
      return false;
    }
  }

  function storageContains(key) {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // A stale compatibility key is harmless when storage is unavailable.
    }
  }

  function loadIdSet(key) {
    const value = readStorage(key, []);
    return new Set(Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);
  }

  function loadCompleted() {
    if (storageContains(STORAGE_COMPLETED)) return loadIdSet(STORAGE_COMPLETED);
    const legacy = loadIdSet(STORAGE_COMPLETED_LEGACY);
    if (storageContains(STORAGE_COMPLETED_LEGACY) && writeStorage(STORAGE_COMPLETED, Array.from(legacy))) {
      removeStorage(STORAGE_COMPLETED_LEGACY);
    }
    return legacy;
  }

  function saveCompleted() {
    writeStorage(STORAGE_COMPLETED, Array.from(state.completed), "Progress could not be saved on this device.");
  }

  function saveBookmarks() {
    writeStorage(STORAGE_BOOKMARKS, Array.from(state.bookmarks), "Saved lessons could not be updated on this device.");
  }

  function saveRecent() {
    writeStorage(STORAGE_RECENT, state.recent, "Recent reading could not be saved on this device.");
  }

  function shortText(value, maximum = 190) {
    const text = normalizeString(value);
    if (text.length <= maximum) return text;
    const candidate = text.slice(0, maximum + 1);
    const sentenceEnd = Math.max(candidate.lastIndexOf(". "), candidate.lastIndexOf("! "), candidate.lastIndexOf("? "));
    if (sentenceEnd >= Math.floor(maximum * 0.55)) return candidate.slice(0, sentenceEnd + 1).trim();
    const wordEnd = candidate.lastIndexOf(" ");
    return `${candidate.slice(0, wordEnd > 0 ? wordEnd : maximum).trim()}…`;
  }

  function lessonPlainText(lesson) {
    return [
      lesson.title,
      lesson.summary,
      ...lesson.sections.flatMap((section) => section.blocks.map(blockSearchText)),
    ].join(" ");
  }

  function estimatedMinutes(lesson) {
    if (lesson.estimatedMinutes) return lesson.estimatedMinutes;
    const words = lessonPlainText(lesson).trim().split(/\s+/u).filter(Boolean).length;
    return Math.max(3, Math.round(words / 210));
  }

  function collectionProgress(collection) {
    const available = collection.modules
      .flatMap((module) => module.lessons)
      .filter((lesson) => lesson.status === "published");
    const completed = available.filter((lesson) => state.completed.has(lesson.id)).length;
    return {
      available: available.length,
      completed,
      percent: available.length ? Math.round((completed / available.length) * 100) : 0,
    };
  }

  function nextLesson(collectionId = null) {
    const available = publishedLessons().filter(({ collection }) => !collectionId || collection.id === collectionId);
    return available.find(({ lesson }) => !state.completed.has(lesson.id)) || available[0] || null;
  }

  function validStoredLesson(lessonId) {
    return lessonId ? allLessons().find(({ lesson }) => lesson.id === lessonId) || null : null;
  }

  function validPublishedLesson(lessonId) {
    const entry = validStoredLesson(lessonId);
    return entry?.lesson.status === "published" ? entry : null;
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

  function reconcileStoredState() {
    const allIds = new Set(allLessons().map(({ lesson }) => lesson.id));
    const publishedIds = new Set(publishedLessons().map(({ lesson }) => lesson.id));
    state.completed = new Set([...state.completed].filter((id) => publishedIds.has(id)));
    state.bookmarks = new Set([...state.bookmarks].filter((id) => allIds.has(id)));
    state.recent = state.recent.filter((id, index, values) =>
      publishedIds.has(id) && values.indexOf(id) === index,
    ).slice(0, 6);
    state.lastRead = publishedIds.has(state.lastRead) ? state.lastRead : null;
    saveCompleted();
    saveBookmarks();
    saveRecent();
    writeStorage(STORAGE_LAST_READ, state.lastRead, "Your reading place could not be saved on this device.");
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

  function foldSearchText(value) {
    return normalizeString(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLocaleLowerCase("vi");
  }

  function lessonSearchText(entry) {
    return foldSearchText([
      entry.collection.title,
      entry.module.title,
      entry.lesson.title,
      entry.lesson.summary,
      ...entry.lesson.keywords,
      ...entry.lesson.sections.flatMap((section) => [section.title, ...section.blocks.map(blockSearchText)]),
    ]
      .join(" "));
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

  function applyCollectionTone(collectionId = null) {
    const index = collectionId
      ? state.data?.collections.findIndex((collection) => collection.id === collectionId) ?? -1
      : 0;
    document.documentElement.dataset.domainTone = DOMAIN_TONES[index >= 0 ? index % DOMAIN_TONES.length : 0];
  }

  function setReadingMode(mode, persist = true) {
    state.readingMode = mode === "essentials" ? "essentials" : "full";
    document.body.classList.toggle("essentials-mode", state.readingMode === "essentials");
    if (readingModeLabel) readingModeLabel.textContent = state.readingMode === "essentials" ? "Full lesson" : "Essential view";
    readingModeButton?.setAttribute("aria-pressed", String(state.readingMode === "essentials"));
    if (readingModeMeta) {
      readingModeMeta.textContent = state.readingMode === "essentials"
        ? "Reveal every section"
        : "Show the clearest sections";
    }
    lessonReader?.querySelectorAll("[data-reader-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", String(state.readingMode === "essentials"));
      button.textContent = state.readingMode === "essentials" ? "Show full lesson" : "Essential view";
    });
    if (persist) writeStorage(STORAGE_READING_MODE, state.readingMode);
  }

  function toggleReadingMode() {
    setReadingMode(state.readingMode === "full" ? "essentials" : "full");
  }

  function setTextSize(size, persist = true) {
    const sizes = new Set(["comfortable", "large", "xlarge"]);
    state.textSize = sizes.has(size) ? size : "comfortable";
    if (state.textSize === "comfortable") delete document.documentElement.dataset.textSize;
    else document.documentElement.dataset.textSize = state.textSize;
    if (textSizeMeta) {
      textSizeMeta.textContent = state.textSize === "xlarge" ? "Extra large" : state.textSize === "large" ? "Large" : "Comfortable";
    }
    textSizeButton?.setAttribute("aria-label", `Reading size: ${textSizeMeta?.textContent || "Comfortable"}. Activate to change.`);
    if (persist) writeStorage(STORAGE_TEXT_SIZE, state.textSize);
  }

  function cycleTextSize() {
    const order = ["comfortable", "large", "xlarge"];
    const index = order.indexOf(state.textSize);
    setTextSize(order[(index + 1) % order.length]);
  }

  function setFocusMode(enabled) {
    state.focusMode = Boolean(enabled);
    document.body.classList.toggle("focus-mode", state.focusMode);
    if (focusLabel) focusLabel.textContent = state.focusMode ? "Leave focus mode" : "Focus mode";
    focusButton?.setAttribute("aria-pressed", String(state.focusMode));
    if (sidebarOpenButton) {
      sidebarOpenButton.textContent = state.focusMode ? "←" : "☰";
      sidebarOpenButton.setAttribute("aria-label", state.focusMode ? "Exit focus mode" : "Show library navigation");
    }
    if (state.focusMode) {
      closeSearch();
      closeTools();
      closeSidebar();
      window.requestAnimationFrame(() => sidebarOpenButton?.focus({ preventScroll: true }));
    }
    syncSidebarToggle();
    syncCurriculumInteractivity();
  }

  function openTools() {
    if (!toolsPanel) return;
    updateToolsPanel();
    closeSearch();
    toolsPanel.hidden = false;
    toolsToggle?.setAttribute("aria-expanded", "true");
    toolsPanel.querySelector("button")?.focus({ preventScroll: true });
  }

  function closeTools({ restoreFocus = false } = {}) {
    if (!toolsPanel || toolsPanel.hidden) return;
    toolsPanel.hidden = true;
    toolsToggle?.setAttribute("aria-expanded", "false");
    if (restoreFocus) toolsToggle?.focus({ preventScroll: true });
  }

  function toggleTools() {
    if (toolsPanel?.hidden) openTools();
    else closeTools({ restoreFocus: true });
  }

  function trapModalFocus(event, layer, panelSelector) {
    const controls = Array.from(layer.querySelectorAll(`${panelSelector} button:not([disabled]), ${panelSelector} [href], ${panelSelector} [tabindex]:not([tabindex="-1"])`))
      .filter((control) => control.getClientRects().length > 0);
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openThemeDialog(trigger = document.activeElement) {
    if (!themeDialog) return;
    state.previousFocus = toolsPanel?.contains(trigger) ? toolsToggle : trigger;
    closeTools();
    themeDialog.hidden = false;
    document.body.classList.add("modal-open");
    if (vaultView) vaultView.inert = true;
    const activeTheme = document.documentElement.dataset.themePreset || "midnight";
    themeDialog.querySelector(`[data-theme-option="${activeTheme}"]`)?.focus();
  }

  function closeThemeDialog({ restoreFocus = true } = {}) {
    if (!themeDialog || themeDialog.hidden) return;
    themeDialog.hidden = true;
    document.body.classList.remove("modal-open");
    if (vaultView) vaultView.inert = false;
    if (restoreFocus) state.previousFocus?.focus?.({ preventScroll: true });
    state.previousFocus = null;
  }

  function openShortcuts() {
    if (!shortcutsDialog) return;
    state.previousFocus = toolsPanel?.contains(document.activeElement) ? toolsToggle : document.activeElement;
    closeTools();
    shortcutsDialog.hidden = false;
    document.body.classList.add("modal-open");
    if (vaultView) vaultView.inert = true;
    shortcutsDialog.querySelector(".shortcut-dialog [data-shortcuts-close]")?.focus();
  }

  function closeShortcuts({ restoreFocus = true } = {}) {
    if (!shortcutsDialog || shortcutsDialog.hidden) return;
    shortcutsDialog.hidden = true;
    document.body.classList.remove("modal-open");
    if (vaultView) vaultView.inert = false;
    if (restoreFocus) state.previousFocus?.focus?.({ preventScroll: true });
    state.previousFocus = null;
  }

  function updateToolsPanel() {
    if (!state.data) return;
    const last = validPublishedLesson(state.lastRead);
    const next = last || nextLesson();
    if (resumeMeta) resumeMeta.textContent = next ? shortText(next.lesson.title, 48) : "All available lessons completed";
    if (bookmarksMeta) bookmarksMeta.textContent = `${state.bookmarks.size} saved`;
  }

  function setTheme(theme, persist = true) {
    const migrated = theme === "light" ? "pearl" : theme === "dark" ? "midnight" : theme;
    const next = THEME_PRESETS[migrated] ? migrated : "midnight";
    const preset = THEME_PRESETS[next];
    document.documentElement.dataset.theme = preset.mode;
    document.documentElement.dataset.themePreset = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", preset.color);
    if (themeLabel) themeLabel.textContent = preset.label;
    themeToggle?.setAttribute("aria-label", `Choose theme. ${preset.label} active.`);
    if (themeToolMeta) themeToolMeta.textContent = `${preset.label} active`;
    themeToolButton?.setAttribute("aria-label", `Choose theme. ${preset.label} active.`);
    themeOptions.forEach((option) => {
      const selected = option.dataset.themeOption === next;
      option.setAttribute("aria-checked", String(selected));
      option.tabIndex = selected ? 0 : -1;
    });
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_THEME, next);
        window.localStorage.removeItem(STORAGE_THEME_LEGACY);
      } catch {
        // Theme remains applied for the current session.
      }
    }
  }

  function initializeTheme() {
    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_THEME) || window.localStorage.getItem(STORAGE_THEME_LEGACY);
    } catch {
      stored = null;
    }
    const preferred = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "pearl" : "midnight";
    setTheme(stored || preferred, false);
  }

  function handleThemeOptionKeydown(event) {
    if (!new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]).has(event.key)) return;
    const options = Array.from(themeOptions);
    const currentIndex = options.indexOf(event.currentTarget);
    if (currentIndex < 0) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % options.length;
    else nextIndex = (currentIndex - 1 + options.length) % options.length;
    const nextOption = options[nextIndex];
    setTheme(nextOption.dataset.themeOption);
    nextOption.focus();
  }

  function isCompactSidebar() {
    return window.matchMedia?.("(max-width: 960px)").matches ?? false;
  }

  function sidebarMaximumWidth() {
    const viewportWidth = Number(window.innerWidth) || 1440;
    return Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, Math.floor(viewportWidth * 0.44)));
  }

  function clampSidebarWidth(value) {
    const numericValue = Number(value);
    const width = Number.isFinite(numericValue) ? numericValue : SIDEBAR_DEFAULT_WIDTH;
    const maximum = sidebarMaximumWidth();
    const availableSteps = SIDEBAR_WIDTH_STEPS.filter((step) => step <= maximum);
    const steps = availableSteps.length ? availableSteps : [SIDEBAR_MIN_WIDTH];
    return steps.reduce((nearest, step) =>
      Math.abs(step - width) < Math.abs(nearest - width) ? step : nearest,
    steps[0]);
  }

  function syncCurriculumInteractivity() {
    if (!curriculum) return;
    const compact = isCompactSidebar();
    curriculum.inert = state.focusMode
      || (compact && !document.body.classList.contains("sidebar-open"))
      || (!compact && document.body.classList.contains("sidebar-collapsed"));
  }

  function setSidebarWidth(value, persist = true) {
    state.sidebarWidth = clampSidebarWidth(value);
    document.documentElement.dataset.sidebarWidth = String(state.sidebarWidth);
    sidebarResizeHandle?.setAttribute("aria-valuenow", String(state.sidebarWidth));
    sidebarResizeHandle?.setAttribute("aria-valuemax", String(sidebarMaximumWidth()));
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_SIDEBAR_WIDTH, String(state.sidebarWidth));
      } catch {
        // The current width still applies when local storage is unavailable.
      }
    }
  }

  function syncSidebarToggle() {
    const expanded = state.focusMode
      ? false
      : isCompactSidebar()
        ? document.body.classList.contains("sidebar-open")
        : !document.body.classList.contains("sidebar-collapsed");
    sidebarOpenButton?.setAttribute("aria-expanded", String(expanded));
  }

  function setSidebarCollapsed(collapsed, persist = true) {
    document.body.classList.toggle("sidebar-collapsed", Boolean(collapsed));
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_SIDEBAR_COLLAPSED, collapsed ? "true" : "false");
      } catch {
        // The current collapsed state still applies when local storage is unavailable.
      }
    }
    syncSidebarToggle();
    syncCurriculumInteractivity();
  }

  function initializeSidebarLayout() {
    let storedWidth = SIDEBAR_DEFAULT_WIDTH;
    let storedCollapsed = false;
    try {
      storedWidth = Number(window.localStorage.getItem(STORAGE_SIDEBAR_WIDTH)) || SIDEBAR_DEFAULT_WIDTH;
      storedCollapsed = window.localStorage.getItem(STORAGE_SIDEBAR_COLLAPSED) === "true";
    } catch {
      storedWidth = SIDEBAR_DEFAULT_WIDTH;
    }
    setSidebarWidth(storedWidth, false);
    setSidebarCollapsed(storedCollapsed, false);
    state.compactSidebar = isCompactSidebar();
    syncCurriculumInteractivity();
  }

  function closeSidebar({ restoreFocus = false } = {}) {
    const wasOpen = document.body.classList.contains("sidebar-open");
    document.body.classList.remove("sidebar-open");
    if (isCompactSidebar()) {
      sidebarScrim.hidden = true;
      if (workspace) workspace.inert = false;
      if (restoreFocus && wasOpen) sidebarOpenButton?.focus({ preventScroll: true });
    }
    syncSidebarToggle();
    syncCurriculumInteractivity();
  }

  function openSidebar() {
    if (isCompactSidebar()) {
      sidebarScrim.hidden = false;
      document.body.classList.add("sidebar-open");
      if (workspace) workspace.inert = true;
      syncSidebarToggle();
      syncCurriculumInteractivity();
      sidebarCloseButton?.focus({ preventScroll: true });
      return;
    }
    setSidebarCollapsed(false);
    syncCurriculumInteractivity();
  }

  function closeCompactSidebarForShortcut() {
    if (isCompactSidebar() && document.body.classList.contains("sidebar-open")) closeSidebar();
  }

  function collapseSidebar() {
    if (isCompactSidebar()) {
      closeSidebar({ restoreFocus: true });
      return;
    }
    setSidebarCollapsed(true);
  }

  function startSidebarResize(event) {
    if (isCompactSidebar() || event.button !== 0) return;
    state.sidebarResize = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: state.sidebarWidth,
    };
    document.body.classList.add("is-resizing-sidebar");
    sidebarResizeHandle?.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function resizeSidebar(event) {
    if (!state.sidebarResize || event.pointerId !== state.sidebarResize.pointerId) return;
    setSidebarWidth(state.sidebarResize.startWidth + event.clientX - state.sidebarResize.startX, false);
  }

  function finishSidebarResize(event) {
    if (!state.sidebarResize || event.pointerId !== state.sidebarResize.pointerId) return;
    sidebarResizeHandle?.releasePointerCapture?.(event.pointerId);
    state.sidebarResize = null;
    document.body.classList.remove("is-resizing-sidebar");
    setSidebarWidth(state.sidebarWidth);
  }

  function resizeSidebarWithKeyboard(event) {
    const steps = SIDEBAR_WIDTH_STEPS.filter((step) => step <= sidebarMaximumWidth());
    const currentIndex = Math.max(0, steps.indexOf(state.sidebarWidth));
    let nextWidth = state.sidebarWidth;
    if (event.key === "ArrowLeft") nextWidth = steps[Math.max(0, currentIndex - 1)];
    else if (event.key === "ArrowRight") nextWidth = steps[Math.min(steps.length - 1, currentIndex + 1)];
    else if (event.key === "Home") nextWidth = steps[0];
    else if (event.key === "End") nextWidth = steps[steps.length - 1];
    else return;
    event.preventDefault();
    setSidebarWidth(nextWidth);
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
      markVietnamese(collectionTitle);
      const collectionMeta = document.createElement("small");
      const collectionEntries = collection.modules.reduce((total, module) => total + module.lessons.length, 0);
      const collectionLive = collection.modules.reduce(
        (total, module) => total + module.lessons.filter((lesson) => lesson.status === "published").length,
        0,
      );
      const progress = collectionProgress(collection);
      collectionMeta.textContent = collection.kind === "notes"
        ? `${collectionEntries} preserved ${collectionEntries === 1 ? "note" : "notes"}`
        : `${collection.modules.length} modules · ${progress.completed}/${collectionLive} complete`;
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
        markVietnamese(title);
        const meta = document.createElement("small");
        const liveCount = module.lessons.filter((lesson) => lesson.status === "published").length;
        const completedCount = module.lessons.filter((lesson) => state.completed.has(lesson.id)).length;
        const sourceMapped = module.lessons.every((lesson) => lesson.references.length >= 3);
        meta.textContent = collection.kind === "notes"
          ? `${module.lessons.length} ${module.lessons.length === 1 ? "note" : "notes"}`
          : `${module.lessons.length} lessons${
              liveCount
                ? ` · ${completedCount}/${liveCount} complete`
                : sourceMapped
                  ? " · source-mapped roadmap"
                  : " · lesson planning"
            }`;
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
          button.className = `lesson-link ${lesson.status === "planned" ? "is-planned" : ""} ${state.completed.has(lesson.id) ? "is-complete" : ""} ${state.bookmarks.has(lesson.id) ? "is-bookmarked" : ""}`;
          button.dataset.lessonId = lesson.id;
          if (lesson.id === state.selectedId) button.setAttribute("aria-current", "page");
          const label = document.createElement("span");
          label.textContent = lesson.title;
          markVietnamese(label);
          const lessonState = document.createElement("span");
          lessonState.className = "lesson-link__state";
          lessonState.setAttribute("aria-hidden", "true");
          lessonState.textContent = state.completed.has(lesson.id) ? "✓" : state.bookmarks.has(lesson.id) ? "✦" : "";
          button.append(label, lessonState);
          lessons.append(button);
        });

        group.append(toggle, lessons);
        collectionBody.append(group);
      });

      collectionGroup.append(collectionButton, collectionBody);
      moduleList.append(collectionGroup);
    });
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

  function readableChunks(value, maximum = 380) {
    const text = normalizeString(value);
    if (text.length <= maximum) return [text];
    const sentences = text.split(/(?<=[.!?])\s+/u).filter(Boolean);
    const chunks = [];
    let current = "";
    sentences.forEach((sentence) => {
      if (sentence.length > maximum) {
        if (current) chunks.push(current);
        current = "";
        const words = sentence.split(/\s+/u).filter(Boolean);
        let piece = "";
        words.forEach((word) => {
          const candidate = piece ? `${piece} ${word}` : word;
          if (piece && candidate.length > maximum) {
            chunks.push(piece);
            piece = word;
          } else {
            piece = candidate;
          }
        });
        if (piece) chunks.push(piece);
        return;
      }
      const candidate = current ? `${current} ${sentence}` : sentence;
      if (current && candidate.length > maximum) {
        chunks.push(current);
        current = sentence;
      } else {
        current = candidate;
      }
    });
    if (current) chunks.push(current);
    return chunks;
  }

  function renderBlock(block, lesson) {
    if (block.type === "paragraph") {
      const fragment = document.createDocumentFragment();
      readableChunks(block.text).forEach((chunk) => {
        const paragraph = document.createElement("p");
        paragraph.className = "content-block content-paragraph";
        appendRichText(paragraph, chunk, lesson);
        fragment.append(paragraph);
      });
      return fragment;
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
      const flow = document.createElement("ol");
      flow.className = "content-block flow-diagram";
      flow.setAttribute("aria-label", `Process with ${block.steps.length} steps`);
      block.steps.forEach((step) => {
        const card = document.createElement("li");
        card.className = "flow-step";
        const label = document.createElement("span");
        appendRichText(label, step.label, lesson);
        const title = document.createElement("strong");
        appendRichText(title, step.title, lesson);
        const detail = document.createElement("small");
        appendRichText(detail, step.detail, lesson);
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
    markVietnamese(collectionName);
    const secondSeparator = document.createElement("span");
    secondSeparator.textContent = "/";
    const moduleName = document.createElement("span");
    moduleName.textContent = `${module.number}. ${module.title}`;
    moduleName.lang = "vi";
    breadcrumb.append(domain, separator, collectionName, secondSeparator, moduleName);
    const title = document.createElement("h1");
    title.textContent = lesson.title;
    title.tabIndex = -1;
    title.lang = "vi";
    const deck = document.createElement("p");
    deck.className = "reader-deck";
    deck.textContent = lesson.summary;
    deck.lang = "vi";
    const meta = document.createElement("div");
    meta.className = "reader-meta";
    const status = document.createElement("span");
    status.className = lesson.status === "published" ? "status-live" : "status-planned";
    status.textContent = collection.kind === "notes"
      ? "Saved"
      : lesson.status === "published"
        ? "Verified"
        : "Full lesson pending";
    const level = document.createElement("span");
    level.textContent = module.level;
    markVietnamese(level);
    meta.append(status, level);
    const duration = document.createElement("span");
    duration.textContent = lesson.status === "published"
      ? `${estimatedMinutes(lesson)} min read`
      : `Target: ${estimatedMinutes(lesson)} min lesson`;
    meta.append(duration);
    if (lesson.lastReviewed) {
      const reviewed = document.createElement("span");
      reviewed.textContent = `Reviewed: ${formatDate(lesson.lastReviewed)}`;
      meta.append(reviewed);
    }

    const tools = document.createElement("div");
    tools.className = "reader-tools";
    const toolGroup = document.createElement("div");
    toolGroup.className = "reader-tools__group";
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
    const bookmark = document.createElement("button");
    bookmark.type = "button";
    bookmark.className = "bookmark-button";
    bookmark.dataset.bookmarkLesson = lesson.id;
    bookmark.setAttribute("aria-pressed", String(state.bookmarks.has(lesson.id)));
    bookmark.textContent = state.bookmarks.has(lesson.id) ? "✦ Saved" : "◇ Save lesson";
    const readingMode = document.createElement("button");
    readingMode.type = "button";
    readingMode.className = "reader-action";
    readingMode.dataset.readerMode = "true";
    readingMode.setAttribute("aria-pressed", String(state.readingMode === "essentials"));
    readingMode.textContent = state.readingMode === "essentials" ? "Show full lesson" : "Essential view";
    const policy = document.createElement("button");
    policy.type = "button";
    policy.className = "source-policy-link";
    policy.dataset.showSources = "true";
    policy.dataset.collectionId = collection.id;
    policy.textContent = collection.kind === "curriculum" ? "How sources are checked" : "About these notes";
    toolGroup.append(complete, bookmark, readingMode);
    tools.append(toolGroup, policy);
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
    const referenceSectionNumber = lesson.status === "planned" ? SECTION_TITLES.length : lesson.sections.length + 1;
    number.textContent = String(referenceSectionNumber).padStart(2, "0");
    const title = document.createElement("h2");
    title.textContent = "Nguồn tham khảo";
    title.lang = "vi";
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
      markVietnamese(sourceTitle, organization);
      const date = document.createElement("small");
      date.textContent = `${sourceDateLabels(source).join(" · ")} · ${source.sourceType}`;
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
    const entries = allLessons().filter(
      ({ collection, lesson }) => collection.id === entry.collection.id && lesson.status === "published",
    );
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
      markVietnamese(title);
      button.append(small, title);
      nav.append(button);
    });
    return nav;
  }

  function stripCitationTokens(value) {
    return normalizeString(value).replace(/\s*\[\[[a-z0-9-]+\]\]/gi, "").replace(/\s{2,}/g, " ").trim();
  }

  function firstSectionText(section) {
    for (const block of section?.blocks || []) {
      if (block.type === "paragraph" && block.text) return block.text;
      if (block.type === "callout" && block.text) return block.text;
      if (block.type === "list" && block.items[0]) return block.items[0];
      if (block.type === "flow" && block.steps[0]?.detail) return block.steps[0].detail;
    }
    return "";
  }

  function firstTerms(section) {
    const terms = [];
    for (const block of section?.blocks || []) {
      if (block.type === "table") terms.push(...block.rows.map((row) => row[0]));
      else if (block.type === "list") terms.push(...block.items);
      else if (block.type === "callout") terms.push(block.label);
      if (terms.length >= 3) break;
    }
    return terms.filter(Boolean).slice(0, 3).map((term) => shortText(stripCitationTokens(term), 78));
  }

  function createQuickGuide(entry) {
    const guide = document.createElement("aside");
    guide.className = "quick-guide";
    guide.setAttribute("aria-label", "Quick lesson guide");
    const summary = document.createElement("div");
    const summaryLabel = document.createElement("span");
    summaryLabel.textContent = "In one sentence";
    const summaryText = document.createElement("p");
    summaryText.textContent = shortText(stripCitationTokens(entry.lesson.summary), 220);
    markVietnamese(summaryText);
    summary.append(summaryLabel, summaryText);

    const start = document.createElement("div");
    const startLabel = document.createElement("span");
    startLabel.textContent = "Start with this";
    const startText = document.createElement("p");
    const simpleText = firstSectionText(entry.lesson.sections[1]) || firstSectionText(entry.lesson.sections[0]);
    startText.textContent = shortText(stripCitationTokens(simpleText), 180);
    markVietnamese(startText);
    start.append(startLabel, startText);
    guide.append(summary, start);
    const terms = firstTerms(entry.lesson.sections[9]);
    if (terms.length) {
      const glossary = document.createElement("div");
      glossary.className = "quick-guide__terms";
      const glossaryLabel = document.createElement("span");
      glossaryLabel.textContent = "Words to know";
      const glossaryList = document.createElement("ul");
      terms.forEach((term) => {
        const item = document.createElement("li");
        item.textContent = term;
        markVietnamese(item);
        glossaryList.append(item);
      });
      glossary.append(glossaryLabel, glossaryList);
      guide.append(glossary);
    }
    return guide;
  }

  function createLessonOutline(entry) {
    const outline = document.createElement("nav");
    outline.className = "lesson-outline";
    outline.setAttribute("aria-label", "Lesson sections");
    const label = document.createElement("span");
    label.textContent = "On this page";
    outline.append(label);
    entry.lesson.sections.forEach((section, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.scrollSection = `section-${section.id}`;
      if (ESSENTIAL_SECTION_INDEXES.has(index)) button.classList.add("is-essential");
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      button.append(number, document.createTextNode(section.title));
      markVietnamese(button);
      outline.append(button);
    });
    const references = document.createElement("button");
    references.type = "button";
    references.className = "is-essential";
    references.dataset.scrollSection = "section-references";
    const referenceNumber = document.createElement("span");
    referenceNumber.textContent = String(entry.lesson.sections.length + 1).padStart(2, "0");
    references.append(referenceNumber, document.createTextNode("Nguồn tham khảo"));
    references.lang = "vi";
    outline.append(references);
    return outline;
  }

  function renderPublishedLesson(entry) {
    const fragment = document.createDocumentFragment();
    fragment.append(createReaderHero(entry));
    const layout = document.createElement("div");
    layout.className = "reader-layout";
    const body = document.createElement("div");
    body.className = "lesson-body";
    body.append(createQuickGuide(entry));
    entry.lesson.sections.forEach((sectionData, index) => {
      const section = document.createElement("section");
      section.className = "lesson-section";
      section.lang = "vi";
      if (ESSENTIAL_SECTION_INDEXES.has(index)) section.classList.add("is-essential");
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
    const references = renderReferences(entry.lesson, entry.collection.kind);
    references.classList.add("is-essential");
    body.append(references);
    layout.append(body, createLessonOutline(entry));
    fragment.append(layout, renderLessonNavigation(entry));
    return fragment;
  }

  function renderPlannedLesson(entry) {
    const fragment = document.createDocumentFragment();
    fragment.append(createReaderHero(entry));
    const body = document.createElement("div");
    body.className = "lesson-body";
    const template = document.createElement("section");
    template.className = "planned-template";
    const title = document.createElement("h2");
    title.textContent = "Roadmap topic — full lesson pending";
    const description = document.createElement("p");
    description.textContent = entry.lesson.references.length >= 3
      ? "This topic and its learning outcome have been mapped to multiple sources. The full lesson remains clearly unpublished until its claims, examples, and explanations complete the deeper review standard."
      : "This topic is part of the learning path, but its source mapping and full lesson have not yet completed the review standard.";
    const sections = document.createElement("div");
    sections.className = "planned-sections";
    SECTION_TITLES.slice(0, -1).forEach((sectionTitle, index) => {
      const row = document.createElement("span");
      row.textContent = `${String(index + 1).padStart(2, "0")} · ${sectionTitle}`;
      sections.append(row);
    });
    template.append(title, description, sections);
    body.append(template);
    if (entry.lesson.references.length) body.append(renderReferences(entry.lesson, entry.collection.kind));
    fragment.append(body);
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
    title.tabIndex = -1;
    const lede = document.createElement("p");
    lede.className = "home-hero__lede";
    lede.textContent = ledeText;
    markVietnamese(title, lede);
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

  function finishHomeRender({ focusHeading = false } = {}) {
    renderNavigation();
    workspace.scrollTo({ top: 0, behavior: "auto" });
    updateReadingProgress();
    updateToolsPanel();
    if (focusHeading) window.requestAnimationFrame(() => lessonReader.querySelector("h1")?.focus({ preventScroll: true }));
  }

  function createProgressTrack(percent, label) {
    const track = document.createElement("div");
    track.className = "progress-track";
    const progress = document.createElement("progress");
    progress.max = 100;
    progress.value = Math.min(100, Math.max(0, Number(percent) || 0));
    progress.textContent = `${progress.value}%`;
    progress.setAttribute("aria-label", label);
    track.append(progress);
    return track;
  }

  function createPathPanel(collection = null) {
    const panel = document.createElement("section");
    panel.className = "path-panel";
    panel.setAttribute("aria-label", collection ? "Your path through this domain" : "Your learning path");

    const primary = document.createElement("article");
    primary.className = "path-primary";
    const kicker = document.createElement("p");
    kicker.className = "path-kicker";
    kicker.textContent = state.lastRead && validPublishedLesson(state.lastRead) ? "Continue your thread" : "Start gently";
    const target = validPublishedLesson(state.lastRead);
    const targetInCollection = target && (!collection || target.collection.id === collection.id) ? target : null;
    const next = targetInCollection || nextLesson(collection?.id || null);
    const title = document.createElement("h2");
    title.textContent = next ? next.lesson.title : "You have completed every available lesson";
    const description = document.createElement("p");
    description.textContent = next
      ? shortText(next.lesson.summary, 180)
      : "Return to any lesson, follow a new domain, or let the vault choose an idea for you.";
    if (next) markVietnamese(title, description);
    const actions = document.createElement("div");
    actions.className = "path-actions";
    if (next) {
      const resume = document.createElement("button");
      resume.type = "button";
      resume.dataset.lessonId = next.lesson.id;
      resume.textContent = targetInCollection ? "Continue reading →" : "Start here →";
      actions.append(resume);
    }
    const surprise = document.createElement("button");
    surprise.type = "button";
    surprise.dataset.randomLesson = collection?.id || "all";
    surprise.textContent = "Surprise me ✦";
    actions.append(surprise);
    primary.append(kicker, title, description, actions);

    const secondary = document.createElement("article");
    secondary.className = "path-secondary";
    const progressKicker = document.createElement("p");
    progressKicker.className = "path-kicker";
    progressKicker.textContent = "Your quiet progress";
    const progressTitle = document.createElement("h2");
    const available = collection
      ? collection.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.status === "published")
      : publishedLessons().map(({ lesson }) => lesson);
    const completed = available.filter((lesson) => state.completed.has(lesson.id)).length;
    const percent = available.length ? Math.round((completed / available.length) * 100) : 0;
    progressTitle.textContent = `${percent}% explored`;
    const progressCopy = document.createElement("p");
    progressCopy.textContent = `${completed} of ${available.length} available lessons complete · ${state.bookmarks.size} saved`;
    const progressWrap = document.createElement("div");
    progressWrap.className = "path-progress";
    const meta = document.createElement("div");
    meta.className = "path-progress__meta";
    meta.append(
      Object.assign(document.createElement("span"), { textContent: "Progress" }),
      Object.assign(document.createElement("span"), { textContent: `${percent}%` }),
    );
    progressWrap.append(meta, createProgressTrack(percent, `${collection?.title || "Library"} progress: ${percent}%`));
    const savedActions = document.createElement("div");
    savedActions.className = "path-actions";
    const saved = document.createElement("button");
    saved.type = "button";
    saved.dataset.openBookmarks = "true";
    saved.textContent = `Open saved lessons (${state.bookmarks.size})`;
    savedActions.append(saved);
    secondary.append(progressKicker, progressTitle, progressCopy, progressWrap, savedActions);
    panel.append(primary, secondary);
    return panel;
  }

  function renderHome({ focusHeading = false } = {}) {
    state.selectedId = null;
    state.selectedCollectionId = null;
    state.openCollections.clear();
    state.openModules.clear();
    applyCollectionTone();
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
      "Each subject has its own structure, source policy, and review cycle. Existing knowledge stays intact as new domains grow over time.",
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
      description.textContent = shortText(collection.description, 170);
      markVietnamese(title, description);
      const metrics = document.createElement("div");
      metrics.className = "collection-card__metrics";
      metrics.append(
        Object.assign(document.createElement("span"), { textContent: `${collection.modules.length} groups` }),
        Object.assign(document.createElement("span"), { textContent: `${liveCount} available` }),
      );
      const progress = collectionProgress(collection);
      const progressWrap = document.createElement("div");
      progressWrap.className = "collection-card__progress";
      const progressText = document.createElement("small");
      progressText.textContent = `${progress.completed} of ${progress.available} complete`;
      progressWrap.append(progressText, createProgressTrack(progress.percent, `${collection.title} progress: ${progress.percent}%`));
      const open = document.createElement("button");
      open.type = "button";
      open.dataset.openCollection = collection.id;
      open.textContent = progress.completed ? "Continue domain →" : "Start here →";
      card.append(top, title, description, metrics, progressWrap, open);
      grid.append(card);
    });
    collections.append(grid);
    lessonReader.append(hero, createPathPanel());
    const recent = createRecentSection();
    if (recent) lessonReader.append(recent);
    lessonReader.append(collections);
    finishHomeRender({ focusHeading });
  }

  function renderCollectionHome(collectionId, { focusHeading = true } = {}) {
    const collection = state.data.collections.find((item) => item.id === collectionId);
    if (!collection) return;
    state.selectedId = null;
    state.selectedCollectionId = collection.id;
    state.openCollections = new Set([collection.id]);
    applyCollectionTone(collection.id);
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
    const sections = [hero, createPathPanel(collection)];

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
          markVietnamese(title, summary);
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
          "A simple map of this domain",
          "Use these ideas to connect the lessons. You do not need prior experience.",
        ));
        const mentalGrid = document.createElement("div");
        mentalGrid.className = "mental-model";
        collection.mentalModel.forEach((item, index) => {
          const card = document.createElement("article");
          const number = document.createElement("span");
          number.textContent = String(index + 1).padStart(2, "0");
          const label = document.createElement("strong");
          label.textContent = item;
          markVietnamese(label);
          card.append(number, label);
          mentalGrid.append(card);
        });
        mental.append(mentalGrid);
        sections.push(mental);
      }

      const curriculum = document.createElement("section");
      curriculum.className = "home-section";
      curriculum.append(createHomeSectionHead(
        "Your learning path",
        "Begin with Module 01. Each step builds on the one before it, from simple ideas to practical use.",
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
        const availableLessons = module.lessons.filter((lesson) => lesson.status === "published");
        const completedLessons = availableLessons.filter((lesson) => state.completed.has(lesson.id));
        count.textContent = `${completedLessons.length}/${availableLessons.length} complete`;
        top.append(number, count);
        const title = document.createElement("h3");
        title.textContent = module.title;
        const description = document.createElement("p");
        description.textContent = shortText(module.description, 150);
        const evidence = document.createElement("div");
        evidence.className = "module-card__evidence";
        const evidenceLabel = document.createElement("strong");
        evidenceLabel.textContent = "What you can do";
        const evidenceText = document.createElement("span");
        evidenceText.textContent = shortText(module.evidenceOutcome, 160);
        markVietnamese(title, description, evidenceText);
        evidence.append(evidenceLabel, evidenceText);
        const moduleProgress = document.createElement("div");
        moduleProgress.className = "module-card__progress";
        const modulePercent = availableLessons.length
          ? Math.round((completedLessons.length / availableLessons.length) * 100)
          : 0;
        const moduleProgressText = document.createElement("small");
        moduleProgressText.textContent = modulePercent ? `${modulePercent}% explored` : "Start with the first idea";
        moduleProgress.append(moduleProgressText, createProgressTrack(modulePercent, `${module.title} progress: ${modulePercent}%`));
        const open = document.createElement("button");
        open.type = "button";
        open.dataset.openModule = module.id;
        open.textContent = completedLessons.length ? "Continue module →" : "Start module →";
        if (!completedLessons.length) open.classList.add("module-card__start");
        card.append(top, title, description);
        if (module.evidenceOutcome) card.append(evidence);
        card.append(moduleProgress, open);
        moduleGrid.append(card);
      });
      curriculum.append(moduleGrid);
      sections.push(curriculum);

      if (collection.sourcePolicy.length) {
        const policy = document.createElement("section");
        policy.className = "home-section";
        policy.id = "source-policy";
        policy.append(createHomeSectionHead(
          "How sources are checked",
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
          markVietnamese(title, description);
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
          "Source library",
          "Each lesson links to its own sources. Official material comes first, and other evidence is clearly labeled.",
        ));
        const sourceGrid = document.createElement("div");
        sourceGrid.className = "source-library";
        collection.primarySources.forEach((source, sourceIndex) => {
          const card = document.createElement("article");
          card.className = "source-card";
          if (sourceIndex >= 6) {
            card.classList.add("is-source-extra");
            card.hidden = true;
          }
          const organization = document.createElement("p");
          organization.className = "source-card__org";
          organization.textContent = source.organization;
          const title = document.createElement("h3");
          title.textContent = source.title;
          const scope = document.createElement("p");
          scope.textContent = `${sourceDateLabels(source).join(" · ")} · ${source.scope}`;
          markVietnamese(organization, title, scope);
          card.append(organization, title, scope);
          if (source.url) {
            const link = document.createElement("a");
            link.href = source.url;
            link.target = "_blank";
            link.rel = "noreferrer noopener";
            link.textContent = "Open source ↗";
            card.append(link);
          }
          sourceGrid.append(card);
        });
        sources.append(sourceGrid);
        if (collection.primarySources.length > 6) {
          const toggleSources = document.createElement("button");
          toggleSources.type = "button";
          toggleSources.className = "source-library-toggle";
          toggleSources.dataset.toggleSources = "true";
          toggleSources.setAttribute("aria-expanded", "false");
          toggleSources.textContent = `Show all ${collection.primarySources.length} sources`;
          sources.append(toggleSources);
        }
        sections.push(sources);
      }
    }

    lessonReader.append(...sections);
    finishHomeRender({ focusHeading });
  }

  function createReadingCard(entry, actionText = "Read lesson →") {
    const card = document.createElement("article");
    card.className = "module-card reading-card";
    const top = document.createElement("div");
    top.className = "module-card__top";
    const mark = document.createElement("span");
    mark.textContent = entry.collection.mark;
    const meta = document.createElement("span");
    meta.textContent = `${estimatedMinutes(entry.lesson)} min`;
    top.append(mark, meta);
    const title = document.createElement("h3");
    title.textContent = entry.lesson.title;
    const summary = document.createElement("p");
    summary.textContent = shortText(entry.lesson.summary, 150);
    markVietnamese(title, summary);
    const open = document.createElement("button");
    open.type = "button";
    open.dataset.lessonId = entry.lesson.id;
    open.textContent = actionText;
    card.append(top, title, summary, open);
    return card;
  }

  function createRecentSection() {
    const entries = state.recent.map(validStoredLesson).filter(Boolean).slice(0, 3);
    if (!entries.length) return null;
    const section = document.createElement("section");
    section.className = "home-section";
    section.append(createHomeSectionHead(
      "Recently opened",
      "Return to the ideas that are still fresh in your mind.",
    ));
    const grid = document.createElement("div");
    grid.className = "module-overview";
    entries.forEach((entry) => grid.append(createReadingCard(entry, "Return to lesson →")));
    section.append(grid);
    return section;
  }

  function renderBookmarksHome({ focusHeading = true } = {}) {
    state.selectedId = null;
    state.selectedCollectionId = null;
    state.openCollections.clear();
    state.openModules.clear();
    applyCollectionTone();
    document.title = "Saved lessons | Knowledge Library";
    lessonReader.replaceChildren();
    const entries = Array.from(state.bookmarks).map(validStoredLesson).filter(Boolean);
    const hero = createHomeHero(
      "Your constellation",
      "Saved lessons",
      "Keep the ideas you want to revisit in one quiet place. Only lesson identifiers are saved on this device.",
      [
        [entries.length, "saved lessons"],
        [entries.filter(({ lesson }) => state.completed.has(lesson.id)).length, "already completed"],
      ],
    );
    lessonReader.append(hero);
    if (!entries.length) {
      const empty = document.createElement("section");
      empty.className = "empty-state home-section";
      const title = document.createElement("h2");
      title.textContent = "Nothing saved yet";
      const copy = document.createElement("p");
      copy.textContent = "Open a lesson and choose “Save lesson.” Your saved list will appear here.";
      const explore = document.createElement("button");
      explore.type = "button";
      explore.dataset.randomLesson = "all";
      explore.textContent = "Discover an idea ✦";
      empty.append(title, copy, explore);
      lessonReader.append(empty);
    } else {
      const section = document.createElement("section");
      section.className = "home-section";
      section.append(createHomeSectionHead(
        "Ideas to revisit",
        "Open any lesson, or remove it from the saved list from inside the reader.",
      ));
      const grid = document.createElement("div");
      grid.className = "module-overview";
      entries.forEach((entry) => grid.append(createReadingCard(entry)));
      section.append(grid);
      lessonReader.append(section);
    }
    finishHomeRender({ focusHeading });
  }

  function rememberLesson(entry) {
    state.lastRead = entry.lesson.id;
    state.recent = [entry.lesson.id, ...state.recent.filter((id) => id !== entry.lesson.id)].slice(0, 6);
    writeStorage(STORAGE_LAST_READ, state.lastRead, "Your reading place could not be saved on this device.");
    saveRecent();
  }

  function selectRandomLesson(collectionId = null) {
    const pool = publishedLessons().filter(({ collection, lesson }) =>
      (!collectionId || collectionId === "all" || collection.id === collectionId) && !state.completed.has(lesson.id),
    );
    const fallback = publishedLessons().filter(({ collection }) => !collectionId || collectionId === "all" || collection.id === collectionId);
    const choices = pool.length ? pool : fallback;
    if (!choices.length) {
      showToast("No available lesson was found.");
      return;
    }
    const random = new Uint32Array(1);
    window.crypto.getRandomValues(random);
    const entry = choices[random[0] % choices.length];
    selectLesson(entry.lesson.id);
  }

  function openResumeLesson() {
    const target = validPublishedLesson(state.lastRead) || nextLesson();
    if (target) selectLesson(target.lesson.id);
    else showToast("Every available lesson is complete.");
  }

  function updateCurrentLessonStateControls(lessonId) {
    if (state.selectedId !== lessonId) return;
    const complete = lessonReader.querySelector("[data-complete-lesson]");
    if (complete) {
      const completed = state.completed.has(lessonId);
      complete.setAttribute("aria-pressed", String(completed));
      complete.querySelector(".complete-button__check").textContent = completed ? "✓" : "";
      if (complete.lastElementChild) complete.lastElementChild.textContent = completed ? "Completed" : "Mark as completed";
    }
    const bookmark = lessonReader.querySelector("[data-bookmark-lesson]");
    if (bookmark) {
      const saved = state.bookmarks.has(lessonId);
      bookmark.setAttribute("aria-pressed", String(saved));
      bookmark.textContent = saved ? "✦ Saved" : "◇ Save lesson";
    }
  }

  function toggleBookmark(lessonId) {
    const entry = validStoredLesson(lessonId);
    if (!entry) return;
    if (state.bookmarks.has(lessonId)) {
      state.bookmarks.delete(lessonId);
      showToast("Removed from saved lessons.");
    } else {
      state.bookmarks.add(lessonId);
      showToast("Lesson saved on this device.");
    }
    saveBookmarks();
    updateToolsPanel();
    updateCurrentLessonStateControls(lessonId);
    renderNavigation();
  }

  function selectLesson(lessonId, { focusHeading = true, remember = true } = {}) {
    const entry = allLessons().find(({ lesson }) => lesson.id === lessonId);
    if (!entry) return;
    state.selectedId = lessonId;
    state.selectedCollectionId = entry.collection.id;
    state.openCollections = new Set([entry.collection.id]);
    state.openModules.add(entry.module.id);
    applyCollectionTone(entry.collection.id);
    if (remember) rememberLesson(entry);
    document.title = `${entry.lesson.title} | ${entry.collection.title}`;
    lessonReader.replaceChildren(
      entry.lesson.status === "published" ? renderPublishedLesson(entry) : renderPlannedLesson(entry),
    );
    renderNavigation();
    closeSidebar();
    closeSearch();
    closeTools();
    workspace.scrollTo({ top: 0, behavior: "auto" });
    updateReadingProgress();
    updateToolsPanel();
    if (focusHeading) window.requestAnimationFrame(() => lessonReader.querySelector("h1")?.focus({ preventScroll: true }));
  }

  function renderSearchResults(query) {
    const normalized = foldSearchText(query);
    searchResults.replaceChildren();
    if (!normalized) {
      state.searchMatches = [];
      state.searchIndex = -1;
      searchResults.hidden = true;
      searchInput.setAttribute("aria-expanded", "false");
      searchInput.removeAttribute("aria-activedescendant");
      return;
    }
    closeTools();
    const allMatches = allLessons().filter((entry) => lessonSearchText(entry).includes(normalized));
    const matches = allMatches.slice(0, 12);
    state.searchMatches = matches;
    state.searchIndex = -1;
    searchInput.removeAttribute("aria-activedescendant");
    const head = document.createElement("div");
    head.className = "search-results__head";
    head.setAttribute("role", "presentation");
    const label = document.createElement("span");
    label.textContent = allMatches.length > matches.length
      ? `${allMatches.length} results · showing ${matches.length}`
      : `${allMatches.length} results`;
    const hint = document.createElement("span");
    hint.textContent = "Esc to close";
    head.append(label, hint);
    searchResults.append(head);
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.setAttribute("role", "option");
      empty.setAttribute("aria-disabled", "true");
      empty.textContent = "No matching lesson, note, or concept was found.";
      searchResults.append(empty);
    } else {
      matches.forEach(({ collection, module, lesson }, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.id = `search-option-${index}`;
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", "false");
        button.tabIndex = -1;
        button.dataset.lessonId = lesson.id;
        const number = document.createElement("span");
        number.className = "search-result__number";
        number.textContent = module.number;
        const copy = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = lesson.title;
        const moduleName = document.createElement("small");
        moduleName.textContent = `${collection.title} · ${module.title}`;
        markVietnamese(title, moduleName);
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
    searchInput.setAttribute("aria-expanded", "true");
  }

  function closeSearch() {
    searchResults.hidden = true;
    state.searchIndex = -1;
    searchInput?.setAttribute("aria-expanded", "false");
    searchInput?.removeAttribute("aria-activedescendant");
  }

  function setSearchIndex(index) {
    const options = Array.from(searchResults.querySelectorAll('[role="option"]:not([aria-disabled="true"])'));
    if (!options.length) return;
    state.searchIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      const active = optionIndex === state.searchIndex;
      option.setAttribute("aria-selected", String(active));
      option.classList.toggle("is-active", active);
    });
    const active = options[state.searchIndex];
    searchInput.setAttribute("aria-activedescendant", active.id);
    active.scrollIntoView({ block: "nearest" });
  }

  function handleSearchKeydown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (searchResults.hidden) renderSearchResults(searchInput.value);
      setSearchIndex(state.searchIndex < 0 ? 0 : state.searchIndex + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (searchResults.hidden) renderSearchResults(searchInput.value);
      const optionCount = searchResults.querySelectorAll('[role="option"]:not([aria-disabled="true"])').length;
      setSearchIndex(state.searchIndex < 0 ? optionCount - 1 : state.searchIndex - 1);
      return;
    }
    if (event.key === "Enter" && state.searchMatches.length) {
      event.preventDefault();
      const entry = state.searchMatches[state.searchIndex >= 0 ? state.searchIndex : 0];
      if (entry) selectLesson(entry.lesson.id);
    }
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
    updateToolsPanel();
    updateCurrentLessonStateControls(lessonId);
    renderNavigation();
  }

  function updateReadingProgress() {
    const available = workspace.scrollHeight - workspace.clientHeight;
    const percent = available > 0 ? Math.min(100, Math.max(0, (workspace.scrollTop / available) * 100)) : 0;
    readingProgress.value = percent;
    updateActiveOutline();
  }

  function updateActiveOutline() {
    const sections = Array.from(lessonReader.querySelectorAll(".lesson-section"))
      .filter((section) => section.offsetParent !== null);
    if (!sections.length) return;
    let active = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 150) active = section;
    });
    lessonReader.querySelectorAll("[data-scroll-section]").forEach((button) => {
      if (button.dataset.scrollSection === active.id) button.setAttribute("aria-current", "location");
      else button.removeAttribute("aria-current");
    });
  }

  function lockVault() {
    window.clearTimeout(state.toastTimer);
    window.clearTimeout(state.shortcutTimer);
    state.toastTimer = null;
    state.shortcutTimer = null;
    state.shortcutPrefix = "";
    state.data = null;
    state.sourceMap = new Map();
    state.selectedId = null;
    state.selectedCollectionId = null;
    state.openCollections.clear();
    state.openModules.clear();
    state.completed = new Set();
    state.bookmarks = new Set();
    state.recent = [];
    state.lastRead = null;
    state.searchMatches = [];
    state.searchIndex = -1;
    setFocusMode(false);
    lessonReader.replaceChildren();
    moduleList.replaceChildren();
    searchResults.replaceChildren();
    searchInput.value = "";
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
    if (curriculumMeta) curriculumMeta.textContent = "Collections";
    if (resumeMeta) resumeMeta.textContent = "Find your next lesson";
    if (bookmarksMeta) bookmarksMeta.textContent = "0 saved";
    passwordInput.value = "";
    passwordInput.type = "password";
    passwordToggle.textContent = "Show";
    passwordToggle.setAttribute("aria-label", "Show password");
    document.body.classList.add("is-locked");
    document.body.classList.remove("sidebar-open");
    document.body.classList.remove("is-resizing-sidebar");
    state.sidebarResize = null;
    closeTools();
    closeThemeDialog({ restoreFocus: false });
    closeShortcuts({ restoreFocus: false });
    sidebarScrim.hidden = true;
    if (workspace) workspace.inert = false;
    toast.hidden = true;
    toast.textContent = "";
    try {
      if (window.location.hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } catch {
      // The in-memory lesson state is still cleared when history cannot be rewritten.
    }
    readingProgress.value = 0;
    vaultView.hidden = true;
    unlockView.hidden = false;
    headerStatus.textContent = "Locked";
    document.title = "Knowledge Library | Private Learning Space";
    unlockStatus.textContent = "";
    passwordInput.removeAttribute("aria-invalid");
    unlockCard.classList.remove("is-error");
    applyCollectionTone();
    passwordInput.focus();
  }

  async function unlockVault(event) {
    event.preventDefault();
    const password = passwordInput.value;
    if (!password) {
      unlockStatus.textContent = "Enter the library password.";
      passwordInput.setAttribute("aria-invalid", "true");
      passwordInput.focus();
      return;
    }
    unlockButton.disabled = true;
    unlockForm.setAttribute("aria-busy", "true");
    unlockButtonLabel.textContent = "Decrypting…";
    unlockStatus.textContent = "";
    unlockCard.classList.remove("is-error");
    try {
      const data = await decryptVault(password);
      state.data = data;
      state.sourceMap = new Map(data.primarySources.map((source) => [source.id, source]));
      state.completed = loadCompleted();
      state.bookmarks = loadIdSet(STORAGE_BOOKMARKS);
      const storedRecent = readStorage(STORAGE_RECENT, []);
      state.recent = Array.isArray(storedRecent) ? storedRecent.filter((item) => typeof item === "string").slice(0, 6) : [];
      const storedLastRead = readStorage(STORAGE_LAST_READ, null);
      state.lastRead = typeof storedLastRead === "string" ? storedLastRead : null;
      reconcileStoredState();
      state.openCollections = new Set();
      state.openModules = new Set();
      setReadingMode(readStorage(STORAGE_READING_MODE, "essentials"), false);
      setTextSize(readStorage(STORAGE_TEXT_SIZE, "comfortable"), false);
      passwordInput.removeAttribute("aria-invalid");
      document.body.classList.remove("is-locked");
      unlockView.hidden = true;
      vaultView.hidden = false;
      headerStatus.textContent = "Open · locally decrypted";
      curriculumMeta.textContent = `${data.collections.length} collections · ${allLessons().length} reading items`;
      renderHome({ focusHeading: true });
      passwordInput.value = "";
    } catch {
      lockVault();
      passwordInput.value = password;
      unlockStatus.textContent = "Unable to decrypt. Check the password and try again.";
      passwordInput.setAttribute("aria-invalid", "true");
      unlockCard.classList.add("is-error");
      passwordInput.select();
    } finally {
      unlockButton.disabled = false;
      unlockButtonLabel.textContent = "Enter the vault";
      unlockForm.removeAttribute("aria-busy");
    }
  }

  unlockForm?.addEventListener("submit", unlockVault);
  passwordInput?.addEventListener("input", () => {
    passwordInput.removeAttribute("aria-invalid");
    unlockCard.classList.remove("is-error");
    unlockStatus.textContent = "";
  });
  passwordToggle?.addEventListener("click", () => {
    const reveal = passwordInput.type === "password";
    passwordInput.type = reveal ? "text" : "password";
    passwordToggle.textContent = reveal ? "Hide" : "Show";
    passwordToggle.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
    passwordInput.focus();
  });
  lockButton?.addEventListener("click", lockVault);
  domainHomeButton?.addEventListener("click", () => {
    renderHome({ focusHeading: true });
    closeSidebar();
  });
  moduleList?.addEventListener("click", (event) => {
    const collectionButton = event.target.closest("[data-collection-id]");
    if (collectionButton) {
      const id = collectionButton.dataset.collectionId;
      if (state.selectedCollectionId === id && state.openCollections.has(id)) {
        state.openCollections.delete(id);
        renderNavigation();
        Array.from(moduleList.querySelectorAll("[data-collection-id]"))
          .find((button) => button.dataset.collectionId === id)
          ?.focus({ preventScroll: true });
        return;
      }
      state.openCollections.add(id);
      renderCollectionHome(id);
      closeSidebar();
      return;
    }
    const moduleToggle = event.target.closest("[data-module-id]");
    if (moduleToggle) {
      const id = moduleToggle.dataset.moduleId;
      if (state.openModules.has(id)) state.openModules.delete(id);
      else state.openModules.add(id);
      renderNavigation();
      Array.from(moduleList.querySelectorAll("[data-module-id]"))
        .find((button) => button.dataset.moduleId === id)
        ?.focus({ preventScroll: true });
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
    const bookmarkButton = event.target.closest("[data-bookmark-lesson]");
    if (bookmarkButton) {
      toggleBookmark(bookmarkButton.dataset.bookmarkLesson);
      return;
    }
    const readingModeControl = event.target.closest("[data-reader-mode]");
    if (readingModeControl) {
      toggleReadingMode();
      return;
    }
    const randomLessonButton = event.target.closest("[data-random-lesson]");
    if (randomLessonButton) {
      selectRandomLesson(randomLessonButton.dataset.randomLesson);
      return;
    }
    const savedLessonsButton = event.target.closest("[data-open-bookmarks]");
    if (savedLessonsButton) {
      renderBookmarksHome();
      return;
    }
    const sectionButton = event.target.closest("[data-scroll-section]");
    if (sectionButton) {
      document.getElementById(sectionButton.dataset.scrollSection)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const sourceToggle = event.target.closest("[data-toggle-sources]");
    if (sourceToggle) {
      const extras = lessonReader.querySelectorAll(".is-source-extra");
      const expanded = sourceToggle.getAttribute("aria-expanded") === "true";
      extras.forEach((card) => {
        card.hidden = expanded;
      });
      sourceToggle.setAttribute("aria-expanded", String(!expanded));
      sourceToggle.textContent = expanded ? `Show all ${extras.length + 6} sources` : "Show fewer sources";
      return;
    }
    const moduleButton = event.target.closest("[data-open-module]");
    if (moduleButton) {
      const module = state.data.modules.find((item) => item.id === moduleButton.dataset.openModule);
      if (module) {
        state.openModules.add(module.id);
        renderNavigation();
        const target = module.lessons.find(
          (lesson) => lesson.status === "published" && !state.completed.has(lesson.id),
        ) || module.lessons.find((lesson) => lesson.status === "published") || module.lessons[0];
        if (target) selectLesson(target.id);
      }
      return;
    }
    const sourceButton = event.target.closest("[data-show-sources]");
    if (sourceButton) {
      renderCollectionHome(sourceButton.dataset.collectionId, { focusHeading: false });
      window.requestAnimationFrame(() => {
        const target = lessonReader.querySelector("#source-policy") || lessonReader.querySelector(".home-hero h1");
        if (!target) return;
        target.tabIndex = -1;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.focus({ preventScroll: true });
      });
    }
  });
  searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchInput?.addEventListener("keydown", handleSearchKeydown);
  searchInput?.addEventListener("focus", () => {
    if (searchInput.value.trim()) renderSearchResults(searchInput.value);
  });
  searchResults?.addEventListener("click", (event) => {
    const result = event.target.closest("[data-lesson-id]");
    if (result) selectLesson(result.dataset.lessonId);
  });
  themeToggle?.addEventListener("click", () => openThemeDialog(themeToggle));
  themeToolButton?.addEventListener("click", () => openThemeDialog(themeToolButton));
  themeCloseButtons.forEach((button) => button.addEventListener("click", closeThemeDialog));
  themeOptions.forEach((option) => {
    option.addEventListener("click", () => setTheme(option.dataset.themeOption));
    option.addEventListener("keydown", handleThemeOptionKeydown);
  });
  toolsToggle?.addEventListener("click", toggleTools);
  toolsClose?.addEventListener("click", () => closeTools({ restoreFocus: true }));
  resumeButton?.addEventListener("click", openResumeLesson);
  randomButton?.addEventListener("click", () => selectRandomLesson());
  bookmarksButton?.addEventListener("click", () => {
    closeTools();
    renderBookmarksHome();
  });
  readingModeButton?.addEventListener("click", toggleReadingMode);
  textSizeButton?.addEventListener("click", cycleTextSize);
  focusButton?.addEventListener("click", () => setFocusMode(!state.focusMode));
  shortcutsButton?.addEventListener("click", openShortcuts);
  shortcutsCloseButtons.forEach((button) => button.addEventListener("click", closeShortcuts));
  sidebarOpenButton?.addEventListener("click", () => {
    if (state.focusMode) {
      setFocusMode(false);
      return;
    }
    openSidebar();
  });
  sidebarCloseButton?.addEventListener("click", () => closeSidebar({ restoreFocus: true }));
  sidebarCollapseButton?.addEventListener("click", collapseSidebar);
  sidebarScrim?.addEventListener("click", () => closeSidebar({ restoreFocus: true }));
  sidebarResizeHandle?.addEventListener("pointerdown", startSidebarResize);
  sidebarResizeHandle?.addEventListener("keydown", resizeSidebarWithKeyboard);
  window.addEventListener("pointermove", resizeSidebar);
  window.addEventListener("pointerup", finishSidebarResize);
  window.addEventListener("pointercancel", finishSidebarResize);
  window.addEventListener("resize", () => {
    const compact = isCompactSidebar();
    if (state.compactSidebar !== compact) {
      document.body.classList.remove("sidebar-open");
      sidebarScrim.hidden = true;
      if (workspace) workspace.inert = false;
      state.compactSidebar = compact;
    }
    if (!compact) setSidebarWidth(state.sidebarWidth, false);
    syncSidebarToggle();
    syncCurriculumInteractivity();
  });
  workspace?.addEventListener("scroll", updateReadingProgress, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (!themeDialog?.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeThemeDialog();
      } else if (event.key === "Tab") {
        trapModalFocus(event, themeDialog, ".theme-dialog");
      }
      return;
    }
    if (!shortcutsDialog?.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeShortcuts();
        return;
      }
      if (event.key === "Tab") trapModalFocus(event, shortcutsDialog, ".shortcut-dialog");
      return;
    }
    if (document.body.classList.contains("is-locked")) return;
    if (isCompactSidebar() && document.body.classList.contains("sidebar-open") && event.key === "Tab") {
      const controls = Array.from(curriculum.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
        .filter((control) => control.getClientRects().length > 0 && !control.closest("[hidden]"));
      if (controls.length) {
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || !curriculum.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !curriculum.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      closeTools();
      closeCompactSidebarForShortcut();
      searchInput?.focus();
      return;
    }
    if (event.key === "Escape") {
      if (!searchResults?.hidden) {
        event.preventDefault();
        closeSearch();
        searchInput?.focus({ preventScroll: true });
      } else if (!toolsPanel?.hidden) {
        event.preventDefault();
        closeTools({ restoreFocus: true });
      } else if (document.body.classList.contains("sidebar-open")) {
        event.preventDefault();
        closeSidebar({ restoreFocus: true });
      } else if (state.focusMode) {
        event.preventDefault();
        setFocusMode(false);
      }
      return;
    }
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target?.isContentEditable;
    if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key.toLocaleLowerCase();
    if (state.shortcutPrefix === "g") {
      window.clearTimeout(state.shortcutTimer);
      state.shortcutPrefix = "";
      if (key === "h") {
        event.preventDefault();
        closeCompactSidebarForShortcut();
        renderHome({ focusHeading: true });
      } else if (key === "s") {
        event.preventDefault();
        closeCompactSidebarForShortcut();
        renderBookmarksHome();
      }
      return;
    }
    if (key === "g") {
      state.shortcutPrefix = "g";
      state.shortcutTimer = window.setTimeout(() => {
        state.shortcutPrefix = "";
      }, 900);
      return;
    }
    if (key === "r") {
      event.preventDefault();
      closeCompactSidebarForShortcut();
      selectRandomLesson();
    } else if (key === "f") {
      event.preventDefault();
      closeCompactSidebarForShortcut();
      setFocusMode(!state.focusMode);
    } else if (key === "e") {
      event.preventDefault();
      closeCompactSidebarForShortcut();
      toggleReadingMode();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!toolsPanel?.hidden && !toolsPanel.contains(event.target) && !toolsToggle?.contains(event.target)) closeTools();
    if (!searchResults?.hidden && !searchResults.contains(event.target) && !searchInput?.contains(event.target)) closeSearch();
  });

  document.addEventListener("focusin", (event) => {
    if (!searchResults?.hidden && event.target !== searchInput && !searchResults.contains(event.target)) closeSearch();
    if (!toolsPanel?.hidden && event.target !== toolsToggle && !toolsPanel.contains(event.target)) closeTools();
  });

  initializeSidebarLayout();
  initializeTheme();
  setFocusMode(false);
  setReadingMode(readStorage(STORAGE_READING_MODE, "essentials"), false);
  setTextSize(readStorage(STORAGE_TEXT_SIZE, "comfortable"), false);
  applyCollectionTone();
})();
