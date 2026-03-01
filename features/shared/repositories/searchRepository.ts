import type {
  RankedSearchResponse,
  SearchRequest,
} from "@/features/shared/contracts/SearchContracts";
import type { Candidate } from "@/features/shared/contracts/Candidate";
import { candidateFixtures } from "@/features/shared/mocks/candidates";

export interface SearchRepository {
  getRankedCandidates(request: SearchRequest): Promise<RankedSearchResponse>;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchesQuery(candidate: Candidate, query: string) {
  const normalized = query.toLowerCase();
  const queryTokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const haystack = [
    candidate.name,
    candidate.headline,
    candidate.summary,
    ...candidate.specialties,
  ]
    .join(" ")
    .toLowerCase();
  const eventKeywords = [
    "event",
    "launch",
    "av",
    "staff",
    "staffing",
    "ops",
    "onsite",
    "on-site",
    "backup",
    "crew",
    "support",
  ];

  return (
    haystack.includes(normalized) ||
    queryTokens.some((token) => haystack.includes(token)) ||
    eventKeywords.some((keyword) => normalized.includes(keyword))
  );
}

function scoreCandidate(
  candidate: Candidate,
  budgetPriority: SearchRequest["userPreferences"]["budgetPriority"],
  timeline: SearchRequest["userPreferences"]["timeline"],
  qualityPriority: SearchRequest["userPreferences"]["qualityPriority"],
) {
  let score = candidate.score;

  if (budgetPriority === "low_cost" && candidate.startingPrice !== null) {
    score += Math.max(0, 5000 - candidate.startingPrice) / 125;
  }

  if (budgetPriority === "premium" && candidate.rating >= 4.9) {
    score += 4;
  }

  if (qualityPriority === "high") {
    score += candidate.rating * 1.1;
  }

  if (
    timeline === "asap" &&
    /today|90 minutes|1 pm|12:30 pm/i.test(candidate.availabilityLabel)
  ) {
    score += 3;
  }

  return score;
}

export const mockSearchRepository: SearchRepository = {
  async getRankedCandidates(request) {
    await wait(900);

    const normalized = request.query.toLowerCase();

    if (normalized.includes("error")) {
      throw new Error("The mock search service intentionally failed for this request.");
    }

    if (normalized.includes("empty")) {
      return {
        candidates: [],
        followUpQuestion: "Try adding your budget, urgency, or service type for better matches.",
        appliedPreferences: request.userPreferences,
        resultCount: 0,
      };
    }

    const rankedCandidates = candidateFixtures
      .filter((candidate) => matchesQuery(candidate, request.query))
      .map((candidate) => ({
        ...candidate,
        score: Number(
          scoreCandidate(
            candidate,
            request.userPreferences.budgetPriority,
            request.userPreferences.timeline,
            request.userPreferences.qualityPriority,
          ).toFixed(1),
        ),
      }))
      .sort((left, right) => right.score - left.score);

    return {
      candidates: rankedCandidates,
      followUpQuestion:
        rankedCandidates.length === 0
          ? "I can search again once you narrow the job a bit more."
          : null,
      appliedPreferences: request.userPreferences,
      resultCount: rankedCandidates.length,
    };
  },
};
