import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readCvHtml = () => fs.readFile(path.join(repoRoot, "cv.html"), "utf8");
const readCvCss = () =>
  fs.readFile(path.join(repoRoot, "assets/agentic-home/css/templates/cv.css"), "utf8");

test("uses a compact document-first CV composition", async () => {
  const [html, css] = await Promise.all([readCvHtml(), readCvCss()]);

  assert.match(html, /class="cv-hero-copy"/);
  assert.match(html, /<h1>Truong Dinh Anh Tu<\/h1>/);
  assert.match(html, /class="cv-document-bar"/);
  assert.match(html, /Commercial FP&amp;A · Finance Automation · Agentic AI/);
  assert.match(css, /\.stage-route-intro\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.cv-hero\s*\{[^}]*min-height:\s*0/s);
  assert.match(css, /\.cv-viewer-section\s*\{[^}]*padding:\s*0/s);
});

test("retains CV download, browser-open, and portfolio navigation actions", async () => {
  const html = await readCvHtml();

  assert.match(html, /href="assets\/Truong-Dinh-Anh-Tu-CV-2026\.pdf"[^>]*download=/);
  assert.match(html, /href="assets\/Truong-Dinh-Anh-Tu-CV-2026\.pdf"[^>]*target="_blank"/);
  assert.match(html, /href="index\.html#hero"/);
});
