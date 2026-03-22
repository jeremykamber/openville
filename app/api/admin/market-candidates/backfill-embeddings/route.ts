import { NextRequest, NextResponse } from "next/server";

import { marketCandidateRepository } from "@/features/search/repositories/SupabaseMarketCandidateRepository";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  if (!process.env.MARKET_ADMIN_TOKEN || token !== process.env.MARKET_ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await marketCandidateRepository.syncMissingEmbeddings();

    return NextResponse.json({
      success: true,
      repairedCount: result.repairedCount,
      candidateCount: result.candidateCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to backfill market candidate embeddings.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
