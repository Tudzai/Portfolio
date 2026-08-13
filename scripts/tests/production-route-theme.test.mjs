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

test("keeps the canonical recruiter-facing route inventory at 85 pages", async () => {
  const routes = await walkHtml(REPO_ROOT);
  assert.equal(routes.length, 85);
  assert.equal(routes.includes("index.html"), true);
  assert.equal(routes.includes("cv.html"), true);
  assert.equal(routes.includes("showcase/financial-models/budget-rolling-forecast/index.html"), true);
  assert.equal(routes.includes("showcase/powerbi/driver-based-forecasting/preview.html"), true);
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
  assert.equal(shellConsumers.length, 83);
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
  const routes = (await walkHtml(REPO_ROOT)).filter((route) => !EXCLUDED_THEME_ROUTES.has(route));
  assert.equal(routes.length, 82);

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
    assert.match(html, /[?&]v=routes-20260810-hybrid1/, `${route}: current theme cache key`);
    assert.match(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']index, follow["']/i, `${route}: robots`);
    assert.match(html, /analytics\.js/i, `${route}: analytics`);
    assert.doesNotMatch(html, /Stage\/agentic-finance/i, `${route}: Stage URL leak`);
    assert.doesNotMatch(html, /noindex|nofollow|noarchive/i, `${route}: Stage robots leak`);
  }
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
