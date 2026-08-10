# Budget & Rolling Forecast

## Release identity

- Model ID: `TDAT-FM-FPA-001`
- Canonical file: `tdat-budget-rolling-forecast.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 32.6 KB
- SHA-256: `27E271FE9BB000D477610C307CB9E9A438ADB0AC536FE39D47B46B4920AA6E9F`

## Decision and users

**Decision:** What changed in the outlook, why, and what must management do next?

Driver-based planning with actual, budget, forecast, prior-year, scenario, and forecast-accuracy views.

**Primary roles:** FP&A, Finance Business Partner, Corporate Finance

**Typical use cases:** Budget, Reforecast, Long-range plan

**Horizon:** 12–36 months

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Planning Inputs`
5. `Rolling Forecast`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Latest actual / run-rate revenue
- Latest actual / run-rate units
- Approved budget revenue
- Approved budget EBITDA
- Prior-year revenue

## Core logic

- Forecast revenue
- Cost of goods sold
- Gross profit
- Operating expenses
- EBITDA
- EBITDA margin
- Budget revenue
- Revenue variance vs budget
- Budget EBITDA
- EBITDA variance vs budget
- Absolute forecast error
- WAPE component
- Operating cash proxy

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Monthly revenue growth
- Sensitivity column driver: Gross margin
- Sensitivity output: Year-end EBITDA
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- EBITDA ties gross profit and opex: EBITDA equals gross profit plus opex.
- Revenue variance bridge ties: Forecast less budget equals the displayed variance.
- Forecast revenue is non-negative: Negative revenue requires an explicit business case.
- WAPE remains within 0%–100%: Large errors should be explained rather than hidden.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.
- Sensitivity base ties the headline output: The center cell must recalculate the Base-case headline output; the assertion is N/A under Upside or Downside.
- Headline output is non-negative: Negative outputs require an explicit method and decision interpretation.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Planning Inputs`, then update the scenario drivers on `Assumptions`.

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

- statutory consolidation
- detailed tax provisioning
- department input workflow
- automated ERP connections

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
