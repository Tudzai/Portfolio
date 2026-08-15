(() => {
  "use strict";

  const data = window.HUB_DATA;
  const shell = document.querySelector(".hub-shell");
  const sidebar = document.querySelector(".hub-sidebar");
  const workspace = document.querySelector(".hub-workspace");
  const sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  const sidebarClose = document.querySelector("[data-sidebar-close]");
  const sidebarBackdrop = document.querySelector("[data-sidebar-backdrop]");
  const sidebarResizer = document.querySelector(".hub-sidebar-resizer");
  const panel = document.querySelector("#hub-panel");
  const tabs = Array.from(document.querySelectorAll("[data-module]"));
  const scopeSummary = document.querySelector("#scope-summary");
  const exportHost = document.querySelector("#hub-export");
  const simulationStatus = document.querySelector("#simulation-status");
  const previewDialog = document.querySelector("#hub-preview-dialog");
  const previewTitle = document.querySelector("#preview-title");
  const previewEyebrow = document.querySelector("#preview-eyebrow");
  const previewContent = document.querySelector("#preview-content");
  const previewDownload = document.querySelector("#preview-download");

  if (!data || !shell || !panel) return;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const moduleMeta = {
    center: ["Workspace", "Center"],
    overview: ["Review", "Overview"],
    variance: ["Explain", "Variance Analysis"],
    planning: ["Plan", "Budget & Forecast"],
    pnl: ["Review", "Profit & Loss statement"],
    todo: ["Act", "To do list"],
    data: ["Control", "Data Control"],
    admin: ["Workspace", "Admin"],
  };
  const analyticModules = new Set(["overview", "variance", "planning", "pnl"]);
  const services = ["All services", "Export Air", "Export Sea", "Import Air", "Import Sea", "Logistics"];
  const branches = ["All branches", "Ho Chi Minh", "Hanoi", "Da Nang", "Other"];
  const countries = ["All countries", ...new Set(data.overviewCustomers.map((item) => item.country))];
  const periodOptions = Array.from({ length: 18 }, (_, index) => {
    const absoluteMonth = 2025 * 12 + index;
    const year = Math.floor(absoluteMonth / 12);
    const month = absoluteMonth % 12;
    return `${data.months[month]} ${year}`;
  });
  const filterDefaults = {
    overview: { start: "Jan 2025", end: "Jun 2026", country: "All countries", service: "All services", branch: "All branches" },
    variance: { year: "2026", reportMonth: "Jun", country: "All countries", service: "All services", branch: "All branches" },
    planning: { year: "2026", country: "Vietnam", branch: "All branches", scenario: "Base case" },
    pnl: { start: "Jan 2026", end: "Jun 2026", country: "Vietnam", service: "All services", branch: "All branches" },
  };
  const filters = clone(filterDefaults);
  const tasks = clone(data.tasks);
  const dataYears = clone(data.dataYears);
  const people = data.adminUsers.map((person, index) => ({ ...person, id: index + 1 }));
  const auditEvents = clone(data.auditEvents);
  const chartZoom = { revenue: 1, grossProfit: 1, sga: 1 };
  const selectedMonths = new Set();

  let currentModule = "center";
  let taskFilter = "all";
  let taskSort = "deadline";
  let taskSortDirection = 1;
  let taskFormOpen = false;
  let expandedTaskId = null;
  let editingTaskId = null;
  let selectedCustomer = null;
  let selectedCost = null;
  let varianceCustomerMetric = "Revenue";
  let planningMetric = "Revenue";
  let salaryExpanded = true;
  let otherSgaExpanded = true;
  let dataCountry = "Vietnam";
  let openYear = "2026";
  let expandedSource = null;
  let auditFilter = "All profiles";
  let exportMenuOpen = false;
  let toastMessage = "";
  let nextTaskId = Math.max(...tasks.map((task) => task.id)) + 1;
  let nextPersonId = people.length + 1;
  let activePreview = null;
  let previewReturnFocus = null;
  let confirmAction = null;
  let confirmReturnFocus = null;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);

  function capture(eventName, properties = {}) {
    if (window.portfolioAnalytics && typeof window.portfolioAnalytics.capture === "function") window.portfolioAnalytics.capture(eventName, properties);
    else if (typeof window.trackPortfolioEvent === "function") window.trackPortfolioEvent(eventName, properties);
    else if (typeof window.plausible === "function") window.plausible(eventName, { props: properties });
  }

  function setToast(message) {
    toastMessage = message;
  }

  function toastMarkup() {
    return toastMessage
      ? `<div class="hub-toast" role="status"><span>${escapeHtml(toastMessage)}</span><button type="button" data-dismiss-toast aria-label="Dismiss notification">&times;</button></div>`
      : "";
  }

  function pageHeading(stage, title, action = "") {
    return `<div class="module-intro"><div><span class="hub-eyebrow">${escapeHtml(stage)}</span><h1>${escapeHtml(title)}</h1></div>${action}</div>`;
  }

  function signalTone(value, label = "") {
    const positive = String(value).trim().startsWith("+");
    const costMetric = /cost|sg&a|depreciation/i.test(label);
    return positive !== costMetric ? "good" : "watch";
  }

  function numericValue(value) {
    const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function forecastVariance(kpi) {
    const actual = numericValue(kpi.value);
    const forecast = numericValue(kpi.forecast);
    if (actual === null || forecast === null || forecast === 0) return "—";
    if (kpi.label === "Gross Margin") {
      const variance = actual - forecast;
      return `${variance >= 0 ? "+" : ""}${variance.toFixed(1)} pp`;
    }
    const variance = ((actual - forecast) / Math.abs(forecast)) * 100;
    return `${variance >= 0 ? "+" : ""}${variance.toFixed(1)}%`;
  }

  function sparkline(values, label = "Trend") {
    const width = 108;
    const height = 38;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const points = values.map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - 3 - ((value - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `<svg class="spark" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label)}"><polyline points="${points}"></polyline></svg>`;
  }

  function selectMarkup(module, key, label, values) {
    const current = filters[module][key];
    return `<label class="scope-control"><span>${escapeHtml(label)}</span><select data-scope-filter="${key}" aria-label="${escapeHtml(label)}">${values.map((value) => `<option${value === current ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>`;
  }

  function scopeControls(module) {
    if (module === "overview") return `<div class="scope-grid overview-scope">
      ${selectMarkup(module, "start", "Start", periodOptions)}
      ${selectMarkup(module, "end", "To", periodOptions)}
      ${selectMarkup(module, "country", "Country", countries)}
      ${selectMarkup(module, "service", "Service", services)}
      ${selectMarkup(module, "branch", "Branch", branches)}
    </div>`;
    if (module === "variance") return `<div class="scope-grid variance-filter-grid">
      ${selectMarkup(module, "year", "Year", ["2025", "2026"])}
      ${selectMarkup(module, "reportMonth", "Report month", data.months)}
      ${selectMarkup(module, "country", "Country", countries)}
      ${selectMarkup(module, "service", "Service", services)}
      ${selectMarkup(module, "branch", "Branch", branches)}
    </div>`;
    if (module === "planning") return `<div class="scope-grid four">
      ${selectMarkup(module, "year", "Year", ["2025", "2026"])}
      ${selectMarkup(module, "country", "Country", countries.filter((item) => item !== "All countries"))}
      ${selectMarkup(module, "branch", "Branch", branches)}
      ${selectMarkup(module, "scenario", "Scenario", ["Base case", "Upside", "Downside"])}
    </div>`;
    return `<div class="scope-grid">
      ${selectMarkup(module, "start", "Start", periodOptions)}
      ${selectMarkup(module, "end", "To", periodOptions)}
      ${selectMarkup(module, "country", "Country", countries.filter((item) => item !== "All countries"))}
      ${selectMarkup(module, "service", "Service", services)}
      ${selectMarkup(module, "branch", "Branch", branches)}
    </div>`;
  }

  function activeFilterMarkup() {
    if (currentModule !== "overview") return "";
    const defaults = filterDefaults.overview;
    const active = Object.entries(filters.overview).filter(([key, value]) => value !== defaults[key]);
    if (selectedMonths.size) active.push(["months", [...selectedMonths].join(", ")]);
    if (selectedCustomer) active.push(["customer", selectedCustomer]);
    if (selectedCost) active.push(["cost", selectedCost]);
    if (!active.length) return "";
    return `<div class="active-filters" aria-label="Active filters">${active.map(([key, value]) => `<button class="filter-chip" type="button" data-clear-filter="${key}">${escapeHtml(value)} <span aria-hidden="true">&times;</span></button>`).join("")}<button class="clear-filters" type="button" data-clear-filter="all">Clear all</button></div>`;
  }

  function centerView() {
    return `${pageHeading("Workspace center", "FP&A Team Hub")}<div class="center-modules">${data.modules.map((module) => `
      <button class="center-card source-style" type="button" data-open-module="${module.id}">
        <h2>${escapeHtml(module.title)}</h2><span class="module-bars" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>`).join("")}</div>${toastMarkup()}`;
  }

  function kpiMarkup() {
    return `<div class="kpi-grid">${data.kpis.map((kpi) => `<article class="kpi-card">
      <div class="kpi-label"><span>${escapeHtml(kpi.label)}</span><small>Jan&ndash;Jun 2026</small></div>
      <div class="kpi-main"><strong>${escapeHtml(kpi.value)}</strong>${sparkline(kpi.trend, `${kpi.label} trend`)}</div>
      <div class="kpi-comps comparison-list">
        <span class="comparison-row"><i class="comparison-tag">Budget</i><b>${escapeHtml(kpi.budget)}</b><em class="tone-${signalTone(kpi.variance, kpi.label)}">${escapeHtml(kpi.variance)}</em></span>
        <span class="comparison-row"><i class="comparison-tag">Forecast</i><b>${escapeHtml(kpi.forecast)}</b><em class="tone-${signalTone(forecastVariance(kpi), kpi.label)}">${escapeHtml(forecastVariance(kpi))}</em></span>
      </div>
    </article>`).join("")}</div>`;
  }

  function linePoints(series, key, max, width, height, left, top) {
    const plotWidth = width - left * 2;
    const plotHeight = height - top - 38;
    return series.map((item, index) => {
      const x = left + ((index + 0.5) / Math.max(series.length, 1)) * plotWidth;
      const y = top + plotHeight - (item[key] / max) * plotHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }

  function monthlyChart(key, title, series) {
    const width = 840;
    const height = 250;
    const left = 38;
    const top = 20;
    const plotHeight = height - top - 38;
    const max = Math.max(...series.flatMap((item) => [item.actual, item.forecast, ...(item.priorYearAvailable ? [item.priorYear] : [])])) * 1.12;
    const step = (width - left * 2) / series.length;
    const xFor = (index) => left + (index + 0.5) * step;
    const yFor = (value) => top + plotHeight - (value / max) * plotHeight;
    const zoom = chartZoom[key];
    return `<article class="hub-card monthly-chart">
      <div class="hub-card-head"><div><h2>${escapeHtml(title)}</h2><p>Actual &middot; Forecast &middot; Prior year</p></div>
        <div class="chart-toolbar" aria-label="${escapeHtml(title)} zoom"><button type="button" data-chart-zoom="${key}" data-direction="-1" aria-label="Zoom out">&minus;</button><button type="button" data-chart-zoom="${key}" data-direction="0">${Math.round(zoom * 100)}%</button><button type="button" data-chart-zoom="${key}" data-direction="1" aria-label="Zoom in">+</button></div>
      </div>
      <div class="chart-legend" aria-hidden="true"><span class="actual">Actual</span><span class="forecast">Forecast</span><span class="prior">Prior year</span></div>
      <div class="chart-scroll"><svg class="chart-svg" style="min-width:${Math.round(width * zoom)}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)} monthly comparison">
        ${[0.25, 0.5, 0.75, 1].map((ratio) => `<line class="grid-line" x1="${left}" x2="${width - left}" y1="${top + plotHeight * (1 - ratio)}" y2="${top + plotHeight * (1 - ratio)}"></line>`).join("")}
        ${series.map((item, index) => {
          const barWidth = Math.min(48, step * 0.46);
          const x = xFor(index) - barWidth / 2;
          const barHeight = (item.actual / max) * plotHeight;
          const dimmed = selectedMonths.size && !selectedMonths.has(item.month);
          return `<g class="chart-bar ${dimmed ? "is-dimmed" : ""}"><rect x="${x}" y="${top + plotHeight - barHeight}" width="${barWidth}" height="${barHeight}" rx="4"></rect><text x="${xFor(index)}" y="${height - 12}" text-anchor="middle">${item.month}</text></g>`;
        }).join("")}
        <polyline class="chart-line forecast" points="${linePoints(series, "forecast", max, width, height, left, top)}"></polyline>
        <polyline class="chart-line prior" points="${linePoints(series, "priorYear", max, width, height, left, top)}"></polyline>
        ${series.map((item, index) => `<circle class="chart-point forecast" cx="${xFor(index)}" cy="${yFor(item.forecast)}" r="3.4"></circle>${item.priorYearAvailable ? `<circle class="chart-point prior" cx="${xFor(index)}" cy="${yFor(item.priorYear)}" r="3.4"></circle>` : ""}`).join("")}
      </svg></div>
      <div class="chart-month-buttons" aria-label="Cross-filter by month">${series.map((item) => {
        const details = `${item.month}: Actual $${item.actual.toFixed(1)}M; Forecast $${item.forecast.toFixed(1)}M; ${item.priorYearAvailable ? `Prior year $${item.priorYear.toFixed(1)}M` : "Prior year unavailable"}`;
        return `<button type="button" data-chart-key="${key}" data-chart-month="${item.month}" aria-label="${escapeHtml(details)}" title="${escapeHtml(details)}" aria-pressed="${selectedMonths.has(item.month)}"><span>${item.month}</span></button>`;
      }).join("")}</div>
    </article>`;
  }

  function rankCard(title, subtitle, rows, filterType, cardKey = filterType) {
    const selected = filterType === "service" ? filters.overview.service : filterType === "branch" ? filters.overview.branch : selectedCost;
    const hasSelection = selected && !String(selected).startsWith("All ");
    return `<article class="hub-card ranking-card"><div class="hub-card-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div></div><div class="ranking-list">${rows.map((item) => `<button class="rank-row ${selected === item.label ? "row-selected" : hasSelection ? "is-dimmed" : ""}" type="button" data-rank-card="${escapeHtml(cardKey)}" data-rank-type="${filterType}" data-rank-filter="${escapeHtml(item.label)}" aria-pressed="${selected === item.label}"><span>${escapeHtml(item.label)}</span><span class="rank-track"><i style="width:${item.percent}%"></i></span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.share)}</small></button>`).join("")}</div></article>`;
  }

  function customerTableMarkup() {
    const country = filters.overview.country;
    const rows = data.overviewCustomers.filter((item) => country === "All countries" || item.country === country);
    return `<article class="hub-card customer-card"><div class="hub-card-head"><div><h2>Profit by customer</h2></div><span class="signal">${rows.length} customers</span></div>
      <div class="table-wrap"><table class="hub-table customer-table"><thead><tr><th>Rank</th><th>Customer</th><th>Country</th><th>Gross profit</th><th>Margin</th><th>Profit trend</th></tr></thead><tbody>${rows.map((row) => `<tr tabindex="0" role="button" data-customer="${escapeHtml(row.customer)}" class="${selectedCustomer === row.customer ? "row-selected" : selectedCustomer ? "dimmed" : ""}" aria-selected="${selectedCustomer === row.customer}"><td>${row.rank}</td><td><strong>${escapeHtml(row.customer)}</strong></td><td>${escapeHtml(row.country)}</td><td>${escapeHtml(row.grossProfit)}</td><td>${escapeHtml(row.margin)}</td><td class="customer-trend-cell">${sparkline(row.sparkline, `${row.customer} profit trend`)}<span class="tone-${signalTone(row.trend)}">${escapeHtml(row.trend)}</span></td></tr>`).join("")}</tbody></table></div>
    </article>`;
  }

  function overviewView() {
    return `${pageHeading("Performance overview", "Overview")}${scopeControls("overview")}${activeFilterMarkup()}<section class="kpi-section"><div class="section-toolbar"><h2>KPI summary</h2></div>${kpiMarkup()}</section>
      <div class="overview-charts">${monthlyChart("revenue", "Revenue by month", data.series.revenue)}${monthlyChart("grossProfit", "Gross profit by month", data.series.grossProfit)}</div>
      <div class="overview-rankings">${rankCard("Revenue mix", "Service contribution", data.revenueMix, "service", "revenue-mix")}${rankCard("Gross profit by service", "Ranked contribution", data.rankings.services, "service", "service-profit")}${rankCard("Gross profit by branch", "Ranked contribution", data.rankings.branches, "branch", "branch-profit")}</div>
      <div class="overview-charts">${monthlyChart("sga", "Other SG&A by month", data.series.sga)}${rankCard("Detailed SG&A", "Cost categories", data.rankings.sgaCosts, "cost", "sga-cost")}</div>
      ${customerTableMarkup()}${toastMarkup()}`;
  }

  function varianceMatrix(metric) {
    return `<article class="hub-card variance-matrix metric-variance-card"><div class="hub-card-head"><div><span class="hub-eyebrow">${escapeHtml(metric.name)}</span><h2>${escapeHtml(metric.name)}</h2></div></div><div class="table-wrap"><table class="hub-table analysis-matrix combined-variance-table"><thead><tr><th>Measure</th>${data.months.map((month) => `<th>${month}</th>`).join("")}</tr></thead><tbody>${metric.rows.map((row) => `<tr class="${/^Vs /i.test(row.label) ? "comparison variance-row" : ""}"><td><strong>${escapeHtml(row.label)}</strong></td>${data.months.map((month, index) => { const value = row.values[index % row.values.length]; return `<td data-month="${month}" class="${String(value).startsWith("+") ? "tone-good" : String(value).startsWith("-") ? "tone-watch" : ""}">${escapeHtml(value)}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div></article>`;
  }

  function varianceCustomerMarkup() {
    const toggle = `<div class="secondary-toggle" role="group" aria-label="Customer analysis metric"><button type="button" data-variance-customer="Revenue" aria-pressed="${varianceCustomerMetric === "Revenue"}">Revenue</button><button type="button" data-variance-customer="Gross profit" aria-pressed="${varianceCustomerMetric === "Gross profit"}">Gross profit</button></div>`;
    if (varianceCustomerMetric === "Gross profit") return `<article class="hub-card customer-card customer-analysis-card"><div class="hub-card-head customer-analysis-head"><div><span class="hub-eyebrow">Customer analysis</span><h2>Gross profit</h2></div>${toggle}</div><div class="empty-data-state"><strong>Monthly detail unavailable</strong><p>The local mock fixture does not include customer-level gross profit history.</p></div></article>`;
    return `<article class="hub-card customer-card customer-analysis-card"><div class="hub-card-head customer-analysis-head"><div><span class="hub-eyebrow">Customer analysis</span><h2>Revenue</h2></div>${toggle}</div><div class="table-wrap"><table class="hub-table customer-table"><thead><tr><th>Rank</th><th>Customer</th><th>Country</th><th>Period total</th><th>Monthly average</th><th>Volatility</th><th>Latest month</th><th>Latest change</th><th>Sparkline</th></tr></thead><tbody>${data.varianceCustomers.map((row) => `<tr><td>${row.rank}</td><td><strong>${escapeHtml(row.customer)}</strong></td><td>${escapeHtml(row.country)}</td><td>${escapeHtml(row.periodTotal)}</td><td>${escapeHtml(row.monthlyAverage)}</td><td>${escapeHtml(row.volatility)}</td><td>${escapeHtml(row.latestMonth)}</td><td class="tone-${signalTone(row.latestChange)}">${escapeHtml(row.latestChange)}</td><td>${sparkline(row.sparkline, `${row.customer} revenue trend`)}</td></tr>`).join("")}</tbody></table></div></article>`;
  }

  function varianceView() {
    return `${pageHeading("Explain", "Variance Analysis")}${scopeControls("variance")}<div class="variance-stack">${data.varianceMetrics.map(varianceMatrix).join("")}</div>${varianceCustomerMarkup()}${toastMarkup()}`;
  }

  const percentage = (actual, baseline) => {
    if (!baseline) return "-";
    const value = ((actual - baseline) / baseline) * 100;
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  function seriesMatrix(series, ratio = false) {
    const rows = ["actual", "budget", "forecast"].map((key) => ({
      label: key[0].toUpperCase() + key.slice(1),
      values: series.map((item) => ratio ? `${item[key].toFixed(1)}%` : item[key].toFixed(1)),
    }));
    rows.push({ label: "Actual vs Budget", values: series.map((item) => percentage(item.actual, item.budget)) });
    rows.push({ label: "Actual vs Forecast", values: series.map((item) => percentage(item.actual, item.forecast)) });
    return rows;
  }

  function planningTable(rows, title, unit) {
    return `<article class="hub-card planning-detail"><div class="hub-card-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(unit)}</p></div><span class="signal">Local fixture</span></div><div class="table-wrap"><table class="hub-table"><thead><tr><th>Scenario</th>${data.months.map((month) => `<th>${month}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr class="${row.label.includes("vs") ? "comparison" : ""}"><td><strong>${escapeHtml(row.label)}</strong></td>${row.values.map((value) => `<td class="${String(value).startsWith("+") ? "tone-good" : String(value).startsWith("-") ? "tone-watch" : ""}">${escapeHtml(value)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></article>`;
  }

  function planningSgaMarkup() {
    const salaryRows = data.planningSgaRows.slice(0, 5);
    const otherRows = data.planningSgaRows.slice(5, 10);
    const total = data.planningSgaRows[10];
    const detailRows = (rows, expanded) => expanded ? rows.map((row, index) => `<tr class="${index === rows.length - 1 ? "subtotal sga-subtotal" : ""}"><td class="sga-account-indent">${escapeHtml(row.label)}</td><td>${escapeHtml(row.actual)}</td><td>${escapeHtml(row.budget)}</td><td>${escapeHtml(row.forecast)}</td></tr>`).join("") : "";
    const groupRow = (name, detail, totalValue, expanded, key) => `<tr class="sga-group-row"><td colspan="4"><button class="sga-group-toggle" type="button" data-sga-group="${key}" aria-expanded="${expanded}"><i aria-hidden="true">${expanded ? "&minus;" : "+"}</i><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(detail)}</small></span><b>${escapeHtml(totalValue)}</b></button></td></tr>`;
    return `<article class="hub-card planning-detail planning-sga-shell"><div class="hub-card-head"><div><h2>Detailed SG&A</h2><p>Actual, budget, and forecast by department and account</p></div></div><div class="table-wrap"><table class="hub-table planning-sga-table"><thead><tr><th>Account / Department</th><th>Actual</th><th>Budget</th><th>Forecast</th></tr></thead><tbody>
      ${groupRow("Salary by Department", "Compensation accounts", salaryRows.at(-1).actual, salaryExpanded, "salary")}${detailRows(salaryRows, salaryExpanded)}
      ${groupRow("Other SG&A by Account", "Operating expense accounts", otherRows.at(-1).actual, otherSgaExpanded, "other")}${detailRows(otherRows, otherSgaExpanded)}
      <tr class="total sga-grand-total"><td>${escapeHtml(total.label)}</td><td>${escapeHtml(total.actual)}</td><td>${escapeHtml(total.budget)}</td><td>${escapeHtml(total.forecast)}</td></tr>
    </tbody></table></div></article>`;
  }

  function planningFigureData() {
    if (planningMetric === "Revenue") return data.planningFigures;
    const kpiLabel = planningMetric === "Total SG&A" ? "SG&A" : planningMetric;
    const kpi = data.kpis.find((item) => item.label === kpiLabel);
    if (!kpi) return data.planningFigures;
    return [
      { label: "Actual", value: kpi.value, detail: "Jan–Jun 2026" },
      { label: "Budget", value: kpi.budget, detail: "Current plan" },
      { label: "vs Budget", value: kpi.variance, detail: "Actual variance" },
      { label: "Forecast", value: kpi.forecast, detail: "Latest outlook" },
      { label: "vs Forecast", value: forecastVariance(kpi), detail: "Actual variance" },
    ];
  }

  function grossMarginSeries() {
    return data.series.revenue.map((revenue, index) => ({
      actual: (data.series.grossProfit[index].actual / revenue.actual) * 100,
      budget: (data.series.grossProfit[index].budget / revenue.budget) * 100,
      forecast: (data.series.grossProfit[index].forecast / revenue.forecast) * 100,
    }));
  }

  function planningBody() {
    if (planningMetric === "Revenue") return planningTable(data.planningRows, "Revenue scenario matrix", "$M");
    if (planningMetric === "Gross Profit") return planningTable(seriesMatrix(data.series.grossProfit), "Gross Profit scenario matrix", "$M &middot; derived from exact mock series");
    if (planningMetric === "Gross Margin") return planningTable(seriesMatrix(grossMarginSeries(), true), "Gross Margin scenario matrix", "% &middot; calculated from exact mock series");
    if (planningMetric === "Total SG&A") return planningTable(seriesMatrix(data.series.sga), "Total SG&A plan", "$M · derived from exact mock series");
    const kpi = data.kpis.find((item) => item.label === planningMetric);
    return `<article class="hub-card planning-detail"><div class="hub-card-head"><div><h2>${escapeHtml(planningMetric)}</h2><p>Fixture summary</p></div></div><div class="figure-flow compact"><article class="figure-card"><span>Actual</span><strong>${escapeHtml(kpi?.value || "-")}</strong></article><article class="figure-card"><span>Budget</span><strong>${escapeHtml(kpi?.budget || "-")}</strong></article><article class="figure-card"><span>Forecast</span><strong>${escapeHtml(kpi?.forecast || "-")}</strong></article></div><div class="empty-data-state"><strong>Monthly detail unavailable</strong><p>mockData.ts includes the KPI snapshot, but not a monthly planning matrix for this metric.</p></div></article>`;
  }

  function planningView() {
    const metrics = ["Revenue", "Gross Profit", "Gross Margin", "Employee Cost", "Total SG&A", "EBITDA", "Depreciation", "EBIT"];
    const sgaActive = planningMetric === "Total SG&A";
    return `${pageHeading("Plan", "Budget & Forecast")}<div class="metric-tabs" aria-label="Planning metric">${metrics.map((metric) => `<button type="button" data-planning-metric="${metric}" aria-pressed="${planningMetric === metric}">${escapeHtml(metric)}</button>`).join("")}</div>${scopeControls("planning")}<div class="planning-view ${sgaActive ? "" : "active"}" data-planning="main"><div class="figure-flow">${planningFigureData().map((item) => `<article class="figure-card ${item.label.startsWith("vs ") ? `tone-${signalTone(item.value, planningMetric)}` : ""}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.detail)}</small></article>`).join("")}</div>${planningBody()}</div><div class="planning-view ${sgaActive ? "active" : ""}" data-planning="sga">${sgaActive ? planningSgaMarkup() : ""}</div>${toastMarkup()}`;
  }

  function pnlView() {
    return `${pageHeading("Financial statement", "P&L")}${scopeControls("pnl")}<article class="hub-card pnl-shell"><div class="pnl-head"><div><h2>Profit & Loss statement</h2></div></div><div class="table-wrap"><table class="hub-table pnl-table"><thead><tr><th>Account</th><th>Actual</th><th>Budget</th><th>Forecast</th><th>vs Budget</th></tr></thead><tbody>${data.pnlRows.map((row) => `<tr class="${row.total ? "total" : row.subtotal ? "subtotal" : ""}"><td class="${row.indent ? "indent" : ""}">${escapeHtml(row.label)}</td><td>${escapeHtml(row.actual)}</td><td>${escapeHtml(row.budget)}</td><td>${escapeHtml(row.forecast)}</td><td class="tone-${signalTone(row.variance, row.label)}">${escapeHtml(row.variance)}</td></tr>`).join("")}</tbody></table></div></article>${toastMarkup()}`;
  }

  function taskCounts() {
    return { all: tasks.length, pending: tasks.filter((task) => !task.done).length, done: tasks.filter((task) => task.done).length };
  }

  function shortTaskDeadline(deadline) {
    const [, month, day] = String(deadline).split("-").map(Number);
    return `${data.months[month - 1] || ""} ${day || ""}`.trim();
  }

  function sortedTasks() {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return tasks.filter((task) => taskFilter === "all" || (taskFilter === "done") === task.done).sort((left, right) => {
      if (left.done !== right.done) return Number(left.done) - Number(right.done);
      const value = taskSort === "priority" ? priorityOrder[left.priority] - priorityOrder[right.priority] : left.deadline.localeCompare(right.deadline);
      return value * taskSortDirection;
    });
  }

  function taskDetailMarkup(task) {
    if (expandedTaskId !== task.id) return "";
    const note = task.comments?.[0] || "";
    return `<div class="task-detail"><div class="task-detail-main"><strong>Notes</strong><form class="task-note-editor task-common-note" data-task-note="${task.id}"><textarea name="note" maxlength="240" rows="5" aria-label="Common note for ${escapeHtml(task.name)}" placeholder="Write the shared task note">${escapeHtml(note)}</textarea><div class="task-common-note-actions"><small>Shared task note</small><button type="submit">Save note</button></div></form></div><div class="task-meta task-detail-dates"><time datetime="${escapeHtml(task.deadline)}">Deadline ${escapeHtml(task.deadline)}</time><time>Created ${escapeHtml(task.createdAt)}</time></div></div>`;
  }

  function taskRowsMarkup() {
    const visible = sortedTasks();
    if (!visible.length) return `<div class="empty-data-state"><strong>No tasks here</strong><p>Choose another status or create a task.</p></div>`;
    return visible.map((task) => `<article class="task-row ${task.done ? "is-done" : ""}" data-task-row="${task.id}">
      <div class="task-summary">
        <div class="task-title-cell" data-task-expand="${task.id}"${editingTaskId === task.id ? "" : ` tabindex="0" role="button" aria-expanded="${expandedTaskId === task.id}"`} >${editingTaskId === task.id ? `<input class="task-rename-input" value="${escapeHtml(task.name)}" maxlength="80" aria-label="Rename task" />` : `<strong class="task-name">${escapeHtml(task.name)}</strong>`}<small class="task-owner">${escapeHtml(task.owner)}</small></div>
        <span class="signal ${task.done ? "done" : "pending"}">${task.done ? "Done" : "Pending"}</span>
        <span class="priority ${task.priority.toLowerCase()}">${escapeHtml(task.priority)}</span>
        <time class="task-date" datetime="${task.deadline}">${escapeHtml(shortTaskDeadline(task.deadline))}</time>
        <span class="task-actions">
          <button class="task-icon-btn" type="button" data-task-rename="${task.id}" aria-label="Rename ${escapeHtml(task.name)}" title="Rename"></button>
          <button class="task-icon-btn" type="button" data-task-toggle="${task.id}" aria-label="${task.done ? "Reopen" : "Complete"} ${escapeHtml(task.name)}" title="${task.done ? "Reopen" : "Complete"}"></button>
          <button class="task-icon-btn danger" type="button" data-task-delete="${task.id}" aria-label="Delete ${escapeHtml(task.name)}" title="Delete"></button>
        </span>
      </div>${taskDetailMarkup(task)}
    </article>`).join("");
  }

  function todoView() {
    const counts = taskCounts();
    const listTitle = taskFilter === "all" ? "All tasks" : taskFilter === "done" ? "Done tasks" : "Pending tasks";
    return `${pageHeading("Work tracking", "To do list")}<div class="todo-toolbar todo-top"><div class="todo-filters filters" aria-label="Filter tasks">${["all", "pending", "done"].map((filter) => `<button type="button" class="filter" data-task-filter="${filter}" aria-pressed="${taskFilter === filter}">${filter[0].toUpperCase() + filter.slice(1)} (${counts[filter]})</button>`).join("")}</div><button class="todo-primary" type="button" id="toggle-task-form" aria-expanded="${taskFormOpen}" aria-controls="task-form">+ Create task</button></div>
      <form class="todo-form create-form ${taskFormOpen ? "open" : ""}" id="task-form" ${taskFormOpen ? "" : "hidden"}><label>Task name<input required maxlength="80" name="name" placeholder="Task name" /></label><label>Assignee<input required maxlength="40" name="owner" value="Team member A" placeholder="Assignee" /></label><label>Priority<select name="priority"><option>High</option><option selected>Medium</option><option>Low</option></select></label><label>Deadline<input required name="deadline" type="date" /></label><button type="submit">Add</button></form>
      <section class="task-panel"><div class="task-panel-head"><h2>${listTitle}</h2><span>Status</span><button type="button" class="sort-head" data-task-sort="priority" aria-pressed="${taskSort === "priority"}">Priority ${taskSort === "priority" ? (taskSortDirection > 0 ? "&#8593;" : "&#8595;") : ""}</button><button type="button" class="sort-head" data-task-sort="deadline" aria-pressed="${taskSort === "deadline"}">Deadline ${taskSort === "deadline" ? (taskSortDirection > 0 ? "&#8593;" : "&#8595;") : ""}</button><span>Action</span></div><div class="task-list">${taskRowsMarkup()}</div></section>${toastMarkup()}`;
  }

  function sourceKey(year, index) {
    return `${year}:${index}`;
  }

  function sourceDetailMarkup(source) {
    const stages = source.status === "Present"
      ? [["File name", "Verified", "done"], ["Structure", "Passed", "done"], ["Source", "Ready", "done"], ["Publish", "Complete", "done"]]
      : source.status === "Error"
        ? [["File name", "Verified", "done"], ["Structure", source.problem || "Check required", "problem"], ["Source", "Waiting", "waiting"], ["Publish", "Waiting", "waiting"]]
        : [["File name", "Local preview", "waiting"], ["Structure", "Pending", "waiting"], ["Source", "Pending", "waiting"], ["Publish", "Pending", "waiting"]];
    return `<div class="source-detail ${source.status.toLowerCase()}">${stages.map(([label, value, tone]) => `<span class="${tone}"><b>${escapeHtml(label)}</b>${escapeHtml(value)}</span>`).join("")}</div>`;
  }

  function sourceRowsMarkup(yearBlock) {
    return yearBlock.sources.map((source, index) => {
      const key = sourceKey(yearBlock.year, index);
      const expanded = expandedSource === key;
      return `<tr class="source-row" data-source-row="${key}" tabindex="0" role="button" aria-label="Preview ${escapeHtml(source.fileName)} validation" aria-expanded="${expanded}"><td><strong>${escapeHtml(source.slot)}</strong></td><td class="source-file">${escapeHtml(source.fileName)}</td><td><span class="source-status ${source.status.toLowerCase()}">${escapeHtml(source.status)}</span></td><td>${escapeHtml(source.lastUpdate)}</td><td><span class="source-row-actions"><button class="hub-mini mini" type="button" data-source-simulate="${key}">${escapeHtml(source.action)}</button>${source.status !== "Pending" ? `<button class="hub-danger mini delete" type="button" data-source-delete="${key}">Delete</button>` : ""}</span></td></tr>${expanded ? `<tr class="source-process-row standalone-detail-row"><td colspan="5">${sourceDetailMarkup(source)}</td></tr>` : ""}`;
    }).join("");
  }

  function dataView() {
    return `${pageHeading("Source control", "Data Control", `<label class="data-country country-card"><span>Country</span><select id="data-country">${countries.filter((item) => item !== "All countries").map((country) => `<option${country === dataCountry ? " selected" : ""}>${escapeHtml(country)}</option>`).join("")}</select></label>`)}
      <div class="local-notice"><div><strong>Local snapshot</strong><small>No files accepted. Changes reset on refresh.</small></div><div class="control-actions"><button class="hub-mini" type="button" data-revalidate>Revalidate</button><button class="hub-primary" type="button" data-preview-register>Preview register</button><button class="hub-mini" type="button" data-download-register>Download CSV</button></div></div>
      <div class="year-stack">${dataYears.map((yearBlock) => { const open = openYear === yearBlock.year; return `<section class="year-block ${open ? "open" : ""}"><button class="year-toggle" type="button" data-year-toggle="${yearBlock.year}" aria-expanded="${open}"><div><span>Year</span><strong class="year-number">${yearBlock.year}</strong></div><div><span>Monthly Data</span><strong>${escapeHtml(yearBlock.monthlyData)}</strong><small>files updated</small></div><div><span>Planning File</span><strong>${escapeHtml(yearBlock.planningFile)}</strong><small>file updated</small></div><div><span>Connection</span><strong class="tone-good" aria-label="Local fixture status: ${escapeHtml(yearBlock.status)}">${escapeHtml(yearBlock.status)}</strong></div><i aria-hidden="true">${open ? "&#8963;" : "&#8964;"}</i></button>${open ? `<div class="table-wrap source-table-wrap" tabindex="0" aria-label="${yearBlock.year} source register; scroll horizontally for actions"><span class="table-scroll-cue" aria-hidden="true">Swipe for status &amp; actions &rarr;</span><table class="hub-table source-table"><thead><tr><th>Slot</th><th>File name</th><th>Status</th><th>Last update</th><th>Action</th></tr></thead><tbody>${sourceRowsMarkup(yearBlock)}</tbody></table></div>` : ""}</section>`; }).join("")}</div>${toastMarkup()}`;
  }

  function personRowsMarkup() {
    return people.map((person) => `<div class="person-row"><div><strong>${escapeHtml(person.name)}${person.current ? " · You" : ""}</strong><small>@${escapeHtml(person.alias)}</small></div><select data-person-role="${person.id}" aria-label="Role for ${escapeHtml(person.name)}"${person.current ? " disabled" : ""}>${["Owner", "Analyst", "Viewer"].map((role) => `<option${role === person.role ? " selected" : ""}>${role}</option>`).join("")}</select><button class="hub-danger" type="button" data-person-remove="${person.id}"${person.current ? " disabled title=\"Current local profile cannot be removed\"" : ""}>Remove</button></div>`).join("");
  }

  function auditRowsMarkup() {
    const visible = auditEvents.filter((event) => auditFilter === "All profiles" || event.actor === auditFilter);
    return visible.length ? visible.map((event) => `<p class="audit-item"><strong>${escapeHtml(event.action)}</strong><span>${escapeHtml(event.actor)} &middot; ${escapeHtml(event.time)}</span></p>`).join("") : `<div class="empty-data-state"><strong>No activity</strong><p>No local events match this profile.</p></div>`;
  }

  function adminView() {
    return `${pageHeading("Workspace controls", "Admin")}<div class="local-notice"><div><strong>Local permission simulation</strong><small>No login, account, or remote access changes.</small></div><div class="control-actions"><button class="hub-primary" type="button" data-preview-audit>Preview audit</button><button class="hub-mini" type="button" data-download-audit>Download CSV</button></div></div>
      <div class="admin-grid"><section class="admin-panel"><header class="admin-panel-head"><div><h2>Permissions Control</h2><p>Local team roles</p></div><span class="signal">${people.length} profiles</span></header><form class="permission-form" id="permission-form"><label>Display name<input name="name" required maxlength="40" placeholder="Demo profile" /></label><label>Workspace alias<input name="alias" required maxlength="32" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="demo-profile" /></label><label>Role<select name="role"><option>Owner</option><option selected>Analyst</option><option>Viewer</option></select></label><button class="hub-primary" type="submit">Add profile</button></form><div class="people">${personRowsMarkup()}</div></section>
      <section class="admin-panel"><header class="admin-panel-head"><div><h2>Audit trail</h2><p>Local session activity</p></div><span class="signal">Live</span></header><div class="audit-tools"><label>Profile<select class="audit-filter" id="audit-filter">${["All profiles", ...people.map((person) => person.name)].map((name) => `<option${name === auditFilter ? " selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select></label></div><div class="audit-list">${auditRowsMarkup()}</div></section></div>${toastMarkup()}`;
  }

  function scopeLabel(module = currentModule) {
    if (module === "overview") return `${filters.overview.country} · ${filters.overview.start}-${filters.overview.end}`;
    if (module === "variance") return `${filters.variance.country} · ${filters.variance.reportMonth} ${filters.variance.year}`;
    if (module === "planning") return `${filters.planning.country} · ${filters.planning.year} · ${filters.planning.scenario}`;
    if (module === "pnl") return `${filters.pnl.country} · ${filters.pnl.start}-${filters.pnl.end}`;
    if (module === "todo") return `${taskCounts().pending} pending · local session`;
    if (module === "data") return `${dataCountry} · local register`;
    if (module === "admin") return `${people.length} profiles · local session`;
    return "Jun 2026 · local fixture";
  }

  function renderExport() {
    if (["center", "todo", "data", "admin"].includes(currentModule)) {
      exportHost.innerHTML = "";
      return;
    }
    const formats = [
      { key: "csv", label: "Data table", extension: ".csv", icon: "CSV" },
      { key: "report", label: "Management report", extension: ".html", icon: "RPT" },
      { key: "slide", label: "Review slide", extension: ".html", icon: "SLD" },
    ];
    exportHost.innerHTML = `<div class="export-wrap"><button class="export-trigger" type="button" aria-expanded="${exportMenuOpen}" aria-controls="export-menu">Export <span aria-hidden="true">&#8964;</span></button><div class="export-menu" id="export-menu"${exportMenuOpen ? "" : " hidden"}><div class="export-menu-head">Local preview & download</div>${formats.map((format) => `<div class="export-format-row"><b class="export-format-icon">${format.icon}</b><span class="export-format-copy"><strong>${format.label}</strong><small>${format.extension}</small></span><span class="export-format-actions"><button type="button" data-export-preview="${format.key}">Preview</button><button type="button" data-export-download="${format.key}">Download</button></span></div>`).join("")}</div></div>`;
    bindExportEvents();
  }

  function renderCurrent({ focusPanel = false, focusSelector = "" } = {}) {
    const views = { center: centerView, overview: overviewView, variance: varianceView, planning: planningView, pnl: pnlView, todo: todoView, data: dataView, admin: adminView };
    panel.innerHTML = views[currentModule]();
    const primary = analyticModules.has(currentModule) ? "center" : currentModule;
    tabs.forEach((tab) => {
      const selected = tab.dataset.module === primary;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `tab-${primary}`);
    scopeSummary.textContent = scopeLabel();
    document.querySelector("#hub-eyebrow").textContent = moduleMeta[currentModule][1];
    simulationStatus.textContent = `${moduleMeta[currentModule][1]} selected`;
    renderExport();
    bindPanelEvents();
    if (focusSelector) requestAnimationFrame(() => panel.querySelector(focusSelector)?.focus());
    else if (focusPanel) requestAnimationFrame(() => panel.focus({ preventScroll: true }));
  }

  function setModule(module, { focusPanel = true } = {}) {
    if (!moduleMeta[module]) return;
    currentModule = module;
    exportMenuOpen = false;
    toastMessage = "";
    renderCurrent({ focusPanel });
    workspace?.scrollTo?.({ top: 0, behavior: "auto" });
    capture("workspace_hub_module_selection", { module });
    if (window.matchMedia("(max-width: 820px)").matches) setSidebarCollapsed(true);
  }

  function addAudit(action, actor = "Local FP&A Owner") {
    auditEvents.unshift({ action, actor, time: "now" });
  }

  function findSource(key) {
    const [year, rawIndex] = key.split(":");
    const yearBlock = dataYears.find((item) => item.year === year);
    return { yearBlock, source: yearBlock?.sources[Number(rawIndex)], index: Number(rawIndex) };
  }

  function refreshYearSummary(yearBlock) {
    if (!yearBlock) return;
    const monthly = yearBlock.sources.filter((source) => source.slot !== "Plan");
    const readyMonthly = monthly.filter((source) => source.status === "Present").length;
    const plan = yearBlock.sources.find((source) => source.slot === "Plan");
    yearBlock.monthlyData = `${readyMonthly} / ${monthly.length}`;
    yearBlock.planningFile = `${plan?.status === "Present" ? 1 : 0} / 1`;
  }

  function bindPanelEvents() {
    panel.querySelectorAll("[data-open-module]").forEach((button) => button.addEventListener("click", () => setModule(button.dataset.openModule)));
    panel.querySelectorAll("[data-scope-filter]").forEach((select) => select.addEventListener("change", () => {
      const key = select.dataset.scopeFilter;
      filters[currentModule][key] = select.value;
      if ((key === "start" || key === "end") && periodOptions.includes(select.value)) {
        const startIndex = periodOptions.indexOf(filters[currentModule].start);
        const endIndex = periodOptions.indexOf(filters[currentModule].end);
        if (startIndex > endIndex) filters[currentModule][key === "start" ? "end" : "start"] = select.value;
      }
      if (currentModule === "overview") { selectedMonths.clear(); selectedCustomer = null; selectedCost = null; }
      renderCurrent({ focusSelector: `[data-scope-filter="${select.dataset.scopeFilter}"]` });
    }));
    panel.querySelectorAll("[data-clear-filter]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.clearFilter;
      if (key === "all") { filters.overview = clone(filterDefaults.overview); selectedMonths.clear(); selectedCustomer = null; selectedCost = null; }
      else if (key === "months") selectedMonths.clear();
      else if (key === "customer") selectedCustomer = null;
      else if (key === "cost") selectedCost = null;
      else filters.overview[key] = filterDefaults.overview[key];
      renderCurrent({ focusSelector: ".overview-scope select" });
    }));
    panel.querySelectorAll("[data-chart-zoom]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.chartZoom;
      const direction = Number(button.dataset.direction);
      chartZoom[key] = direction === 0 ? 1 : Math.min(2.5, Math.max(1, chartZoom[key] + direction * 0.25));
      renderCurrent({ focusSelector: `[data-chart-zoom="${key}"][data-direction="${direction}"]` });
    }));
    panel.querySelectorAll("[data-chart-month]").forEach((button) => button.addEventListener("click", (event) => {
      const month = button.dataset.chartMonth;
      const chartKey = button.dataset.chartKey;
      const additive = event.ctrlKey || event.metaKey;
      if (!additive) {
        const onlySelection = selectedMonths.size === 1 && selectedMonths.has(month);
        selectedMonths.clear();
        if (!onlySelection) selectedMonths.add(month);
      } else if (selectedMonths.has(month)) selectedMonths.delete(month);
      else selectedMonths.add(month);
      renderCurrent({ focusSelector: `[data-chart-key="${chartKey}"][data-chart-month="${month}"]` });
    }));
    panel.querySelectorAll("[data-rank-filter]").forEach((button) => button.addEventListener("click", () => {
      const label = button.dataset.rankFilter;
      const type = button.dataset.rankType;
      const cardKey = button.dataset.rankCard;
      if (type === "service") filters.overview.service = filters.overview.service === label ? "All services" : label;
      else if (type === "branch") filters.overview.branch = filters.overview.branch === label ? "All branches" : label;
      else if (type === "cost") selectedCost = selectedCost === label ? null : label;
      renderCurrent({ focusSelector: `[data-rank-card="${cardKey}"][data-rank-filter="${CSS.escape(label)}"]` });
    }));
    panel.querySelectorAll("[data-customer]").forEach((row) => {
      const choose = () => { selectedCustomer = selectedCustomer === row.dataset.customer ? null : row.dataset.customer; renderCurrent({ focusSelector: `[data-customer="${CSS.escape(row.dataset.customer)}"]` }); };
      row.addEventListener("click", choose);
      row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } });
    });
    panel.querySelectorAll("[data-variance-customer]").forEach((button) => button.addEventListener("click", () => { varianceCustomerMetric = button.dataset.varianceCustomer; renderCurrent({ focusSelector: `[data-variance-customer="${varianceCustomerMetric}"]` }); }));
    panel.querySelectorAll("[data-planning-metric]").forEach((button) => button.addEventListener("click", () => { planningMetric = button.dataset.planningMetric; renderCurrent({ focusSelector: `[data-planning-metric="${planningMetric}"]` }); }));
    panel.querySelectorAll("[data-sga-group]").forEach((button) => button.addEventListener("click", () => { if (button.dataset.sgaGroup === "salary") salaryExpanded = !salaryExpanded; else otherSgaExpanded = !otherSgaExpanded; renderCurrent({ focusSelector: `[data-sga-group="${button.dataset.sgaGroup}"]` }); }));
    bindTaskEvents();
    bindDataEvents();
    bindAdminEvents();
    panel.querySelector("[data-dismiss-toast]")?.addEventListener("click", () => { toastMessage = ""; panel.querySelector(".hub-toast")?.remove(); });
  }

  function bindTaskEvents() {
    panel.querySelectorAll("[data-task-filter]").forEach((button) => button.addEventListener("click", () => { taskFilter = button.dataset.taskFilter; renderCurrent({ focusSelector: `[data-task-filter="${taskFilter}"]` }); }));
    panel.querySelector("#toggle-task-form")?.addEventListener("click", () => { taskFormOpen = !taskFormOpen; renderCurrent({ focusSelector: taskFormOpen ? "#task-form input" : "#toggle-task-form" }); });
    panel.querySelector("#task-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const task = { id: nextTaskId++, name: String(form.get("name")).trim(), owner: String(form.get("owner")).trim(), priority: String(form.get("priority")), deadline: String(form.get("deadline")), done: false, createdAt: "Local session", comments: [] };
      if (!task.name || !task.owner) return;
      tasks.push(task); taskFilter = "all"; taskFormOpen = false; setToast("Task created in this local session."); addAudit("Created a local task");
      renderCurrent({ focusSelector: `[data-task-expand="${task.id}"]` });
    });
    panel.querySelectorAll("[data-task-sort]").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.taskSort; if (taskSort === key) taskSortDirection *= -1; else { taskSort = key; taskSortDirection = 1; } renderCurrent({ focusSelector: `[data-task-sort="${key}"]` }); }));
    panel.querySelectorAll("[data-task-row]").forEach((row) => {
      const summary = row.querySelector("[data-task-expand]");
      const toggle = (event) => { if (event.target.closest("button,input,textarea,form")) return; const id = Number(row.dataset.taskRow); expandedTaskId = expandedTaskId === id ? null : id; renderCurrent({ focusSelector: `[data-task-expand="${id}"]` }); };
      summary?.addEventListener("click", toggle);
      summary?.addEventListener("keydown", (event) => { if (event.target === summary && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); toggle(event); } });
    });
    panel.querySelectorAll("[data-task-rename]").forEach((button) => button.addEventListener("click", () => { editingTaskId = Number(button.dataset.taskRename); renderCurrent({ focusSelector: ".task-rename-input" }); panel.querySelector(".task-rename-input")?.select(); }));
    const renameInput = panel.querySelector(".task-rename-input");
    if (renameInput) {
      let cancelled = false;
      const task = tasks.find((item) => item.id === editingTaskId);
      const save = () => { if (cancelled || !task) return; const value = renameInput.value.trim(); if (value) task.name = value; const id = editingTaskId; editingTaskId = null; renderCurrent({ focusSelector: `[data-task-rename="${id}"]` }); };
      renameInput.addEventListener("blur", save);
      renameInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); renameInput.blur(); } else if (event.key === "Escape") { event.preventDefault(); cancelled = true; const id = editingTaskId; editingTaskId = null; renderCurrent({ focusSelector: `[data-task-rename="${id}"]` }); } });
    }
    panel.querySelectorAll("[data-task-toggle]").forEach((button) => button.addEventListener("click", () => { const task = tasks.find((item) => item.id === Number(button.dataset.taskToggle)); task.done = !task.done; setToast(task.done ? "Task completed." : "Task reopened."); addAudit(task.done ? "Completed a local task" : "Reopened a local task"); const staysVisible = taskFilter === "all" || (taskFilter === "done" ? task.done : !task.done); renderCurrent({ focusSelector: staysVisible ? `[data-task-toggle="${task.id}"]` : `[data-task-filter="${taskFilter}"]` }); }));
    panel.querySelectorAll("[data-task-delete]").forEach((button) => button.addEventListener("click", () => { const id = Number(button.dataset.taskDelete); const task = tasks.find((item) => item.id === id); askConfirm("Delete task?", `${task.name} will be removed from this local session.`, "Delete", () => { const index = tasks.findIndex((item) => item.id === id); tasks.splice(index, 1); setToast("Task deleted from this local session."); addAudit("Deleted a local task"); renderCurrent({ focusSelector: "#toggle-task-form" }); }, button); }));
    panel.querySelectorAll("[data-task-note]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); const task = tasks.find((item) => item.id === Number(form.dataset.taskNote)); const note = new FormData(form).get("note").toString().trim(); task.comments = note ? [note] : []; setToast("Shared note saved locally."); addAudit("Updated a local task note"); renderCurrent({ focusSelector: `[data-task-note="${task.id}"] textarea` }); }));
  }

  function bindDataEvents() {
    panel.querySelector("#data-country")?.addEventListener("change", (event) => { dataCountry = event.target.value; renderCurrent({ focusSelector: "#data-country" }); });
    panel.querySelectorAll("[data-year-toggle]").forEach((button) => button.addEventListener("click", () => { openYear = openYear === button.dataset.yearToggle ? null : button.dataset.yearToggle; renderCurrent({ focusSelector: `[data-year-toggle="${button.dataset.yearToggle}"]` }); }));
    panel.querySelectorAll("[data-source-row]").forEach((row) => {
      const toggle = (event) => { if (event.target.closest("button")) return; expandedSource = expandedSource === row.dataset.sourceRow ? null : row.dataset.sourceRow; renderCurrent({ focusSelector: `[data-source-row="${row.dataset.sourceRow}"]` }); };
      row.addEventListener("click", toggle);
      row.addEventListener("keydown", (event) => { if (event.target === row && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); toggle(event); } });
    });
    panel.querySelectorAll("[data-source-preview]").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.sourcePreview; expandedSource = expandedSource === key ? null : key; renderCurrent({ focusSelector: `[data-source-preview="${key}"]` }); }));
    panel.querySelectorAll("[data-source-simulate]").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.sourceSimulate; const { source, yearBlock } = findSource(key); const action = source.action; source.status = "Present"; source.problem = undefined; if (source.fileName === "—" || source.fileName === "-") { if (source.slot === "Plan") source.fileName = `Budget_Forecast_${yearBlock.year}.xlsx`; else { const [number, month] = source.slot.split(" · "); source.fileName = `${number}_${month}.xlsx`; } } source.lastUpdate = "Local session"; source.action = "Replace"; refreshYearSummary(yearBlock); expandedSource = key; setToast(`${action} simulated locally. No file was accepted.`); addAudit(`Simulated ${action.toLowerCase()} for ${source.slot}`); renderCurrent({ focusSelector: `[data-source-simulate="${key}"]` }); }));
    panel.querySelectorAll("[data-source-delete]").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.sourceDelete; const { source, yearBlock } = findSource(key); askConfirm("Reset source slot?", `${source.slot} will return to Pending in this local session.`, "Reset", () => { source.fileName = "—"; source.status = "Pending"; source.lastUpdate = "—"; source.action = "Upload"; source.problem = undefined; refreshYearSummary(yearBlock); expandedSource = key; setToast("Source slot reset locally."); addAudit(`Reset source slot ${source.slot}`); renderCurrent({ focusSelector: `[data-source-simulate="${key}"]` }); }, button); }));
    panel.querySelector("[data-revalidate]")?.addEventListener("click", () => { const errors = dataYears.flatMap((year) => year.sources).filter((source) => source.status === "Error").length; setToast(errors ? `${errors} local validation issue remains.` : "Local register validation passed."); renderCurrent({ focusSelector: "[data-revalidate]" }); });
    panel.querySelector("[data-preview-register]")?.addEventListener("click", () => openPreview("csv", "register", panel.querySelector("[data-preview-register]")));
    panel.querySelector("[data-download-register]")?.addEventListener("click", () => downloadExport("csv", "data", "register"));
  }

  function bindAdminEvents() {
    panel.querySelector("#permission-form")?.addEventListener("submit", (event) => { event.preventDefault(); const values = new FormData(event.currentTarget); const name = String(values.get("name")).trim(); const alias = String(values.get("alias")).trim(); if (!name || !alias) return; const person = { id: nextPersonId++, name, alias, role: String(values.get("role")), current: false }; people.push(person); addAudit("Added a local profile"); setToast("Profile added to this local session."); renderCurrent({ focusSelector: `[data-person-role="${person.id}"]` }); });
    panel.querySelectorAll("[data-person-role]").forEach((select) => select.addEventListener("change", () => { const person = people.find((item) => item.id === Number(select.dataset.personRole)); person.role = select.value; addAudit(`Changed ${person.name} role to ${person.role}`); setToast("Role updated locally."); renderCurrent({ focusSelector: `[data-person-role="${person.id}"]` }); }));
    panel.querySelectorAll("[data-person-remove]").forEach((button) => button.addEventListener("click", () => { const id = Number(button.dataset.personRemove); const person = people.find((item) => item.id === id); if (!person || person.current) return; askConfirm("Remove local profile?", `${person.name} will be removed from this session.`, "Remove", () => { people.splice(people.findIndex((item) => item.id === id), 1); if (auditFilter === person.name) auditFilter = "All profiles"; addAudit("Removed a local profile"); setToast("Profile removed from this local session."); renderCurrent({ focusSelector: "#permission-form input" }); }, button); }));
    panel.querySelector("#audit-filter")?.addEventListener("change", (event) => { auditFilter = event.target.value; renderCurrent({ focusSelector: "#audit-filter" }); });
    panel.querySelector("[data-preview-audit]")?.addEventListener("click", () => openPreview("csv", "audit", panel.querySelector("[data-preview-audit]")));
    panel.querySelector("[data-download-audit]")?.addEventListener("click", () => downloadExport("csv", "admin", "audit"));
  }

  function exportRows(module = currentModule, kind = null) {
    if (kind === "audit") return auditEvents.map((event) => [event.action, event.actor, event.time]);
    if (kind === "register" || module === "data") return dataYears.flatMap((year) => year.sources.map((source) => [`${year.year} ${source.slot}`, source.status, `${source.fileName} · ${source.lastUpdate}`]));
    if (module === "overview") return data.kpis.map((kpi) => [kpi.label, kpi.value, `Budget ${kpi.budget}; Forecast ${kpi.forecast}; Variance ${kpi.variance}`]);
    if (module === "variance") return data.varianceMetrics.flatMap((metric) => metric.rows.map((row) => [`${metric.name} · ${row.label}`, data.months.map((_, index) => row.values[index % row.values.length]).join(" | "), "Jan-Dec 2026"]));
    if (module === "planning") {
      if (planningMetric === "Revenue") return data.planningRows.map((row) => [row.label, row.values.join(" | "), "Jan-Dec 2026"]);
      if (planningMetric === "Gross Profit") return seriesMatrix(data.series.grossProfit).map((row) => [row.label, row.values.join(" | "), "Jan-Dec 2026"]);
      if (planningMetric === "Gross Margin") return seriesMatrix(grossMarginSeries(), true).map((row) => [row.label, row.values.join(" | "), "Jan-Dec 2026"]);
      if (planningMetric === "Total SG&A") return data.planningSgaRows.map((row) => [row.label, row.actual, `Budget ${row.budget}; Forecast ${row.forecast}`]);
      return planningFigureData().map((row) => [row.label, row.value, row.detail]);
    }
    if (module === "pnl") return data.pnlRows.map((row) => [row.label, row.actual, `Budget ${row.budget}; Forecast ${row.forecast}; vs Budget ${row.variance}`]);
    if (module === "todo") return tasks.map((task) => [task.name, task.done ? "Done" : "Pending", `${task.owner}; ${task.priority}; ${task.deadline}`]);
    if (module === "admin") return people.map((person) => [person.name, person.role, `@${person.alias}`]);
    return data.modules.map((moduleItem) => [moduleItem.title, moduleItem.metric, moduleItem.description]);
  }

  function openPreview(format, kind = null, returnFocus = document.activeElement) {
    const rows = exportRows(currentModule, kind);
    activePreview = { format, kind, module: currentModule };
    previewReturnFocus = returnFocus;
    previewEyebrow.textContent = format === "slide" ? "Review slide preview" : format === "report" ? "Management report preview" : "Data preview";
    previewTitle.textContent = kind === "audit" ? "Audit trail" : kind === "register" ? "Source register" : moduleMeta[currentModule][1];
    previewContent.innerHTML = `<article class="preview-sheet"><header><div><span class="hub-eyebrow">FP&A Workspace</span><h3>${escapeHtml(previewTitle.textContent)}</h3><p>${escapeHtml(scopeLabel())}</p></div><span class="signal">Local preview</span></header><table class="preview-table"><caption>${escapeHtml(previewTitle.textContent)} export</caption><thead><tr><th>Item</th><th>Value</th><th>Context</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2] || "")}</td></tr>`).join("")}</tbody></table></article>`;
    previewDownload.textContent = format === "csv" ? "Download CSV" : "Download HTML";
    previewDialog.showModal();
    previewDialog.querySelector("[data-close-preview]")?.focus();
    capture("workspace_hub_preview_open", { module: currentModule, format, kind: kind || "module" });
  }

  function closePreview() {
    if (!previewDialog.open) return;
    const returnFocus = previewReturnFocus;
    previewDialog.close();
    activePreview = null;
    previewReturnFocus = null;
    returnFocus?.focus?.();
  }

  function csvText(rows) {
    const safeCell = (value) => {
      const text = String(value ?? "");
      return /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
    };
    const quote = (value) => `"${safeCell(value).replace(/"/g, '""')}"`;
    return `\uFEFF${[["Item", "Value", "Context"], ...rows].map((row) => row.map(quote).join(",")).join("\r\n")}`;
  }

  function htmlText(rows, module, format) {
    const title = moduleMeta[module][1];
    const slide = format === "slide";
    return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)} · FP&A Workspace</title><style>body{margin:0;padding:48px;background:#f6f1e9;color:#1f2421;font:16px/1.5 Arial,sans-serif}.sheet{max-width:${slide ? "1120" : "900"}px;${slide ? "min-height:630px;" : ""}margin:auto;padding:48px;border:1px solid #ead9c3;border-radius:24px;background:#fffdfa;box-sizing:border-box}small{color:#73736d}h1{font-size:${slide ? "54" : "44"}px;margin:8px 0 4px}table{width:100%;margin-top:28px;border-collapse:collapse}td{padding:14px;border-top:1px solid #ead9c3}td:nth-child(2){font-weight:700}</style><article class="sheet"><small>FP&amp;A Workspace · local ${slide ? "review slide" : "management report"}</small><h1>${escapeHtml(title)}</h1><p>${escapeHtml(scopeLabel(module))}</p><table>${rows.map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td><small>${escapeHtml(row[2] || "")}</small></td></tr>`).join("")}</table></article></html>`;
  }

  function downloadBlob(content, type, filename) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function downloadExport(format, module = activePreview?.module || currentModule, kind = activePreview?.kind || null) {
    const rows = exportRows(module, kind);
    const slug = `${moduleMeta[module][1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}${kind ? `-${kind}` : ""}`;
    if (format === "csv") downloadBlob(csvText(rows), "text/csv;charset=utf-8", `${slug}.csv`);
    else downloadBlob(htmlText(rows, module, format), "text/html;charset=utf-8", `${slug}-${format}.html`);
    capture("workspace_hub_download", { module, format, kind: kind || "module" });
  }

  function bindExportEvents() {
    const trigger = exportHost.querySelector(".export-trigger");
    trigger?.addEventListener("click", (event) => { event.stopPropagation(); exportMenuOpen = !exportMenuOpen; renderExport(); if (exportMenuOpen) exportHost.querySelector("[data-export-preview]")?.focus(); });
    exportHost.querySelectorAll("[data-export-preview]").forEach((button) => button.addEventListener("click", () => { const format = button.dataset.exportPreview; exportMenuOpen = false; renderExport(); openPreview(format, null, exportHost.querySelector(".export-trigger")); }));
    exportHost.querySelectorAll("[data-export-download]").forEach((button) => button.addEventListener("click", () => { exportMenuOpen = false; downloadExport(button.dataset.exportDownload, currentModule, null); renderExport(); }));
  }

  const confirmDialog = document.createElement("dialog");
  confirmDialog.className = "hub-confirm-dialog";
  confirmDialog.setAttribute("aria-labelledby", "confirm-title");
  confirmDialog.innerHTML = `<form method="dialog"><span class="hub-eyebrow">Local simulation</span><h2 id="confirm-title">Confirm action</h2><p id="confirm-message"></p><div class="preview-actions"><button type="submit" value="cancel" data-confirm-cancel>Cancel</button><button type="button" class="hub-danger" data-confirm-action>Confirm</button></div></form>`;
  document.body.append(confirmDialog);

  function askConfirm(title, message, actionLabel, action, returnFocus) {
    confirmDialog.querySelector("#confirm-title").textContent = title;
    confirmDialog.querySelector("#confirm-message").textContent = message;
    confirmDialog.querySelector("[data-confirm-action]").textContent = actionLabel;
    confirmAction = action;
    confirmReturnFocus = returnFocus;
    confirmDialog.showModal();
    confirmDialog.querySelector("[data-confirm-cancel]").focus();
  }

  function closeConfirm() {
    if (confirmDialog.open) confirmDialog.close();
    confirmReturnFocus?.focus?.();
    confirmAction = null;
    confirmReturnFocus = null;
  }

  confirmDialog.querySelector("[data-confirm-action]").addEventListener("click", () => { const action = confirmAction; confirmDialog.close(); confirmAction = null; confirmReturnFocus = null; action?.(); });
  confirmDialog.addEventListener("close", () => { if (confirmAction) closeConfirm(); });
  confirmDialog.addEventListener("click", (event) => { if (event.target === confirmDialog) closeConfirm(); });

  function setSidebarCollapsed(collapsed) {
    const mobile = window.matchMedia("(max-width: 820px)").matches;
    shell.classList.toggle("is-sidebar-collapsed", collapsed);
    sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    sidebarToggle.setAttribute("aria-label", collapsed ? "Show sidebar" : "Hide sidebar");
    sidebarToggle.title = collapsed ? "Show sidebar" : "Hide sidebar";
    sidebar.inert = collapsed;
    sidebar.setAttribute("aria-hidden", String(collapsed));
    if (workspace) workspace.inert = mobile && !collapsed;
    document.body.classList.toggle("hub-drawer-open", mobile && !collapsed);
    if (mobile && !collapsed) requestAnimationFrame(() => sidebarClose?.focus());
  }

  const enterDemoControls = Array.from(document.querySelectorAll("[data-enter-hub], [data-enter-demo]"));
  const exitDemoControls = Array.from(document.querySelectorAll("[data-exit-hub], [data-exit-demo]"));
  let demoReturnFocus = null;
  let demoScrollY = 0;

  function demoIsActive() {
    return document.body.classList.contains("hub-app-mode") || document.body.classList.contains("hub-demo-active");
  }

  function enterDemo(trigger) {
    if (!demoIsActive()) {
      demoReturnFocus = trigger || document.activeElement;
      demoScrollY = window.scrollY;
    }
    document.body.classList.add("hub-app-mode", "hub-demo-active");
    shell.classList.add("is-immersive", "is-demo-active");
    enterDemoControls.forEach((control) => control.setAttribute("aria-pressed", "true"));
    setModule("center", { focusPanel: false });
    requestAnimationFrame(() => panel.focus({ preventScroll: true }));
    capture("workspace_hub_demo_enter", { mode: "frontend_local" });
  }

  function exitDemo() {
    if (!demoIsActive()) return;
    document.body.classList.remove("hub-app-mode", "hub-demo-active");
    shell.classList.remove("is-immersive", "is-demo-active");
    enterDemoControls.forEach((control) => control.setAttribute("aria-pressed", "false"));
    const returnFocus = demoReturnFocus;
    demoReturnFocus = null;
    window.scrollTo({ top: demoScrollY, behavior: "auto" });
    requestAnimationFrame(() => returnFocus?.focus?.({ preventScroll: true }));
    capture("workspace_hub_demo_exit", { mode: "frontend_local" });
  }

  enterDemoControls.forEach((control) => control.addEventListener("click", (event) => {
    event.preventDefault();
    enterDemo(control);
  }));
  exitDemoControls.forEach((control) => control.addEventListener("click", (event) => {
    event.preventDefault();
    exitDemo();
  }));

  sidebarToggle?.addEventListener("click", () => setSidebarCollapsed(!shell.classList.contains("is-sidebar-collapsed")));
  sidebarClose?.addEventListener("click", () => { setSidebarCollapsed(true); sidebarToggle.focus(); });
  sidebarBackdrop?.addEventListener("click", () => { setSidebarCollapsed(true); sidebarToggle?.focus(); });
  document.querySelectorAll("[data-go-center]").forEach((button) => {
    button.addEventListener("click", () => setModule("center"));
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setModule(tab.dataset.module));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else next = (index + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
    });
  });
  sidebarResizer?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const current = parseInt(getComputedStyle(shell).getPropertyValue("--hub-side"), 10) || 268;
    const next = Math.min(380, Math.max(210, current + (event.key === "ArrowRight" ? 12 : -12)));
    shell.style.setProperty("--hub-side", `${next}px`);
    sidebarResizer.setAttribute("aria-valuenow", String(next));
  });
  sidebarResizer?.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    sidebarResizer.setPointerCapture(event.pointerId);
    const move = (moveEvent) => {
      const left = shell.getBoundingClientRect().left;
      const next = Math.min(380, Math.max(210, Math.round(moveEvent.clientX - left)));
      shell.style.setProperty("--hub-side", `${next}px`);
      sidebarResizer.setAttribute("aria-valuenow", String(next));
    };
    const finish = () => { sidebarResizer.removeEventListener("pointermove", move); sidebarResizer.removeEventListener("pointerup", finish); };
    sidebarResizer.addEventListener("pointermove", move);
    sidebarResizer.addEventListener("pointerup", finish);
  });

  document.querySelectorAll("[data-close-preview]").forEach((button) => button.addEventListener("click", closePreview));
  previewDialog.addEventListener("cancel", (event) => { event.preventDefault(); closePreview(); });
  previewDialog.addEventListener("click", (event) => { if (event.target === previewDialog) closePreview(); });
  previewDownload.addEventListener("click", () => downloadExport(activePreview?.format || "csv"));
  document.addEventListener("click", (event) => { if (exportMenuOpen && !event.target.closest(".export-wrap")) { exportMenuOpen = false; renderExport(); } });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && window.matchMedia("(max-width: 820px)").matches && !shell.classList.contains("is-sidebar-collapsed")) {
      const focusable = Array.from(sidebar.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((element) => !element.inert && element.getClientRects().length);
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!sidebar.contains(document.activeElement) || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
      return;
    }
    if (event.key !== "Escape") return;
    if (previewDialog.open || confirmDialog.open) return;
    if (exportMenuOpen) {
      exportMenuOpen = false;
      renderExport();
      exportHost.querySelector(".export-trigger")?.focus();
      return;
    }
    if (window.matchMedia("(max-width: 820px)").matches && !shell.classList.contains("is-sidebar-collapsed")) {
      setSidebarCollapsed(true);
      sidebarToggle?.focus();
      return;
    }
    if (demoIsActive()) {
      event.preventDefault();
      exitDemo();
    }
  });

  const mobileLayout = window.matchMedia("(max-width: 820px)");
  mobileLayout.addEventListener?.("change", (event) => setSidebarCollapsed(event.matches));
  if (mobileLayout.matches) setSidebarCollapsed(true);
  renderCurrent();
  capture("workspace_hub_showcase_open", { mode: "frontend_local" });
})();
