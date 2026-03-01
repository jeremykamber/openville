import { describe, expect, it } from "vitest";

import {
  buildSelectWinnerRequest,
  buildWorkflowContext,
  createContextFormValues,
  toSearchResultsViewModel,
} from "@/features/workflow/client/adapters";
import type { SearchAndSelectResponse, WorkflowContextFormValues } from "@/features/workflow/client/types";

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
