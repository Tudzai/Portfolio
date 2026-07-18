# FP&A Monthly Reporting Automation Demo

This public-safe demo shows one Python workflow turning a synthetic raw-data workbook into three management-ready deliverables:

- `sample_data/data-raw.xlsx` — 360 fictional transaction rows used as the input.
- `src/run_fpa_automation.py` — the Python workflow that creates the three outputs.
- `output/clean-data.xlsx` — generated standardized and enriched line-level data.
- `output/variance-analysis.xlsx` — generated regional variance tables, chart, and four control checks.
- `output/monthly-report.docx` — generated management report with risks, actions, owners, and timing.

All names and figures are synthetic. The files demonstrate workflow structure, finance logic, and controls; they do not represent measured company results.

## Run the demo

Requirements: Python 3.10 or newer.

```powershell
python -m pip install -r requirements.txt
python src/run_fpa_automation.py
```

The script preserves the raw workbook and replaces the three generated files in `output/`. That folder is intentionally ignored by Git so generated reports stay local. The workflow includes short pauses so each stage is easy to follow during a live demonstration.

## What the workflow checks

1. Required input fields are present and values can be standardized.
2. Clean row count matches raw row count.
3. Actual and budget revenue totals reconcile to source.
4. No product codes remain unmapped.

## Review boundary

The automation prepares analysis and a first management narrative. A finance owner should still review unusual variances, validate recommended actions, and approve the report before distribution.
