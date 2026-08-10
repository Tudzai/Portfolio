import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readRootHomepage = () => fs.readFile(path.join(repoRoot, "index.html"), "utf8");

test("serves the approved Agentic Finance homepage from the production root", async () => {
  const html = await readRootHomepage();

  assert.match(html, /<meta name="robots" content="index, follow"/);
  assert.match(html, /<title>Truong Dinh Anh Tu \| FP&amp;A, Automation &amp; Agentic AI<\/title>/);
  assert.match(html, /<section id="hero" class="hero"/);
  assert.match(html, /class="score-row score-fpa"/);
  assert.match(html, /class="score-row score-automation"/);
  assert.match(html, /class="score-row score-agentic"/);
  assert.match(html, /class="hero-demo-entry"/);
  assert.match(html, /assets\/agentic-home\/css\/homepage\.css/);
  assert.match(html, /assets\/agentic-home\/js\/homepage\.js/);
  assert.match(html, /analytics\.js/);
  assert.doesNotMatch(html, /Stage\/agentic-finance|noindex|noarchive/);
});

test("keeps every local production-homepage URL inside the deployed repository", async () => {
  const html = await readRootHomepage();
  const attributes = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  const localUrls = attributes.filter(
    (value) =>
      !value.startsWith("#") &&
      !value.startsWith("data:") &&
      !value.startsWith("mailto:") &&
      !/^https?:\/\//.test(value),
  );

  const missing = [];
  for (const url of localUrls) {
    const cleanUrl = url.split(/[?#]/, 1)[0];
    const relativePath = cleanUrl.replace(/^\.\//, "");
    const resolved = path.resolve(repoRoot, relativePath);
    const relativeToRoot = path.relative(repoRoot, resolved);

    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      missing.push(`${url} (outside repository root)`);
      continue;
    }

    let candidate = resolved;
    try {
      const stats = await fs.stat(candidate);
      if (stats.isDirectory()) candidate = path.join(candidate, "index.html");
      await fs.access(candidate);
    } catch {
      missing.push(url);
    }
  }

  assert.deepEqual(missing, []);
});
