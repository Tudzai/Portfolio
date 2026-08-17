(() => {
  const dialog = document.querySelector("[data-model-lightbox]");
  if (typeof HTMLDialogElement === "undefined" || !(dialog instanceof HTMLDialogElement) || typeof dialog.showModal !== "function") return;

  const triggers = [...document.querySelectorAll("[data-model-preview]")];
  const galleryTriggers = [...document.querySelectorAll(".model-cinema-gallery-trigger")];
  const closeButton = dialog.querySelector("[data-model-lightbox-close]");
  const zoomButton = dialog.querySelector("[data-model-lightbox-zoom]");
  const canvas = dialog.querySelector("[data-model-lightbox-canvas]");
  const image = dialog.querySelector("[data-model-lightbox-image]");
  const title = dialog.querySelector("[data-model-lightbox-title]");
  const caption = dialog.querySelector("[data-model-lightbox-caption]");
  const count = dialog.querySelector("[data-model-lightbox-count]");

  if (!triggers.length || !galleryTriggers.length || !closeButton || !zoomButton || !canvas || !image || !title || !caption || !count) return;

  const sheets = galleryTriggers.map((trigger) => ({
    src: trigger.dataset.modelPreviewSrc,
    label: trigger.dataset.modelPreviewLabel,
    alt: trigger.querySelector("img")?.alt || `${trigger.dataset.modelPreviewLabel} sheet`,
    summary: trigger.querySelector("small")?.textContent?.trim() || "Workbook sheet",
  }));

  let returnFocus = null;
  let backdropPointerDown = false;

  const setDetailMode = (enabled) => {
    dialog.classList.toggle("is-detail", enabled);
    zoomButton.setAttribute("aria-pressed", String(enabled));
    zoomButton.textContent = enabled ? "Fit width" : "Read detail";
    canvas.scrollTop = 0;
    canvas.scrollLeft = 0;
  };

  const renderSheet = (rawIndex) => {
    const index = Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex < sheets.length ? rawIndex : 0;
    const sheet = sheets[index];
    image.src = sheet.src;
    image.alt = sheet.alt;
    title.textContent = `${sheet.label} sheet`;
    caption.textContent = `${sheet.label} · ${sheet.summary}`;
    count.textContent = `Sheet ${index + 1} of ${sheets.length}`;
    setDetailMode(false);
  };

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  for (const trigger of triggers) {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      returnFocus = trigger;
      renderSheet(Number.parseInt(trigger.dataset.modelPreviewIndex || "0", 10));
      document.body.classList.add("model-lightbox-open");
      dialog.showModal();
      closeButton.focus({ preventScroll: true });
    });
  }

  closeButton.addEventListener("click", closeDialog);
  zoomButton.addEventListener("click", () => setDetailMode(!dialog.classList.contains("is-detail")));

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDialog();
  });

  dialog.addEventListener("pointerdown", (event) => {
    backdropPointerDown = event.target === dialog;
  });

  dialog.addEventListener("pointerup", (event) => {
    if (backdropPointerDown && event.target === dialog) closeDialog();
    backdropPointerDown = false;
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("model-lightbox-open");
    setDetailMode(false);
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  });
})();
