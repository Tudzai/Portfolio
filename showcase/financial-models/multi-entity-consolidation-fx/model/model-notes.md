# Multi-Entity Consolidation & FX

## Option C release

- Model ID: `TDAT-FM-CORE-002`
- Canonical file: `tdat-multi-entity-consolidation-fx.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 19.0 KB
- SHA-256: `37342140615653CA104D47818ED43E896B8C015228246AB375B7CEC90614CD51`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** How do entity growth, intercompany eliminations, and FX translation shape consolidated performance?

Parent and subsidiary operating schedules. Five-year FX translation ramp and intercompany eliminations. Reported-versus-constant-FX EBITDA bridge.

- Horizon: Base plus five forecast years
- Designed for: Regional Finance, Controllership, FP&A, Accounting
- Typical use: Consolidation, FX, Multi-entity
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Statutory consolidation, historic-rate equity, NCI presentation, cash-flow consolidation, and tax consolidation.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
