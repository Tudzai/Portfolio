import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { powerBiStandardProjects } from "./powerbi-standard-projects.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..");
const POWERBI_ROOT = path.join(REPO_ROOT, "showcase", "powerbi");
const CACHE_KEY = "standard-20260818-responsive1";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeMetric(metric) {
  if (Array.isArray(metric)) {
    return { value: metric[0], label: metric[1], note: metric[2] || "Synthetic base view" };
  }
  return {
    value: metric?.value ?? metric?.actual ?? "—",
    label: metric?.label ?? metric?.name ?? "Metric",
    note: metric?.note ?? metric?.comparison ?? "Synthetic base view",
  };
}

function narrativeCopy(value, fallback) {
  const parts = Array.isArray(value) ? value : value == null ? [] : [value];
  const copy = parts.map((part) => String(part).trim()).filter(Boolean).join(" ");
  return copy || fallback;
}

function splitTitle(title) {
  const words = String(title).trim().split(/\s+/);
  const accentCount = words.length > 3 ? 2 : 1;
  return {
    lead: words.slice(0, -accentCount).join(" "),
    accent: words.slice(-accentCount).join(" "),
  };
}

function githubUrl(project) {
  const candidate = String(project.publicRepoUrl || "");
  return /^https:\/\/github\.com\/Tudzai\/powerbi-fpa-analytics-portfolio\//.test(candidate) ? candidate : "";
}

function siteHeader() {
  return `    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header stage-shell-header" data-stage-shell data-header>
      <div class="page-shell header-inner stage-shell-inner">
        <a class="brand stage-shell-brand" href="../../../index.html#hero" aria-label="Truong Dinh Anh Tu, homepage">
          <span class="brand-mark stage-shell-brand-mark" aria-hidden="true"></span>
          <span class="brand-copy stage-shell-brand-copy"><strong>Truong Dinh Anh Tu</strong><small>Finance &times; AI</small></span>
        </a>
        <div class="header-actions stage-shell-actions">
          <button class="menu-button stage-shell-menu-button" type="button" data-stage-menu-toggle aria-expanded="false" aria-controls="primary-navigation" aria-label="Open capabilities menu">
            <span>Capabilities</span><i aria-hidden="true"></i>
          </button>
          <a class="header-link" href="../../../index.html#experience">Experience</a>
          <a class="header-link" href="../../../index.html#contact">Contact</a>
          <a class="header-link" href="../../../blog/index.html">Blog</a>
          <a class="nav-cv" href="../../../cv.html">View CV</a>
        </div>
        <nav class="stage-shell-menu" id="primary-navigation" data-stage-menu aria-label="Capabilities" aria-hidden="true" inert>
          <p class="nav-panel-label">Capabilities</p>
          <div class="capability-nav stage-shell-capabilities">
            <a href="../../fpa-decision-cases/index.html"><span>01</span>FP&amp;A <i aria-hidden="true">&rarr;</i></a>
            <a href="../../python-automation/index.html"><span>02</span>Automation <i aria-hidden="true">&rarr;</i></a>
            <a href="../index.html" aria-current="page"><span>03</span>BI Dashboards <i aria-hidden="true">&rarr;</i></a>
            <a href="../../financial-models/index.html"><span>04</span>Financial Models <i aria-hidden="true">&rarr;</i></a>
            <a href="../../../index.html#case-agentic"><span>05</span>Agentic AI <i aria-hidden="true">&rarr;</i></a>
          </div>
          <div class="nav-utility-links stage-shell-utilities">
            <a href="../../../index.html#demo">Demo</a>
            <a href="../../../index.html#experience">Experience</a>
            <a href="../../../index.html#contact">Contact</a>
            <a href="../../../blog/index.html">Blog</a>
            <a href="../../../cv.html">View CV</a>
          </div>
        </nav>
      </div>
    </header>`;
}

function siteFooter() {
  return `    <footer class="stage-site-footer stage-shell-footer" data-stage-shell>
      <div class="page-shell stage-shell-footer-inner">
        <span>&copy; <span data-current-year>2026</span> Truong Dinh Anh Tu</span>
        <a class="back-to-top stage-back-to-top" href="../../../index.html#hero" aria-label="Back to top" tabindex="-1"><span aria-hidden="true">&uarr;</span></a>
      </div>
    </footer>
    <script data-agentic-theme src="../../../assets/agentic-home/js/navigation.js?v=routes-20260810-hybrid1"></script>
    <script data-agentic-theme src="../../../assets/agentic-home/js/site.js?v=routes-20260810-hybrid1"></script>`;
}

function resizeScript() {
  return `    <script>
      (() => {
        const frames = Array.from(document.querySelectorAll("iframe[data-standard-preview]"));
        let resizeTimer;

        function resizeDashboardFrame(frame) {
          try {
            const previewWindow = frame.contentWindow;
            const previewDocument = frame.contentDocument || previewWindow?.document;
            const preview = previewDocument?.querySelector(".preview-frame");
            const dashboardShell = previewDocument?.querySelector(".dashboard-shell");
            if (!previewWindow || !preview || !dashboardShell) return;

            preview.style.minHeight = "0";
            preview.style.overflowY = "hidden";
            const previewStyle = previewWindow.getComputedStyle(preview);
            const paddingTop = Number.parseFloat(previewStyle.paddingTop) || 0;
            const paddingBottom = Number.parseFloat(previewStyle.paddingBottom) || 0;
            const targetHeight = Math.max(420, Math.ceil(dashboardShell.getBoundingClientRect().height + paddingTop + paddingBottom));
            if (Math.abs(frame.clientHeight - targetHeight) > 1) frame.style.height = \`\${targetHeight}px\`;
          } catch {
            /* Keep the CSS fallback if the preview is not same-origin. */
          }
        }

        function queueResize(delay = 0) {
          window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(() => window.requestAnimationFrame(() => frames.forEach(resizeDashboardFrame)), delay);
        }

        frames.forEach((frame) => frame.addEventListener("load", () => {
          window.requestAnimationFrame(() => resizeDashboardFrame(frame));
          queueResize(180);
        }));
        window.addEventListener("resize", () => queueResize(80), { passive: true });
        queueResize(180);
      })();
    </script>`;
}

export function renderCasePage(project) {
  const title = splitTitle(project.title);
  const metrics = (project.metrics || []).slice(0, 4).map(normalizeMetric);
  const pages = (project.pages || ["Overview", "Drivers", "Actions"])
    .map((page) => typeof page === "string" ? page : page.label || page.title || page.id)
    .join(", ");
  const metricMarkup = metrics.map((metric) => `          <article><span>${escapeHtml(metric.label)} · 2026</span><strong>${escapeHtml(metric.value)}</strong><small>${escapeHtml(metric.note)}</small></article>`).join("\n");
  const repoUrl = githubUrl(project);
  const repoLink = repoUrl ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener">View project files</a>` : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta name="robots" content="index, follow" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(project.title)} | Truong Dinh Anh Tu</title>
    <meta name="description" content="${escapeHtml(project.summary)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@500;600&amp;family=Manrope:wght@500;600;700;800&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/tokens.css?v=routes-20260818-responsive-all1" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/base.css?v=routes-20260810-hybrid1" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/shell.css?v=routes-20260813-atmark3" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/components.css?v=routes-20260810-hybrid1" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/templates.css?v=routes-20260813-inset1" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/templates/case.css?v=routes-20260810-hybrid1" />
    <link rel="stylesheet" href="../board-investor-cfo-pack/board-pack-page.css?v=${CACHE_KEY}" />
    <script src="../../../analytics.js?v=posthog-replay-fix-20260816"></script>
  </head>
  <body class="board-pack-page powerbi-standard-page" data-stage-family="powerbi" data-stage-template="case" data-project-no="${escapeHtml(project.no)}">
${siteHeader()}
    <main id="main-content" class="board-case" data-stage-content tabindex="-1">
      <nav class="board-breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Power BI portfolio</a></nav>

      <section class="board-overview" aria-labelledby="project-title">
        <header class="board-intro">
          <div>
            <p class="board-kicker">Project ${escapeHtml(project.no)} · ${escapeHtml(project.lens)} · synthetic data</p>
            <h1 id="project-title">${escapeHtml(title.lead)} <span>${escapeHtml(title.accent)}</span></h1>
            <p class="board-lead">${escapeHtml(project.summary)}</p>
          </div>
          <a class="board-button board-button--primary" href="#interactive-preview">Explore dashboard <span aria-hidden="true">&darr;</span></a>
        </header>
        <div class="board-metrics" aria-label="Headline metrics">
${metricMarkup}
        </div>
      </section>

      <section class="board-dashboard" id="interactive-preview" aria-labelledby="interactive-title">
        <header class="board-section-head">
          <div>
            <p class="board-kicker">Interactive dashboard</p>
            <h2 id="interactive-title">Explore the decision pack</h2>
            <p>Move through ${escapeHtml(pages)}. Change the filters to test the synthetic baseline; Reset Lens restores the default view.</p>
          </div>
          <a class="board-button board-button--secondary" href="preview.html?v=${CACHE_KEY}">Full screen <span aria-hidden="true">&nearr;</span></a>
        </header>
        <div class="board-dashboard-shell">
          <iframe data-standard-preview id="powerbi-preview-${escapeHtml(project.no)}" src="preview.html?v=${CACHE_KEY}" title="${escapeHtml(project.title)} interactive preview" loading="eager"></iframe>
        </div>
      </section>

      <section class="board-evidence" aria-labelledby="evidence-title">
        <p class="board-kicker">Case proof</p>
        <h2 id="evidence-title">What this demonstrates</h2>
        <div class="board-evidence-grid">
          <article><span>01</span><h3>Decision support</h3><p>${escapeHtml(narrativeCopy(project.decisionQuestion, "Which signal changed, why it changed, and which owner should act next?"))}</p></article>
          <article><span>02</span><h3>Finance logic</h3><p>${escapeHtml(narrativeCopy(project.financeLogic, "Headline metrics reconcile to driver views, scenario comparisons, and an owner action queue."))}</p></article>
          <article><span>03</span><h3>Governance</h3><p>${escapeHtml(narrativeCopy(project.governance, "Shared filters, defined status thresholds, public QA hooks, and portfolio-safe synthetic data."))}</p></article>
        </div>
        <div class="board-note">
          <p>Portfolio demonstration only. Values are synthetic; no raw source files, PBIX/PBIT files, local paths, or company-confidential data are published.</p>
          <div><a href="preview.html?v=${CACHE_KEY}">Open full screen</a>${repoLink}</div>
        </div>
      </section>
    </main>

${resizeScript()}
${siteFooter()}
  </body>
</html>
`;
}

export function renderPreviewPage(project) {
  const safeConfig = JSON.stringify(project).replaceAll("<", "\\u003c");
  const regionLabel = project.filters?.find((filter) => filter.id === "region")?.label || "Region";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta name="robots" content="noindex, follow" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(project.title)} Interactive Preview | Truong Dinh Anh Tu</title>
    <link rel="canonical" href="index.html" />
    <link rel="icon" href="../../../assets/favicon.svg" />
    <link rel="stylesheet" href="../../../assets/powerbi-standard/preview.css?v=${CACHE_KEY}" />
    <script src="../../../analytics.js?v=posthog-replay-fix-20260816"></script>
  </head>
  <body class="powerbi-standard-preview" data-project-no="${escapeHtml(project.no)}">
    <div class="preview-frame">
      <div class="dashboard-shell">
        <div class="dashboard" role="application" aria-label="${escapeHtml(project.title)} interactive dashboard">
          <aside class="sidebar">
            <div class="preview-brand"><span class="preview-brand-mark" aria-hidden="true">AT</span><span class="preview-brand-copy"><b>TDAT</b><small>${escapeHtml(project.lens)}</small></span></div>
            <nav class="project-nav" id="projectNav" aria-label="Dashboard pages"></nav>
            <div class="lens-group">
              <h2 class="lens-title">Global Lens</h2>
              <label><span class="filter-label">Year</span><span class="select-wrap"><select id="yearFilter" aria-label="Year filter"></select></span></label>
              <label><span class="filter-label">Scenario</span><span class="select-wrap"><select id="scenarioFilter" aria-label="Scenario filter"></select></span></label>
            </div>
            <div class="lens-group">
              <h2 class="lens-title">Operating Scope</h2>
              <label><span class="filter-label" id="scopeFilterLabel">Scope</span><span class="select-wrap"><select id="scopeFilter" aria-label="Scope filter"></select></span></label>
              <label><span class="filter-label">${escapeHtml(regionLabel)}</span><span class="select-wrap"><select id="regionFilter" aria-label="${escapeHtml(regionLabel)} filter"></select></span></label>
            </div>
            <button id="resetFilters" class="reset-button" type="button">Reset Lens</button>
          </aside>
          <main class="dashboard-content" id="content"></main>
        </div>
      </div>
    </div>
    <script>window.__POWERBI_PROJECT_CONFIG__ = Object.freeze(${safeConfig});</script>
    <script src="../../../assets/powerbi-standard/preview.js?v=${CACHE_KEY}"></script>
  </body>
</html>
`;
}

export async function buildPowerBiStandardPages({ write = false } = {}) {
  const changed = [];
  for (const project of powerBiStandardProjects) {
    const routeRoot = path.join(POWERBI_ROOT, project.id);
    const outputs = [
      [path.join(routeRoot, "index.html"), renderCasePage(project)],
      [path.join(routeRoot, "preview.html"), renderPreviewPage(project)],
    ];
    for (const [outputPath, expected] of outputs) {
      let current = "";
      try { current = await fs.readFile(outputPath, "utf8"); } catch {}
      if (current === expected) continue;
      changed.push(path.relative(REPO_ROOT, outputPath).replaceAll("\\", "/"));
      if (write) {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, expected, "utf8");
      }
    }
  }
  return changed;
}

async function main() {
  const write = process.argv.includes("--write");
  const changed = await buildPowerBiStandardPages({ write });
  if (write) {
    console.log(`Generated ${changed.length} Power BI standard page files.`);
    return;
  }
  if (changed.length) {
    console.error(`Power BI standard pages are out of date:\n${changed.join("\n")}`);
    process.exitCode = 1;
    return;
  }
  console.log("Power BI standard pages are current.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
