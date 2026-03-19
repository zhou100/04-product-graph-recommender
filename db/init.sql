-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Source catalogs
CREATE TABLE IF NOT EXISTS catalog_source (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raw ingested products (staging)
CREATE TABLE IF NOT EXISTS staging_product (
    id SERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES catalog_source(id),
    external_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(255),
    description TEXT,
    price NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    attributes JSONB DEFAULT '{}',
    raw_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (source_id, external_id)
);

-- Canonical products (deduplicated)
CREATE TABLE IF NOT EXISTS canonical_product (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(255),
    description TEXT,
    price_min NUMERIC(12, 2),
    price_max NUMERIC(12, 2),
    attributes JSONB DEFAULT '{}',
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link staging products to their canonical product
CREATE TABLE IF NOT EXISTS product_mapping (
    id SERIAL PRIMARY KEY,
    staging_product_id INTEGER NOT NULL REFERENCES staging_product(id),
    canonical_product_id INTEGER NOT NULL REFERENCES canonical_product(id),
    confidence REAL NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (staging_product_id)
);

-- Candidate pairs for entity resolution
CREATE TABLE IF NOT EXISTS candidate_pair (
    id SERIAL PRIMARY KEY,
    staging_product_a INTEGER NOT NULL REFERENCES staging_product(id),
    staging_product_b INTEGER NOT NULL REFERENCES staging_product(id),
    similarity_score REAL,
    is_match BOOLEAN,
    method VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (staging_product_a, staging_product_b)
);

-- Row Level Security: allow public read access via anon key
ALTER TABLE catalog_source ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON catalog_source FOR SELECT USING (true);

ALTER TABLE staging_product ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON staging_product FOR SELECT USING (true);

ALTER TABLE canonical_product ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON canonical_product FOR SELECT USING (true);

ALTER TABLE product_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON product_mapping FOR SELECT USING (true);

ALTER TABLE candidate_pair ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON candidate_pair FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staging_source ON staging_product(source_id);
CREATE INDEX IF NOT EXISTS idx_staging_brand ON staging_product(brand);
CREATE INDEX IF NOT EXISTS idx_staging_category ON staging_product(category);
CREATE INDEX IF NOT EXISTS idx_canonical_embedding ON canonical_product USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
CREATE INDEX IF NOT EXISTS idx_mapping_canonical ON product_mapping(canonical_product_id);
