import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // TODO: M5 — item-to-item recommendations
  return NextResponse.json({
    productId: id,
    recommendations: [],
    message: "Recommendations not yet implemented. See M5 milestone.",
  });
}
