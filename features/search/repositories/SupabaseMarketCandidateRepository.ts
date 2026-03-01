import { supabaseAdmin } from "@/lib/supabase/server";
import { WorkflowFallback } from "@/features/workflow/types";
import { marketCandidateSeeds } from "../data/marketCandidateSeeds";
import { SearchResult } from "../types";
import {
  MarketCandidateRepository,
  MarketCandidateRepositoryResult,
} from "./MarketCandidateRepository";

function isSeedFallbackAllowed(): boolean {
  return process.env.ALLOW_SEEDED_MARKET_FALLBACK !== "false";
}

function parseEmbedding(raw: unknown): number[] | undefined {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => (typeof value === "number" ? value : Number(value)))
      .filter((value) => Number.isFinite(value));
  }

  if (typeof raw === "string") {
    try {
      const normalized = JSON.parse(raw) as unknown;
      return parseEmbedding(normalized);
    } catch {
      return raw
        .replaceAll("[", "")
        .replaceAll("]", "")
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value));
    }
  }

  return undefined;
}

function mapRowToCandidate(row: Record<string, unknown>): SearchResult {
  return {
    agentId: String(row.agent_id),
    name: String(row.name),
    description: typeof row.description === "string" ? row.description : undefined,
    services: Array.isArray(row.services) ? row.services.filter((value): value is string => typeof value === "string") : undefined,
    specialties: Array.isArray(row.specialties)
      ? row.specialties.filter((value): value is string => typeof value === "string")
      : undefined,
    location: typeof row.location === "string" ? row.location : undefined,
    hourlyRate: typeof row.hourly_rate === "number" ? row.hourly_rate : undefined,
    basePrice: typeof row.base_price === "number" ? row.base_price : undefined,
    successCount: typeof row.success_count === "number" ? row.success_count : 0,
    rating: typeof row.rating === "number" ? row.rating : 0,
    yearsOnPlatform: typeof row.years_on_platform === "number" ? row.years_on_platform : undefined,
    yearsExperience: typeof row.years_experience === "number" ? row.years_experience : undefined,
    availability: typeof row.availability === "string" ? row.availability : undefined,
    certifications: Array.isArray(row.certifications)
      ? row.certifications.filter((value): value is string => typeof value === "string")
      : undefined,
    responseTime: typeof row.response_time === "string" ? row.response_time : undefined,
    tags: Array.isArray(row.tags) ? row.tags.filter((value): value is string => typeof value === "string") : undefined,
    embedding: parseEmbedding(row.embedding),
    score: 0,
    relevance: 0,
  };
}

function buildSeedFallback(warnings: string[]): MarketCandidateRepositoryResult {
  const fallbacksUsed: WorkflowFallback[] = ["seed_market"];

  return {
    candidates: marketCandidateSeeds,
    source: "seed",
    seeded: true,
    warnings,
    fallbacksUsed,
  };
}

export class SupabaseMarketCandidateRepository implements MarketCandidateRepository {
  async listCandidates(): Promise<MarketCandidateRepositoryResult> {
    if (!supabaseAdmin) {
      if (!isSeedFallbackAllowed()) {
        return {
          candidates: [],
          source: "supabase",
          seeded: false,
          warnings: ["Supabase is not configured and seeded fallback is disabled."],
          fallbacksUsed: [],
        };
      }

      return buildSeedFallback([
        "Supabase is not configured. Using seeded market fallback.",
      ]);
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("market_candidates")
        .select("*");

      if (error) {
        if (!isSeedFallbackAllowed()) {
          return {
            candidates: [],
            source: "supabase",
            seeded: false,
            warnings: [`Failed to load market candidates from Supabase: ${error.message}`],
            fallbacksUsed: [],
          };
        }

        return buildSeedFallback([
          `Failed to load market candidates from Supabase: ${error.message}`,
          "Using seeded market fallback.",
        ]);
      }

      if (!data || data.length === 0) {
        if (!isSeedFallbackAllowed()) {
          return {
            candidates: [],
            source: "supabase",
            seeded: false,
            warnings: ["Supabase market table is empty and seeded fallback is disabled."],
            fallbacksUsed: [],
          };
        }

        return buildSeedFallback([
          "Supabase market table is empty. Using seeded market fallback.",
        ]);
      }

      return {
        candidates: data.map((row: Record<string, unknown>) => mapRowToCandidate(row)),
        source: "supabase",
        seeded: false,
        warnings: [],
        fallbacksUsed: [],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Supabase market error";

      if (!isSeedFallbackAllowed()) {
        return {
          candidates: [],
          source: "supabase",
          seeded: false,
          warnings: [message],
          fallbacksUsed: [],
        };
      }

      return buildSeedFallback([`${message}. Using seeded market fallback.`]);
    }
  }
}

export const marketCandidateRepository = new SupabaseMarketCandidateRepository();
