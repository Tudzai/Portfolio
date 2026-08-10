# Personal Budget & Net Worth

## Release identity

- Model ID: `TDAT-FM-PER-001`
- Canonical file: `tdat-personal-budget-net-worth.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 33.5 KB
- SHA-256: `6A0AE2844F33794CCF7DDFA2D2BEAFDE8FD79247844D966A4B31731EEFECB62A`

## Decision and users

**Decision:** How should income, spending, debt, savings, and goals be balanced over time?

Monthly cash flow, net worth, debt payoff, emergency fund, and goal-tracking template for educational use.

**Primary roles:** Individual / Household, Financial Education / Learner

**Typical use cases:** Budget, Net worth, Debt payoff

**Horizon:** Monthly + 10 years

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Monthly Inputs`
5. `Budget & Net Worth`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- After-tax income
- Housing
- Food
- Transport
- Utilities and insurance
- Discretionary spending
- Debt payment
- Investment contribution

## Core logic

- Essential expenses
- Operating expenses
- Opening debt
- Debt interest
- Principal paid
- Closing debt
- Cash change
- Opening cash
- Closing cash
- Opening investments
- Investment return
- Closing investments
- Net worth
- Emergency-fund months
- Savings rate
- Debt roll-forward check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Income change
- Sensitivity column driver: Expense change
- Sensitivity output: Ending net worth
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- Debt roll-forward ties: Opening debt less principal equals closing debt.
- Debt remains non-negative: Debt repayment is capped at the amount outstanding.
- Cash remains non-negative in worked case: A negative cash month requires a funding or spending action.
- Emergency-fund target is met by year end: The worked case should build the selected cash buffer.
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

Replace blue cells on `Monthly Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Educational household-planning template only; it is not financial, tax, legal, investment, debt, or insurance advice. Validate personal circumstances, risks, fees, taxes, liquidity, product terms, and suitability with qualified professionals.

## Deliberate limitations

- tax planning
- credit-score impact
- insurance needs
- probabilistic returns
- financial-product recommendation
- fiduciary advice

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
