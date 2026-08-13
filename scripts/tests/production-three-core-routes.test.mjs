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
  assert.match(html, /src="deck\/index\.html\?v=20260813-standalone-ff5c17b"/);
  assert.equal((html.match(/deck\/index\.html\?v=20260813-standalone-ff5c17b/g) ?? []).length, 5);
  assert.doesNotMatch(html, /aria-labelledby="workflow-title"[^>]*data-core-section/);
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
