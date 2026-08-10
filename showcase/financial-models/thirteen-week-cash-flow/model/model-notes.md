# 13-Week Cash Flow

## Release identity

- Model ID: `TDAT-FM-TSY-001`
- Canonical file: `tdat-thirteen-week-cash-flow.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 31.9 KB
- SHA-256: `EB27DA86F271F642F45A7515635E61C54AA99DC6C34DC433E8DD0DB3C9504579`

## Decision and users

**Decision:** When does liquidity tighten, and which payment or funding action comes first?

A weekly direct cash forecast with receipts, disbursements, minimum cash, runway, and funding-gap visibility.

**Primary roles:** Treasury, FP&A, CFO Office, SME Finance

**Typical use cases:** Liquidity, Payment sequencing, Cash runway

**Horizon:** 13 weeks

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Weekly Inputs`
5. `Cash Forecast`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Scheduled customer receipts
- Supplier payments
- Payroll
- Tax and statutory payments
- Other operating / capex outflows

## Core logic

- Opening cash
- Cash receipts
- Cash disbursements
- Pre-funding cash
- Opening facility draw
- Facility draw
- Facility repayment
- Closing facility draw
- Closing cash
- Unfunded minimum-cash gap
- Cash roll-forward check
- Facility roll-forward check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: Receipt realization
- Sensitivity column driver: Payment factor
- Sensitivity output: 13-week net cash before funding
- Base: Expected collections and scheduled payments.
- Upside: Full collections, modest payment flexibility, stronger facility availability.
- Downside: Collection delays, higher payments, higher minimum cash, and reduced facility headroom.

## Published checks (10 / 10 PASS)

- Cash roll-forward ties: Opening cash plus all movements equals closing cash.
- Facility roll-forward ties: Opening draw plus draw and repayment equals closing draw.
- Facility stays within commitment: Facility draw cannot exceed the committed limit.
- Facility balance is non-negative: Repayment cannot exceed drawn balance.
- Scenario selector is valid: Base, Upside, or Downside only.
- Period headers are complete: All modeled periods must have a visible header.
- Source input grid is complete: Replace blanks with an approved value or an explicitly documented zero.
- Selected assumptions are complete: Every scenario driver must resolve to a numeric selected value.
- Core model cells calculate to numbers: No blank or text output is permitted inside the calculation block.
- Headline output is non-negative: Negative outputs require an explicit method and decision interpretation.

A separate formula-error scan found no visible `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, or `#NUM!` errors in the released build. All 9 user-facing sheets were rendered for visual QA.

## Practical Q&A

### What should I replace first?

Replace blue cells on `Weekly Inputs`, then update the scenario drivers on `Assumptions`.

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

- bank API connection
- invoice-level probability engine
- legal payment prioritization
- lender commitment confirmation

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
