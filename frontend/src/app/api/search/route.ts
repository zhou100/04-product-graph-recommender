import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const params = request.nextUrl.searchParams;
  const q = params.get("q") || "";
  const category = params.get("category");
  const brand = params.get("brand");
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(params.get("limit") || "20", 10)),
  );

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("staging_product")
    .select("*, catalog_source(name)", { count: "exact" });

  if (q) {
    query = query.or(`title.ilike.%${q}%,brand.ilike.%${q}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (brand) {
    query = query.ilike("brand", brand);
  }

  query = query.order("title", { ascending: true }).range(from, to);

  const { data: results, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    results: results || [],
    total: count || 0,
    page,
    limit,
  });
}
