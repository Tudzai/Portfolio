# FX Exposure & Hedge

## Release identity

- Model ID: `TDAT-FM-TSY-003`
- Canonical file: `tdat-fx-exposure-hedge.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 30.4 KB
- SHA-256: `25707FC5AB49AF4786DD1013ADE54A5A6109C4E0698AD59D1721FAE083DCCA6A`

## Decision and users

**Decision:** Which currency exposures matter, how much is hedged, and what remains under rate shocks?

Transaction exposures, hedge coverage, maturity profile, rate sensitivity, and residual P&L/cash risk.

**Primary roles:** Treasury, Enterprise Risk, Corporate Finance

**Typical use cases:** FX exposure, Hedge coverage, Sensitivity

**Horizon:** 1–24 months

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `FX Inputs`
5. `FX Exposure`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Foreign-currency receivables
- Foreign-currency payables
- Spot LCY / FC unit
- Forward LCY / FC unit
- Hedge notional
- Months to settlement

## Core logic

- Net foreign-currency exposure
- Hedge coverage
- Residual foreign-currency exposure
- Unhedged exposure in LCY
- Hedged settlement in LCY
- Residual settlement in LCY
- Unhedged shock impact
- Residual shock impact
- Illustrative hedge cost
- Net protected impact after cost
- Over-hedged notional
- Coverage gap to target

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Adverse spot shock
- Sensitivity column driver: Hedge ratio
- Sensitivity output: Residual FX shock impact
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (10 / 10 PASS)

- Hedge coverage stays within 0%–100%: Over-hedges must be explicit rather than hidden in a coverage ratio.
- No over-hedged notional: Hedge notional is capped by absolute net exposure.
- Spot and forward rates are positive: Currency conversion rates must be positive.
- Synthetic hedge coverage matches Base target: The worked-example hedge notionals align to the Base target; scenario targets remain decision inputs.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.
- Sensitivity base ties the headline output: The center cell must recalculate the Base-case headline output; the assertion is N/A under Upside or Downside.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `FX Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative economic-exposure template only; it is not hedge-accounting, tax, legal, trading, or investment advice. Validate currency direction, settlement terms, approved instruments, counterparty limits, accounting designation, policy, and execution with qualified reviewers.

## Deliberate limitations

- hedge-accounting designation
- IFRS 9 effectiveness testing
- option valuation
- counterparty credit
- liquidity/funding limits
- dealer execution

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
