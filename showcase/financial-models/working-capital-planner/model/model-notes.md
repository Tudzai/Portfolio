# Working Capital Planner

## Option C release

- Model ID: `TDAT-FM-FPA-002`
- Canonical file: `tdat-working-capital-planner.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 17.0 KB
- SHA-256: `F4E42361BBF649ACD676120B6E38DC1D532F8AC55632075985E40FDADDFEE170`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** How much cash would better DSO, DIO, and DPO release?

Current-to-target five-column phase-in. DSO, DIO, and DPO balance schedules. Incremental and cumulative cash release.

- Horizon: Current plus four-step improvement path
- Designed for: FP&A, Treasury, Commercial Finance, Accounting
- Typical use: Working capital, Cash release, CCC
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Invoice detail, SKU detail, seasonality, collection probability, supplier constraints, and multiple scenarios.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
