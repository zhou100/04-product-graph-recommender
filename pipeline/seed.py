"""Seed Supabase with processed data from the pipeline.

Usage:
    python -m pipeline.seed

Requires SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.
"""

import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


def get_supabase_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)


def seed() -> None:
    client = get_supabase_client()
    # TODO: M1 — seed staging_product, canonical_product, product_mapping tables
    print(f"Connected to Supabase: {client.supabase_url}")
    print("Seeding not yet implemented. See M1 milestone.")


if __name__ == "__main__":
    seed()
