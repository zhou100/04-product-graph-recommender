import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { error } = await supabase
      .from("canonical_product")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      status: "ok",
      database: error ? "disconnected" : "connected",
    });
  } catch {
    return NextResponse.json(
      { status: "ok", database: "disconnected" },
      { status: 200 },
    );
  }
}
