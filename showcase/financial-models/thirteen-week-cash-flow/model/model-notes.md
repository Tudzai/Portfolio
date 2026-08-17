# 13-Week Cash Flow

## Option C release

- Model ID: `TDAT-FM-TSY-001`
- Canonical file: `tdat-thirteen-week-cash-flow.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 18.6 KB
- SHA-256: `31F382DB158E752C6B21391353A948FFE25B5622D496AF96A9692BF81F165E2D`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** When will cash tighten, and how much facility is needed?

A 13-week direct cash forecast. Automatic facility draw and repayment. Peak funding and closing liquidity.

- Horizon: 13 weeks
- Designed for: Treasury, FP&A, CFO Office, SME Finance
- Typical use: Liquidity, Cash runway, Facility draw
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Invoice-level inputs, payment priority law, bank feeds, interest, scenarios, and sensitivities.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
