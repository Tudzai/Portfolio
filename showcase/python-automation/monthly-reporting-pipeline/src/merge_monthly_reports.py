"""Merge synthetic monthly source files into an FP&A summary table.

This script mirrors the structure of a real monthly reporting automation:
validate inputs, normalize finance fields, map business dimensions, aggregate
KPIs, and write an analysis-ready output. Sample data is fictional.
"""

from __future__ import annotations

import csv
from collections import defaultdict
from decimal import Decimal

from config import (
    MONTHLY_FILE_PATTERN,
    OFFICE_REGION_MAP,
    OUTPUT_DIR,
    REQUIRED_COLUMNS,
    SAMPLE_DATA_DIR,
    SERVICE_MAP,
    SUMMARY_OUTPUT,
)


def decimal_value(value: str) -> Decimal:
    """Parse a numeric string without introducing floating-point drift."""
    return Decimal(str(value or "0").replace(",", "").strip())


def read_source_rows() -> list[dict[str, str]]:
    """Read all monthly files and validate the required source schema."""
    rows: list[dict[str, str]] = []

    for path in sorted(SAMPLE_DATA_DIR.glob(MONTHLY_FILE_PATTERN)):
        with path.open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            missing = REQUIRED_COLUMNS.difference(reader.fieldnames or [])
            if missing:
                raise ValueError(f"{path.name} is missing columns: {sorted(missing)}")

            for row in reader:
                row["source_file"] = path.name
                rows.append(row)

    if not rows:
        raise FileNotFoundError(f"No source files found in {SAMPLE_DATA_DIR}")

    return rows


def enrich_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    """Apply public-safe service and region mapping."""
    enriched: list[dict[str, str]] = []
    seen_jobs: set[tuple[str, str]] = set()

    for row in rows:
        dedupe_key = (row["period"], row["job_id"])
        if dedupe_key in seen_jobs:
            raise ValueError(f"Duplicate period/job_id detected: {dedupe_key}")
        seen_jobs.add(dedupe_key)

        service_family = SERVICE_MAP.get(row["service_line"])
        if service_family is None:
            raise ValueError(f"Unmapped service line: {row['service_line']}")

        region = OFFICE_REGION_MAP.get(row["office"], "Other")
        enriched.append(
            {
                **row,
                "service_family": service_family,
                "region": region,
                "revenue": str(decimal_value(row["revenue"])),
                "gross_profit": str(decimal_value(row["gross_profit"])),
                "volume": str(decimal_value(row["volume"])),
            }
        )

    return enriched


def summarize(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    """Aggregate finance metrics by period, region, and service family."""
    grouped: dict[tuple[str, str, str], dict[str, Decimal | int]] = defaultdict(
        lambda: {
            "jobs": 0,
            "revenue": Decimal("0"),
            "gross_profit": Decimal("0"),
            "volume": Decimal("0"),
        }
    )

    for row in rows:
        key = (row["period"], row["region"], row["service_family"])
        grouped[key]["jobs"] += 1
        grouped[key]["revenue"] += decimal_value(row["revenue"])
        grouped[key]["gross_profit"] += decimal_value(row["gross_profit"])
        grouped[key]["volume"] += decimal_value(row["volume"])

    summary: list[dict[str, str]] = []
    for (period, region, service_family), metrics in sorted(grouped.items()):
        revenue = metrics["revenue"]
        gross_profit = metrics["gross_profit"]
        margin_pct = Decimal("0") if revenue == 0 else gross_profit / revenue
        summary.append(
            {
                "period": period,
                "region": region,
                "service_family": service_family,
                "jobs": str(metrics["jobs"]),
                "revenue": str(revenue),
                "gross_profit": str(gross_profit),
                "volume": str(metrics["volume"]),
                "margin_pct": f"{margin_pct:.4f}",
            }
        )

    return summary


def write_summary(rows: list[dict[str, str]]) -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    fieldnames = [
        "period",
        "region",
        "service_family",
        "jobs",
        "revenue",
        "gross_profit",
        "volume",
        "margin_pct",
    ]

    with SUMMARY_OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    source_rows = read_source_rows()
    enriched = enrich_rows(source_rows)
    summary = summarize(enriched)
    write_summary(summary)
    print(f"Wrote {len(summary)} summary rows to {SUMMARY_OUTPUT}")


if __name__ == "__main__":
    main()
