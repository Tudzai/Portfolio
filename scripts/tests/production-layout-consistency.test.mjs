import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFile(path.join(repoRoot, relativePath), "utf8");

function normalizedRules(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].replace(/\s+/g, " ").trim(),
    declarations: match[2],
  }));
}

function widthValue(declarations) {
  return declarations.match(/(?:^|;)\s*width\s*:\s*([^;]+)/)?.[1]?.trim();
}

function assertSharedShellRules(css, predicate, label, expectedCount) {
  const rules = normalizedRules(css).filter(({ selector }) => predicate(selector));
  assert.equal(rules.length, expectedCount, `${label}: expected ${expectedCount} active width rules`);

  for (const { selector, declarations } of rules) {
    assert.equal(
      widthValue(declarations),
      "var(--stage-shell)",
      `${label}: ${selector} must delegate its width to --stage-shell`,
    );
  }
}

test("defines one responsive shell contract for desktop and mobile", async () => {
  const [tokensCss, baseCss, templatesCss, homepageCss] = await Promise.all([
    read("assets/agentic-home/css/tokens.css"),
    read("assets/agentic-home/css/base.css"),
    read("assets/agentic-home/css/templates.css"),
    read("assets/agentic-home/css/homepage.css"),
  ]);

  assert.match(
    tokensCss,
    /:root\s*\{[^}]*--stage-shell:\s*min\(1240px,\s*calc\(100%\s*-\s*48px\)\);/s,
    "desktop shell should remain the homepage reference width",
  );
  assert.match(
    tokensCss,
    /@media\s*\(max-width:\s*760px\)\s*\{\s*:root\s*\{[^}]*--stage-shell:\s*calc\(100%\s*-\s*32px\);[^}]*\}\s*\}/s,
    "mobile gutters should be owned by the shared --stage-shell token",
  );
  assert.match(
    baseCss,
    /:is\([^)]*\.page-shell[^)]*\.shell[^)]*\.dashboard[^)]*\)|\.stage-shell,[\s\S]*?\{[^}]*width:\s*var\(--stage-shell\)/,
    "base shells should consume the shared token",
  );

  assertSharedShellRules(
    templatesCss,
    (selector) => selector === 'body[data-stage-template] :is(.page-shell, .shell, .dashboard)',
    "shared template wrapper",
    2,
  );
  assertSharedShellRules(
    templatesCss,
    (selector) =>
      selector ===
      'body[data-stage-template]:not([data-stage-template="homepage"]) > main[data-stage-content]',
    "shared branch main",
    1,
  );

  const homepageShellAssignments = [...homepageCss.matchAll(/--shell\s*:\s*([^;]+);/g)];
  assert.ok(homepageShellAssignments.length >= 3, "homepage should expose its shell alias at every desktop density");
  for (const assignment of homepageShellAssignments) {
    assert.equal(assignment[1].trim(), "var(--stage-shell)", "homepage --shell aliases must use --stage-shell");
  }
});

test("keeps every themed route-family outer main on the shared shell", async () => {
  const [hubCss, simpleThreeCss, articleCss, cvCss, dashboardPreviewCss] = await Promise.all([
    read("assets/agentic-home/css/templates/hub.css"),
    read("assets/agentic-home/css/templates/simple-three.css"),
    read("assets/agentic-home/css/templates/article.css"),
    read("assets/agentic-home/css/templates/cv.css"),
    read("assets/agentic-home/css/templates/dashboard-preview.css"),
  ]);

  assertSharedShellRules(
    hubCss,
    (selector) =>
      selector.includes('body[data-stage-template="hub"][data-stage-family="powerbi"]') &&
      selector.includes('body[data-stage-template="hub"][data-stage-family="models"]') &&
      selector.endsWith(") main[data-stage-content]"),
    "library hubs",
    2,
  );
  assertSharedShellRules(
    simpleThreeCss,
    (selector) => selector === "body.simple-three-page main[data-stage-content]",
    "simple-three routes",
    2,
  );
  assertSharedShellRules(
    articleCss,
    (selector) =>
      selector === 'body[data-stage-template="article"].aabw-recap-page main.blog-page',
    "AABW article",
    2,
  );
  assertSharedShellRules(
    cvCss,
    (selector) => selector === 'body[data-stage-template="cv"] > main.cv-shell[data-stage-content]',
    "CV",
    2,
  );
  assertSharedShellRules(
    dashboardPreviewCss,
    (selector) => selector === 'body[data-stage-template="dashboard-preview"] main.dashboard',
    "dashboard preview wrapper",
    2,
  );
  assertSharedShellRules(
    dashboardPreviewCss,
    (selector) =>
      selector ===
      'body[data-stage-template="dashboard-preview"] > main[data-stage-content].dashboard',
    "dashboard preview main",
    2,
  );
});

test("keeps route-owned outer overrides on the shared shell", async () => {
  const [workspaceCss, ebitdaCss, boardCaseCss] = await Promise.all([
    read("showcase/workspace-hub/hub.css"),
    read("showcase/fpa-decision-cases/ebitda-variance-bridge/ebitda-variance-bridge.css"),
    read("showcase/powerbi/board-investor-cfo-pack/board-pack-page.css"),
  ]);

  assertSharedShellRules(
    workspaceCss,
    (selector) => selector === ".workspace-hub-page main[data-stage-content]",
    "Workspace Hub",
    2,
  );
  assertSharedShellRules(
    ebitdaCss,
    (selector) => selector === "body.ebitda-bridge-page main[data-stage-content]",
    "EBITDA variance bridge",
    3,
  );
  assertSharedShellRules(
    boardCaseCss,
    (selector) =>
      selector ===
      'body.board-pack-page[data-stage-template="case"] > main.board-case[data-stage-content]',
    "Power BI board cases",
    2,
  );
});
