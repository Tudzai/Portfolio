import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const modelsRoot = path.join(root, "showcase", "financial-models");
const registrySource = await fs.readFile(path.join(modelsRoot, "model-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(registrySource, sandbox, { filename: "model-data.js" });

const models = sandbox.window.TDAT_MODEL_LIBRARY;
if (!Array.isArray(models) || models.length === 0) {
  throw new Error("No financial models found in model-data.js");
}

const CANONICAL_LITE_MODELS = new Map([
  ["project-finance-lite", "Project Finance Lite"],
  ["ecl-credit-stress-lite", "ECL Credit Stress Lite"],
]);

for (const [slug, title] of CANONICAL_LITE_MODELS) {
  const model = models.find((candidate) => candidate.slug === slug);
  if (!model || model.title !== title) {
    throw new Error(`Canonical Lite route changed: ${slug} must remain ${title}`);
  }
}

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const joinChips = (items, className = "model-simple-chip") =>
  items.map((item) => `<li class="${className}">${escapeHtml(item)}</li>`).join("");

const LIMITATIONS = {
  "three-statement-model": "Multi-entity consolidation, monthly planning, IFRS 16, detailed tax, M&A purchase accounting, complex debt tranches, and regulated risk logic.",
  "budget-rolling-forecast": "Statutory consolidation, detailed tax provisioning, department workflow, and automated ERP connections.",
  "thirteen-week-cash-flow": "Bank API connections, invoice-level probability, legal payment prioritization, and lender commitments.",
  "dcf-valuation": "Company-specific filings, option dilution, detailed lease or pension items, reverse DCF, and a formal valuation opinion.",
  "capex-business-case": "Financing structure, lease accounting, detailed tax depreciation, real options, and jurisdiction-specific incentives.",
  "working-capital-planner": "Invoice-level collections, SKU-level safety stock, supplier legal terms, and a daily cash forecast.",
  "variance-bridge-forecast-accuracy": "Statistical forecasting, automated narrative, multi-level allocation, and company-specific variance policy.",
  "headcount-compensation-plan": "Employee-level payroll, country tax tables, equity compensation valuation, HRIS connections, and personal employee data.",
  "trading-comps": "Live market-data refresh, calendarization, detailed normalization, sector modules, and a formal valuation opinion.",
  "ma-accretion-dilution": "A GAAP conclusion, full purchase-price allocation, balance-sheet consolidation, tax structuring, and legal or fairness opinions.",
  "debt-covenant-model": "Legal covenant interpretation, multiple debt tranches, PIK and fee amortization, revolver circularity, waivers, and refinancing commitments.",
  "credit-underwriting-dscr": "Credit approval, borrower ratings, legal review, guarantor analysis, collateral appraisal, and regulatory capital treatment.",
  "project-finance-lite": "Construction-interest circularity, DSRA, detailed tax losses, contractual waterfalls, lender terms, and a bankability opinion.",
  "sme-integrated-forecast": "Full three-statement accounting, tax calendars, invoice-level cash, investor terms, and legal solvency analysis.",
  "multi-entity-consolidation-fx": "Statutory consolidation, historic-rate equity, NCI presentation, cash-flow consolidation, and tax consolidation.",
  "lbo-returns-model": "Funded debt commitments, covenant EBITDA, revolver circularity, management dilution, purchase accounting, and investment advice.",
  "fx-exposure-hedge": "Hedge accounting, effectiveness testing, option valuation, counterparty credit, liquidity limits, and trade execution.",
  "ecl-credit-stress-lite": "IFRS 9 compliance, SICR, discounted lifetime cash flows, transition matrices, regulatory reporting, and model validation.",
  "market-portfolio-stress": "Regulatory VaR or expected shortfall, full revaluation, covariance modeling, derivative greeks, and investment advice.",
  "debt-sculpting-waterfall": "An iterative sculpting solver, multiple debt tranches, tax waterfalls, full reserve agreements, legal subordination, and lender approval.",
  "personal-budget-net-worth": "Tax planning, credit scoring, insurance needs, probabilistic returns, product recommendations, and fiduciary advice.",
  "retirement-scenario-planner": "Probability-of-success simulation, return sequencing, tax and pension rules, benefits, fees, product selection, and financial advice.",
  "pricing-margin-waterfall": "Contract legality, tax and transfer pricing, advanced elasticity, competitor response, and confidential customer data.",
  "saas-unit-economics": "Cohort survival, deferred revenue, GAAP revenue recognition, probabilistic fundraising, and identifiable customer records.",
};

const HERO_TITLE_LINES = {
  "three-statement-model": ["Three-Statement", "Model"],
  "budget-rolling-forecast": ["Budget &", "Rolling Forecast"],
  "thirteen-week-cash-flow": ["13-Week", "Cash Flow"],
  "dcf-valuation": ["DCF", "Valuation"],
  "capex-business-case": ["Capex /", "Business Case"],
  "working-capital-planner": ["Working Capital", "Planner"],
  "variance-bridge-forecast-accuracy": ["Variance Bridge &", "Forecast Accuracy"],
  "headcount-compensation-plan": ["Headcount &", "Compensation Plan"],
  "trading-comps": ["Trading", "Comparables"],
  "ma-accretion-dilution": ["M&A", "Accretion / Dilution"],
  "debt-covenant-model": ["Debt &", "Covenant Model"],
  "credit-underwriting-dscr": ["Credit", "Underwriting / DSCR"],
  "project-finance-lite": ["Project", "Finance Lite"],
  "sme-integrated-forecast": ["SME", "Integrated Forecast"],
  "multi-entity-consolidation-fx": ["Multi-Entity", "Consolidation & FX"],
  "lbo-returns-model": ["LBO", "Returns Model"],
  "fx-exposure-hedge": ["FX", "Exposure & Hedge"],
  "ecl-credit-stress-lite": ["ECL", "Credit Stress Lite"],
  "market-portfolio-stress": ["Market Risk /", "Portfolio Stress"],
  "debt-sculpting-waterfall": ["Debt", "Sculpting & Waterfall"],
  "personal-budget-net-worth": ["Personal Budget &", "Net Worth"],
  "retirement-scenario-planner": ["Retirement", "Scenario Planner"],
  "pricing-margin-waterfall": ["Pricing &", "Margin Waterfall"],
  "saas-unit-economics": ["SaaS", "Unit Economics"],
};

const HERO_TITLE_OVERRIDES = {
  "three-statement-model": {
    sourceTitle: "Three-Statement Model Starter",
    visibleTitle: "Three-Statement Model",
  },
};

for (const model of models) {
  const lines = HERO_TITLE_LINES[model.slug];
  if (!lines) {
    throw new Error(`Missing cinematic title split for ${model.slug}`);
  }
  const override = HERO_TITLE_OVERRIDES[model.slug];
  if (override && model.title !== override.sourceTitle) {
    throw new Error(`Stale cinematic title override for ${model.slug}: ${model.title}`);
  }
  const expectedTitle = override?.visibleTitle || model.title;
  if (lines.join(" ") !== expectedTitle) {
    throw new Error(`Cinematic title split does not match ${model.slug}: ${lines.join(" ")}`);
  }
}

const heroTitle = (model) => {
  const lines = HERO_TITLE_LINES[model.slug];
  const longestLine = Math.max(...lines.map((line) => line.length));
  const sizeClass = longestLine >= 19 ? " is-long-title" : longestLine >= 16 ? " is-medium-title" : "";
  const markup = lines
    .map((line) => `<span>${escapeHtml(line).replaceAll("-", "-<wbr>")}</span>`)
    .join(" ");
  return { markup, sizeClass };
};

const qaContract = (qa = "") => {
  const normalized = String(qa).replace(/\s+/g, " ").trim();
  const controls = normalized.match(/(\d+)\s*\/\s*(\d+)\s+(?:calculation controls|published checks|checks)\s+PASS/i);
  const sheets = normalized.match(/(\d+)\s*\/\s*(\d+)\s+sheets rendered/i);
  if (!controls || !sheets) {
    throw new Error(`Malformed model QA contract: ${normalized || "<empty>"}`);
  }
  const [controlsPassed, controlsTotal] = controls.slice(1).map(Number);
  const [sheetsRendered, sheetsTotal] = sheets.slice(1).map(Number);
  if (controlsPassed !== 10 || controlsTotal !== 10 || sheetsRendered !== 5 || sheetsTotal !== 5) {
    throw new Error(`Unexpected model QA totals: ${normalized}`);
  }
  const controlsText = `${controls[1]} / ${controls[2]} calculation controls PASS`;
  const sheetsText = `${sheets[1]} / ${sheets[2]} sheets rendered`;
  return `${controlsText}; ${sheetsText}`;
};

const qaShort = (qa = "") => qaContract(qa).split(";")[0];

const fileNameFrom = (model) => path.posix.basename(model.file.path);

const page = (model) => {
  const title = escapeHtml(model.title);
  const id = escapeHtml(model.id);
  const decision = escapeHtml(model.decision);
  const fileName = escapeHtml(fileNameFrom(model));
  const qaBadge = escapeHtml(qaShort(model.qa));
  const qaFull = escapeHtml(qaContract(model.qa));
  const heading = heroTitle(model);
  const heroDeck = model.slug === "three-statement-model"
    ? "Build a five-year plan where operating assumptions flow through profit, cash, debt, and a balanced balance sheet."
    : model.decision;
  const canonical = `https://tudzai.github.io/Portfolio/showcase/financial-models/${encodeURIComponent(model.slug)}/`;
  const metaDescription = `Download the ${model.title} Excel model. See what it answers, what to edit, how the model works, and what to review.`;
  const bestFor = (model.roles || []).slice(0, 4);
  const includes = (model.tags || model.useCases || []).slice(0, 5);
  const cinematicStylesheet = `\n    <link rel="stylesheet" data-model-variant href="../../../assets/agentic-home/css/templates/model-cinematic.css?v=model-cinematic-20260817-1" />`;
  const cinematicScript = `\n    <script data-model-variant src="../../../assets/agentic-home/js/model-lightbox.js?v=model-lightbox-20260817-1"></script>`;
  const fontStylesheet = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&family=Manrope:wght@500;600;700;800&display=swap";
  const previewTargets = [
    { file: "cover", label: "Start", summary: "Purpose and status", alt: "start sheet" },
    { file: "inputs", label: "Inputs", summary: "Blue editable drivers", alt: "inputs sheet" },
    { file: "model", label: "Model", summary: "Schedules, bridges, and formulas", alt: "detailed model sheet" },
    { file: "summary", label: "Results", summary: "Four decision KPIs", alt: "results sheet" },
    { file: "checks", label: "Checks", summary: "Formula controls", alt: "checks sheet" },
  ];
  const galleryMarkup = previewTargets.map((preview, index) => {
    const image = `<img src="assets/${preview.file}.png" alt="${title} ${preview.alt}" loading="lazy" />`;
    const caption = `<span><strong>${preview.label}</strong><small>${preview.summary}</small></span>`;
    return `<button class="model-cinema-gallery-trigger" type="button" data-model-preview data-model-preview-index="${index}" data-model-preview-src="assets/${preview.file}.png" data-model-preview-label="${preview.label}" aria-haspopup="dialog" aria-controls="model-image-viewer" aria-label="Preview the ${title} ${preview.alt} without leaving this page">${image}${caption}</button>`;
  }).join("\n          ");
  const lightboxMarkup = `\n    <dialog id="model-image-viewer" class="model-cinema-lightbox" data-model-lightbox aria-labelledby="model-lightbox-title">
      <div class="model-cinema-lightbox-panel">
        <header class="model-cinema-lightbox-bar">
          <div><span>Workbook preview</span><strong id="model-lightbox-title" data-model-lightbox-title>Results sheet</strong></div>
          <button type="button" data-model-lightbox-close aria-label="Close sheet preview"><span>Close</span><b aria-hidden="true">&times;</b></button>
        </header>
        <div class="model-cinema-lightbox-canvas" data-model-lightbox-canvas tabindex="0" aria-label="Scrollable sheet preview">
          <img data-model-lightbox-image src="assets/summary.png" alt="${title} results sheet" />
        </div>
        <footer class="model-cinema-lightbox-footer">
          <p data-model-lightbox-caption>Results &middot; Four decision KPIs</p>
          <div class="model-cinema-lightbox-controls" aria-label="Sheet preview controls">
            <span data-model-lightbox-count aria-live="polite">Sheet 4 of 5</span>
            <button type="button" data-model-lightbox-zoom aria-pressed="false">Read detail</button>
          </div>
        </footer>
      </div>
    </dialog>`;
  const heroMarkup = `      <section class="model-simple-hero model-cinema-hero" data-core-section="hero" aria-labelledby="model-title">
        <nav class="breadcrumb model-cinema-breadcrumb" aria-label="Breadcrumb"><a href="../index.html"><span aria-hidden="true">&larr;</span> Financial models</a></nav>
        <div class="model-simple-hero-grid model-cinema-grid">
          <div class="model-simple-copy model-cinema-copy">
            <h1 id="model-title" class="${heading.sizeClass.trim()}" aria-label="${title}">${heading.markup}</h1>
            <p class="model-cinema-deck">${escapeHtml(heroDeck)}</p>
            <div class="model-simple-actions model-cinema-actions">
              <a class="button primary" href="model/${fileName}" download="${fileName}" data-track-event="model downloaded" data-track-label="${id}" data-track-location="model detail hero">Download Excel <span aria-hidden="true">&darr;</span></a>
              <a class="button quiet" href="#preview-title">Preview the 5 sheets <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>
          <div class="model-cinema-visual">
            <div class="model-cinema-stack">
              <span class="model-cinema-sheet model-cinema-sheet-back" aria-hidden="true"><b>MODEL</b></span>
              <span class="model-cinema-sheet model-cinema-sheet-mid" aria-hidden="true"><b>INPUTS</b></span>
              <button class="model-simple-hero-preview model-cinema-preview" type="button" data-model-preview data-model-preview-index="3" data-model-preview-src="assets/summary.png" data-model-preview-label="Results" aria-haspopup="dialog" aria-controls="model-image-viewer" aria-label="Preview the ${title} results sheet without leaving this page">
                <span class="model-simple-preview-label"><span><i aria-hidden="true"></i> Results preview</span><strong>${qaBadge}</strong></span>
                <img src="assets/summary.png" alt="${title} results sheet" width="1560" height="1326" loading="eager" fetchpriority="high" decoding="async" />
                <span class="model-cinema-open" aria-hidden="true">Open full view <b>&nearr;</b></span>
              </button>
            </div>
            <ol class="model-cinema-trace" aria-label="Workbook flow">
              <li>Inputs</li><li>Model</li><li>Results</li><li>Checks</li>
            </ol>
          </div>
        </div>
      </section>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta name="robots" content="index, follow" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(metaDescription)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title} | TDAT Financial Models" />
    <meta property="og:description" content="${decision}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${canonical}assets/summary.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <title>${title} | TDAT Financial Models</title>
    <link rel="icon" href="../../../assets/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${fontStylesheet}" rel="stylesheet" />
    <link rel="stylesheet" href="../../../styles.css" />
    <link rel="stylesheet" href="../models.css" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/tokens.css?v=routes-20260810-hybrid1" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/base.css?v=routes-20260810-hybrid1" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/shell.css?v=routes-20260813-atmark3" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/components.css?v=routes-20260810-hybrid1" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/templates.css?v=routes-20260813-inset1" />
    <link rel="stylesheet" data-agentic-theme href="../../../assets/agentic-home/css/templates/model-detail.css?v=routes-20260817-detail1" />${cinematicStylesheet}
    <script src="../../../analytics.js?v=posthog-replay-fix-20260816"></script>
  </head>
  <body class="detail-page models-page" data-stage-family="models" data-stage-template="model-detail" data-model-slug="${escapeHtml(model.slug)}">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header stage-shell-header" data-stage-shell data-header>
      <div class="page-shell header-inner stage-shell-inner">
        <a class="brand stage-shell-brand" href="../../../index.html#hero" aria-label="Truong Dinh Anh Tu, homepage">
          <span class="brand-mark stage-shell-brand-mark" aria-hidden="true"></span>
          <span class="brand-copy stage-shell-brand-copy"><strong>Truong Dinh Anh Tu</strong><small>Finance &times; AI</small></span>
        </a>
        <div class="header-actions stage-shell-actions">
          <button class="menu-button stage-shell-menu-button" type="button" data-stage-menu-toggle aria-expanded="false" aria-controls="primary-navigation" aria-label="Open capabilities menu"><span>Capabilities</span><i aria-hidden="true"></i></button>
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
            <a href="../../powerbi/index.html"><span>03</span>BI Dashboards <i aria-hidden="true">&rarr;</i></a>
            <a href="../index.html" aria-current="page"><span>04</span>Financial Models <i aria-hidden="true">&rarr;</i></a>
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
    </header>

    <main id="main-content" class="page-shell model-simple-page" data-stage-content tabindex="-1">
${heroMarkup}

      <section id="how-to-use" class="model-simple-section" data-core-section="evidence" aria-labelledby="use-title">
        <div class="model-simple-heading">
          <p class="section-kicker">Quick start</p>
          <h2 id="use-title">Use it in four steps.</h2>
        </div>
        <ol class="model-simple-steps">
          <li><span aria-hidden="true">1</span><div><strong>Edit Inputs</strong><small>Change only blue values.</small></div></li>
          <li><span aria-hidden="true">2</span><div><strong>Trace Model</strong><small>Follow visible schedules and bridges.</small></div></li>
          <li><span aria-hidden="true">3</span><div><strong>Read Results</strong><small>Start with the four decision KPIs.</small></div></li>
          <li><span aria-hidden="true">4</span><div><strong>Confirm Checks</strong><small>Every control should say PASS.</small></div></li>
        </ol>
        <div class="model-simple-fit">
          <div><h3>Best for</h3><ul>${joinChips(bestFor)}</ul></div>
          <div><h3>Includes</h3><ul>${joinChips(includes)}</ul></div>
        </div>
      </section>

      <section class="model-simple-section model-simple-see" data-core-section="action" aria-labelledby="preview-title">
        <div class="model-simple-heading">
          <p class="section-kicker">Inside the file</p>
          <h2 id="preview-title">See every sheet before you download.</h2>
        </div>
        <div class="model-simple-gallery">
          ${galleryMarkup}
        </div>
        <details class="model-simple-proof">
          <summary>QA and limitations</summary>
          <div>
            <dl class="model-simple-technical">
              <div><dt>Version</dt><dd>${escapeHtml(model.version)}</dd></div>
              <div><dt>Tested</dt><dd>${escapeHtml(model.lastTested)}</dd></div>
              <div><dt>File</dt><dd>${escapeHtml(model.file.size)}</dd></div>
              <div><dt>QA</dt><dd>${qaFull}</dd></div>
            </dl>
            <p><strong>Not included:</strong> ${escapeHtml(LIMITATIONS[model.slug] || "Company-specific policy, regulated review, or professional advice.")}</p>
            <p><strong>Use:</strong> Adapt this synthetic, macro-free template in ${escapeHtml(model.compatibility || "Excel")}. Validate inputs, method, policy, and outputs before relying on it.</p>
          </div>
        </details>
        <div class="model-simple-download">
          <div><p class="section-kicker">Ready to use</p><h2>Download. Edit blue. Trace the model. Review checks.</h2></div>
          <a class="button primary" href="model/${fileName}" download="${fileName}" data-track-event="model downloaded" data-track-label="${id}" data-track-location="model detail footer">Download Excel</a>
        </div>
      </section>${lightboxMarkup}
    </main>

    <footer class="stage-site-footer stage-shell-footer" data-stage-shell>
      <div class="page-shell stage-shell-footer-inner">
        <span>&copy; <span data-current-year>2026</span> Truong Dinh Anh Tu</span>
        <a class="back-to-top stage-back-to-top" href="#main-content" aria-label="Back to top" tabindex="-1"><span aria-hidden="true">&uarr;</span></a>
      </div>
    </footer>
    <script data-agentic-theme src="../../../assets/agentic-home/js/navigation.js?v=routes-20260810-hybrid1"></script>
    <script data-agentic-theme src="../../../assets/agentic-home/js/site.js?v=routes-20260810-hybrid1"></script>${cinematicScript}
  </body>
</html>
`;
};

if (models.length !== 24) {
  throw new Error(`Expected exactly 24 financial models, found ${models.length}`);
}

const seenSlugs = new Set();
const seenIds = new Set();
const preflightModels = [];

for (const model of models) {
  if (!model.slug || !model.id || !model.file?.path) {
    throw new Error("Every financial model needs a slug, ID, and workbook path");
  }
  if (seenSlugs.has(model.slug) || seenIds.has(model.id)) {
    throw new Error(`Duplicate financial model slug or ID: ${model.slug} / ${model.id}`);
  }
  seenSlugs.add(model.slug);
  seenIds.add(model.id);
  qaContract(model.qa);
  if (!LIMITATIONS[model.slug]) {
    throw new Error(`Missing model-specific limitation for ${model.slug}`);
  }
  const routeDir = path.join(modelsRoot, model.slug);
  const workbookPath = path.join(modelsRoot, ...model.file.path.split("/"));
  const expectedWorkbook = path.join(routeDir, "model", fileNameFrom(model));
  if (path.normalize(workbookPath) !== path.normalize(expectedWorkbook)) {
    throw new Error(`Workbook path mismatch for ${model.slug}`);
  }
  await fs.access(expectedWorkbook);
  await fs.access(path.join(routeDir, "assets", "cover.png"));
  await fs.access(path.join(routeDir, "assets", "inputs.png"));
  await fs.access(path.join(routeDir, "assets", "model.png"));
  await fs.access(path.join(routeDir, "assets", "summary.png"));
  await fs.access(path.join(routeDir, "assets", "checks.png"));
  preflightModels.push({ model, routeDir });
}

for (const { model, routeDir } of preflightModels) {
  await fs.writeFile(path.join(routeDir, "index.html"), page(model), "utf8");
}

console.log(`Rebuilt ${preflightModels.length} five-sheet detailed-model routes.`);
