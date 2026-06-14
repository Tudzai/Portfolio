# Quick KPI File Distribution

Public-safe Python sample for refreshing actuals and splitting stakeholder-ready KPI files.

## Business Problem

Finance stakeholders often need the same refreshed KPI data in different cuts: service group, office, and owner. Manual
filter-copy-save workflows are slow and easy to break because formulas, headers, and review status can drift between
files.

## Public-Safe Scope

This is a clean-room sample using fictional services, offices, targets, and actuals. It does not contain company file
paths, identifiable stakeholder labels, or financial values.

## Pipeline

1. Read `master_kpi_template.csv`.
2. Read latest actual values from `latest_actuals.csv`.
3. Update only matching period, office, service group, and KPI rows.
4. Calculate achievement and review status.
5. Split files according to `stakeholder_rules.csv`.
6. Write a run log for QA and handoff.

## Python Files

- `src/refresh_actuals.py` - Updates the master KPI table with latest actual values.
- `src/split_stakeholder_files.py` - Creates one clean CSV per stakeholder rule.
- `src/run_pipeline.py` - Runs the refresh and split sequence.

## How to Run

```powershell
cd showcase/python-automation/quick-kpi-file-distribution
python src/run_pipeline.py
```

Outputs are written to `output/`, which is intentionally ignored for public portfolio hygiene.
