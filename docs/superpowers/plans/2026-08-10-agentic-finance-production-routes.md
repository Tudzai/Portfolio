# Agentic Finance Production Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the approved purple Agentic Finance UI from the local Stage mirror to every canonical recruiter-facing production route while preserving URLs, content, downloads, analytics, and privacy boundaries.

**Architecture:** Keep `Stage/` ignored and local-only. A production promotion script reads the approved 85-route Stage manifest, maps Stage-local HTML and theme assets into canonical repository paths, restores production robots and analytics behavior, and preserves the existing custom production homepage. Regression tests validate route count, shared shell/template adapters, resolved links, and the absence of Stage-only references.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js ESM scripts, Node test runner, GitHub Pages.

## Global Constraints

- Production deploys from repository root on `master`; never publish `Stage/` itself.
- Preserve all existing public route slugs and case-owned assets.
- Keep canonical content, downloads, metadata, and synthetic/public-safe labels intact.
- Every promoted page must use production analytics and must not contain `noindex`, local paths, credentials, PBIX/PBIT references, or `Stage/` URLs.
- Responsive QA covers 390px mobile, 768px tablet, and 1280px desktop with no horizontal overflow.

---

### Task 1: Production route-theme contract

**Files:**
- Create: `scripts/tests/production-route-theme.test.mjs`
- Read: `Stage/agentic-finance/review-data.js`
- Read: `scripts/build-agentic-finance-stage.mjs`

**Interfaces:**
- Consumes: the 85-route Stage manifest and `classifyRoute(route)`.
- Produces: regression assertions for the 84 non-home production routes and shared theme assets.

- [ ] **Step 1: Write failing tests** that assert canonical branch pages have one shared shell, one route intro, the matching template adapter, production robots/analytics, and resolvable local references.
- [ ] **Step 2: Run `node --test scripts/tests/production-route-theme.test.mjs`** and confirm it fails because production branch pages still use the legacy shell.
- [ ] **Step 3: Keep the test independent** by deriving expected route count and template names from literal manifest records and `classifyRoute`, not from the promoter output.

### Task 2: Reproducible production promoter

**Files:**
- Create: `scripts/promote-agentic-finance-production.mjs`
- Modify: `assets/agentic-home/css/` and `assets/agentic-home/js/` by copying approved shared Stage adapters.
- Modify: canonical HTML routes listed in `Stage/agentic-finance/review-data.js`, excluding `index.html` and redirect-only `404.html`.

**Interfaces:**
- Consumes: `promoteAgenticFinance({ repoRoot })` with the local Stage mirror present.
- Produces: `{ discovered, promoted, skipped }` and production-safe canonical HTML.

- [ ] **Step 1: Implement URL mapping** by resolving each Stage-local URL, mapping Stage routes back to canonical routes, mapping Stage theme assets to `assets/agentic-home/`, and preserving query/hash suffixes.
- [ ] **Step 2: Restore production behavior** by changing robots to `index, follow`, adding the correct relative `analytics.js` reference, and rejecting any output that still references `Stage/`.
- [ ] **Step 3: Copy approved shared assets** (`templates.css`, eight template adapters, and `site.js`) into `assets/agentic-home/`.
- [ ] **Step 4: Promote all manifest routes except the approved custom homepage and redirect-only 404 page**, preserving canonical filenames and content.
- [ ] **Step 5: Run the production route-theme test** and confirm it passes.

### Task 3: Full automated and responsive verification

**Files:**
- Test: `scripts/tests/production-homepage.test.mjs`
- Test: `scripts/tests/production-route-theme.test.mjs`
- Test: `scripts/tests/agentic-finance-stage.test.mjs`
- Test: `scripts/tests/agentic-finance-theme.test.mjs`

**Interfaces:**
- Consumes: the promoted canonical route tree.
- Produces: a green production gate and browser QA evidence.

- [ ] **Step 1: Run Node tests and syntax checks** for homepage, route theme, Stage builder, shared navigation, shared site behavior, and homepage behavior.
- [ ] **Step 2: Run `git diff --check` and privacy scans** over the exact changed files.
- [ ] **Step 3: Browser-check representative routes** from CV, blog, FP&A, automation, Power BI, model hub, model detail, and dashboard preview at desktop and mobile widths.
- [ ] **Step 4: Verify keyboard navigation, visible focus, local links, downloads, console output, and horizontal overflow.**

### Task 4: Production deployment

**Files:**
- Commit only the tested canonical HTML, shared theme assets, promoter, tests, and this plan.

**Interfaces:**
- Consumes: a clean staged diff with passing checks.
- Produces: one commit on `codex/testmainpage`, fast-forwarded to `origin/master`, with a successful GitHub Pages deployment.

- [ ] **Step 1: Stage exact files and run `git diff --cached --check`.**
- [ ] **Step 2: Commit with `feat(site): promote purple theme across routes`.**
- [ ] **Step 3: Push `codex/testmainpage`, fast-forward the same commit to `master`, and wait for Pages deployment.**
- [ ] **Step 4: Verify the public homepage and representative branch routes with cache-busted URLs.**
