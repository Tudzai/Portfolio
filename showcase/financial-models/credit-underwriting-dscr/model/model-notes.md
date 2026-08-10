# Credit Underwriting / DSCR

## Release identity

- Model ID: `TDAT-FM-RSK-001`
- Canonical file: `tdat-credit-underwriting-dscr.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 30.5 KB
- SHA-256: `3519B50B751470784A4BF19F3666FAA1FCC9CDB6C75BB7B4D4C5EC0159EB8840`

## Decision and users

**Decision:** Can the borrower afford the facility across base and stressed cash flows?

Borrower cash flow, leverage, DSCR, debt capacity, downside, collateral, and exception tracking.

**Primary roles:** Credit Analysis, Enterprise Risk, Commercial Banking, Lending

**Typical use cases:** Underwriting, DSCR, Debt capacity

**Horizon:** 1–5 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Borrower Inputs`
5. `Credit Underwriting`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Reported EBITDA
- Supported positive adjustments
- Normalization deductions
- Maintenance capex
- Increase in NWC
- Cash tax
- Scheduled debt service
- Gross debt
- Eligible collateral
- Undrawn commitment

## Core logic

- Normalized EBITDA
- Cash flow available for debt service
- DSCR
- Gross leverage
- Exposure at default
- Collateral-based capacity
- Cash-flow debt capacity
- Underwritten debt capacity
- Capacity headroom
- Collateral coverage
- DSCR exception flag
- Leverage exception flag

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: CFADS realization
- Sensitivity column driver: Debt-service realization
- Sensitivity output: Year 5 DSCR
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- Normalized EBITDA remains positive: Credit metrics require a supported positive cash-flow denominator.
- Selected case meets minimum DSCR: Below-threshold periods require an explicit exception and mitigant.
- Selected case stays within leverage: Above-threshold periods require an explicit exception and mitigant.
- Collateral and undrawn inputs are non-negative: Collateral and undrawn commitments cannot be negative.
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

Replace blue cells on `Borrower Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative underwriting support only; it does not approve or recommend credit. Validate borrower information, normalization evidence, facility terms, collateral, guarantees, risk rating, policy exceptions, legal documents, and independent credit judgment.

## Deliberate limitations

- approval recommendation
- borrower rating model
- legal-document review
- guarantor analysis
- collateral appraisal
- regulatory capital treatment

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
