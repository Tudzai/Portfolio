"""Configuration for the public-safe monthly reporting sample.

The labels and sample paths in this file are fictional. They are designed to
show pipeline structure without exposing company file names, company paths, or
real finance data.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"
OUTPUT_DIR = BASE_DIR / "output"

MONTHLY_FILE_PATTERN = "monthly_raw_*.csv"
SUMMARY_OUTPUT = OUTPUT_DIR / "monthly_summary.csv"
RATIO_OUTPUT = OUTPUT_DIR / "ratio_pack.csv"
BRIEF_OUTPUT = OUTPUT_DIR / "monthly_insight_brief.md"

REQUIRED_COLUMNS = {
    "period",
    "job_id",
    "service_line",
    "office",
    "customer_group",
    "revenue",
    "gross_profit",
    "volume",
}

SERVICE_MAP = {
    "Air Export": "Air Freight",
    "Air Import": "Air Freight",
    "Ocean Export": "Ocean Freight",
    "Ocean Import": "Ocean Freight",
    "Contract Logistics": "Logistics",
}

OFFICE_REGION_MAP = {
    "North Office": "North",
    "Central Office": "Central",
    "South Office": "South",
    "Satellite Office": "Satellite",
}
