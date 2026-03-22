import { NextResponse } from "next/server";

import { marketCandidateSeeds } from "@/features/search/data/marketCandidateSeeds";
import { buildCandidateEmbeddingInput, serializeEmbedding } from "@/features/search/services/candidateEmbedding";
import { embeddingService } from "@/features/search/services/embedding";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/seed/market-candidates
 *
 * Navigate to this URL in any browser to upsert all seed agents into
 * the Supabase `market_candidates` table. Safe to call multiple times.
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    }

    const seededCandidates = await Promise.all(
      marketCandidateSeeds.map(async (seed) => {
        const embeddingResult = await embeddingService.generateEmbedding(
          buildCandidateEmbeddingInput(seed),
        );

        if (!embeddingResult.embedding) {
          const reason =
            embeddingResult.reason === "unconfigured"
              ? "Embedding provider is not configured."
              : `Embedding API call failed.${embeddingResult.message ? ` Error: ${embeddingResult.message}` : ""}`;

          throw new Error(
            `Unable to seed market candidate ${seed.agentId} with an embedding. ${reason}`,
          );
        }

        return {
          ...seed,
          embedding: embeddingResult.embedding,
        };
      }),
    );

    const rows = seededCandidates.map((seed) => ({
      agent_id: seed.agentId,
      name: seed.name,
      description: seed.description ?? null,
      services: seed.services ?? [],
      specialties: seed.specialties ?? [],
      location: seed.location ?? null,
      hourly_rate: seed.hourlyRate ?? null,
      base_price: seed.basePrice ?? null,
      success_count: seed.successCount ?? 0,
      rating: seed.rating ?? 0,
      years_on_platform: seed.yearsOnPlatform ?? null,
      years_experience: seed.yearsExperience ?? null,
      availability: seed.availability ?? null,
      certifications: seed.certifications ?? [],
      response_time: seed.responseTime ?? null,
      tags: seed.tags ?? [],
      embedding: serializeEmbedding(seed.embedding ?? []),
    }));

    const { error } = await supabaseAdmin
      .from("market_candidates")
      .upsert(rows, { onConflict: "agent_id" });

    if (error) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      upserted: rows.length,
      agents: rows.map((r) => ({ agent_id: r.agent_id, name: r.name, location: r.location })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to seed market candidates.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
