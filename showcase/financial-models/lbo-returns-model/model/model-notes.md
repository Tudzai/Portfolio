# LBO Returns Model

## Release identity

- Model ID: `TDAT-FM-PE-001`
- Canonical file: `tdat-lbo-returns-model.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 32.3 KB
- SHA-256: `497787C7AAF71F3E0B59B2CDE0431D67D1DDB4EF4A56A800910873D86F05FA53`

## Decision and users

**Decision:** What leverage, operating improvement, cash sweep, and exit assumptions support sponsor returns?

Sources and uses, debt tranches, cash sweep, exit bridge, IRR, MOIC, and downside sensitivities.

**Primary roles:** Private Equity, Investment Banking, Leveraged Finance

**Typical use cases:** Sponsor returns, Leverage, Exit

**Horizon:** 5–7 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `LBO Inputs`
5. `LBO Model`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Revenue
- EBITDA
- Capex
- Change in NWC
- Cash tax

## Core logic

- Entry enterprise value
- Opening debt
- Sponsor equity invested
- FCF before debt service
- Cash interest
- Mandatory amortization
- Cash sweep
- Closing debt
- Debt roll-forward check
- Exit enterprise value
- Exit sponsor equity value
- Sponsor MOIC
- Sponsor IRR
- Debt paydown
- Illustrative liquidity headroom

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Entry EV / EBITDA
- Sensitivity column driver: Exit EV / EBITDA
- Sensitivity output: Sponsor IRR
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (12 / 12 PASS)

- Debt roll-forward ties: Opening debt plus mandatory amortization and sweep equals closing debt.
- Closing debt is non-negative: Cash sweep cannot repay more than outstanding debt.
- Sponsor equity is positive: Sponsor equity is an explicit source, not a hidden plug.
- Exit equity bridge ties: Exit enterprise value less closing debt equals sponsor equity value.
- Hold period is stated in years: Return timing must match the stated five-year hold.
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

Replace blue cells on `LBO Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

SCREEN-GRADE illustrative financing case. Validate closing sources and uses, funded debt terms, covenant definitions, management assumptions, cash conversion, tax, legal terms, and exit support before sponsor or lender use.

## Deliberate limitations

- funded debt commitment
- covenant EBITDA definition
- revolver circularity
- management rollover / dilution
- purchase accounting
- investment recommendation

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
