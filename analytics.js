(() => {
  "use strict";

  const posthogProjectKey = "phc_khcQc7asdJTMzQQBk7dWTVdbgiT4NFDz5dkLT6GCBqnA";
  const posthogApiHost = "https://us.i.posthog.com";
  const posthogUiHost = "https://us.posthog.com";
  const trackedHosts = new Set(["tudzai.github.io"]);
  const schemaVersion = "2026-07-14.3";
  const analyticsPreferenceKey = "portfolio-analytics-preference";
  const analyticsControlParameter = "portfolio_analytics";
  const bridgeMessageType = "portfolio-analytics-bridge-v1";
  const scrollMilestones = [25, 50, 75, 90, 100];
  const activeTimeMilestones = [10, 30, 60, 120];
  const fileExtensions = new Set([
    "csv",
    "doc",
    "docx",
    "json",
    "pdf",
    "ppt",
    "pptx",
    "txt",
    "xls",
    "xlsm",
    "xlsx",
    "zip",
  ]);

  if (!trackedHosts.has(window.location.hostname)) return;
  if (window.__portfolioAnalyticsLoaded) return;

  function readAnalyticsPreference() {
    try {
      return window.localStorage.getItem(analyticsPreferenceKey);
    } catch {
      return null;
    }
  }

  function applyAnalyticsControlParameter() {
    let requestedPreference = null;
    try {
      requestedPreference = new URLSearchParams(window.location.search).get(analyticsControlParameter);
    } catch {
      return readAnalyticsPreference();
    }

    try {
      if (requestedPreference === "off" || requestedPreference === "internal") {
        window.localStorage.setItem(analyticsPreferenceKey, requestedPreference);
      } else if (requestedPreference === "on" || requestedPreference === "external") {
        window.localStorage.removeItem(analyticsPreferenceKey);
      }
    } catch {
      return requestedPreference === "internal" ? "internal" : null;
    }

    return readAnalyticsPreference();
  }

  function hasPrivacySignal() {
    const doNotTrackValues = [
      window.navigator.doNotTrack,
      window.doNotTrack,
      window.navigator.msDoNotTrack,
    ];
    return window.navigator.globalPrivacyControl === true || doNotTrackValues.some((value) => value === "1" || value === "yes");
  }

  const analyticsPreference = applyAnalyticsControlParameter();
  if (analyticsPreference === "off" || hasPrivacySignal()) return;

  window.__portfolioAnalyticsLoaded = true;

  function isEmbeddedFrame() {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  function shouldBridgeToParent() {
    if (!isEmbeddedFrame()) return false;
    try {
      return window.parent.location.origin !== window.location.origin;
    } catch {
      return true;
    }
  }

  function safeUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") return parsed.protocol;
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return parsed.protocol;
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return null;
    }
  }

  function safeHostname(url) {
    if (!url) return null;
    try {
      return new URL(url, window.location.href).hostname || null;
    } catch {
      return null;
    }
  }

  function redactSensitiveText(value, maxLength = 300) {
    if (typeof value !== "string") return value;
    return value
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/https?:\/\/[^\s<>"'\])}]+/gi, (url) => safeUrl(url) || "[url redacted]")
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email redacted]")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function redactReplayText(value) {
    if (typeof value !== "string") return value;
    return value.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email redacted]");
  }

  function safeSlug(value) {
    const slug = String(value || "").toLowerCase();
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
  }

  function safeCampaignValue(value) {
    const campaignValue = String(value || "").trim().toLowerCase();
    return /^(?=.*[a-z])[a-z0-9][a-z0-9._~-]{0,63}$/.test(campaignValue) ? campaignValue : null;
  }

  function getPageContext(pathname = window.location.pathname) {
    let relativePath = pathname.replace(/^\/Portfolio(?:\/|$)/, "/").replace(/\/{2,}/g, "/");
    const trimmedPath = relativePath.replace(/^\/|\/$/g, "");
    const parts = trimmedPath ? trimmedPath.split("/") : [];
    const fileName = parts[parts.length - 1] || "";
    const embedded = isEmbeddedFrame();
    let pageType = "portfolio";
    let contentGroup = "system";
    let contentSlug = null;
    let artifactType = null;

    if (parts.length === 0 || (parts.length === 1 && parts[0] === "index.html")) {
      pageType = "home";
      contentGroup = "home";
      contentSlug = "home";
    } else if (fileName === "cv.html") {
      pageType = "cv";
      contentGroup = "cv";
      contentSlug = "cv";
      artifactType = "pdf_viewer";
    } else if (fileName === "share.html") {
      pageType = "share_redirect";
      contentGroup = "system";
      contentSlug = "share";
    } else if (fileName === "404.html" || document.title.toLowerCase().startsWith("redirecting")) {
      pageType = "404";
      contentGroup = "system";
      contentSlug = "404";
    } else if (parts[0] === "blog") {
      contentGroup = "blog";
      if (parts.length === 1 || (parts.length === 2 && fileName === "index.html")) {
        pageType = "hub";
        contentSlug = "blog";
      } else {
        contentSlug = safeSlug(parts[1]);
        if (parts[2] === "deck" || parts[2] === "deck.html") {
          pageType = "deck";
          artifactType = "interactive_deck";
        } else {
          pageType = "article";
        }
      }
    } else if (parts[0] === "showcase" && parts[1]) {
      contentGroup = parts[1].replace(/-/g, "_");
      const isHub = parts.length === 2 || (parts.length === 3 && fileName === "index.html");
      if (isHub) {
        pageType = "hub";
        contentSlug = parts[1];
      } else if (parts[1] === "powerbi" && fileName === "project-preview.html") {
        pageType = "preview";
        artifactType = "interactive_preview";
        try {
          contentSlug = safeSlug(new URLSearchParams(window.location.search).get("project")) || "project-preview";
        } catch {
          contentSlug = "project-preview";
        }
      } else {
        contentSlug = safeSlug(parts[2]);
        if (fileName === "preview.html" || embedded) {
          pageType = "preview";
          artifactType = "interactive_preview";
        } else if (fileName === "model.html") {
          pageType = "model";
          artifactType = "finance_model";
        } else if (parts[1] === "financial-models") {
          pageType = "model";
          artifactType = "finance_model";
        } else {
          pageType = parts[1] === "powerbi" ? "project" : "case";
        }
      }
    }

    return {
      page_type: pageType,
      content_group: contentGroup,
      content_slug: contentSlug,
      artifact_type: artifactType,
      frame_context: embedded ? "embedded" : "top_level",
      is_embedded_frame: embedded,
    };
  }

  function getMarketingAttribution() {
    const attribution = {};
    try {
      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign"].forEach((key) => {
        const value = safeCampaignValue(params.get(key));
        if (value) attribution[key] = value;
      });
    } catch {
      return attribution;
    }
    return attribution;
  }

  function buildEntryContext() {
    return {
      entry_path: window.location.pathname,
      entry_referrer_host: safeHostname(document.referrer),
      ...getMarketingAttribution(),
    };
  }

  function getEntryContext() {
    const storageKey = "portfolio-entry-context-v1";
    try {
      const existing = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
      if (existing && typeof existing === "object" && typeof existing.entry_path === "string") return existing;
      const created = buildEntryContext();
      window.sessionStorage.setItem(storageKey, JSON.stringify(created));
      return created;
    } catch {
      return buildEntryContext();
    }
  }

  const entryContext = getEntryContext();
  const likelyBot = Boolean(window.navigator.webdriver) || /(?:bot|crawler|spider|headless|lighthouse)/i.test(window.navigator.userAgent || "");
  const bridgeOnly = shouldBridgeToParent();

  function getCommonProperties() {
    return {
      schema_version: schemaVersion,
      environment: "production",
      page_path: window.location.pathname,
      page_url: safeUrl(window.location.href),
      ...getPageContext(),
      ...entryContext,
      is_internal_or_test: analyticsPreference === "internal",
      is_likely_bot: likelyBot,
    };
  }

  function sanitizeCustomProperties(properties = {}) {
    const sanitized = {};
    Object.entries(properties).forEach(([key, value]) => {
      if (!/^[A-Za-z0-9_$.-]{1,80}$/.test(key)) return;
      const lowerKey = key.toLowerCase();
      if (/(?:email|phone|telephone|copied_text|search_query|input_value)$/.test(lowerKey)) return;

      if (typeof value === "string") {
        if (/(?:url|referrer|destination|href|resource_src)$/.test(lowerKey)) {
          sanitized[key] = safeUrl(value);
        } else {
          sanitized[key] = redactSensitiveText(value);
        }
      } else if (typeof value === "number") {
        sanitized[key] = Number.isFinite(value) ? value : null;
      } else if (typeof value === "boolean" || value === null) {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value
          .slice(0, 20)
          .map((item) => (typeof item === "string" ? redactSensitiveText(item, 120) : item))
          .filter((item) => ["string", "number", "boolean"].includes(typeof item));
      }
    });
    return sanitized;
  }

  function sanitizePostHogPropertyTree(value, key = "", depth = 0) {
    if (depth > 8) return null;
    if (typeof value === "string") {
      if (/(?:url|referrer|href|destination|resource_src)/i.test(key)) return safeUrl(value);
      return redactSensitiveText(value, 1000);
    }
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "boolean" || value === null) return value;
    if (Array.isArray(value)) {
      return value.map((item) => sanitizePostHogPropertyTree(item, key, depth + 1));
    }
    if (!value || typeof value !== "object") return null;

    const sanitized = {};
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      const normalizedNestedKey = nestedKey.replace(/^\$/, "");
      if (/(?:email|phone|telephone|copied_text|search_query|input_value)$/i.test(nestedKey)) return;
      if (/(?:gclid|dclid|fbclid|msclkid|ttclid|twclid|li_fat_id)$/i.test(nestedKey)) return;
      if (/(?:^|_)utm_(?:content|term|id|source_platform|creative_format|marketing_tactic)$/i.test(normalizedNestedKey)) return;
      if (/(?:^|_)utm_(?:source|medium|campaign)$/i.test(normalizedNestedKey)) {
        sanitized[nestedKey] = safeCampaignValue(nestedValue);
        return;
      }
      sanitized[nestedKey] = sanitizePostHogPropertyTree(nestedValue, nestedKey, depth + 1);
    });
    return sanitized;
  }

  function getTrustedEventContext(properties) {
    const commonProperties = getCommonProperties();
    const embeddedPath =
      properties?.frame_context === "embedded" && typeof properties.embedded_page_path === "string"
        ? properties.embedded_page_path
        : null;
    if (!embeddedPath || !(embeddedPath === "/Portfolio" || embeddedPath.startsWith("/Portfolio/"))) {
      return commonProperties;
    }

    return {
      ...commonProperties,
      ...getPageContext(embeddedPath),
      page_path: embeddedPath,
      page_url: safeUrl(embeddedPath),
      frame_context: "embedded",
      is_embedded_frame: true,
    };
  }

  function beforeSendPostHogEvent(event) {
    if (!event || typeof event !== "object") return event;
    if (typeof event.event === "string" && event.event.startsWith("$")) {
      const sdkProperties = event.properties && typeof event.properties === "object" ? event.properties : null;
      if (sdkProperties) {
        ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer"].forEach((key) => {
          const value = sdkProperties[key];
          if (typeof value === "string" && /^(?:https?:)?\/\//i.test(value)) {
            sdkProperties[key] = safeUrl(value);
          }
        });
      }
      return event;
    }
    const rawProperties = event.properties && typeof event.properties === "object" ? event.properties : {};
    const properties = sanitizePostHogPropertyTree(rawProperties);
    event.properties = {
      ...properties,
      ...getTrustedEventContext(properties),
    };
    return event;
  }

  function redactRecordedRequest(request) {
    if (!request || typeof request !== "object") return request;
    if (typeof request.name === "string") request.name = safeUrl(request.name) || request.name.split(/[?#]/)[0];
    return request;
  }

  function forceCvSessionRecording() {
    if (bridgeOnly || analyticsPreference === "internal") return;
    if (!window.posthog || typeof window.posthog.startSessionRecording !== "function") return;
    window.posthog.startSessionRecording({
      sampling: true,
      linked_flag: true,
      url_trigger: true,
      event_trigger: true,
    });
  }

  if (!bridgeOnly) {
    if (window.posthog?.__loaded || window.posthog?.__SV) return;

    !function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="xi Si init Ni ji pr qi Ui $i capture calculateEventProperties Zi register register_once register_for_session unregister unregister_for_session Yi getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Ki identify setPersonProperties unsetPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty Qi Wi createPersonProfile setInternalOrTestUser Ji Fi tn opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing zi debug mr it getPageViewId captureTraceFeedback captureTraceMetric Ri".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    window.posthog.init(posthogProjectKey, {
      api_host: posthogApiHost,
      ui_host: posthogUiHost,
      defaults: "2026-05-30",
      person_profiles: "identified_only",
      capture_pageview: !isEmbeddedFrame(),
      capture_pageleave: !isEmbeddedFrame(),
      autocapture: {
        dom_event_allowlist: ["click", "change", "submit"],
        element_allowlist: ["a", "button", "form", "input", "select", "textarea", "label"],
        css_selector_ignorelist: [
          ".ph-no-autocapture",
          "[data-ph-no-autocapture]",
          "[data-sensitive]",
          "a[href^='mailto:']",
          "a[href^='tel:']",
        ],
        element_attribute_ignorelist: ["value", "data-email", "data-phone", "data-sensitive"],
        capture_copied_text: false,
      },
      capture_dead_clicks: true,
      enable_heatmaps: true,
      capture_exceptions: true,
      disable_surveys: true,
      disable_session_recording: isEmbeddedFrame() || analyticsPreference === "internal",
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "*",
        maskTextFn: redactReplayText,
        maskCapturedNetworkRequestFn: redactRecordedRequest,
      },
      before_send: beforeSendPostHogEvent,
    });

    if (getPageContext().page_type === "cv") forceCvSessionRecording();
  }

  function capturePortfolioEvent(eventName, properties = {}) {
    if (typeof eventName !== "string" || !/^[A-Za-z0-9_][A-Za-z0-9_$ .-]{0,79}$/.test(eventName)) return;
    const sanitizedProperties = sanitizeCustomProperties(properties);

    if (bridgeOnly) {
      window.parent.postMessage(
        {
          type: bridgeMessageType,
          event_name: eventName,
          page_path: window.location.pathname,
          page_title: redactSensitiveText(document.title, 160),
          properties: sanitizedProperties,
        },
        "https://tudzai.github.io",
      );
      return;
    }

    if (!window.posthog || typeof window.posthog.capture !== "function") return;
    window.posthog.capture(eventName, sanitizedProperties);
  }

  window.portfolioAnalytics = Object.freeze({
    capture: capturePortfolioEvent,
    getPageContext,
    safeUrl,
    schemaVersion,
  });
  document.dispatchEvent(new CustomEvent("portfolio:analytics-ready"));

  if (!isEmbeddedFrame()) {
    window.addEventListener("message", (event) => {
      const data = event.data;
      if (!data || data.type !== bridgeMessageType || typeof data.event_name !== "string") return;
      const frame = Array.from(document.querySelectorAll("iframe")).find((candidate) => candidate.contentWindow === event.source);
      if (!frame) return;
      let frameUrl;
      try {
        frameUrl = new URL(frame.getAttribute("src") || "", window.location.href);
        if (frameUrl.origin !== window.location.origin) return;
      } catch {
        return;
      }
      const hasOpaqueSandboxOrigin = frame.hasAttribute("sandbox") && !frame.sandbox.contains("allow-same-origin");
      const expectedOrigin = hasOpaqueSandboxOrigin ? "null" : frameUrl.origin;
      if (event.origin !== expectedOrigin) return;

      capturePortfolioEvent(data.event_name, {
        ...sanitizeCustomProperties(data.properties),
        frame_context: "embedded",
        is_embedded_frame: true,
        embedded_page_path: typeof data.page_path === "string" ? data.page_path : null,
        embedded_page_title: typeof data.page_title === "string" ? data.page_title : null,
        embed_title: frame.getAttribute("title") || null,
        parent_page_path: window.location.pathname,
      });
    });
  }

  const pageContext = getPageContext();
  const tracksPageEngagement = !pageContext.is_embedded_frame;
  let interactionCount = 0;
  let sectionsViewedCount = 0;
  let maxScrollDepth = 0;
  let activeMilliseconds = 0;
  let lastActiveTick = Date.now();
  let wasVisibleAtLastActiveTick = document.visibilityState === "visible";
  let pageSummarySent = false;
  let firstPreviewInteraction = true;
  const reachedScrollMilestones = new Set();
  const reachedActiveMilestones = new Set();

  function recordInteraction() {
    interactionCount += 1;
  }

  function getElementLabel(element, maxLength = 120) {
    if (!element) return null;
    return redactSensitiveText(
      element.dataset?.trackLabel ||
        element.getAttribute?.("aria-label") ||
        element.getAttribute?.("title") ||
        element.textContent ||
        element.id ||
        "",
      maxLength,
    ) || null;
  }

  function getCtaLocation(element) {
    if (!element) return "unspecified";
    if (element.dataset?.trackLocation) return redactSensitiveText(element.dataset.trackLocation, 80) || "unspecified";
    const owner = element.closest?.("section, article, nav, header, footer");
    if (!owner) return "unspecified";
    return (
      owner.id ||
      owner.dataset?.trackSection ||
      redactSensitiveText(owner.getAttribute("aria-label") || "", 80) ||
      owner.classList?.[0] ||
      owner.tagName.toLowerCase()
    );
  }

  function getFileExtension(pathname) {
    const match = String(pathname || "").toLowerCase().match(/\.([a-z0-9]{1,8})$/);
    return match && fileExtensions.has(match[1]) ? match[1] : null;
  }

  function getLinkKind(link, url, fileExtension) {
    const href = link.getAttribute("href") || "";
    const protocol = url?.protocol || "";
    if (protocol === "mailto:" || protocol === "tel:") return "contact";
    if (fileExtension === "pdf") return "pdf";
    if (fileExtension) return "file";
    if (url && url.origin !== window.location.origin) return "outbound";
    if (href.startsWith("#")) return "anchor";
    return "internal";
  }

  function getExternalPlatform(hostname) {
    const host = String(hostname || "").toLowerCase();
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("github.com")) return "github";
    return host || null;
  }

  function capturePreviewInteraction(control, controlType, selectedValue = null) {
    const eventName = pageContext.page_type === "deck" ? "portfolio_deck_interacted" : "portfolio_preview_interacted";
    capturePortfolioEvent(eventName, {
      control_type: controlType,
      control_id: control.id || control.dataset?.tab || control.dataset?.page || control.name || null,
      control_label: getElementLabel(control),
      selected_value: selectedValue,
      is_first_interaction: firstPreviewInteraction,
    });
    firstPreviewInteraction = false;
  }

  capturePortfolioEvent("portfolio_page_loaded", {
    referrer_url: safeUrl(document.referrer),
  });

  if (pageContext.page_type === "cv") {
    capturePortfolioEvent("portfolio_cv_viewed");
  }

  if (pageContext.page_type === "deck") {
    capturePortfolioEvent("portfolio_deck_viewed");
  }

  if (pageContext.page_type === "404") {
    capturePortfolioEvent("portfolio_404_viewed", {
      attempted_path: window.location.pathname,
      referrer_url: safeUrl(document.referrer),
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const link = target.closest("a[href]");
    if (link) {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("javascript:")) return;

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      recordInteraction();
      const fileExtension = getFileExtension(url.pathname);
      const linkKind = getLinkKind(link, url, fileExtension);
      const ctaLocation = getCtaLocation(link);
      const isCvPdf = url.pathname.toLowerCase().includes("truong-dinh-anh-tu-cv");
      const opensCvPage = url.pathname.toLowerCase().endsWith("/cv.html");
      if (isCvPdf) forceCvSessionRecording();
      const declaredTrackingElement = link.closest("[data-track-event], [data-blog-track-event]");
      const declaredEventName =
        declaredTrackingElement?.dataset?.trackEvent || declaredTrackingElement?.dataset?.blogTrackEvent || null;
      const contactMethod = url.protocol === "mailto:" ? "email" : url.protocol === "tel:" ? "phone" : null;
      const fileAction = fileExtension || link.hasAttribute("download")
        ? link.hasAttribute("download")
          ? "download_clicked"
          : "open_clicked"
        : null;
      const cvAction = isCvPdf
        ? link.hasAttribute("download")
          ? "download_pdf_clicked"
          : "open_pdf_clicked"
        : opensCvPage
          ? "open_cv_page_clicked"
          : null;
      const commonLinkProperties = {
        link_kind: linkKind,
        link_label: linkKind === "contact" ? null : getElementLabel(link),
        cta_location: ctaLocation,
        destination_url: safeUrl(url.href),
        destination_path: url.origin === window.location.origin ? url.pathname : null,
        destination_host: url.hostname || null,
        external_platform: linkKind === "outbound" ? getExternalPlatform(url.hostname) : null,
        opens_new_tab: link.target === "_blank",
        file_extension: fileExtension,
        has_download_attribute: link.hasAttribute("download"),
        is_cv_pdf: isCvPdf,
        contact_method: contactMethod,
        file_action: fileAction,
        artifact_type: isCvPdf ? "cv" : fileExtension ? "portfolio_artifact" : null,
        cv_action: cvAction,
        declared_event_name: declaredEventName,
      };

      capturePortfolioEvent("portfolio_link_clicked", commonLinkProperties);

      if (url.protocol === "mailto:" || url.protocol === "tel:") {
        capturePortfolioEvent("portfolio_contact_clicked", {
          contact_method: url.protocol === "mailto:" ? "email" : "phone",
          cta_location: ctaLocation,
        });
      }

      if (fileExtension || link.hasAttribute("download")) {
        capturePortfolioEvent("portfolio_file_interaction", {
          file_extension: fileExtension,
          file_action: link.hasAttribute("download") ? "download_clicked" : "open_clicked",
          artifact_type: isCvPdf ? "cv" : "portfolio_artifact",
          cta_location: ctaLocation,
          destination_path: url.origin === window.location.origin ? url.pathname : null,
        });
      }

      if (isCvPdf || opensCvPage) {
        capturePortfolioEvent("portfolio_cv_interaction", {
          cv_action: isCvPdf
            ? link.hasAttribute("download")
              ? "download_pdf_clicked"
              : "open_pdf_clicked"
            : "open_cv_page_clicked",
          cta_location: ctaLocation,
          opens_new_tab: link.target === "_blank",
        });
      }
      return;
    }

    const button = target.closest("button, [role='button']");
    if (!button) return;
    recordInteraction();
    if (button.closest("[data-track-event]")) return;

    if (pageContext.page_type === "preview" || pageContext.page_type === "deck") {
      capturePreviewInteraction(button, "button");
    } else {
      capturePortfolioEvent("portfolio_control_used", {
        control_type: "button",
        control_id: button.id || button.dataset?.tab || button.dataset?.page || null,
        control_label: getElementLabel(button),
        cta_location: getCtaLocation(button),
      });
    }
  });

  document.addEventListener("change", (event) => {
    const control = event.target instanceof Element ? event.target : null;
    if (!control || !control.matches("select, input[type='checkbox'], input[type='radio']")) return;
    recordInteraction();
    let selectedValue = null;
    if (control instanceof HTMLSelectElement) {
      selectedValue = redactSensitiveText(control.selectedOptions[0]?.textContent || control.value, 120);
    } else if (control instanceof HTMLInputElement) {
      selectedValue = control.checked ? "checked" : "unchecked";
    }

    if (pageContext.page_type === "preview" || pageContext.page_type === "deck") {
      capturePreviewInteraction(control, control.tagName.toLowerCase(), selectedValue);
    } else {
      capturePortfolioEvent("portfolio_control_changed", {
        control_type: control.tagName.toLowerCase(),
        control_id: control.id || control.getAttribute("name") || null,
        control_label: getElementLabel(control),
        selected_value: selectedValue,
      });
    }
  });

  const searchTimers = new WeakMap();
  document.addEventListener("input", (event) => {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    if (!input || (input.type !== "search" && !input.matches("[data-blog-search]"))) return;
    const existingTimer = searchTimers.get(input);
    if (existingTimer) window.clearTimeout(existingTimer);
    searchTimers.set(
      input,
      window.setTimeout(() => {
        const length = input.value.trim().length;
        const lengthBucket = length === 0 ? "0" : length === 1 ? "1" : length <= 3 ? "2-3" : length <= 7 ? "4-7" : "8+";
        const declaredResultSelector = input.dataset.searchResultSelector;
        let resultCount = document.querySelectorAll(".blog-feature-card, .blog-archive-card").length;
        if (declaredResultSelector) {
          try {
            resultCount = document.querySelectorAll(declaredResultSelector).length;
          } catch {
            resultCount = 0;
          }
        }
        capturePortfolioEvent("portfolio_search_used", {
          query_length_bucket: lengthBucket,
          result_count: resultCount,
        });
      }, 750),
    );
  });

  document.addEventListener("copy", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    recordInteraction();
    capturePortfolioEvent("portfolio_copy_intent", {
      source_element: target?.tagName?.toLowerCase() || null,
      source_section: getCtaLocation(target),
    });
  });

  window.addEventListener(
    "error",
    (event) => {
      const resource = event.target instanceof Element ? event.target : null;
      if (!resource || resource === document.documentElement) return;
      const tagName = resource.tagName?.toLowerCase();
      if (!["img", "script", "link", "iframe", "object", "embed", "video", "audio", "source"].includes(tagName)) return;
      const source = resource.getAttribute("src") || resource.getAttribute("href") || resource.getAttribute("data");
      capturePortfolioEvent("portfolio_resource_load_failed", {
        resource_type: tagName,
        resource_url: safeUrl(source),
        resource_host: safeHostname(source),
      });
    },
    true,
  );

  function updateActiveTime() {
    if (!tracksPageEngagement) return;
    const now = Date.now();
    if (wasVisibleAtLastActiveTick) activeMilliseconds += Math.min(5000, Math.max(0, now - lastActiveTick));
    lastActiveTick = now;
    wasVisibleAtLastActiveTick = document.visibilityState === "visible";
    const activeSeconds = Math.floor(activeMilliseconds / 1000);
    activeTimeMilestones.forEach((milestone) => {
      if (activeSeconds < milestone || reachedActiveMilestones.has(milestone)) return;
      reachedActiveMilestones.add(milestone);
      capturePortfolioEvent("portfolio_active_time_reached", {
        seconds_threshold: milestone,
      });
    });
  }

  if (tracksPageEngagement) {
    document.addEventListener("visibilitychange", updateActiveTime);
    window.setInterval(updateActiveTime, 1000);
  }

  function updateScrollDepth() {
    if (!tracksPageEngagement || pageContext.page_type === "deck") return;
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0);
    const viewportBottom = window.scrollY + window.innerHeight;
    const depth = documentHeight > 0 ? Math.min(100, Math.max(0, Math.round((viewportBottom / documentHeight) * 100))) : 100;
    maxScrollDepth = Math.max(maxScrollDepth, depth);
    scrollMilestones.forEach((milestone) => {
      if (depth < milestone || reachedScrollMilestones.has(milestone)) return;
      reachedScrollMilestones.add(milestone);
      capturePortfolioEvent("portfolio_scroll_depth_reached", {
        depth_percent: milestone,
      });
    });
  }

  window.addEventListener("scroll", updateScrollDepth, { passive: true });
  window.addEventListener("resize", updateScrollDepth, { passive: true });

  function sendPageSummary(reason) {
    if (!tracksPageEngagement || pageSummarySent) return;
    updateActiveTime();
    updateScrollDepth();
    pageSummarySent = true;
    capturePortfolioEvent("portfolio_page_engaged", {
      engagement_reason: reason,
      active_seconds: Math.round(activeMilliseconds / 1000),
      elapsed_seconds: Math.round(performance.now() / 1000),
      max_scroll_depth: maxScrollDepth,
      interaction_count: interactionCount,
      sections_viewed: sectionsViewedCount,
    });
  }

  window.addEventListener("pagehide", () => sendPageSummary("pagehide"));
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      lastActiveTick = Date.now();
      wasVisibleAtLastActiveTick = document.visibilityState === "visible";
    }
  });

  function setupSectionTracking() {
    if (!tracksPageEngagement || !("IntersectionObserver" in window)) return;
    const candidates = Array.from(
      new Set(document.querySelectorAll("main > section, main > article > section, [data-track-section]")),
    ).filter((element) => !element.closest(".slide"));
    if (!candidates.length) return;

    const viewed = new WeakSet();
    const timers = new WeakMap();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !viewed.has(element)) {
            if (timers.has(element)) return;
            timers.set(
              element,
              window.setTimeout(() => {
                if (viewed.has(element)) return;
                viewed.add(element);
                sectionsViewedCount += 1;
                const index = candidates.indexOf(element);
                const heading = element.querySelector("h1, h2, h3");
                capturePortfolioEvent("portfolio_section_viewed", {
                  section_id: element.id || element.dataset.trackSection || `section-${index + 1}`,
                  section_order: index + 1,
                  section_heading: getElementLabel(heading),
                  visible_ratio: Math.round(entry.intersectionRatio * 100) / 100,
                });
              }, 1000),
            );
          } else {
            const timer = timers.get(element);
            if (timer) window.clearTimeout(timer);
            timers.delete(element);
          }
        });
      },
      { threshold: [0.5, 0.75] },
    );
    candidates.forEach((element) => observer.observe(element));
  }

  function getOrderedSlides() {
    const controllerSlides = Array.isArray(window.presentation?.slides) ? window.presentation.slides : [];
    if (controllerSlides.length) return controllerSlides.filter((slide) => slide instanceof Element);

    const domSlides = Array.from(document.querySelectorAll(".slide"));
    const preferredOrder = [".intro-slide", ".journey-slide", ".bx-slide", ".upcoming-slide", ".rx-slide", ".qa-slide"];
    const orderedSlides = preferredOrder
      .map((selector) => document.querySelector(selector))
      .filter((slide) => slide instanceof Element && domSlides.includes(slide));
    domSlides.forEach((slide) => {
      if (!orderedSlides.includes(slide)) orderedSlides.push(slide);
    });
    return orderedSlides;
  }

  function setupSlideTracking() {
    const slides = getOrderedSlides();
    if (!slides.length || !("MutationObserver" in window)) return;
    let lastSlide = null;
    const captureActiveSlide = () => {
      const activeSlide = slides.find(
        (slide) =>
          (slide.classList.contains("active") || slide.classList.contains("visible")) &&
          window.getComputedStyle(slide).visibility !== "hidden",
      );
      if (!activeSlide || activeSlide === lastSlide) return;
      lastSlide = activeSlide;
      const slideIndex = slides.indexOf(activeSlide) + 1;
      capturePortfolioEvent("portfolio_slide_viewed", {
        slide_id: activeSlide.id || activeSlide.dataset.slide || `slide-${slideIndex}`,
        slide_index: slideIndex,
        slide_total: slides.length,
        slide_title: getElementLabel(activeSlide.querySelector("h1, h2, h3")) || activeSlide.getAttribute("aria-label") || null,
      });
    };
    const observer = new MutationObserver(captureActiveSlide);
    slides.forEach((slide) => observer.observe(slide, { attributes: true, attributeFilter: ["class", "hidden"] }));
    captureActiveSlide();
  }

  function setupDeckNavigationTracking() {
    if (pageContext.page_type !== "deck") return;

    let touchStartX = null;
    let touchStartY = null;
    let lastDeckSwipeAt = 0;

    const getDeckNavigationState = () => {
      const slides = getOrderedSlides();
      const activeSlide = slides.find(
        (slide) => slide.classList.contains("active") || slide.classList.contains("visible"),
      );
      const currentSlide = slides.indexOf(activeSlide);
      if (!activeSlide || currentSlide < 0) return null;

      const rawSceneIndex =
        activeSlide.dataset.introScene ??
        activeSlide.dataset.journeyScene ??
        activeSlide.dataset.benefitScene ??
        activeSlide.dataset.roadmapScene ??
        activeSlide.dataset.qaScene ??
        null;
      const parsedSceneIndex = Number.parseInt(rawSceneIndex, 10);
      const sceneIndex = Number.isFinite(parsedSceneIndex) ? parsedSceneIndex : null;

      return {
        slide_index: currentSlide + 1,
        scene_index: Number.isFinite(sceneIndex) ? sceneIndex + 1 : null,
        signature: `${currentSlide}:${Number.isFinite(sceneIndex) ? sceneIndex : "none"}`,
      };
    };

    const queueDeckNavigationCapture = (controlType, controlId, direction) => {
      const before = getDeckNavigationState();
      if (!before) return;

      window.setTimeout(() => {
        const after = getDeckNavigationState();
        if (!after || before.signature === after.signature) return;

        recordInteraction();
        capturePortfolioEvent("portfolio_deck_interacted", {
          control_type: controlType,
          control_id: controlId,
          control_label: null,
          selected_value: null,
          navigation_direction: direction,
          navigation_scope: before.slide_index === after.slide_index ? "scene" : "slide",
          from_slide_index: before.slide_index,
          to_slide_index: after.slide_index,
          from_scene_index: before.scene_index,
          to_scene_index: after.scene_index,
          is_first_interaction: firstPreviewInteraction,
        });
        firstPreviewInteraction = false;
      }, 0);
    };

    document.addEventListener(
      "keydown",
      (event) => {
        if (document.body.classList.contains("editing")) return;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest("input, textarea, select, button, [contenteditable='true'], [role='button']")) return;

        const isSpace = event.key === " " || event.key === "Spacebar" || event.code === "Space";
        const forwardKeys = new Set(["ArrowRight", "ArrowDown", "PageDown"]);
        const backwardKeys = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);
        let direction = null;
        if (isSpace) direction = event.shiftKey ? "backward" : "forward";
        else if (event.key === "Home") direction = "first";
        else if (event.key === "End") direction = "last";
        else if (forwardKeys.has(event.key)) direction = "forward";
        else if (backwardKeys.has(event.key)) direction = "backward";
        if (!direction) return;

        const controlId = isSpace ? "Space" : event.key || event.code || "keyboard";
        queueDeckNavigationCapture("keyboard", controlId, direction);
      },
      true,
    );

    window.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaY) < 18) return;
        queueDeckNavigationCapture("wheel", "wheel", event.deltaY > 0 ? "forward" : "backward");
      },
      { capture: true, passive: true },
    );

    window.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.changedTouches?.[0];
        if (!touch) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { capture: true, passive: true },
    );

    window.addEventListener(
      "touchend",
      (event) => {
        const touch = event.changedTouches?.[0];
        if (!touch || !Number.isFinite(touchStartX) || !Number.isFinite(touchStartY)) return;
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        touchStartX = null;
        touchStartY = null;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        lastDeckSwipeAt = Date.now();
        queueDeckNavigationCapture("swipe", "horizontal-swipe", dx < 0 ? "forward" : "backward");
      },
      { capture: true, passive: true },
    );

    document.addEventListener(
      "click",
      (event) => {
        if (Date.now() - lastDeckSwipeAt < 750 || document.body.classList.contains("editing")) return;
        const target = event.target instanceof Element ? event.target : null;
        const slide = target?.closest(".slide");
        if (!slide) return;
        if (
          target.closest(
            "a, button, input, select, textarea, video, audio, [role='button'], [contenteditable='true'], .deck-controls, .edit-toggle, .edit-hotzone",
          )
        ) {
          return;
        }
        queueDeckNavigationCapture("slide_background", "slide-background", "forward");
      },
      true,
    );
  }

  function setupEmbedTracking() {
    const embeds = Array.from(document.querySelectorAll("iframe, object, embed"));
    if (!embeds.length) return;
    const getEmbedSource = (embed) =>
      embed.matches("[data-cv-pdf-viewer]")
        ? embed.getAttribute("data-cv-document-url") || embed.getAttribute("src") || embed.getAttribute("data")
        : embed.getAttribute("src") || embed.getAttribute("data");
    const viewed = new WeakSet();
    const viewTimers = new WeakMap();
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const embed = entry.target;
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !viewed.has(embed)) {
                if (viewTimers.has(embed)) return;
                viewTimers.set(
                  embed,
                  window.setTimeout(() => {
                    viewed.add(embed);
                    const source = getEmbedSource(embed);
                    const isPdf = embed.matches("[data-cv-pdf-viewer]") || String(source || "").toLowerCase().includes(".pdf");
                    capturePortfolioEvent("portfolio_embed_viewed", {
                      embed_type: isPdf ? "pdf" : embed.tagName.toLowerCase(),
                      embed_title: embed.getAttribute("title") || embed.getAttribute("aria-label") || null,
                      destination_url: safeUrl(source),
                    });
                    if (isPdf) {
                      capturePortfolioEvent("portfolio_cv_interaction", {
                        cv_action: "embedded_preview_viewed",
                        cta_location: getCtaLocation(embed),
                      });
                    }
                  }, 1000),
                );
              } else {
                const timer = viewTimers.get(embed);
                if (timer) window.clearTimeout(timer);
                viewTimers.delete(embed);
              }
            });
          },
          { threshold: [0.5] },
        )
      : null;

    embeds.forEach((embed) => {
      const captureLoaded = () => {
        const source = getEmbedSource(embed);
        const isPdf = embed.matches("[data-cv-pdf-viewer]") || String(source || "").toLowerCase().includes(".pdf");
        capturePortfolioEvent("portfolio_embed_loaded", {
          embed_type: isPdf ? "pdf" : embed.tagName.toLowerCase(),
          embed_title: embed.getAttribute("title") || embed.getAttribute("aria-label") || null,
          destination_url: safeUrl(source),
        });
      };
      embed.addEventListener("load", captureLoaded, { once: true });
      observer?.observe(embed);
      try {
        if (embed instanceof HTMLIFrameElement && embed.contentDocument?.readyState === "complete") captureLoaded();
      } catch {
        // Cross-origin and sandboxed embeds are tracked by their load event.
      }
    });
  }

  function setupMediaTracking() {
    const progressByMedia = new WeakMap();
    document.addEventListener(
      "play",
      (event) => {
        const media = event.target instanceof HTMLMediaElement ? event.target : null;
        if (!media) return;
        recordInteraction();
        capturePortfolioEvent("portfolio_media_started", {
          media_id: media.id || safeUrl(media.currentSrc || media.src),
          media_type: media.tagName.toLowerCase(),
          current_seconds: Math.round(media.currentTime || 0),
        });
      },
      true,
    );

    document.addEventListener(
      "timeupdate",
      (event) => {
        const media = event.target instanceof HTMLMediaElement ? event.target : null;
        if (!media || !Number.isFinite(media.duration) || media.duration <= 0) return;
        const reached = progressByMedia.get(media) || new Set();
        const progress = (media.currentTime / media.duration) * 100;
        [25, 50, 75, 100].forEach((milestone) => {
          if (progress < milestone || reached.has(milestone)) return;
          reached.add(milestone);
          capturePortfolioEvent("portfolio_media_progress", {
            media_id: media.id || safeUrl(media.currentSrc || media.src),
            media_type: media.tagName.toLowerCase(),
            progress_percent: milestone,
          });
        });
        progressByMedia.set(media, reached);
      },
      true,
    );

    document.addEventListener(
      "ended",
      (event) => {
        const media = event.target instanceof HTMLMediaElement ? event.target : null;
        if (!media) return;
        capturePortfolioEvent("portfolio_media_completed", {
          media_id: media.id || safeUrl(media.currentSrc || media.src),
          media_type: media.tagName.toLowerCase(),
        });
      },
      true,
    );
  }

  function capturePagePerformance() {
    if (!window.performance || typeof window.performance.getEntriesByType !== "function") return;
    const navigation = window.performance.getEntriesByType("navigation")[0];
    if (!navigation) return;
    const rounded = (value) => (Number.isFinite(value) ? Math.max(0, Math.round(value)) : null);
    capturePortfolioEvent("portfolio_page_performance", {
      navigation_type: navigation.type || null,
      ttfb_ms: rounded(navigation.responseStart),
      dom_interactive_ms: rounded(navigation.domInteractive),
      dom_content_loaded_ms: rounded(navigation.domContentLoadedEventEnd),
      load_complete_ms: rounded(navigation.loadEventEnd),
      transfer_size_bytes: rounded(navigation.transferSize),
      decoded_body_size_bytes: rounded(navigation.decodedBodySize),
      protocol: navigation.nextHopProtocol || null,
    });
  }

  function initializeDomTracking() {
    setupSectionTracking();
    setupSlideTracking();
    setupDeckNavigationTracking();
    setupEmbedTracking();
    setupMediaTracking();
    updateScrollDepth();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDomTracking, { once: true });
  } else {
    initializeDomTracking();
  }

  if (document.readyState === "complete") {
    window.setTimeout(capturePagePerformance, 0);
  } else {
    window.addEventListener("load", () => window.setTimeout(capturePagePerformance, 0), { once: true });
  }
})();
