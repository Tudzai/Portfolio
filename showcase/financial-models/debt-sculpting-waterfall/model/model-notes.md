# Debt Sculpting & Waterfall

## Release identity

- Model ID: `TDAT-FM-PF-002`
- Canonical file: `tdat-debt-sculpting-waterfall.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 33.1 KB
- SHA-256: `84AA7FF608A7E4D30566D471CE75E88DBF798C50374952DB8EFFC53CF90BE8DE`

## Decision and users

**Decision:** What repayment profile and cash waterfall meet coverage constraints while preserving equity value?

DSCR-driven sculpting, reserve accounts, waterfall priorities, distributions, and lender/equity returns.

**Primary roles:** Project Finance, Infrastructure Finance, Structured Finance

**Typical use cases:** Debt sculpting, Cash waterfall, Coverage

**Horizon:** 10–30 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `CFADS Inputs`
5. `Sculpting Waterfall`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Cash flow available for debt service

## Core logic

- Opening debt
- Target debt service
- Interest
- Sculpted principal
- Closing debt
- Debt service
- DSCR
- Required DSRA
- Opening DSRA
- DSRA funding
- DSRA release
- Closing DSRA
- Cash after debt and reserve
- Equity distribution
- Waterfall check
- PV debt capacity
- Debt roll-forward check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Target DSCR
- Sensitivity column driver: Interest rate
- Sensitivity output: PV debt capacity
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (12 / 12 PASS)

- Debt roll-forward ties: Opening debt less principal equals closing debt.
- Waterfall sources and uses tie: CFADS less debt and reserve movements equals cash after debt.
- Principal does not exceed opening debt: Principal is capped by opening debt.
- DSRA roll-forward is non-negative: Reserve balance cannot be negative.
- Distributions respect lock-up: Distributions occur only when DSCR meets the lock-up threshold.
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

Replace blue cells on `CFADS Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative sculpting and waterfall mechanics only. Validate CFADS definition, debt terms, reserve documents, distribution lock-ups, subordination, tax, and legal waterfall with qualified project-finance and legal reviewers.

## Deliberate limitations

- iterative sculpting solver
- multiple debt tranches
- tax waterfall
- full reserve-account agreements
- legal subordination
- lender approval

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
