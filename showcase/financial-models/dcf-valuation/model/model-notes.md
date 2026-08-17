# DCF Valuation

## Option C release

- Model ID: `TDAT-FM-VAL-001`
- Canonical file: `tdat-dcf-valuation.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 18.1 KB
- SHA-256: `403406E0578EEA7E9A44956E847980B056B0230E971906E761C4627A1C5093A9`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** What are the business and equity worth under one driver-based operating case?

Five-year driver-based free-cash-flow build. Terminal-value and enterprise-to-equity bridges. Value per share and ten calculation controls.

- Horizon: 5 years
- Designed for: Valuation Advisory, Corporate Development, Equity Research, Investment Banking
- Typical use: DCF, Free Cash Flow, Enterprise Value
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Detailed tax schedules, leases, pensions, dilution, reverse DCF, and valuation advice.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
