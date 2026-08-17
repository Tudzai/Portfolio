# ECL Credit Stress Lite

## Option C release

- Model ID: `TDAT-FM-RSK-002`
- Canonical file: `tdat-ecl-credit-stress-lite.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 17.3 KB
- SHA-256: `47570285321298C10B65120675EF5F26AC5ACDC317BA8032BF319D6D2DB5AF7F`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** What loss allowance results for one portfolio under stress?

One portfolio exposure at default. Stage-based PD with one stress multiplier. Selected-case bridge plus visible Stage 1 / 2 / 3 comparison.

- Horizon: 12-month / lifetime
- Designed for: Credit Risk, Banking Finance, Risk Analytics, Financial Reporting
- Typical use: Credit risk, Expected loss, Stress
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Portfolio segments, SICR, transition matrices, regulatory reporting, and IFRS 9 compliance.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
