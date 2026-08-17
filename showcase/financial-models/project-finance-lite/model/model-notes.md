# Project Finance Lite

## Option C release

- Model ID: `TDAT-FM-PF-001`
- Canonical file: `tdat-project-finance-lite.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 19.4 KB
- SHA-256: `6D754C5B4403AB59A7062E284E2DAAA8AE813CC1A9DF5B39E6FE091AA652A85F`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** Can the project fund construction, service debt, and deliver acceptable project and equity returns?

Construction funding and debt / equity sources bridge. Five-year operating cash flow and level debt-service schedule. Project IRR, equity IRR, DSCR, and debt paydown.

- Horizon: Funding at Year 0 plus five operating years
- Designed for: Project Finance, Infrastructure Finance, Lending, Investment Analyst
- Typical use: Project finance, DSCR, IRR
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Construction-interest circularity, DSRA, detailed tax losses, contractual waterfalls, lender terms, and a bankability opinion.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
