"""Split refreshed KPI rows into stakeholder-specific files."""

from __future__ import annotations

import csv
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"
OUTPUT_DIR = BASE_DIR / "output"

REFRESHED_MASTER = OUTPUT_DIR / "refreshed_master_kpi.csv"
STAKEHOLDER_RULES = SAMPLE_DATA_DIR / "stakeholder_rules.csv"
RUN_LOG = OUTPUT_DIR / "distribution_run_log.txt"


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def slugify(value: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return clean or "stakeholder"


def row_matches_rule(row: dict[str, str], rule: dict[str, str]) -> bool:
    office_ok = rule["office"] in ("*", row["office"])
    service_ok = rule["service_group"] in ("*", row["service_group"])
    return office_ok and service_ok


def split_files(master_rows, rules):
    OUTPUT_DIR.mkdir(exist_ok=True)
    log_lines = []

    for rule in rules:
        selected = [row for row in master_rows if row_matches_rule(row, rule)]
        if not selected:
            log_lines.append(f"WARNING: no rows for {rule['owner']}")
            continue

        output_path = OUTPUT_DIR / f"{slugify(rule['owner'])}_kpi_file.csv"
        with output_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(selected[0]))
            writer.writeheader()
            writer.writerows(selected)

        watch_count = sum(1 for row in selected if row["status"] == "Watch")
        log_lines.append(f"{rule['owner']}: {len(selected)} rows, {watch_count} watch items -> {output_path.name}")

    RUN_LOG.write_text("\n".join(log_lines) + "\n", encoding="utf-8")
    return log_lines


def main() -> None:
    if not REFRESHED_MASTER.exists():
        raise FileNotFoundError("Run refresh_actuals.py before splitting stakeholder files.")

    log_lines = split_files(read_rows(REFRESHED_MASTER), read_rows(STAKEHOLDER_RULES))
    print("\n".join(log_lines))


if __name__ == "__main__":
    main()
