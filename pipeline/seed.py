"""Seed Supabase with processed data from the pipeline.

Usage:
    python -m pipeline.seed

Requires SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.
"""

from __future__ import annotations

import json
import math
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

from pipeline.download_data import main as download_data
from pipeline.ingest import ingest_all

load_dotenv()

BATCH_SIZE = 500


def get_supabase_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)


def _ensure_sources(client: Client) -> dict[str, int]:
    """Upsert catalog sources and return name->id mapping."""
    sources = {}
    for name in ("Amazon", "Google"):
        result = (
            client.table("catalog_source")
            .upsert({"name": name}, on_conflict="name")
            .execute()
        )
        sources[name] = result.data[0]["id"]
    print(f"Catalog sources: {sources}")
    return sources


def _seed_staging(client: Client, products: list[dict], source_ids: dict[str, int]) -> list[dict]:
    """Batch-upsert staging products. Returns inserted rows with IDs."""
    def _clean(val: object) -> object | None:
        """Replace NaN/None with None for JSON safety."""
        if val is None:
            return None
        if isinstance(val, float) and math.isnan(val):
            return None
        return val

    rows = []
    for p in products:
        raw = p.get("raw_data", "{}")
        if isinstance(raw, str):
            raw = json.loads(raw)
        rows.append(
            {
                "source_id": source_ids[p["source_name"]],
                "external_id": p["external_id"],
                "title": _clean(p["title"]) or "",
                "brand": _clean(p["brand"]),
                "category": _clean(p["category"]),
                "description": _clean(p["description"]),
                "price": _clean(p["price"]),
                "raw_data": raw if isinstance(raw, dict) else {},
            }
        )

    all_inserted: list[dict] = []
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        result = (
            client.table("staging_product")
            .upsert(batch, on_conflict="source_id,external_id")
            .execute()
        )
        all_inserted.extend(result.data)
        print(f"  Staged {min(i + BATCH_SIZE, len(rows))}/{len(rows)} products")

    return all_inserted


def _seed_canonical(client: Client, staging_rows: list[dict]) -> None:
    """Create 1:1 canonical products and mappings for M1."""
    # Clear existing mappings and canonical products for clean re-seed.
    # Supabase requires a filter on delete; .neq("id", -1) is a workaround
    # for "delete all rows" since IDs are always positive serial values.
    client.table("product_mapping").delete().neq("id", -1).execute()
    client.table("canonical_product").delete().neq("id", -1).execute()

    canonical_rows = []
    for s in staging_rows:
        canonical_rows.append(
            {
                "title": s["title"],
                "brand": s.get("brand"),
                "category": s.get("category"),
                "description": s.get("description"),
                "price_min": s.get("price"),
                "price_max": s.get("price"),
            }
        )

    all_canonical: list[dict] = []
    for i in range(0, len(canonical_rows), BATCH_SIZE):
        batch = canonical_rows[i : i + BATCH_SIZE]
        result = client.table("canonical_product").insert(batch).execute()
        all_canonical.extend(result.data)
        print(f"  Canonical {min(i + BATCH_SIZE, len(canonical_rows))}/{len(canonical_rows)}")

    # Create mappings
    mappings = []
    for staging, canonical in zip(staging_rows, all_canonical):
        mappings.append(
            {
                "staging_product_id": staging["id"],
                "canonical_product_id": canonical["id"],
                "confidence": 1.0,
            }
        )

    for i in range(0, len(mappings), BATCH_SIZE):
        batch = mappings[i : i + BATCH_SIZE]
        client.table("product_mapping").insert(batch).execute()
        print(f"  Mappings {min(i + BATCH_SIZE, len(mappings))}/{len(mappings)}")


def seed() -> None:
    data_dir = Path(__file__).resolve().parent.parent / "data" / "raw"
    if not (data_dir / "tableA.csv").exists():
        print("Downloading data...")
        download_data()

    print("Ingesting and normalizing...")
    df = ingest_all(data_dir)
    products = df.to_dict("records")

    print("Connecting to Supabase...")
    client = get_supabase_client()

    print("Seeding catalog sources...")
    source_ids = _ensure_sources(client)

    print("Seeding staging products...")
    staging_rows = _seed_staging(client, products, source_ids)

    print("Seeding canonical products (1:1 for M1)...")
    _seed_canonical(client, staging_rows)

    print(f"\nDone! Seeded {len(staging_rows)} staging + {len(staging_rows)} canonical products.")


if __name__ == "__main__":
    seed()
