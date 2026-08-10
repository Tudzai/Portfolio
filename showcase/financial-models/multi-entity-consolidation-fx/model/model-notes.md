# Multi-Entity Consolidation & FX

## Release identity

- Model ID: `TDAT-FM-CORE-002`
- Canonical file: `tdat-multi-entity-consolidation-fx.xlsx`
- Version: `1.0.0`
- TDAT Model Standard: `1.0`
- Status: `Available`
- Last tested: `2026-07-13`
- Compatibility: Excel 365
- Evidence: Synthetic worked template
- Macro / external-link / circularity status: None / None / None
- File size: 29.6 KB
- SHA-256: `C7370DB52286360CA3E5C845AD987CBB895420AEB687861BBD5AAD02AF83A1F1`

## Decision and users

**Decision:** What is the consolidated result after currency translation, eliminations, and entity-level review?

Entity inputs, FX translation, eliminations, ownership, consolidated statements, and reconciliation controls.

**Primary roles:** Regional Finance, Controllership, FP&A, Accounting

**Typical use cases:** Consolidation, FX translation, Eliminations

**Horizon:** 12–60 months

## Workbook map

1. `Cover`
2. `Guide`
3. `Assumptions`
4. `Entity Inputs`
5. `Consolidation`
6. `Sensitivity`
7. `Summary`
8. `Checks`
9. `Sources & Version`

## Core inputs

- Local-currency revenue
- Local-currency operating expense
- Local-currency total assets
- Local-currency liabilities
- Local-currency equity
- Average LCY / reporting-currency FX
- Closing LCY / reporting-currency FX
- Intercompany revenue / expense pair
- Intercompany receivable / payable pair

## Core logic

- Translated revenue
- Translated operating expense
- Consolidated EBITDA
- Translated assets
- Translated liabilities
- Translated equity
- Balance-sheet / CTA check
- Translated intercompany revenue
- Translated intercompany balance
- Consolidated revenue sum check

## Scenarios and sensitivity

- Scenario selector: Base / Upside / Downside
- Sensitivity row driver: FX shock
- Sensitivity column driver: Elimination completeness
- Sensitivity output: Consolidated EBITDA
- Base: Most likely operating and finance assumptions.
- Upside: Stronger performance, faster conversion, or lower risk/cost.
- Downside: Slower activity, weaker conversion, or higher risk/cost.

## Published checks (11 / 11 PASS)

- Entity balance sheets tie before ownership effects: Assets equal liabilities plus equity for each entity.
- Consolidated revenue ties entities and eliminations: Entity translated revenue plus eliminations equals consolidated revenue.
- FX rates are positive: FX rates must be positive; validate quote convention.
- Eliminations do not exceed 110%: Over-elimination requires documented exception.
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

Replace blue cells on `Entity Inputs`, then update the scenario drivers on `Assumptions`.

### How do I extend the template?

Add periods or source rows in the input layer, extend formulas and formats together, update the model map, and add a check that reconciles the new dimension back to the headline output.

### What does PASS mean?

PASS means the published calculations and tie-outs are within their stated tolerance. It does not validate source quality, accounting policy, tax, legal, regulatory, credit, actuarial, investment, or business suitability.

### Can I use real company data?

Yes, in a private working copy with appropriate permission. Review privacy, confidentiality, distribution, and source-ownership rules before sharing.

### Does the file support Google Sheets or LibreOffice?

Not verified. Excel 365 is the supported target. Retest formulas, charts, data validation, formats, and all checks after conversion.

### Is this professional advice?

Illustrative consolidation mechanics only. Validate local accounting standards, ownership, translation, CTA, eliminations, NCI, tax, and statutory disclosure with qualified accounting reviewers.

## Deliberate limitations

- IFRS/GAAP statutory consolidation
- historic-rate equity roll-forward
- NCI statement presentation
- cash-flow consolidation
- tax consolidation

## Usage

Download, copy, and adapt for learning, interview cases, internal planning, or analysis. Do not resell or redistribute an unchanged copy as your own product. Validate every source, assumption, formula, definition, and output before decision use. Provided without warranty.
