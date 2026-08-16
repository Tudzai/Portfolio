(() => {
  "use strict";

  const frame = document.querySelector("[data-cv-pdf-viewer]");
  if (!(frame instanceof HTMLIFrameElement)) return;

  const viewerVersion = "6.1.200";
  const documentId = frame.dataset.cvDocumentId || "cv";
  const documentVersion = frame.dataset.cvDocumentVersion || "unknown";
  const ctaLocation = frame.dataset.cvCtaLocation || "cv-pdf-viewer-section";
  const loadStartedAt = performance.now();
  const pageViewDelayMs = 1000;
  const dwellThresholds = [5, 15, 30];
  const progressMilestones = [25, 50, 75, 90, 100];

  let application = null;
  let setupPromise = null;
  let documentLoaded = false;
  let viewerVisible = false;
  let currentPage = 1;
  let totalPages = 0;
  let pageViewTimer = 0;
  let viewSequence = 0;
  let firstInteraction = true;
  let pendingNavigation = null;
  let pendingZoom = null;
  let queuedZoomCapture = null;
  let zoomTimer = 0;
  let lastScale = null;
  let zoomEventCount = 0;
  let scrollFrame = 0;
  let lastDwellTick = performance.now();

  const viewedPages = new Set();
  const pageDwellMilliseconds = new Map();
  const pageDwellMilestones = new Map();
  const reachedProgressMilestones = new Set();
  const capturedErrors = new Set();

  function capture(eventName, properties = {}) {
    if (!window.portfolioAnalytics || typeof window.portfolioAnalytics.capture !== "function") return;
    window.portfolioAnalytics.capture(eventName, {
      viewer_type: "pdfjs",
      viewer_version: viewerVersion,
      document_id: documentId,
      document_version: documentVersion,
      cta_location: ctaLocation,
      ...properties,
    });
  }

  function captureInteraction(cvAction, properties = {}) {
    capture("portfolio_cv_interaction", {
      cv_action: cvAction,
      page_index: currentPage,
      page_total: totalPages || null,
      is_first_interaction: firstInteraction,
      ...properties,
    });
    firstInteraction = false;
  }

  function normalizePage(value) {
    const page = Number.parseInt(value, 10);
    if (!Number.isFinite(page) || page < 1) return 1;
    if (totalPages > 0) return Math.min(page, totalPages);
    return page;
  }

  function zoomBucket(scale) {
    const percent = Number(scale) * 100;
    if (!Number.isFinite(percent) || percent <= 0) return null;
    return Math.max(10, Math.min(800, Math.round(percent / 10) * 10));
  }

  function classifyDocumentError(event) {
    const value = `${event?.message || ""} ${event?.reason || ""}`.toLowerCase();
    if (value.includes("missing") || value.includes("404")) return "missing_pdf";
    if (value.includes("invalid") || value.includes("corrupt")) return "invalid_pdf";
    if (value.includes("password")) return "password_required";
    if (value.includes("response") || value.includes("network") || value.includes("fetch")) return "network_error";
    return "pdf_load_failed";
  }

  function captureError(errorStage, errorCode, recoverable = true) {
    const key = `${errorStage}:${errorCode}`;
    if (capturedErrors.has(key)) return;
    capturedErrors.add(key);
    capture("portfolio_cv_document_error", {
      error_stage: errorStage,
      error_code: errorCode,
      page_index: documentLoaded ? currentPage : null,
      page_total: totalPages || null,
      is_recoverable: recoverable,
      load_duration_ms: Math.round(performance.now() - loadStartedAt),
    });
  }

  function clearPageViewTimer() {
    if (!pageViewTimer) return;
    window.clearTimeout(pageViewTimer);
    pageViewTimer = 0;
  }

  function queuePageViewed(pageNumber = currentPage) {
    clearPageViewTimer();
    const page = normalizePage(pageNumber);
    if (!documentLoaded || !viewerVisible || document.visibilityState !== "visible" || viewedPages.has(page)) return;

    pageViewTimer = window.setTimeout(() => {
      pageViewTimer = 0;
      if (!documentLoaded || !viewerVisible || document.visibilityState !== "visible") return;
      if (currentPage !== page || viewedPages.has(page)) return;

      viewedPages.add(page);
      viewSequence += 1;
      capture("portfolio_cv_page_viewed", {
        page_index: page,
        page_total: totalPages,
        visible_ratio_threshold: 0.5,
        view_sequence: viewSequence,
        is_initial_page: viewSequence === 1 && page === 1,
      });
    }, pageViewDelayMs);
  }

  function handleViewerVisibility(entries) {
    const entry = entries[0];
    viewerVisible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5);
    if (viewerVisible) {
      queuePageViewed();
      scheduleScrollProgressCapture();
    } else {
      clearPageViewTimer();
    }
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(handleViewerVisibility, { threshold: [0, 0.5, 1] }).observe(frame);
  } else {
    viewerVisible = true;
  }

  document.addEventListener("visibilitychange", () => {
    lastDwellTick = performance.now();
    if (document.visibilityState === "visible") {
      queuePageViewed();
      scheduleScrollProgressCapture();
    }
    else clearPageViewTimer();
  });

  function handleDocumentLoaded() {
    if (documentLoaded || !application) return;
    documentLoaded = true;
    totalPages = Number(application.pagesCount || application.pdfDocument?.numPages || 0);
    currentPage = normalizePage(application.page || application.pdfViewer?.currentPageNumber || 1);
    lastScale = Number(application.pdfViewer?.currentScale) || null;

    capture("portfolio_cv_document_loaded", {
      page_total: totalPages,
      initial_page_index: currentPage,
      load_duration_ms: Math.round(performance.now() - loadStartedAt),
    });
    queuePageViewed();
    scheduleScrollProgressCapture();
  }

  function handlePageChanging(event) {
    const previousPage = normalizePage(event?.previous || currentPage);
    const nextPage = normalizePage(event?.pageNumber || currentPage);
    currentPage = nextPage;

    const pending = pendingNavigation;
    pendingNavigation = null;
    if (pending && Date.now() - pending.at <= 1500 && previousPage !== nextPage) {
      captureInteraction("pdf_page_navigated", {
        navigation_method: pending.method,
        navigation_direction: nextPage > previousPage ? "forward" : "backward",
        from_page_index: previousPage,
        to_page_index: nextPage,
      });
    }
    queuePageViewed(nextPage);
  }

  function handleScaleChanging(event) {
    const nextScale = Number(event?.scale);
    if (!Number.isFinite(nextScale) || nextScale <= 0) return;

    const previousScale = lastScale;
    lastScale = nextScale;
    if (!documentLoaded || !Number.isFinite(previousScale) || Math.abs(previousScale - nextScale) < 0.001) return;

    const pending = pendingZoom && Date.now() - pendingZoom.at <= 1500 ? pendingZoom : null;
    pendingZoom = null;
    if (!pending) return;
    if (!queuedZoomCapture) {
      queuedZoomCapture = {
        from: previousScale,
        method: pending.method,
      };
    }
    queuedZoomCapture.to = nextScale;

    window.clearTimeout(zoomTimer);
    zoomTimer = window.setTimeout(() => {
      const captureState = queuedZoomCapture;
      queuedZoomCapture = null;
      if (!captureState || zoomEventCount >= 10) return;
      const fromBucket = zoomBucket(captureState.from);
      const toBucket = zoomBucket(captureState.to);
      if (fromBucket === null || toBucket === null || fromBucket === toBucket) return;
      zoomEventCount += 1;
      captureInteraction("pdf_zoom_changed", {
        zoom_action: captureState.method,
        zoom_from_bucket: fromBucket,
        zoom_to_bucket: toBucket,
      });
      scheduleScrollProgressCapture();
    }, 750);
  }

  function handlePresentationMode(event) {
    if (event?.state === 3) captureInteraction("pdf_fullscreen_entered");
    if (event?.state === 1) captureInteraction("pdf_fullscreen_exited");
  }

  function updateScrollProgress() {
    scrollFrame = 0;
    if (!documentLoaded || !application || !viewerVisible || document.visibilityState !== "visible") return;
    const container = application.appConfig?.mainContainer || frame.contentDocument?.getElementById("viewerContainer");
    if (!(container instanceof frame.contentWindow.HTMLElement)) return;

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const progress = scrollHeight <= clientHeight
      ? 100
      : Math.min(100, Math.max(0, ((container.scrollTop + clientHeight) / scrollHeight) * 100));

    progressMilestones.forEach((milestone) => {
      if (progress < milestone || reachedProgressMilestones.has(milestone)) return;
      reachedProgressMilestones.add(milestone);
      capture("portfolio_cv_progress_reached", {
        progress_percent: milestone,
        progress_basis: "document_scroll",
        page_index: currentPage,
        page_total: totalPages,
      });
    });
  }

  function scheduleScrollProgressCapture() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollProgress);
  }

  function rememberNavigation(method) {
    pendingNavigation = { method, at: Date.now() };
  }

  function rememberZoom(method) {
    pendingZoom = { method, at: Date.now() };
  }

  function setupViewerDocument(frameDocument) {
    const frameWindow = frame.contentWindow;
    const navigationControls = {
      previous: "previous_button",
      next: "next_button",
      firstPage: "first_page_button",
      lastPage: "last_page_button",
    };
    const zoomControls = {
      zoomInButton: "zoom_in",
      zoomOutButton: "zoom_out",
    };

    frameDocument.addEventListener(
      "click",
      (event) => {
        if (!event.isTrusted) return;
        const target = event.target instanceof frameWindow.Element ? event.target : null;
        if (!target) return;
        const annotationLink = target.closest(".annotationLayer a[href]");
        if (annotationLink) {
          let linkType = "external";
          let destinationHost = null;
          try {
            const destination = new URL(annotationLink.getAttribute("href"), frameWindow.location.href);
            destinationHost = destination.hostname || null;
            if (destination.protocol === "mailto:") linkType = "email";
            else if (destination.protocol === "tel:") linkType = "phone";
            else if (destinationHost?.includes("linkedin.com")) linkType = "linkedin";
            else if (destinationHost?.includes("github.com")) linkType = "github";
            else if (destination.origin === frameWindow.location.origin) linkType = "portfolio";
          } catch {
            linkType = "unknown";
          }
          captureInteraction("link_clicked", {
            link_type: linkType,
            destination_host: destinationHost,
            opens_new_tab: annotationLink.target === "_blank",
          });
        }
        const control = target.closest("button, a, .thumbnail");
        if (!control) return;
        const controlId = control.id || "";
        if (navigationControls[controlId]) rememberNavigation(navigationControls[controlId]);
        else if (control.classList.contains("thumbnail")) rememberNavigation("thumbnail");
        if (zoomControls[controlId]) rememberZoom(zoomControls[controlId]);
      },
      true,
    );

    frameDocument.addEventListener(
      "change",
      (event) => {
        if (!event.isTrusted) return;
        const control = event.target instanceof frameWindow.Element ? event.target : null;
        if (control?.id === "pageNumber") rememberNavigation("page_input");
        if (control?.id === "scaleSelect") rememberZoom("zoom_select");
      },
      true,
    );

    frameDocument.addEventListener(
      "keydown",
      (event) => {
        if (!event.isTrusted) return;
        if (event.target?.id === "pageNumber" && event.key === "Enter") rememberNavigation("page_input");
        else if (["PageUp", "PageDown", "Home", "End", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          rememberNavigation("keyboard");
        }
        if ((event.ctrlKey || event.metaKey) && ["+", "=", "-", "0"].includes(event.key)) rememberZoom("keyboard");
      },
      true,
    );

    frameDocument.addEventListener(
      "wheel",
      (event) => {
        if (event.isTrusted && (event.ctrlKey || event.metaKey)) rememberZoom("gesture");
      },
      { capture: true, passive: true },
    );

    frameDocument.addEventListener(
      "touchstart",
      (event) => {
        if (event.isTrusted && event.touches.length >= 2) rememberZoom("gesture");
      },
      { capture: true, passive: true },
    );

    ["dragover", "drop"].forEach((eventName) => {
      frameDocument.addEventListener(
        eventName,
        (event) => {
          if (!Array.from(event.dataTransfer?.types || []).includes("Files")) return;
          event.preventDefault();
          event.stopImmediatePropagation();
        },
        true,
      );
    });

    const viewerContainer = frameDocument.getElementById("viewerContainer");
    viewerContainer?.addEventListener("scroll", scheduleScrollProgressCapture, { passive: true });

  }

  async function waitForApplication(frameWindow, timeoutMs = 20000) {
    const startedAt = performance.now();
    while (!frameWindow.PDFViewerApplication) {
      if (performance.now() - startedAt >= timeoutMs) throw new Error("viewer_application_timeout");
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
    return frameWindow.PDFViewerApplication;
  }

  async function initializeTracking() {
    if (setupPromise) return setupPromise;
    setupPromise = (async () => {
      try {
        const frameWindow = frame.contentWindow;
        if (!frameWindow) throw new Error("viewer_window_unavailable");
        application = await waitForApplication(frameWindow);
        await application.initializedPromise;
        application.viewsManager?.switchView(1, true);

        const eventBus = application.eventBus;
        eventBus.on("documentloaded", handleDocumentLoaded);
        eventBus.on("documenterror", (event) => captureError("document_load", classifyDocumentError(event)));
        eventBus.on("pagechanging", handlePageChanging);
        eventBus.on("scalechanging", handleScaleChanging);
        eventBus.on("pagesloaded", scheduleScrollProgressCapture);
        eventBus.on("pagerendered", scheduleScrollProgressCapture);
        eventBus.on("presentationmodechanged", handlePresentationMode);
        eventBus.on("download", () => captureInteraction("download_pdf_clicked"));
        eventBus.on("print", () => captureInteraction("print_pdf_clicked"));

        setupViewerDocument(frame.contentDocument);
        if (application.pdfDocument) handleDocumentLoaded();
      } catch (error) {
        const errorCode = error instanceof Error && error.message === "viewer_application_timeout"
          ? "viewer_application_timeout"
          : "viewer_initialization_failed";
        captureError("viewer_initialization", errorCode, true);
      }
    })();
    return setupPromise;
  }

  window.setInterval(() => {
    const now = performance.now();
    const elapsed = Math.min(1500, Math.max(0, now - lastDwellTick));
    lastDwellTick = now;
    if (!documentLoaded || !viewerVisible || document.visibilityState !== "visible") return;

    const page = currentPage;
    const total = (pageDwellMilliseconds.get(page) || 0) + elapsed;
    pageDwellMilliseconds.set(page, total);
    const captured = pageDwellMilestones.get(page) || new Set();
    dwellThresholds.forEach((threshold) => {
      if (total < threshold * 1000 || captured.has(threshold)) return;
      captured.add(threshold);
      capture("portfolio_cv_page_dwell_reached", {
        page_index: page,
        page_total: totalPages,
        seconds_threshold: threshold,
      });
    });
    pageDwellMilestones.set(page, captured);
  }, 1000);

  frame.addEventListener("load", initializeTracking);
  frame.addEventListener("error", () => captureError("viewer_frame", "viewer_frame_load_failed", true));
  initializeTracking();

  window.portfolioCvPdfTracking = Object.freeze({
    getState: () => ({
      initialized: Boolean(application),
      document_loaded: documentLoaded,
      viewer_visible: viewerVisible,
      current_page: currentPage,
      page_total: totalPages,
      pages_viewed: Array.from(viewedPages).sort((a, b) => a - b),
      progress_reached: Array.from(reachedProgressMilestones).sort((a, b) => a - b),
    }),
  });
})();
