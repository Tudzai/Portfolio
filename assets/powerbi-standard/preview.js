/* Shared Project 20-style Power BI preview runtime. */
(function () {
  "use strict";

  const CONFIG = window.__POWERBI_PROJECT_CONFIG__ || {};
  const COLORS = ["#5b83e6", "#569b94", "#4d8d4b", "#be7c10", "#7a1b8d", "#d07343", "#29258f", "#b73535"];
  const DEFAULT_PAGES = ["Executive Overview", "Driver Analysis", "Action Monitor"];
  const DEFAULT_YEARS = ["2026", "2025"];
  const DEFAULT_SCENARIOS = ["Base", "Upside", "Downside"];
  const DEFAULT_REGIONS = ["All Region", "Americas", "EMEA", "APAC"];

  const frame = document.querySelector(".preview-frame");
  const shell = document.querySelector(".dashboard-shell");
  const dashboard = document.querySelector(".dashboard");
  const content = document.getElementById("content");
  const nav = document.getElementById("projectNav");
  const resetButton = document.getElementById("resetFilters");
  const filterElements = {
    year: document.getElementById("yearFilter"),
    scenario: document.getElementById("scenarioFilter"),
    scope: document.getElementById("scopeFilter"),
    region: document.getElementById("regionFilter")
  };

  if (!frame || !shell || !dashboard || !content || !nav) {
    window.__dashboardQa = {
      ready: false,
      error: "Missing the shared preview DOM contract",
      required: [".preview-frame", ".dashboard-shell", ".dashboard", "#projectNav", "#content"]
    };
    return;
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return Object.values(value);
    if (value == null || value === "") return [];
    return [value];
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slugify(value, fallback) {
    const slug = String(value == null ? "" : value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || fallback;
  }

  function stableHash(value) {
    let hash = 2166136261;
    const input = String(value == null ? "" : value);
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function round(value, digits) {
    const power = 10 ** (digits == null ? 1 : digits);
    return Math.round((Number(value) + Number.EPSILON) * power) / power;
  }

  function plainText(value, fallback) {
    if (Array.isArray(value)) return value.filter(Boolean).join(" · ") || fallback;
    if (value && typeof value === "object") {
      return value.text || value.label || value.summary || Object.values(value).filter(item => typeof item === "string").join(" · ") || fallback;
    }
    return String(value || fallback || "");
  }

  function normalizeOption(option) {
    if (option && typeof option === "object") {
      const value = String(option.value ?? option.id ?? option.label ?? option.name ?? "");
      return { value, label: String(option.label ?? option.name ?? value), factor: Number(option.factor) || null };
    }
    return { value: String(option), label: String(option), factor: null };
  }

  function normalizeOptions(options, fallback) {
    const normalized = asArray(options).map(normalizeOption).filter(option => option.value);
    return normalized.length ? normalized : fallback.map(normalizeOption);
  }

  function normalizePages(rawPages) {
    const source = asArray(rawPages).length ? asArray(rawPages) : DEFAULT_PAGES;
    const normalized = source.slice(0, 3).map((page, index) => {
      if (typeof page === "string") {
        return {
          id: slugify(page.replace(/^\d+\s*/, ""), `page-${index + 1}`),
          label: page,
          title: page.replace(/^\d+\s*/, "") || page,
          source: {}
        };
      }
      const label = page.label || page.nav || page.name || page.title || `0${index + 1} Page ${index + 1}`;
      return {
        id: page.id || page.key || slugify(label, `page-${index + 1}`),
        label,
        title: page.title || String(label).replace(/^\d+\s*/, ""),
        subtitle: page.subtitle || page.summary || "",
        focus: page.focus || page.lens || "",
        source: page
      };
    });
    while (normalized.length < 3) {
      const index = normalized.length;
      const label = DEFAULT_PAGES[index] || `Page ${index + 1}`;
      normalized.push({ id: slugify(label, `page-${index + 1}`), label, title: label, source: {} });
    }
    return normalized;
  }

  const pages = normalizePages(CONFIG.pages);

  function findFilterConfig(key) {
    const aliases = {
      year: ["year", "fiscalYear", "period"],
      scenario: ["scenario", "case"],
      scope: ["scope", "businessUnit", "business-unit", "segment", "channel", "portfolio"],
      region: ["region", "market", "geography"]
    }[key];
    return asArray(CONFIG.filters).find((item) => {
      const id = String(item?.id || item?.key || item?.name || "").toLowerCase();
      return aliases.some(alias => id === alias.toLowerCase());
    }) || {};
  }

  function optionsFor(key) {
    const filter = findFilterConfig(key);
    if (key === "year") return normalizeOptions(filter.options || CONFIG.yearOptions || CONFIG.years, DEFAULT_YEARS);
    if (key === "scenario") return normalizeOptions(filter.options || CONFIG.scenarioOptions || CONFIG.scenarios, DEFAULT_SCENARIOS);
    if (key === "scope") {
      const scopeLabel = CONFIG.scopeLabel || filter.label || "Scope";
      return normalizeOptions(filter.options || CONFIG.scopeOptions, [`All ${scopeLabel}`, "Core", "Growth", "Other"]);
    }
    return normalizeOptions(filter.options || CONFIG.regionOptions || CONFIG.regions, DEFAULT_REGIONS);
  }

  const optionSets = {
    year: optionsFor("year"),
    scenario: optionsFor("scenario"),
    scope: optionsFor("scope"),
    region: optionsFor("region")
  };

  function defaultFor(key) {
    const filter = findFilterConfig(key);
    const configured = CONFIG.defaults?.[key] ?? filter.default ?? filter.value;
    if (configured != null && optionSets[key].some(option => option.value === String(configured))) return String(configured);
    return optionSets[key][0]?.value || "";
  }

  const defaults = {
    year: defaultFor("year"),
    scenario: defaultFor("scenario"),
    scope: defaultFor("scope"),
    region: defaultFor("region")
  };

  const state = {
    page: pages[0].id,
    year: defaults.year,
    scenario: defaults.scenario,
    scope: defaults.scope,
    region: defaults.region
  };
  window.previewState = state;

  function normalizeMetric(metric, index) {
    if (Array.isArray(metric)) {
      return {
        key: `metric-${index + 1}`,
        value: metric[0],
        label: metric[1] || `Metric ${index + 1}`,
        higherIsBetter: metric[2] !== false
      };
    }
    if (typeof metric === "number" || typeof metric === "string") {
      return { key: `metric-${index + 1}`, value: metric, label: `Metric ${index + 1}`, higherIsBetter: true };
    }
    return {
      key: metric?.key || metric?.id || slugify(metric?.label, `metric-${index + 1}`),
      label: metric?.label || metric?.name || `Metric ${index + 1}`,
      value: metric?.value ?? metric?.actual ?? metric?.current ?? 0,
      plan: metric?.plan ?? metric?.target,
      prior: metric?.prior ?? metric?.previous ?? metric?.py,
      delta: metric?.delta ?? metric?.variance,
      format: metric?.format || metric?.type,
      color: metric?.color,
      series: Array.isArray(metric?.series) ? metric.series.map(Number).filter(Number.isFinite) : null,
      higherIsBetter: metric?.higherIsBetter == null ? null : metric.higherIsBetter !== false,
      sensitivity: Number.isFinite(Number(metric?.sensitivity)) ? Number(metric.sensitivity) : 1
    };
  }

  function sourceForPage(kind, page) {
    const embedded = page.source?.[kind] || page.source?.[`${kind}Keys`];
    const globalSource = CONFIG[kind];
    if (embedded) {
      if (Array.isArray(embedded) && embedded.every(item => typeof item === "string") && globalSource && !Array.isArray(globalSource)) {
        return embedded.map(key => globalSource[key]).filter(Boolean);
      }
      return embedded;
    }
    if (globalSource && !Array.isArray(globalSource) && globalSource[page.id]) return globalSource[page.id];
    return globalSource;
  }

  function fallbackMetrics() {
    return [
      { label: "Revenue", value: "$36.7M", higherIsBetter: true },
      { label: "Gross Margin", value: "78.8%", higherIsBetter: true },
      { label: "EBITDA", value: "$14.4M", higherIsBetter: true },
      { label: "Closing Cash", value: "$372.4M", higherIsBetter: true }
    ];
  }

  function metricsFor(page) {
    let source = sourceForPage("metrics", page);
    if (source && !Array.isArray(source) && typeof source === "object") source = Object.entries(source).map(([key, value]) => ({ key, ...(typeof value === "object" ? value : { value }) }));
    const metrics = (asArray(source).length ? asArray(source) : fallbackMetrics()).map(normalizeMetric);
    const offset = pages.findIndex(item => item.id === page.id);
    const rotated = metrics.map((_, index) => metrics[(index + offset) % metrics.length]);
    while (rotated.length < 4) rotated.push(normalizeMetric(fallbackMetrics()[rotated.length], rotated.length));
    return rotated.slice(0, 4);
  }

  function normalizeBar(bar, index) {
    if (Array.isArray(bar)) {
      return { label: String(bar[0] ?? `Item ${index + 1}`), value: Number(bar[1]) || 0, display: bar[2] };
    }
    return {
      label: String(bar?.label || bar?.name || bar?.category || `Item ${index + 1}`),
      value: Number(bar?.value ?? bar?.score ?? bar?.amount ?? 0) || 0,
      display: bar?.display,
      color: bar?.color,
      filter: bar?.filter || bar?.filterKind,
      filterValue: bar?.filterValue
    };
  }

  function normalizeBarPanels(page) {
    const raw = sourceForPage("bars", page);
    const source = asArray(raw);
    let panels;
    if (source.some(item => item && !Array.isArray(item) && (item.items || item.rows || item.data))) {
      panels = source.map((panel, index) => ({
        title: panel.title || panel.label || `Breakdown ${index + 1}`,
        subtitle: panel.subtitle || "Click a bar to cross-filter",
        filter: panel.filter || panel.filterKind,
        items: asArray(panel.items || panel.rows || panel.data).map(normalizeBar)
      }));
    } else {
      panels = [{
        title: CONFIG.barTitle || `${CONFIG.lens || "Performance"} Breakdown`,
        subtitle: "Click a bar to cross-filter",
        filter: CONFIG.barFilter,
        items: source.map(normalizeBar)
      }];
    }

    if (!panels[0].items.length) {
      panels[0].items = optionSets.scope.slice(1, 5).map((option, index) => ({ label: option.label, value: 84 - index * 13, filter: "scope", filterValue: option.value }));
    }

    const pageIndex = pages.findIndex(item => item.id === page.id);
    const rotatedItems = panels[0].items.map((_, index, items) => items[(index + pageIndex) % items.length]);
    panels[0] = { ...panels[0], items: rotatedItems };

    if (panels.length < 2) {
      const regionItems = optionSets.region.slice(1, 5).map((option, index) => ({
        label: option.label,
        value: Math.max(8, 74 - index * 14 + (stableHash(`${CONFIG.no}-${option.value}`) % 13)),
        filter: "region",
        filterValue: option.value,
        color: COLORS[(index + 2) % COLORS.length]
      }));
      panels.push({ title: "Regional Contribution", subtitle: "Select a market lens", filter: "region", items: regionItems.length ? regionItems : rotatedItems });
    }
    return panels.slice(0, 2);
  }

  function normalizeDriver(driver, index) {
    if (Array.isArray(driver)) {
      return { label: String(driver[0] || `Driver ${index + 1}`), value: driver[1] ?? "—", isRisk: Boolean(driver[2]) };
    }
    return {
      label: String(driver?.label || driver?.name || driver?.driver || `Driver ${index + 1}`),
      value: driver?.value ?? driver?.impact ?? driver?.delta ?? "—",
      isRisk: Boolean(driver?.isRisk || driver?.risk || String(driver?.status || "").toLowerCase() === "risk"),
      status: driver?.status,
      owner: driver?.owner
    };
  }

  function driversFor(page) {
    const source = asArray(sourceForPage("drivers", page)).map(normalizeDriver);
    if (source.length) return source.slice(0, 4);
    return metricsFor(page).map((metric, index) => ({
      label: `${metric.label} driver`,
      value: `${index % 2 ? "+" : ""}${round((stableHash(metric.label) % 44 - 12) / 10, 1)}%`,
      isRisk: index === 2
    }));
  }

  function normalizeAction(action, index) {
    if (Array.isArray(action)) {
      return { owner: String(action[0] || "FP&A"), action: String(action[1] || `Action ${index + 1}`), status: action[2] || "Open" };
    }
    return {
      owner: String(action?.owner || action?.team || "FP&A"),
      action: String(action?.action || action?.title || action?.label || `Action ${index + 1}`),
      status: action?.status || (index === 0 ? "Priority" : "Open"),
      impact: action?.impact || action?.value || ""
    };
  }

  function actionsFor(page) {
    const source = asArray(sourceForPage("actions", page)).map(normalizeAction);
    if (source.length) return source.slice(0, 4);
    return [
      { owner: "FP&A", action: "Validate the forecast call", status: "Priority" },
      { owner: "Ops", action: "Close the largest driver gap", status: "Open" },
      { owner: "CFO", action: "Confirm owner and timing", status: "Review" }
    ];
  }

  function parseNumeric(input) {
    if (typeof input === "number") return { value: input, multiplier: 1, format: "number", decimals: Number.isInteger(input) ? 0 : 1, prefix: "", suffix: "" };
    const original = String(input ?? "0").trim();
    const negative = /^\(.*\)$/.test(original) || /^-/.test(original);
    const match = original.replace(/,/g, "").match(/[-+]?\d*\.?\d+/);
    let value = match ? Number(match[0]) : 0;
    if (negative && value > 0) value *= -1;
    const upper = original.toUpperCase();
    const suffixScale = /B\b/.test(upper) ? 1e9 : /M\b/.test(upper) ? 1e6 : /K\b/.test(upper) ? 1e3 : 1;
    const decimals = match && match[0].includes(".") ? match[0].split(".")[1].length : 0;
    const format = original.includes("%") ? "percent" : /X\b/i.test(original) ? "multiple" : /\$|€|£|¥/.test(original) ? "currency" : /DAY/i.test(original) ? "days" : "number";
    return {
      value: value * suffixScale,
      multiplier: suffixScale,
      format,
      decimals,
      prefix: original.match(/[\$€£¥]/)?.[0] || "",
      suffix: original.match(/(%|x|X|\s?days?)\s*$/i)?.[0] || (suffixScale === 1e9 ? "B" : suffixScale === 1e6 ? "M" : suffixScale === 1e3 ? "K" : "")
    };
  }

  function inferFormat(metric, parsed) {
    const format = String(metric.format || "").toLowerCase();
    if (/currency|money|usd/.test(format)) return "currency";
    if (/percent|pct|rate/.test(format)) return "percent";
    if (/multiple|ratio/.test(format)) return "multiple";
    if (/day/.test(format)) return "days";
    return parsed.format;
  }

  function scenarioFactor() {
    const option = optionSets.scenario.find(item => item.value === state.scenario);
    if (option?.factor) return option.factor;
    const name = state.scenario.toLowerCase();
    if (/up|best|growth|acceler/.test(name)) return 1.075;
    if (/stress|severe|bear/.test(name)) return .82;
    if (/down|low|conservative/.test(name)) return .925;
    return 1;
  }

  function dimensionFactor(key, value) {
    const options = optionSets[key];
    if (!value || value === options[0]?.value || /^all\b/i.test(value)) return 1;
    const option = options.find(item => item.value === value);
    if (option?.factor) return option.factor;
    const seed = stableHash(`${CONFIG.no || CONFIG.id || CONFIG.title}-${key}-${value}`);
    return key === "scope" ? .31 + (seed % 24) / 100 : .19 + (seed % 20) / 100;
  }

  function yearFactor() {
    const years = optionSets.year.map(item => Number.parseInt(item.value, 10)).filter(Number.isFinite);
    const selectedYear = Number.parseInt(state.year, 10);
    const latestYear = years.length ? Math.max(...years) : selectedYear;
    return Number.isFinite(selectedYear) ? Math.max(.78, 1 - Math.max(0, latestYear - selectedYear) * .045) : 1;
  }

  function allocationFactor() {
    return yearFactor() * dimensionFactor("scope", state.scope) * dimensionFactor("region", state.region);
  }

  function dimensionPerformanceFactor(key, value) {
    const options = optionSets[key];
    if (!value || value === options[0]?.value || /^all\b/i.test(value)) return 1;
    const seed = stableHash(`${CONFIG.no || CONFIG.id || CONFIG.title}-${key}-${value}-performance`);
    return .965 + (seed % 71) / 1000;
  }

  function performanceFactor() {
    return scenarioFactor()
      * dimensionPerformanceFactor("scope", state.scope)
      * dimensionPerformanceFactor("region", state.region);
  }

  function stateFactor() {
    return allocationFactor() * performanceFactor();
  }

  function metricStateFactor(metric) {
    if (metric.higherIsBetter == null || metric.sensitivity === 0) return allocationFactor();
    const performance = performanceFactor();
    return allocationFactor() * (metric.higherIsBetter === false ? 1 / Math.max(.01, performance) : performance);
  }

  function adjustedNumeric(metric, input, requestedFactor = metricStateFactor(metric)) {
    const parsed = parseNumeric(input ?? metric.value);
    const format = inferFormat(metric, parsed);
    const configuredSensitivity = Number(metric.sensitivity);
    const sensitivity = Number.isFinite(configuredSensitivity) ? configuredSensitivity : 1;
    let effectiveFactor = 1 + (requestedFactor - 1) * sensitivity;
    if (format === "percent" || format === "multiple" || format === "days") effectiveFactor = 1 + (effectiveFactor - 1) * .38;
    return { ...parsed, format, value: parsed.value * effectiveFactor };
  }

  function formatNumeric(parsed, metric) {
    const value = Number(parsed.value) || 0;
    const absolute = Math.abs(value);
    const configuredFormat = String(metric?.format || "").toLowerCase();
    if (parsed.format === "percent") {
      const percentValue = absolute <= 1 && (/rate|ratio|percent|pct/.test(configuredFormat) || Math.abs(parseNumeric(metric?.value).value) <= 1) ? value * 100 : value;
      return `${round(percentValue, 1).toFixed(1)}%`;
    }
    if (parsed.format === "multiple") return `${round(value, 1).toFixed(1)}x`;
    if (parsed.format === "days") return `${Math.round(value)} days`;
    let scale = parsed.multiplier || 1;
    let suffix = parsed.suffix || "";
    if (absolute >= 1e9) { scale = 1e9; suffix = "B"; }
    else if (absolute >= 1e6) { scale = 1e6; suffix = "M"; }
    else if (absolute >= 1e3 && scale > 1) { scale = 1e3; suffix = "K"; }
    const display = value / scale;
    const decimals = scale > 1 ? 1 : (absolute < 100 ? 1 : 0);
    const sign = display < 0 ? "-" : "";
    const unsignedDisplay = Math.abs(display);
    return `${sign}${parsed.prefix || ""}${round(unsignedDisplay, decimals).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  }

  function computedMetric(metric, index) {
    const actualParsed = adjustedNumeric(metric, metric.value);
    const actual = actualParsed.value;
    const planSeed = .965 + ((stableHash(`${CONFIG.no}-${metric.key}-plan`) % 61) / 1000);
    const baselineActual = parseNumeric(metric.value).value;
    const planBase = metric.plan != null
      ? adjustedNumeric(metric, metric.plan, allocationFactor()).value
      : adjustedNumeric(metric, baselineActual / planSeed, allocationFactor()).value;
    const priorSeed = .91 + ((stableHash(`${CONFIG.no}-${metric.key}-prior`) % 71) / 1000);
    const priorBase = metric.prior != null
      ? adjustedNumeric(metric, metric.prior, allocationFactor()).value
      : adjustedNumeric(metric, baselineActual * priorSeed, allocationFactor()).value;
    const delta = planBase === 0 ? 0 : (actual - planBase) / Math.abs(planBase);
    const favorable = metric.higherIsBetter ? delta >= 0 : delta <= 0;
    const varianceLabel = metric.delta != null ? String(metric.delta) : `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}%`;
    return {
      ...metric,
      index,
      actual,
      plan: planBase,
      prior: priorBase,
      actualLabel: formatNumeric(actualParsed, metric),
      planLabel: formatNumeric({ ...actualParsed, value: planBase }, metric),
      priorLabel: formatNumeric({ ...actualParsed, value: priorBase }, metric),
      variance: delta,
      varianceLabel,
      favorable,
      color: metric.color || COLORS[index % COLORS.length]
    };
  }

  function currentPage() {
    return pages.find(page => page.id === state.page) || pages[0];
  }

  function currentMetrics() {
    return metricsFor(currentPage()).map(computedMetric);
  }

  function seriesFor(metric, index) {
    if (metric.series?.length) return metric.series.map(value => adjustedNumeric(metric, value).value);
    const seed = stableHash(`${CONFIG.no || CONFIG.id}-${metric.key}-${state.year}-${state.scenario}`);
    return Array.from({ length: 12 }, (_, month) => {
      const progress = .72 + month * .026;
      const wave = Math.sin((month + (seed % 7)) * .72) * .025;
      const noise = ((stableHash(`${seed}-${month}`) % 19) - 9) / 1000;
      return metric.actual * (progress + wave + noise + index * .002);
    });
  }

  function sparkSvg(metric) {
    const values = seriesFor(metric, metric.index);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(.001, max - min);
    const points = values.map((value, index) => `${index * (216 / Math.max(1, values.length - 1))},${23 - ((value - min) / range) * 19}`).join(" ");
    return `<svg class="spark" viewBox="0 0 216 26" preserveAspectRatio="none" aria-hidden="true"><path d="M0 23H216" stroke="#d5cde6" stroke-width="1"/><polyline points="${points}" fill="none" stroke="${metric.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function trendSvg(metrics) {
    const primary = metrics[0];
    const actual = seriesFor(primary, 0);
    const plan = actual.map((value, index) => value / (.96 + index * .0035));
    const forecast = actual.map((value, index) => value * (index < 5 ? 1 : 1.015 + (index - 5) * .006));
    const all = [...actual, ...plan, ...forecast];
    const min = Math.min(...all) * .97;
    const max = Math.max(...all) * 1.03;
    const range = Math.max(.001, max - min);
    const points = values => values.map((value, index) => `${8 + index * (384 / 11)},${106 - ((value - min) / range) * 87}`).join(" ");
    return `
      <div class="legend">
        <span><i style="--dot:${COLORS[0]}"></i>Actual</span>
        <span><i style="--dot:${COLORS[6]}"></i>Plan</span>
        <span><i style="--dot:${COLORS[5]}"></i>Forecast</span>
      </div>
      <svg class="chart-svg" viewBox="0 0 400 120" role="img" aria-label="Actual, plan, and forecast trend">
        <g stroke="#d7cfe4" stroke-width="1"><path d="M8 20H392"/><path d="M8 49H392"/><path d="M8 78H392"/><path d="M8 107H392"/></g>
        <polyline points="${points(plan)}" fill="none" stroke="${COLORS[6]}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="${points(forecast)}" fill="none" stroke="${COLORS[5]}" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="${points(actual)}" fill="none" stroke="${COLORS[0]}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  function renderHeader(page) {
    const header = document.createElement("header");
    header.className = "dashboard-header";
    const selectedScope = optionSets.scope.find(option => option.value === state.scope)?.label || state.scope;
    header.innerHTML = `
      <h1 class="page-title">${escapeHtml(page.title)}</h1>
      <div class="chip-row" aria-label="Active dashboard context">
        <span class="chip" style="--chip-color:${COLORS[2]}"><span>Scenario: ${escapeHtml(state.scenario)}</span></span>
        <span class="chip" style="--chip-color:${COLORS[1]}"><span>${escapeHtml(selectedScope)}</span></span>
        <span class="chip" style="--chip-color:${COLORS[0]}"><span>${escapeHtml(state.year)} view</span></span>
      </div>
      <div class="pack-id"><span>FP${String(CONFIG.no || CONFIG.project || "00").padStart(2, "0")}</span><strong>${escapeHtml(CONFIG.lens || "Finance Decision Pack")}</strong></div>`;
    return header;
  }

  function renderKpiGrid(metrics) {
    const grid = document.createElement("section");
    grid.className = "kpi-grid";
    grid.setAttribute("aria-label", "Key performance indicators");
    grid.innerHTML = metrics.map((metric, index) => `
      <article class="kpi-card" style="--accent:${metric.color}">
        <div class="kpi-head"><span class="kpi-icon">${index + 1}</span><span class="kpi-label">${escapeHtml(metric.label)}</span></div>
        <div class="kpi-value">${escapeHtml(metric.actualLabel)}</div>
        ${sparkSvg(metric)}
        <div class="kpi-foot">
          <div><span>Plan</span><b>${escapeHtml(metric.planLabel)}</b></div>
          <div class="${metric.favorable ? "good" : "bad"}"><span>Variance</span><b>${escapeHtml(metric.varianceLabel)}</b></div>
        </div>
      </article>`).join("");
    return grid;
  }

  function panel(title, subtitle, body, className) {
    const article = document.createElement("article");
    article.className = `panel ${className || ""}`.trim();
    article.innerHTML = `<h2>${escapeHtml(title)}</h2><p class="panel-subtitle">${escapeHtml(subtitle || "")}</p>${body}`;
    return article;
  }

  function inferBarFilter(barPanel) {
    if (barPanel.filter && filterElements[barPanel.filter]) return barPanel.filter;
    const labels = barPanel.items.map(item => String(item.label).toLowerCase());
    const scopeMatches = optionSets.scope.some(option => labels.includes(option.label.toLowerCase()));
    const regionMatches = optionSets.region.some(option => labels.includes(option.label.toLowerCase()));
    if (scopeMatches) return "scope";
    if (regionMatches) return "region";
    return null;
  }

  function displayBarValue(item) {
    if (item.display != null) return String(item.display);
    const absolute = Math.abs(item.value);
    if (absolute >= 1e9) return `$${(item.value / 1e9).toFixed(1)}B`;
    if (absolute >= 1e6) return `$${(item.value / 1e6).toFixed(1)}M`;
    if (absolute > 0 && absolute <= 1) return `${(item.value * 100).toFixed(1)}%`;
    return round(item.value, absolute < 100 ? 1 : 0).toLocaleString("en-US");
  }

  function renderBars(barPanel, panelIndex) {
    const barResponseFactor = yearFactor() * performanceFactor();
    const items = barPanel.items.slice(0, 5).map(item => ({ ...item, value: item.value * barResponseFactor }));
    const max = Math.max(...items.map(item => Math.abs(item.value)), 1);
    const filterKind = inferBarFilter(barPanel);
    const body = `<div class="bar-list">${items.map((item, index) => {
      const itemFilter = item.filter || filterKind;
      const filterOptions = optionSets[itemFilter] || [];
      const matchedOption = filterOptions.find(option => option.value === String(item.filterValue || item.label) || option.label === String(item.filterValue || item.label));
      const filterValue = matchedOption?.value || null;
      const canFilter = Boolean(itemFilter && filterValue);
      const active = canFilter && state[itemFilter] === filterValue;
      const attributes = canFilter
        ? `type="button" data-filter-kind="${escapeHtml(itemFilter)}" data-filter-value="${escapeHtml(filterValue)}" aria-pressed="${active}"`
        : "";
      const tag = canFilter ? "button" : "div";
      return `<${tag} class="bar-row${active ? " active" : ""}" ${attributes}>
        <span>${escapeHtml(item.label)}</span>
        <span class="bar-track"><span class="bar-fill" style="--value:${clamp(Math.abs(item.value) / max * 100, 4, 100).toFixed(1)}%;--fill:${item.color || COLORS[(panelIndex + index) % COLORS.length]}"></span></span>
        <b>${escapeHtml(displayBarValue(item))}</b>
      </${tag}>`;
    }).join("")}</div>`;
    return panel(barPanel.title, filterKind ? barPanel.subtitle : "Contribution to the current result", body, "bar-panel");
  }

  function renderMetricTable(metrics) {
    const rows = metrics.map(metric => `<tr>
      <td><span class="metric-name"><i class="metric-dot" style="--dot:${metric.color}"></i>${escapeHtml(metric.label)}</span></td>
      <td>${escapeHtml(metric.actualLabel)}</td>
      <td>${escapeHtml(metric.planLabel)}</td>
      <td class="${metric.favorable ? "variance-positive" : "variance-negative"}">${escapeHtml(metric.varianceLabel)}</td>
      <td><span class="status ${Math.abs(metric.variance) > .08 ? (metric.favorable ? "" : "risk") : Math.abs(metric.variance) > .035 ? "watch" : ""}">${metric.favorable ? "Clear" : Math.abs(metric.variance) > .08 ? "Risk" : "Watch"}</span></td>
    </tr>`).join("");
    return panel("Metric Detail", "Actual, plan, variance, and signal", `
      <table class="metric-table">
        <thead><tr><th>Metric</th><th>Actual</th><th>Plan</th><th>Variance</th><th>Signal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`, "metric-panel");
  }

  function renderDrivers(drivers) {
    const body = `<div class="driver-list">${drivers.slice(0, 4).map((driver, index) => {
      const color = driver.isRisk ? COLORS[7] : index === 1 ? COLORS[3] : COLORS[2];
      return `<div class="driver-row" style="--driver-color:${color}"><span>${escapeHtml(driver.label)}</span><b>${escapeHtml(driver.value)}</b></div>`;
    }).join("")}</div>`;
    return panel("Decision Drivers", "What moves the current conclusion", body, "driver-panel");
  }

  function statusClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (/risk|late|block|critical/.test(normalized)) return "risk";
    if (/open|watch|review|priority/.test(normalized)) return "watch";
    return "";
  }

  function initials(owner) {
    return String(owner || "FP&A").split(/\s+/).map(part => part[0]).join("").slice(0, 3);
  }

  function renderActions(actions, page) {
    const pageIndex = pages.findIndex(item => item.id === page.id);
    if (pageIndex === 1 && asArray(CONFIG.financeLogic).length) {
      const logic = asArray(CONFIG.financeLogic).slice(0, 4);
      return panel("Finance Logic", "Audit trail behind the decision", `<div class="logic-list">${logic.map((item, index) => `<div class="logic-item" data-index="${index + 1}">${escapeHtml(plainText(item, "Finance logic"))}</div>`).join("")}</div>`, "logic-panel");
    }
    const body = `<div class="action-list">${actions.slice(0, 4).map(action => `<div class="action-item">
      <span class="action-owner">${escapeHtml(initials(action.owner))}</span>
      <span class="action-copy"><b>${escapeHtml(action.action)}</b><span>${escapeHtml(action.owner)}${action.impact ? ` · ${escapeHtml(action.impact)}` : ""}</span></span>
      <span class="status ${statusClass(action.status)}">${escapeHtml(action.status)}</span>
    </div>`).join("")}</div>`;
    return panel(pageIndex === 2 ? "Risk & Owner Actions" : "Action Queue", "Owner, next move, and signal", body, "action-panel");
  }

  function renderDecision(page) {
    const pageIndex = pages.findIndex(item => item.id === page.id);
    const fallback = pageIndex === 0
      ? CONFIG.summary
      : pageIndex === 1
        ? CONFIG.financeLogic
        : CONFIG.governance;
    const question = page.source?.decisionQuestion || CONFIG.decisionQuestion || plainText(fallback, "What changed, why did it change, and who owns the next move?");
    return panel(pageIndex === 2 ? "Control Read" : "Executive Read", page.subtitle || CONFIG.lens || "Management-ready decision support", `<div class="decision-question">${escapeHtml(plainText(question, "What decision does this evidence support?"))}</div>`, "decision-panel");
  }

  function renderVisualGrid(page, metrics) {
    const barPanels = normalizeBarPanels(page);
    const grid = document.createElement("section");
    grid.className = "visual-grid";
    grid.setAttribute("aria-label", `${page.title} analysis`);
    grid.appendChild(panel(`${metrics[0].label} Trend`, `${state.year} actual, plan, and forecast`, trendSvg(metrics), "trend-panel"));
    grid.appendChild(renderBars(barPanels[0], 0));
    grid.appendChild(renderBars(barPanels[1], 2));
    grid.appendChild(renderMetricTable(metrics));
    grid.appendChild(renderDrivers(driversFor(page)));
    grid.appendChild(renderActions(actionsFor(page), page));
    return grid;
  }

  function renderPage(pageId) {
    const page = pages.find(item => item.id === pageId) || pages[0];
    state.page = page.id;
    const metrics = metricsFor(page).map(computedMetric);
    content.replaceChildren(renderHeader(page), renderKpiGrid(metrics), renderVisualGrid(page, metrics));
    nav.querySelectorAll("button[data-page]").forEach((button) => {
      const active = button.dataset.page === page.id;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
    const asOf = dashboard.querySelector(".as-of, .preview-as-of");
    if (asOf) asOf.textContent = `Synthetic portfolio data · ${state.year}`;
    updateQaState();
    window.requestAnimationFrame(updateQaState);
  }

  function setPage(pageId) {
    const page = pages.find(item => item.id === pageId);
    if (!page) return false;
    renderPage(page.id);
    return true;
  }

  function normalizeFilterKey(key) {
    const normalized = String(key || "").toLowerCase();
    if (["year", "fiscalyear", "period"].includes(normalized)) return "year";
    if (["scenario", "case"].includes(normalized)) return "scenario";
    if (["scope", "businessunit", "business-unit", "segment", "channel", "portfolio"].includes(normalized)) return "scope";
    if (["region", "market", "geography"].includes(normalized)) return "region";
    return null;
  }

  function setFilter(key, value) {
    const normalizedKey = normalizeFilterKey(key);
    if (!normalizedKey) return false;
    const stringValue = String(value);
    if (!optionSets[normalizedKey].some(option => option.value === stringValue)) {
      const exactLabel = optionSets[normalizedKey].find(option => option.label === stringValue);
      if (!exactLabel) return false;
      state[normalizedKey] = exactLabel.value;
    } else {
      state[normalizedKey] = stringValue;
    }
    syncControls();
    renderPage(state.page);
    return true;
  }

  function resetFilters() {
    Object.assign(state, defaults);
    syncControls();
    renderPage(state.page);
    return { ...state };
  }

  function getRows() {
    return currentMetrics().map(metric => ({
      key: metric.key,
      label: metric.label,
      actual: metric.actual,
      actualLabel: metric.actualLabel,
      plan: metric.plan,
      planLabel: metric.planLabel,
      variance: metric.variance,
      varianceLabel: metric.varianceLabel,
      favorable: metric.favorable
    }));
  }

  function getSummary() {
    const page = currentPage();
    return {
      project: CONFIG.no || CONFIG.id || null,
      title: CONFIG.title || "Finance Decision Product",
      lens: CONFIG.lens || "Finance Decision Pack",
      page: { id: page.id, title: page.title },
      filters: { year: state.year, scenario: state.scenario, scope: state.scope, region: state.region },
      factor: round(stateFactor(), 4),
      metrics: getRows(),
      decisionQuestion: plainText(CONFIG.decisionQuestion, "")
    };
  }

  function fillSelect(key) {
    const select = filterElements[key];
    if (!select) return;
    select.innerHTML = optionSets[key].map(option => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("");
    select.value = state[key];
  }

  function syncControls() {
    Object.keys(filterElements).forEach((key) => {
      if (filterElements[key]) filterElements[key].value = state[key];
    });
  }

  function updateScopeLabel() {
    const select = filterElements.scope;
    if (!select) return;
    const wrapper = select.closest("label");
    const explicitLabel = document.querySelector('label[for="scopeFilter"]');
    const label = explicitLabel?.contains(select)
      ? explicitLabel.querySelector(".filter-label, span:first-child")
      : explicitLabel || wrapper?.querySelector(".filter-label, span:first-child");
    if (label) label.textContent = CONFIG.scopeLabel || findFilterConfig("scope").label || "Scope";
  }

  function prepareSidebar() {
    const aside = dashboard.querySelector("aside");
    if (!aside) return;
    aside.classList.add("sidebar");
    if (!aside.querySelector(".signature, .preview-brand")) {
      const brand = document.createElement("div");
      brand.className = "preview-brand";
      brand.innerHTML = `<span class="preview-brand-mark">AT</span><span class="preview-brand-copy"><b>TDAT</b><small>${escapeHtml(CONFIG.lens || "Finance × AI")}</small></span>`;
      aside.prepend(brand);
    }
    if (!aside.querySelector(".rail-line")) {
      const line = document.createElement("div");
      line.className = "rail-line";
      nav.insertAdjacentElement("afterend", line);
    }
    if (!aside.querySelector(".as-of, .preview-as-of")) {
      const asOf = document.createElement("div");
      asOf.className = "preview-as-of";
      asOf.textContent = `Synthetic portfolio data · ${state.year}`;
      aside.appendChild(asOf);
    }
    Object.values(filterElements).filter(Boolean).forEach(select => select.classList.add("slicer"));
    resetButton?.classList.add("reset-btn");
  }

  function initNavigation() {
    nav.classList.add("nav");
    nav.innerHTML = pages.map((page, index) => `<button type="button" data-page="${escapeHtml(page.id)}"><span>${escapeHtml(/^\d+/.test(page.label) ? page.label : `0${index + 1} ${page.label}`)}</span></button>`).join("");
    nav.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-page]");
      if (button) setPage(button.dataset.page);
    });
  }

  function initControls() {
    Object.keys(filterElements).forEach((key) => {
      fillSelect(key);
      filterElements[key]?.addEventListener("change", event => setFilter(key, event.target.value));
    });
    resetButton?.addEventListener("click", resetFilters);
    updateScopeLabel();
  }

  function fitDashboard() {
    const frameStyle = window.getComputedStyle(frame);
    const horizontalPadding = (Number.parseFloat(frameStyle.paddingLeft) || 0) + (Number.parseFloat(frameStyle.paddingRight) || 0);
    const availableWidth = Math.max(320, frame.clientWidth - horizontalPadding);
    const naturalScale = availableWidth / 1280;
    const mobileReadableFloor = availableWidth < 720 ? 0.58 : 0;
    const viewportAspect = window.innerWidth / Math.max(1, window.innerHeight);
    const highDensityCap = viewportAspect <= 2 && window.innerWidth >= 3200 && window.innerHeight >= 1800
      ? 2
      : viewportAspect <= 2 && window.innerWidth >= 2200 && window.innerHeight >= 1200
        ? 4 / 3
        : 1;
    const scale = Math.min(highDensityCap, Math.max(naturalScale, mobileReadableFloor));
    document.documentElement.style.setProperty("--dashboard-scale", scale.toFixed(5));
    shell.style.width = `${1280 * scale}px`;
    shell.style.height = `${720 * scale}px`;
    updateQaState();
    window.requestAnimationFrame(updateQaState);
    return scale;
  }

  function overflowDetails() {
    const candidates = document.querySelectorAll("#projectNav button,.slicer,.chip,.kpi-card,.kpi-value,.kpi-label,.page-title,.panel h2,.panel-subtitle,.bar-row span,.bar-row b,.driver-row span,.action-copy b,.action-copy span,.logic-item,.decision-question,th,td,.status");
    const visible = Array.from(candidates).filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (rect.width < 1 || rect.height < 1 || style.display === "none" || style.visibility === "hidden") return false;
      const clips = /(hidden|clip)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`);
      return clips && (element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2);
    }).map(element => ({
      selector: element.id ? `#${element.id}` : `.${String(element.className || element.tagName).trim().replace(/\s+/g, ".")}`,
      text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
      horizontalPx: Math.max(0, element.scrollWidth - element.clientWidth),
      verticalPx: Math.max(0, element.scrollHeight - element.clientHeight)
    }));
    return visible;
  }

  function updateQaState() {
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dashboard-scale")) || 1;
    const visibleOverflow = overflowDetails();
    const shellRect = shell.getBoundingClientRect();
    const dashboardRect = dashboard.getBoundingClientRect();
    window.__dashboardQa = {
      ready: true,
      project: CONFIG.no || CONFIG.id || null,
      activePage: state.page,
      filters: { year: state.year, scenario: state.scenario, scope: state.scope, region: state.region },
      counts: {
        pages: pages.length,
        navigationButtons: nav.querySelectorAll("button[data-page]").length,
        filterControls: Object.values(filterElements).filter(Boolean).length,
        kpiCards: content.querySelectorAll(".kpi-card").length,
        panels: content.querySelectorAll(".panel").length,
        tables: content.querySelectorAll("table").length,
        svgVisuals: content.querySelectorAll("svg").length,
        clickableBars: content.querySelectorAll("button.bar-row").length
      },
      scale: {
        dashboard: scale,
        baseWidth: 1280,
        baseHeight: 720,
        renderedWidth: Math.round(dashboardRect.width),
        renderedHeight: Math.round(dashboardRect.height)
      },
      overflow: {
        visible: visibleOverflow,
        visibleCount: visibleOverflow.length,
        bodyHorizontalPx: Math.max(0, Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth),
        frameHorizontalPx: Math.max(0, frame.scrollWidth - frame.clientWidth),
        shellWidthDeltaPx: Math.round(Math.abs(shellRect.width - dashboardRect.width)),
        shellHeightDeltaPx: Math.round(Math.abs(shellRect.height - dashboardRect.height))
      },
      pages: pages.length,
      navigationButtons: nav.querySelectorAll("button[data-page]").length,
      filterControls: Object.values(filterElements).filter(Boolean).length,
      kpiCards: content.querySelectorAll(".kpi-card").length,
      panels: content.querySelectorAll(".panel").length,
      dashboardScale: scale,
      visibleOverflow,
      bodyOverflowPx: Math.max(0, Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth)
    };
    return window.__dashboardQa;
  }

  content.addEventListener("click", (event) => {
    const target = event.target.closest("[data-filter-kind][data-filter-value]");
    if (target) setFilter(target.dataset.filterKind, target.dataset.filterValue);
  });

  window.previewActions = { setPage, setFilter, resetFilters, getSummary, getRows };
  dashboard.setAttribute("role", "application");
  dashboard.setAttribute("aria-label", `${CONFIG.title || "Finance decision product"} interactive dashboard preview`);
  prepareSidebar();
  initNavigation();
  initControls();
  renderPage(pages[0].id);
  fitDashboard();
  window.addEventListener("resize", fitDashboard, { passive: true });
  if (typeof ResizeObserver === "function") new ResizeObserver(fitDashboard).observe(frame);
  window.addEventListener("load", () => {
    fitDashboard();
    window.setTimeout(updateQaState, 80);
  }, { once: true });
}());
