import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const excludedRootDirectories = new Set(["BI", "Stage", "node_modules", "output", "outputs", "scripts", "test-results", "tmp"]);
const analyticsVersion = "posthog-replay-fix-20260816";

const toPosix = (value) => value.replaceAll(path.sep, "/");

async function walkLiveHtml(directory, routes = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (directory === repoRoot && excludedRootDirectories.has(entry.name)) continue;
    if (entry.name === "node_modules" || entry.name === "remotion") continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walkLiveHtml(absolutePath, routes);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      routes.push(toPosix(path.relative(repoRoot, absolutePath)));
    }
  }
  return routes.sort();
}

test("links every live portfolio HTML route to the current PostHog bootstrap", async () => {
  const routes = await walkLiveHtml(repoRoot);
  assert.equal(routes.length, 90);

  for (const route of routes) {
    const html = await fs.readFile(path.join(repoRoot, route), "utf8");
    const match = html.match(/<script\b[^>]*\bsrc=["']([^"']*analytics\.js\?v=([^"']+))["'][^>]*>/i);
    assert.ok(match, `${route}: missing analytics bootstrap`);
    assert.equal(match[2], analyticsVersion, `${route}: stale analytics cache key`);

    const sourcePath = match[1].split(/[?#]/, 1)[0];
    const resolvedSource = sourcePath.startsWith("/Portfolio/")
      ? path.resolve(repoRoot, sourcePath.slice("/Portfolio/".length))
      : path.resolve(repoRoot, path.dirname(route), sourcePath);
    assert.equal(resolvedSource, path.join(repoRoot, "analytics.js"), `${route}: analytics path does not resolve to the shared bootstrap`);
  }
});

test("keeps private knowledge-vault analytics pageview-only", async () => {
  const [analytics, vault] = await Promise.all([
    fs.readFile(path.join(repoRoot, "analytics.js"), "utf8"),
    fs.readFile(path.join(repoRoot, "knowledge-vault/index.html"), "utf8"),
  ]);

  assert.match(analytics, /restrictedAnalytics\s*\?\s*false\s*:\s*\{/);
  assert.match(analytics, /disable_persistence:\s*restrictedAnalytics/);
  assert.match(analytics, /disable_session_recording:\s*restrictedAnalytics\s*\|\|/);
  assert.match(analytics, /restrictedAnalytics\s*&&\s*eventName\s*!==\s*["']portfolio_page_loaded["']/);
  assert.match(vault, /class="is-locked ph-no-capture"/);
  assert.match(vault, /data-ph-no-autocapture/);
});

test("preserves PostHog replay snapshots before custom event sanitization", async () => {
  const analytics = await fs.readFile(path.join(repoRoot, "analytics.js"), "utf8");
  const replayGuard = analytics.indexOf('if (event.event === "$snapshot") return event;');
  const customSanitizer = analytics.indexOf("sanitizePostHogPropertyTree(rawProperties)", replayGuard);

  assert.notEqual(replayGuard, -1, "missing replay snapshot guard");
  assert.ok(customSanitizer > replayGuard, "replay snapshot guard must run before custom property sanitization");
});
