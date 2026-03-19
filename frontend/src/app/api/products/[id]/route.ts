import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // TODO: M4 — fetch canonical product with source listings
  return NextResponse.json({
    id,
    message: "Product detail not yet implemented. See M4 milestone.",
  });
}
