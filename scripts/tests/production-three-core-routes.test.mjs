import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFile(path.join(repoRoot, relativePath), "utf8");

const threeCoreRoutes = [
  "showcase/financial-models/budget-rolling-forecast/index.html",
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
    assert.match(html, /templates\/simple-three\.css\?v=three-core-2026081(?:2-4|3-[5-6])/);
    assert.deepEqual(sections, ["hero", "evidence", "action"], route);
  }
});

test("puts the reporting automation demo first and accelerates both demo videos", async () => {
  const [homepage, reporting] = await Promise.all([
    read("index.html"),
    read("showcase/python-automation/monthly-reporting-pipeline/index.html"),
  ]);

  assert.match(homepage, /id="automation-case-video"[\s\S]*?data-playback-rate="5"/);
  assert.match(reporting, /class="detail-hero python-detail-hero simple-automation-hero"[^>]*data-core-section="hero"[\s\S]*?id="reporting-pipeline-video"/);
  assert.match(reporting, /id="reporting-pipeline-video"[\s\S]*?data-playback-rate="3\.5"/);
});

test("uses the focused four-step and primary-preview layout for the rolling forecast", async () => {
  const [html, css] = await Promise.all([
    read("showcase/financial-models/budget-rolling-forecast/index.html"),
    read("assets/agentic-home/css/templates/simple-three.css"),
  ]);

  assert.match(html, /class="detail-page models-page simple-three-page budget-model-page"/);
  assert.match(html, /<h2 id="start-title">Plan\. Test\. Decide\.<\/h2>/);
  assert.equal((html.match(/<li><b>0[1-4]<\/b>/g) ?? []).length, 4);
  assert.match(html, /class="budget-preview-primary"/);
  assert.equal((html.match(/<figure(?: class="budget-preview-primary")?>/g) ?? []).length, 3);
  assert.match(css, /body\.budget-model-page \[data-core-section="evidence"\][^{]*\{[^}]*grid-template-columns:/s);
  assert.match(css, /body\.budget-model-page \.budget-preview-grid\s*\{[^}]*grid-template-columns:/s);
});

test("restores the original three-scene pitch-deck finale", async () => {
  const [html, deckCss, siteJs] = await Promise.all([
    read("blog/predictive-collections-agent/deck/index.html"),
    read("assets/agentic-home/css/templates/deck.css"),
    read("assets/agentic-home/js/site.js"),
  ]);

  assert.match(html, /templates\/deck\.css\?v=routes-20260813-embedded2/);
  assert.match(html, /document\.documentElement\.classList\.add\('is-embedded-deck'\)/);
  assert.match(html, /class="brand-mark stage-shell-brand-mark" aria-hidden="true"><\/span>/);
  assert.doesNotMatch(html, />TA<\/span>/);
  assert.match(html, /class="qa-stage qa-recap-stage"/);
  assert.equal((html.match(/<section class="qa-recap-scene" data-qa-recap-scene="[0-2]"/g) ?? []).length, 3);
  assert.match(deckCss, /\.qa-slide > \.qa-single-stage\s*\{[^}]*display:\s*none/s);
  assert.match(deckCss, /\.qa-slide > \.qa-recap-stage\s*\{[^}]*display:\s*block/s);
  assert.match(siteJs, /slide\.classList\.contains\('qa-slide'\) && qaRecap\) return 3/);
  assert.match(siteJs, /getCurrentScene:\s*\(\) => slideScenes\.get\(orderedSlides\[currentSlide\]\) \?\? 0/);
});

test("presents the interactive deck as the article action section", async () => {
  const [html, deckCss] = await Promise.all([
    read("blog/predictive-collections-agent/index.html"),
    read("assets/agentic-home/css/templates/deck.css"),
  ]);

  assert.match(html, /class="detail-section article-section deck-core-section"[^>]*data-core-section="action"/);
  assert.match(html, /src="deck\/index\.html\?v=20260813-embedded1"/);
  assert.doesNotMatch(html, /aria-labelledby="workflow-title"[^>]*data-core-section/);
  assert.match(deckCss, /html\.is-embedded-deck body\[data-stage-template="deck"\] > \.deck-viewport\s*\{[^}]*height:\s*100dvh/s);
});

test("routes Workspace Hub to the explicit upcoming section", async () => {
  const [homepage, blog] = await Promise.all([read("index.html"), read("blog/index.html")]);

  assert.match(homepage, /href="\.\/blog\/index\.html#upcoming"[^>]*aria-label="Workspace Hub, upcoming"/);
  assert.match(homepage, /class="agentic-cta-status">Upcoming</);
  assert.match(blog, /id="upcoming"[^>]*aria-labelledby="blog-upcoming-title"/);
});

test("provides a clear static model and blog directory", async () => {
  const [models, blog] = await Promise.all([
    read("showcase/financial-models/index.html"),
    read("blog/index.html"),
  ]);

  assert.equal((models.match(/class="simple-library-card"/g) ?? []).length, 24);
  assert.match(blog, /class="[^"]*blog-editorial-page[^"]*"/);
  assert.match(blog, /blog-index\.css\?v=blog-two-20260812-2/);
  assert.equal((blog.match(/class="blog-editorial-card"/g) ?? []).length, 2);
  assert.match(blog, />AT<\/span>/);
  assert.doesNotMatch(blog, /data-stage-route-intro/);
});
