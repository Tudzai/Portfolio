# Market Risk / Portfolio Stress

## Release identity

- Model ID: `TDAT-FM-RSK-003`
- Canonical file: `tdat-market-portfolio-stress.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 30.5 KB
- SHA-256: `ACBE0933EF9D1FE579ED4DA1FE9DECB1BFEC77C0FC3E0BF0623216B3D554CB3A`

## Decision and users

**Decision:** Where do shocks, concentration, and correlations create the largest downside exposure?

Scenario shocks, position mapping, concentration, loss attribution, and illustrative risk-limit monitoring.

**Primary roles:** Market Risk, Portfolio Risk, Investment Analyst

**Typical use cases:** Stress testing, Concentration, Limits

**Horizon:** Daily to annual

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Position Inputs`
5. `Portfolio Stress`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Market value
- Equity beta
- Rate duration
- Credit spread duration
- Net FX exposure
- Commodity beta
- Liquidity haircut

## Core logic

- Equity-factor loss
- Rate-factor loss
- Spread-factor loss
- FX-factor loss
- Commodity-factor loss
- Liquidity haircut
- Total stressed loss
- Absolute portfolio weight
- Concentration breach
- Stressed loss / portfolio
- Loss-limit headroom

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Equity shock
- Sensitivity column driver: Rate shock
- Sensitivity output: Total stressed portfolio loss
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (10 / 10 PASS)

- Position weights sum to 100%: Absolute market-value weights must reconcile to the portfolio.
- Risk inputs are non-negative where required: Durations and liquidity haircuts are entered as non-negative magnitudes.
- Stress loss is within selected limit: A breached illustrative limit requires escalation and action.
- Concentration remains within selected limit: Largest position should remain within the selected illustrative limit.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.
- Sensitivity base ties the headline output: The center cell must recalculate the Base-case headline output; the assertion is N/A under Upside or Downside.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Position Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative deterministic stress template only; it is not regulatory VaR, expected shortfall, a validated risk model, or investment advice. Validate position data, factor mapping, pricing non-linearity, correlations, liquidity, limits, governance, and independent risk review.

## Deliberate limitations

- regulatory VaR
- expected shortfall
- full revaluation
- correlation/covariance model
- derivative greeks
- investment recommendation

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
