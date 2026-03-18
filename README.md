# Product Graph Recommender

Build a product intelligence system that ingests multiple catalogs, resolves duplicate products into a canonical graph, supports semantic search, and recommends related products.

## Why build this

- It gives you a strong classic data science story.
- It shows entity resolution, ranking, feature engineering, search, and recommendation.
- It is easier to make this feel unique than another generic chatbot app.

## Core user story

A user can search across multiple stores and the app:

- merges duplicate listings into one canonical product
- normalizes key attributes
- supports semantic search and filtering
- recommends similar or complementary products

## Suggested data

- Start with a product matching benchmark or a small two-catalog product matching dataset.
- If that feels too large, use a 5k-20k row subset first.
- Add review or interaction data later for better recommendations.
- If needed, create a small synthetic third catalog to stress-test entity resolution.

## MVP scope

- Ingest two product feeds into a staging layer.
- Normalize titles, brands, and simple attributes.
- Generate candidate pairs with blocking rules.
- Score duplicate candidates with an embedding or feature-based matcher.
- Build a canonical product table or graph.
- Add semantic search and a simple related-products recommender.

## Suggested stack

- Backend: `FastAPI`
- Data processing: `DuckDB` plus Python pipelines
- Storage: `Postgres`
- ML: `scikit-learn`, `SentenceTransformers`, and simple ranking models
- Frontend: `Next.js`
- Search: `pgvector` or a search service if needed later

## Strong README features

- catalog ingestion diagram
- entity-resolution evaluation metrics such as precision and recall
- product profile page showing merged listings from multiple sources
- semantic search with filters
- related product carousel with an explanation of why items were recommended

## Demo flow

1. Ingest two sample catalogs.
2. Show raw duplicate listings before matching.
3. Open a canonical product page after deduplication.
4. Run a semantic search query and filter results.
5. Show similar or complementary product recommendations.

## Stretch goals

- graph visualization
- image-aware matching
- learning-to-rank for search
- bundle recommendation
- cold-start strategy using product attributes

## Definition of success

You can clearly show the path from messy multi-source catalog data to a useful search and recommendation experience.
