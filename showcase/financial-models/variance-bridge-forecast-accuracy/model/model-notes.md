# Variance Bridge & Forecast Accuracy

## Option C release

- Model ID: `TDAT-FM-FPA-003`
- Canonical file: `tdat-variance-bridge-forecast-accuracy.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 17.3 KB
- SHA-256: `FE76C7ED7CFAF98A628A2B54DC2C2B3E4BD949EBD16BABAC64483C318C34AE1D`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** Which driver caused the EBITDA gap versus budget?

Budget and actual operating P&Ls. Price, volume, cost, and opex bridge. Revenue forecast accuracy and ten controls.

- Horizon: One period
- Designed for: FP&A, Commercial Finance, Finance Business Partner
- Typical use: Variance bridge, Price-volume-cost, Forecast accuracy
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Segments, mix effects, allocations, owner matrices, multi-period trend analysis, and statistical forecasting.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
