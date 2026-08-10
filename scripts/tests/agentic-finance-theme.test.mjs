import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STAGE_CSS = path.join(REPO_ROOT, "Stage", "agentic-finance", "assets", "css");
const STAGE_JS = path.join(REPO_ROOT, "Stage", "agentic-finance", "assets", "js");

const readCss = (relativePath) => fs.readFile(path.join(STAGE_CSS, relativePath), "utf8");
const readJs = (relativePath) => fs.readFile(path.join(STAGE_JS, relativePath), "utf8");

test("defines the hybrid route context component and responsive contract", async () => {
  const [tokens, components, templates] = await Promise.all([
    readCss("tokens.css"),
    readCss("components.css"),
    readCss("templates.css"),
  ]);

  assert.match(tokens, /--stage-route-rail:/);
  assert.match(tokens, /--stage-reading-size:/);
  assert.match(components, /\.stage-route-intro\s*\{/);
  assert.match(components, /\.stage-route-flow\s*\{/);
  assert.match(components, /\.stage-route-link\s*>\s*span/);
  assert.doesNotMatch(components, /\.stage-route-link::after/);
  assert.match(components, /@media \(max-width: 760px\)/);
  assert.match(templates, /\.stage-route-intro\s*\+\s*:is\(/);
  assert.doesNotMatch(`${tokens}\n${components}\n${templates}`, /transition:\s*all/i);
});

const templateAdapters = [
  "hub",
  "case",
  "dashboard-preview",
  "model-detail",
  "article",
  "deck",
  "cv",
  "utility",
];

for (const template of templateAdapters) {
  test(`${template} adapter carries the hybrid density and mobile contract`, async () => {
    const css = await readCss(`templates/${template}.css`);

    assert.match(css, new RegExp(`body\\[data-stage-template=["']${template}["']\\]`));
    assert.match(css, /--stage-template-section-gap:/);
    assert.match(css, /var\(--stage-template-section-gap\)/);
    assert.match(css, /@media \(max-width: 760px\)/);
    assert.doesNotMatch(css, /transition:\s*all/i);
  });
}

test("dashboard preview adapter preserves page-owned grid systems", async () => {
  const css = await readCss("templates/dashboard-preview.css");

  assert.doesNotMatch(css, /:is\([^)]*\.grid/);
  assert.match(css, /main\[data-stage-content\]\s+:is\(h1, h2, h3, h4\)/);
});

test("deck adapter contains the legacy fixed canvas in document flow", async () => {
  const [css, site] = await Promise.all([
    readCss("templates/deck.css"),
    readJs("site.js"),
  ]);

  assert.match(css, /html:has\(body\[data-stage-template=["']deck["']\]\)/);
  assert.match(css, /\.deck-viewport\s*\{[\s\S]*?position:\s*relative/);
  assert.match(css, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.doesNotMatch(css, /body\[data-stage-template=["']deck["']\]\s+main\s*\{/);
  assert.match(site, /const fitDeckStage/);
  assert.match(site, /viewport\.getBoundingClientRect\(\)/);
  assert.match(site, /const scheduleDeckFit/);
  assert.match(site, /window\.addEventListener\(['"]load['"], scheduleDeckFit/);
  assert.match(site, /new ResizeObserver\(scheduleDeckFit\)/);
});

test("utility adapter restores readable legacy copy and links", async () => {
  const css = await readCss("templates/utility.css");

  assert.match(css, /main\[data-stage-content\][\s\S]*?p\s*\{/);
  assert.match(css, /main\[data-stage-content\][\s\S]*?p\s+a\s*\{/);
  assert.match(css, /color:\s*var\(--stage-muted\)/);
  assert.match(css, /color:\s*var\(--stage-violet-dark\)/);
});

test("shared shell carries the main-page floating return control", async () => {
  const [shell, site] = await Promise.all([
    readCss("shell.css"),
    readJs("site.js"),
  ]);

  assert.match(shell, /\.stage-back-to-top\s*\{/);
  assert.match(shell, /\.stage-back-to-top\.is-visible/);
  assert.match(site, /querySelector\(['"]\.stage-back-to-top['"]\)/);
  assert.match(site, /window\.scrollY/);
});
