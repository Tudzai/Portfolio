# Monthly Reporting Pipeline

Public-safe Python sample for an FP&A monthly reporting workflow.

## Business Problem

Finance teams often receive multiple monthly exports, mapping files, and target templates. The manual workflow is slow
because the analyst needs to merge files, standardize dimensions, calculate KPI summaries, compare actuals against plan,
and write the first management narrative.

## Public-Safe Scope

This folder is a clean-room rebuild. It does not use company workbooks, company paths, real customers, real employees,
or real financial values. The sample data is fictional and small enough to review in GitHub.

## Pipeline

1. Read monthly source files from `sample_data/monthly_raw_*.csv`.
2. Validate required columns and duplicate source rows.
3. Apply generic service and office mapping from `src/config.py`.
4. Create an analysis-ready monthly summary.
5. Build actual-vs-plan comparisons from `target_plan.csv`.
6. Generate a Markdown brief for FP&A review.

## Python Files

- `src/config.py` - Centralized sample paths and mappings.
- `src/merge_monthly_reports.py` - Cleans, maps, and aggregates monthly rows.
- `src/build_ratio_pack.py` - Builds actual vs plan comparisons.
- `src/generate_insight_brief.py` - Creates a management-ready Markdown brief.

## How to Run

```powershell
cd showcase/python-automation/monthly-reporting-pipeline
python src/merge_monthly_reports.py
python src/build_ratio_pack.py
python src/generate_insight_brief.py
```

Outputs are written to `output/`, which is intentionally ignored for public portfolio hygiene.

## Validation Checks

- Required source columns are present.
- Duplicate source rows are flagged.
- Unmapped services are rejected.
- Summary totals are reconciled before ratio and brief generation.
