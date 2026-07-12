# Three-Statement Model Starter

| Field | Value |
|---|---|
| Model ID | `TDAT-FM-CORE-001` |
| Version | `1.0.0` |
| Release date | `2026-07-13` |
| Compatibility | Excel 365 |
| Frequency | Annual |
| Horizon | 3 actual + 5 forecast years |
| Evidence | Synthetic worked template |
| Public checks | 27 / 27 PASS in Base, Upside, and Downside QA |
| Macros | None |
| External workbook links | None |
| Intentional circular references | None |

## Decision supported

How do operating assumptions flow through profit, financial position, cash, debt, and retained earnings?

## Workbook flow

```text
Cover → Read Me → Summary → Assumptions → Historical → Schedules
→ Income Statement → Balance Sheet → Cash Flow → Checks → Sources & Version
```

## Quick start

1. Read `Cover` and `Read Me`.
2. Choose Base, Upside, or Downside on `Assumptions`.
3. Replace blue-font synthetic inputs with approved data.
4. Review operating drivers and supporting schedules.
5. Challenge the Summary and the three statements.
6. Resolve every core FAIL on `Checks` before relying on an output.
7. Update `Sources & Version` when assumptions or structure change materially.

## Main drivers

- revenue growth;
- gross margin;
- operating expense as a percentage of revenue;
- DSO, DIO, and DPO;
- other current assets, accrued liabilities, and other liabilities as a percentage of revenue;
- capex and depreciation;
- tax and dividend payout;
- debt repayment, interest rate, new borrowing, and share issuance.

## Published checks

- five forecast balance-sheet checks;
- five forecast cash roll-forward checks;
- five debt roll-forward checks;
- five retained-earnings roll-forward checks;
- historical balance-sheet and cash roll-forward checks;
- scenario-selector validity;
- selected-driver completeness;
- non-negative revenue and gross-margin sanity;
- no hidden cash plug.

The release scan also found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors.
Base, Upside, and Downside all recalculated to `MODEL STATUS: PASS` during release QA.

## Deliberate limitations

Version 1.0 is a single-entity annual starter. It does not include multi-entity consolidation, monthly planning,
IFRS 16, NOL and detailed tax, M&A purchase accounting, LBO cash sweeps, complex debt tranches, covenant tests,
regulated risk methods, or project-finance waterfalls.

## Usage note

Download, copy, and adapt the template for learning, interview cases, personal analysis, or internal business
planning. Do not resell or redistribute an unchanged copy as your own product. Validate sources, assumptions,
formulas, accounting treatment, and suitability before real-world use. The template is educational and analytical,
not professional advice, and is provided without warranty.

## File integrity

```text
SHA-256: 720A4BEC9679F3A72F96DECC37FF9F08EF871DB3C07A41350DB59620AF6CF333
```
