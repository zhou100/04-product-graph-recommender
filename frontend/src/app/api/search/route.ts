import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const category = request.nextUrl.searchParams.get("category");
  const brand = request.nextUrl.searchParams.get("brand");

  if (!query) {
    return NextResponse.json(
      { error: "Missing required parameter: q" },
      { status: 400 },
    );
  }

  // TODO: M4 — semantic search via pgvector
  return NextResponse.json({
    query,
    filters: { category, brand },
    results: [],
    message: "Search not yet implemented. See M4 milestone.",
  });
}
