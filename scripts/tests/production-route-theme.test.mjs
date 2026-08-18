import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyRoute, isScopedHtmlRoute } from "../build-agentic-finance-stage.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const THEMED_ASSET_ROOT = path.join(REPO_ROOT, "assets", "agentic-home");
const EXCLUDED_THEME_ROUTES = new Set([
  "index.html",
  "404.html",
  "blog/predictive-collections-agent/deck/index.html",
]);
const EXCLUDED_REFERENCE_ROUTES = new Set(["index.html", "404.html"]);
const EXCLUDED_ROOT_DIRECTORIES = new Set([
  "Stage",
  "assets",
  "BI",
  "collections-agent",
  "knowledge-vault",
  "node_modules",
  "output",
  "outputs",
  "scripts",
  "test-results",
  "tmp",
]);

const toPosix = (value) => value.replaceAll(path.sep, "/");
const isExcludedThemeRoute = (route) => EXCLUDED_THEME_ROUTES.has(route) || /^showcase\/powerbi\/[^/]+\/preview\.html$/.test(route);

async function walkHtml(directory, result = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      if (directory === REPO_ROOT && EXCLUDED_ROOT_DIRECTORIES.has(entry.name)) continue;
      await walkHtml(absolute, result);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const route = toPosix(path.relative(REPO_ROOT, absolute));
    if (isScopedHtmlRoute(route)) result.push(route);
  }
  return result.sort();
}

function localReferences(html) {
  return [...html.matchAll(/\b(?:href|src|poster|data-src)=(['"])(.*?)\1/gi)]
    .map((match) => match[2]);
}

function isExternalReference(value) {
  return (
    !value ||
    value.includes("${") ||
    value.startsWith("#") ||
    value.startsWith("//") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("javascript:") ||
    value.startsWith("data:") ||
    /^[a-z][a-z\d+.-]*:/i.test(value)
  );
}

function resolveProductionReference(route, value) {
  const pathname = value.match(/^([^?#]*)/)?.[1] ?? value;
  if (pathname.startsWith("/Portfolio/")) {
    return path.resolve(REPO_ROOT, pathname.slice("/Portfolio/".length));
  }
  if (pathname.startsWith("/")) return null;
  return path.resolve(REPO_ROOT, path.dirname(route), pathname);
}

test("keeps the canonical recruiter-facing route inventory at 86 pages", async () => {
  const routes = await walkHtml(REPO_ROOT);
  assert.equal(routes.length, 86);
  assert.equal(routes.includes("index.html"), true);
  assert.equal(routes.includes("cv.html"), true);
  assert.equal(routes.includes("showcase/financial-models/budget-rolling-forecast/index.html"), true);
  assert.equal(routes.includes("showcase/powerbi/driver-based-forecasting/preview.html"), true);
  assert.equal(routes.includes("showcase/workspace-hub/index.html"), true);
});

test("applies the shared high-density responsive tokens to every Stage route", async () => {
  const stageRoutes = [];

  for (const route of await walkHtml(REPO_ROOT)) {
    const html = await fs.readFile(path.join(REPO_ROOT, route), "utf8");
    if (!/data-stage-template=/.test(html)) continue;
    stageRoutes.push(route);
    assert.match(
      html,
      /tokens\.css\?v=routes-20260818-responsive-all1/,
      `${route}: responsive token cache key`,
    );
  }

  const tokenCss = await fs.readFile(path.join(THEMED_ASSET_ROOT, "css", "tokens.css"), "utf8");
  assert.equal(stageRoutes.length, 64);
  assert.match(tokenCss, /min-width:\s*2200px[^}]*min-height:\s*1200px[^}]*zoom:\s*1\.333333/s);
  assert.match(tokenCss, /min-width:\s*3200px[^}]*min-height:\s*1800px[^}]*zoom:\s*2/s);
});

test("ships the enlarged AT mark through one fresh shared shell cache key", async () => {
  const shellConsumers = [];

  for (const route of await walkHtml(REPO_ROOT)) {
    const html = await fs.readFile(path.join(REPO_ROOT, route), "utf8");
    if (!/assets\/agentic-home\/css\/shell\.css/.test(html)) continue;
    shellConsumers.push(route);
    assert.match(
      html,
      /assets\/agentic-home\/css\/shell\.css\?v=routes-20260813-atmark3/,
      `${route}: fresh shell cache key`,
    );
  }

  const shellCss = await fs.readFile(path.join(THEMED_ASSET_ROOT, "css", "shell.css"), "utf8");
  assert.equal(shellConsumers.length, 64);
  assert.match(
    shellCss,
    /body\[data-stage-template\] \.stage-shell-brand-mark\s*\{[^}]*position:\s*relative/s,
  );
  assert.match(
    shellCss,
    /body\[data-stage-template\] \.stage-shell-brand-mark::before\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*display:\s*grid;[^}]*place-items:\s*center;[^}]*font-size:\s*1rem/s,
  );
});

test("serves every shell-managed branch route with the approved purple production shell", async () => {
  const routes = (await walkHtml(REPO_ROOT)).filter((route) => !isExcludedThemeRoute(route));
  assert.equal(routes.length, 63);

  for (const route of routes) {
    const html = await fs.readFile(path.join(REPO_ROOT, route), "utf8");
    const { family, template } = classifyRoute(route);
    const headerCount = (html.match(/<header\b[^>]*\bdata-stage-shell\b/gi) ?? []).length;
    const footerCount = (html.match(/<footer\b[^>]*\bdata-stage-shell\b/gi) ?? []).length;
    const introCount = (html.match(/\bdata-stage-route-intro\b/gi) ?? []).length;

    assert.equal(headerCount, 1, `${route}: shared header`);
    assert.equal(footerCount, 1, `${route}: shared footer`);
    assert.equal(introCount, 0, `${route}: route context removed`);
    assert.match(html, new RegExp(`data-stage-family=["']${family}["']`), `${route}: family`);
    assert.match(html, new RegExp(`data-stage-template=["']${template}["']`), `${route}: template`);
    assert.match(html, new RegExp(`assets/agentic-home/css/templates/${template}\\.css`), `${route}: adapter`);
    assert.match(html, /assets\/agentic-home\/js\/navigation\.js/, `${route}: navigation`);
    assert.match(html, /assets\/agentic-home\/js\/site\.js/, `${route}: site behavior`);
    assert.match(
      html,
      /class=["']back-to-top stage-back-to-top["'] href=["']#main-content["']/,
      `${route}: same-page back-to-top target`,
    );
    assert.doesNotMatch(html, /class=["']back-to-top stage-back-to-top["'] href=["'][^"']*index\.html#hero/, `${route}: homepage back-to-top leak`);
    assert.match(
      html,
      /tokens\.css\?v=routes-20260818-responsive-all1/,
      `${route}: shared responsive token cache key`,
    );
    assert.match(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']index, follow["']/i, `${route}: robots`);
    assert.match(html, /analytics\.js/i, `${route}: analytics`);
    assert.doesNotMatch(html, /Stage\/agentic-finance/i, `${route}: Stage URL leak`);
    assert.doesNotMatch(html, /noindex|nofollow|noarchive/i, `${route}: Stage robots leak`);
  }
});

test("keeps the board CFO preview as a self-contained interactive dashboard", async () => {
  const routeRoot = path.join(REPO_ROOT, "showcase", "powerbi", "board-investor-cfo-pack");
  const [indexHtml, previewHtml, pageCss] = await Promise.all([
    fs.readFile(path.join(routeRoot, "index.html"), "utf8"),
    fs.readFile(path.join(routeRoot, "preview.html"), "utf8"),
    fs.readFile(path.join(routeRoot, "board-pack-page.css"), "utf8"),
  ]);

  assert.match(indexHtml, /board-pack-page\.css\?v=board-borderless-20260817/);
  assert.match(indexHtml, /<main\b[^>]*id=["']main-content["'][^>]*class=["']board-case["']/i);
  assert.equal((indexHtml.match(/\bid=["']main-content["']/gi) || []).length, 1);
  assert.match(indexHtml, /id=["']interactive-preview["']/);
  assert.match(indexHtml, /<iframe\b[^>]*id=["']board-pack-preview["'][^>]*src=["']preview\.html\?v=interactive-20260818-responsive1["'][^>]*title=["']Board Investor CFO Pack interactive preview["']/i);
  assert.match(indexHtml, /<h1\b[^>]*>Board Investor\s*<span>CFO Pack<\/span><\/h1>/i);
  assert.match(indexHtml, /class=["']board-overview["']/);
  assert.match(indexHtml, /class=["']board-metrics["']/);
  assert.doesNotMatch(indexHtml, /class=["']board-snapshot/);
  assert.doesNotMatch(indexHtml, /class=["']board-signal-grid["']/);
  assert.doesNotMatch(indexHtml, /class=["']board-brief["']/);
  assert.match(indexHtml, /function resizeDashboardFrame\(\)/);
  assert.match(indexHtml, /dashboardShell\.getBoundingClientRect\(\)\.height/);
  assert.match(indexHtml, /preview\.style\.minHeight\s*=\s*["']0["']/);
  assert.match(indexHtml, /preview\.style\.overflowY\s*=\s*["']hidden["']/);
  assert.doesNotMatch(indexHtml, /\.scrollHeight/);
  assert.doesNotMatch(indexHtml, /function resizePreviewFrame\(\)/);
  assert.doesNotMatch(indexHtml, />104x</);
  assert.match(pageCss, /\.board-dashboard-shell\s*\{[^}]*padding:\s*0;[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/s);
  assert.match(previewHtml, /function initControls\(\)/);
  assert.match(previewHtml, /renderPage\(state\.page\)/);
  assert.match(previewHtml, /window\.previewActions\s*=/);
  assert.match(previewHtml, /window\.__dashboardQa\s*=/);
  assert.doesNotMatch(previewHtml, /\bdata-stage-shell\b/);
});

test("resolves all promoted branch assets and links inside the production repository", async () => {
  const routes = (await walkHtml(REPO_ROOT)).filter((route) => !EXCLUDED_REFERENCE_ROUTES.has(route));

  for (const route of routes) {
    const html = await fs.readFile(path.join(REPO_ROOT, route), "utf8");
    for (const value of localReferences(html)) {
      if (isExternalReference(value)) continue;
      const resolved = resolveProductionReference(route, value);
      if (!resolved) continue;
      assert.equal(resolved.startsWith(REPO_ROOT), true, `${route}: ${value} escapes repository`);
      await assert.doesNotReject(fs.access(resolved), `${route}: missing ${value}`);
    }
  }

  await assert.doesNotReject(fs.access(path.join(THEMED_ASSET_ROOT, "css", "templates.css")));
  await assert.doesNotReject(fs.access(path.join(THEMED_ASSET_ROOT, "js", "site.js")));
});
