import { NextResponse } from "next/server";

import { marketCandidateRepository } from "@/features/search/repositories/SupabaseMarketCandidateRepository";
import { buildWorkflowStatusResponse } from "@/features/workflow/server/runtime";

export async function GET() {
  const market = await marketCandidateRepository.listCandidates();

  return NextResponse.json(
    buildWorkflowStatusResponse({
      source: market.source,
      candidateCount: market.candidates.length,
      seeded: market.seeded,
      marketWarnings: market.warnings,
    }),
  );
}
