(() => {
  const posthogProjectKey = "phc_khcQc7asdJTMzQQBk7dWTVdbgiT4NFDz5dkLT6GCBqnA";
  const posthogApiHost = "https://us.i.posthog.com";
  const trackedHosts = new Set(["tudzai.github.io"]);

  if (!trackedHosts.has(window.location.hostname)) return;
  if (window.posthog?.__loaded || window.posthog?.__SV) return;

  !function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="xi Si init Ni ji pr qi Ui $i capture calculateEventProperties Zi register register_once register_for_session unregister unregister_for_session Yi getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Ki identify setPersonProperties unsetPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty Qi Wi createPersonProfile setInternalOrTestUser Ji Fi tn opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing zi debug mr it getPageViewId captureTraceFeedback captureTraceMetric Ri".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  window.posthog.init(posthogProjectKey, {
    api_host: posthogApiHost,
    defaults: "2026-05-30",
    person_profiles: "identified_only",
  });

  function isEmbeddedFrame() {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  function getSection(pathname = window.location.pathname) {
    if (pathname === "/Portfolio/" || pathname === "/Portfolio/index.html") return "home";
    if (pathname.includes("/showcase/powerbi/")) return "powerbi";
    if (pathname.includes("/showcase/fpa-decision-cases/")) return "fpa-decision-cases";
    if (pathname.includes("/showcase/python-automation/")) return "python-automation";
    if (pathname.includes("/blog/")) return "blog";
    if (pathname.endsWith("/cv.html")) return "cv";
    if (pathname.endsWith("/share.html")) return "share";
    if (pathname.endsWith("/404.html")) return "404";
    return "portfolio";
  }

  function safeUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") return parsed.protocol;
      if (parsed.origin === "null") return parsed.protocol;
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return null;
    }
  }

  function getLinkLabel(link) {
    return (link.dataset.trackLabel || link.textContent || link.getAttribute("aria-label") || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || null;
  }

  function getLinkKind(link, url) {
    const href = link.getAttribute("href") || "";
    const protocol = url?.protocol || "";
    const pathname = (url?.pathname || "").toLowerCase();

    if (protocol === "mailto:" || protocol === "tel:") return "contact";
    if (pathname.endsWith(".pdf")) return "pdf";
    if (url && url.origin !== window.location.origin) return "outbound";
    if (href.startsWith("#")) return "anchor";
    return "internal";
  }

  function capturePortfolioEvent(eventName, properties = {}) {
    if (!window.posthog || typeof window.posthog.capture !== "function") return;
    window.posthog.capture(eventName, {
      page_path: window.location.pathname,
      page_url: safeUrl(window.location.href),
      page_title: document.title,
      page_section: getSection(),
      is_embedded_frame: isEmbeddedFrame(),
      ...properties,
    });
  }

  capturePortfolioEvent("portfolio_page_loaded", {
    referrer_url: safeUrl(document.referrer),
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("javascript:")) return;
    if (link.closest("[data-track-event]")) return;

    let url = null;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }

    const linkKind = getLinkKind(link, url);

    capturePortfolioEvent("portfolio_link_clicked", {
      link_kind: linkKind,
      link_label: getLinkLabel(link),
      destination_url: safeUrl(url.href),
      destination_path: url.origin === window.location.origin ? url.pathname : null,
      destination_host: url.hostname || null,
      opens_new_tab: link.target === "_blank",
      is_cv_pdf: url.pathname.toLowerCase().includes("truong-dinh-anh-tu-cv"),
    });
  });
})();
