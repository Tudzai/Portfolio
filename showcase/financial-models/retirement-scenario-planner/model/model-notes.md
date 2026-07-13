# Retirement Scenario Planner

## Release identity

- Model ID: `TDAT-FM-PER-002`
- Canonical file: `tdat-retirement-scenario-planner.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 43.2 KB
- SHA-256: `ACD0F500A6BE9EC257AAFB5500D2BC668A3BAAE66AE6279A29A3BA708FDA7483`

## Decision and users

**Decision:** How do contributions, inflation, returns, timing, and drawdown assumptions affect retirement readiness?

Educational contribution, accumulation, inflation, withdrawal, and sensitivity model with clear limitations.

**Primary roles:** Individual / Household, Financial Education / Learner

**Typical use cases:** Retirement, Contributions, Drawdown

**Horizon:** 20–40 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Annual Inputs`
5. `Retirement Plan`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Annual contribution before retirement
- Annual withdrawal after retirement

## Core logic

- Opening balance
- Investment return
- Contribution
- Withdrawal
- Closing balance
- Balance in today's money
- Net contribution / withdrawal
- Balance above minimum flag
- Balance roll-forward check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Annual return
- Sensitivity column driver: Retirement age
- Sensitivity output: Ending balance at age 70
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- Balance roll-forward ties: Opening balance plus return and contribution less withdrawal equals closing balance.
- Retirement age falls within modeled horizon: Retirement age must sit inside the age 30–70 modeled horizon.
- Contributions stop after retirement: The template stops contributions at the selected retirement age.
- Withdrawals do not start before retirement: The template begins withdrawals at the selected retirement age.
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

Replace blue cells on `Annual Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Educational deterministic scenario only; it is not a probability-of-success analysis or financial, tax, legal, pension, or investment advice. Validate lifespan, inflation, returns, taxes, fees, benefits, liquidity, risk capacity, and suitability with qualified professionals.

## Deliberate limitations

- probability of success
- sequence-of-returns simulation
- tax and pension rules
- social benefits
- fees and product selection
- financial advice

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
