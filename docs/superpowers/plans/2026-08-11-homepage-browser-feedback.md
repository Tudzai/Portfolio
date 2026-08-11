# Homepage Browser Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the seven approved homepage browser comments with responsive, operating-system-stable branding, icons, and video presentation.

**Architecture:** Extend the existing production-homepage contract test, then update shared shell CSS for the reusable brand mark and homepage HTML/CSS for capability and video behavior. Reuse the current video observer so autoplay continues to honor reduced-motion, visibility, and data-saving safeguards.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js built-in test runner, in-app browser visual QA.

## Global Constraints

- Preserve all current content destinations and accessible labels.
- Use `assets/favicon.svg` for the shared brand mark.
- Use SVG/CSS icons instead of operating-system-rendered arrow or play glyphs in the changed homepage flow.
- Keep video playback muted, inline, looping, and reduced-motion/data-saving aware.
- Keep the main demo at native 16:9 without cropping.

---

### Task 1: Add homepage behavior contracts

**Files:**
- Modify: `scripts/tests/production-homepage.test.mjs`
- Test: `scripts/tests/production-homepage.test.mjs`

**Interfaces:**
- Consumes: root `index.html`, `assets/agentic-home/css/homepage.css`, and `assets/agentic-home/css/shell.css` as text.
- Produces: regression coverage for favicon branding, compact capability actions, background preview autoplay, removed Watch link, and compact demo controls.

- [ ] **Step 1: Write failing tests** that read the three production files and assert user-visible contracts: favicon-backed shell mark CSS; `data-autoplay="true"`; no `video-toggle`; native demo fit; capability links retaining a two-column mobile grid; and icon spans that do not contain northeast-arrow/play glyphs.
- [ ] **Step 2: Run test to verify it fails**

```powershell
node --test scripts/tests/production-homepage.test.mjs
```

Expected: FAIL because the favicon mark, autoplay, compact controls, and stable icon contracts are not yet implemented.

### Task 2: Implement shared branding and stable icons

**Files:**
- Modify: `assets/agentic-home/css/shell.css`
- Modify: `index.html`
- Modify: `assets/agentic-home/css/homepage.css`

**Interfaces:**
- Consumes: `assets/favicon.svg` and existing `.stage-shell-brand-*`, `.score-destination`, and hero demo classes.
- Produces: shared favicon artwork, mono brand descriptor, CSS mask external-link and play icons, and one-line capability links.

- [ ] **Step 1: Implement minimal shared-shell branding** by replacing the visible monogram with a favicon background and applying `var(--mono)` to the descriptor.
- [ ] **Step 2: Replace changed arrow/play entities** with empty icon spans and CSS mask shapes.
- [ ] **Step 3: Keep capability rows horizontal on narrow screens** with `minmax(0, 1fr) auto`, single-line action text, and safe label wrapping.
- [ ] **Step 4: Run the focused test** and confirm only video-layout expectations remain if they are not yet implemented.

### Task 3: Redesign both video presentations

**Files:**
- Modify: `index.html`
- Modify: `assets/agentic-home/css/homepage.css`

**Interfaces:**
- Consumes: existing `homepage.js` video observer and caption-language controls.
- Produces: compact overlaid demo toolbar, native 16:9 media fit, and a muted looping background automation preview with its route strip at the bottom.

- [ ] **Step 1: Move the demo toolbar into `.demo-embed`** while preserving the controls' data attributes and accessible labels.
- [ ] **Step 2: Set the main demo video to `object-fit: contain`** and style the toolbar as a responsive overlay.
- [ ] **Step 3: Change the automation preview to `autoplay` plus `data-autoplay="true"`, remove `.video-toggle`, and lower `.automation-video-route`.
- [ ] **Step 4: Run the focused test** and confirm all tests pass.

### Task 4: Repository and visual verification

**Files:**
- Verify: all modified files.

**Interfaces:**
- Consumes: local server at `http://127.0.0.1:8000/`.
- Produces: evidence that automated contracts, source hygiene, and responsive layouts pass.

- [ ] **Step 1: Run complete relevant checks**

```powershell
node --test scripts/tests/*.test.mjs
git diff --check
```

- [ ] **Step 2: Inspect desktop at 1201×731** and verify 16:9 demo fit, compact controls, autoplaying preview, no Watch button, and lowered route strip.
- [ ] **Step 3: Inspect mobile at 319×731** and verify favicon mark, descriptor font, one-line label/action rows, stable icons, and no horizontal overflow.
- [ ] **Step 4: Inspect reduced-motion behavior** and confirm the background preview is not forced to play.
- [ ] **Step 5: Review `git diff` and report the changed files and verification evidence.

