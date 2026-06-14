"""Run the public-safe quick KPI refresh and distribution sequence."""

from refresh_actuals import main as refresh_main
from split_stakeholder_files import main as split_main


def main() -> None:
    refresh_main()
    split_main()
    print("Quick KPI distribution pipeline completed.")


if __name__ == "__main__":
    main()
