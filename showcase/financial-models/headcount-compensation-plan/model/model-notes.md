# Headcount & Compensation Plan

## Release identity

- Model ID: `TDAT-FM-FPA-004`
- Canonical file: `tdat-headcount-compensation-plan.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 32.2 KB
- SHA-256: `258D96AF9463447E08ADE9E1946380AB1C974CE43A1A59E9A362EF530B6102F0`

## Decision and users

**Decision:** What hiring plan balances capacity, cost, timing, and productivity?

Opening headcount, hires, exits, start dates, compensation, benefits, vacancies, and scenario controls.

**Primary roles:** FP&A, HR Finance, Finance Business Partner

**Typical use cases:** Workforce plan, Personnel cost, Capacity

**Horizon:** 12–36 months

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Workforce Inputs`
5. `Headcount Plan`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Opening headcount
- Planned hires
- Planned exits
- Average annual base salary / FTE

## Core logic

- Opening headcount
- Scenario hires
- Exits
- Closing headcount
- Average headcount
- Average annual salary / FTE
- Base pay
- Benefits
- Bonus accrual
- Payroll tax
- Total personnel cost
- Monthly cost / average FTE
- Modeled monthly capacity
- Headcount roll-forward check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Hiring realization
- Sensitivity column driver: Annual merit
- Sensitivity output: Annual personnel cost
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (9 / 9 PASS)

- Headcount roll-forward ties: Opening plus hires less exits equals closing headcount.
- Closing headcount is non-negative: Exits cannot create negative headcount.
- Personnel cost is expense-signed: Personnel costs should be negative in the model sign convention.
- Cost / FTE is non-negative: Presentation output is a positive cost per FTE.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Workforce Inputs`, then update the scenario drivers on `Assumptions`.

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

- employee-level payroll
- country tax tables
- equity compensation valuation
- HRIS connection
- personally identifiable employee data

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
