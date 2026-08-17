# Debt Sculpting & Waterfall

## Option C release

- Model ID: `TDAT-FM-PF-002`
- Canonical file: `tdat-debt-sculpting-waterfall.xlsx`
- Version: `1.4.0`
- Last tested: `2026-08-17`
- Compatibility: Excel 365
- Theme: Charcoal and gold
- Visible sheets: `Start` → `Inputs` → `Model` → `Results` → `Checks`
- QA: `10 / 10 calculation controls PASS; 5 / 5 sheets rendered`
- File size: 19.1 KB
- SHA-256: `914A1C000343ACC0E808B2ABE1B61E4ED5996ACD93E312E2359ED84C3F6FE86C`
- Macros / external links / circular references: None / None / None

## Decision and scope

**Decision:** Can projected cash repay one term loan at the target DSCR?

Ten-year CFADS generated from two inputs. Target-DSCR principal sculpting. Debt capacity, balloon, and cash to equity.

- Horizon: Up to 10 years
- Designed for: Project Finance, Infrastructure Finance, Structured Finance
- Typical use: Debt capacity, DSCR, Cash waterfall
- Detailed Model sheet: visible formulas, schedules, roll-forwards, and bridges remain on one traceable calculation sheet.
- Results sheet: four decision KPIs and a business outcome linked to the detailed Model sheet.
- Checks sheet: calculation status is kept separate from the business outcome.

## Deliberate limitations

- Reserve accounts, lock-ups, multiple tranches, tax waterfalls, iterative solvers, and legal terms.

## Educational-use notice

This is a synthetic, macro-free educational template. It is not accounting, tax, legal, regulatory, credit, actuarial, investment, or other professional advice. Validate every source, assumption, formula, definition, policy choice, and output before real-world use. Use real company or personal data only in an appropriately secured private working copy.
