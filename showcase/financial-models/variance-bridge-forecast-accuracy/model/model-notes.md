# Variance Bridge & Forecast Accuracy

## Release identity

- Model ID: `TDAT-FM-FPA-003`
- Canonical file: `tdat-variance-bridge-forecast-accuracy.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 31.1 KB
- SHA-256: `3DC480AD24396D89D12076131571554CEB6759969869C750B578A49041328459`

## Decision and users

**Decision:** Which drivers explain the gap, who owns them, and how reliable is the forecast?

Actual versus budget, prior year, and forecast with price-volume-mix logic and owner/action tracking.

**Primary roles:** FP&A, Commercial Finance, Finance Business Partner

**Typical use cases:** Variance, Bridge, Forecast accuracy

**Horizon:** Monthly / QTD / YTD

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Actual Budget Data`
5. `Variance Bridge`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Actual units
- Actual net price / unit
- Actual variable cost / unit
- Budget units
- Budget net price / unit
- Budget variable cost / unit
- Actual controllable opex
- Budget controllable opex
- Latest forecast revenue

## Core logic

- Scenario actual units
- Scenario actual price
- Scenario actual unit cost
- Scenario actual revenue
- Budget revenue
- Revenue volume effect
- Revenue price effect
- Revenue variance
- Scenario actual variable cost
- Budget variable cost
- Cost volume effect
- Unit-cost rate effect
- Actual contribution margin
- Budget contribution margin
- Contribution margin variance
- Opex variance (F/U sign)
- EBITDA variance
- PVM / cost bridge check
- Forecast revenue error
- Absolute forecast error
- Forecast WAPE component

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Volume change
- Sensitivity column driver: Price change
- Sensitivity output: Contribution margin variance
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (9 / 9 PASS)

- PVM and cost bridge ties: Volume, price, cost-volume, and cost-rate effects reconcile to contribution variance.
- Revenue variance ties actual less budget: Displayed revenue variance equals actual less budget.
- EBITDA variance ties CM plus opex: Contribution variance plus opex variance.
- Forecast WAPE is non-negative: Absolute error divided by actual revenue cannot be negative.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Actual Budget Data`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

No. This is an educational analytical template. Obtain appropriate professional review before real-world use.

## Deliberate limitations

- statistical forecast model
- automated narrative generation
- multi-level allocation engine
- unapproved favorable/unfavorable policy

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
