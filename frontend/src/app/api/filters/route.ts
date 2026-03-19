import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Simple in-memory cache to avoid fetching all rows on every request
let cache: { categories: string[]; brands: string[]; ts: number } | null =
  null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({
      categories: cache.categories,
      brands: cache.brands,
    });
  }

  const supabase = getSupabase();

  const [catResult, brandResult] = await Promise.all([
    supabase
      .from("staging_product")
      .select("category")
      .not("category", "is", null)
      .limit(10000),
    supabase
      .from("staging_product")
      .select("brand")
      .not("brand", "is", null)
      .limit(10000),
  ]);

  const categories = [
    ...new Set((catResult.data || []).map((r) => r.category as string)),
  ].sort();
  const brands = [
    ...new Set((brandResult.data || []).map((r) => r.brand as string)),
  ].sort();

  cache = { categories, brands, ts: Date.now() };

  return NextResponse.json({ categories, brands });
}
