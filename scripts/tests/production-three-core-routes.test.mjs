import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { composeStageDocument } from "../build-agentic-finance-stage.mjs";
import { cleanExistingTheme, promoteStageHtml } from "../promote-agentic-finance-production.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFile(path.join(repoRoot, relativePath), "utf8");

const threeCoreRoutes = [
  "showcase/fpa-decision-cases/ebitda-variance-bridge/index.html",
  "showcase/fpa-decision-cases/working-capital-cash-runway/index.html",
  "showcase/python-automation/monthly-reporting-pipeline/index.html",
  "showcase/financial-models/index.html",
  "showcase/python-automation/quick-kpi-file-distribution/index.html",
  "blog/predictive-collections-agent/index.html",
];

test("keeps every simplified route to three visible core sections", async () => {
  for (const route of threeCoreRoutes) {
    const html = await read(route);
    const sections = [...html.matchAll(/data-core-section="([^"]+)"/g)].map((match) => match[1]);

    assert.match(html, /class="[^"]*simple-three-page/);
    assert.match(html, /templates\/simple-three\.css\?v=three-core-202608(?:12-4|13-6|16-cash-grid1)/);
    assert.deepEqual(sections, ["hero", "evidence", "action"], route);
  }
});

test("puts the reporting automation demo first and preserves intentional playback behavior", async () => {
  const [homepage, reporting] = await Promise.all([
    read("index.html"),
    read("showcase/python-automation/monthly-reporting-pipeline/index.html"),
  ]);

  assert.match(homepage, /id="automation-case-video"[\s\S]*?data-playback-rate="5"/);
  assert.match(reporting, /class="detail-hero python-detail-hero simple-automation-hero"[^>]*data-core-section="hero"[\s\S]*?id="reporting-pipeline-video"/);
  assert.match(reporting, /id="reporting-pipeline-video"[\s\S]*?controls[\s\S]*?data-autoplay="false"/);
  assert.doesNotMatch(reporting, /id="reporting-pipeline-video"[\s\S]*?data-playback-rate=/);
});

test("uses the Option C five-sheet detailed layout for the rolling forecast", async () => {
  const [html, css] = await Promise.all([
    read("showcase/financial-models/budget-rolling-forecast/index.html"),
    read("assets/agentic-home/css/templates/model-detail.css"),
  ]);

  assert.match(html, /class="detail-page models-page"/);
  assert.match(html, /class="page-shell model-simple-page"/);
  assert.match(html, /<h2 id="use-title">Use it in four steps\.<\/h2>/);
  assert.equal((html.match(/<li><span aria-hidden="true">[1-4]<\/span><div>/g) ?? []).length, 4);
  assert.match(html, /<strong>Trace Model<\/strong>/);
  assert.equal((html.match(/class="model-simple-section/g) ?? []).length, 2);
  assert.deepEqual(
    [...html.matchAll(/data-core-section="([^"]+)"/g)].map((match) => match[1]),
    ["hero", "evidence", "action"],
  );
  assert.equal((html.match(/data-track-event="model downloaded"/g) ?? []).length, 2);
  assert.equal((html.match(/<button class="model-cinema-gallery-trigger"/g) ?? []).length, 5);
  assert.equal((html.match(/assets\/(?:cover|inputs|model|summary|checks)\.png/g) ?? []).length, 14);
  assert.match(html, /10 \/ 10 calculation controls PASS; 5 \/ 5 sheets rendered/);
  assert.match(css, /\.model-simple-hero-grid\s*\{[^}]*grid-template-columns:/s);
  assert.match(css, /\.model-simple-steps\s*\{[^}]*grid-template-columns:\s*repeat\(4,/s);
  assert.match(css, /\.model-simple-gallery\s*\{[^}]*grid-template-columns:\s*repeat\(5,/s);
  assert.match(css, /--model-charcoal:\s*#30273a/);
  assert.match(css, /--model-gold:\s*#b88a2a/);
});

test("uses the cinematic model-detail system across all 24 model routes", async () => {
  const [html, css, lightboxJs, budgetRoute, registrySource] = await Promise.all([
    read("showcase/financial-models/three-statement-model/index.html"),
    read("assets/agentic-home/css/templates/model-cinematic.css"),
    read("assets/agentic-home/js/model-lightbox.js"),
    read("showcase/financial-models/budget-rolling-forecast/index.html"),
    read("showcase/financial-models/model-data.js"),
  ]);

  assert.match(html, /data-stage-template="model-detail" data-model-slug="three-statement-model"/);
  assert.deepEqual(
    [...html.matchAll(/data-core-section="([^"]+)"/g)].map((match) => match[1]),
    ["hero", "evidence", "action"],
  );
  assert.match(html, /class="model-simple-hero model-cinema-hero"[^>]*aria-labelledby="model-title"/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /<h1 id="model-title" class="" aria-label="Three-Statement Model Starter"><span>Three-<wbr>Statement<\/span> <span>Model<\/span><\/h1>/);
  assert.doesNotMatch(html, /model-cinema-eyebrow|Three statements &middot; Five years &middot; One audit trail/);
  assert.match(html, /Build a five-year plan where operating assumptions flow through profit, cash, debt, and a balanced balance sheet\./);
  assert.doesNotMatch(html, /model-cinema-proof|model-cinema-compatibility|Excel 365 &middot; Macro-free/);
  assert.doesNotMatch(html.match(/<section class="model-simple-hero model-cinema-hero"[\s\S]*?<\/section>/)?.[0] ?? "", /Five-sheet standard:/);
  assert.match(html, /model-cinematic\.css\?v=model-cinematic-20260817-1/);
  assert.match(html, /model-lightbox\.js\?v=model-lightbox-20260817-1/);
  assert.match(html, /family=DM\+Sans:[^\"]+family=Manrope:/);
  assert.match(budgetRoute, /model-cinematic\.css[^\"]*[\s\S]*?model-cinema-hero[\s\S]*?model-image-viewer[\s\S]*?model-lightbox\.js/);

  assert.equal((html.match(/href="model\/tdat-three-statement-model\.xlsx"/g) ?? []).length, 2);
  assert.equal((html.match(/download="tdat-three-statement-model\.xlsx"/g) ?? []).length, 2);
  assert.equal((html.match(/data-track-event="model downloaded"/g) ?? []).length, 2);
  assert.match(html, /data-track-label="TDAT-FM-CORE-001" data-track-location="model detail hero"/);
  assert.match(html, /data-track-label="TDAT-FM-CORE-001" data-track-location="model detail footer"/);
  assert.match(html, /src="assets\/summary\.png"[^>]*width="1560" height="1326"[^>]*fetchpriority="high"/);
  assert.doesNotMatch(html, /<a\b[^>]*href="assets\/(?:cover|inputs|model|summary|checks)\.png"/);

  const previewButtons = [...html.matchAll(/<button\b(?=[^>]*\bdata-model-preview\b)[^>]*>/g)].map((match) => match[0]);
  assert.equal(previewButtons.length, 6);
  for (const button of previewButtons) {
    assert.match(button, /type="button"/);
    assert.match(button, /aria-haspopup="dialog"/);
    assert.match(button, /aria-controls="model-image-viewer"/);
  }
  const previewSources = previewButtons.map((button) => button.match(/data-model-preview-src="assets\/([^"]+)\.png"/)?.[1]);
  assert.deepEqual(previewSources, ["summary", "cover", "inputs", "model", "summary", "checks"]);

  const gallery = html.match(/<div class="model-simple-gallery">([\s\S]*?)<\/div>/)?.[1] ?? "";
  const galleryFiles = [...gallery.matchAll(/data-model-preview-src="assets\/(cover|inputs|model|summary|checks)\.png"/g)].map((match) => match[1]);
  assert.deepEqual(galleryFiles, ["cover", "inputs", "model", "summary", "checks"]);
  assert.match(html, /<dialog id="model-image-viewer"[^>]*aria-labelledby="model-lightbox-title"/);
  assert.equal((html.match(/<dialog\b/g) ?? []).length, 1);
  assert.match(html, /data-model-lightbox-close[^>]*aria-label="Close sheet preview"/);
  assert.match(html, /data-model-lightbox-canvas[^>]*tabindex="0"/);
  assert.match(html, /data-model-lightbox-zoom[^>]*aria-pressed="false"/);

  for (const relativePath of [
    "showcase/financial-models/three-statement-model/model/tdat-three-statement-model.xlsx",
    "assets/agentic-home/js/model-lightbox.js",
    ...["cover", "inputs", "model", "summary", "checks"].map((name) => `showcase/financial-models/three-statement-model/assets/${name}.png`),
  ]) {
    const stats = await fs.stat(path.join(repoRoot, relativePath));
    assert.ok(stats.size > 0, relativePath);
  }

  assert.match(css, /body\[data-stage-template="model-detail"\] \.model-cinema-hero/);
  assert.match(css, /--cinema-ink:\s*var\(--stage-ink\)/);
  assert.match(css, /--cinema-violet:\s*var\(--stage-violet\)/);
  assert.match(css, /--cinema-pink:\s*var\(--stage-pink\)/);
  assert.doesNotMatch(css, /--cinema-gold|#0d0912/);
  assert.match(css, /\.model-cinema-hero\s*\{[^}]*border:\s*1px solid rgb\(124 58 237 \/ 82%\)[^}]*border-radius:\s*32px/s);
  assert.match(css, /\.model-cinema-hero\s*\{[^}]*min-height:\s*auto[^}]*align-content:\s*start/s);
  assert.match(css, /\.model-cinema-hero::before\s*\{[^}]*inset:\s*8px[^}]*linear-gradient\(135deg, #fffdf9, var\(--cinema-ivory\)\)/s);
  assert.match(css, /\.model-cinema-hero::after\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.model-cinema-grid\s*\{[^}]*grid-template-columns:\s*minmax\(470px, 0\.92fr\) minmax\(0, 1\.08fr\)[^}]*gap:\s*clamp\(2rem, 3vw, 3rem\)/s);
  assert.match(css, /\.model-cinema-preview img\s*\{[^}]*aspect-ratio:\s*2\.05 \/ 1/s);
  assert.match(css, /\.model-simple-section\s*\{[^}]*padding-block:\s*clamp\(3rem, 4\.5vw, 4rem\)/s);
  assert.match(css, /@media \(max-width: 1179px\)\s*\{[\s\S]*?\.model-cinema-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.doesNotMatch(css, /\.model-cinema-(?:proof|compatibility)\b/);
  assert.match(css, /\.model-simple-see > \.model-simple-heading h2,[^}]*\.model-simple-download h2\s*\{[^}]*max-width:\s*none/s);
  assert.match(css, /@media \(min-width: 761px\)\s*\{[^}]*#preview-title,[^}]*\.model-simple-download h2\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.model-cinema-lightbox::backdrop/);
  assert.match(css, /\.model-cinema-lightbox-canvas/);

  assert.match(lightboxJs, /dialog\.showModal\(\)/);
  assert.match(lightboxJs, /typeof HTMLDialogElement === "undefined"/);
  assert.match(lightboxJs, /event\.target === dialog/);
  assert.match(lightboxJs, /dialog\.addEventListener\("cancel"/);
  assert.match(lightboxJs, /dialog\.addEventListener\("keydown"/);
  assert.match(lightboxJs, /dialog\.addEventListener\("close"/);
  assert.match(lightboxJs, /returnFocus\.focus\(\{ preventScroll: true \}\)/);
  assert.match(lightboxJs, /dialog\.classList\.toggle\("is-detail"/);

  const cleanedTheme = cleanExistingTheme(`
    <link rel="stylesheet" data-agentic-theme href="theme.css">
    <link rel="stylesheet" data-model-variant href="assets/agentic-home/css/templates/model-cinematic.css">
    <script data-agentic-theme src="assets/agentic-home/js/site.js"></script>
    <script data-model-variant src="assets/agentic-home/js/model-lightbox.js"></script>
  `);
  assert.doesNotMatch(cleanedTheme, /data-agentic-theme/);
  assert.equal((cleanedTheme.match(/data-model-variant/g) ?? []).length, 2);
  assert.match(cleanedTheme, /model-lightbox\.js/);

  const sourceRoute = "showcase/financial-models/three-statement-model/index.html";
  const stagePath = `Stage/agentic-finance/${sourceRoute}`;
  const composed = composeStageDocument(cleanExistingTheme(html), {
    sourcePath: sourceRoute,
    stagePath,
    scopedRoutes: new Set([sourceRoute, "showcase/financial-models/index.html", "index.html"]),
  });
  const promoted = promoteStageHtml(composed, { repoRoot, sourceRoute });
  assert.equal((promoted.match(/id="model-image-viewer"/g) ?? []).length, 1);
  assert.equal((promoted.match(/\sdata-model-preview(?=\s|>)/g) ?? []).length, 6);
  assert.equal((promoted.match(/model-lightbox\.js/g) ?? []).length, 1);
  assert.doesNotMatch(promoted, /<a\b[^>]*href="assets\/(?:cover|inputs|model|summary|checks)\.png"/);

  const registrySandbox = { window: {} };
  vm.runInNewContext(registrySource, registrySandbox, { filename: "model-data.js" });
  const registeredModels = registrySandbox.window.TDAT_MODEL_LIBRARY;
  assert.equal(registeredModels.length, 24);
  assert.equal(new Set(registeredModels.map((model) => model.slug)).size, 24);

  for (const model of registeredModels) {
    const route = `showcase/financial-models/${model.slug}/index.html`;
    const routeHtml = await read(route);
    const fileName = path.posix.basename(model.file.path);
    const routePreviewButtons = [...routeHtml.matchAll(/<button\b(?=[^>]*\bdata-model-preview\b)[^>]*>/g)].map((match) => match[0]);

    assert.match(routeHtml, new RegExp(`data-stage-template="model-detail" data-model-slug="${model.slug}"`), route);
    assert.deepEqual([...routeHtml.matchAll(/data-core-section="([^"]+)"/g)].map((match) => match[1]), ["hero", "evidence", "action"], route);
    assert.equal((routeHtml.match(/<h1\b/g) ?? []).length, 1, route);
    assert.match(routeHtml, /<h1 id="model-title"[^>]*aria-label="[^"]+"[^>]*><span>[\s\S]*?<\/span> <span>[\s\S]*?<\/span><\/h1>/, route);
    assert.equal((routeHtml.match(/model-cinematic\.css\?v=model-cinematic-20260817-1/g) ?? []).length, 1, route);
    assert.equal((routeHtml.match(/model-lightbox\.js\?v=model-lightbox-20260817-1/g) ?? []).length, 1, route);
    assert.equal((routeHtml.match(/data-track-event="model downloaded"/g) ?? []).length, 2, route);
    assert.equal((routeHtml.match(new RegExp(`href="model/${fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g")) ?? []).length, 2, route);
    assert.equal(routePreviewButtons.length, 6, route);
    assert.deepEqual(routePreviewButtons.map((button) => button.match(/data-model-preview-src="assets\/([^"]+)\.png"/)?.[1]), ["summary", "cover", "inputs", "model", "summary", "checks"], route);
    assert.equal((routeHtml.match(/<dialog\b/g) ?? []).length, 1, route);
    assert.doesNotMatch(routeHtml, /<a\b[^>]*href="assets\/(?:cover|inputs|model|summary|checks)\.png"/, route);
    assert.doesNotMatch(routeHtml, /model-cinema-proof|model-cinema-compatibility|Five-sheet standard:/, route);

    for (const relativePath of [
      `showcase/financial-models/${model.file.path}`,
      ...["cover", "inputs", "model", "summary", "checks"].map((name) => `showcase/financial-models/${model.slug}/assets/${name}.png`),
    ]) {
      const stats = await fs.stat(path.join(repoRoot, relativePath));
      assert.ok(stats.size > 0, relativePath);
    }
  }
});

test("keeps the collections pitch deck standalone", async () => {
  const [html, shortlink, recap, homepage] = await Promise.all([
    read("blog/predictive-collections-agent/deck/index.html"),
    read("collections-agent/index.html"),
    read("blog/aabw-2026-recap/index.html"),
    read("index.html"),
  ]);

  assert.match(html, /<body>\s*<div class="deck-viewport">/);
  assert.match(html, /<nav class="deck-controls" aria-label="Presentation controls">/);
  assert.match(html, /class SlidePresentation/);
  assert.match(html, /this\.setupStageScale\(\)/);
  assert.equal((html.match(/<section class="slide /g) ?? []).length, 6);
  assert.doesNotMatch(html, /stage-shell-header/);
  assert.doesNotMatch(html, /templates\/deck\.css/);
  assert.equal((shortlink.match(/20260813-standalone-ff5c17b/g) ?? []).length, 2);
  assert.equal((recap.match(/collections-agent\/\?v=20260813-standalone-ff5c17b/g) ?? []).length, 3);
  assert.match(homepage, /href="\.\/blog\/predictive-collections-agent\/deck\/index\.html\?v=20260813-standalone-ff5c17b"[\s\S]*?>HTML Slides<\/span>/);
});

test("presents the interactive deck as the article action section", async () => {
  const html = await read("blog/predictive-collections-agent/index.html");

  assert.match(html, /class="detail-section article-section deck-core-section"[^>]*data-core-section="action"/);
  assert.match(html, /src="deck\/index\.html\?v=20260822-sandbox-storage1"/);
  assert.equal((html.match(/deck\/index\.html\?v=20260822-sandbox-storage1/g) ?? []).length, 5);
  assert.doesNotMatch(html, /aria-labelledby="workflow-title"[^>]*data-core-section/);
});

test("routes Workspace Hub to the interactive simulation", async () => {
  const homepage = await read("index.html");

  assert.match(homepage, /href="\.\/showcase\/workspace-hub\/"[^>]*aria-label="Open Workspace Hub simulation"/);
  assert.doesNotMatch(homepage, /class="agentic-cta-status">Upcoming</);
});

test("provides a clear static model and blog directory", async () => {
  const [models, blog] = await Promise.all([
    read("showcase/financial-models/index.html"),
    read("blog/index.html"),
  ]);

  assert.equal((models.match(/class="simple-library-card"/g) ?? []).length, 24);
  assert.match(models, /Five sheets\. Simple navigation\. Detailed model logic\./);
  assert.match(models, /Start → Inputs → Model → Results → Checks/);
  assert.match(models, /five visible sheets: Start, Inputs, Model, Results, and Checks/i);
  assert.match(models, /up to 24 clearly labeled inputs/i);
  assert.match(models, /charcoal-and-gold detailed Model sheet/i);
  assert.match(models, /10 \/ 10 calculation controls PASS/);
  assert.match(models, /href="project-finance-lite\/index\.html"[\s\S]*?<h3>Project Finance Lite<\/h3>/);
  assert.match(models, /href="ecl-credit-stress-lite\/index\.html"[\s\S]*?<h3>ECL Credit Stress Lite<\/h3>/);
  assert.doesNotMatch(models, /6(?:&ndash;|–)12|compact-detail|five checks|all five checks|Four tabs|four visible tabs|beginner-friendly Lite|4 \/ 4 sheets rendered/i);
  assert.match(blog, /class="[^"]*blog-editorial-page[^"]*"/);
  assert.match(blog, /blog-index\.css\?v=blog-two-20260812-2/);
  assert.equal((blog.match(/class="blog-editorial-card"/g) ?? []).length, 2);
  assert.match(blog, /class="brand-mark stage-shell-brand-mark" aria-hidden="true"><\/span>/);
  assert.doesNotMatch(blog, /data-stage-route-intro/);
});
