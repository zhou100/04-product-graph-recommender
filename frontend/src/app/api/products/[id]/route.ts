import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: product, error } = await supabase
    .from("staging_product")
    .select("*, catalog_source(name)")
    .eq("id", id)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check for canonical mapping
  const { data: mapping } = await supabase
    .from("product_mapping")
    .select("canonical_product_id, confidence, canonical_product(*)")
    .eq("staging_product_id", id)
    .single();

  return NextResponse.json({
    product,
    mapping: mapping || null,
  });
}
