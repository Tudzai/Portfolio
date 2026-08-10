# Trading Comparables

## Release identity

- Model ID: `TDAT-FM-VAL-002`
- Canonical file: `tdat-trading-comps.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 30.6 KB
- SHA-256: `D7D473BBC52FFDB5F35F9A36FA61F1B2564352113F363C8CE01A1D3AFA0DD9CB`

## Decision and users

**Decision:** How does the target trade against peers on growth, margins, and valuation multiples?

Peer set, calendarization, enterprise value, key multiples, quartiles, and implied valuation range.

**Primary roles:** Investment Banking, Equity Research, Corporate Development, Valuation Advisory

**Typical use cases:** Relative valuation, Peer benchmark

**Horizon:** LTM / NTM snapshot

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Peer Inputs`
5. `Multiples Valuation`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Share price
- Diluted shares
- Debt and debt-like claims
- Cash and non-operating assets
- LTM revenue
- LTM EBITDA
- LTM EBIT
- LTM net income
- Core peer flag (1 = core)

## Core logic

- Equity value
- Enterprise value
- EV / Revenue
- EV / EBITDA
- EV / EBIT
- P / E
- EBITDA margin
- Core-peer EV / EBITDA median
- Implied target enterprise value
- Implied target equity value
- Implied value per share
- Enterprise value bridge check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Target EBITDA
- Sensitivity column driver: Selected EV / EBITDA
- Sensitivity output: Implied value per share
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- Enterprise value bridges tie: Equity value plus debt less cash equals enterprise value.
- Core peer set contains three names: Core peers should drive the selected range.
- EBITDA denominators are positive: Negative or near-zero denominators should be shown as NM.
- Selected multiple is within displayed peer range: A selected multiple outside the peer range needs explicit judgment.
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

Replace blue cells on `Peer Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative comps template only. Validate peer selection, data freshness, currency, fiscal basis, normalization, enterprise-value bridge, denominator quality, selected range, and source support before use.

## Deliberate limitations

- live market-data refresh
- calendarization
- lease/SBC normalization
- sector-specific KPI module
- fairness or formal valuation opinion

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
