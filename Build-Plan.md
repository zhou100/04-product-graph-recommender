# Build Plan

## Target timeline

- 9-12 focused build days for MVP
- 3 extra days if you want polished recommendation quality and a cleaner search UI

## Phase 0 - Setup

- Create the repo and choose the initial datasets.
- Define the canonical product schema.
- Decide which attributes matter most for matching, such as title, brand, size, and category.

## Phase 1 - Ingestion and normalization

- Build import scripts for two catalogs.
- Normalize text casing, units, brand names, and category labels.
- Create staging tables and a cleaned product table.
- Save source identifiers so every canonical product is traceable.

## Phase 2 - Candidate generation

- Add blocking rules so you do not compare every product pair.
- Start with simple blocks such as brand plus category or token overlap.
- Create a candidate pair table and inspect false negatives manually.
- Keep this step debuggable because it controls downstream quality.

## Phase 3 - Matching

- Build a baseline matcher using text similarity and handcrafted features.
- Add embedding similarity for harder cases.
- Evaluate duplicate detection on a labeled sample.
- Persist canonical product groups after a chosen threshold.

## Phase 4 - Search and product graph

- Build a canonical product view with merged attributes and source listings.
- Add semantic search over canonical products.
- Add filters for category, brand, and price band.
- Build a small product detail page.

## Phase 5 - Recommendations

- Start with simple item-to-item similarity using attributes and text embeddings.
- Add complementary product heuristics if you have category structure.
- Show explanation text for why an item was recommended.
- Keep recommendation logic understandable before making it fancy.

## Phase 6 - Evaluation and polish

- Report precision and recall for duplicate matching.
- Create a small search relevance set for 15-20 queries.
- Document recommendation examples and edge cases.
- Deploy the app and record a short walkthrough.

## Scope guardrails

- Do not start with image models.
- Do not try to solve all recommendation types at once.
- Do not hide the matching process; make it inspectable.

## Done looks like

- ingest pipeline for two catalogs
- canonical product table
- duplicate matching metrics
- semantic search
- simple recommendations
- deployed demo and polished README
