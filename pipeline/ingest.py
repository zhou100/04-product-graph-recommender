"""Load and normalize product catalogs into a unified DataFrame."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from pipeline.normalize import infer_category, normalize_brand, normalize_price, normalize_title


def _load_catalog(path: Path, source_name: str) -> pd.DataFrame:
    """Load a single CSV catalog and apply normalization."""
    df = pd.read_csv(path, encoding="utf-8")

    records = []
    for _, row in df.iterrows():
        raw = row.to_dict()
        # Convert numpy types to Python types for JSON serialization
        for k, v in raw.items():
            if pd.isna(v):
                raw[k] = None
            elif hasattr(v, "item"):
                raw[k] = v.item()

        title = normalize_title(str(raw.get("title", "")))
        records.append(
            {
                "source_name": source_name,
                "external_id": str(raw["id"]),
                "title": title,
                "brand": normalize_brand(raw.get("manufacturer")),
                "category": infer_category(title),
                "description": None,  # dataset has no description column
                "price": normalize_price(raw.get("price")),
                "raw_data": json.dumps(raw),
            }
        )

    return pd.DataFrame(records)


def load_table_a(data_dir: Path) -> pd.DataFrame:
    return _load_catalog(data_dir / "tableA.csv", "Amazon")


def load_table_b(data_dir: Path) -> pd.DataFrame:
    return _load_catalog(data_dir / "tableB.csv", "Google")


def ingest_all(data_dir: Path) -> pd.DataFrame:
    a = load_table_a(data_dir)
    b = load_table_b(data_dir)
    combined = pd.concat([a, b], ignore_index=True)
    print(f"Ingested {len(a)} Amazon + {len(b)} Google = {len(combined)} total products")
    return combined


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent / "data" / "raw"
    df = ingest_all(root)
    print(df.head())
    print(f"\nCategories: {df['category'].value_counts().to_dict()}")
    print(f"Brands (top 10): {df['brand'].value_counts().head(10).to_dict()}")
