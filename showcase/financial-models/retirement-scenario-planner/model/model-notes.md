# Retirement Scenario Planner

## Option C release

- Model ID: `TDAT-FM-PER-002`
- Canonical file: `tdat-retirement-scenario-planner.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 17.8 KB
- SHA-256: `D68139BD39227F730B2ADB185D00E7FF94E57B69641831646F48275D646DA5A5`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** Will savings support the planned withdrawal through the plan age?

One deterministic real-return path. Contributions before retirement and a level net withdrawal. Funding bridge plus seven visible age milestones.

- Horizon: Up to 60 years
- Designed for: Individual / Household, Financial Education / Learner
- Typical use: Retirement, Savings, Drawdown
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Probability simulation, taxes, pensions, benefits, fees, product selection, and advice.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
