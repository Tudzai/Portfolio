# Capex / Business Case

## Release identity

- Model ID: `TDAT-FM-INV-001`
- Canonical file: `tdat-capex-business-case.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 32.5 KB
- SHA-256: `9FD02ED84EEEC75B5EAA0BCE8EEA450CA347B1E0FB363C2A529FF2D440EF9929`

## Decision and users

**Decision:** Should management approve, defer, resize, or reject the investment?

Incremental cash flow, NPV, IRR, payback, scenario, and implementation-risk framework.

**Primary roles:** FP&A, Corporate Finance, Investment Analyst, Operations Finance

**Typical use cases:** Investment approval, NPV, Payback

**Horizon:** 3–15 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Project Inputs`
5. `Incremental Cash Flow`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Capex phasing
- Gross monthly revenue / savings potential
- Incremental fixed operating cost
- Incremental working-capital investment

## Core logic

- Incremental revenue / savings
- Variable operating cost
- Fixed operating cost
- Incremental EBITDA
- Depreciation
- Incremental EBIT
- Cash tax
- NOPAT
- D&A add-back
- Capital expenditure
- Change in working capital
- After-tax salvage
- Incremental free cash flow
- Discount factor
- Present value of FCF
- Cumulative NPV
- Cumulative nominal cash flow

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Capex overrun
- Sensitivity column driver: Benefit realization
- Sensitivity output: Illustrative NPV
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (9 / 9 PASS)

- Capex phasing is non-negative: Capex uses must be entered as positive source values.
- FCF bridge ties: NOPAT plus D&A less capex and NWC plus salvage.
- Discount factors decline over time: Later cash flows should not have a higher discount factor.
- Working capital release occurs only once: Final-period negative source value represents release; validate the amount.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Project Inputs`, then update the scenario drivers on `Assumptions`.

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

- financing structure
- lease accounting
- detailed tax depreciation
- real options
- jurisdiction-specific incentives

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
