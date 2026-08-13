import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readRootHomepage = () => fs.readFile(path.join(repoRoot, "index.html"), "utf8");
const readHomepageCss = () =>
  fs.readFile(path.join(repoRoot, "assets/agentic-home/css/homepage.css"), "utf8");
const readShellCss = () =>
  fs.readFile(path.join(repoRoot, "assets/agentic-home/css/shell.css"), "utf8");

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

test("renders stable shared branding and icons across operating systems", async () => {
  const [html, homepageCss, shellCss] = await Promise.all([
    readRootHomepage(),
    readHomepageCss(),
    readShellCss(),
  ]);

  assert.match(shellCss, /\.stage-shell-brand-mark\s*\{[^}]*background-image:\s*none/s);
  assert.match(shellCss, /\.stage-shell-brand-mark::before\s*\{[^}]*content:\s*"AT"/s);
  assert.match(shellCss, /\.stage-shell-brand-copy small\s*\{[^}]*font-family:\s*var\(--stage-mono\)/s);
  assert.match(homepageCss, /\.ui-icon-external\s*\{[^}]*mask-image:/s);
  assert.match(homepageCss, /\.ui-icon-play\s*\{[^}]*mask-image:/s);
  assert.doesNotMatch(html, /&nearr;|&#9654;|▶|↗/u);
});

test("keeps capability evidence labels and actions on one responsive row", async () => {
  const [html, homepageCss] = await Promise.all([readRootHomepage(), readHomepageCss()]);

  assert.match(
    homepageCss,
    /@media \(max-width: (?:760|520)px\)[\s\S]*?\.score-evidence-link\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto/s,
  );
  assert.match(homepageCss, /\.score-destination\s*\{[^}]*white-space:\s*nowrap/s);
  assert.doesNotMatch(html, /class="score-destination">View\s*<i\b/);
});

test("presents the main demo compactly and runs the automation preview as background media", async () => {
  const [html, homepageCss] = await Promise.all([readRootHomepage(), readHomepageCss()]);

  assert.doesNotMatch(html, /class="demo-compact-toolbar"/);
  assert.match(homepageCss, /@media \(min-width: 901px\)[\s\S]*?\.demo\s*\{[^}]*height:\s*100svh/s);
  assert.match(homepageCss, /@media \(min-width: 901px\)[\s\S]*?\.demo-window\s*\{[^}]*width:\s*min\(100%, calc\(\(100svh - 96px\) \* 1\.7778\)\)[^}]*aspect-ratio:\s*16 \/ 9/s);
  assert.match(homepageCss, /@media \(min-width: 901px\)[\s\S]*?\.demo-hook-video\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(html, /id="automation-case-video"[\s\S]*data-autoplay="true"/);
  assert.match(html, /id="automation-case-video"[\s\S]*data-playback-rate="5"/);
  assert.doesNotMatch(html, /class="video-toggle"/);
  assert.match(homepageCss, /\.automation-video-route\s*\{[^}]*bottom:\s*12px/s);
  assert.match(html, /href="\.\/blog\/predictive-collections-agent\/#deck-title"[\s\S]*?>HTML Slides<\/span>/);
});
