"""Generate a short FP&A insight brief from the synthetic ratio pack."""

from __future__ import annotations

import csv
from decimal import Decimal

from config import BRIEF_OUTPUT, OUTPUT_DIR, RATIO_OUTPUT


def read_ratio_rows():
    with RATIO_OUTPUT.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def to_decimal(value: str) -> Decimal:
    return Decimal(str(value or "0").replace(",", "").strip())


def build_brief(rows) -> str:
    watch_items = [row for row in rows if row["status"] == "Watch"]
    largest_gap = min(rows, key=lambda row: to_decimal(row["variance"]))

    lines = [
        "# Monthly FP&A Insight Brief",
        "",
        "## Executive View",
        f"- Total KPI rows reviewed: {len(rows)}",
        f"- Watch items: {len(watch_items)}",
        (
            "- Largest gross-profit gap: "
            f"{largest_gap['region']} / {largest_gap['service_family']} "
            f"({largest_gap['variance']})"
        ),
        "",
        "## Recommended Review Questions",
        "- Which service family is creating the largest target gap?",
        "- Is the variance driven by volume, price, mix, or direct cost?",
        "- Which owner should explain the gap before the next forecast lock?",
        "",
        "## Privacy Note",
        "This brief is generated from synthetic sample data only.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    if not RATIO_OUTPUT.exists():
        raise FileNotFoundError("Run build_ratio_pack.py before generating the brief.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    BRIEF_OUTPUT.write_text(build_brief(read_ratio_rows()), encoding="utf-8")
    print(f"Wrote insight brief to {BRIEF_OUTPUT}")


if __name__ == "__main__":
    main()
