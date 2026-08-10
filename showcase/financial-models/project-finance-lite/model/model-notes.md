# Project Finance Lite

## Release identity

- Model ID: `TDAT-FM-PF-001`
- Canonical file: `tdat-project-finance-lite.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 32.2 KB
- SHA-256: `E2AA9B330290F4FB15FF177768AEB0387874D08223A7FA0AF398B3CAD50DBF1E`

## Decision and users

**Decision:** Is the project bankable, and how do funding, construction, and operating assumptions affect returns?

Construction draw, operating cash flow, debt service, DSCR, project IRR, equity IRR, and funding gap.

**Primary roles:** Project Finance, Infrastructure Finance, Lending, Investment Analyst

**Typical use cases:** Bankability, Project returns, Funding

**Horizon:** Construction + 10–25 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Project Inputs`
5. `Project Cash Flow`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Construction and capex
- Operating volume
- Tariff / unit
- Operating expense
- Maintenance capex
- Change in NWC

## Core logic

- Operating revenue
- EBITDA
- Depreciation
- EBIT
- Cash tax
- Cash flow available for debt service
- Construction debt draw
- Opening debt
- Cash interest
- Debt service capacity
- Principal repayment
- Closing debt
- Debt service
- DSCR
- Unlevered project cash flow
- Equity cash flow
- Project IRR
- Equity IRR
- Debt roll-forward check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Capex overrun
- Sensitivity column driver: Tariff / volume realization
- Sensitivity output: Illustrative equity value creation
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (10 / 10 PASS)

- Debt roll-forward ties: Opening debt plus draws less principal equals closing debt.
- Principal does not exceed available debt: Principal cannot exceed opening debt plus current draw.
- Debt remains non-negative: No negative debt balance.
- Operating DSCR is positive: Coverage periods require non-negative DSCR.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.
- Headline output is non-negative: Negative outputs require an explicit method and decision interpretation.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Project Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative project-finance template only. Validate construction contracts, funding commitments, tax, debt terms, reserve requirements, coverage definitions, legal waterfall, and bankability with qualified advisors.

## Deliberate limitations

- construction interest circularity
- DSRA
- detailed tax losses
- contractual waterfall
- lender term sheet
- bankability opinion

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
