# Market Risk / Portfolio Stress

## Option C release

- Model ID: `TDAT-FM-RSK-003`
- Canonical file: `tdat-market-portfolio-stress.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 16.8 KB
- SHA-256: `F2920A3A5C0572A1F42879B686D5B1B91F0ED4F552D56B88D0ABE88AF629697D`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** How much could a three-asset portfolio lose under direct shocks?

Three asset buckets and direct price shocks. Four-line asset and liquidity loss attribution. Stress and concentration limit headroom.

- Horizon: One stress date
- Designed for: Market Risk, Portfolio Risk, Investment Analyst
- Typical use: Market risk, Stress loss, Concentration
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- VaR, expected shortfall, duration, greeks, correlations, full revaluation, and advice.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
