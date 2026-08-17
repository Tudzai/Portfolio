# Budget & Rolling Forecast

## Option C release

- Model ID: `TDAT-FM-FPA-001`
- Canonical file: `tdat-budget-rolling-forecast.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 18.2 KB
- SHA-256: `4C41539A4EB4F34D7BCC9333F8F640B9F6621D2EE6DE7E0A4BF2DD2EAD12405C`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** Where will the next 12 months land versus budget?

One 12-month revenue forecast. Revenue and EBITDA budget gaps. A simple operating cash proxy.

- Horizon: Next 12 months
- Designed for: FP&A, Finance Business Partner, Corporate Finance
- Typical use: Budget, Rolling forecast, EBITDA
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Monthly source grids, prior year, WAPE, scenarios, sensitivities, and department workflows.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
