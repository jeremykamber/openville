import { NextRequest, NextResponse } from "next/server";

import { runNegotiations } from "@/features/agents/negotiation/runNegotiations";
import type {
  NegotiationOutcomeTransport,
  TransportNegotiationResult,
} from "@/features/agents/negotiation/types";
import { selectWinner } from "@/features/agents/selection/selectWinner";
import { RunAllWorkflowRequestSchema } from "@/features/shared/schemas/WorkflowSchemas";
import type {
  RunAllWorkflowResponse,
  SelectWinnerResponse,
} from "@/features/workflow/client/types";
import { executeSearchAndSelect } from "@/features/workflow/server/executeSearchAndSelect";
import {
  mergeExecutionMeta,
  getConfiguredLlmProvider,
  resolveConfiguredLlmModel,
} from "@/features/workflow/server/runtime";
import type { NegotiationResult } from "@/features/agents/negotiation/types";

type RunAllStageTimingsMs = {
  total: number;
  search: number;
  negotiation?: number;
  winner?: number;
};

function nowMs(): number {
  return performance.now();
}

function roundDurationMs(startMs: number, endMs: number): number {
  return Math.round((endMs - startMs) * 100) / 100;
}

function includeDebugTimings(request: NextRequest): boolean {
  return request.headers.get("x-openville-debug") === "timings";
}

function withDebugTimings(
  response: RunAllWorkflowResponse,
  timingsMs: RunAllStageTimingsMs,
  debugEnabled: boolean,
): RunAllWorkflowResponse {
  if (!debugEnabled) {
    return response;
  }

  return {
    ...response,
    debug: {
      timingsMs,
    },
  };
}

function resolveStrictProviderType(requested?: "openai" | "openrouter" | "mock") {
  const configured = requested ?? getConfiguredLlmProvider();

  if (configured === "unconfigured") {
    throw new Error("No live LLM provider is configured for run-all.");
  }

  if (configured === "mock") {
    throw new Error("Mock LLM fallback is disabled for run-all.");
  }

  return configured;
}

function toTransportOutcomes(
  outcomes: Awaited<ReturnType<typeof runNegotiations>>,
): NegotiationOutcomeTransport[] {
  return outcomes.map((outcome) => ({
    ...outcome,
    result: outcome.result
      ? {
          ...outcome.result,
          createdAt: outcome.result.createdAt.toISOString(),
          respondedAt: outcome.result.respondedAt?.toISOString(),
        }
      : undefined,
  }));
}

function getNegotiationMeta(providerType?: "openai" | "openrouter" | "mock") {
  const provider = resolveStrictProviderType(providerType);

  return {
    meta: mergeExecutionMeta(
      {
        mode: "live",
        llmProvider: provider,
        model: resolveConfiguredLlmModel(provider),
        fallbacksUsed: [],
        warnings: [],
      },
    ),
  };
}

function getWinnerInputs(
  outcomes: NegotiationOutcomeTransport[],
): Array<{ candidateId: string; result: TransportNegotiationResult }> {
  return outcomes.flatMap((outcome) => {
    if (!outcome.result || !outcome.negotiationId) {
      return [];
    }

    return [
      {
        candidateId: outcome.candidateId,
        result: outcome.result,
      },
    ];
  });
}

function toDomainNegotiationResult(
  result: TransportNegotiationResult,
): NegotiationResult {
  return {
    ...result,
    scope: result.scope
      ? {
          description: result.scope.description,
          rooms: result.scope.rooms,
          ...(result.scope.details ?? {}),
        }
      : undefined,
    createdAt: new Date(result.createdAt),
    respondedAt: result.respondedAt ? new Date(result.respondedAt) : undefined,
  };
}

function buildNoWinnerResponse(
  base: Omit<RunAllWorkflowResponse, "meta" | "completionState">,
  warning: string,
): RunAllWorkflowResponse {
  const negotiationMeta = base.stageMeta.negotiation;

  return {
    ...base,
    meta: mergeExecutionMeta(
      base.stageMeta.search,
      negotiationMeta,
      {
        mode: "degraded",
        warnings: [warning],
      },
    ),
    completionState: "negotiation_only_no_winner",
  };
}

export async function POST(request: NextRequest) {
  const startedAt = nowMs();
  const debugEnabled = includeDebugTimings(request);
  const timingsMs: RunAllStageTimingsMs = {
    total: 0,
    search: 0,
  };

  try {
    const rawBody = await request.json();
    const validated = RunAllWorkflowRequestSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid workflow request", details: validated.error.format() },
        { status: 400 },
      );
    }

    const body = validated.data;
    const searchStartedAt = nowMs();
    const searchResponse = await executeSearchAndSelect(
      {
        query: body.query,
        userPreferences: body.userPreferences,
        scope: body.scope,
        limit: body.limit,
      },
      { providerType: body.providerType },
    );
    timingsMs.search = roundDurationMs(searchStartedAt, nowMs());

    const baseResponse = {
      searchResults: searchResponse.searchResults,
      selectionResult: searchResponse.selectionResult,
      negotiationOutcomes: [],
      winnerResult: null,
      stageMeta: {
        search: searchResponse.meta,
      },
    } satisfies Omit<RunAllWorkflowResponse, "meta" | "completionState">;

    if (!searchResponse.selectionResult) {
      timingsMs.total = roundDurationMs(startedAt, nowMs());
      return NextResponse.json(
        withDebugTimings(
          {
            ...baseResponse,
            meta: mergeExecutionMeta(searchResponse.meta),
            completionState: "search_only",
          } satisfies RunAllWorkflowResponse,
          timingsMs,
          debugEnabled,
        ),
      );
    }

    const negotiationProvider = resolveStrictProviderType(body.providerType);
    const { meta: negotiationMeta } = getNegotiationMeta(body.providerType);
    const negotiationStartedAt = nowMs();
    const negotiationOutcomes = toTransportOutcomes(
      await runNegotiations({
        buyerAgentId: body.buyerAgentId,
        candidates: searchResponse.selectionResult.top3,
        preferences: body.userPreferences,
        scope: body.scope,
        jobId: body.jobId,
        providerType: negotiationProvider,
        maxRounds: body.maxRounds,
      }),
    );
    timingsMs.negotiation = roundDurationMs(negotiationStartedAt, nowMs());

    const withNegotiations = {
      ...baseResponse,
      negotiationOutcomes,
      stageMeta: {
        ...baseResponse.stageMeta,
        negotiation: negotiationMeta,
      },
    } satisfies Omit<RunAllWorkflowResponse, "meta" | "completionState">;

    const winnerInputs = getWinnerInputs(negotiationOutcomes);

    if (winnerInputs.length === 0) {
      timingsMs.total = roundDurationMs(startedAt, nowMs());
      return NextResponse.json(
        withDebugTimings(
          buildNoWinnerResponse(
            withNegotiations,
            "Negotiations completed, but no valid winner input remained for selection.",
          ),
          timingsMs,
          debugEnabled,
        ),
      );
    }

    const winnerProvider = resolveStrictProviderType(body.providerType);
    let winnerResult: SelectWinnerResponse;
    const winnerStartedAt = nowMs();

    try {
      const result = await selectWinner(
        winnerInputs.map((item) => ({
          candidateId: item.candidateId,
          result: toDomainNegotiationResult(item.result),
        })),
        body.userPreferences,
        { providerType: winnerProvider },
      );

      winnerResult = {
        ...result,
        meta: mergeExecutionMeta({
          mode: "live",
          llmProvider: winnerProvider,
          model: resolveConfiguredLlmModel(winnerProvider),
          fallbacksUsed: [],
          warnings: [],
        }),
      };
      timingsMs.winner = roundDurationMs(winnerStartedAt, nowMs());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown winner selection failure";
      console.error("Run-all winner selection error:", error);
      timingsMs.winner = roundDurationMs(winnerStartedAt, nowMs());
      timingsMs.total = roundDurationMs(startedAt, nowMs());
      return NextResponse.json(
        withDebugTimings(
          {
            ...withNegotiations,
            meta: mergeExecutionMeta(
              searchResponse.meta,
              negotiationMeta,
              {
                mode: "degraded",
                warnings: [`Winner selection failed: ${message}`],
              },
            ),
            completionState: "partial_failure",
          } satisfies RunAllWorkflowResponse,
          timingsMs,
          debugEnabled,
        ),
      );
    }

    timingsMs.total = roundDurationMs(startedAt, nowMs());
    return NextResponse.json(
      withDebugTimings(
        {
          ...withNegotiations,
          winnerResult,
          meta: mergeExecutionMeta(
            searchResponse.meta,
            negotiationMeta,
            winnerResult.meta,
          ),
          stageMeta: {
            ...withNegotiations.stageMeta,
            winner: winnerResult.meta,
          },
          completionState: "completed",
        } satisfies RunAllWorkflowResponse,
        timingsMs,
        debugEnabled,
      ),
    );
  } catch (error) {
    console.error("Run-all workflow error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
