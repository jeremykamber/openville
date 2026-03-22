import { NextResponse } from "next/server";

import { marketCandidateRepository } from "@/features/search/repositories/SupabaseMarketCandidateRepository";

export async function POST() {
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
