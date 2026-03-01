import { NextRequest, NextResponse } from 'next/server';
import { TransportNegotiationResult } from '@/features/agents/negotiation/types';
import { selectWinner } from '@/features/agents/selection/selectWinner';
import { NegotiationResult } from '@/features/agents/negotiation/types/NegotiationResult';
import { SelectWinnerRequestSchema } from '@/features/shared/schemas/WorkflowSchemas';
import {
  isMockLlmFallbackAllowed,
  mergeExecutionMeta,
  resolveLlmProvider,
} from '@/features/workflow/server/runtime';

function toDomainNegotiationResult(
  result: TransportNegotiationResult,
): NegotiationResult {
  return {
    id: result.id,
    negotiationId: result.negotiationId,
    proposedBy: result.proposedBy,
    status: result.status,
    finalPrice: result.finalPrice,
    scope: result.scope
      ? {
          description: result.scope.description,
          rooms: result.scope.rooms,
          details: result.scope.details,
        }
      : undefined,
    createdAt: new Date(result.createdAt),
    respondedAt: result.respondedAt ? new Date(result.respondedAt) : undefined,
    responseMessage: result.responseMessage,
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validated = SelectWinnerRequestSchema.safeParse(rawBody);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validated.error.format() },
        { status: 400 },
      );
    }

    const { negotiations, userPreferences, providerType } = validated.data;
    const llm = resolveLlmProvider(providerType);

    const domainNegotiations = negotiations.map((item) => ({
      candidateId: item.candidateId,
      result: toDomainNegotiationResult(item.result),
    }));

    let result;
    let winnerMeta = llm.meta;

    try {
      result = await selectWinner(
        domainNegotiations,
        userPreferences,
        { providerType: llm.providerType },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown winner selection failure';

      if (llm.providerType !== 'mock' && isMockLlmFallbackAllowed()) {
        result = await selectWinner(
          domainNegotiations,
          userPreferences,
          { providerType: 'mock' },
        );
        winnerMeta = {
          mode: 'degraded',
          llmProvider: 'mock',
          fallbacksUsed: ['mock_llm'],
          warnings: [
            `Primary ${llm.providerType} winner selection failed: ${message}`,
            'Using mock LLM fallback for winner selection.',
          ],
        };
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      ...result,
      meta: mergeExecutionMeta(winnerMeta),
    });
  } catch (error) {
    console.error('Select winner error:', error);
    const message = error instanceof Error ? error.message : 'Failed to select winner';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
