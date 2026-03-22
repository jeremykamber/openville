import { supabaseAdmin } from "@/lib/supabase/server";
import { buildCandidateEmbeddingInput, serializeEmbedding } from "../services/candidateEmbedding";
import { embeddingService } from "../services/embedding";
import { SearchResult } from "../types";
import {
  MarketCandidateRepository,
  MarketCandidateRepositoryResult,
} from "./MarketCandidateRepository";

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

export class SupabaseMarketCandidateRepository implements MarketCandidateRepository {
  async syncMissingEmbeddings(): Promise<{
    repairedCount: number;
    candidateCount: number;
  }> {
    if (!supabaseAdmin) {
      throw new Error("Supabase is not configured for market candidate retrieval.");
    }

    const { data, error } = await supabaseAdmin
      .from("market_candidates")
      .select("*");

    if (error) {
      throw new Error(
        `Failed to load market candidates from Supabase: ${error.message}`,
      );
    }

    if (!data || data.length === 0) {
      throw new Error("Supabase market table is empty.");
    }

    const repairedCount = await this.backfillMissingEmbeddings(
      data as Record<string, unknown>[],
    );

    return {
      repairedCount,
      candidateCount: data.length,
    };
  }

  private async backfillMissingEmbeddings(
    rows: Record<string, unknown>[],
  ): Promise<number> {
    const missingRows = rows.filter((row) => !parseEmbedding(row.embedding)?.length);
    if (missingRows.length === 0) {
      return 0;
    }

    const BATCH_SIZE = 5;

    for (let i = 0; i < missingRows.length; i += BATCH_SIZE) {
      const batch = missingRows.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (row) => {
          const candidate = mapRowToCandidate(row);
          const embeddingResult = await embeddingService.generateEmbedding(
            buildCandidateEmbeddingInput(candidate),
          );

          if (!embeddingResult.embedding) {
            const reason =
              embeddingResult.reason === "unconfigured"
                ? "Embedding provider is not configured."
                : `Embedding API call failed.${embeddingResult.message ? ` Error: ${embeddingResult.message}` : ""}`;

            throw new Error(
              `Market candidate ${candidate.agentId} is missing a stored embedding and automatic repair failed. ${reason}`,
            );
          }

          const serializedEmbedding = serializeEmbedding(embeddingResult.embedding);
          const { error } = await supabaseAdmin!
            .from("market_candidates")
            .update({ embedding: serializedEmbedding })
            .eq("agent_id", candidate.agentId);

          if (error) {
            throw new Error(
              `Failed to backfill embedding for market candidate ${candidate.agentId}: ${error.message}`,
            );
          }
        }),
      );
    }

    return missingRows.length;
  }

  async listCandidates(): Promise<MarketCandidateRepositoryResult> {
    if (!supabaseAdmin) {
      throw new Error("Supabase is not configured for market candidate retrieval.");
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("market_candidates")
        .select("*");

      if (error) {
        throw new Error(
          `Failed to load market candidates from Supabase: ${error.message}`,
        );
      }

      if (!data || data.length === 0) {
        throw new Error("Supabase market table is empty.");
      }

      await this.backfillMissingEmbeddings(
        data as Record<string, unknown>[],
      );

      return {
        candidates: data.map((row: Record<string, unknown>) => mapRowToCandidate(row)),
        source: "supabase",
        seeded: false,
        warnings: [],
        fallbacksUsed: [],
      };
    } catch (error) {
      console.error("Market candidate repository error:", error);
      throw error;
    }
  }
}

export const marketCandidateRepository = new SupabaseMarketCandidateRepository();
