# Product Graph Recommender - PRD

## Problem

Product catalogs from different sources list the same products with different titles, descriptions, prices, and attributes. There is no unified view, making it impossible to search across sources, deduplicate listings, or recommend related products intelligently.

## Solution

A product intelligence system that ingests multiple catalogs, resolves duplicates into a canonical product graph, supports semantic search, and recommends related products.

## Target user

A data-savvy user (analyst, PM, or engineer) who wants to search across multiple product catalogs and get deduplicated, enriched results with recommendations.

## Core features

### F1 - Catalog ingestion and normalization
- Ingest two product feeds (CSV/JSON) into a staging layer
- Normalize titles, brands, units, categories, and pricing
- Store source identifiers for traceability

### F2 - Entity resolution (duplicate detection)
- Generate candidate pairs using blocking rules (brand + category, token overlap)
- Score candidates with text similarity + embedding similarity
- Persist canonical product groups above a confidence threshold
- Report precision/recall metrics on a labeled sample

### F3 - Canonical product graph
- Merge matched listings into canonical products with unified attributes
- Show source listings linked to each canonical product
- Expose a product detail view with merged data

### F4 - Semantic search
- Embed canonical products using SentenceTransformers
- Support natural language search queries
- Filter by category, brand, and price band

### F5 - Related product recommendations
- Item-to-item similarity using attribute + text embeddings
- Complementary product heuristics based on category structure
- Explanation text for each recommendation

## Tech stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend + API | Next.js (Vercel) | API routes serve search, product, and recommendation endpoints |
| Database | Supabase (PostgreSQL + pgvector) | Free tier, 500MB, handles all live queries |
| Data pipeline | Python + DuckDB | Runs offline to ingest, resolve, embed, and seed Supabase |
| ML | scikit-learn, SentenceTransformers | Runs offline at seed time; vectors stored in pgvector |
| Hosting | Vercel (free tier) | Auto-deploys from GitHub |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  OFFLINE PIPELINE (Python)                          │
│  Ingest CSVs → Normalize → Entity Resolution →      │
│  Generate Embeddings → Seed Supabase                │
└──────────────────────┬──────────────────────────────┘
                       │ writes to
                       ▼
┌─────────────────────────────────────────────────────┐
│  SUPABASE (PostgreSQL + pgvector)                   │
│  staging_product | canonical_product | product_mapping│
│  candidate_pair  | embeddings (vector)              │
└──────────────────────┬──────────────────────────────┘
                       │ reads from
                       ▼
┌─────────────────────────────────────────────────────┐
│  NEXT.JS on VERCEL                                  │
│  /api/search → semantic search via pgvector         │
│  /api/products/:id → canonical product + sources    │
│  /api/recommendations/:id → similar products        │
│  UI: search page, product detail, recommendations   │
└─────────────────────────────────────────────────────┘
```

### Why this architecture
- **Zero backend hosting cost**: No FastAPI server to run. Next.js API routes on Vercel free tier handle all live traffic.
- **Supabase free tier**: 500MB Postgres + pgvector is plenty for a demo dataset.
- **Python stays valuable**: The offline pipeline (ingestion, entity resolution, embedding) is the core data science work. It just runs locally and seeds the database rather than being a live server.
- **Real user interactions**: Visitors can search, browse products, and get recommendations — all hitting live Supabase queries.

## Deployment

| Concern | Approach |
|---------|----------|
| Frontend hosting | Vercel, auto-deploy from `main` branch |
| API | Next.js API routes (no separate server) |
| Database | Supabase free tier (PostgreSQL + pgvector) |
| Data seeding | Run Python pipeline locally, connect to Supabase via env vars |
| Secrets | `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel env vars |
| Search embeddings | Pre-computed offline, query-time embedding via lightweight JS model |
| Domain | Subdomain or path on personal website, proxied to Vercel |

## Data

- Start with a product matching benchmark or small two-catalog dataset (5k-20k rows)
- Add review/interaction data later for better recommendations
- Optionally create a synthetic third catalog for stress-testing

## Non-functional requirements

- Matching pipeline must be inspectable (not a black box)
- Search latency < 500ms for typical queries
- All canonical products traceable back to source listings
- Demo must be publicly accessible and handle concurrent users

## Success criteria

- Ingest pipeline handles two catalogs end-to-end
- Duplicate matching precision > 85%, recall > 80% on labeled sample
- Semantic search returns relevant results for 15-20 test queries
- Recommendations surface sensible related products with explanations
- Deployed demo accessible from personal website with real user interactions
- Polished README with architecture diagram and walkthrough

## Milestones

| # | Milestone | Scope |
|---|-----------|-------|
| M0 | Initial setup | Repo structure, schema definitions, dev environment, sample data |
| M1 | Ingestion + normalization | Import scripts, staging tables, cleaned product table |
| M2 | Candidate generation | Blocking rules, candidate pair table, debugging tools |
| M3 | Matching | Similarity scoring, threshold tuning, canonical groups |
| M4 | Search + product graph | Canonical view, semantic search, filters, product detail page |
| M5 | Recommendations | Item similarity, complementary heuristics, explanations |
| M6 | Deployment + polish | Supabase setup, Vercel deploy, metrics, walkthrough |

## Out of scope (for MVP)

- Image-based matching
- Learning-to-rank for search
- Bundle recommendations
- Real-time catalog sync
- Multi-tenant support
- User authentication

## Current milestone: M0 - Initial setup

### Deliverables
- Project directory structure (pipeline, frontend, db)
- Supabase-compatible schema definitions (pgvector)
- Next.js app scaffold with API route stubs
- Python pipeline skeleton
- Sample dataset download script
- Docker Compose for local dev (Postgres + pgvector for offline work)
- CI basics (lint, type check)
