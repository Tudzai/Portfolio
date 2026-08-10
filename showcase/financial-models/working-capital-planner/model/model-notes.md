# Working Capital Planner

## Release identity

- Model ID: `TDAT-FM-FPA-002`
- Canonical file: `tdat-working-capital-planner.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 31.8 KB
- SHA-256: `9691D035565443207DBDBADAC60A96A0B993978E051D8877ED660A5E339C9D35`

## Decision and users

**Decision:** How much cash can be released through DSO, DIO, and DPO actions?

Receivables, inventory, payables, cash conversion cycle, owner actions, and cash-release scenarios.

**Primary roles:** FP&A, Treasury, Commercial Finance, Accounting

**Typical use cases:** DSO, DIO, DPO, Cash release

**Horizon:** 12–36 months

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Operating Inputs`
5. `Working Capital`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Revenue
- COGS
- Current DSO
- Current DIO
- Current DPO

## Core logic

- Target implementation %
- Modeled DSO
- Modeled DIO
- Modeled DPO
- Accounts receivable
- Inventory
- Accounts payable
- Operating net working capital
- Baseline NWC
- Cash release vs baseline
- Cash conversion cycle
- NWC component check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: DSO
- Sensitivity column driver: DPO
- Sensitivity output: Year-end cash release
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- NWC components tie: AR plus inventory less AP equals NWC.
- Implementation phase is capped at 100%: Phase-in cannot exceed 100%.
- Modeled day drivers are non-negative: Days must be within approved policy bounds.
- Cash release bridge ties: Baseline less modeled NWC equals cash release.
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

Replace blue cells on `Operating Inputs`, then update the scenario drivers on `Assumptions`.

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

- invoice-level collections
- SKU-level safety stock
- supplier legal terms
- seasonal daily cash forecast

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
