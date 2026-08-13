import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFile(path.join(repoRoot, relativePath), "utf8");

const hubRoutes = [
  ["showcase/powerbi/index.html", "powerbi", "decision-hub-hero", "powerbi5"],
  ["showcase/fpa-decision-cases/index.html", "fpa", "decision-hub-hero", "annotated2"],
  ["showcase/python-automation/index.html", "automation", "decision-hub-hero", "annotated2"],
  ["showcase/financial-models/index.html", "models", "decision-hub-hero", "annotated2"],
];

test("keeps the CV role line unbroken on desktop without creating mobile overflow", async () => {
  const [css, baseCss] = await Promise.all([
    read("assets/agentic-home/css/templates/cv.css"),
    read("assets/agentic-home/css/base.css"),
  ]);

  assert.match(css, /\.cv-role-line\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(css, /@media\s*\(max-width:\s*860px\)[\s\S]*?\.cv-role-line\s*\{[^}]*white-space:\s*normal/s);
  assert.match(baseCss, /body\s*\{[^}]*min-width:\s*0/s);
});

test("uses compact decision-led compositions for every annotated library hub", async () => {
  const css = await read("assets/agentic-home/css/templates/hub.css");

  assert.match(css, /Annotated library redesign/);
  assert.match(css, /data-stage-family="powerbi"/);
  assert.match(css, /data-stage-family="fpa"/);
  assert.match(css, /data-stage-family="automation"/);
  assert.match(css, /data-stage-family="models"/);
  assert.match(css, /\.stage-route-intro\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.decision-hub-hero\s*\{/);

  for (const [route, family, heroClass, cacheVersion] of hubRoutes) {
    const html = await read(route);
    assert.match(html, new RegExp(`data-stage-family=["']${family}["']`));
    assert.match(html, new RegExp(`class=["'][^"']*${heroClass}`));
    assert.match(html, new RegExp(`templates/hub\\.css\\?v=routes-20260811-${cacheVersion}`));
  }
});

test("uses a compact editorial treatment for the annotated AABW article", async () => {
  const [html, css] = await Promise.all([
    read("blog/aabw-2026-recap/index.html"),
    read("assets/agentic-home/css/templates/article.css"),
  ]);

  assert.match(html, /templates\/article\.css\?v=routes-20260811-annotated2/);
  assert.match(css, /Annotated AABW editorial redesign/);
  assert.match(css, /\.aabw-recap-page \.stage-route-intro\s*\{[^}]*display:\s*none/s);
  assert.match(css, /aabw-recap-page[^{]*\.article-section-heading\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /body\[data-stage-template="article"\]\.aabw-recap-page \.article-reading-layout\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /\.aabw-recap-page \.official-event-card\s*\{[^}]*390px/s);
  assert.match(css, /aabw-recap-page[^{]*\.article-summary\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /aabw-recap-page[^{]*\.article-section-heading h2\s*\{[^}]*word-break:\s*normal/s);
});

test("prevents hub section headings from collapsing into narrow columns", async () => {
  const css = await read("assets/agentic-home/css/templates/hub.css");

  assert.match(css, /Portfolio-wide hub overflow guard/);
  assert.match(css, /main\[data-stage-content\][^{]*:is\(\.section-heading, \.section-intro\)\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test("redesigns the Power BI library from the recruiter shortlist through the final case", async () => {
  const [html, css] = await Promise.all([
    read("showcase/powerbi/index.html"),
    read("assets/agentic-home/css/templates/hub.css"),
  ]);

  assert.match(html, /class="start-strip powerbi-shortlist"/);
  assert.match(html, /class="start-card start-card-primary"/);
  assert.match(html, /class="powerbi-directory"/);
  assert.doesNotMatch(html, /class="chart-mode-panel"/);
  assert.match(html, /class="section project-lens project-lens-primary"/);
  assert.match(html, /class="section project-lens project-lens-final"/);
  assert.equal((html.match(/class="project-open"/g) ?? []).length, 17);
  assert.equal((html.match(/class="project-visual"/g) ?? []).length, 19);

  const previewImages = [...html.matchAll(/src="\.\.\/\.\.\/(assets\/powerbi-previews\/[^"?]+\.png)"/g)].map((match) => match[1]);
  assert.equal(previewImages.length, 19);
  assert.equal(new Set(previewImages).size, 19);

  assert.match(html, /class="project-card featured preview-suppressed" id="board-investor-cfo-pack"/);
  assert.match(html, /<article class="project-card" id="esg-carbon-finance">/);

  for (const previewImage of previewImages) {
    const metadata = await fs.stat(path.join(repoRoot, previewImage));
    assert.ok(metadata.size > 0, `${previewImage} should be a non-empty image`);
  }

  assert.match(css, /Power BI case library: recruiter shortlist and editorial catalog/);
  assert.match(css, /\.powerbi-shortlist\s*\{[^}]*grid-template-columns:\s*minmax\(250px,\s*0\.68fr\)/s);
  assert.match(css, /\.powerbi-directory\s*\{[^}]*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.project-lens \.project-grid\s*\{[^}]*repeat\(12,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.project-lens \.project-card[^{]*\{[^}]*grid-column:\s*1 \/ -1/s);
});
