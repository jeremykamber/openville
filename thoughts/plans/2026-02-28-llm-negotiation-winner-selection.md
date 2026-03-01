# LLM Reasoner for Negotiation Winner Selection Implementation Plan

## Overview

Implement an LLM reasoner that compares negotiation outcomes from completed negotiations, applies human priorities, and selects the winning candidate with detailed reasoning. This builds on the existing negotiation system by adding the final selection step using structured LLM output similar to the top-3 selection pattern.

## Current State Analysis

- **Negotiation System**: `runNegotiations.ts` executes negotiations with multiple candidates using LLM buyer/provider agents, returning `NegotiationOutcome[]` with basic status and summary
- **Outcome Storage**: Negotiations stored in database with messages, but outcomes lack detailed pricing/compromise data
- **Existing Selection**: `selectTop3.ts` uses LLM with structured output to select top 3 candidates based on priorities
- **Missing Component**: No winner selection after negotiations complete - currently planned but rule-based in `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md`
- **API Gap**: `/api/agents/select-winner` endpoint not implemented

## Desired End State

Three-phase flow works end-to-end:
1. `runNegotiations` produces detailed `NegotiationResult[]` with pricing, compromises, and refined scope
2. LLM reasoner compares all negotiation results using priority-aware structured output
3. Winner selected with comprehensive reasoning explaining why one candidate beats others

### Key Discoveries

- `runNegotiations.ts:23-58` - Current negotiation execution returns basic outcomes
- `negotiate.ts:142-187` - `proposeNegotiationResult` creates detailed NegotiationResult with final pricing
- `selectTop3.ts:21-61` - LLM selection pattern using structured output with reasoning
- `features/search/services/ranking.ts:11-54` - Priority-based scoring patterns for comparison
- `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md:591-623` - Planned rule-based winner selection

## What We're NOT Doing

- Changing existing negotiation message flow or LLM provider usage
- Modifying top-3 selection logic
- Adding new database tables or major schema changes
- Implementing multi-turn winner selection (single LLM call)

## Implementation Approach

1. **Extend Negotiation Results**: Modify `runNegotiations` to complete negotiations with proposal results
2. **LLM Winner Selection**: Create `selectWinner` function using LLM with structured output schema
3. **API Integration**: Implement `/api/agents/select-winner` endpoint
4. **Testing & Verification**: Ensure priority application and reasoning quality

## SOLID Analysis

### S (Single Responsibility)
- **selectWinner function**: Gets single responsibility for LLM-based winner selection from negotiation results
- **runNegotiations**: Extends to include proposal completion while maintaining negotiation execution responsibility
- **API endpoint**: Handles winner selection HTTP requests separately from negotiation logic

### O (Open/Closed)
- **LLM Provider Abstraction**: `createChatModel` factory allows adding new LLM providers without modifying selection logic
- **Structured Output Schema**: `SelectWinnerLLMSchema` can be extended with new comparison criteria without changing core LLM call

### L (Liskov Substitution)
- **ChatModel Interface**: Different LLM implementations (OpenAI, OpenRouter) can be substituted in winner selection
- **NegotiationResult Interface**: Can be extended with new fields while maintaining compatibility with selection logic

### I (Interface Segregation)
- **SelectWinnerOptions**: Optional interface with provider/temperature settings, no forced parameters
- **WinnerSelectionResponse**: Focused interface with winner ID and reasoning, no unnecessary fields

### D (Dependency Inversion)
- **LLM Provider**: Selection logic depends on ChatModel abstraction, not concrete OpenAI/OpenRouter implementations
- **Repository Pattern**: Negotiation data access abstracted through NegotiationRepository interface

## Phase 1: Extend Negotiation Results

### Overview

Modify `runNegotiations` to complete negotiations with proposal results instead of just starting them, producing detailed `NegotiationResult[]` for comparison.

### Changes Required

#### 1. Update runNegotiations.ts

**File**: `features/agents/negotiation/runNegotiations.ts`
**Changes**: Import NegotiationResult, modify to complete negotiations with proposals

```typescript
import { NegotiationResult } from './types/NegotiationResult';
import { proposeNegotiationResult } from './negotiate';

export interface NegotiationOutcome {
  negotiationId: string;
  candidateId: string;
  status: 'completed' | 'cancelled' | 'failed' | NegotiationStatus;
  result?: NegotiationResult; // Add detailed result
  summary?: string;
}

export async function runNegotiations(
  options: RunNegotiationsOptions
): Promise<NegotiationOutcome[]> {
  // ... existing code ...
  
  for (const selected of candidates) {
    try {
      const negotiation = await startNegotiation(/* ... */);
      
      // Complete negotiation with proposal
      const proposalResult = await proposeNegotiationResult(
        negotiation.id,
        negotiation.buyerAgentId, // Or determine proposer based on logic
        selected.finalPrice || scope.estimatedPrice || 500, // Need to determine final price
        scope
      );
      
      outcomes.push({
        negotiationId: negotiation.id,
        candidateId: selected.candidate.agentId,
        status: negotiation.status,
        result: proposalResult.accepted ? proposalResult.result : undefined,
        summary: proposalResult.response,
      });
    } catch (error) {
      // ... existing error handling ...
    }
  }
  
  return outcomes;
}
```

### Success Criteria

#### Automated Verification
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Negotiation outcomes include NegotiationResult when accepted
- [ ] Failed negotiations still return proper error outcomes

#### Manual Verification
- [ ] Test negotiation completion produces detailed results

## Phase 2: LLM Winner Selection Function

### Overview

Create `selectWinner` function that uses LLM to compare negotiation results and select winner based on priorities, following the established pattern from `selectTop3`.

### Changes Required

#### 1. Winner Selection Schema

**File**: `features/agents/reasoning/schemas/WinnerSchemas.ts`
**Changes**: Create Zod schema for winner selection LLM response

```typescript
import { z } from 'zod';

export const SelectWinnerLLMResponseSchema = z.object({
  winner: z.object({
    candidateId: z.string(),
    reasoning: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  comparison: z.array(z.object({
    candidateId: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    priorityAlignment: z.number().min(0).max(1),
  })),
  summary: z.string(),
});

export type SelectWinnerLLMResponse = z.infer<typeof SelectWinnerLLMResponseSchema>;
```

#### 2. Winner Selection Function

**File**: `features/agents/selection/selectWinner.ts`
**Changes**: Create LLM-based winner selection similar to selectTop3

```typescript
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createChatModel } from '../reasoning/providers';
import { NegotiationResult, UserPreferences } from './types';
import { SELECT_WINNER_SYSTEM_PROMPT, buildWinnerSelectionPrompt } from '../reasoning/prompts/winnerPrompts';
import { SelectWinnerLLMResponseSchema } from '../reasoning/schemas/WinnerSchemas';

export interface SelectWinnerOptions {
  providerType?: 'openai' | 'openrouter' | 'mock';
  temperature?: number;
}

export interface WinnerSelectionResponse {
  winner: {
    candidateId: string;
    reasoning: string;
    confidence: number;
  };
  comparison: Array<{
    candidateId: string;
    strengths: string[];
    weaknesses: string[];
    priorityAlignment: number;
  }>;
  summary: string;
}

export async function selectWinner(
  negotiations: NegotiationResult[],
  preferences: UserPreferences,
  options: SelectWinnerOptions = {}
): Promise<WinnerSelectionResponse> {
  if (negotiations.length === 0) {
    throw new Error('At least one negotiation result required');
  }

  const model = createChatModel(options.providerType ?? 'openai');
  const userPrompt = buildWinnerSelectionPrompt(negotiations, preferences);

  const structuredOutput = model.withStructuredOutput(SelectWinnerLLMResponseSchema, {
    temperature: options.temperature ?? 0.3, // Lower temperature for more consistent selection
  });

  const llmResponse = await structuredOutput([
    new SystemMessage(SELECT_WINNER_SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  // Validate winner exists in negotiations
  const winnerExists = negotiations.some(n => n.candidateId === llmResponse.winner.candidateId);
  if (!winnerExists) {
    throw new Error(`Selected winner ${llmResponse.winner.candidateId} not found in negotiations`);
  }

  return llmResponse;
}
```

#### 3. Winner Selection Prompts

**File**: `features/agents/reasoning/prompts/winnerPrompts.ts`
**Changes**: Create prompts for winner selection

```typescript
import { NegotiationResult, UserPreferences } from '../../selection/types';

export const SELECT_WINNER_SYSTEM_PROMPT = `You are an expert negotiator analyzing completed negotiation outcomes to select the best candidate for a client.

Compare negotiation results based on:
- Final pricing and discounts offered
- Scope compromises and refinements made
- Alignment with client's stated priorities
- Overall value proposition

Select the winning candidate with detailed reasoning comparing all options.`;

export function buildWinnerSelectionPrompt(
  negotiations: NegotiationResult[],
  preferences: UserPreferences
): string {
  return `Client Priorities:
- Budget: ${preferences.budget ?? 'Not specified'}
- Priority: ${preferences.priority ?? 'Balanced approach'}
- Deal Breakers: ${preferences.dealBreakers?.join(', ') ?? 'None specified'}

Completed Negotiations:
${negotiations.map((n, i) => `Candidate ${i + 1} (ID: ${n.candidateId}):
- Final Price: $${n.finalPrice ?? 'Not agreed'}
- Status: ${n.status}
- Proposed Scope: ${n.scope?.description ?? 'Original scope'}
- Response: ${n.responseMessage ?? 'No response'}
- Created: ${n.createdAt.toISOString()}
`).join('\n')}

Compare these negotiation outcomes and select the winner that best serves the client's priorities. Provide detailed reasoning for why this candidate wins over the others, including specific strengths and weaknesses of each option.`;
}
```

### Success Criteria

#### Automated Verification
- [ ] LLM response validates against schema
- [ ] Winner candidate exists in input negotiations
- [ ] TypeScript compiles: `npm run build`

#### Manual Verification
- [ ] Test with sample negotiations produces valid winner selection
- [ ] Priority weighting affects selection appropriately

## Phase 3: API Endpoint Implementation

### Overview

Create `/api/agents/select-winner` endpoint following existing API patterns.

### Changes Required

#### 1. Select Winner API Route

**File**: `app/api/agents/select-winner/route.ts`
**Changes**: Create POST endpoint for winner selection

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { selectWinner } from '@/features/agents/selection/selectWinner';
import { NegotiationResult, UserPreferences } from '@/features/agents/selection/types';

interface SelectWinnerRequest {
  negotiations: NegotiationResult[];
  userPreferences: UserPreferences;
  providerType?: 'openai' | 'openrouter' | 'mock';
}

export async function POST(request: NextRequest) {
  try {
    const body: SelectWinnerRequest = await request.json();
    const { negotiations, userPreferences, providerType } = body;
    
    const result = await selectWinner(negotiations, userPreferences, { providerType });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Select winner error:', error);
    return NextResponse.json(
      { error: 'Failed to select winner' },
      { status: 500 }
    );
  }
}
```

### Success Criteria

#### Automated Verification
- [ ] API compiles: `npm run build`
- [ ] Endpoint responds with correct status codes

#### Manual Verification
- [ ] POST request with negotiation data returns winner selection
- [ ] Error handling for invalid inputs

## Phase 4: Testing & Verification

### Overview

Test the complete flow and verify LLM reasoning quality.

### Changes Required

#### 1. Unit Tests

**File**: `features/agents/selection/__tests__/selectWinner.test.ts`
**Changes**: Add tests for winner selection logic

```typescript
describe('selectWinner', () => {
  it('selects winner from negotiation results', async () => {
    const negotiations: NegotiationResult[] = [
      {
        candidateId: 'agent-1',
        finalPrice: 450,
        status: 'accepted',
        responseMessage: 'Agreed to $450 with flexible scheduling',
        createdAt: new Date(),
      },
      {
        candidateId: 'agent-2', 
        finalPrice: 500,
        status: 'accepted',
        responseMessage: 'Standard $500 price',
        createdAt: new Date(),
      },
    ];
    
    const preferences: UserPreferences = { priority: 'cost' };
    
    const result = await selectWinner(negotiations, preferences);
    
    expect(result.winner).toBeDefined();
    expect(result.winner.candidateId).toBe('agent-1'); // Should prefer lower price for cost priority
    expect(result.comparison).toHaveLength(2);
  });
});
```

### Success Criteria

#### Automated Verification
- [ ] Unit tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] TypeScript compiles: `npm run build`

#### Manual Verification
- [ ] End-to-end test: runNegotiations → selectWinner produces valid winner
- [ ] Priority testing: Different priorities produce different winners
- [ ] Reasoning quality: LLM provides detailed, logical explanations

## Testing Strategy

### Unit Tests
- Winner selection with different priority settings
- Schema validation for LLM responses
- Error handling for invalid inputs
- Mock provider testing

### Integration Tests
- Full negotiation → winner selection flow
- API endpoint integration
- Priority alignment verification

### Manual Testing Steps
1. Create sample negotiation results with different outcomes
2. Test selectWinner with cost priority - should favor lower price
3. Test with quality priority - should favor better compromises
4. Verify reasoning explains priority alignment
5. Test API endpoint with real LLM calls

## Success Criteria

- [ ] LLM reasoner successfully compares negotiation outcomes
- [ ] Human priorities correctly influence winner selection
- [ ] Detailed reasoning provided for selection decisions
- [ ] API endpoint integrates with existing negotiation flow
- [ ] All automated tests pass
- [ ] Manual testing confirms reasoning quality