import { NextResponse } from "next/server";

import { marketCandidateSeeds } from "@/features/search/data/marketCandidateSeeds";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/seed/market-candidates
 *
 * Navigate to this URL in any browser to upsert all seed agents into
 * the Supabase `market_candidates` table. Safe to call multiple times.
 */
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const rows = marketCandidateSeeds.map((seed) => ({
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
}
