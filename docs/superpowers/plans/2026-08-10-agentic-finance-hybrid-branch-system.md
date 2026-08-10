# Agentic Finance Hybrid Branch System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved homepage theme and hybrid content hierarchy to all 85 Stage routes through one route-context module, the existing builder, shared components, and eight responsive template adapters.

**Architecture:** Canonical pages remain the content source. A Stage-only route-context module provides family/template labels, decision flows, evidence posture, and hub navigation. The builder injects one semantic context rail into every generated branch page, while shared CSS restyles the preserved source markup by template.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, Node.js ES modules, Node test runner, PowerShell, and local browser QA.

## Global Constraints

- Work only in `Stage/agentic-finance/`, `scripts/`, and this approved planning documentation.
- Preserve exactly 85 scoped routes and all canonical URLs, evidence, finance values, media, downloads, and interactions.
- Do not modify production pages or registries.
- Keep `noindex, nofollow, noarchive`; production analytics remain disabled.
- Do not stage, commit, push, merge, deploy, or promote unless the user explicitly requests that Git action after validation.
- Use Manrope, DM Sans, and IBM Plex Mono through shared tokens.
- Meet WCAG AA, 44px touch targets, keyboard operation, reduced motion, and no page-level horizontal overflow from 320px upward.

---

### Task 1: Add deterministic route context

**Files:**
- Create: `scripts/agentic-finance-route-context.mjs`
- Modify: `scripts/tests/agentic-finance-stage.test.mjs`
- Modify: `scripts/build-agentic-finance-stage.mjs`

**Interfaces:**
- Produces `getStageRouteContext({ sourcePath, family, template }): StageRouteContext`.
- `StageRouteContext` contains `index`, `label`, `flow`, `evidence`, `hubRoute`, and `hubLabel`.
- Produces `renderStageRouteIntro({ stagePath, sourcePath, routeInfo }): string` inside the builder.

- [ ] **Step 1: Write a failing route-context unit test**

```js
import { getStageRouteContext } from "../agentic-finance-route-context.mjs";

test("describes route families with recruiter-scannable context", () => {
  assert.deepEqual(
    getStageRouteContext({
      sourcePath: "showcase/financial-models/fx-exposure-hedge/index.html",
      family: "models",
      template: "model-detail",
    }),
    {
      index: "04",
      label: "Model / Workbook",
      flow: ["Inputs", "Logic", "Controls"],
      evidence: "Governed synthetic workbook",
      hubRoute: "showcase/financial-models/index.html",
      hubLabel: "Model library",
    },
  );
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test --test-name-pattern="recruiter-scannable context" scripts/tests/agentic-finance-stage.test.mjs`

Expected: FAIL because the route-context module does not exist.

- [ ] **Step 3: Implement the minimal family/template map**

Create immutable defaults for core, blog, FP&A, Power BI, models, and automation. Return a fresh object and flow array so callers cannot mutate shared configuration.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `node --test --test-name-pattern="recruiter-scannable context" scripts/tests/agentic-finance-stage.test.mjs`

Expected: PASS.

- [ ] **Step 5: Write a failing builder composition test**

```js
test("injects one route context rail into generated branch content", async () => {
  const result = composeStageDocument(
    await loadFixture("legacy-shell.html"),
    stageContext("showcase/financial-models/example/index.html"),
  );

  assert.equal((result.match(/data-stage-route-intro/g) ?? []).length, 1);
  assert.match(result, /Model \/ Workbook/);
  assert.match(result, /Inputs<span aria-hidden="true">→<\/span>Logic/);
  assert.match(result, /Model library/);
});
```

- [ ] **Step 6: Run the composition test and confirm RED**

Run: `node --test --test-name-pattern="route context rail" scripts/tests/agentic-finance-stage.test.mjs`

Expected: FAIL because the builder does not render the rail.

- [ ] **Step 7: Render the rail immediately inside the main landmark**

Use the existing route-relative URL helper. Do not inject the rail into the custom homepage. Use a `<div>` with a label, ordered flow, evidence text, and route-family link; do not create another H1.

- [ ] **Step 8: Run all builder tests**

Run: `node --test scripts/tests/agentic-finance-stage.test.mjs`

Expected: all tests pass.

### Task 2: Build the shared hybrid visual layer

**Files:**
- Modify: `Stage/agentic-finance/assets/css/tokens.css`
- Modify: `Stage/agentic-finance/assets/css/base.css`
- Modify: `Stage/agentic-finance/assets/css/components.css`
- Modify: `Stage/agentic-finance/assets/css/templates.css`
- Create: `scripts/tests/agentic-finance-theme.test.mjs`

**Interfaces:**
- `tokens.css` owns visual constants and fluid sizing.
- `components.css` owns `.stage-route-intro` and reusable Stage content components.
- `templates.css` owns shared generated-route composition.

- [ ] **Step 1: Write failing static theme-contract tests**

```js
test("defines the hybrid route context component and responsive contract", async () => {
  const components = await fs.readFile(path.join(STAGE_CSS, "components.css"), "utf8");
  const templates = await fs.readFile(path.join(STAGE_CSS, "templates.css"), "utf8");
  assert.match(components, /\.stage-route-intro\s*\{/);
  assert.match(components, /\.stage-route-flow\s*\{/);
  assert.match(templates, /data-stage-template="hub"/);
  assert.match(templates, /@media \(max-width: 760px\)/);
  assert.doesNotMatch(`${components}\n${templates}`, /transition:\s*all/i);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test scripts/tests/agentic-finance-theme.test.mjs`

Expected: FAIL because the route-context component does not exist.

- [ ] **Step 3: Extend tokens and base typography**

Add fluid body, route-label, panel, section, and motion tokens using the approved palette. Keep compatibility aliases used by the homepage and existing branch markup.

- [ ] **Step 4: Implement the route-context component**

Desktop uses a four-area grid: route label, decision flow, evidence posture, and CTA. Tablet reflows to two rows. Mobile stacks label and flow while keeping the CTA at least 44px tall.

- [ ] **Step 5: Strengthen shared branch composition**

Give generated pages a consistent editorial hero, readable section rhythm, clear main visual, alternating light/dark evidence surfaces, restrained CTA hierarchy, and 65-76ch reading rails. Preserve all existing semantic content.

- [ ] **Step 6: Run the theme-contract test and confirm GREEN**

Run: `node --test scripts/tests/agentic-finance-theme.test.mjs`

Expected: PASS.

### Task 3: Refine all eight route templates

**Files:**
- Modify: `Stage/agentic-finance/assets/css/templates/hub.css`
- Modify: `Stage/agentic-finance/assets/css/templates/case.css`
- Modify: `Stage/agentic-finance/assets/css/templates/dashboard-preview.css`
- Modify: `Stage/agentic-finance/assets/css/templates/model-detail.css`
- Modify: `Stage/agentic-finance/assets/css/templates/article.css`
- Modify: `Stage/agentic-finance/assets/css/templates/deck.css`
- Modify: `Stage/agentic-finance/assets/css/templates/cv.css`
- Modify: `Stage/agentic-finance/assets/css/templates/utility.css`
- Modify: `scripts/tests/agentic-finance-theme.test.mjs`

**Interfaces:**
- Each route loads exactly one adapter selected by `templateStylesheetFor(template)`.
- Adapter rules remain scoped to `body[data-stage-template="..."]`.

- [ ] **Step 1: Add failing adapter coverage assertions**

Read every adapter and assert that it contains its matching `data-stage-template` selector, a mobile breakpoint, and no `transition: all` declaration.

- [ ] **Step 2: Run adapter tests and confirm RED**

Run: `node --test --test-name-pattern="adapter" scripts/tests/agentic-finance-theme.test.mjs`

Expected: at least one adapter fails the new hybrid contract.

- [ ] **Step 3: Refine hubs**

Use a concise hero, featured evidence region, scannable filters, and responsive catalogue grid. Keep summaries short through width and line-clamp presentation without deleting source content.

- [ ] **Step 4: Refine cases and automation**

Use decision-first heroes, prominent main visuals, two-column evidence modules, clear action/control areas, and a full-width video frame where present.

- [ ] **Step 5: Refine Power BI cases and previews**

Keep dashboard colors intact inside an ink evidence frame. Make the route context and return path visible without shrinking the dashboard canvas.

- [ ] **Step 6: Refine model details**

Use a decision-led hero, compact metadata strip, workflow cards, large rendered-sheet gallery, QA/limits panels, and a prominent download action.

- [ ] **Step 7: Refine articles and decks**

Use an editorial summary, sticky or inline TOC depending on width, 760px reading rail, evidence callouts, and related-work CTA.

- [ ] **Step 8: Refine CV and utility routes**

Keep one primary task visible, use the homepage header/footer, and remove unnecessary empty space at mobile and desktop sizes.

- [ ] **Step 9: Run adapter tests and confirm GREEN**

Run: `node --test scripts/tests/agentic-finance-theme.test.mjs`

Expected: all adapters satisfy the contract.

### Task 4: Rebuild and validate all routes

**Files:**
- Regenerate: `Stage/agentic-finance/**/*.html`, excluding custom Stage files
- Regenerate: `Stage/agentic-finance/review-data.js`
- Modify only if a new invariant is required: `scripts/validate-agentic-finance-stage.mjs`
- Modify only if a validator test is added first: `scripts/tests/agentic-finance-validator.test.mjs`

**Interfaces:**
- `buildStage()` must discover 85 routes, generate 84, and skip the custom homepage.
- The validator must report zero Stage-boundary, privacy, structure, or link failures.

- [ ] **Step 1: Run all unit tests before regeneration**

Run: `node --test scripts/tests/agentic-finance-stage.test.mjs scripts/tests/agentic-finance-validator.test.mjs scripts/tests/agentic-finance-theme.test.mjs`

Expected: PASS.

- [ ] **Step 2: Regenerate the Stage mirror**

Run: `node scripts/build-agentic-finance-stage.mjs`

Expected: `Agentic Finance Stage built: 84 generated, 1 custom/skipped, 85 routes discovered.`

- [ ] **Step 3: Validate all generated routes**

Run: `node scripts/validate-agentic-finance-stage.mjs`

Expected: 85 validated routes and zero errors.

- [ ] **Step 4: Run syntax and diff checks**

```powershell
node --check scripts/build-agentic-finance-stage.mjs
node --check scripts/agentic-finance-route-context.mjs
node --check Stage/agentic-finance/assets/js/navigation.js
node --check Stage/agentic-finance/assets/js/site.js
git diff --check -- Stage/agentic-finance scripts docs/superpowers
```

- [ ] **Step 5: Run proportional repository preflight**

Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\portfolio-preflight.ps1`

Report unrelated pre-existing findings without changing them.

### Task 5: Visual and interaction QA

**Files:**
- Generated screenshots only: ignored `output/playwright/agentic-finance-hybrid-branches/`

**Interfaces:**
- Review one representative route for each of the eight templates at 1440px and 375px.
- Review all hubs at 1024px.

- [ ] **Step 1: Inspect representative routes**

Use the local server at port 4173 and capture hub, case, dashboard-preview, model-detail, article, deck, CV, and utility routes.

- [ ] **Step 2: Check interaction and accessibility**

Verify shared navigation, skip link, keyboard focus, filter controls, article TOC, dashboard interaction, media fallback, and reduced-motion behavior.

- [ ] **Step 3: Check responsive boundaries**

Verify no page-level horizontal overflow at 320, 375, 768, 1024, and 1440px. Dashboard canvases may scroll only inside their own frame.

- [ ] **Step 4: Inspect final scope**

Run: `git status --short -- Stage/agentic-finance scripts docs/superpowers`

Confirm the final diff contains only the approved Stage system, generator/tests, and planning documentation.

## Definition of Done

- One deterministic route-context rail appears on every generated branch route.
- Hubs are concise and details remain evidence-rich.
- All eight templates use the homepage visual system and remain responsive.
- All 85 routes validate, and representative desktop/mobile pages pass visual and interaction QA.
- Production and unrelated dirty-tree changes remain untouched.
