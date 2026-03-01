import type {
  RankedSearchResponse,
  SearchRequest,
} from "@/features/shared/contracts/SearchContracts";
import type { Candidate } from "@/features/shared/contracts/Candidate";
import type { UserPreferences } from "@/features/shared/contracts/UserPreferences";
import { candidateFixtures } from "@/features/shared/mocks/candidates";
import { defaultUserPreferences } from "@/features/shared/mocks/preferences";

export interface SearchRepository {
  getRankedCandidates(request: SearchRequest): Promise<RankedSearchResponse>;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * matchesQuery — Simple keyword matching against candidate fields.
 *
 * In production, this is replaced by the RAG search pipeline on the
 * backend (embedding + cosine similarity). This mock exists so the
 * frontend can demonstrate the search flow without a running server.
 */
function matchesQuery(candidate: Candidate, query: string): boolean {
  const normalized = query.toLowerCase();
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);

  const haystack = [
    candidate.name,
    candidate.description ?? "",
    ...(candidate.services ?? []),
    ...(candidate.specialties ?? []),
    ...(candidate.tags ?? []),
    candidate.location ?? "",
  ]
    .join(" ")
    .toLowerCase();

  // Match if any token appears in the haystack, or if the full query does
  return (
    haystack.includes(normalized) ||
    tokens.some((token) => haystack.includes(token))
  );
}

/**
 * scoreCandidate — Applies user preferences to adjust ranking scores.
 *
 * The real ranking service uses weighted composite scoring:
 *   relevance (40%) + successCount (20%) + rating (20%) + timeOnPlatform (10%)
 *
 * This mock approximation adjusts the base score based on the user's
 * declared priority axis (cost, quality, speed, rating).
 */
function scoreCandidate(
  candidate: Candidate,
  preferences: UserPreferences,
): number {
  let score = candidate.score;

  switch (preferences.priority) {
    case "cost":
      // Favor cheaper candidates
      if (candidate.hourlyRate != null) {
        score += Math.max(0, 150 - candidate.hourlyRate) / 150 * 0.1;
      }
      break;
    case "quality":
      // Favor higher-rated candidates
      score += (candidate.rating / 5) * 0.08;
      break;
    case "speed":
      // Favor candidates with fast response times
      if (candidate.availability === "Same day") {
        score += 0.06;
      } else if (candidate.availability === "Next day") {
        score += 0.03;
      }
      break;
    case "rating":
      // Pure rating boost
      score += (candidate.rating / 5) * 0.1;
      break;
  }

  // Budget hard filter — penalize candidates over budget
  if (
    preferences.budget != null &&
    candidate.hourlyRate != null &&
    candidate.hourlyRate > preferences.budget / 4
  ) {
    score -= 0.05;
  }

  // Min rating filter
  if (preferences.minRating != null && candidate.rating < preferences.minRating) {
    score -= 0.2;
  }

  return Math.max(0, Math.min(1, score));
}

export const mockSearchRepository: SearchRepository = {
  async getRankedCandidates(request) {
    await wait(900);

    const normalized = request.query.toLowerCase();

    // Intentional error trigger for testing error states
    if (normalized.includes("error")) {
      throw new Error(
        "The mock search service intentionally failed for this request.",
      );
    }

    // Intentional empty trigger for testing empty states
    if (normalized.includes("empty")) {
      return {
        candidates: [],
        followUpQuestion:
          "Try specifying the type of tradesperson you need (e.g., plumber, electrician, roofer).",
        appliedPreferences: request.userPreferences ?? defaultUserPreferences,
        resultCount: 0,
      };
    }

    const prefs = request.userPreferences ?? defaultUserPreferences;

    const rankedCandidates = candidateFixtures
      .filter((candidate) => matchesQuery(candidate, request.query))
      .map((candidate) => ({
        ...candidate,
        score: Number(scoreCandidate(candidate, prefs).toFixed(3)),
      }))
      .sort((a, b) => b.score - a.score);

    return {
      candidates: rankedCandidates,
      followUpQuestion:
        rankedCandidates.length === 0
          ? "No matches found. Try describing the type of work you need done."
          : null,
      appliedPreferences: prefs,
      resultCount: rankedCandidates.length,
    };
  },
};
