# Credit Underwriting / DSCR

## Option C release

- Model ID: `TDAT-FM-RSK-001`
- Canonical file: `tdat-credit-underwriting-dscr.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 18.8 KB
- SHA-256: `467262AEFE9210C530212DF8F220C8DFF86292CE6B5628482DDEDBCFABF0DAA1`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** Can the borrower support the requested debt through a five-year underwritten forecast?

Five-year normalized and underwritten EBITDA build. CFADS, debt service, and principal roll-forward. DSCR, leverage, cash headroom, and debt headroom.

- Horizon: Base plus five forecast years
- Designed for: Credit Analysis, Enterprise Risk, Commercial Banking, Lending
- Typical use: Credit, DSCR, Leverage
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Collateral, guarantees, undrawn exposure, ratings migration, recovery analysis, and formal credit approval.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
