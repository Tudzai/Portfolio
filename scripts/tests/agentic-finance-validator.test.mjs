import test from "node:test";
import assert from "node:assert/strict";
import { shouldSkipLocalReference, validateStageHtml } from "../validate-agentic-finance-stage.mjs";

test("accepts a staged HTML document with noindex metadata and no analytics", () => {
  const html = '<meta name="robots" content="noindex, nofollow, noarchive"><a href="../index.html">Home</a>';
  assert.deepEqual(validateStageHtml(html), []);
});

test("reports production analytics, private paths, and source-only artifacts", () => {
  const privatePath = "C:" + "/Users/Win/private.xlsx";
  const localFileUrl = "file" + "://" + privatePath;
  const html = [
    '<meta name="robots" content="index, follow">',
    '<script src="../../../analytics.js"></script>',
    `<a href="${localFileUrl}">Private</a>`,
    '<a href="data/model.pbix">PBIX</a>',
  ].join('');
  const errors = validateStageHtml(html);

  assert.equal(errors.some((error) => error.includes('robots')), true);
  assert.equal(errors.some((error) => error.includes('analytics.js')), true);
  assert.equal(errors.some((error) => error.includes('file://')), true);
  assert.equal(errors.some((error) => error.includes('.pbix')), true);
});

test("ignores runtime-generated template references during static link checks", () => {
  assert.equal(shouldSkipLocalReference("${row.url}"), true);
  assert.equal(shouldSkipLocalReference("assets/logo.svg"), false);
});
