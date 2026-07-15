(() => {
  "use strict";

  const AUTO_LOCK_MS = 15 * 60 * 1000;
  const VAULT_AAD = "knowledge-vault:v1";
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
  const vaultTitle = document.querySelector("[data-vault-title]");
  const vaultUpdated = document.querySelector("[data-vault-updated]");
  const noteTotal = document.querySelector("[data-note-total]");
  const categoryList = document.querySelector("[data-category-list]");
  const searchInput = document.querySelector("[data-vault-search]");
  const resultCount = document.querySelector("[data-result-count]");
  const noteList = document.querySelector("[data-note-list]");
  const noteReader = document.querySelector("[data-note-reader]");
  const emptyResults = document.querySelector("[data-empty-results]");
  const clearFiltersButton = document.querySelector("[data-clear-filters]");

  const state = {
    data: null,
    notes: [],
    category: "All",
    query: "",
    selectedId: null,
    autoLockTimer: null,
    lastActivityAt: 0,
  };

  function decodeBase64(value) {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  function normalizeString(value, fallback = "") {
    return typeof value === "string" ? value.trim() : fallback;
  }

  function normalizeNote(note, index) {
    const id = normalizeString(note?.id, `note-${index + 1}`);
    const title = normalizeString(note?.title, "Untitled note");
    const category = normalizeString(note?.category, "Uncategorized");
    const summary = normalizeString(note?.summary);
    const content = Array.isArray(note?.content)
      ? note.content.map((paragraph) => normalizeString(paragraph)).filter(Boolean)
      : [];
    const tags = Array.isArray(note?.tags) ? note.tags.map((tag) => normalizeString(tag)).filter(Boolean) : [];

    return {
      id,
      title,
      category,
      summary,
      content,
      tags,
      pinned: Boolean(note?.pinned),
      updatedAt: normalizeString(note?.updatedAt),
      sourceLabel: normalizeString(note?.sourceLabel),
      sourceUrl: normalizeString(note?.sourceUrl),
    };
  }

  function normalizeVaultData(value) {
    if (!value || typeof value !== "object" || !Array.isArray(value.notes)) {
      throw new Error("Vault data is invalid.");
    }

    const notes = value.notes.map(normalizeNote);
    const uniqueIds = new Set(notes.map((note) => note.id));
    if (uniqueIds.size !== notes.length) {
      throw new Error("Vault note IDs must be unique.");
    }

    return {
      title: normalizeString(value.title, "Personal Knowledge Vault"),
      owner: normalizeString(value.owner),
      updatedAt: normalizeString(value.updatedAt),
      notes,
    };
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
    if (!payload || payload.version !== 1) {
      throw new Error("Encrypted vault data is unavailable.");
    }

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
    if (!value) return "Date not recorded";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
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

  function countLabel(count, noun) {
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
  }

  function filteredNotes() {
    const normalizedQuery = state.query.toLocaleLowerCase();
    return state.notes.filter((note) => {
      const categoryMatches = state.category === "All" || note.category === state.category;
      if (!categoryMatches) return false;
      if (!normalizedQuery) return true;

      const searchText = [note.title, note.category, note.summary, ...note.tags, ...note.content]
        .join(" ")
        .toLocaleLowerCase();
      return searchText.includes(normalizedQuery);
    });
  }

  function sortNotes(notes) {
    return [...notes].sort((left, right) => {
      if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
      return right.updatedAt.localeCompare(left.updatedAt) || left.title.localeCompare(right.title);
    });
  }

  function renderCategories() {
    const counts = new Map();
    state.notes.forEach((note) => counts.set(note.category, (counts.get(note.category) || 0) + 1));
    const categories = ["All", ...Array.from(counts.keys()).sort((a, b) => a.localeCompare(b))];

    categoryList.replaceChildren();
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.category = category;
      button.setAttribute("aria-pressed", String(state.category === category));

      const label = document.createElement("span");
      label.textContent = category;
      const count = document.createElement("span");
      count.textContent = String(category === "All" ? state.notes.length : counts.get(category));

      button.append(label, count);
      categoryList.append(button);
    });
  }

  function createNoteCard(note) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "note-card";
    button.dataset.noteId = note.id;
    button.setAttribute("aria-pressed", String(note.id === state.selectedId));

    const topLine = document.createElement("span");
    topLine.className = "note-card__topline";
    const category = document.createElement("span");
    category.className = "note-card__category";
    category.textContent = note.category;
    topLine.append(category);

    if (note.pinned) {
      const pin = document.createElement("span");
      pin.className = "note-card__pin";
      pin.textContent = "Pinned";
      topLine.append(pin);
    }

    const title = document.createElement("h2");
    title.textContent = note.title;
    const summary = document.createElement("p");
    summary.textContent = note.summary || note.content[0] || "No summary yet.";

    button.append(topLine, title, summary);
    return button;
  }

  function renderReader(note) {
    noteReader.replaceChildren();
    if (!note) {
      const empty = document.createElement("div");
      empty.className = "note-reader__empty";
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "↗";
      const text = document.createElement("p");
      text.textContent = "Select a note to begin reading.";
      empty.append(icon, text);
      noteReader.append(empty);
      return;
    }

    const category = document.createElement("p");
    category.className = "reader-category";
    category.textContent = note.category;

    const title = document.createElement("h2");
    title.textContent = note.title;

    const summary = document.createElement("p");
    summary.className = "reader-summary";
    summary.textContent = note.summary || "No summary recorded.";

    const body = document.createElement("div");
    body.className = "reader-body";
    const paragraphs = note.content.length ? note.content : ["This note does not have any body content yet."];
    paragraphs.forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      body.append(element);
    });

    noteReader.append(category, title, summary, body);

    if (note.tags.length) {
      const tags = document.createElement("div");
      tags.className = "reader-tags";
      tags.setAttribute("aria-label", "Note tags");
      note.tags.forEach((tag) => {
        const element = document.createElement("span");
        element.textContent = tag;
        tags.append(element);
      });
      noteReader.append(tags);
    }

    const footer = document.createElement("footer");
    footer.className = "reader-footer";
    const updated = document.createElement("span");
    updated.textContent = `Updated ${formatDate(note.updatedAt)}`;
    footer.append(updated);

    const sourceUrl = safeExternalUrl(note.sourceUrl);
    if (sourceUrl) {
      const source = document.createElement("a");
      source.href = sourceUrl;
      source.target = "_blank";
      source.rel = "noreferrer noopener";
      source.textContent = note.sourceLabel || "Open source";
      footer.append(source);
    } else if (note.sourceLabel) {
      const source = document.createElement("span");
      source.textContent = note.sourceLabel;
      footer.append(source);
    }

    noteReader.append(footer);
  }

  function renderLibrary({ preserveSelection = true } = {}) {
    const notes = sortNotes(filteredNotes());
    const selectedStillVisible = notes.some((note) => note.id === state.selectedId);
    if (!preserveSelection || !selectedStillVisible) {
      state.selectedId = notes[0]?.id || null;
    }

    noteList.replaceChildren();
    notes.forEach((note) => noteList.append(createNoteCard(note)));

    const selected = state.notes.find((note) => note.id === state.selectedId) || null;
    renderReader(selected);
    renderCategories();

    const hasResults = notes.length > 0;
    noteList.hidden = !hasResults;
    noteReader.hidden = !hasResults;
    emptyResults.hidden = hasResults;
    resultCount.textContent = countLabel(notes.length, "result");
  }

  function setBusy(isBusy) {
    unlockButton.disabled = isBusy;
    passwordInput.disabled = isBusy;
    passwordToggle.disabled = isBusy;
    if (unlockButtonLabel) unlockButtonLabel.textContent = isBusy ? "Decrypting…" : "Unlock vault";
  }

  function scheduleAutoLock() {
    window.clearTimeout(state.autoLockTimer);
    if (!state.data) return;
    state.lastActivityAt = Date.now();
    state.autoLockTimer = window.setTimeout(() => lockVault("Vault locked after 15 minutes of inactivity."), AUTO_LOCK_MS);
  }

  function showVault(data) {
    state.data = data;
    state.notes = data.notes;
    state.category = "All";
    state.query = "";
    state.selectedId = sortNotes(data.notes)[0]?.id || null;

    vaultTitle.textContent = data.title;
    vaultUpdated.textContent = `Last knowledge update: ${formatDate(data.updatedAt)}`;
    noteTotal.textContent = countLabel(data.notes.length, "note");
    searchInput.value = "";
    renderLibrary({ preserveSelection: true });

    unlockView.hidden = true;
    vaultView.hidden = false;
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-unlocked");
    headerStatus.textContent = "Unlocked locally";
    document.title = `${data.title} | Private`;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    scheduleAutoLock();
    searchInput.focus({ preventScroll: true });
  }

  function clearDecryptedUi() {
    noteList.replaceChildren();
    categoryList.replaceChildren();
    renderReader(null);
    vaultTitle.textContent = "Personal Knowledge Vault";
    vaultUpdated.textContent = "";
    noteTotal.textContent = "0 notes";
    resultCount.textContent = "0 results";
    searchInput.value = "";
  }

  function lockVault(message = "Vault locked.") {
    window.clearTimeout(state.autoLockTimer);
    state.data = null;
    state.notes = [];
    state.category = "All";
    state.query = "";
    state.selectedId = null;
    state.lastActivityAt = 0;
    clearDecryptedUi();

    vaultView.hidden = true;
    unlockView.hidden = false;
    document.body.classList.remove("is-unlocked");
    document.body.classList.add("is-locked");
    headerStatus.textContent = "Locked";
    document.title = "Private Knowledge Vault | Truong Dinh Anh Tu";
    passwordInput.value = "";
    passwordInput.type = "password";
    passwordToggle.textContent = "Show";
    passwordToggle.setAttribute("aria-label", "Show password");
    unlockStatus.textContent = message;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    passwordInput.focus({ preventScroll: true });
  }

  async function handleUnlock(event) {
    event.preventDefault();
    unlockStatus.textContent = "";
    unlockCard.classList.remove("is-error");

    const password = passwordInput.value;
    if (!password) {
      unlockStatus.textContent = "Enter the vault password.";
      passwordInput.focus();
      return;
    }

    if (!window.crypto?.subtle) {
      unlockStatus.textContent = "This browser does not support secure local decryption.";
      return;
    }

    setBusy(true);
    try {
      const data = await decryptVault(password);
      passwordInput.value = "";
      unlockStatus.textContent = "";
      showVault(data);
    } catch {
      passwordInput.value = "";
      unlockCard.classList.add("is-error");
      unlockStatus.textContent = "Unable to unlock. Check the password and try again.";
      passwordInput.focus();
    } finally {
      setBusy(false);
    }
  }

  function handleActivity() {
    if (!state.data) return;
    scheduleAutoLock();
  }

  unlockForm.addEventListener("submit", handleUnlock);

  passwordToggle.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    passwordToggle.textContent = isVisible ? "Show" : "Hide";
    passwordToggle.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
    passwordInput.focus();
  });

  lockButton.addEventListener("click", () => lockVault("Vault locked manually."));

  categoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category || "All";
    renderLibrary({ preserveSelection: false });
    scheduleAutoLock();
  });

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value.trim();
    renderLibrary({ preserveSelection: false });
    scheduleAutoLock();
  });

  noteList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-note-id]");
    if (!button) return;
    state.selectedId = button.dataset.noteId;
    renderLibrary({ preserveSelection: true });
    scheduleAutoLock();
    if (window.matchMedia("(max-width: 767px)").matches) {
      noteReader.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  clearFiltersButton.addEventListener("click", () => {
    state.category = "All";
    state.query = "";
    searchInput.value = "";
    renderLibrary({ preserveSelection: false });
    searchInput.focus();
    scheduleAutoLock();
  });

  document.addEventListener("keydown", (event) => {
    if (state.data && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
    }
  });

  ["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
    document.addEventListener(eventName, handleActivity, { passive: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.data && Date.now() - state.lastActivityAt >= AUTO_LOCK_MS) {
      lockVault("Vault locked after 15 minutes of inactivity.");
    }
  });

  if (!window.__KNOWLEDGE_VAULT_DATA__) {
    unlockStatus.textContent = "Encrypted vault data is unavailable.";
    unlockButton.disabled = true;
  }
})();
