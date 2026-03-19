"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ProductDetail } from "@/lib/types";

function formatPrice(price: number | null) {
  if (price === null) return "N/A";
  return `$${price.toFixed(2)}`;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  const { product, mapping } = data;
  const source = product.catalog_source?.name || "Unknown";
  const sourceBg =
    source === "Amazon"
      ? "bg-orange-100 text-orange-800"
      : "bg-blue-100 text-blue-800";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm mb-6 inline-block"
        >
          &larr; Back to search
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {product.title}
            </h1>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded shrink-0 ${sourceBg}`}
            >
              {source}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {product.brand && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Brand
                </p>
                <p className="text-sm text-gray-900">{product.brand}</p>
              </div>
            )}
            {product.category && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Category
                </p>
                <p className="text-sm text-gray-900">{product.category}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Price
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(product.price)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Source ID
              </p>
              <p className="text-sm text-gray-600">{product.external_id}</p>
            </div>
          </div>

          {product.description && (
            <div className="mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          )}

          {mapping && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Canonical Product
              </p>
              <p className="text-sm text-gray-600">
                Mapped to canonical #{mapping.canonical_product_id} with{" "}
                {(mapping.confidence * 100).toFixed(0)}% confidence
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
