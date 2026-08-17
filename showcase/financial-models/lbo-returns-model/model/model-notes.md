# LBO Returns Model

## Option C release

- Model ID: `TDAT-FM-PE-001`
- Canonical file: `tdat-lbo-returns-model.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 19.9 KB
- SHA-256: `B0F17C67C7047F44E5F87A5A81685245034E341C0FE5CB8C6718181331AEC612`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** How do EBITDA growth, cash conversion, debt paydown, and exit assumptions drive sponsor returns?

Entry sources and uses with sponsor equity plug. Five-year EBITDA, cash generation, and cash-sweep debt schedule. Hold-period exit bridge, sponsor cash flows, MOIC, and IRR.

- Horizon: Entry plus five forecast years
- Designed for: Private Equity, Investment Banking, Leveraged Finance
- Typical use: LBO, Debt paydown, Sponsor returns
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Funded debt commitments, covenant EBITDA, revolver circularity, management dilution, purchase accounting, and investment advice.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
