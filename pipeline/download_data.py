"""Download sample product datasets for development.

Uses the Amazon-Google Products dataset from the Magellan entity matching repository,
a standard benchmark for product entity resolution.
"""

import urllib.request
from pathlib import Path

BASE_URL = "http://pages.cs.wisc.edu/~anhai/data1/deepmatcher_data/Structured/Amazon-Google/exp_data"
FILES = {
    "tableA.csv": f"{BASE_URL}/tableA.csv",
    "tableB.csv": f"{BASE_URL}/tableB.csv",
    "train.csv": f"{BASE_URL}/train.csv",
    "valid.csv": f"{BASE_URL}/valid.csv",
    "test.csv": f"{BASE_URL}/test.csv",
}

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    for filename, url in FILES.items():
        dest = DATA_DIR / filename
        if dest.exists():
            print(f"  skip {filename} (already exists)")
            continue
        print(f"  downloading {filename} ...")
        urllib.request.urlretrieve(url, dest)
        print(f"  saved {dest}")

    print("Done. Files saved to", DATA_DIR)


if __name__ == "__main__":
    main()
