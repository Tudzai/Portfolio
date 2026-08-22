(() => {
  "use strict";

  const VAULT_AAD = "knowledge-vault:v1";
  const STORAGE_COMPLETED = "knowledge-library:completed:v2";
  const STORAGE_COMPLETED_LEGACY = "fintech-domain:completed:v1";
  const STORAGE_THEME = "knowledge-library:theme-preset:v2";
  const STORAGE_THEME_LEGACY = "fintech-domain:theme:v1";
  const STORAGE_SIDEBAR_WIDTH = "knowledge-library:sidebar-width:v1";
  const STORAGE_SIDEBAR_COLLAPSED = "knowledge-library:sidebar-collapsed:v1";
  const STORAGE_NAV_GROUPS = "knowledge-library:nav-groups:v1";
  const STORAGE_BOOKMARKS = "knowledge-library:bookmarks:v1";
  const STORAGE_RECENT = "knowledge-library:recent:v1";
  const STORAGE_LAST_READ = "knowledge-library:last-read:v1";
  const STORAGE_READING_MODE = "knowledge-library:reading-mode:v1";
  const STORAGE_TEXT_SIZE = "knowledge-library:text-size:v1";
  const COLLECTION_TONES = Object.freeze({
    "personal-notes": "violet",
    "fintech-domain": "cyan",
    "fin-domain": "gold",
    "rtcfo-domain": "rose",
    "brk-domain-breaking": "mint",
    "mrel-domain": "indigo",
    "personal-style": "coral",
    "photography": "azure",
    "cooking": "amber",
    "bar-drinks": "crimson",
    "coffee": "mocha",
    "japanese-culture": "crimson",
    "art-visual-culture": "gold",
    "architecture-design-living": "mint",
    "self-psychology": "indigo",
    "communication-conflict": "cyan",
    "relationships-boundaries": "rose",
  });
  const COLLECTION_GROUPS = Object.freeze([
    {
      id: "personal-space",
      mark: "01",
      title: "Personal space",
      description: "Notes and ideas worth keeping close.",
      collectionIds: ["personal-notes"],
    },
    {
      id: "money-leadership",
      mark: "02",
      title: "Money & leadership",
      description: "Finance, technology, and the path to better decisions.",
      collectionIds: ["fintech-domain", "fin-domain", "rtcfo-domain"],
    },
    {
      id: "movement-recovery",
      mark: "03",
      title: "Movement & recovery",
      description: "Build skill, understand the body, and recover well.",
      collectionIds: ["brk-domain-breaking", "mrel-domain"],
    },
    {
      id: "everyday-craft",
      mark: "04",
      title: "Everyday craft",
      description: "Style, images, and practical skills for daily life.",
      collectionIds: ["personal-style", "photography", "cooking"],
    },
    {
      id: "taste-ritual",
      mark: "05",
      title: "Taste & ritual",
      description: "Learn what is in the glass, cup, and moment.",
      collectionIds: ["bar-drinks", "coffee"],
    },
    {
      id: "culture-aesthetics",
      mark: "06",
      title: "Culture & aesthetics",
      description: "Read culture, art, design, and the spaces around you.",
      collectionIds: ["japanese-culture", "art-visual-culture", "architecture-design-living"],
    },
    {
      id: "self-relationships",
      mark: "07",
      title: "Self & relationships",
      description: "Understand yourself, communicate clearly, and build healthy bonds.",
      collectionIds: ["self-psychology", "communication-conflict", "relationships-boundaries"],
    },
  ]);
  const ESSENTIAL_SECTION_INDEXES = new Set([0, 1, 2, 3, 5, 7, 9, 10]);
  const EXPECTED_SECTION_COUNT = 11;
  const CANONICAL_SECTION_IDS = [
    "muc-tieu",
    "khai-niem",
    "vi-sao-quan-trong",
    "cach-hoat-dong",
    "ben-lien-quan",
    "vi-du",
    "tac-dong",
    "rui-ro",
    "khac-biet",
    "thuat-ngu",
    "tom-tat",
  ];
  const RELEASE_MANIFEST = [
    { id: "fintech-domain", modules: 12, lessons: 67, sources: 179 },
    { id: "fin-domain", modules: 15, lessons: 74, sources: 97 },
    { id: "rtcfo-domain", modules: 18, lessons: 89, sources: 68 },
    { id: "brk-domain-breaking", modules: 14, lessons: 68, sources: 41 },
    { id: "mrel-domain", modules: 15, lessons: 60, sources: 56 },
    { id: "personal-style", modules: 6, lessons: 18, sources: 12 },
    { id: "photography", modules: 6, lessons: 18, sources: 12 },
    { id: "cooking", modules: 6, lessons: 18, sources: 12 },
    { id: "bar-drinks", modules: 6, lessons: 18, sources: 12 },
    { id: "coffee", modules: 6, lessons: 18, sources: 12 },
    { id: "japanese-culture", modules: 6, lessons: 18, sources: 12 },
    { id: "art-visual-culture", modules: 6, lessons: 18, sources: 12 },
    { id: "architecture-design-living", modules: 6, lessons: 18, sources: 12 },
    { id: "self-psychology", modules: 6, lessons: 18, sources: 12 },
    { id: "communication-conflict", modules: 6, lessons: 18, sources: 12 },
    { id: "relationships-boundaries", modules: 6, lessons: 18, sources: 12 },
  ];
  const EXPECTED_COLLECTION_ORDER = Object.freeze(["personal-notes", ...RELEASE_MANIFEST.map(({ id }) => id)]);
  const GROUPED_COLLECTION_ORDER = Object.freeze(COLLECTION_GROUPS.flatMap(({ collectionIds }) => collectionIds));
  const SOURCE_DATE_FIELDS = ["publishedAt", "adoptedAt", "updatedAt", "reviewedAt", "accessedAt"];
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
  const GENERAL_INTEREST_COLLECTION_IDS = new Set([
    "personal-style",
    "photography",
    "cooking",
    "bar-drinks",
    "coffee",
    "japanese-culture",
    "art-visual-culture",
    "architecture-design-living",
    "self-psychology",
    "communication-conflict",
    "relationships-boundaries",
  ]);
  const GENERAL_INTEREST_SECTION_ALIASES = Object.freeze({
    "ben-lien-quan": "Ai hoặc yếu tố nào liên quan",
    "tac-dong": "Chi phí, tác động và lựa chọn thực tế",
    "khac-biet": "Khác biệt theo bối cảnh",
  });
  const THEME_PRESETS = Object.freeze({
    midnight: { label: "Midnight", description: "Ink, lavender, quiet stars", mode: "dark" },
    pearl: { label: "Pearl", description: "Soft paper, daylight, clarity", mode: "light" },
    nebula: { label: "Nebula", description: "Plum space, rose light, wonder", mode: "dark" },
    aurora: { label: "Aurora", description: "Deep teal, mint glow, calm", mode: "dark" },
    ember: { label: "Ember", description: "Charcoal, copper, late-night warmth", mode: "dark" },
    tide: { label: "Tide", description: "Mist, ocean blue, open air", mode: "light" },
    sakura: { label: "Sakura", description: "Blush paper, plum ink, softness", mode: "light" },
    solstice: { label: "Solstice", description: "Night blue, quiet gold, depth", mode: "dark" },
    washi: { label: "Washi", description: "Warm paper, vermilion, quiet craft", mode: "light" },
    grove: { label: "Grove", description: "Sage light, forest ink, soft edges", mode: "light" },
    noir: { label: "Noir", description: "Charcoal, champagne, editorial focus", mode: "dark" },
    atelier: { label: "Atelier", description: "Gallery ivory, cobalt, crisp geometry", mode: "light" },
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
  const sidebarFilterInput = document.querySelector("[data-sidebar-filter]");
  const sidebarFilterClear = document.querySelector("[data-sidebar-filter-clear]");
  const sidebarFilterStatus = document.querySelector("[data-sidebar-filter-status]");
  const sidebarGroupsToggle = document.querySelector("[data-sidebar-groups-toggle]");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeToolButton = document.querySelector("[data-theme-tool-button]");
  const themeToolMeta = document.querySelector("[data-theme-tool-meta]");
  const themeDialog = document.querySelector("[data-theme-dialog]");
  const themeCloseButtons = document.querySelectorAll("[data-theme-close]");
  const themeOptionsContainer = document.querySelector("[data-theme-options]");
  let themeOptions = [];
  let termHintTooltip = null;
  let activeTermHint = null;
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
  const dailyButton = document.querySelector("[data-daily-button]");
  const bookmarksButton = document.querySelector("[data-bookmarks-button]");
  const bookmarksMeta = document.querySelector("[data-bookmarks-meta]");
  const readingModeButton = document.querySelector("[data-reading-mode-button]");
  const readingModeLabel = document.querySelector("[data-reading-mode-label]");
  const readingModeMeta = document.querySelector("[data-reading-mode-meta]");
  const textSizeButton = document.querySelector("[data-text-size-button]");
  const textSizeMeta = document.querySelector("[data-text-size-meta]");
  const focusButton = document.querySelector("[data-focus-button]");
  const focusLabel = document.querySelector("[data-focus-label]");
  const focusMeta = document.querySelector("[data-focus-meta]");
  const focusTimerButton = document.querySelector("[data-focus-timer-button]");
  const focusTimerLabel = document.querySelector("[data-focus-timer-label]");
  const focusTimerMeta = document.querySelector("[data-focus-timer-meta]");
  const focusTimerChip = document.querySelector("[data-focus-timer-chip]");
  const focusTimerCountdown = document.querySelector("[data-focus-timer-countdown]");
  const focusTimerStopButton = document.querySelector("[data-focus-timer-stop]");
  const focusTimerLive = document.querySelector("[data-focus-timer-live]");
  const themeShuffleButton = document.querySelector("[data-theme-shuffle]");
  const themeMatchTimeButton = document.querySelector("[data-theme-match-time]");
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
    openNavGroups: new Set(),
    homeGroupId: null,
    sidebarFilter: "",
    completed: new Set(),
    bookmarks: new Set(),
    recent: [],
    lastRead: null,
    readingMode: "full",
    textSize: "comfortable",
    focusMode: false,
    focusTimerEnd: null,
    focusTimerInterval: null,
    focusTimerAnnouncedMinute: null,
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
    const learningLayer = new Set(["core", "detail"]).has(block.learningLayer) ? block.learningLayer : null;
    const withLearningLayer = (normalized) => learningLayer ? { ...normalized, learningLayer } : normalized;
    if (type === "paragraph") return withLearningLayer({ type, text: normalizeString(block.text) });
    if (type === "list") {
      return withLearningLayer({ type, items: normalizeStringArray(block.items), ordered: Boolean(block.ordered) });
    }
    if (type === "callout") {
      return withLearningLayer({
        type,
        label: normalizeString(block.label, "Lưu ý"),
        text: normalizeString(block.text),
        tone: normalizeString(block.tone, "note"),
      });
    }
    if (type === "table") {
      return withLearningLayer({
        type,
        headers: normalizeStringArray(block.headers),
        rows: Array.isArray(block.rows) ? block.rows.map((row) => normalizeStringArray(row)) : [],
      });
    }
    if (type === "flow") {
      return withLearningLayer({
        type,
        steps: Array.isArray(block.steps)
          ? block.steps.map((step, index) => ({
              label: normalizeString(step?.label, `Bước ${index + 1}`),
              title: normalizeString(step?.title),
              detail: normalizeString(step?.detail),
            }))
          : [],
      });
    }
    return null;
  }

  function normalizeFirstUseHints(value) {
    if (!Array.isArray(value)) return [];
    return value.map((hint) => ({
      term: normalizeString(hint?.term),
      explanation: normalizeString(hint?.explanation),
    })).filter((hint) => hint.term && hint.explanation);
  }

  function visibleBlockStrings(block) {
    if (!block || typeof block !== "object") return [];
    if (block.type === "paragraph") return [block.text];
    if (block.type === "list") return Array.isArray(block.items) ? block.items : [];
    if (block.type === "callout") return [block.text];
    if (block.type === "table") {
      return [
        ...(Array.isArray(block.headers) ? block.headers : []),
        ...(Array.isArray(block.rows) ? block.rows.flatMap((row) => Array.isArray(row) ? row : []) : []),
      ];
    }
    if (block.type === "flow") {
      return Array.isArray(block.steps)
        ? block.steps.flatMap((step) => [step?.label, step?.title, step?.detail])
        : [];
    }
    return [];
  }

  function learningBlockStrings(block) {
    if (block?.type === "callout") return [block.label, block.text];
    return visibleBlockStrings(block);
  }

  function inlineCitationIds(sections) {
    const renderedText = (Array.isArray(sections) ? sections : [])
      .flatMap((section) => Array.isArray(section?.blocks) ? section.blocks.flatMap(visibleBlockStrings) : [])
      .filter((value) => typeof value === "string")
      .join("\n");
    return [...renderedText.matchAll(/\[\[([a-z0-9-]+)\]\]/gi)].map((match) => match[1]);
  }

  function validateRawVaultData(value) {
    const claimedIds = new Set();
    const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    let invalid = false;
    const present = (item) => typeof item === "string" && Boolean(item.trim());
    const claimId = (item) => {
      if (!present(item) || item !== item.trim() || !idPattern.test(item) || claimedIds.has(item)) {
        invalid = true;
        return false;
      }
      claimedIds.add(item);
      return true;
    };
    const normalizedOrganization = (item) => present(item)
      ? item.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US")
      : "";
    const isIsoDate = (item) => {
      if (!present(item) || !datePattern.test(item)) return false;
      const [year, month, day] = item.split("-").map(Number);
      const parsed = new Date(Date.UTC(year, month - 1, day));
      return parsed.getUTCFullYear() === year
        && parsed.getUTCMonth() === month - 1
        && parsed.getUTCDate() === day;
    };
    const validBlock = (block) => {
      if (!block || typeof block !== "object") return false;
      if (block.learningLayer !== undefined && !new Set(["core", "detail"]).has(block.learningLayer)) return false;
      if (block.type === "paragraph") return present(block.text) && block.text.length <= 1_600;
      if (block.type === "list") {
        return Array.isArray(block.items)
          && block.items.length > 0
          && block.items.every((item) => present(item) && item.length <= 1_000);
      }
      if (block.type === "callout") {
        return present(block.label)
          && !/\[\[|\]\]/u.test(block.label)
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
      || value.domains.length !== RELEASE_MANIFEST.length
    ) {
      throw new Error("The decrypted library source is incomplete.");
    }

    claimId("personal-notes");
    claimId("legacy-notes");
    value.archivedVault.notes.forEach((note, index) => {
      if (
        !note
        || typeof note !== "object"
        || !claimId(note.id)
        || !present(note.title)
        || !Array.isArray(note.content)
        || !note.content.length
        || !note.content.every(present)
        || (note.sourceUrl !== undefined && note.sourceUrl !== "" && !safeExternalUrl(note.sourceUrl))
      ) invalid = true;
      if (present(note?.sourceLabel) || present(note?.sourceUrl)) claimId(`legacy-source-${index + 1}`);
    });

    value.domains.forEach((domain, domainIndex) => {
      const expected = RELEASE_MANIFEST[domainIndex];
      if (
        !domain
        || typeof domain !== "object"
        || !claimId(domain.id)
        || !expected
        || domain.id !== expected.id
        || !present(domain.mark)
        || !present(domain.title)
        || !present(domain.description)
        || !isIsoDate(domain.reviewedAt)
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
      const usedSources = new Set();
      domain.primarySources?.forEach((source) => {
        if (!source || typeof source !== "object" || !claimId(source.id)) {
          invalid = true;
          return;
        }
        sourceMap.set(source.id, source);
        const sourceDates = SOURCE_DATE_FIELDS
          .map((field) => source[field])
          .filter((item) => item !== undefined && item !== null && item !== "");
        if (
          !present(source.title)
          || !present(source.organization)
          || !present(source.scope)
          || !present(source.sourceType)
          || !safeExternalUrl(source.url)
          || sourceDates.length === 0
          || sourceDates.some((item) => !isIsoDate(item))
        ) invalid = true;
      });

      const moduleNumbers = new Set();
      let lessonCount = 0;
      domain.modules?.forEach((module, moduleIndex) => {
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
          || !present(module.evidenceOutcome)
          || String(module.number).padStart(2, "0") !== String(moduleIndex + 1).padStart(2, "0")
          || !Array.isArray(module.lessons)
          || module.lessons.length === 0
        ) invalid = true;
        moduleNumbers.add(number);

        module.lessons?.forEach((lesson) => {
          const sectionIds = Array.isArray(lesson?.sections) ? lesson.sections.map((section) => section?.id) : [];
          const references = Array.isArray(lesson?.references) ? lesson.references : [];
          const blocks = Array.isArray(lesson?.sections)
            ? lesson.sections.flatMap((section) => Array.isArray(section?.blocks) ? section.blocks : [])
            : [];
          const hasValidBlockArrays = Array.isArray(lesson?.sections)
            && lesson.sections.every((section) => Array.isArray(section?.blocks));
          const layeredBlocks = blocks.filter((block) => block?.learningLayer !== undefined);
          const hints = lesson?.firstUseHints;
          const normalizedHintTerms = Array.isArray(hints)
            ? hints.map((hint) => normalizeString(hint?.term).toLocaleLowerCase("vi"))
            : [];
          const preGlossaryFields = Array.isArray(lesson?.sections)
            ? lesson.sections.slice(0, 9).flatMap((section) =>
                Array.isArray(section?.blocks) ? section.blocks.flatMap(learningBlockStrings) : [],
              ).filter((item) => typeof item === "string")
            : [];
          const validHints = hints === undefined || (
            layeredBlocks.length === blocks.length
            && Array.isArray(hints)
            && hints.length <= 24
            && new Set(normalizedHintTerms).size === hints.length
            && hints.every((hint) =>
              present(hint?.term)
              && hint.term.length <= 80
              && present(hint?.explanation)
              && hint.explanation.length <= 600
              && !/\[\[|\]\]/u.test(`${hint.term} ${hint.explanation}`)
              && preGlossaryFields.some((field) => hasRenderableExactTerm(field, hint.term)),
            )
          );
          const validLearningLayer = hasValidBlockArrays && (
            layeredBlocks.length === 0
              ? lesson?.coreEstimatedMinutes === undefined
              : layeredBlocks.length === blocks.length
                && Number.isInteger(lesson?.coreEstimatedMinutes)
                && lesson.coreEstimatedMinutes >= 4
                && lesson.coreEstimatedMinutes <= 20
                && lesson.sections.every((section) => section.blocks.some((block) => block.learningLayer === "core"))
                && lesson.sections[7].blocks.every((block) => block.learningLayer === "core")
                && blocks.every((block) => block.type !== "callout" || block.tone !== "caution" || block.learningLayer === "core")
          );
          if (
            !lesson
            || typeof lesson !== "object"
            || !claimId(lesson.id)
            || !present(lesson.title)
            || !present(lesson.summary)
            || lesson.status !== "published"
            || sectionIds.length !== EXPECTED_SECTION_COUNT
            || new Set(sectionIds).size !== EXPECTED_SECTION_COUNT
            || sectionIds.some((id) => !present(id) || id !== id.trim() || !idPattern.test(id))
            || lesson.sections.some((section, sectionIndex) =>
              section?.id !== CANONICAL_SECTION_IDS[sectionIndex]
              || section?.title !== SECTION_TITLES[sectionIndex]
            )
            || !isIsoDate(lesson.lastReviewed)
            || !Number.isInteger(lesson.estimatedMinutes)
            || lesson.estimatedMinutes < 5
            || lesson.estimatedMinutes > 20
            || !lesson.sections.every((section) =>
              present(section?.title)
              && Array.isArray(section.blocks)
              && section.blocks.length > 0
              && section.blocks.every(validBlock),
            )
            || !validLearningLayer
            || !validHints
            || new Set(references).size < 3
            || new Set(references).size !== references.length
            || references.some((sourceId) => !sourceMap.has(sourceId))
          ) invalid = true;
          references.filter((sourceId) => sourceMap.has(sourceId)).forEach((sourceId) => usedSources.add(sourceId));

          const citations = new Set(inlineCitationIds(lesson?.sections));
          const organizations = new Set(
            references
              .map((sourceId) => normalizedOrganization(sourceMap.get(sourceId)?.organization))
              .filter(Boolean),
          );
          if (
            references.some((sourceId) => !citations.has(sourceId))
            || [...citations].some((sourceId) => !references.includes(sourceId))
            || organizations.size < 2
          ) invalid = true;
        });
      });
      if (lessonCount !== expected.lessons || usedSources.size !== sourceMap.size) {
        invalid = true;
      }
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
      coreEstimatedMinutes: Number.isFinite(lesson?.coreEstimatedMinutes) ? lesson.coreEstimatedMinutes : null,
      lastReviewed: normalizeString(lesson?.lastReviewed),
      keywords: normalizeStringArray(lesson?.keywords),
      firstUseHints: normalizeFirstUseHints(lesson?.firstUseHints),
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
    validateCollectionGroupManifest(data.collections);

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
    return writeStorage(STORAGE_COMPLETED, Array.from(state.completed), "Progress could not be saved on this device.");
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

  function fullEstimatedMinutes(lesson) {
    if (lesson.estimatedMinutes) return lesson.estimatedMinutes;
    const words = lessonPlainText(lesson).trim().split(/\s+/u).filter(Boolean).length;
    return Math.max(3, Math.round(words / 210));
  }

  function essentialEstimatedMinutes(lesson) {
    if (lessonHasLearningLayer(lesson) && lesson.coreEstimatedMinutes) return lesson.coreEstimatedMinutes;
    const visibleSections = Array.isArray(lesson?.sections)
      ? lesson.sections.filter((_, index) => ESSENTIAL_SECTION_INDEXES.has(index))
      : [];
    if (!visibleSections.length) return fullEstimatedMinutes(lesson);
    const visibleText = [
      lesson.title,
      lesson.summary,
      ...visibleSections.flatMap((section) => section.blocks.map(blockSearchText)),
    ].join(" ");
    const words = visibleText.trim().split(/\s+/u).filter(Boolean).length;
    return Math.max(3, Math.round(words / 210));
  }

  function lessonHasLearningLayer(lesson) {
    return lesson?.sections?.some((section) =>
      section.blocks?.some((block) => new Set(["core", "detail"]).has(block.learningLayer)),
    ) ?? false;
  }

  function readingMinutes(lesson, mode = state.readingMode) {
    if (mode === "essentials") return essentialEstimatedMinutes(lesson);
    return fullEstimatedMinutes(lesson);
  }

  function syncReadingTimes() {
    document.querySelectorAll("[data-reading-time]").forEach((element) => {
      const full = Number(element.dataset.fullMinutes);
      const core = Number(element.dataset.coreMinutes);
      const value = state.readingMode === "essentials" && Number.isFinite(core) && core > 0 ? core : full;
      const suffix = element.dataset.readingTimeSuffix || "min";
      element.textContent = `${value} ${suffix}`;
    });
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
    return available.find(({ lesson }) => !state.completed.has(lesson.id)) || null;
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

  function collectionTone(collectionId) {
    return COLLECTION_TONES[collectionId] ?? COLLECTION_TONES["personal-notes"];
  }

  function collectionsForGroup(group) {
    if (!state.data) return [];
    return group.collectionIds
      .map((collectionId) => state.data.collections.find((collection) => collection.id === collectionId))
      .filter(Boolean);
  }

  function navigationGroupForCollection(collectionId) {
    return COLLECTION_GROUPS.find((group) => group.collectionIds.includes(collectionId)) || null;
  }

  function saveNavigationGroups() {
    writeStorage(
      STORAGE_NAV_GROUPS,
      COLLECTION_GROUPS.map(({ id }) => id).filter((id) => state.openNavGroups.has(id)),
      "Library navigation preferences could not be saved on this device.",
    );
  }

  function loadNavigationGroups() {
    const stored = readStorage(STORAGE_NAV_GROUPS, []);
    const allowed = new Set(COLLECTION_GROUPS.map(({ id }) => id));
    const first = Array.isArray(stored) ? stored.find((id) => allowed.has(id)) : null;
    return new Set(first ? [first] : []);
  }

  function openNavigationGroupForCollection(collectionId) {
    const group = navigationGroupForCollection(collectionId);
    if (!group || (state.openNavGroups.size === 1 && state.openNavGroups.has(group.id))) return;
    state.openNavGroups = new Set([group.id]);
    saveNavigationGroups();
  }

  function updateSidebarGroupToggle() {
    if (!sidebarGroupsToggle) return;
    const allExpanded = COLLECTION_GROUPS.every(({ id }) => state.openNavGroups.has(id));
    sidebarGroupsToggle.textContent = allExpanded ? "Collapse all" : "Expand all";
    sidebarGroupsToggle.setAttribute("aria-label", allExpanded ? "Collapse all topic groups" : "Expand all topic groups");
  }

  function displaySectionTitle(collectionId, section) {
    if (!GENERAL_INTEREST_COLLECTION_IDS.has(collectionId)) return section.title;
    return GENERAL_INTEREST_SECTION_ALIASES[section.id] || section.title;
  }

  function preferredScrollBehavior() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  function validateCollectionGroupManifest(collections = null) {
    const unique = new Set(GROUPED_COLLECTION_ORDER);
    if (
      unique.size !== GROUPED_COLLECTION_ORDER.length
      || GROUPED_COLLECTION_ORDER.join("|") !== EXPECTED_COLLECTION_ORDER.join("|")
      || (collections && collections.map(({ id }) => id).join("|") !== EXPECTED_COLLECTION_ORDER.join("|"))
    ) {
      throw new Error("The collection-group manifest is incomplete.");
    }
  }

  function applyCollectionTone(collectionId = null) {
    document.documentElement.dataset.domainTone = collectionTone(collectionId ?? "personal-notes");
  }

  function setReadingMode(mode, persist = true) {
    const focusedReaderControl = document.activeElement instanceof HTMLElement
      && lessonReader?.contains(document.activeElement)
      ? document.activeElement
      : null;
    state.readingMode = mode === "essentials" ? "essentials" : "full";
    document.body.classList.toggle("essentials-mode", state.readingMode === "essentials");
    if (readingModeLabel) readingModeLabel.textContent = "Reading view";
    readingModeButton?.setAttribute("aria-label", "Essential reading view");
    readingModeButton?.setAttribute("aria-pressed", String(state.readingMode === "essentials"));
    if (readingModeMeta) {
      readingModeMeta.textContent = state.readingMode === "essentials"
        ? "Essentials on · Show full lesson"
        : "Full lesson · Show essentials";
    }
    lessonReader?.querySelectorAll("[data-reader-mode]").forEach((button) => {
      button.setAttribute("aria-label", "Essential reading view");
      button.setAttribute("aria-pressed", String(state.readingMode === "essentials"));
      button.textContent = "Essential view";
    });
    syncReadingTimes();
    if (persist) writeStorage(STORAGE_READING_MODE, state.readingMode);
    window.requestAnimationFrame(() => {
      if (focusedReaderControl && focusedReaderControl.offsetParent === null) {
        const visibleModeControl = lessonReader?.querySelector("[data-reader-mode]");
        visibleModeControl?.focus({ preventScroll: true });
      }
      updateReadingProgress();
    });
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
    if (focusLabel) focusLabel.textContent = "Focus mode";
    if (focusMeta) focusMeta.textContent = state.focusMode ? "On · Show navigation" : "Off · Quiet the navigation";
    focusButton?.setAttribute("aria-label", "Focus mode");
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

  function localDateKey(date = new Date()) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((part, index) => index ? String(part).padStart(2, "0") : String(part))
      .join("-");
  }

  function openDailySpark() {
    const choices = publishedLessons();
    if (!choices.length) return;
    const seed = localDateKey();
    let hash = 2166136261;
    for (const character of seed) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    const entry = choices[(hash >>> 0) % choices.length];
    closeTools();
    selectLesson(entry.lesson.id);
    showToast("Today's spark is ready.");
  }

  function announceFocusTimer(message) {
    if (focusTimerLive) focusTimerLive.textContent = message;
  }

  function syncFocusTimer({ announce = false } = {}) {
    const remaining = state.focusTimerEnd ? Math.max(0, state.focusTimerEnd - Date.now()) : 0;
    const active = remaining > 0;
    const totalSeconds = Math.ceil(remaining / 1_000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const countdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    if (focusTimerLabel) focusTimerLabel.textContent = "Focus timer";
    if (focusTimerMeta) {
      focusTimerMeta.textContent = active
        ? `${countdown} left · Stop timer`
        : "Stopped · Start 15 minutes";
    }
    focusTimerButton?.setAttribute("aria-label", "15-minute focus timer");
    focusTimerButton?.setAttribute("aria-pressed", String(active));
    if (focusTimerChip) focusTimerChip.hidden = !active;
    if (focusTimerCountdown) focusTimerCountdown.textContent = active ? countdown : "";
    if (active) {
      const announcedMinute = Math.max(1, Math.ceil(remaining / 60_000));
      if (announce || state.focusTimerAnnouncedMinute !== announcedMinute) {
        state.focusTimerAnnouncedMinute = announcedMinute;
        announceFocusTimer(`Focus timer: ${announcedMinute} ${announcedMinute === 1 ? "minute" : "minutes"} remaining.`);
      }
    }
    if (!active && state.focusTimerEnd) {
      window.clearInterval(state.focusTimerInterval);
      state.focusTimerInterval = null;
      state.focusTimerEnd = null;
      state.focusTimerAnnouncedMinute = null;
      announceFocusTimer("Focus session complete.");
      showToast("Focus session complete. Take a breath.");
    }
  }

  function stopFocusTimer({ announce = false } = {}) {
    const wasActive = Boolean(state.focusTimerEnd && state.focusTimerEnd > Date.now());
    window.clearInterval(state.focusTimerInterval);
    state.focusTimerInterval = null;
    state.focusTimerEnd = null;
    state.focusTimerAnnouncedMinute = null;
    syncFocusTimer();
    if (announce && wasActive) {
      announceFocusTimer("Focus timer stopped.");
      showToast("Focus timer stopped.");
    } else if (!announce) {
      announceFocusTimer("");
    }
  }

  function toggleFocusTimer() {
    if (state.focusTimerEnd && state.focusTimerEnd > Date.now()) {
      stopFocusTimer({ announce: true });
      return;
    }
    state.focusTimerEnd = Date.now() + 15 * 60_000;
    state.focusTimerAnnouncedMinute = null;
    window.clearInterval(state.focusTimerInterval);
    state.focusTimerInterval = window.setInterval(syncFocusTimer, 1_000);
    syncFocusTimer({ announce: true });
    setFocusMode(true);
    showToast("A 15-minute focus session has started.");
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

  function openShortcuts(trigger = document.activeElement) {
    if (!shortcutsDialog) return;
    state.previousFocus = toolsPanel?.contains(trigger) ? toolsToggle : trigger;
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
    const next = last && !state.completed.has(last.lesson.id) ? last : nextLesson();
    if (resumeMeta) resumeMeta.textContent = next ? shortText(next.lesson.title, 48) : "All available lessons completed";
    if (bookmarksMeta) bookmarksMeta.textContent = `${state.bookmarks.size} saved`;
    syncFocusTimer();
  }

  function renderThemeOptions() {
    if (!themeOptionsContainer) return;
    themeOptionsContainer.replaceChildren();
    Object.entries(THEME_PRESETS).forEach(([id, preset], index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "theme-option";
      option.setAttribute("role", "radio");
      option.setAttribute("aria-checked", String(index === 0));
      option.tabIndex = index === 0 ? 0 : -1;
      option.dataset.themeOption = id;
      option.setAttribute("aria-label", `${preset.label}: ${preset.description}`);
      option.title = preset.description;
      const swatch = document.createElement("span");
      swatch.className = "theme-option__swatch";
      swatch.setAttribute("aria-hidden", "true");
      const copy = document.createElement("span");
      copy.className = "theme-option__copy";
      const label = document.createElement("strong");
      label.textContent = preset.label;
      copy.append(label);
      const check = document.createElement("span");
      check.className = "theme-option__check";
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";
      option.append(swatch, copy, check);
      themeOptionsContainer.append(option);
    });
    themeOptions = Array.from(themeOptionsContainer.querySelectorAll("[data-theme-option]"));
  }

  function setTheme(theme, persist = true) {
    const migrated = theme === "light" ? "pearl" : theme === "dark" ? "midnight" : theme;
    const next = THEME_PRESETS[migrated] ? migrated : "midnight";
    const preset = THEME_PRESETS[next];
    document.documentElement.dataset.theme = preset.mode;
    document.documentElement.dataset.themePreset = next;
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (themeColor) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
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

  function shuffleTheme() {
    const current = document.documentElement.dataset.themePreset || "midnight";
    const choices = Object.keys(THEME_PRESETS).filter((theme) => theme !== current);
    const random = new Uint32Array(1);
    window.crypto.getRandomValues(random);
    const next = choices[random[0] % choices.length];
    setTheme(next);
    showToast(`${THEME_PRESETS[next].label} mood selected`);
    themeShuffleButton?.focus({ preventScroll: true });
  }

  function themeForLocalHour(hour = new Date().getHours()) {
    if (hour < 5) return "noir";
    if (hour < 8) return "washi";
    if (hour < 12) return "pearl";
    if (hour < 16) return "atelier";
    if (hour < 19) return "grove";
    if (hour < 22) return "ember";
    return "midnight";
  }

  function matchThemeToLocalTime() {
    const next = themeForLocalHour();
    setTheme(next);
    showToast(`${THEME_PRESETS[next].label} matched to your local time`);
    themeMatchTimeButton?.focus({ preventScroll: true });
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

  function createCollectionNavigation(collection) {
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
    const collectionEntries = collection.modules.reduce((total, module) => total + module.lessons.length, 0);
    const collectionLive = collection.modules.reduce(
      (total, module) => total + module.lessons.filter((lesson) => lesson.status === "published").length,
      0,
    );
    const progress = collectionProgress(collection);
    const collectionMeta = collection.kind === "notes"
      ? `${collectionEntries} preserved ${collectionEntries === 1 ? "note" : "notes"}`
      : `${collection.modules.length} modules · ${progress.completed}/${collectionLive} complete`;
    collectionButton.setAttribute("aria-label", `${collection.title}. ${collectionMeta}`);
    collectionCopy.append(collectionTitle);
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
      const liveCount = module.lessons.filter((lesson) => lesson.status === "published").length;
      const completedCount = module.lessons.filter((lesson) => state.completed.has(lesson.id)).length;
      const sourceMapped = module.lessons.every((lesson) => lesson.references.length >= 3);
      const moduleMeta = collection.kind === "notes"
        ? `${module.lessons.length} ${module.lessons.length === 1 ? "note" : "notes"}`
        : `${module.lessons.length} lessons${
            liveCount
              ? ` · ${completedCount}/${liveCount} complete`
              : sourceMapped
                ? " · source-mapped roadmap"
                : " · lesson planning"
          }`;
      toggle.setAttribute("aria-label", `${module.title}. ${moduleMeta}`);
      copy.append(title);
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
    return collectionGroup;
  }

  function createSidebarFilterResult(kind, titleText, contextText, dataset) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sidebar-filter-result";
    Object.entries(dataset).forEach(([key, value]) => {
      button.dataset[key] = value;
    });
    const kindLabel = document.createElement("span");
    kindLabel.className = "sidebar-filter-result__kind";
    kindLabel.textContent = kind;
    kindLabel.setAttribute("aria-hidden", "true");
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = titleText;
    const context = document.createElement("small");
    context.textContent = contextText;
    copy.append(title, context);
    const arrow = document.createElement("span");
    arrow.textContent = "›";
    arrow.setAttribute("aria-hidden", "true");
    button.append(kindLabel, copy, arrow);
    markVietnamese(title, context);
    return button;
  }

  function sidebarFilterMatches(value, query) {
    const haystack = foldSearchText(value);
    return foldSearchText(query)
      .split(/\s+/u)
      .filter(Boolean)
      .every((token) => haystack.includes(token));
  }

  function renderSidebarFilterResults() {
    const query = foldSearchText(state.sidebarFilter);
    const priorityResults = [];
    const results = [];
    const appendResult = (button, title) => {
      (sidebarFilterMatches(title, query) ? priorityResults : results).push(button);
    };
    state.data.collections.forEach((collection) => {
      if (sidebarFilterMatches(`${collection.title} ${collection.description}`, query)) {
        appendResult(createSidebarFilterResult(
          "COL",
          collection.title,
          `${collection.modules.length} modules · Open collection`,
          { collectionId: collection.id },
        ), collection.title);
      }
      collection.modules.forEach((module) => {
        if (sidebarFilterMatches(`${module.title} ${module.description} ${module.evidenceOutcome}`, query)) {
          appendResult(createSidebarFilterResult(
            "MOD",
            module.title,
            `${collection.title} · ${module.lessons.length} lessons`,
            { sidebarModuleId: module.id },
          ), module.title);
        }
        module.lessons.forEach((lesson) => {
          if (sidebarFilterMatches(`${lesson.title} ${lesson.summary} ${lesson.keywords.join(" ")}`, query)) {
            appendResult(createSidebarFilterResult(
              "LESS",
              lesson.title,
              `${collection.title} · ${module.title}`,
              { lessonId: lesson.id },
            ), lesson.title);
          }
        });
      });
    });

    const orderedResults = [...priorityResults, ...results];
    const limit = 48;
    const shown = orderedResults.slice(0, limit);
    if (shown.length) {
      const wrap = document.createElement("div");
      wrap.className = "sidebar-filter-results";
      wrap.append(...shown);
      moduleList.append(wrap);
    } else {
      const empty = document.createElement("p");
      empty.className = "sidebar-filter-empty";
      empty.textContent = "No collection, module, or lesson title matches this filter.";
      moduleList.append(empty);
    }
    if (sidebarFilterStatus) {
      sidebarFilterStatus.textContent = orderedResults.length > limit
        ? `${orderedResults.length} matches · showing ${limit}`
        : `${orderedResults.length} ${orderedResults.length === 1 ? "match" : "matches"}`;
    }
    if (sidebarFilterClear) sidebarFilterClear.hidden = false;
    if (sidebarGroupsToggle) sidebarGroupsToggle.hidden = true;
  }

  function renderNavigation() {
    moduleList.replaceChildren();
    if (!state.data) return;
    if (state.sidebarFilter) {
      renderSidebarFilterResults();
      return;
    }
    if (sidebarFilterClear) sidebarFilterClear.hidden = true;
    if (sidebarGroupsToggle) sidebarGroupsToggle.hidden = false;
    if (sidebarFilterStatus) {
      sidebarFilterStatus.textContent = `${COLLECTION_GROUPS.length} constellations · ${state.data.collections.length} collections`;
    }
    updateSidebarGroupToggle();
    COLLECTION_GROUPS.forEach((group) => {
      const collections = collectionsForGroup(group);
      if (!collections.length) return;
      const groupSection = document.createElement("section");
      groupSection.className = "collection-nav-group";
      groupSection.dataset.collectionGroup = group.id;
      groupSection.setAttribute("aria-labelledby", `collection-group-${group.id}`);
      const groupExpanded = state.openNavGroups.has(group.id);
      const groupLabel = document.createElement("button");
      groupLabel.type = "button";
      groupLabel.className = "collection-nav-group__label";
      groupLabel.dataset.navGroupId = group.id;
      groupLabel.setAttribute("aria-expanded", String(groupExpanded));
      const copy = document.createElement("span");
      copy.className = "collection-nav-group__title";
      copy.id = `collection-group-${group.id}`;
      copy.textContent = group.title;
      groupLabel.setAttribute(
        "aria-label",
        `${group.title}. ${collections.length} ${collections.length === 1 ? "collection" : "collections"}`,
      );
      const chevron = document.createElement("span");
      chevron.className = "collection-nav-group__chevron";
      chevron.textContent = "›";
      chevron.setAttribute("aria-hidden", "true");
      const groupBody = document.createElement("div");
      groupBody.className = "collection-nav-group__body";
      groupBody.id = `collection-group-body-${group.id}`;
      groupBody.hidden = !groupExpanded;
      groupBody.append(...collections.map(createCollectionNavigation));
      groupLabel.setAttribute("aria-controls", groupBody.id);
      groupLabel.append(copy, chevron);
      groupSection.append(groupLabel, groupBody);
      moduleList.append(groupSection);
    });
  }

  function resetSidebarFilter() {
    state.sidebarFilter = "";
    if (sidebarFilterInput) sidebarFilterInput.value = "";
  }

  function clearSidebarFilter({ focus = false } = {}) {
    resetSidebarFilter();
    renderNavigation();
    if (focus) sidebarFilterInput?.focus({ preventScroll: true });
  }

  function isWordCharacter(value) {
    return Boolean(value && /[\p{L}\p{N}]/u.test(value));
  }

  function exactTermIndex(text, term, fromIndex = 0) {
    const haystack = text.toLocaleLowerCase("vi");
    const needle = term.toLocaleLowerCase("vi");
    let index = haystack.indexOf(needle, fromIndex);
    while (index >= 0) {
      const before = index > 0 ? haystack[index - 1] : "";
      const after = index + needle.length < haystack.length ? haystack[index + needle.length] : "";
      const startsWithWord = isWordCharacter(needle[0]);
      const endsWithWord = isWordCharacter(needle[needle.length - 1]);
      if ((!startsWithWord || !isWordCharacter(before)) && (!endsWithWord || !isWordCharacter(after))) return index;
      index = haystack.indexOf(needle, index + Math.max(1, needle.length));
    }
    return -1;
  }

  function hasRenderableExactTerm(field, term) {
    return String(field ?? "")
      .split(/\[\[[a-z0-9-]+\]\]/gi)
      .some((segment) => exactTermIndex(segment, term) >= 0);
  }

  function foldHintText(value, withMap = false) {
    let text = "";
    const map = [];
    const source = String(value ?? "");
    for (let index = 0; index < source.length; index += 1) {
      const folded = source[index]
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/gu, "")
        .replace(/[đĐ]/gu, "d")
        .toLocaleLowerCase("en-US")
        .replace(/[^a-z0-9&/]+/gu, " ");
      for (const character of folded) {
        if (character === " " && text.endsWith(" ")) continue;
        text += character;
        if (withMap) map.push(index);
      }
    }
    return withMap ? { text, map } : text.trim();
  }

  function findTermMatch(text, term, fromIndex = 0) {
    const exactIndex = exactTermIndex(text, term, fromIndex);
    if (exactIndex >= 0) return { index: exactIndex, length: term.length };
    const foldedText = foldHintText(text, true);
    const foldedTerm = foldHintText(term);
    if (!foldedTerm) return null;
    let foldedFrom = foldedText.map.findIndex((sourceIndex) => sourceIndex >= fromIndex);
    if (foldedFrom < 0) foldedFrom = foldedText.text.length;
    let index = exactTermIndex(foldedText.text, foldedTerm, foldedFrom);
    while (index >= 0) {
      const start = foldedText.map[index];
      const last = foldedText.map[index + foldedTerm.length - 1];
      if (Number.isInteger(start) && Number.isInteger(last) && start >= fromIndex) {
        return { index: start, length: last - start + 1 };
      }
      index = exactTermIndex(foldedText.text, foldedTerm, index + Math.max(1, foldedTerm.length));
    }
    return null;
  }

  function createFirstUseHintState(lesson) {
    const hints = Array.isArray(lesson?.firstUseHints) ? lesson.firstUseHints : [];
    if (!hints.length) return null;
    const coreText = lesson.sections.slice(0, 9).flatMap((section) =>
      section.blocks
        .filter((block) => block.learningLayer !== "detail")
        .map(blockSearchText),
    ).join(" ").replace(/\[\[[a-z0-9-]+\]\]/gi, " ");
    return {
      hints: hints.map((hint, index) => ({
        ...hint,
        key: `${index}:${hint.term.toLocaleLowerCase("vi")}`,
        preferCore: Boolean(findTermMatch(coreText, hint.term)),
      })),
      used: new Set(),
    };
  }

  function ensureTermHintTooltip() {
    if (termHintTooltip?.isConnected) return termHintTooltip;
    termHintTooltip = document.createElement("div");
    termHintTooltip.id = "first-use-tooltip";
    termHintTooltip.className = "first-use-tooltip";
    termHintTooltip.setAttribute("role", "tooltip");
    termHintTooltip.hidden = true;
    document.body.append(termHintTooltip);
    return termHintTooltip;
  }

  function positionTermHintTooltip() {
    if (!activeTermHint?.isConnected || !termHintTooltip || termHintTooltip.hidden) return;
    const margin = 12;
    const gap = 10;
    const targetRect = activeTermHint.getBoundingClientRect();
    const tooltipRect = termHintTooltip.getBoundingClientRect();
    const left = Math.min(
      Math.max(margin, targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2)),
      Math.max(margin, window.innerWidth - tooltipRect.width - margin),
    );
    let top = targetRect.top - tooltipRect.height - gap;
    if (top < margin) top = targetRect.bottom + gap;
    if (top + tooltipRect.height > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - tooltipRect.height - margin);
    }
    termHintTooltip.style.left = `${Math.round(left)}px`;
    termHintTooltip.style.top = `${Math.round(top)}px`;
  }

  function showTermHintTooltip(target) {
    if (!target?.matches?.(".first-use-hint") || !target.dataset.explanation) return;
    const tooltip = ensureTermHintTooltip();
    if (activeTermHint && activeTermHint !== target) activeTermHint.removeAttribute("aria-describedby");
    activeTermHint = target;
    tooltip.textContent = target.dataset.explanation;
    tooltip.hidden = false;
    target.setAttribute("aria-describedby", tooltip.id);
    window.requestAnimationFrame(positionTermHintTooltip);
  }

  function hideTermHintTooltip({ clear = true } = {}) {
    activeTermHint?.removeAttribute("aria-describedby");
    activeTermHint = null;
    if (!termHintTooltip) return;
    termHintTooltip.hidden = true;
    termHintTooltip.style.left = "";
    termHintTooltip.style.top = "";
    if (clear) termHintTooltip.textContent = "";
  }

  function appendHintedText(element, text, hintState, block) {
    if (!hintState || !text) {
      element.append(document.createTextNode(text));
      return;
    }
    let cursor = 0;
    while (cursor < text.length) {
      let selected = null;
      hintState.hints.forEach((hint) => {
        if (hintState.used.has(hint.key)) return;
        if (block?.learningLayer === "detail" && hint.preferCore) return;
        const match = findTermMatch(text, hint.term, cursor);
        if (!match) return;
        if (!selected || match.index < selected.index || (match.index === selected.index && hint.term.length > selected.hint.term.length)) {
          selected = { hint, ...match };
        }
      });
      if (!selected) {
        element.append(document.createTextNode(text.slice(cursor)));
        break;
      }
      if (selected.index > cursor) element.append(document.createTextNode(text.slice(cursor, selected.index)));
      const visibleTerm = text.slice(selected.index, selected.index + selected.length);
      const definition = document.createElement("dfn");
      definition.className = "first-use-hint";
      definition.tabIndex = 0;
      definition.textContent = visibleTerm;
      definition.dataset.explanation = selected.hint.explanation;
      element.append(definition);
      hintState.used.add(selected.hint.key);
      cursor = selected.index + selected.length;
    }
  }

  function appendRichText(element, text, lesson, hintState = null, block = null) {
    const pattern = /\[\[([a-z0-9-]+)\]\]/gi;
    let cursor = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > cursor) appendHintedText(element, text.slice(cursor, match.index), hintState, block);
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
    if (cursor < text.length) appendHintedText(element, text.slice(cursor), hintState, block);
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

  function renderBlock(block, lesson, hintState = null) {
    const finish = (node) => {
      const elements = node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? Array.from(node.children) : [node];
      elements.forEach((element) => {
        if (block.learningLayer === "core") element.classList.add("learning-layer-core");
        if (block.learningLayer === "detail") element.classList.add("learning-layer-detail");
      });
      return node;
    };
    if (block.type === "paragraph") {
      const fragment = document.createDocumentFragment();
      readableChunks(block.text).forEach((chunk) => {
        const paragraph = document.createElement("p");
        paragraph.className = "content-block content-paragraph";
        appendRichText(paragraph, chunk, lesson, hintState, block);
        fragment.append(paragraph);
      });
      return finish(fragment);
    }
    if (block.type === "list") {
      const list = document.createElement(block.ordered ? "ol" : "ul");
      list.className = "content-block content-list";
      block.items.forEach((item) => {
        const row = document.createElement("li");
        appendRichText(row, item, lesson, hintState, block);
        list.append(row);
      });
      return finish(list);
    }
    if (block.type === "callout") {
      const callout = document.createElement("aside");
      callout.className = "content-block content-callout";
      callout.dataset.tone = block.tone;
      const label = document.createElement("strong");
      appendHintedText(label, block.label, hintState, block);
      const paragraph = document.createElement("p");
      appendRichText(paragraph, block.text, lesson, hintState, block);
      callout.append(label, paragraph);
      return finish(callout);
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
        appendRichText(cell, header, lesson, hintState, block);
        headRow.append(cell);
      });
      head.append(headRow);
      const body = document.createElement("tbody");
      block.rows.forEach((row) => {
        const tableRow = document.createElement("tr");
        row.forEach((value) => {
          const cell = document.createElement("td");
          appendRichText(cell, value, lesson, hintState, block);
          tableRow.append(cell);
        });
        body.append(tableRow);
      });
      table.append(head, body);
      wrap.append(table);
      return finish(wrap);
    }
    if (block.type === "flow") {
      const flow = document.createElement("ol");
      flow.className = "content-block flow-diagram";
      flow.setAttribute("aria-label", `Process with ${block.steps.length} steps`);
      block.steps.forEach((step) => {
        const card = document.createElement("li");
        card.className = "flow-step";
        const label = document.createElement("span");
        appendRichText(label, step.label, lesson, hintState, block);
        const title = document.createElement("strong");
        appendRichText(title, step.title, lesson, hintState, block);
        const detail = document.createElement("small");
        appendRichText(detail, step.detail, lesson, hintState, block);
        card.append(label, title, detail);
        flow.append(card);
      });
      return finish(flow);
    }
    return document.createDocumentFragment();
  }

  function createReaderHero(entry) {
    const { collection, module, lesson } = entry;
    const hero = document.createElement("header");
    hero.className = "reader-hero";
    const breadcrumb = document.createElement("p");
    breadcrumb.className = "reader-breadcrumb";
    const collectionName = document.createElement("span");
    collectionName.textContent = collection.title;
    markVietnamese(collectionName);
    const separator = document.createElement("span");
    separator.textContent = "·";
    const moduleName = document.createElement("span");
    moduleName.textContent = `${module.number}. ${module.title}`;
    moduleName.lang = "vi";
    breadcrumb.append(collectionName, separator, moduleName);
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
    if (collection.kind === "notes" || lesson.status !== "published") {
      const status = document.createElement("span");
      status.className = lesson.status === "published" ? "status-live" : "status-planned";
      status.textContent = collection.kind === "notes" ? "Saved note" : "Full lesson pending";
      meta.append(status);
    }
    const duration = document.createElement("span");
    const fullMinutes = fullEstimatedMinutes(lesson);
    const coreMinutes = essentialEstimatedMinutes(lesson);
    if (lesson.status === "published") {
      duration.dataset.readingTime = "true";
      duration.dataset.fullMinutes = String(fullMinutes);
      duration.dataset.coreMinutes = String(coreMinutes);
      duration.dataset.readingTimeSuffix = "min read";
      duration.textContent = `${readingMinutes(lesson)} min read`;
    } else {
      duration.textContent = `Target: ${fullMinutes} min lesson`;
    }
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
    readingMode.setAttribute("aria-label", "Essential reading view");
    readingMode.setAttribute("aria-pressed", String(state.readingMode === "essentials"));
    readingMode.textContent = "Essential view";
    toolGroup.append(bookmark, readingMode);
    tools.append(toolGroup);
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
    const headingCopy = document.createElement("div");
    headingCopy.className = "section-heading__copy";
    const title = document.createElement("h2");
    title.textContent = "Nguồn tham khảo";
    title.lang = "vi";
    headingCopy.append(title);
    heading.append(number, headingCopy);
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
    const next = nextUnreadLesson(entry);
    const nav = document.createElement("nav");
    nav.className = "lesson-nav";
    nav.setAttribute("aria-label", "Continue learning");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.completeContinue = entry.lesson.id;
    const label = document.createElement("strong");
    label.textContent = state.completed.has(entry.lesson.id)
      ? next ? "Next unread →" : "Back to collection →"
      : next ? "Complete & continue →" : "Complete & return →";
    const context = document.createElement("small");
    context.textContent = next ? next.lesson.title : entry.collection.title;
    markVietnamese(context);
    button.append(label, context);
    nav.append(button);
    return nav;
  }

  function nextUnreadLesson(entry) {
    const entries = allLessons().filter(
      ({ collection, lesson }) => collection.id === entry.collection.id
        && lesson.status === "published"
        && lesson.id !== entry.lesson.id,
    );
    const ordered = allLessons().filter(
      ({ collection, lesson }) => collection.id === entry.collection.id && lesson.status === "published",
    );
    const currentIndex = ordered.findIndex(({ lesson }) => lesson.id === entry.lesson.id);
    const forward = ordered.slice(currentIndex + 1).filter(({ lesson }) => !state.completed.has(lesson.id));
    const wrapped = ordered.slice(0, Math.max(0, currentIndex)).filter(({ lesson }) => !state.completed.has(lesson.id));
    return [...forward, ...wrapped].find(({ lesson }) => entries.some((item) => item.lesson.id === lesson.id)) || null;
  }

  function stripCitationTokens(value) {
    return normalizeString(value).replace(/\[\[[a-z0-9-]+\]\]/gi, " ").replace(/\s{2,}/g, " ").trim();
  }

  function createLessonOutline(entry) {
    const outline = document.createElement("nav");
    outline.className = "lesson-outline";
    outline.setAttribute("aria-label", "Lesson sections");
    const label = document.createElement("span");
    label.textContent = "Sections";
    outline.append(label);
    const hasLearningLayer = lessonHasLearningLayer(entry.lesson);
    entry.lesson.sections.forEach((section, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.scrollSection = `section-${section.id}`;
      if (hasLearningLayer || ESSENTIAL_SECTION_INDEXES.has(index)) button.classList.add("is-essential");
      button.textContent = displaySectionTitle(entry.collection.id, section);
      markVietnamese(button);
      outline.append(button);
    });
    const references = document.createElement("button");
    references.type = "button";
    references.className = "is-essential";
    references.dataset.scrollSection = "section-references";
    references.textContent = "Nguồn tham khảo";
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
    const hasLearningLayer = lessonHasLearningLayer(entry.lesson);
    const firstUseHintState = createFirstUseHintState(entry.lesson);
    entry.lesson.sections.forEach((sectionData, index) => {
      const section = document.createElement("section");
      section.className = "lesson-section";
      section.lang = "vi";
      if (hasLearningLayer || ESSENTIAL_SECTION_INDEXES.has(index)) section.classList.add("is-essential");
      section.id = `section-${sectionData.id}`;
      const heading = document.createElement("div");
      heading.className = "section-heading";
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const headingCopy = document.createElement("div");
      headingCopy.className = "section-heading__copy";
      const title = document.createElement("h2");
      title.textContent = displaySectionTitle(entry.collection.id, sectionData);
      headingCopy.append(title);
      heading.append(number, headingCopy);
      section.append(heading);
      const sectionHintState = index < 9 ? firstUseHintState : null;
      sectionData.blocks.forEach((block) => section.append(renderBlock(block, entry.lesson, sectionHintState)));
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

  function createHomeHero(titleText, ledeText, metaText = "") {
    const hero = document.createElement("section");
    hero.className = "home-hero";
    const copy = document.createElement("div");
    const title = document.createElement("h1");
    title.textContent = titleText;
    title.tabIndex = -1;
    const lede = document.createElement("p");
    lede.className = "home-hero__lede";
    lede.textContent = ledeText;
    markVietnamese(title, lede);
    copy.append(title, lede);
    if (metaText) {
      const meta = document.createElement("p");
      meta.className = "home-hero__meta";
      meta.textContent = metaText;
      copy.append(meta);
    }
    hero.append(copy);
    return hero;
  }

  function createHomeSectionHead(titleText, copyText = "") {
    const head = document.createElement("div");
    head.className = "home-section__head";
    const title = document.createElement("h2");
    title.textContent = titleText;
    head.append(title);
    if (copyText) {
      const copy = document.createElement("p");
      copy.textContent = copyText;
      head.append(copy);
    }
    return head;
  }

  function createHomeDisclosure(titleText, content, { open = false } = {}) {
    const disclosure = document.createElement("details");
    disclosure.className = "home-disclosure";
    disclosure.open = open;
    const summary = document.createElement("summary");
    const title = document.createElement("strong");
    title.textContent = titleText;
    const icon = document.createElement("span");
    icon.textContent = "+";
    icon.setAttribute("aria-hidden", "true");
    summary.append(title, icon);
    const body = document.createElement("div");
    body.className = "home-disclosure__body";
    body.append(content);
    disclosure.append(summary, body);
    return disclosure;
  }

  function finishHomeRender({ focusHeading = false } = {}) {
    hideTermHintTooltip();
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
    panel.className = "path-panel path-panel--single";
    panel.setAttribute("aria-label", collection ? "Continue this topic" : "Continue learning");

    const primary = document.createElement("article");
    primary.className = "path-primary";
    const target = validPublishedLesson(state.lastRead);
    const targetInCollection = target
      && !state.completed.has(target.lesson.id)
      && (!collection || target.collection.id === collection.id)
      ? target
      : null;
    const next = targetInCollection || nextLesson(collection?.id || null);
    const title = document.createElement("h2");
    title.textContent = next ? next.lesson.title : "You have completed every available lesson";
    const description = document.createElement("p");
    description.textContent = next
      ? shortText(next.lesson.summary, 150)
      : "Choose a topic and begin with one clear idea.";
    if (next) markVietnamese(title, description);
    const actions = document.createElement("div");
    actions.className = "path-actions";
    if (next) {
      const resume = document.createElement("button");
      resume.type = "button";
      resume.dataset.lessonId = next.lesson.id;
      resume.textContent = targetInCollection ? "Continue →" : "Start →";
      actions.append(resume);
    }
    const available = collection
      ? collection.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.status === "published")
      : publishedLessons().map(({ lesson }) => lesson);
    const completed = available.filter((lesson) => state.completed.has(lesson.id)).length;
    const percent = available.length ? Math.round((completed / available.length) * 100) : 0;
    const progressCopy = document.createElement("small");
    progressCopy.className = "path-progress-inline";
    progressCopy.textContent = `${completed}/${available.length} complete · ${percent}%`;
    primary.append(title, description, progressCopy, actions);
    panel.append(primary);
    return panel;
  }

  function createCollectionCard(collection) {
    const card = document.createElement("article");
    card.className = "collection-card";
    card.dataset.domainTone = collectionTone(collection.id);
    const top = document.createElement("div");
    top.className = "collection-card__top";
    const mark = document.createElement("span");
    mark.textContent = collection.mark;
    top.append(mark);
    const title = document.createElement("h3");
    title.textContent = collection.title;
    const description = document.createElement("p");
    description.textContent = shortText(collection.description, 145);
    markVietnamese(title, description);
    const progress = collectionProgress(collection);
    const progressWrap = document.createElement("div");
    progressWrap.className = "collection-card__progress";
    const progressText = document.createElement("small");
    progressText.textContent = `${progress.completed}/${progress.available} complete · ${progress.percent}%`;
    progressWrap.append(progressText, createProgressTrack(progress.percent, `${collection.title} progress: ${progress.percent}%`));
    const open = document.createElement("button");
    open.type = "button";
    open.dataset.openCollection = collection.id;
    open.textContent = progress.completed ? "Continue →" : "Explore →";
    card.append(top, title, description, progressWrap, open);
    return card;
  }

  function renderHome({ focusHeading = false } = {}) {
    resetSidebarFilter();
    state.selectedId = null;
    state.selectedCollectionId = null;
    state.openCollections.clear();
    state.openModules.clear();
    applyCollectionTone();
    document.title = "Knowledge Library | Private Learning Space";
    lessonReader.replaceChildren();
    const live = publishedLessons();
    const hero = createHomeHero(
      "Follow your curiosity.",
      "Continue one thread or open a constellation.",
      `${state.data.collections.length} collections · ${live.length} lessons`,
    );

    const lastEntry = validPublishedLesson(state.lastRead);
    const preferredGroup = navigationGroupForCollection(lastEntry?.collection.id)?.id || null;
    if (!COLLECTION_GROUPS.some(({ id }) => id === state.homeGroupId)) state.homeGroupId = preferredGroup;

    const groupedCollections = document.createElement("div");
    groupedCollections.className = "home-groups";
    COLLECTION_GROUPS.forEach((group) => {
      const collections = collectionsForGroup(group);
      if (!collections.length) return;
      const section = document.createElement("section");
      section.className = "home-section topic-group";
      section.dataset.collectionGroup = group.id;
      const expanded = state.homeGroupId === group.id;
      const heading = document.createElement("h2");
      heading.className = "topic-group__heading";
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "topic-group__toggle";
      toggle.dataset.homeGroupToggle = group.id;
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.setAttribute("aria-controls", `home-group-${group.id}`);
      const groupMark = document.createElement("span");
      groupMark.className = "topic-group__mark";
      groupMark.textContent = group.mark;
      groupMark.setAttribute("aria-hidden", "true");
      const groupTitle = document.createElement("span");
      groupTitle.textContent = group.title;
      const chevron = document.createElement("span");
      chevron.className = "topic-group__chevron";
      chevron.textContent = "›";
      chevron.setAttribute("aria-hidden", "true");
      toggle.setAttribute(
        "aria-label",
        `${group.title}. ${collections.length} ${collections.length === 1 ? "collection" : "collections"}`,
      );
      toggle.append(groupMark, groupTitle, chevron);
      heading.append(toggle);
      const grid = document.createElement("div");
      grid.className = "collection-grid";
      grid.id = `home-group-${group.id}`;
      grid.hidden = !expanded;
      collections.forEach((collection) => grid.append(createCollectionCard(collection)));
      section.append(heading, grid);
      groupedCollections.append(section);
    });
    lessonReader.append(hero, createPathPanel());
    lessonReader.append(groupedCollections);
    finishHomeRender({ focusHeading });
  }

  function renderCollectionHome(collectionId, { focusHeading = true } = {}) {
    const collection = state.data.collections.find((item) => item.id === collectionId);
    if (!collection) return;
    resetSidebarFilter();
    openNavigationGroupForCollection(collection.id);
    state.selectedId = null;
    state.selectedCollectionId = collection.id;
    state.openCollections = new Set([collection.id]);
    state.openModules.clear();
    applyCollectionTone(collection.id);
    document.title = `${collection.title} | Knowledge Library`;
    lessonReader.replaceChildren();
    const entries = collection.modules.flatMap((module) => module.lessons);
    const live = entries.filter((lesson) => lesson.status === "published");
    const hero = createHomeHero(
      collection.title,
      collection.description,
      `${collection.modules.length} modules · ${live.length} lessons · ${collection.primarySources.length} sources`,
    );
    const sections = [hero, createPathPanel(collection)];

    if (collection.kind === "notes") {
      const notes = document.createElement("section");
      notes.className = "home-section";
      notes.append(createHomeSectionHead("Preserved notes"));
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
        sections.push(createHomeDisclosure("Domain map", mentalGrid));
      }

      const curriculum = document.createElement("section");
      curriculum.className = "home-section";
      curriculum.append(createHomeSectionHead("Modules"));
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
        const evidenceText = document.createElement("p");
        evidenceText.className = "module-card__outcome";
        evidenceText.textContent = shortText(module.evidenceOutcome, 160);
        markVietnamese(title, evidenceText);
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
        card.append(top, title);
        if (module.evidenceOutcome) card.append(evidenceText);
        card.append(moduleProgress, open);
        moduleGrid.append(card);
      });
      curriculum.append(moduleGrid);
      sections.push(curriculum);

      if (collection.sourcePolicy.length) {
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
        const policy = createHomeDisclosure(
          `How sources are checked · reviewed ${formatDate(collection.reviewedAt)}`,
          policyGrid,
        );
        policy.id = "source-policy";
        sections.push(policy);
      }

      if (collection.primarySources.length) {
        const sourceContent = document.createElement("div");
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
        sourceContent.append(sourceGrid);
        if (collection.primarySources.length > 6) {
          const toggleSources = document.createElement("button");
          toggleSources.type = "button";
          toggleSources.className = "source-library-toggle";
          toggleSources.dataset.toggleSources = "true";
          toggleSources.setAttribute("aria-expanded", "false");
          toggleSources.textContent = `Show all ${collection.primarySources.length} sources`;
          sourceContent.append(toggleSources);
        }
        const sources = createHomeDisclosure("Source library", sourceContent);
        sources.id = "primary-sources";
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
    meta.dataset.readingTime = "true";
    meta.dataset.fullMinutes = String(fullEstimatedMinutes(entry.lesson));
    meta.dataset.coreMinutes = String(essentialEstimatedMinutes(entry.lesson));
    meta.textContent = `${readingMinutes(entry.lesson)} min`;
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
    section.append(createHomeSectionHead("Recently opened"));
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
      "Saved lessons",
      "Ideas you want to revisit, stored as local lesson identifiers only.",
      `${entries.length} saved · ${entries.filter(({ lesson }) => state.completed.has(lesson.id)).length} complete`,
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
      section.append(createHomeSectionHead("Ideas to revisit"));
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
    const last = validPublishedLesson(state.lastRead);
    const target = last && !state.completed.has(last.lesson.id) ? last : nextLesson();
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
    resetSidebarFilter();
    openNavigationGroupForCollection(entry.collection.id);
    state.selectedId = lessonId;
    state.selectedCollectionId = entry.collection.id;
    state.openCollections = new Set([entry.collection.id]);
    state.openModules = new Set([entry.module.id]);
    applyCollectionTone(entry.collection.id);
    if (remember) rememberLesson(entry);
    document.title = `${entry.lesson.title} | ${entry.collection.title}`;
    hideTermHintTooltip();
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

  function jumpActionItems() {
    const current = currentEntry();
    const last = validPublishedLesson(state.lastRead);
    const next = last && !state.completed.has(last.lesson.id) ? last : nextLesson();
    const actions = [
      { id: "continue", marker: "↗", title: "Continue reading", context: next ? next.lesson.title : "Open the next unread lesson" },
      { id: "saved", marker: "◇", title: "Saved lessons", context: `${state.bookmarks.size} saved on this device` },
      { id: "daily", marker: "☼", title: "Daily spark", context: "One locally chosen idea for today" },
      { id: "surprise", marker: "✦", title: "Surprise me", context: "Open an unread lesson" },
      { id: "theme", marker: "◐", title: "Theme studio", context: THEME_PRESETS[document.documentElement.dataset.themePreset]?.label || "Choose a mood" },
      { id: "reading-mode", marker: "≋", title: state.readingMode === "essentials" ? "Show full lesson" : "Show essentials", context: "Change the visible lesson depth" },
      { id: "text-size", marker: "Aa", title: "Reading size", context: state.textSize === "xlarge" ? "Extra large" : state.textSize === "large" ? "Large" : "Comfortable" },
      { id: "focus", marker: "◌", title: state.focusMode ? "Exit focus mode" : "Enter focus mode", context: "Quiet the navigation" },
      { id: "timer", marker: "◷", title: state.focusTimerEnd ? "Stop focus timer" : "Start 15-minute focus", context: "Session-only timer" },
      { id: "shortcuts", marker: "?", title: "Keyboard shortcuts", context: "Move through the library without a mouse" },
    ];
    if (current?.lesson.status === "published") {
      actions.splice(1, 0, {
        id: "completion",
        marker: "✓",
        title: state.completed.has(current.lesson.id) ? "Mark current lesson incomplete" : "Mark current lesson complete",
        context: current.lesson.title,
      });
    }
    return actions.map((action) => ({ ...action, kind: "action", searchText: `${action.title} ${action.context}` }));
  }

  function jumpResultScore(result, query) {
    const normalized = foldSearchText(query).trim();
    if (!normalized) return result.kind === "action" ? 0 : null;
    const tokens = normalized.split(/\s+/u).filter(Boolean);
    const title = foldSearchText(result.title);
    const haystack = foldSearchText(`${result.title} ${result.context} ${result.searchText || ""}`);
    if (!tokens.every((token) => haystack.includes(token))) return null;
    if (title === normalized) return 0;
    if (title.startsWith(normalized)) return 1;
    if (tokens.every((token) => title.includes(token))) return 2;
    return 3;
  }

  function buildJumpResults(query) {
    const results = [...jumpActionItems()];
    state.data.collections.forEach((collection) => {
      results.push({
        kind: "collection",
        id: collection.id,
        marker: collection.mark,
        title: collection.title,
        context: `${collection.modules.length} modules`,
        searchText: `${collection.title} ${collection.description}`,
      });
      collection.modules.forEach((module) => {
        results.push({
          kind: "module",
          id: module.id,
          marker: module.number,
          title: module.title,
          context: collection.title,
          searchText: `${module.title} ${module.description} ${module.evidenceOutcome}`,
        });
        module.lessons.forEach((lesson) => {
          const entry = { collection, module, lesson };
          results.push({
            kind: "lesson",
            id: lesson.id,
            marker: module.number,
            title: lesson.title,
            context: `${collection.title} · ${module.title}`,
            searchText: lessonSearchText(entry),
          });
        });
      });
    });
    return results
      .map((result, order) => ({ result, order, score: jumpResultScore(result, query) }))
      .filter(({ score }) => score !== null)
      .sort((left, right) => left.score - right.score || left.order - right.order)
      .slice(0, 36)
      .map(({ result }) => result);
  }

  function openJumpModule(moduleId) {
    const entry = state.data.collections
      .flatMap((collection) => collection.modules.map((module) => ({ collection, module })))
      .find(({ module }) => module.id === moduleId);
    if (!entry) return;
    const target = entry.module.lessons.find(
      (lesson) => lesson.status === "published" && !state.completed.has(lesson.id),
    ) || entry.module.lessons.find((lesson) => lesson.status === "published");
    if (target) selectLesson(target.id);
    else renderCollectionHome(entry.collection.id);
  }

  function dispatchJumpResult(result) {
    if (!result) return;
    searchInput.value = "";
    closeSearch();
    const returnFocusToJump = () => window.requestAnimationFrame(() => searchInput?.focus({ preventScroll: true }));
    if (result.kind === "lesson") selectLesson(result.id);
    else if (result.kind === "module") openJumpModule(result.id);
    else if (result.kind === "collection") renderCollectionHome(result.id);
    else if (result.id === "continue") openResumeLesson();
    else if (result.id === "saved") renderBookmarksHome();
    else if (result.id === "daily") openDailySpark();
    else if (result.id === "surprise") selectRandomLesson();
    else if (result.id === "theme") openThemeDialog(searchInput);
    else if (result.id === "reading-mode") {
      toggleReadingMode();
      showToast(state.readingMode === "essentials" ? "Essential view on." : "Full lesson visible.");
      returnFocusToJump();
    } else if (result.id === "text-size") {
      cycleTextSize();
      showToast(`Reading size: ${state.textSize === "xlarge" ? "extra large" : state.textSize}.`);
      returnFocusToJump();
    } else if (result.id === "focus") setFocusMode(!state.focusMode);
    else if (result.id === "timer") {
      toggleFocusTimer();
      returnFocusToJump();
    } else if (result.id === "shortcuts") openShortcuts(searchInput);
    else if (result.id === "completion") {
      toggleCompleted(currentEntry()?.lesson.id);
      returnFocusToJump();
    }
  }

  function renderSearchResults(query) {
    searchResults.replaceChildren();
    closeTools();
    const matches = buildJumpResults(query);
    state.searchMatches = matches;
    state.searchIndex = -1;
    searchInput.removeAttribute("aria-activedescendant");
    const head = document.createElement("div");
    head.className = "search-results__head";
    head.setAttribute("role", "presentation");
    const label = document.createElement("span");
    label.textContent = query.trim() ? `${matches.length} matches` : "Quick actions";
    const hint = document.createElement("span");
    hint.textContent = query.trim() ? "Esc to close" : "Type to search everything";
    head.append(label, hint);
    searchResults.append(head);
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.setAttribute("role", "option");
      empty.setAttribute("aria-disabled", "true");
      empty.textContent = "No matching topic, lesson, or action was found.";
      searchResults.append(empty);
    } else {
      matches.forEach((result, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.id = `search-option-${index}`;
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", "false");
        button.tabIndex = -1;
        button.dataset.jumpIndex = String(index);
        const marker = document.createElement("span");
        marker.className = "search-result__number";
        marker.textContent = result.marker;
        const copy = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = result.title;
        const context = document.createElement("small");
        context.textContent = result.context;
        markVietnamese(title, context);
        copy.append(title, context);
        const status = document.createElement("span");
        status.className = "search-result__status";
        status.textContent = result.kind;
        button.append(marker, copy);
        if (result.kind !== "action") button.append(status);
        else button.classList.add("search-result--action");
        searchResults.append(button);
      });
    }
    searchResults.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function closeSearch() {
    searchResults.hidden = true;
    state.searchMatches = [];
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
    if (event.isComposing) return;
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
      dispatchJumpResult(state.searchMatches[state.searchIndex >= 0 ? state.searchIndex : 0]);
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
    const currentNavigation = lessonReader.querySelector(".lesson-nav");
    if (state.selectedId === lessonId && currentNavigation) currentNavigation.replaceWith(renderLessonNavigation(entry));
    renderNavigation();
  }

  function completeAndContinue(lessonId) {
    const entry = validPublishedLesson(lessonId);
    if (!entry) return;
    const wasCompleted = state.completed.has(lessonId);
    state.completed.add(lessonId);
    const persisted = saveCompleted();
    const next = nextUnreadLesson(entry);
    if (next) {
      selectLesson(next.lesson.id);
      if (persisted) {
        showToast(wasCompleted ? "Your next unread lesson is open." : "Completed. Your next unread lesson is open.");
      }
      return;
    }
    renderCollectionHome(entry.collection.id);
    if (persisted) showToast(wasCompleted ? "Back at the collection." : "Collection complete. Nicely done.");
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
    stopFocusTimer();
    hideTermHintTooltip();
    state.toastTimer = null;
    state.shortcutTimer = null;
    state.shortcutPrefix = "";
    state.data = null;
    state.sourceMap = new Map();
    state.selectedId = null;
    state.selectedCollectionId = null;
    state.openCollections.clear();
    state.openModules.clear();
    state.homeGroupId = null;
    state.sidebarFilter = "";
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
    if (sidebarFilterInput) sidebarFilterInput.value = "";
    if (sidebarFilterClear) sidebarFilterClear.hidden = true;
    if (sidebarFilterStatus) sidebarFilterStatus.textContent = "Browse by constellation";
    if (sidebarGroupsToggle) sidebarGroupsToggle.hidden = false;
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
      state.openNavGroups = loadNavigationGroups();
      setReadingMode(readStorage(STORAGE_READING_MODE, "essentials"), false);
      setTextSize(readStorage(STORAGE_TEXT_SIZE, "comfortable"), false);
      passwordInput.removeAttribute("aria-invalid");
      document.body.classList.remove("is-locked");
      unlockView.hidden = true;
      vaultView.hidden = false;
      headerStatus.textContent = "Open · locally decrypted";
      if (curriculumMeta) curriculumMeta.textContent = `${data.collections.length} collections · ${allLessons().length} reading items`;
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
  sidebarFilterInput?.addEventListener("input", () => {
    state.sidebarFilter = sidebarFilterInput.value.trim();
    renderNavigation();
  });
  sidebarFilterInput?.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.sidebarFilter) {
      event.preventDefault();
      clearSidebarFilter({ focus: true });
      return;
    }
    if ((event.key === "ArrowDown" || event.key === "Enter") && state.sidebarFilter) {
      const first = moduleList.querySelector(".sidebar-filter-result");
      if (!first) return;
      event.preventDefault();
      if (event.key === "Enter") first.click();
      else first.focus();
    }
  });
  sidebarFilterClear?.addEventListener("click", () => clearSidebarFilter({ focus: true }));
  sidebarGroupsToggle?.addEventListener("click", () => {
    const allExpanded = COLLECTION_GROUPS.every(({ id }) => state.openNavGroups.has(id));
    state.openNavGroups = allExpanded
      ? new Set()
      : new Set(COLLECTION_GROUPS.map(({ id }) => id));
    saveNavigationGroups();
    renderNavigation();
    sidebarGroupsToggle.focus({ preventScroll: true });
  });
  moduleList?.addEventListener("keydown", (event) => {
    const current = event.target.closest(".sidebar-filter-result");
    if (!current || !state.sidebarFilter) return;
    const results = Array.from(moduleList.querySelectorAll(".sidebar-filter-result"));
    const index = results.indexOf(current);
    if (event.key === "Escape") {
      event.preventDefault();
      clearSidebarFilter({ focus: true });
      return;
    }
    const targetIndex = event.key === "ArrowDown"
      ? Math.min(results.length - 1, index + 1)
      : event.key === "ArrowUp"
        ? Math.max(0, index - 1)
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? results.length - 1
            : -1;
    if (targetIndex < 0 || targetIndex === index) return;
    event.preventDefault();
    results[targetIndex]?.focus({ preventScroll: true });
  });
  moduleList?.addEventListener("click", (event) => {
    const groupButton = event.target.closest("[data-nav-group-id]");
    if (groupButton) {
      const id = groupButton.dataset.navGroupId;
      state.openNavGroups = state.openNavGroups.has(id) ? new Set() : new Set([id]);
      saveNavigationGroups();
      renderNavigation();
      moduleList.querySelector(`[data-nav-group-id="${id}"]`)?.focus({ preventScroll: true });
      return;
    }
    const sidebarModuleResult = event.target.closest("[data-sidebar-module-id]");
    if (sidebarModuleResult) {
      const moduleId = sidebarModuleResult.dataset.sidebarModuleId;
      const entry = state.data.collections
        .flatMap((collection) => collection.modules.map((module) => ({ collection, module })))
        .find(({ module }) => module.id === moduleId);
      if (!entry) return;
      state.openModules = new Set([entry.module.id]);
      const target = entry.module.lessons.find(
        (lesson) => lesson.status === "published" && !state.completed.has(lesson.id),
      ) || entry.module.lessons.find((lesson) => lesson.status === "published") || entry.module.lessons[0];
      if (target) selectLesson(target.id);
      else renderCollectionHome(entry.collection.id);
      return;
    }
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
      state.openModules = state.openModules.has(id) ? new Set() : new Set([id]);
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
    const homeGroupButton = event.target.closest("[data-home-group-toggle]");
    if (homeGroupButton) {
      const id = homeGroupButton.dataset.homeGroupToggle;
      state.homeGroupId = state.homeGroupId === id ? null : id;
      lessonReader.querySelectorAll("[data-home-group-toggle]").forEach((button) => {
        const open = button.dataset.homeGroupToggle === state.homeGroupId;
        button.setAttribute("aria-expanded", String(open));
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        if (panel) panel.hidden = !open;
      });
      homeGroupButton.focus({ preventScroll: true });
      return;
    }
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
    const completeContinueButton = event.target.closest("[data-complete-continue]");
    if (completeContinueButton) {
      completeAndContinue(completeContinueButton.dataset.completeContinue);
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
    const dailySparkButton = event.target.closest("[data-daily-spark]");
    if (dailySparkButton) {
      openDailySpark();
      return;
    }
    const savedLessonsButton = event.target.closest("[data-open-bookmarks]");
    if (savedLessonsButton) {
      renderBookmarksHome();
      return;
    }
    const sectionButton = event.target.closest("[data-scroll-section]");
    if (sectionButton) {
      document.getElementById(sectionButton.dataset.scrollSection)?.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
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
        state.openModules = new Set([module.id]);
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
        target.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
        target.focus({ preventScroll: true });
      });
    }
  });
  searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchInput?.addEventListener("keydown", handleSearchKeydown);
  searchInput?.addEventListener("focus", () => {
    renderSearchResults(searchInput.value);
  });
  searchResults?.addEventListener("click", (event) => {
    const result = event.target.closest("[data-jump-index]");
    if (result) dispatchJumpResult(state.searchMatches[Number(result.dataset.jumpIndex)]);
  });
  document.addEventListener("focusin", (event) => {
    const hint = event.target.closest?.(".first-use-hint");
    if (hint) showTermHintTooltip(hint);
  });
  document.addEventListener("focusout", (event) => {
    if (event.target !== activeTermHint) return;
    window.requestAnimationFrame(() => {
      if (document.activeElement !== activeTermHint) hideTermHintTooltip();
    });
  });
  document.addEventListener("pointerover", (event) => {
    const hint = event.target.closest?.(".first-use-hint");
    if (hint && event.pointerType !== "touch") showTermHintTooltip(hint);
  });
  document.addEventListener("pointerout", (event) => {
    if (event.pointerType === "touch" || event.target !== activeTermHint) return;
    if (event.relatedTarget && activeTermHint.contains(event.relatedTarget)) return;
    if (document.activeElement !== activeTermHint) hideTermHintTooltip();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest?.(".first-use-hint")) hideTermHintTooltip();
  });
  document.addEventListener("click", (event) => {
    const hint = event.target.closest?.(".first-use-hint");
    if (!hint) return;
    hint.focus({ preventScroll: true });
    showTermHintTooltip(hint);
  });
  document.addEventListener("scroll", hideTermHintTooltip, { capture: true, passive: true });
  renderThemeOptions();
  themeToggle?.addEventListener("click", () => openThemeDialog(themeToggle));
  themeToolButton?.addEventListener("click", () => openThemeDialog(themeToolButton));
  themeCloseButtons.forEach((button) => button.addEventListener("click", closeThemeDialog));
  themeOptions.forEach((option) => {
    option.addEventListener("click", () => setTheme(option.dataset.themeOption));
    option.addEventListener("keydown", handleThemeOptionKeydown);
  });
  themeMatchTimeButton?.addEventListener("click", matchThemeToLocalTime);
  themeShuffleButton?.addEventListener("click", shuffleTheme);
  toolsToggle?.addEventListener("click", toggleTools);
  toolsClose?.addEventListener("click", () => closeTools({ restoreFocus: true }));
  resumeButton?.addEventListener("click", openResumeLesson);
  randomButton?.addEventListener("click", () => selectRandomLesson());
  dailyButton?.addEventListener("click", openDailySpark);
  bookmarksButton?.addEventListener("click", () => {
    closeTools();
    renderBookmarksHome();
  });
  readingModeButton?.addEventListener("click", toggleReadingMode);
  textSizeButton?.addEventListener("click", cycleTextSize);
  focusButton?.addEventListener("click", () => setFocusMode(!state.focusMode));
  focusTimerButton?.addEventListener("click", toggleFocusTimer);
  focusTimerStopButton?.addEventListener("click", () => stopFocusTimer({ announce: true }));
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
    hideTermHintTooltip();
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
  workspace?.addEventListener("scroll", () => hideTermHintTooltip(), { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    if (activeTermHint && event.key === "Escape") {
      event.preventDefault();
      const target = activeTermHint;
      hideTermHintTooltip();
      target.focus({ preventScroll: true });
      return;
    }
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
      if (state.focusMode) setFocusMode(false);
      closeTools();
      closeCompactSidebarForShortcut();
      searchInput?.focus();
      if (searchInput) renderSearchResults(searchInput.value);
      return;
    }
    if (event.key === "Escape") {
      if (!searchResults?.hidden) {
        event.preventDefault();
        closeSearch();
        searchInput?.focus({ preventScroll: true });
      } else if (toolsPanel && !toolsPanel.hidden) {
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
    } else if (key === "d") {
      event.preventDefault();
      closeCompactSidebarForShortcut();
      openDailySpark();
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
    if (toolsPanel && !toolsPanel.hidden && !toolsPanel.contains(event.target) && !toolsToggle?.contains(event.target)) closeTools();
    if (!searchResults?.hidden && !searchResults.contains(event.target) && !searchInput?.contains(event.target)) closeSearch();
  });

  document.addEventListener("focusin", (event) => {
    if (!searchResults?.hidden && event.target !== searchInput && !searchResults.contains(event.target)) closeSearch();
    if (toolsPanel && !toolsPanel.hidden && event.target !== toolsToggle && !toolsPanel.contains(event.target)) closeTools();
  });

  initializeSidebarLayout();
  initializeTheme();
  setFocusMode(false);
  setReadingMode(readStorage(STORAGE_READING_MODE, "essentials"), false);
  setTextSize(readStorage(STORAGE_TEXT_SIZE, "comfortable"), false);
  applyCollectionTone();
})();
