# M&A Accretion / Dilution

## Release identity

- Model ID: `TDAT-FM-MA-001`
- Canonical file: `tdat-ma-accretion-dilution.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 31.1 KB
- SHA-256: `07281310A5FDA1F76713E9422961405B41A7CD24E152211DBA43CB4068026B54`

## Decision and users

**Decision:** Does the transaction create or dilute earnings, and which funding or synergy assumptions matter most?

Purchase price, funding mix, transaction adjustments, synergies, new share count, and EPS impact.

**Primary roles:** Investment Banking, M&A Advisory, Corporate Development

**Typical use cases:** Deal impact, Funding mix, Synergies

**Horizon:** 3–5 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Deal Inputs`
5. `Accretion Dilution`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Buyer standalone net income
- Buyer diluted shares
- Target standalone net income
- Target diluted shares
- Offer price / target share
- Buyer share price

## Core logic

- Target purchase equity value
- Cash consideration
- Stock consideration
- New buyer shares issued
- Buyer standalone EPS
- Pretax synergy captured
- After-tax synergy benefit
- After-tax incremental interest
- After-tax lost cash interest
- After-tax PPA amortization
- After-tax fees / integration cost
- Pro forma adjusted net income
- Pro forma diluted shares
- Pro forma adjusted EPS
- Adjusted EPS accretion / dilution
- Buyer ownership
- Consideration mix check
- After-tax synergy check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Offer price change
- Sensitivity column driver: Synergy realization
- Sensitivity output: Year-one adjusted EPS accretion / dilution
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (9 / 9 PASS)

- Consideration mix equals 100%: Cash plus stock consideration must equal 100%.
- After-tax synergy ties pretax benefit: Pretax synergy multiplied by one minus tax equals after-tax benefit.
- Pro forma shares are positive: Pro forma denominator must be positive.
- Pro forma EPS ties NI / shares: Adjusted EPS is formula-driven from pro forma NI and shares.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Deal Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

SCREEN-GRADE adjusted EPS model. GAAP accretion/dilution is not presented without complete PPA, financing, post-close share actualization, tax, integration-cost, and accounting support.

## Deliberate limitations

- GAAP accretion/dilution conclusion
- complete purchase-price allocation
- balance-sheet consolidation
- tax structuring
- legal/fairness opinion

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
