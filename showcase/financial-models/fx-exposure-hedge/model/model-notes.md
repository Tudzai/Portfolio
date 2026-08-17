# FX Exposure & Hedge

## Option C release

- Model ID: `TDAT-FM-TSY-003`
- Canonical file: `tdat-fx-exposure-hedge.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 16.6 KB
- SHA-256: `593BCC1DF75F44EC6DA8DC436FE2A192DABE246EB4191526B70EF7EEECFC0E5B`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** How much FX loss remains after one forward hedge?

One net foreign-currency exposure. One forward hedge and five visible spot scenarios. Selected-case bridge plus loss and protection attribution.

- Horizon: Five spot scenarios / one settlement
- Designed for: Treasury, Enterprise Risk, Corporate Finance
- Typical use: FX risk, Hedge coverage, Treasury
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Multiple currencies, maturity ladders, hedge accounting, options, and custom sensitivity grids.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
