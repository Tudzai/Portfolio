"""Refresh latest actual KPI values in a public-safe master table."""

from __future__ import annotations

import csv
from decimal import Decimal
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"
OUTPUT_DIR = BASE_DIR / "output"

MASTER_TEMPLATE = SAMPLE_DATA_DIR / "master_kpi_template.csv"
LATEST_ACTUALS = SAMPLE_DATA_DIR / "latest_actuals.csv"
REFRESHED_MASTER = OUTPUT_DIR / "refreshed_master_kpi.csv"

KEY_COLUMNS = ["period", "office", "service_group", "kpi"]


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def key_for(row: dict[str, str]) -> tuple[str, ...]:
    return tuple(row[column] for column in KEY_COLUMNS)


def to_decimal(value: str) -> Decimal:
    return Decimal(str(value or "0").replace(",", "").strip())


def refresh_actuals(master_rows, actual_rows):
    actual_lookup = {}
    for row in actual_rows:
        key = key_for(row)
        if key in actual_lookup:
            raise ValueError(f"Duplicate actual key: {key}")
        actual_lookup[key] = to_decimal(row["actual"])

    refreshed = []
    missing_actuals = []

    for row in master_rows:
        key = key_for(row)
        target = to_decimal(row["target"])
        actual = actual_lookup.get(key)
        if actual is None:
            missing_actuals.append(key)
            actual = to_decimal(row.get("actual", "0"))

        achievement = Decimal("0") if target == 0 else actual / target
        refreshed.append(
            {
                **row,
                "actual": str(actual),
                "achievement_pct": f"{achievement:.4f}",
                "status": "Watch" if achievement < Decimal("0.95") else "On track",
            }
        )

    return refreshed, missing_actuals


def write_rows(path: Path, rows: list[dict[str, str]]) -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    refreshed, missing = refresh_actuals(read_rows(MASTER_TEMPLATE), read_rows(LATEST_ACTUALS))
    write_rows(REFRESHED_MASTER, refreshed)
    print(f"Wrote refreshed master to {REFRESHED_MASTER}")
    if missing:
        print(f"Missing actuals: {len(missing)}")


if __name__ == "__main__":
    main()
