"""Build an actual-vs-plan ratio pack from the monthly summary sample."""

from __future__ import annotations

import csv
from decimal import Decimal

from config import OUTPUT_DIR, RATIO_OUTPUT, SAMPLE_DATA_DIR, SUMMARY_OUTPUT

TARGET_PLAN = SAMPLE_DATA_DIR / "target_plan.csv"


def read_table(path):
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def to_decimal(value: str) -> Decimal:
    return Decimal(str(value or "0").replace(",", "").strip())


def build_ratio_rows(summary_rows, target_rows):
    target_lookup = {
        (row["period"], row["region"], row["service_family"]): to_decimal(row["target_gross_profit"])
        for row in target_rows
    }
    ratio_rows = []

    for row in summary_rows:
        key = (row["period"], row["region"], row["service_family"])
        target_gp = target_lookup.get(key, Decimal("0"))
        actual_gp = to_decimal(row["gross_profit"])
        variance = actual_gp - target_gp
        achievement = Decimal("0") if target_gp == 0 else actual_gp / target_gp

        ratio_rows.append(
            {
                "period": row["period"],
                "region": row["region"],
                "service_family": row["service_family"],
                "actual_gross_profit": str(actual_gp),
                "target_gross_profit": str(target_gp),
                "variance": str(variance),
                "achievement_pct": f"{achievement:.4f}",
                "status": "Watch" if achievement < Decimal("0.95") else "On track",
            }
        )

    return ratio_rows


def write_ratio_pack(rows) -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    fieldnames = [
        "period",
        "region",
        "service_family",
        "actual_gross_profit",
        "target_gross_profit",
        "variance",
        "achievement_pct",
        "status",
    ]
    with RATIO_OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    if not SUMMARY_OUTPUT.exists():
        raise FileNotFoundError("Run merge_monthly_reports.py before building the ratio pack.")

    rows = build_ratio_rows(read_table(SUMMARY_OUTPUT), read_table(TARGET_PLAN))
    write_ratio_pack(rows)
    print(f"Wrote {len(rows)} ratio rows to {RATIO_OUTPUT}")


if __name__ == "__main__":
    main()
