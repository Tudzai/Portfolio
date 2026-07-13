# SME Integrated Forecast

## Release identity

- Model ID: `TDAT-FM-SME-001`
- Canonical file: `tdat-sme-integrated-forecast.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 37.0 KB
- SHA-256: `4C49001FC7B7210FE48BE7EAD195F8179D5C8C603D8950F2C0AE3DE1B8C92F16`

## Decision and users

**Decision:** How long can the business operate, when does it break even, and what funding is required?

Sales, margin, payroll, working capital, 13-week cash, 24-month forecast, and funding runway.

**Primary roles:** SME Finance, Founder, Fractional CFO, FP&A

**Typical use cases:** Runway, Break-even, Funding

**Horizon:** 13 weeks + 24 months

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `SME Inputs`
5. `24-Month Forecast`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Starting monthly sales run-rate
- Monthly payroll
- Monthly fixed opex
- Capital expenditure

## Core logic

- Revenue
- COGS
- Gross profit
- Payroll
- Fixed opex
- EBITDA
- Accounts receivable
- Accounts payable
- Net working capital
- Change in NWC
- Capex
- Pre-funding cash movement
- Opening cash
- Pre-funding closing cash
- Funding required
- Closing cash after explicit funding
- Break-even monthly revenue
- Cash roll-forward check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Monthly sales growth
- Sensitivity column driver: Gross margin
- Sensitivity output: Month 24 EBITDA
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (10 / 10 PASS)

- Cash roll-forward ties: Opening plus movement plus explicit funding equals closing cash.
- Gross profit ties revenue and COGS: Revenue plus expense-signed COGS equals gross profit.
- Funding is visible, not a hidden cash plug: Funding is a non-negative decision output.
- Closing cash meets minimum after funding: Explicit funding should restore the minimum cash level.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.
- Sensitivity base ties the headline output: The center cell must recalculate the Base-case headline output; the assertion is N/A under Upside or Downside.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `SME Inputs`, then update the scenario drivers on `Assumptions`.

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

- full three-statement accounting
- tax calendar
- invoice-level 13-week cash
- investor term sheet
- legal solvency analysis

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
