import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const ROOT = path.resolve(import.meta.dirname, "../..");
const HUB = path.join(ROOT, "showcase", "workspace-hub");

const readHub = (name) => fs.readFile(path.join(HUB, name), "utf8");

test("keeps the Workspace Hub frontend-only and source-shaped", async () => {
  const [html, css, js, dataSource] = await Promise.all([
    readHub("index.html"),
    readHub("hub.css"),
    readHub("hub.js"),
    readHub("hub-data.js"),
  ]);

  const forbiddenRuntime = /\b(?:fetch|XMLHttpRequest|FileReader|WebSocket|EventSource|localStorage|sessionStorage|indexedDB)\b|type=["']file["']|\.files\b/i;
  assert.doesNotMatch(`${html}\n${js}`, forbiddenRuntime);
  assert.doesNotMatch(`${html}\n${css}\n${js}\n${dataSource}`, /SharePoint|OneDrive|truongtu410|gmail\.com|Linh Nguyen|Minh Tran|Hannah Le/i);

  assert.equal((html.match(/data-module=/g) ?? []).length, 4);
  for (const module of ["center", "todo", "data", "admin"]) {
    assert.match(html, new RegExp(`data-module=["']${module}["']`));
  }
  assert.match(html, /data-enter-(?:hub|demo)/);
  assert.match(html, /data-exit-(?:hub|demo)/);
  assert.match(html, /data-sidebar-backdrop/);
  assert.match(html, /class=["']hero-product-card["']/);
  assert.equal((html.match(/<li><b>0[1-5]<\/b>/g) ?? []).length, 5);

  for (const declaration of [
    "--hub-side: 268px",
    "--hub-brand: #9e6a2d",
    "--hub-brand-dark: #6d4317",
    "--hub-teal: #0c8d79",
  ]) {
    assert.match(css, new RegExp(declaration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  assert.match(css, /height:\s*90px/);
  assert.match(css, /\.planning-view\.active/);
  assert.match(css, /body\.workspace-hub-page\[data-stage-template=["']case["']\][^{]+\.hub-shell :is\(h1, h2, h3, h4\)/);

  const context = { window: {} };
  vm.runInNewContext(dataSource, context, { filename: "hub-data.js" });
  const data = context.window.HUB_DATA;
  assert.ok(data);
  assert.equal(data.modules.length, 4);
  assert.equal(data.kpis.length, 8);
  assert.equal(data.varianceMetrics.length, 4);
  assert.equal(data.planningRows.length, 5);
  assert.equal(data.planningSgaRows.length, 11);
  assert.equal(data.pnlRows.length, 9);
  assert.equal(data.tasks.length, 4);
  assert.equal(data.dataYears.length, 2);
  assert.deepEqual(Array.from(data.dataYears, (year) => year.sources.length), [13, 13]);
  assert.equal(data.adminUsers.length, 2);
  assert.equal(data.kpis[0].value, "$126.3M");
  assert.equal(data.series.revenue[11].actual, 24.8);
  assert.equal(data.varianceMetrics[0].rows[0].values[5], "$23.7M");
  assert.equal(data.planningRows[4].label, "Actual vs Forecast");
  assert.equal(data.dataYears[0].sources[12].fileName, "Planning_2026.xlsx");
  assert.equal(
    [...data.adminUsers, ...data.auditEvents].every((item) => item.email.endsWith("@local.test")),
    true,
  );
});
