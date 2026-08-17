# Trading Comparables

## Option C release

- Model ID: `TDAT-FM-VAL-002`
- Canonical file: `tdat-trading-comps.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 18.2 KB
- SHA-256: `CF4B448510D1761E5F724BC985109E4CAEB0F6037E0D59D5EFF2F3FFF565E227`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** What share price does the peer set imply as EBITDA and net debt evolve over five years?

Visible peer calibration and five-year EBITDA schedule. Multiple ramp and enterprise-to-equity bridge. Net-debt roll-forward, implied share price, and upside.

- Horizon: Base plus five forecast years
- Designed for: Investment Banking, Equity Research, Corporate Development, Valuation Advisory
- Typical use: Comps, EV / EBITDA, Share price
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Full peer financial statements, other valuation multiples, transaction premiums, and valuation advice.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
