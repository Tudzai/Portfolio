import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { isSkippedRoute } from "../promote-agentic-finance-production.mjs";

const TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TEST_ROOT, "../..");
const POWERBI_ROOT = path.join(REPO_ROOT, "showcase", "powerbi");

const projects = [
  ["01", "monthly-fpa-performance-pack"],
  ["02", "driver-based-forecasting"],
  ["03", "ecommerce-executive-performance"],
  ["04", "customer-funnel-conversion"],
  ["05", "retention-cohort-ltv"],
  ["06", "marketing-campaign-roi"],
  ["07", "marketplace-seller-performance"],
  ["08", "digital-payments-profitability"],
  ["09", "bnpl-credit-risk-provision"],
  ["10", "aml-fraud-monitoring"],
  ["11", "neobank-growth-retention-ltv"],
  ["12", "wealthtech-aum-client-retention"],
  ["13", "regional-fpa-consolidation"],
  ["14", "treasury-working-capital"],
  ["15", "saas-cfo-metrics"],
  ["16", "manufacturing-cost-fpa"],
  ["17", "logistics-trade-lane-profitability"],
  ["18", "esg-carbon-finance"],
  ["19", "finance-data-quality-bi-governance"],
];

const read = (relativePath) => fs.readFile(path.join(REPO_ROOT, relativePath), "utf8");

test("keeps Projects 01–19 on their own dashboard layouts", async () => {
  const layoutMarkers = new Set();
  const styleFingerprints = new Set();

  for (const [number, id] of projects) {
    const previewPath = path.join("showcase", "powerbi", id, "preview.html");
    const html = await read(previewPath);
    const marker = html.match(/data-layout-source=["']([^"']+)["']/i)?.[1];
    const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join("\n");

    assert.equal(marker, `project-${number}-own-dashboard`, `${id}: source-layout marker`);
    assert.match(html, new RegExp(`data-project-number=["']${number}["']`));
    assert.ok(html.length > 7000, `${id}: project-owned dashboard should not be a thin shared wrapper`);
    assert.ok(styles.length > 1500, `${id}: project-owned layout CSS`);
    assert.match(html, /class=["'][^"']*preview-frame/);
    assert.match(html, /class=["'][^"']*dashboard-shell/);
    assert.match(html, /<meta\s+name=["']robots["']\s+content=["']noindex,\s*follow["']/i);
    assert.match(html, /<link\s+rel=["']canonical["']\s+href=["']index\.html["']/i);
    assert.match(html, /previewState/);
    assert.match(html, /previewActions/);
    assert.match(html, /__dashboardQa/);
    assert.match(html, /chartFingerprint/, `${id}: exposes rendered chart geometry for slicer QA`);
    assert.match(html, /reset/i);
    assert.match(html, /aria-(?:current|selected)/i, `${id}: page navigation exposes the active view`);
    assert.match(html, /aria-(?:pressed|selected)/i, `${id}: interactive state is available to assistive technology`);
    assert.match(html, /:focus-visible/i, `${id}: keyboard focus is visible`);
    assert.match(html, /<(?:select|input)\b/i);
    assert.doesNotMatch(html, /assets\/powerbi-standard\/preview\.(?:css|js)/i);
    assert.doesNotMatch(html, /__POWERBI_PROJECT_CONFIG__/);
    assert.doesNotMatch(html, /data-stage-shell/);
    assert.doesNotMatch(html, /(?:\.pbix|\.pbit|\.csv|file:\/\/|OneDrive|C:\\Users\\)/i);

    layoutMarkers.add(marker);
    styleFingerprints.add(crypto.createHash("sha256").update(styles).digest("hex"));
  }

  assert.equal(layoutMarkers.size, 19, "every project declares its own layout source");
  assert.equal(styleFingerprints.size, 19, "every project retains a distinct layout stylesheet");
});

test("keeps each project-specific dashboard embedded by its matching case page", async () => {
  for (const [number, id] of projects) {
    const indexHtml = await read(path.join("showcase", "powerbi", id, "index.html"));
    assert.match(indexHtml, new RegExp(`data-project-no=["']${number}["']`));
    assert.match(indexHtml, /class=["'][^"']*powerbi-project-page/);
    assert.match(indexHtml, /iframe[^>]+data-project-preview/i);
    assert.match(indexHtml, /iframe[^>]+src=["']preview\.html\?v=[^"']+["']/i);
    const previewVersions = [...indexHtml.matchAll(/preview\.html\?v=([^"']+)/g)].map((match) => match[1]);
    assert.equal(
      previewVersions.length,
      3,
      `${id}: iframe and both full-screen links should share the fresh preview version`,
    );
    assert.equal(new Set(previewVersions).size, 1, `${id}: every preview link should use the same cache key`);
    assert.match(indexHtml, /dashboardShell\.getBoundingClientRect\(\)\.height/);
    assert.match(indexHtml, /ResizeObserverCtor/);
    assert.match(indexHtml, /Math\.max\(1,\s*Math\.ceil\(dashboardShell/);
    assert.doesNotMatch(indexHtml, /\.scrollHeight/);
    assert.doesNotMatch(indexHtml, /Math\.max\(420,/);
    assert.doesNotMatch(indexHtml, /powerbi-standard|data-standard-preview/i);
    assert.doesNotMatch(indexHtml, /Synthetic preview value\./i, `${id}: headline metrics need decision context, not filler copy`);
    assert.equal((indexHtml.match(/<div class="board-metrics"[\s\S]*?<\/div>/)?.[0].match(/<article>/g) ?? []).length, 4, `${id}: four reconciled headline metrics`);
  }
});

test("retires the rejected shared Project 20 layout generator", async () => {
  const retiredPaths = [
    "assets/powerbi-standard/preview.css",
    "assets/powerbi-standard/preview.js",
    "scripts/build-powerbi-standard-pages.mjs",
    "scripts/powerbi-standard-projects.mjs",
  ];
  for (const relativePath of retiredPaths) {
    await assert.rejects(fs.access(path.join(REPO_ROOT, relativePath)), { code: "ENOENT" });
  }
});

test("keeps every project-owned preview outside shell promotion", () => {
  for (const [, id] of projects) {
    assert.equal(isSkippedRoute(`showcase/powerbi/${id}/preview.html`), true, id);
    assert.equal(isSkippedRoute(`showcase/powerbi/${id}/index.html`), false, id);
  }
  assert.equal(isSkippedRoute("showcase/powerbi/board-investor-cfo-pack/preview.html"), true);
});

test("retains Project 20 as the interaction and QA reference without reusing its layout", async () => {
  const routeRoot = path.join(POWERBI_ROOT, "board-investor-cfo-pack");
  const [indexHtml, previewHtml] = await Promise.all([
    fs.readFile(path.join(routeRoot, "index.html"), "utf8"),
    fs.readFile(path.join(routeRoot, "preview.html"), "utf8"),
  ]);
  assert.match(indexHtml, /class="board-overview"/);
  assert.match(indexHtml, /function resizeDashboardFrame\(\)/);
  assert.match(previewHtml, /function initControls\(\)/);
  assert.match(previewHtml, /window\.previewActions\s*=/);
  assert.match(previewHtml, /window\.__dashboardQa\s*=/);
  assert.match(previewHtml, /chartFingerprint/);
});
