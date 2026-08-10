# SaaS Unit Economics

## Release identity

- Model ID: `TDAT-FM-SME-002`
- Canonical file: `tdat-saas-unit-economics.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 41.2 KB
- SHA-256: `C8F0AE910E6F8107CF857F880173659A0244ACA79A39DCFCC2A366EB896AEA19`

## Decision and users

**Decision:** Is growth efficient enough when retention, CAC, LTV, burn, and payback are viewed together?

ARR bridge, cohort retention, CAC, LTV, gross margin, burn multiple, runway, and scenario logic.

**Primary roles:** Startup Finance, FP&A, Venture Capital, Founder

**Typical use cases:** Unit economics, Runway, Fundraising

**Horizon:** 24–60 months

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Monthly Drivers`
5. `SaaS Engine`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- New customer logos
- Monthly ARPA
- Monthly expansion MRR
- Monthly contraction MRR
- Monthly logo / revenue churn
- Sales & marketing spend
- Other operating expense

## Core logic

- Opening logos
- New logos
- Churned logos
- Closing logos
- Opening MRR
- New MRR
- Expansion MRR
- Contraction MRR
- Churned MRR
- Closing MRR
- Ending ARR
- Gross revenue retention
- Net revenue retention
- Customer acquisition cost
- Illustrative LTV
- LTV / CAC
- CAC payback months
- Monthly gross profit
- Monthly EBITDA
- Opening cash
- Explicit funding
- Closing cash
- Net new ARR
- Net burn
- Burn multiple
- ARR bridge check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Monthly churn
- Sensitivity column driver: CAC
- Sensitivity output: LTV / CAC
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (10 / 10 PASS)

- ARR equals closing MRR × 12: ARR must reconcile to monthly recurring revenue.
- Closing logos are non-negative: Churn cannot reduce logos below zero.
- GRR stays within 0%–100%: GRR excludes expansion and cannot exceed 100%.
- CAC is non-negative: Guard zero new-logo periods.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.
- Headline output is non-negative: Negative outputs require an explicit method and decision interpretation.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Monthly Drivers`, then update the scenario drivers on `Assumptions`.

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

- cohort survival model
- deferred revenue accounting
- GAAP revenue recognition
- probabilistic fundraising
- customer-identifiable records

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
