# Debt & Covenant Model

## Option C release

- Model ID: `TDAT-FM-TSY-002`
- Canonical file: `tdat-debt-covenant-model.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 18.7 KB
- SHA-256: `4D38486B3E8B6963FEE92223F7A3470CC96BD1D5F35573A5024756BEB168B859`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** Does the five-year forecast remain inside leverage, coverage, and DSCR covenants?

Five-year EBITDA and debt roll-forward. Interest, CFADS, and debt-service bridge. Leverage, coverage, DSCR, and covenant headroom by year.

- Horizon: Base plus five forecast years
- Designed for: Treasury, Corporate Finance, Credit Analysis, FP&A
- Typical use: Debt, Covenants, DSCR
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Multiple tranches, revolver mechanics, legal covenant definitions, cure rights, and refinancing advice.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
