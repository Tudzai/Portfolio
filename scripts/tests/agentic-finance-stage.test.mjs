import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyRoute,
  composeStageDocument,
  isSelfContainedPowerBiPreview,
  isScopedHtmlRoute,
  rewriteHtmlForStage,
  templateStylesheetFor,
} from "../build-agentic-finance-stage.mjs";
import { getStageRouteContext } from "../agentic-finance-route-context.mjs";
import { validateStageStructure } from "../validate-agentic-finance-stage.mjs";

const FIXTURE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "agentic-finance");
const loadFixture = (name) => fs.readFile(path.join(FIXTURE_DIR, name), "utf8");

const stageContext = (sourcePath) => ({
  sourcePath,
  stagePath: `Stage/agentic-finance/${sourcePath}`,
  scopedRoutes: new Set(["index.html", "cv.html", sourcePath]),
});

test("classifies portfolio routes into stage families and templates", () => {
  assert.deepEqual(classifyRoute("showcase/powerbi/example/preview.html"), {
    family: "powerbi",
    template: "dashboard-preview",
  });
  assert.deepEqual(classifyRoute("showcase/financial-models/dcf-valuation/index.html"), {
    family: "models",
    template: "model-detail",
  });
  assert.deepEqual(classifyRoute("blog/predictive-collections-agent/index.html"), {
    family: "blog",
    template: "article",
  });
});

test("describes route families with recruiter-scannable context", () => {
  assert.deepEqual(
    getStageRouteContext({
      sourcePath: "showcase/financial-models/fx-exposure-hedge/index.html",
      family: "models",
      template: "model-detail",
    }),
    {
      index: "04",
      label: "Model / Workbook",
      flow: ["Inputs", "Logic", "Controls"],
      evidence: "Governed synthetic workbook",
      hubRoute: "showcase/financial-models/index.html",
      hubLabel: "Model library",
    },
  );
});

test("provides context for every generated route template", () => {
  const cases = [
    ["core", "cv", "cv.html", "Profile / CV", "Portfolio home"],
    ["core", "utility", "share.html", "Portfolio / Route", "Portfolio home"],
    ["blog", "hub", "blog/index.html", "Blog / Library", "Portfolio home"],
    ["blog", "article", "blog/example/index.html", "Blog / Article", "All articles"],
    ["blog", "deck", "blog/example/deck/index.html", "Blog / Interactive Story", "Article page"],
    ["fpa", "hub", "showcase/fpa-decision-cases/index.html", "FP&A / Library", "Portfolio home"],
    ["fpa", "case", "showcase/fpa-decision-cases/example/index.html", "FP&A / Case", "FP&A cases"],
    ["automation", "hub", "showcase/python-automation/index.html", "Automation / Library", "Portfolio home"],
    ["automation", "case", "showcase/python-automation/example/index.html", "Automation / Workflow", "Automation library"],
    ["powerbi", "hub", "showcase/powerbi/index.html", "BI / Library", "Portfolio home"],
    ["powerbi", "case", "showcase/powerbi/example/index.html", "BI / Decision Product", "BI dashboards"],
    ["powerbi", "dashboard-preview", "showcase/powerbi/example/preview.html", "BI / Interactive Preview", "Project page"],
    ["models", "hub", "showcase/financial-models/index.html", "Models / Library", "Portfolio home"],
    ["models", "model-detail", "showcase/financial-models/example/index.html", "Model / Workbook", "Model library"],
  ];

  for (const [family, template, sourcePath, label, hubLabel] of cases) {
    const context = getStageRouteContext({ sourcePath, family, template });
    assert.equal(context.label, label, `${family}/${template} label`);
    assert.equal(context.hubLabel, hubLabel, `${family}/${template} CTA`);
    assert.equal(context.flow.length, 3, `${family}/${template} flow`);
  }
});

test("returns a detail-page destination from interactive preview routes", () => {
  assert.equal(
    getStageRouteContext({
      sourcePath: "blog/predictive-collections-agent/deck/index.html",
      family: "blog",
      template: "deck",
    }).hubRoute,
    "blog/predictive-collections-agent/index.html",
  );
  assert.equal(
    getStageRouteContext({
      sourcePath: "showcase/powerbi/driver-based-forecasting/preview.html",
      family: "powerbi",
      template: "dashboard-preview",
    }).hubRoute,
    "showcase/powerbi/driver-based-forecasting/index.html",
  );
  assert.equal(
    getStageRouteContext({
      sourcePath: "showcase/powerbi/project-preview.html",
      family: "powerbi",
      template: "dashboard-preview",
    }).hubRoute,
    "showcase/powerbi/index.html",
  );
});

test("accepts exactly the recruiter-facing HTML route boundary", () => {
  assert.equal(isScopedHtmlRoute("index.html"), true);
  assert.equal(isScopedHtmlRoute("showcase/powerbi/project-preview.html"), true);
  assert.equal(isScopedHtmlRoute("Stage/agentic-finance/index.html"), false);
  assert.equal(isScopedHtmlRoute("knowledge-vault/index.html"), false);
  assert.equal(isScopedHtmlRoute("collections-agent/index.html"), false);
  assert.equal(isScopedHtmlRoute("cv-pdf.html"), false);
  assert.equal(isScopedHtmlRoute("assets/vendor/pdfjs/6.1.200/web/viewer.html"), false);
  assert.equal(isScopedHtmlRoute("scripts/tests/fixtures/agentic-finance/legacy-shell.html"), false);
  assert.equal(isScopedHtmlRoute("showcase/python-automation/fpa-monthly-reporting-demo/remotion/node_modules/vite/index.html"), false);
});

test("rewrites staged HTML routes while preserving canonical asset references", () => {
  const html = `
    <head><meta name="robots" content="index, follow"><link rel="stylesheet" href="../../styles.css"></head>
    <body><a href="../../showcase/powerbi/">Power BI</a><img src="../../assets/logo.svg"><script src="../../analytics.js"></script></body>
  `;
  const result = rewriteHtmlForStage(html, {
    sourcePath: "blog/example/index.html",
    stagePath: "Stage/agentic-finance/blog/example/index.html",
    scopedRoutes: new Set(["showcase/powerbi/index.html"]),
  });

  assert.match(result, /noindex, nofollow, noarchive/);
  assert.match(result, /href="\.\.\/\.\.\/showcase\/powerbi\/index\.html"/);
  assert.doesNotMatch(result, /analytics\.js/);
  assert.match(result, /stage-family/);
});

test("leaves runtime template URLs untouched", () => {
  const html = '<script>document.body.innerHTML = `<a href="${row.url}">${row.name}</a>`;</script>';
  const result = rewriteHtmlForStage(html, {
    sourcePath: "showcase/powerbi/example/preview.html",
    stagePath: "Stage/agentic-finance/showcase/powerbi/example/preview.html",
    scopedRoutes: new Set(["showcase/powerbi/index.html"]),
  });

  assert.match(result, /href="\$\{row\.url\}"/);
});

test("replaces legacy portfolio chrome with one shared Agentic Finance shell", async () => {
  const result = composeStageDocument(
    await loadFixture("legacy-shell.html"),
    stageContext("showcase/financial-models/example/index.html"),
  );

  assert.equal((result.match(/data-stage-shell/g) ?? []).length, 2);
  assert.match(result, /class="site-header stage-shell-header"/);
  assert.match(result, /data-stage-shell data-header/);
  assert.match(result, /class="page-shell header-inner stage-shell-inner"/);
  assert.match(result, /href="\.\.\/\.\.\/\.\.\/blog\/index\.html">Blog<\/a>/);
  assert.equal((result.match(/class="stage-site-footer stage-shell-footer"/g) ?? []).length, 1);
  assert.match(result, /class="back-to-top stage-back-to-top"/);
  assert.doesNotMatch(result, /Finance judgment \/ Practical technology \/ Visible ownership/);
  assert.doesNotMatch(result, /class="mobile-nav"/);
  assert.match(result, /<div id="main-content" tabindex="-1"><\/div>/);
  assert.match(result, /<main data-stage-content>[\s\S]*<h1>Decision evidence<\/h1>/);
  assert.match(result, /<h1>Decision evidence<\/h1>/);
  assert.match(result, /href="\.\.\/\.\.\/\.\.\/index\.html#hero"/);
  assert.doesNotMatch(result, /\n[\t ]+\n[\t ]*<footer class="stage-site-footer/);
});

test("adds the shared shell to headerless Power BI pages", async () => {
  const result = composeStageDocument(
    await loadFixture("headerless-page.html"),
    stageContext("showcase/powerbi/index.html"),
  );

  assert.match(result, /class="site-header stage-shell-header"/);
  assert.match(result, /aria-current="page"><span>03<\/span>BI Dashboards/);
  assert.match(result, /<div id="main-content" tabindex="-1"><\/div>/);
  assert.match(result, /<main class="shell" data-stage-content>[\s\S]*<h1>BI Dashboards<\/h1>/);
});

test("preserves dashboard-internal topbars while adding the shared shell", async () => {
  const result = composeStageDocument(
    await loadFixture("dashboard-topbar.html"),
    stageContext("showcase/powerbi/example/preview.html"),
  );

  assert.equal((result.match(/class="site-header stage-shell-header"/g) ?? []).length, 1);
  assert.match(result, /class="topbar"/);
  assert.match(result, /Dashboard evidence chrome/);
});

test("keeps per-project Power BI previews dashboard-only in Stage", () => {
  assert.equal(isSelfContainedPowerBiPreview("showcase/powerbi/monthly-fpa-performance-pack/preview.html"), true);
  assert.equal(isSelfContainedPowerBiPreview("showcase/powerbi/board-investor-cfo-pack/preview.html"), true);
  assert.equal(isSelfContainedPowerBiPreview("showcase/powerbi/project-preview.html"), false);

  const html = `<!doctype html><html><head><meta name="robots" content="noindex, nofollow, noarchive"></head><body>
    <div class="preview-frame"><div class="dashboard-shell"><div class="dashboard"></div></div></div>
  </body></html>`;
  assert.deepEqual(validateStageStructure(html, {
    source: "showcase/powerbi/monthly-fpa-performance-pack/preview.html",
    template: "dashboard-preview",
  }), []);
});

test("preserves route-owned scripts after an internal dashboard main", () => {
  const html = `<!doctype html><html><head></head><body>
    <header class="site-header" data-stage-shell></header>
    <main class="dashboard" data-stage-content><section>Dashboard</section></main>
    <script>window.renderDashboard = () => "ready";</script>
    <footer class="stage-site-footer" data-stage-shell></footer>
  </body></html>`;
  const result = composeStageDocument(
    html,
    stageContext("showcase/powerbi/example/preview.html"),
  );

  assert.match(result, /window\.renderDashboard = \(\) => "ready"/);
  assert.equal((result.match(/class="stage-site-footer stage-shell-footer"/g) ?? []).length, 1);
});

test("injects one route context rail into generated branch content", async () => {
  const result = composeStageDocument(
    await loadFixture("legacy-shell.html"),
    stageContext("showcase/financial-models/example/index.html"),
  );

  assert.equal((result.match(/data-stage-route-intro/g) ?? []).length, 1);
  assert.match(result, /Model \/ Workbook/);
  assert.match(result, /<li>Inputs<\/li>\s*<li>Logic<\/li>\s*<li>Controls<\/li>/);
  assert.match(result, /Governed synthetic workbook/);
  assert.match(result, /href="\.\.\/index\.html"[^>]*>\s*Model library/);
  assert.match(result, /<main data-stage-content>\s*<section class="stage-route-intro"/);
});

test("keeps deck context outside the fixed presentation stage", () => {
  const html = `<!doctype html><html><head></head><body>
    <div class="deck-viewport">
      <main class="deck-stage"><section class="slide active">Story</section></main>
    </div>
  </body></html>`;
  const result = composeStageDocument(
    html,
    stageContext("blog/predictive-collections-agent/deck/index.html"),
  );

  assert.equal((result.match(/data-stage-route-intro/g) ?? []).length, 1);
  assert.match(result, /<section class="stage-route-intro"[\s\S]*?<div class="deck-viewport">/);
  assert.doesNotMatch(result, /<main class="deck-stage" data-stage-content>\s*<section class="stage-route-intro"/);
});

test("selects one adapter stylesheet for every route template", () => {
  assert.equal(templateStylesheetFor("hub"), "templates/hub.css");
  assert.equal(templateStylesheetFor("case"), "templates/case.css");
  assert.equal(templateStylesheetFor("dashboard-preview"), "templates/dashboard-preview.css");
  assert.equal(templateStylesheetFor("model-detail"), "templates/model-detail.css");
  assert.equal(templateStylesheetFor("article"), "templates/article.css");
  assert.equal(templateStylesheetFor("deck"), "templates/deck.css");
  assert.equal(templateStylesheetFor("cv"), "templates/cv.css");
  assert.equal(templateStylesheetFor("utility"), "templates/utility.css");
});

test("requires one shared shell and the matching template adapter", () => {
  const html = `
    <link rel="stylesheet" href="assets/css/tokens.css">
    <link rel="stylesheet" href="assets/css/templates/case.css">
    <header class="site-header" data-stage-shell></header>
    <main id="main-content"></main>
    <footer class="stage-site-footer" data-stage-shell></footer>
  `;
  assert.deepEqual(validateStageStructure(html.replace('<main id="main-content">', '<main id="main-content" data-stage-content>'), { template: "case" }), []);
  assert.match(
    validateStageStructure(`${html}\n<header class="site-header" data-stage-shell></header>`, { template: "case" }).join("; "),
    /one shared stage header/,
  );
  assert.match(validateStageStructure(html, { template: "case" }).join("; "), /stage content boundary/);
});

test("maps legacy homepage fragments to valid Agentic Finance sections", () => {
  const html = [
    '<a href="../../../index.html#top">Home</a>',
    '<a href="../../../index.html#fit">Fit</a>',
    '<a href="../../../index.html#proof">Proof</a>',
    '<a href="../../../index.html#decision-cases">Decision Cases</a>',
    '<a href="../../../index.html#bi-products">BI Products</a>',
    '<a href="../../../index.html#automation">Automation</a>',
    '<a href="../../../index.html#value">Value</a>',
    '<a href="../../../index.html#approach">Approach</a>',
    '<a href="../../../index.html#contact">Contact</a>',
  ].join("");
  const result = rewriteHtmlForStage(html, {
    sourcePath: "showcase/financial-models/example/index.html",
    stagePath: "Stage/agentic-finance/showcase/financial-models/example/index.html",
    scopedRoutes: new Set(["index.html"]),
  });

  assert.match(result, /href="\.\.\/\.\.\/\.\.\/index\.html#hero"/);
  assert.match(result, /href="\.\.\/\.\.\/\.\.\/index\.html#experience"/);
  assert.equal((result.match(/href="\.\.\/\.\.\/\.\.\/index\.html#work"/g) ?? []).length, 4);
  assert.match(result, /href="\.\.\/\.\.\/\.\.\/index\.html#case-automation"/);
  assert.match(result, /href="\.\.\/\.\.\/\.\.\/index\.html#demo"/);
  assert.match(result, /href="\.\.\/\.\.\/\.\.\/index\.html#contact"/);
});

test("keeps the staged 404 inside the Agentic Finance review", () => {
  const html = `<!doctype html><html><head>
    <meta http-equiv="refresh" content="0; url=https://example.com/">
    <script>window.location.replace("https://example.com/");</script>
  </head><body><main><h1>Not found</h1></main></body></html>`;
  const result = composeStageDocument(html, stageContext("404.html"));

  assert.doesNotMatch(result, /http-equiv="refresh"/i);
  assert.doesNotMatch(result, /window\.location\.replace/);
  assert.match(result, /<h1>Not found<\/h1>/);
  assert.match(result, /data-stage-template="utility"/);
});
