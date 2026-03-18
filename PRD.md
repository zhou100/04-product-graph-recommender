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

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI |
| Data processing | DuckDB + Python |
| Database | PostgreSQL + pgvector |
| ML | scikit-learn, SentenceTransformers |
| Frontend | Next.js |

## Data

- Start with a product matching benchmark or small two-catalog dataset (5k-20k rows)
- Add review/interaction data later for better recommendations
- Optionally create a synthetic third catalog for stress-testing

## Non-functional requirements

- Matching pipeline must be inspectable (not a black box)
- Search latency < 500ms for typical queries
- All canonical products traceable back to source listings

## Success criteria

- Ingest pipeline handles two catalogs end-to-end
- Duplicate matching precision > 85%, recall > 80% on labeled sample
- Semantic search returns relevant results for 15-20 test queries
- Recommendations surface sensible related products with explanations
- Deployed demo with polished README

## Milestones

| # | Milestone | Scope |
|---|-----------|-------|
| M0 | Initial setup | Repo structure, schema definitions, dev environment, sample data |
| M1 | Ingestion + normalization | Import scripts, staging tables, cleaned product table |
| M2 | Candidate generation | Blocking rules, candidate pair table, debugging tools |
| M3 | Matching | Similarity scoring, threshold tuning, canonical groups |
| M4 | Search + product graph | Canonical view, semantic search, filters, product detail page |
| M5 | Recommendations | Item similarity, complementary heuristics, explanations |
| M6 | Evaluation + polish | Metrics, search relevance tests, deployment, walkthrough |

## Out of scope (for MVP)

- Image-based matching
- Learning-to-rank for search
- Bundle recommendations
- Real-time catalog sync
- Multi-tenant support

## Current milestone: M0 - Initial setup

### Deliverables
- Project directory structure (backend, frontend, data, scripts)
- PostgreSQL + pgvector schema definitions
- FastAPI skeleton with health check
- Next.js app scaffold
- Sample dataset selection and download script
- Docker Compose for local dev (Postgres + app)
- CI basics (lint, type check)
