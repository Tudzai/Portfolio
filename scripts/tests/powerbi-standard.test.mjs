import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildPowerBiStandardPages,
  renderCasePage,
  renderPreviewPage,
} from "../build-powerbi-standard-pages.mjs";
import { powerBiStandardProjects } from "../powerbi-standard-projects.mjs";
import { isSkippedRoute } from "../promote-agentic-finance-production.mjs";

const TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TEST_ROOT, "../..");

test("defines one complete public-safe standard config for projects 01 through 19", () => {
  assert.equal(powerBiStandardProjects.length, 19);
  assert.deepEqual(powerBiStandardProjects.map((project) => project.no), Array.from({ length: 19 }, (_, index) => String(index + 1).padStart(2, "0")));
  assert.equal(new Set(powerBiStandardProjects.map((project) => project.id)).size, 19);

  for (const project of powerBiStandardProjects) {
    assert.match(project.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(project.pages.length, 3, `${project.id}: page count`);
    assert.ok(project.metrics.length >= 4, `${project.id}: metrics`);
    assert.ok(project.bars.length >= 4, `${project.id}: breakdown bars`);
    assert.ok(project.drivers.length >= 3, `${project.id}: drivers`);
    assert.ok(project.actions.length >= 3, `${project.id}: owner actions`);
    assert.ok(project.scopeOptions.length >= 4, `${project.id}: scope options`);
    assert.match(`${project.summary} ${project.governance}`, /synthetic|public-safe/i, `${project.id}: public-safe disclosure`);
  }
});

test("renders Project 20-standard case and preview contracts for every migrated route", () => {
  for (const project of powerBiStandardProjects) {
    const indexHtml = renderCasePage(project);
    const previewHtml = renderPreviewPage(project);

    assert.match(indexHtml, /class="board-pack-page powerbi-standard-page"/);
    assert.match(indexHtml, /class="board-overview"/);
    assert.equal((indexHtml.match(/<div class="board-metrics"/g) || []).length, 1);
    const metricMarkup = indexHtml.match(/<div class="board-metrics"[^>]*>([\s\S]*?)<\/div>/)?.[1] || "";
    assert.equal((metricMarkup.match(/<article><span>/g) || []).length, 4);
    assert.match(indexHtml, /iframe data-standard-preview/);
    assert.match(indexHtml, /dashboardShell\.getBoundingClientRect\(\)\.height/);
    assert.doesNotMatch(indexHtml, /\.scrollHeight/);
    assert.doesNotMatch(indexHtml, /\[object Object\]|\.,/);
    assert.doesNotMatch(indexHtml, /(?:\.pbix|\.pbit|\.csv|file:\/\/|OneDrive)/i);

    assert.match(previewHtml, /class="preview-frame"/);
    assert.match(previewHtml, /<meta name="robots" content="noindex, follow"/);
    assert.match(previewHtml, /<link rel="canonical" href="index\.html"/);
    assert.match(previewHtml, /class="dashboard-shell"/);
    assert.match(previewHtml, /id="projectNav"/);
    assert.match(previewHtml, /id="yearFilter"/);
    assert.match(previewHtml, /id="scenarioFilter"/);
    assert.match(previewHtml, /id="scopeFilter"/);
    assert.match(previewHtml, /id="regionFilter"/);
    assert.match(previewHtml, /id="resetFilters"/);
    assert.match(previewHtml, /__POWERBI_PROJECT_CONFIG__/);
    assert.match(previewHtml, /assets\/powerbi-standard\/preview\.js/);
    assert.doesNotMatch(previewHtml, /data-stage-shell/);
  }
});

test("keeps every dashboard-only preview outside shell promotion", () => {
  for (const project of powerBiStandardProjects) {
    assert.equal(isSkippedRoute(`showcase/powerbi/${project.id}/preview.html`), true, project.id);
    assert.equal(isSkippedRoute(`showcase/powerbi/${project.id}/index.html`), false, project.id);
  }
  assert.equal(isSkippedRoute("showcase/powerbi/board-investor-cfo-pack/preview.html"), true);
});

test("keeps generated standard routes current and the shared runtime interactive", async () => {
  assert.deepEqual(await buildPowerBiStandardPages(), []);

  const runtime = await fs.readFile(path.join(REPO_ROOT, "assets", "powerbi-standard", "preview.js"), "utf8");
  const css = await fs.readFile(path.join(REPO_ROOT, "assets", "powerbi-standard", "preview.css"), "utf8");
  assert.match(runtime, /window\.previewActions\s*=/);
  assert.match(runtime, /window\.__dashboardQa\s*=/);
  assert.match(runtime, /function\s+fitDashboard\s*\(/);
  assert.match(runtime, /const\s+highDensityCap\s*=/);
  assert.match(runtime, /window\.innerWidth\s*>=\s*3200[\s\S]*?\?\s*2/);
  assert.match(runtime, /window\.innerWidth\s*>=\s*2200[\s\S]*?\?\s*4\s*\/\s*3/);
  assert.match(runtime, /function\s+resetFilters\s*\(/);
  assert.match(runtime, /addEventListener\(["']change["']/);
  assert.match(css, /\.dashboard\s*\{[^}]*width:\s*1280px;[^}]*height:\s*720px;/s);
  assert.match(css, /\.visual-grid\s*\{[^}]*grid-template-columns:/s);
  assert.doesNotMatch(runtime, /panelIndex === 0 \? "scope" : "region"/);
});

test("retains Project 20 as the canonical richer implementation", async () => {
  const routeRoot = path.join(REPO_ROOT, "showcase", "powerbi", "board-investor-cfo-pack");
  const [indexHtml, previewHtml] = await Promise.all([
    fs.readFile(path.join(routeRoot, "index.html"), "utf8"),
    fs.readFile(path.join(routeRoot, "preview.html"), "utf8"),
  ]);
  assert.match(indexHtml, /class="board-overview"/);
  assert.match(indexHtml, /function resizeDashboardFrame\(\)/);
  assert.match(previewHtml, /function initControls\(\)/);
  assert.match(previewHtml, /window\.previewActions\s*=/);
  assert.match(previewHtml, /window\.__dashboardQa\s*=/);
});
