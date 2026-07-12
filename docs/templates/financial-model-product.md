# Financial Model Product Brief

Use this template before adding a new model to `showcase/financial-models/`.

## 1. Identity

- Model ID:
- Canonical slug:
- Canonical filename:
- Title:
- Version:
- TDAT Model Standard version:
- Owner:
- Reviewer:
- Intended release status: Available / In QA / Roadmap
- Evidence class: synthetic / illustrative / sanitized
- Supported Excel version:
- Google Sheets / LibreOffice status:
- Macro status:
- External-link status:
- Circular-reference status:

## 2. Decision and users

- Primary decision:
- Why the decision matters:
- Primary roles:
- Secondary roles:
- Typical frequency:
- Horizon:
- Difficulty: Starter / Practitioner / Advanced
- Expected setup time:
- What this model replaces or improves:

## 3. Scope

### Included

-

### Deliberately excluded

-

### Optional future modules

-

## 4. Inputs

| Input | Units | Period / as-of | Source type | Owner | Editable? | Required? | Notes |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## 5. Drivers and methods

| Driver or method | Formula / logic | Scenario behavior | Source / rationale | Edge case |
|---|---|---|---|---|
| | | | | |

## 6. Workbook map

| Sheet | Purpose | Input / calculation / output / check | User action | Review cue |
|---|---|---|---|---|
| Cover | | | | |
| Read Me | | | | |
| Assumptions | | | | |
| Checks | | | | |
| Sources & Version | | | | |

## 7. Outputs

| Output | Decision use | Units | Source formula / schedule | Expected reviewer |
|---|---|---|---|---|
| | | | | |

## 8. Scenarios and sensitivities

- Scenario selector:
- Base definition:
- Upside definition:
- Downside definition:
- Stress definition:
- Sensitivity row driver:
- Sensitivity column driver:
- Target output:
- Boundary cases to test:

## 9. Checks

Use one assertion per row in the workbook:

```text
Check | Period | Actual | Expected | Difference | Tolerance | Status | Where to fix | Notes
```

Required checks:

- [ ] Formula error scan.
- [ ] Input completeness.
- [ ] Sign and unit sanity.
- [ ] Totals versus components.
- [ ] Model-specific finance tie-outs.
- [ ] Scenario validity.
- [ ] Boundary-case behavior.
- [ ] No hidden plug.
- [ ] No undisclosed external dependency.

## 10. Appearance

- Cover title and model ID:
- Brand palette application:
- Input zone:
- Actual / forecast treatment:
- Scenario treatment:
- Output hierarchy:
- PASS / WARN / FAIL treatment:
- Freeze panes:
- Gridline policy:
- Print / export settings:
- Required web preview renders:

## 11. Privacy and distribution

- Synthetic-data method:
- Hidden-sheet review:
- Comments / notes review:
- Named-range review:
- Connection / query review:
- External-link review:
- Document-property review:
- Local-path and identifier scan:
- Macro / embedded-object review:
- Usage terms:
- Disclaimer:

## 12. Release evidence

- Workbook file size:
- SHA-256:
- Formula error result:
- Published checks passed / total:
- Scenarios tested:
- Visual sheets reviewed:
- Excel version tested:
- Reviewer:
- Last tested date:
- Open-without-repair result:
- Known limitations:

## 13. Registry entry

```js
{
  id: "TDAT-FM-...",
  slug: "...",
  title: "...",
  decision: "...",
  description: "...",
  domain: "...",
  roles: ["..."],
  useCases: ["..."],
  level: "Starter | Practitioner | Advanced",
  status: "Available | In QA | Roadmap",
  priority: "P0 | P1 | P2",
  horizon: "...",
  setup: "...",
  compatibility: "...",
  version: "...",
  lastTested: "YYYY-MM-DD",
  qa: "...",
  file: {
    path: "...",
    size: "...",
    format: ".xlsx",
    macros: false,
    externalLinks: false,
    circularReferences: false,
    sha256: "..."
  }
}
```

## 14. Change log entry

| Version | Date | Changed sheets | Change | Impact | Migration note | Owner / Reviewer | Status |
|---|---|---|---|---|---|---|---|
| | | | | | | | |
