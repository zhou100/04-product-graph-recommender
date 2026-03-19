export interface StagingProduct {
  id: number;
  source_id: number;
  external_id: string;
  title: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  price: number | null;
  currency: string;
  attributes: Record<string, unknown>;
  raw_data: Record<string, unknown>;
  created_at: string;
  catalog_source?: { name: string };
}

export interface SearchResponse {
  results: StagingProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface FilterResponse {
  categories: string[];
  brands: string[];
}

export interface StatsResponse {
  totalProducts: number;
  canonicalProducts: number;
  mappedProducts: number;
  bySource: { name: string; count: number }[];
}

export interface CanonicalProduct {
  id: number;
  title: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  attributes: Record<string, unknown>;
  created_at: string;
}

export interface ProductMapping {
  canonical_product_id: number;
  confidence: number;
  canonical_product: CanonicalProduct;
}

export interface ProductDetail {
  product: StagingProduct;
  mapping: ProductMapping | null;
}
