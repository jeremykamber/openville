import { describe, expect, it } from "vitest";

import {
  applyWorkflowHomepageControls,
  buildSelectWinnerRequest,
  buildWorkflowContext,
  createContextFormValues,
  deriveSpeedPresetFromContext,
  toEliminationViewModels,
  toFinalistShowdownViewModels,
  toInspectorArtifacts,
  toNegotiationThreadViewModel,
  toSearchResultsViewModel,
} from "@/features/workflow/client/adapters";
import type {
  NegotiationDetailResponse,
  SearchAndSelectResponse,
  SelectWinnerResponse,
  WorkflowContextFormValues,
} from "@/features/workflow/client/types";
import type { Candidate } from "@/features/agents/selection/types";
import type { NegotiationOutcomeTransport } from "@/features/agents/negotiation/types";

describe("workflow adapters", () => {
  it("prefills context values from the initial query", () => {
    const values = createContextFormValues("Need urgent gutter repair in Austin");

    expect(values.jobType).toBe("gutter repair");
    expect(values.urgency).toBe("asap");
    expect(values.location).toBe("Austin");
    expect(values.description).toBe("Need urgent gutter repair in Austin");
  });

  it("builds backend workflow context from form values", () => {
    const values: WorkflowContextFormValues = {
      jobType: "gutter repair",
      description: "Repair leaking gutters on a duplex",
      location: "Austin",
      urgency: "scheduled",
      estimatedDuration: "Half day",
      rooms: "2",
      budget: "550",
      priority: "quality",
      minRating: "4.5",
      availability: "weekdays",
      availabilityRequired: "Site visit before Friday",
      dealBreakers: "uninsured, unlicensed",
      preferredQualifications: "licensed, insured",
      additionalRequirements: "bring before-and-after photos",
    };

    const result = buildWorkflowContext("Original request", values);

    expect(result.query).toBe(
      "Repair leaking gutters on a duplex. gutter repair. Austin. bring before-and-after photos",
    );
    expect(result.scope).toEqual({
      jobType: "gutter repair",
      description: "Repair leaking gutters on a duplex",
      location: "Austin",
      urgency: "scheduled",
      estimatedDuration: "Half day",
      rooms: 2,
    });
    expect(result.userPreferences).toEqual({
      budget: 550,
      priority: "quality",
      dealBreakers: ["uninsured", "unlicensed"],
      preferredQualifications: ["licensed", "insured"],
      availabilityRequired: "Site visit before Friday",
      minRating: 4.5,
      location: "Austin",
      availability: "weekdays",
      additionalRequirements: "bring before-and-after photos",
    });
  });

  it("maps homepage speed and budget controls into canonical context values", () => {
    const inferred = createContextFormValues("Need urgent gutter repair in Austin");

    const fastest = applyWorkflowHomepageControls(inferred, inferred, {
      speed: "fastest",
      budget: "425",
      budgetTouched: true,
    });

    expect(fastest.priority).toBe("speed");
    expect(fastest.urgency).toBe("asap");
    expect(fastest.budget).toBe("425");

    const quality = applyWorkflowHomepageControls(fastest, inferred, {
      speed: "best_quality",
      budget: "",
      budgetTouched: false,
    });

    expect(quality.priority).toBe("rating");
    expect(quality.urgency).toBe("asap");

    const balanced = applyWorkflowHomepageControls(quality, inferred, {
      speed: "balanced",
      budget: "",
      budgetTouched: false,
    });

    expect(balanced.priority).toBe(inferred.priority);
    expect(balanced.urgency).toBe(inferred.urgency);
  });

  it("derives the visible homepage speed preset from context values", () => {
    expect(
      deriveSpeedPresetFromContext({
        priority: "speed",
        urgency: "asap",
      }),
    ).toBe("fastest");

    expect(
      deriveSpeedPresetFromContext({
        priority: "rating",
        urgency: "",
      }),
    ).toBe("best_quality");

    expect(
      deriveSpeedPresetFromContext({
        priority: "",
        urgency: "",
      }),
    ).toBe("balanced");
  });

  it("filters negotiation outcomes to the transport-safe winner payload", () => {
    const request = buildSelectWinnerRequest(
      [
        {
          negotiationId: "",
          candidateId: "agent-1",
          status: "failed",
          summary: "provider timeout",
        },
        {
          negotiationId: "neg-2",
          candidateId: "agent-2",
          status: "completed",
          result: {
            id: "result-2",
            negotiationId: "neg-2",
            proposedBy: "buyer",
            status: "accepted",
            finalPrice: 480,
            createdAt: "2026-03-01T00:00:00.000Z",
            responseMessage: "Accepted the proposal.",
          },
          summary: "accepted",
        },
      ],
      {
        priority: "cost",
      },
    );

    expect(request).toEqual({
      negotiations: [
        {
          candidateId: "agent-2",
          result: {
            id: "result-2",
            negotiationId: "neg-2",
            proposedBy: "buyer",
            status: "accepted",
            finalPrice: 480,
            createdAt: "2026-03-01T00:00:00.000Z",
            responseMessage: "Accepted the proposal.",
          },
        },
      ],
      userPreferences: {
        priority: "cost",
      },
    });
  });

  it("adapts backend search results into candidate board view models", () => {
    const response: SearchAndSelectResponse = {
      searchResults: [
        {
          agentId: "agent-1",
          name: "John's Gutters LLC",
          score: 0.91,
          relevance: 0.88,
          successCount: 127,
          rating: 4.8,
          services: ["gutter repair", "gutter installation"],
          specialties: ["storm damage"],
          basePrice: 350,
          availability: "weekdays",
          location: "Austin",
          description: "Two-story gutter repair specialist.",
        },
      ],
      selectionResult: {
        top3: [],
        summary: "Selection skipped because there were fewer than three candidates.",
      },
      meta: {
        mode: "degraded",
        llmProvider: "mock",
        fallbacksUsed: ["mock_llm"],
        warnings: ["Using explicit mock LLM fallback."],
        dataSource: "supabase",
        retrievalMode: "keyword",
      },
    };

    const viewModel = toSearchResultsViewModel(response);

    expect(viewModel.resultCount).toBe(1);
    expect(viewModel.shortlistCount).toBe(0);
    expect(viewModel.summary).toBe(
      "Selection skipped because there were fewer than three candidates.",
    );
    expect(viewModel.candidates[0]).toMatchObject({
      agentId: "agent-1",
      name: "John's Gutters LLC",
      headline: "gutter repair · gutter installation",
      startingPrice: "$350",
      availabilityLabel: "weekdays",
      locationLabel: "Austin",
      ratingLabel: "4.8 rating",
    });
  });
});

// ---------------------------------------------------------------------------
// Helper: build a Candidate fixture with explicit fields.
// The extra `_unknownField` property tests index-signature leakage.
// ---------------------------------------------------------------------------

function buildCandidate(overrides: Partial<Candidate> & { _unknownField?: string } = {}): Candidate {
  return {
    agentId: "agent-default",
    name: "Default Agent",
    score: 0.75,
    relevance: 0.7,
    successCount: 50,
    rating: 4.5,
    services: ["general repair"],
    specialties: ["maintenance"],
    basePrice: 300,
    availability: "weekdays",
    location: "Austin",
    description: "A reliable operator.",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Elimination adapters
// ---------------------------------------------------------------------------

describe("toEliminationViewModels", () => {
  it("maps candidates ranked 4–10 from a full top-10 list", () => {
    const candidates = Array.from({ length: 10 }, (_, i) =>
      buildCandidate({
        agentId: `agent-${i + 1}`,
        name: `Agent ${i + 1}`,
        score: 1.0 - i * 0.08,
        relevance: 0.95 - i * 0.05,
        rating: 5.0 - i * 0.3,
        basePrice: 200 + i * 50,
      }),
    );

    const vms = toEliminationViewModels(candidates);

    expect(vms).toHaveLength(7);
    expect(vms[0].agentId).toBe("agent-4");
    expect(vms[0].rank).toBe(4);
    expect(vms[6].agentId).toBe("agent-10");
    expect(vms[6].rank).toBe(10);

    for (const vm of vms) {
      expect(vm.eliminationReason).toBeTruthy();
    }
  });

  it("returns empty array when there are exactly 3 candidates", () => {
    const candidates = Array.from({ length: 3 }, (_, i) =>
      buildCandidate({ agentId: `agent-${i + 1}`, name: `Agent ${i + 1}` }),
    );

    expect(toEliminationViewModels(candidates)).toEqual([]);
  });

  it("returns empty array when there are fewer than 3 candidates", () => {
    const candidates = [buildCandidate({ agentId: "agent-1", name: "Solo Agent" })];
    expect(toEliminationViewModels(candidates)).toEqual([]);
  });

  it("returns empty array for an empty candidate list", () => {
    expect(toEliminationViewModels([])).toEqual([]);
  });

  it("derives a cost-based elimination reason for expensive candidates", () => {
    const candidates = [
      buildCandidate({ agentId: "a1", score: 0.9, rating: 4.8, basePrice: 200 }),
      buildCandidate({ agentId: "a2", score: 0.85, rating: 4.6, basePrice: 250 }),
      buildCandidate({ agentId: "a3", score: 0.8, rating: 4.4, basePrice: 300 }),
      buildCandidate({ agentId: "a4", score: 0.75, rating: 4.2, basePrice: 1200 }),
    ];

    const vms = toEliminationViewModels(candidates);
    expect(vms).toHaveLength(1);
    expect(vms[0].eliminationReason.toLowerCase()).toContain("price");
  });

  it("derives a score-based elimination reason for low-score candidates", () => {
    const candidates = [
      buildCandidate({ agentId: "a1", score: 0.95, rating: 4.8 }),
      buildCandidate({ agentId: "a2", score: 0.90, rating: 4.6 }),
      buildCandidate({ agentId: "a3", score: 0.85, rating: 4.4 }),
      buildCandidate({ agentId: "a4", score: 0.40, rating: 4.8, basePrice: 100 }),
    ];

    const vms = toEliminationViewModels(candidates);
    expect(vms[0].eliminationReason.toLowerCase()).toContain("score");
  });

  it("derives multi-signal elimination reason when multiple signals are weak", () => {
    const candidates = [
      buildCandidate({ agentId: "a1", score: 0.95, rating: 4.8 }),
      buildCandidate({ agentId: "a2", score: 0.90, rating: 4.6 }),
      buildCandidate({ agentId: "a3", score: 0.85, rating: 4.4 }),
      buildCandidate({
        agentId: "a4",
        score: 0.40,
        rating: 3.2,
        relevance: 0.3,
        basePrice: 1500,
      }),
    ];

    const vms = toEliminationViewModels(candidates);
    const reason = vms[0].eliminationReason.toLowerCase();
    // Should mention at least two signals
    const signalCount = [
      reason.includes("score"),
      reason.includes("rating"),
      reason.includes("relevance"),
      reason.includes("price"),
    ].filter(Boolean).length;

    expect(signalCount).toBeGreaterThanOrEqual(2);
  });

  it("does not leak index-signature fields from Candidate into the view-model", () => {
    const candidates = [
      buildCandidate({ agentId: "a1" }),
      buildCandidate({ agentId: "a2" }),
      buildCandidate({ agentId: "a3" }),
      buildCandidate({ agentId: "a4", _unknownField: "should-not-appear" } as unknown as Candidate),
    ];

    const vms = toEliminationViewModels(candidates);
    const keys = Object.keys(vms[0]);
    expect(keys).not.toContain("_unknownField");
    expect(keys).not.toContain("services");
    expect(keys).not.toContain("embedding");
  });
});

// ---------------------------------------------------------------------------
// Finalist showdown adapters
// ---------------------------------------------------------------------------

describe("toFinalistShowdownViewModels", () => {
  const makeSelectedCandidate = (id: string, name: string) => ({
    candidate: buildCandidate({ agentId: id, name }),
    reasoning: `${name} was selected for strong performance`,
    matchScore: 85,
  });

  const makeOutcome = (
    candidateId: string,
    overrides: Partial<NegotiationOutcomeTransport> = {},
  ): NegotiationOutcomeTransport => ({
    negotiationId: `neg-${candidateId}`,
    candidateId,
    status: "completed",
    result: {
      id: `result-${candidateId}`,
      negotiationId: `neg-${candidateId}`,
      proposedBy: "buyer",
      status: "accepted",
      finalPrice: 450,
      createdAt: "2026-03-01T00:00:00.000Z",
      responseMessage: "Accepted the proposal.",
    },
    summary: "Negotiation completed",
    ...overrides,
  });

  it("maps top-3 to finalist view-models with pitch text from negotiation data", () => {
    const top3 = [
      makeSelectedCandidate("a1", "Alpha Repairs"),
      makeSelectedCandidate("a2", "Beta Services"),
      makeSelectedCandidate("a3", "Gamma Works"),
    ];
    const outcomes = [makeOutcome("a1"), makeOutcome("a2"), makeOutcome("a3")];

    const vms = toFinalistShowdownViewModels(top3, outcomes, null);

    expect(vms).toHaveLength(3);
    expect(vms[0].agentId).toBe("a1");
    expect(vms[0].rank).toBe(1);
    expect(vms[0].pitchText).toContain("$450");
    expect(vms[0].pitchText).toContain("Accepted the proposal");
    expect(vms[0].evaluationNotes).toBe(""); // no winner response
  });

  it("produces graceful fallback pitch text when negotiation fields are missing", () => {
    const top3 = [
      makeSelectedCandidate("a1", "Alpha Repairs"),
    ];
    // Outcome with no result
    const outcomes: NegotiationOutcomeTransport[] = [
      {
        negotiationId: "neg-a1",
        candidateId: "a1",
        status: "failed",
        summary: "provider timeout",
      },
    ];

    const vms = toFinalistShowdownViewModels(top3, outcomes, null);
    expect(vms[0].pitchText).toBe("Awaiting pitch...");
  });

  it("includes evaluation notes from winner response comparison data", () => {
    const top3 = [makeSelectedCandidate("a1", "Alpha Repairs")];
    const outcomes = [makeOutcome("a1")];
    const winnerResponse: SelectWinnerResponse = {
      winner: { candidateId: "a1", reasoning: "Best overall", confidence: 0.92 },
      comparison: [
        {
          candidateId: "a1",
          strengths: ["fast turnaround", "great reviews"],
          weaknesses: ["higher price"],
          priorityAlignment: 0.88,
        },
      ],
      summary: "Alpha Repairs selected",
      meta: { mode: "live", llmProvider: "openai", fallbacksUsed: [], warnings: [] },
    };

    const vms = toFinalistShowdownViewModels(top3, outcomes, winnerResponse);
    expect(vms[0].evaluationNotes).toContain("fast turnaround");
    expect(vms[0].evaluationNotes).toContain("higher price");
    expect(vms[0].evaluationNotes).toContain("88% priority alignment");
  });

  it("does not leak index-signature fields from Candidate into showdown view-model", () => {
    const top3 = [{
      candidate: buildCandidate({
        agentId: "a1",
        name: "Alpha",
        _unknownField: "should-not-appear",
      } as unknown as Candidate),
      reasoning: "Selected",
      matchScore: 90,
    }];

    const vms = toFinalistShowdownViewModels(top3, [], null);
    const keys = Object.keys(vms[0]);
    expect(keys).not.toContain("_unknownField");
    expect(keys).not.toContain("services");
    expect(keys).not.toContain("embedding");
  });
});

// ---------------------------------------------------------------------------
// Negotiation thread adapter
// ---------------------------------------------------------------------------

describe("toNegotiationThreadViewModel", () => {
  it("maps a happy-path response with messages", () => {
    const response: NegotiationDetailResponse = {
      negotiation: {
        id: "neg-1",
        buyerAgentId: "buyer-1",
        providerAgentId: "provider-1",
        status: "completed",
        currentTurn: "buyer",
        createdAt: "2026-03-01T10:00:00.000Z",
        updatedAt: "2026-03-01T12:00:00.000Z",
      },
      messages: [
        {
          id: "msg-1",
          negotiationId: "neg-1",
          sender: "buyer-1",
          senderType: "buyer",
          content: "Can you do $400?",
          messageType: "proposal",
          createdAt: "2026-03-01T10:05:00.000Z",
        },
        {
          id: "msg-2",
          negotiationId: "neg-1",
          sender: "provider-1",
          senderType: "provider",
          content: "I can do $450.",
          messageType: "message",
          createdAt: "2026-03-01T10:10:00.000Z",
        },
      ],
    };

    const vm = toNegotiationThreadViewModel(response);

    expect(vm.negotiationId).toBe("neg-1");
    expect(vm.status).toBe("completed");
    expect(vm.messages).toHaveLength(2);
    expect(vm.messages[0].senderType).toBe("buyer");
    expect(vm.messages[1].content).toBe("I can do $450.");
  });

  it("maps a response with empty messages array", () => {
    const response: NegotiationDetailResponse = {
      negotiation: {
        id: "neg-2",
        buyerAgentId: "buyer-1",
        providerAgentId: "provider-1",
        status: "active",
        currentTurn: "provider",
        createdAt: "2026-03-01T10:00:00.000Z",
        updatedAt: "2026-03-01T10:00:00.000Z",
      },
      messages: [],
    };

    const vm = toNegotiationThreadViewModel(response);
    expect(vm.messages).toEqual([]);
    expect(vm.status).toBe("active");
  });

  it("normalises Date-as-string createdAt from JSON payload", () => {
    const response: NegotiationDetailResponse = {
      negotiation: {
        id: "neg-3",
        buyerAgentId: "buyer-1",
        providerAgentId: "provider-1",
        status: "completed",
        currentTurn: "buyer",
        createdAt: "2026-03-01T10:00:00.000Z",
        updatedAt: "2026-03-01T12:00:00.000Z",
      },
      messages: [
        {
          id: "msg-1",
          negotiationId: "neg-3",
          sender: "buyer-1",
          senderType: "buyer",
          content: "Hello",
          messageType: "message",
          createdAt: "2026-03-01T10:05:00.000Z",
        },
      ],
    };

    const vm = toNegotiationThreadViewModel(response);
    expect(typeof vm.messages[0].createdAt).toBe("string");
    // Verify it's a valid ISO string
    expect(new Date(vm.messages[0].createdAt).toISOString()).toBe("2026-03-01T10:05:00.000Z");
  });
});

// ---------------------------------------------------------------------------
// Inspector artifact adapters
// ---------------------------------------------------------------------------

describe("toInspectorArtifacts", () => {
  it("builds real-source artifacts from search results and selection summary", () => {
    const candidates = [
      buildCandidate({ agentId: "a1", name: "Alpha", score: 0.9, relevance: 0.85 }),
    ];

    const artifacts = toInspectorArtifacts({
      searchResults: candidates,
      selectionSummary: "Top 3 selected based on score and rating.",
    });

    const rankingArtifact = artifacts.find((a) => a.kind === "ranking_signals");
    const shortlistArtifact = artifacts.find((a) => a.kind === "shortlist_reasoning");

    expect(rankingArtifact).toBeDefined();
    expect(rankingArtifact!.source).toBe("real");
    expect(rankingArtifact!.content).toContain("Alpha");

    expect(shortlistArtifact).toBeDefined();
    expect(shortlistArtifact!.source).toBe("real");
  });

  it("labels elimination rationale artifacts as inferred", () => {
    const candidates = Array.from({ length: 5 }, (_, i) =>
      buildCandidate({
        agentId: `a${i + 1}`,
        name: `Agent ${i + 1}`,
        score: 1 - i * 0.1,
      }),
    );

    const eliminationVMs = toEliminationViewModels(candidates);
    const artifacts = toInspectorArtifacts({ eliminationViewModels: eliminationVMs });

    const eliminationArtifact = artifacts.find((a) => a.kind === "elimination_rationale");
    expect(eliminationArtifact).toBeDefined();
    expect(eliminationArtifact!.source).toBe("inferred");
    expect(eliminationArtifact!.label).toContain("Inferred");
  });

  it("includes fallback warnings and decision comparison from real data", () => {
    const winnerResponse: SelectWinnerResponse = {
      winner: { candidateId: "a1", reasoning: "Best fit", confidence: 0.9 },
      comparison: [
        {
          candidateId: "a1",
          strengths: ["reliable"],
          weaknesses: ["expensive"],
          priorityAlignment: 0.85,
        },
      ],
      summary: "Winner selected",
      meta: { mode: "degraded", llmProvider: "mock", fallbacksUsed: ["mock_llm"], warnings: [] },
    };

    const artifacts = toInspectorArtifacts({
      warnings: ["Using mock LLM fallback"],
      winnerResponse,
    });

    const warningArtifact = artifacts.find((a) => a.kind === "fallback_warning");
    expect(warningArtifact).toBeDefined();
    expect(warningArtifact!.source).toBe("real");

    const comparisonArtifact = artifacts.find((a) => a.kind === "decision_comparison");
    expect(comparisonArtifact).toBeDefined();
    expect(comparisonArtifact!.source).toBe("real");
    expect(comparisonArtifact!.content).toContain("reliable");
  });

  it("returns empty array when no data is provided", () => {
    expect(toInspectorArtifacts({})).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Winner verdict mapping extensions
// ---------------------------------------------------------------------------

describe("winner verdict view-model edge cases", () => {
  it("handles winner response with missing comparison entries gracefully", () => {
    const winnerResponse: SelectWinnerResponse = {
      winner: { candidateId: "a1", reasoning: "Only viable candidate", confidence: 0.6 },
      comparison: [],
      summary: "Single candidate selected by default",
      meta: { mode: "live", llmProvider: "openai", fallbacksUsed: [], warnings: [] },
    };

    const artifacts = toInspectorArtifacts({ winnerResponse });
    const comparisonArtifact = artifacts.find((a) => a.kind === "decision_comparison");

    // Comparison artifact should still exist but with empty content
    expect(comparisonArtifact).toBeDefined();
    expect(comparisonArtifact!.content).toBe("");
  });
});
