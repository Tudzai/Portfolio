# DCF Valuation

## Release identity

- Model ID: `TDAT-FM-VAL-001`
- Canonical file: `tdat-dcf-valuation.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 31.5 KB
- SHA-256: `64FF0BA891EEB88E9A39CA545B8E4BF01C1D7582CE8A6D4A28A92218EAC980DE`

## Decision and users

**Decision:** What enterprise and equity value range is supported by operating cash flow and risk assumptions?

Unlevered free cash flow, WACC, terminal value, equity bridge, and two-way sensitivity logic.

**Primary roles:** Valuation Advisory, Corporate Development, Equity Research, Investment Banking

**Typical use cases:** Enterprise value, Equity value, Sensitivity

**Horizon:** 5–10 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Valuation Inputs`
5. `DCF`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Starting revenue base
- Cash and non-operating assets
- Debt and debt-like claims
- Diluted shares

## Core logic

- Revenue
- EBITDA
- D&A
- EBIT
- Cash tax on EBIT
- NOPAT
- D&A add-back
- Capex
- Change in NWC
- Unlevered FCF
- Discount factor
- PV of forecast FCF
- Gordon-growth terminal value
- PV of terminal value
- Enterprise value
- Equity value
- Value per diluted share
- Terminal value / enterprise value
- FCF component check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: WACC
- Sensitivity column driver: Terminal growth
- Sensitivity output: Value per diluted share
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (12 / 12 PASS)

- Unlevered FCF components tie: NOPAT plus D&A less capex and NWC equals UFCF.
- WACC exceeds terminal growth: Gordon growth requires WACC greater than terminal growth.
- EV-to-equity bridge ties: EV plus cash less debt equals equity value.
- Diluted shares are positive: Per-share value requires a positive diluted share count.
- Terminal value concentration is below 90%: High terminal concentration must be visible and challenged.
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

Replace blue cells on `Valuation Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative valuation template only. Validate forecast support, WACC, terminal assumptions, enterprise-to-equity items, diluted shares, tax, accounting, market data, and decision context with qualified reviewers.

## Deliberate limitations

- company-specific public filings
- option treasury-stock method
- lease/pension/minority detail
- reverse DCF solver
- formal valuation opinion

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
