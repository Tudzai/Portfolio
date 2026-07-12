# TDAT Financial Model Workbook Standard

- Version: `1.0`
- Owner: Truong Dinh Anh Tu
- Applies to: public reusable workbooks in `showcase/financial-models/`

## Purpose

This standard makes every public financial model feel like one product family while preserving the conventions that
make a workbook traceable and safe to review.

Brand hierarchy and cell semantics are separate:

- the TDAT palette creates structure and recognizability;
- finance-semantic font colors explain what a cell does;
- checks, source notes, limitations, versioning, and privacy rules protect trust.

The library promise is:

> Built to flex. Built to tie. Built to trust.

## Product package

An `Available` model needs:

1. one stable canonical `.xlsx` download;
2. synthetic worked data or a deliberately blank input pack;
3. a Cover or Guide inside the workbook;
4. a model page describing the decision, role, scope, use, compatibility, limitations, and QA;
5. visible assumptions and sources;
6. a central Checks sheet for non-trivial models;
7. an in-workbook version log;
8. renders produced from the released workbook;
9. a public-safe privacy review;
10. a stable model ID, slug, and filename.

Do not require macros, external workbooks, add-ins, third-party Excel viewers, or undocumented live connections in a
core public template.

## Naming and versioning

### Model identity

Use this ID pattern:

```text
TDAT-FM-{FAMILY}-{NNN}
```

Examples:

- `TDAT-FM-CORE-001` — integrated three-statement model;
- `TDAT-FM-FPA-001` — budget and rolling forecast;
- `TDAT-FM-VAL-001` — DCF valuation;
- `TDAT-FM-TSY-001` — 13-week cash flow;
- `TDAT-FM-RSK-001` — credit underwriting and stress;
- `TDAT-FM-PF-001` — project finance.

### Canonical filename

```text
tdat-{model-slug}.xlsx
```

Do not add `final`, `new`, `v2`, or dates to the canonical filename. Versions live inside the workbook, registry,
model page, and changelog.

### Semantic versioning

- `MAJOR` — breaking sheet, input, output, or core-logic change;
- `MINOR` — backward-compatible capability or module;
- `PATCH` — formula fix, wording, appearance, documentation, or QA improvement without a contract break.

Every release records version, date, owner/reviewer, affected sheets, impact, compatibility, QA status, and any
migration note.

## Workbook architecture

Use only the tabs the model needs, but cover these functions where applicable:

```text
Cover
Read Me / Guide
Control / Assumptions
Source Data / Historical
Operational Drivers
Supporting Schedules
Core Model / Statements
Scenarios / Sensitivities
Summary / Outputs
Checks
Sources & Version / Change Log
```

Rules:

- keep inputs, calculations, outputs, checks, and sources logically separated;
- keep critical logic visible; do not hide a core schedule merely to make the workbook look cleaner;
- keep one consistent time axis per calculation block;
- clearly label Actual, Budget, Forecast, Base, Upside, Downside, or Stress;
- place assumptions in named and visible input cells, never as magic numbers inside formulas;
- keep one primary logic per row and use helper rows when a formula becomes difficult to audit;
- use the same copy-across formula pattern across forecast periods wherever possible;
- merge cells only for non-calculation title or note bands; never merge calculation areas;
- freeze relevant period headers and row labels on long sheets;
- avoid hiding rows and columns; use grouping sparingly and document it.

## Cell and formula conventions

### Finance-semantic font colors

| Cell role | Font color | Meaning |
|---|---|---|
| Editable hardcode | `#0000FF` | User input or approved source value |
| In-sheet formula | `#000000` | Calculation within the same worksheet |
| Cross-sheet formula | `#008000` | Reference to another worksheet in the same workbook |
| External workbook link | `#FF0000` | External dependency; core public models should not use it |

Do not rely on color alone. Input ranges need labels, instructions, and units; checks need explicit `PASS`, `WARN`,
or `FAIL` text.

### Formula rules

- no hardcoded business assumptions inside calculation formulas;
- quote every cross-sheet reference: `='Sheet Name'!A1`;
- avoid volatile functions such as `OFFSET` and `INDIRECT` unless required and disclosed;
- avoid unexplained circular references;
- use helper rows instead of long opaque nested formulas;
- use bounded ranges instead of full-column references;
- use standard Excel functions and common financial functions where they improve auditability;
- guard return formulas until the cash-flow sign pattern and minimum input conditions are valid;
- do not create a passing balance sheet by hiding a cash, equity, or “other” plug;
- if a funding gap exists, show it as a decision output and use a separate borrowing or equity assumption.

### Sign convention

Default unless a model page explicitly states otherwise:

- P&L revenue and income: positive;
- P&L expenses and losses: negative;
- balance-sheet assets, liabilities, and equity balances: positive;
- cash inflows: positive;
- cash outflows: negative;
- debt repayments and dividends: negative;
- balance and roll-forward checks: zero when correct.

Apply the sign once at the statement or cash-flow line. Avoid repeated sign reversals across schedules.

### Number formats

Use invariant Excel formats and state the scale in the row or column label.

```text
Amounts:     #,##0.0;(#,##0.0);-
Percentages: 0.0%;(0.0%);-
Multiples:   0.0x;(0.0x);-
Counts:      #,##0;(#,##0);-
Dates:       yyyy-mm-dd
Actual year: yyyy"A"
Forecast:    yyyy"E"
```

The workbook font color should retain the input/formula/link meaning. Do not use a number-format color that hides
the semantic font color.

## Flexibility standard

A reusable model is flexible because its logic is modular and controlled, not because every possible feature is
forced into one file.

Where relevant, central controls should expose:

- company or case name;
- currency and unit scale;
- fiscal year end and period frequency;
- actual and forecast horizon;
- active scenario;
- tax, minimum cash, or discount assumptions;
- revenue method, working-capital method, or optional modules;
- materiality or check tolerance.

Extension rules:

- add products, departments, entities, or scenarios in source/driver/schedule layers;
- reconcile the added dimension back to the original output total;
- extend formulas and formats together;
- update the workbook map, sources, version log, and checks;
- test base, upside, downside, zero, negative, and boundary inputs appropriate to the model.

## TDAT appearance system

### Brand palette

| Role | Hex | Use |
|---|---|---|
| TDAT Navy | `#101827` | Major titles, output headers, section hierarchy |
| TDAT Deep Navy | `#07111F` | Cover banner and strongest identity band |
| TDAT Cobalt | `#1479FF` | Forecast accents, primary action, hierarchy line |
| Cobalt Strong | `#075CCF` | High-contrast blue text and labels |
| Trust Teal | `#0F9F8F` | PASS status and trusted output |
| Decision Amber | `#C88922` | Scenario, warning, and review cue |
| Amber Text | `#8A5A00` | Accessible warning text on light backgrounds |
| Pale Blue | `#EEF5FF` | Input zones and forecast bands |
| Canvas | `#F7F9FC` | Quiet sheet or card surface |
| Structure Line | `#DBE4EF` | Selective border and table separation |
| Muted Text | `#5B687A` | Notes and secondary metadata |
| Exception Red | `#B42318` | Failed control or disclosed exception |

### Typography

- workbook font: Aptos, with Arial as a portability fallback;
- Cover title: 20–24 pt;
- section header: 11–14 pt bold;
- model body: 9.5–10.5 pt;
- metadata and notes: 8.5–9.5 pt;
- use bold sparingly to establish reading order.

Do not require Inter inside a workbook; the web portfolio may continue to use Inter.

### Sheet treatment

- rows 1–3 may use a deep-navy title band and cobalt accent line;
- clearly separate actual and forecast period bands;
- use pale blue for editable zones and pale amber for scenario controls or review notes;
- use white space and selective borders instead of boxing every cell;
- hide gridlines when explicit structure already carries the layout;
- keep labels readable at normal zoom and avoid clipped notes or source references;
- reserve the Cover and Summary for the highest visual polish;
- do not use 3D charts, decorative gradients, or more series than a decision needs;
- web previews must be rendered from the released workbook, never reconstructed with generative imagery.

### Cover minimums

Every non-trivial workbook Cover should show:

- `TDAT Financial Models` lockup;
- model title and stable model ID;
- purpose and intended audience;
- model version and standard version;
- last QA or last-tested date;
- compatibility;
- currency, units, scenario, horizon, and frequency;
- evidence class;
- macro/external-link status;
- usage and limitation note;
- finance-semantic color legend;
- model status from the Checks sheet.

## Checks and finance integrity

Use a central Checks sheet or visible checks block for non-trivial models.

Recommended columns:

```text
Check | Period | Actual | Expected | Difference | Tolerance | Status | Where to fix | Notes
```

`MODEL STATUS: PASS` means all required published controls pass. It is not a guarantee that the source data,
accounting policy, assumption set, or model design is suitable for every user.

### Model-specific minimum checks

#### Three-statement and operating models

- balance sheet balances;
- closing cash ties to the cash-flow roll-forward;
- retained earnings rolls forward;
- PP&E rolls forward;
- debt rolls forward;
- revenue and margin sanity;
- scenario selector validity;
- required inputs complete;
- no hidden cash, equity, or other plug.

#### FP&A planning models

- actual imports tie to source totals;
- monthly periods roll correctly into quarters and years;
- actual, budget, forecast, and prior-year labels are consistent;
- variance bridges reconcile to the reported variance;
- scenario selector is valid;
- headcount, opex, revenue, cash, or working-capital roll-forwards tie;
- forecast accuracy definitions are documented.

#### DCF and valuation

- FCF ties to EBIT/EBITDA, tax, D&A, capex, and change in NWC;
- discount factors and terminal value use the same timing convention;
- enterprise value bridges to equity value;
- debt, cash, shares, and non-operating items are explicit;
- sensitivity tables recalculate the underlying valuation;
- outputs are not hardcoded.

#### M&A and LBO

- purchase price and sources/uses tie;
- financing and share-count changes are explicit;
- transaction adjustments, tax, fees, synergies, and goodwill reconcile;
- accretion/dilution or sponsor returns use formula-backed mechanics;
- debt paydown, cash sweep, exit bridge, IRR, and MOIC tie where applicable.

#### Treasury and credit

- opening cash/debt plus movements equals closing cash/debt;
- maturity, repayment, interest, and covenant definitions are explicit;
- DSO/DIO/DPO or receipt/payment timing is consistent;
- DSCR, leverage, coverage, and covenant calculations match the documented definitions;
- downside or stress assumptions flow through the core mechanics.

#### Risk models

- exposure completeness and mapping checks;
- probability, severity, weights, and scenario assumptions are documented;
- components reconcile to total loss or risk;
- limit breaches and exceptions are visible;
- regulated methodology is labeled illustrative unless reviewed and approved for the relevant jurisdiction and use.

#### Project finance

- construction draw, sources/uses, capex, and funding gap tie;
- debt service and reserve-account roll-forwards tie;
- DSCR and sculpting calculations use documented periods and cash available for debt service;
- equity/project IRR and cash waterfall logic are guarded and traceable.

## Privacy and distribution gate

Treat every tracked workbook as public.

Before release, inspect:

- visible, hidden, and very-hidden sheets;
- formulas, comments, notes, hyperlinks, named ranges, and document properties;
- Power Query, data connections, query tables, external relationships, and pivot caches;
- images, embedded files, OLE, DDE, and linked objects;
- local paths, OneDrive paths, usernames, email addresses, customer/vendor/employee identifiers, and real transactions;
- macros, `.xlsm` content, and unsupported add-ins;
- deleted-looking data that remains in hidden ranges or caches.

Passwords and worksheet protection are usability controls, not privacy controls.

Public templates should use synthetic or deliberately sanitized data and state that evidence class on the Cover and
model page.

## Compatibility and performance

- state the supported Excel version on the Cover, card, and model page;
- do not claim Google Sheets or LibreOffice support without testing it;
- avoid formatting large unused ranges;
- avoid unnecessary volatile formulas and full-column lookups;
- keep the file easy to open, recalculate, inspect, and extend on ordinary analyst hardware;
- a file must open without an Excel repair warning before it can be `Available`.

## Status contract

| Status | Meaning | Download CTA |
|---|---|---|
| `Available` | Workbook, documentation, privacy, visual, and required QA gates pass | Yes |
| `In QA` | A workbook exists but one or more release gates remain | No |
| `Roadmap` | Decision scope is mapped; no public product claim | No |
| `Deprecated` | Stable route remains with a replacement or retirement notice | Only when safe and intentional |

Do not use `Verified`, `Certified`, or similar language unless independent evidence supports it. Use `TDAT QA
reviewed` for an internal release review.

## Scoring rubric

| Dimension | Weight |
|---|---:|
| Finance logic and tie-outs | 25 |
| Auditability and control design | 20 |
| Flexibility and usability | 15 |
| Documentation and assumptions | 10 |
| Appearance and accessibility | 10 |
| Compatibility and performance | 10 |
| Privacy and security | 10 |
| **Total** | **100** |

Suggested release interpretation:

- `90–100`: eligible for `Available` if all hard gates pass;
- `80–89`: internal beta or `In QA` with visible limitations;
- below `80`: draft only;
- any hard-gate failure blocks release regardless of score.

## Release checklist

- [ ] Stable ID, route, and filename.
- [ ] Purpose, audience, version, date, scenario, currency, units, and evidence class visible.
- [ ] Inputs, calculations, outputs, checks, and sources are separated.
- [ ] No magic numbers inside calculation formulas.
- [ ] Core formulas copy across consistently.
- [ ] Required tie-outs pass within documented tolerance.
- [ ] No visible formula errors.
- [ ] Base, upside, downside, and relevant boundary scenarios tested.
- [ ] All user-facing sheets visually inspected.
- [ ] No clipped labels, outputs, source notes, or check messages.
- [ ] No undisclosed macros, external links, connections, add-ins, or circular references.
- [ ] Privacy and workbook-package inspection completed.
- [ ] Compatibility and limitations stated honestly.
- [ ] Model page metadata matches the released workbook.
- [ ] Screenshots were rendered from the released workbook.
- [ ] SHA-256 and file size updated after final export.
