import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  const [productsRes, canonicalRes, mappingRes, sourcesRes] = await Promise.all(
    [
      supabase
        .from("staging_product")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("canonical_product")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("product_mapping")
        .select("*", { count: "exact", head: true }),
      supabase.from("catalog_source").select("id, name"),
    ],
  );

  const sourceCounts = await Promise.all(
    (sourcesRes.data || []).map(async (s) => {
      const { count } = await supabase
        .from("staging_product")
        .select("*", { count: "exact", head: true })
        .eq("source_id", s.id);
      return { name: s.name as string, count: count || 0 };
    }),
  );

  return NextResponse.json({
    totalProducts: productsRes.count || 0,
    canonicalProducts: canonicalRes.count || 0,
    mappedProducts: mappingRes.count || 0,
    bySource: sourceCounts,
  });
}
