# Debt & Covenant Model

## Release identity

- Model ID: `TDAT-FM-TSY-002`
- Canonical file: `tdat-debt-covenant-model.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 30.7 KB
- SHA-256: `9E56FC1C142FECE6B65A556B4F728A590C180FB1646571DAF038667A01D05DBB`

## Decision and users

**Decision:** Can the business service debt and preserve covenant headroom under downside conditions?

Debt roll-forward, cash interest, amortization, leverage, coverage, covenant, and maturity views.

**Primary roles:** Treasury, Corporate Finance, Credit Analysis, FP&A

**Typical use cases:** Debt service, Covenants, Refinancing

**Horizon:** 3–10 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Debt Inputs`
5. `Debt & Covenants`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Covenant EBITDA
- Cash capex
- Increase in NWC
- Cash tax
- New debt draw
- Contractual principal

## Core logic

- Opening debt
- Principal repayment
- Closing debt
- Average debt
- Cash interest
- Cash flow available for debt service
- Debt service
- Gross leverage
- Interest coverage
- DSCR
- Leverage headroom
- Coverage headroom
- DSCR headroom
- Cash after debt service
- Debt roll-forward check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: EBITDA realization
- Sensitivity column driver: Interest rate
- Sensitivity output: Year 5 DSCR
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- Debt roll-forward ties: Opening debt plus draws less principal equals closing debt.
- Principal never exceeds debt available: Principal is capped by debt available.
- Debt remains non-negative: No negative debt balance.
- Selected case preserves DSCR covenant: A covenant breach requires action and a documented cure or waiver path.
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

Replace blue cells on `Debt Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative treasury and covenant-planning template only. Validate facility documents, EBITDA definitions, permitted adjustments, baskets, cure rights, interest terms, maturity, liquidity, tax, and legal interpretation with qualified reviewers.

## Deliberate limitations

- legal covenant-definition interpretation
- multiple debt tranches
- PIK and fee amortization
- revolver circularity
- waiver probability
- refinancing commitment

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
