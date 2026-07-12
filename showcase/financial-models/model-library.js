(() => {
  "use strict";

  const library = document.querySelector("[data-model-library]");
  const models = Array.isArray(window.TDAT_MODEL_LIBRARY) ? window.TDAT_MODEL_LIBRARY : [];
  const roleFamilies = Array.isArray(window.TDAT_ROLE_FAMILIES) ? window.TDAT_ROLE_FAMILIES : [];
  if (!library || models.length === 0) return;

  const search = library.querySelector("[data-model-search]");
  const domainFilters = library.querySelector("[data-model-domain-filters]");
  const roleFilter = library.querySelector("[data-model-role]");
  const levelFilter = library.querySelector("[data-model-level]");
  const statusFilter = library.querySelector("[data-model-status]");
  const results = library.querySelector("[data-model-results]");
  const resultCount = library.querySelector("[data-model-result-count]");
  const empty = library.querySelector("[data-model-empty]");
  const resetButtons = library.querySelectorAll("[data-model-reset]");

  const state = {
    query: "",
    domain: "All",
    role: "All",
    level: "All",
    status: "All",
  };

  const priorityOrder = { P0: 0, P1: 1, P2: 2 };
  const statusOrder = { Available: 0, "In QA": 1, Roadmap: 2 };
  const sortedModels = [...models].sort((a, b) => {
    const byStatus = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    if (byStatus !== 0) return byStatus;
    const byPriority = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    if (byPriority !== 0) return byPriority;
    return a.title.localeCompare(b.title);
  });

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function appendTags(container, values, className = "model-chip") {
    values.forEach((value) => container.append(createElement("span", className, value)));
  }

  function getModelRoleFamilies(model) {
    const modelRoles = new Set(model.roles || []);
    return roleFamilies.filter((family) => family.roles.some((role) => modelRoles.has(role)));
  }

  function createIcon(name) {
    const icon = createElement("i");
    icon.setAttribute("data-lucide", name);
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function createModelCard(model) {
    const card = createElement("article", "model-card");
    card.dataset.modelCard = "";
    card.dataset.status = model.status;
    card.dataset.search = normalize(
      [
        model.title,
        model.decision,
        model.description,
        model.domain,
        ...getModelRoleFamilies(model).map((family) => family.label),
        ...(model.roles || []),
        ...(model.useCases || []),
        ...(model.tags || []),
      ].join(" "),
    );

    const topline = createElement("div", "model-card-topline");
    topline.append(createElement("span", "model-domain", model.domain));
    const status = createElement(
      "span",
      `model-status model-status-${normalize(model.status).replace(/\s+/g, "-")}`,
      model.status,
    );
    status.prepend(createIcon(model.status === "Available" ? "badge-check" : "map"));
    topline.append(status);
    card.append(topline);

    const id = createElement("p", "case-label", `${model.id} · ${model.priority}`);
    card.append(id);
    card.append(createElement("h3", "", model.title));

    const decision = createElement("p", "model-decision", model.decision);
    decision.prepend(createElement("strong", "", "Decision: "));
    card.append(decision);
    card.append(createElement("p", "model-description", model.description));

    const metadata = createElement("dl", "model-card-metadata");
    [
      ["Level", model.level],
      ["Horizon", model.horizon],
      ["Setup", model.setup],
      ["Status", model.status === "Available" ? `${model.version} · ${model.lastTested}` : "Scope mapped"],
    ].forEach(([label, value]) => {
      const item = createElement("div");
      item.append(createElement("dt", "", label), createElement("dd", "", value));
      metadata.append(item);
    });
    card.append(metadata);

    const audience = createElement("div", "model-card-audience");
    const familyTags = createElement("div", "model-chip-row");
    appendTags(familyTags, getModelRoleFamilies(model).map((family) => family.label), "model-family-chip");
    const roleTags = createElement("div", "model-chip-row");
    appendTags(roleTags, (model.roles || []).slice(0, 4));
    audience.append(
      createElement("p", "model-audience-label", "Career families"),
      familyTags,
      createElement("p", "model-audience-label", "Role titles"),
      roleTags,
    );
    card.append(audience);

    if (model.status === "Available" && model.file) {
      const trust = createElement("div", "model-trust-row");
      [
        model.qa,
        model.file.macros ? "Macros disclosed" : "Macro-free",
        model.file.externalLinks ? "External links disclosed" : "No external links",
      ].forEach((item) => {
        const signal = createElement("span", "", item);
        signal.prepend(createIcon("check"));
        trust.append(signal);
      });
      card.append(trust);

      const actions = createElement("div", "product-actions model-card-actions");
      const guide = createElement("a", "button quiet", "View model guide");
      guide.href = `${model.slug}/`;
      guide.prepend(createIcon("book-open"));
      guide.dataset.trackEvent = "model guide opened";
      guide.dataset.trackLabel = model.id;
      guide.dataset.trackLocation = "model library card";

      const download = createElement("a", "button primary", "Download .xlsx");
      download.href = model.file.path;
      download.download = `tdat-${model.slug}.xlsx`;
      download.prepend(createIcon("download"));
      download.dataset.trackEvent = "model downloaded";
      download.dataset.trackLabel = model.id;
      download.dataset.trackLocation = "model library card";
      actions.append(guide, download);
      card.append(actions);

      const fileNote = createElement(
        "p",
        "model-file-note",
        `${model.file.format} · ${model.file.size} · ${model.compatibility} · Synthetic template`,
      );
      card.append(fileNote);
    } else {
      const roadmap = createElement("div", "model-roadmap-note");
      roadmap.append(createIcon("construction"));
      roadmap.append(
        createElement(
          "p",
          "",
          "Roadmap scope only. No download is shown until the workbook, documentation, privacy review, and published checks pass the release gate.",
        ),
      );
      card.append(roadmap);
    }

    return card;
  }

  const fragment = document.createDocumentFragment();
  const cardEntries = sortedModels.map((model) => {
    const card = createModelCard(model);
    fragment.append(card);
    return { model, card };
  });
  results.append(fragment);

  const domains = [...new Set(models.map((model) => model.domain))].sort();
  const roles = [...new Set(models.flatMap((model) => model.roles || []))].sort();
  const availableRoles = new Set(roles);
  const groupedRoles = new Set();

  roleFamilies.forEach((family) => {
    const familyRoles = family.roles.filter((role) => availableRoles.has(role)).sort();
    if (familyRoles.length === 0) return;

    const group = createElement("optgroup");
    group.label = family.label;

    const familyOption = createElement("option", "", `All ${family.label}`);
    familyOption.value = `family:${family.id}`;
    group.append(familyOption);

    familyRoles.forEach((role) => {
      const option = createElement("option", "", role);
      option.value = role;
      group.append(option);
      groupedRoles.add(role);
    });
    roleFilter.append(group);
  });

  const ungroupedRoles = roles.filter((role) => !groupedRoles.has(role));
  if (ungroupedRoles.length > 0) {
    const group = createElement("optgroup");
    group.label = "Other finance roles";
    ungroupedRoles.forEach((role) => {
      const option = createElement("option", "", role);
      option.value = role;
      group.append(option);
    });
    roleFilter.append(group);
  }

  ["All", ...domains].forEach((domain) => {
    const button = createElement("button", "model-filter-chip", domain);
    button.type = "button";
    button.dataset.domain = domain;
    button.setAttribute("aria-pressed", String(domain === "All"));
    button.addEventListener("click", () => {
      state.domain = domain;
      domainFilters.querySelectorAll("button").forEach((item) => {
        item.setAttribute("aria-pressed", String(item.dataset.domain === domain));
      });
      applyFilters();
    });
    domainFilters.append(button);
  });

  function matches(model) {
    const queryMatch = !state.query || model.__search.includes(state.query);
    const domainMatch = state.domain === "All" || model.domain === state.domain;
    let roleMatch = state.role === "All";
    if (state.role.startsWith("family:")) {
      const familyId = state.role.slice("family:".length);
      const family = roleFamilies.find((item) => item.id === familyId);
      roleMatch = Boolean(family && family.roles.some((role) => (model.roles || []).includes(role)));
    } else if (!roleMatch) {
      roleMatch = (model.roles || []).includes(state.role);
    }
    const levelMatch = state.level === "All" || model.level === state.level;
    const statusMatch = state.status === "All" || model.status === state.status;
    return queryMatch && domainMatch && roleMatch && levelMatch && statusMatch;
  }

  sortedModels.forEach((model) => {
    model.__search = normalize(
      [
        model.title,
        model.decision,
        model.description,
        model.domain,
        ...getModelRoleFamilies(model).map((family) => family.label),
        ...(model.roles || []),
        ...(model.useCases || []),
        ...(model.tags || []),
      ].join(" "),
    );
  });

  function applyFilters() {
    let visibleCount = 0;
    cardEntries.forEach(({ model, card }) => {
      const visible = matches(model);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    resultCount.textContent = `${visibleCount} of ${models.length} models shown`;
    empty.hidden = visibleCount !== 0;
  }

  search.addEventListener("input", () => {
    state.query = normalize(search.value);
    applyFilters();
  });

  roleFilter.addEventListener("change", () => {
    state.role = roleFilter.value;
    applyFilters();
  });

  levelFilter.addEventListener("change", () => {
    state.level = levelFilter.value;
    applyFilters();
  });

  statusFilter.addEventListener("change", () => {
    state.status = statusFilter.value;
    applyFilters();
  });

  resetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.query = "";
      state.domain = "All";
      state.role = "All";
      state.level = "All";
      state.status = "All";
      search.value = "";
      roleFilter.value = "All";
      levelFilter.value = "All";
      statusFilter.value = "All";
      domainFilters.querySelectorAll("button").forEach((item) => {
        item.setAttribute("aria-pressed", String(item.dataset.domain === "All"));
      });
      applyFilters();
      search.focus();
    });
  });

  applyFilters();
  if (window.lucide) window.lucide.createIcons();
})();
