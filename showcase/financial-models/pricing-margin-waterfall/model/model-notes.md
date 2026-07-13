# Pricing & Margin Waterfall

## Release identity

- Model ID: `TDAT-FM-COM-001`
- Canonical file: `tdat-pricing-margin-waterfall.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 30.6 KB
- SHA-256: `1E5070DA84F816EA196910963EA6C5476339153FDFB086E5747EC08E3D04F0F8`

## Decision and users

**Decision:** Which customer, product, price, discount, mix, and cost actions protect contribution margin?

List-to-net pricing, rebates, price-volume-mix, unit economics, customer profitability, and action list.

**Primary roles:** Commercial Finance, FP&A, Pricing Finance, Sales Finance

**Typical use cases:** Pricing, Margin, Customer profitability

**Horizon:** Monthly / annual

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Product Customer`
5. `Margin Waterfall`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- List price / unit
- Units
- Discount %
- Rebate %
- Product cost / unit
- Freight / unit
- Cost-to-serve / unit
- Volume elasticity

## Core logic

- Gross list sales
- Discount
- Rebate
- Net revenue
- Product cost
- Freight
- Cost to serve
- Contribution margin
- Contribution margin %
- Proposed list price
- Modeled units after elasticity
- Proposed net revenue
- Proposed variable cost
- Proposed contribution
- Contribution uplift
- Gross-to-net check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Price change
- Sensitivity column driver: Volume response
- Sensitivity output: Contribution uplift
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (9 / 9 PASS)

- Gross-to-net waterfall ties: Gross sales less discount and rebate equals net revenue.
- Discount plus rebate stays below 100%: Total price leakage must stay below list price.
- Modeled units are non-negative: Elasticity cannot create negative units.
- Contribution uplift ties proposed less current: Proposed less current contribution equals uplift.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Product Customer`, then update the scenario drivers on `Assumptions`.

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

- contract legality
- tax and transfer pricing
- advanced elasticity estimation
- competitor response
- customer-level confidential data

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
