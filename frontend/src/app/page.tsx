"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type {
  StagingProduct,
  FilterResponse,
  StatsResponse,
} from "@/lib/types";
import { formatPrice } from "@/lib/format";

interface SearchState {
  results: StagingProduct[];
  total: number;
  page: number;
  limit: number;
}

function SourceBadge({ name }: { name: string }) {
  const color =
    name === "Amazon"
      ? "bg-orange-100 text-orange-800"
      : "bg-blue-100 text-blue-800";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${color}`}>
      {name}
    </span>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
      <p className="text-2xl font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function ProductCard({ product }: { product: StagingProduct }) {
  const source = product.catalog_source?.name || "Unknown";
  return (
    <Link
      href={`/products/${product.id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
          {product.title}
        </h3>
        <SourceBadge name={source} />
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        {product.brand && <span>{product.brand}</span>}
        {product.brand && product.category && <span>&middot;</span>}
        {product.category && <span>{product.category}</span>}
      </div>
      {product.price !== null && (
        <p className="text-lg font-semibold text-gray-900">
          {formatPrice(product.price)}
        </p>
      )}
    </Link>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [data, setData] = useState<SearchState | null>(null);
  const [filters, setFilters] = useState<FilterResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Load filters once on mount
  useEffect(() => {
    fetch("/api/filters")
      .then((res) => res.json())
      .then(setFilters)
      .catch(() => {});
  }, []);

  // Load stats once on mount
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const search = useCallback(
    async (p: number = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      if (brand) params.set("brand", brand);
      params.set("page", String(p));
      params.set("limit", "20");

      try {
        const res = await fetch(`/api/search?${params}`);
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        setData(json);
        setError(null);
        setPage(p);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [query, category, brand],
  );

  useEffect(() => {
    search(1);
  }, [search]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3">
            Product Graph Recommender
          </h1>

          {/* Stats banner */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <StatCard
                label="Total Products"
                value={stats.totalProducts}
              />
              {stats.bySource.map((s) => (
                <StatCard
                  key={s.name}
                  label={s.name}
                  value={s.count}
                />
              ))}
              <StatCard
                label="Canonical Products"
                value={stats.canonicalProducts}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <form
              className="flex-1 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                search(1);
              }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">All Categories</option>
                {filters?.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">All Brands</option>
                {filters?.brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && !data && (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        )}

        {error && (
          <div className="text-center text-red-500 py-12">
            {error}. Please try again.
          </div>
        )}

        {data && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {data.total} product{data.total !== 1 ? "s" : ""} found
              {query && (
                <>
                  {" "}
                  for &ldquo;
                  <span className="font-medium">{query}</span>&rdquo;
                </>
              )}
            </p>

            {loading && data && (
              <div className="text-center text-gray-400 text-xs mb-2">
                Updating...
              </div>
            )}

            {data.results.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                No products found. Try a different search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => search(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => search(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
