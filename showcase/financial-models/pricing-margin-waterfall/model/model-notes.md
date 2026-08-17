# Pricing & Margin Waterfall

## Option C release

- Model ID: `TDAT-FM-COM-001`
- Canonical file: `tdat-pricing-margin-waterfall.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 17.1 KB
- SHA-256: `0C6660D75A0125414656E225925C2EAD3BF6A77599844BB71089921309ACEAC0`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** Will one price change improve contribution after volume and cost effects?

One current offer and one proposed offer. Direct volume response and unit-cost change. Contribution uplift, break-even volume, and a visible driver waterfall.

- Horizon: One current vs proposed case
- Designed for: Commercial Finance, FP&A, Pricing Finance, Sales Finance
- Typical use: Pricing, Margin, Contribution
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Multiple products, elasticity estimation, freight layers, tax, transfer pricing, and competitor response.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
