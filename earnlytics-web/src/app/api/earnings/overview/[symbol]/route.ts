import { NextResponse } from "next/server";
import { fetchEarningsPageInitialData } from "@/app/earnings/[symbol]/earnings-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const earningId = searchParams.get("earning_id") || undefined;

    const data = await fetchEarningsPageInitialData(symbol, earningId);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch earnings overview", details: message },
      { status: 500 }
    );
  }
}

