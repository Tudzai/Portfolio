# FP&A Monthly Reporting Automation Demo

This public-safe demo shows one Python workflow turning a synthetic raw-data workbook into three management-ready deliverables:

- `sample_data/data-raw.xlsx` — 360 fictional transaction rows used as the input.
- `src/run_fpa_automation.py` — the Python workflow that creates the three outputs.
- `output/clean-data.xlsx` — generated standardized and enriched line-level data.
- `output/variance-analysis.xlsx` — generated regional variance tables, chart, and four control checks.
- `output/monthly-report.docx` — generated management report with risks, actions, owners, and timing.

All names and figures are synthetic. The files demonstrate workflow structure, finance logic, and controls; they do not represent measured company results.

## Remotion demo clip

The primary case-page walkthrough is an 82-second workflow film built with Remotion:

- `assets/fpa-monthly-reporting-remotion.mp4` — 1920×1080 H.264/AAC master.
- `assets/fpa-monthly-reporting-remotion-poster.jpg` — final-frame poster used by the web player.
- `remotion/` — editable React/Remotion source, real process capture, procedural score, local sound effects, render scripts, and lint configuration.

The film combines public-safe process capture with a cursor-led interface narrative: raw Excel input, a controlled
task handoff, live Python processing, four reconciliation checks, three generated artifacts, and the final management
report. It uses continuous UI push-ins and pull-backs while keeping the verified synthetic June 2026 outputs visible:
revenue `+7.8%` versus budget, gross margin `-1.3pp` versus plan, EBITDA `+1.2%` versus budget, and four of four
automated controls passed. Owners, timing, and the human-review boundary remain part of the final reveal.

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
