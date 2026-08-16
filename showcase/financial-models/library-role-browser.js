(function () {
  "use strict";

  const browser = document.querySelector("[data-role-browser]");
  if (!browser) return;

  const tabs = Array.from(browser.querySelectorAll("[data-role-tab]"));
  const panels = Array.from(browser.querySelectorAll("[data-role-panel]"));
  if (!tabs.length || !panels.length) return;

  const allModelsGrid = browser.querySelector("[data-all-models-grid]");
  const allModelsSearch = browser.querySelector("[data-all-model-search]");
  const allModelsCount = browser.querySelector("[data-all-model-count]");
  const allModelsEmpty = browser.querySelector("[data-all-model-empty]");
  const sourceCards = Array.from(browser.querySelectorAll("[data-role-panel]:not(#panel-all) .simple-library-card"));

  if (allModelsGrid) {
    sourceCards.forEach((card) => allModelsGrid.append(card.cloneNode(true)));
  }

  function filterAllModels() {
    if (!allModelsGrid || !allModelsSearch) return;
    const query = allModelsSearch.value.trim().toLowerCase();
    const cards = Array.from(allModelsGrid.querySelectorAll(".simple-library-card"));
    let visible = 0;

    cards.forEach((card) => {
      const matches = !query || card.textContent.toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    });

    if (allModelsCount) allModelsCount.textContent = `${visible} ${visible === 1 ? "model" : "models"}`;
    if (allModelsEmpty) allModelsEmpty.hidden = visible !== 0;
  }

  function activate(panelId, moveFocus) {
    const nextTab = tabs.find((tab) => tab.dataset.roleTab === panelId) || tabs[0];
    const nextPanelId = nextTab.dataset.roleTab;

    tabs.forEach((tab) => {
      const selected = tab === nextTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== nextPanelId;
    });

    if (moveFocus) nextTab.focus();
  }

  browser.classList.add("has-role-tabs");
  activate("panel-all", false);
  allModelsSearch?.addEventListener("input", filterAllModels);

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.roleTab, false));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;

      event.preventDefault();
      activate(tabs[nextIndex].dataset.roleTab, true);
    });
  });
})();
