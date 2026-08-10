# ECL / Credit Stress Lite

## Release identity

- Model ID: `TDAT-FM-RSK-002`
- Canonical file: `tdat-ecl-credit-stress-lite.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 30.5 KB
- SHA-256: `B0726A7BF75EAC4675B6726CF85766CF92BC96F50FC754C591DE34C057A4B588`

## Decision and users

**Decision:** How do PD, LGD, EAD, staging, and macro scenarios change expected loss?

Illustrative expected-credit-loss engine with transparent assumptions, scenario weights, and reconciliation checks.

**Primary roles:** Credit Risk, Banking Finance, Risk Analytics, Financial Reporting

**Typical use cases:** Expected loss, Stress, Provision

**Horizon:** 12-month / lifetime

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Portfolio Inputs`
5. `ECL Engine`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Drawn exposure
- Undrawn commitment
- Credit conversion factor
- Illustrative stage (1 / 2 / 3)
- 12-month PD
- Lifetime PD
- LGD
- Discount factor

## Core logic

- Exposure at default
- Selected PD
- Selected LGD
- ECL before overlay
- Management overlay
- Expected credit loss
- ECL / EAD
- EAD component check
- ECL component check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: PD multiplier
- Sensitivity column driver: LGD multiplier
- Sensitivity output: Total expected credit loss
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- EAD components tie: Drawn plus CCF-adjusted undrawn equals EAD.
- ECL components tie: Pre-overlay ECL plus overlay equals reported ECL.
- Stages are limited to 1, 2, or 3: Illustrative stage values must be 1, 2, or 3.
- PD, LGD, CCF, and discount factors stay bounded: Probability and recovery inputs are bounded between zero and one.
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

Replace blue cells on `Portfolio Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative educational ECL engine only; it is not IFRS 9 compliant and not an accounting or regulatory conclusion. Validate staging, SICR, PD term structures, LGD/EAD methods, discounting, overlays, governance, data lineage, and independent validation.

## Deliberate limitations

- IFRS 9 compliance
- SICR framework
- discounted lifetime cash-flow engine
- cure/default transition matrices
- regulatory reporting
- model validation opinion

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
