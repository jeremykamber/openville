# Agent Reasoning & Negotiation Implementation Plan

## Overview

Implement Dev 3: Agent Reasoning & Negotiation module that handles Steps 5-7 of the user flow. The module takes top 10 candidates from search, applies human priorities to narrow to top 3, runs agent-to-agent negotiation, and makes a final selection.

**Key Design Decision**: Create an LLM abstraction layer that can defer the provider choice, with rule-based mocks for MVP that can be upgraded to LangGraph-powered LLM agents later.

## Current State Analysis

- `features/agents/selection/types/Candidate.ts` - Type definition exists
- `features/agents/api/`, `features/agents/reasoning/`, `features/agents/negotiation/` - Empty directories scaffolded
- No API routes exist (`app/api/agents/` needs creation)
- No LLM SDKs installed (LangGraph will be added)
- Next.js 16 App Router project with TypeScript

## Desired End State

Three API endpoints that form the Agent Reasoning & Negotiation module:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/agents/select-top3` | LLM reasoner takes top 10, applies human priorities, narrows to top 3 |
| `POST /api/agents/negotiate` | Run negotiation with each candidate |
| `POST /api/agents/select-winner` | Compare negotiation outcomes, select winner |

### Key Discoveries

- `context/responsbilities.md:51-78` - Dev 3 specification
- `context/user_flow.md:25-27` - Step 5 description
- LangGraph.js is the recommended orchestration framework per research

## What We're NOT Doing

- Actual LLM provider integration (deferred via abstraction layer)
- Real RAG integration (will receive candidates from search API)
- Database persistence (in-memory for MVP)
- Streaming responses (future enhancement)

## Implementation Approach

1. **LLM Abstraction Layer** - Interface-driven design that allows swapping providers
2. **LangGraph Architecture** - Graph-based workflow for negotiation loops
3. **Rule-based Mocks** - Simple deterministic logic for MVP tradesperson responses
4. **API Routes** - Next.js App Router handlers in `app/api/agents/`

## Phase 1: Foundation & Types

### Overview

Set up the core type definitions, LLM abstraction interfaces, and module structure.

### Changes Required

#### 1. Shared Types

**File**: `features/shared/types/AgentReasoning.ts`
**Changes**: Create core types for the module

```typescript
// User preferences structure
export interface UserPreferences {
  budget?: number;
  priority?: 'cost' | 'quality' | 'speed' | 'rating';
  dealBreakers?: string[];
  preferredQualifications?: string[];
}

// Negotiation result from tradesperson
export interface NegotiationResult {
  candidateId: string;
  discount: number | null;
  compromises: string[];
  refinedScope: Record<string, any>;
  responseMessage: string;
}

// Final selection result
export interface SelectionResult {
  selectedAgentId: string;
  reasoning: string;
  scoreBreakdown: Record<string, number>;
}

// LLM Provider interface (abstraction)
export interface LLMProvider {
  complete(prompt: string, schema?: z.ZodSchema): Promise<any>;
}

// State for LangGraph negotiation graph
export interface NegotiationState {
  candidates: Candidate[];
  negotiations: NegotiationResult[];
  currentCandidateIndex: number;
  userPreferences: UserPreferences;
  scope: Record<string, any>;
}
```

#### 2. Update Candidate Type

**File**: `features/agents/selection/types/Candidate.ts`
**Changes**: Add missing fields

```typescript
export interface Candidate {
  agentId: string;
  name: string;
  score: number;
  relevance: number;
  successCount: number;
  rating: number;
  specialties?: string[];
  availability?: string;
  basePrice?: number;
  [key: string]: any;
}
```

### Success Criteria

#### Automated Verification:

- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Types are exported correctly from shared module
- [ ] New files follow existing code conventions

---

## Phase 2: LLM Abstraction Layer

### Overview

Create the interface-driven LLM abstraction that allows deferring the actual provider while enabling future LangGraph integration.

### Changes Required

#### 1. LLM Provider Interface

**File**: `features/agents/reasoning/providers/index.ts`
**Changes**: Create abstraction layer

```typescript
import { z } from 'zod';

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProvider {
  complete(
    messages: LLMMessage[],
    options?: {
      schema?: z.ZodSchema;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse>;
}

// Factory function to create provider
export type ProviderFactory = (config?: LLMConfig) => LLMProvider;

// Registry for provider selection
export const providerRegistry: Record<string, ProviderFactory> = {};

// Placeholder that logs prompts (for development)
export class NoOpProvider implements LLMProvider {
  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    console.log('[NoOp LLM] Prompt:', messages.map(m => m.content).join('\n'));
    return { content: '{}' };
  }
}
```

#### 2. Prompt Templates

**File**: `features/agents/reasoning/prompts/selection.ts`
**Changes**: Create prompt templates for reasoning

```typescript
import { Candidate, UserPreferences } from '@/features/shared/types/AgentReasoning';

export const SELECT_TOP3_SYSTEM_PROMPT = `You are an expert agent selector helping a human user find the best service provider.
Analyze candidates based on the human's priorities and select the top 3.
Consider: budget constraints, quality requirements, availability, and past performance.`;

export function buildSelectTop3Prompt(
  candidates: Candidate[],
  preferences: UserPreferences,
  scope: Record<string, any>
): string {
  return `${SELECT_TOP3_SYSTEM_PROMPT}

Human Priorities:
- Budget: ${preferences.budget ?? 'flexible'}
- Priority: ${preferences.priority ?? 'balanced'}
- Deal Breakers: ${preferences.dealBreakers?.join(', ') ?? 'none'}

Job Scope:
${JSON.stringify(scope, null, 2)}

Candidates (ranked by system):
${candidates.map((c, i) => `${i + 1}. ${c.name} (ID: ${c.agentId})
   - Relevance: ${c.relevance}, Score: ${c.score}
   - Success Rate: ${c.successCount} jobs, Rating: ${c.rating}/5
   - Base Price: ${c.basePrice ?? 'TBD'}`).join('\n')}

Select the top 3 candidates that best match the human's priorities.
Return JSON with format: { "top3": [{ "agentId": "string", "reason": "string" }] }`;
}

export const NEGOTIATION_SYSTEM_PROMPT = `You are a tradesperson's AI agent negotiating on behalf of your client.
Be reasonable but protect your client's interests.
Consider offering discounts for:
- Larger jobs
- Flexible timing
- Long-term relationships

Respond with: discount amount, potential compromises, and any scope refinements.`;
```

### Success Criteria

#### Automated Verification:

- [ ] Provider interface compiles
- [ ] NoOpProvider can be instantiated
- [ ] Prompt templates generate valid strings

---

## Phase 3: Rule-Based Mocks (MVP)

### Overview

Create deterministic mock implementations for tradesperson agents that can be replaced with LangGraph-powered agents later.

### Changes Required

#### 1. Tradesperson Agent Mocks

**File**: `features/agents/negotiation/mocks/tradesperson.ts`
**Changes**: Create rule-based mock agents

```typescript
import { NegotiationResult } from '@/features/shared/types/AgentReasoning';

interface MockTradespersonConfig {
  agentId: string;
  name: string;
  baseWillingness: number; // 0-1, how willing to discount
  flexibility: number;     // 0-1, how much room to negotiate
  personality: 'aggressive' | 'neutral' | 'cooperative';
}

const MOCK_TRADESPEOPLE: MockTradespersonConfig[] = [
  { agentId: 'tp-001', name: 'Joe\'s Plumbing', baseWillingness: 0.3, flexibility: 0.2, personality: 'neutral' },
  { agentId: 'tp-002', name: 'Quick Fix Electric', baseWillingness: 0.5, flexibility: 0.3, personality: 'cooperative' },
  { agentId: 'tp-003', name: 'Premium Home Services', baseWillingness: 0.1, flexibility: 0.1, personality: 'aggressive' },
  // ... more mock data
];

export class TradespersonAgentMock {
  constructor(private config: MockTradespersonConfig) {}

  async negotiate(
    scope: Record<string, any>,
    userPreferences: { budget?: number }
  ): Promise<NegotiationResult> {
    // Simple rule-based logic
    const basePrice = scope.estimatedPrice ?? 500;
    const budget = userPreferences.budget ?? basePrice;
    
    // Calculate potential discount
    const budgetGap = basePrice - budget;
    const maxDiscount = basePrice * this.config.baseWillingness;
    
    let discount = 0;
    if (budgetGap > 0 && budgetGap <= maxDiscount) {
      discount = budgetGap;
    } else if (budgetGap > maxDiscount) {
      discount = maxDiscount * this.config.flexibility;
    }

    // Generate compromises based on personality
    const compromises = this.generateCompromises(discount, basePrice);

    return {
      candidateId: this.config.agentId,
      discount: discount > 0 ? Math.round(discount) : null,
      compromises,
      refinedScope: { ...scope, finalPrice: basePrice - discount },
      responseMessage: this.generateResponse(discount, compromises),
    };
  }

  private generateCompromises(discount: number, basePrice: number): string[] {
    const comps: string[] = [];
    if (discount < basePrice * 0.1) {
      comps.push('Could offer bundled services at discount');
      comps.push('Flexible payment terms available');
    }
    return comps;
  }

  private generateResponse(discount: number, compromises: string[]): string {
    if (discount > 0) {
      return `We can offer a $${discount} discount. ${compromises.join('. ')}`;
    }
    return `Our price is competitive. ${compromises.join('. ')}`;
  }
}

export function getTradespersonMock(agentId: string): TradespersonAgentMock | null {
  const config = MOCK_TRADESPEOPLE.find(t => t.agentId === agentId);
  return config ? new TradespersonAgentMock(config) : null;
}
```

### Success Criteria

#### Automated Verification:

- [ ] Mock returns negotiation results
- [ ] Different personalities produce different results

---

## Phase 4: LangGraph Architecture (Foundation)

### Overview

Set up the LangGraph infrastructure that will power future LLM-driven agents. This creates the graph structure that can swap in real LLM providers later.

### Changes Required

#### 1. LangGraph State & Nodes

**File**: `features/agents/negotiation/graph.ts`
**Changes**: Create LangGraph state definition

```typescript
import { StateGraph, END } from '@langchain/langgraph';
import { Candidate, NegotiationResult, UserPreferences } from '@/features/shared/types/AgentReasoning';
import { getTradespersonMock } from './mocks/tradesperson';

interface AgentSelectionState {
  top10Candidates: Candidate[];
  top3Candidates: Candidate[];
  negotiations: NegotiationResult[];
  selectedAgentId: string | null;
  reasoning: string;
  userPreferences: UserPreferences;
  scope: Record<string, any>;
  errors: string[];
}

// Node: Select top 3 from top 10
async function selectTop3Node(state: AgentSelectionState): Promise<Partial<AgentSelectionState>> {
  const { top10Candidates, userPreferences } = state;
  
  // Simple scoring algorithm (to be replaced with LLM)
  const scored = top10Candidates.map(candidate => {
    let score = candidate.score * 0.3 + candidate.relevance * 0.3;
    
    if (userPreferences.priority === 'cost' && candidate.basePrice) {
      // Prefer lower prices
      score += (1000 - candidate.basePrice) / 1000;
    } else if (userPreferences.priority === 'rating') {
      score += candidate.rating / 5;
    }
    
    return { candidate, score };
  });
  
  const top3 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.candidate);
  
  return { top3Candidates: top3 };
}

// Node: Negotiate with single candidate
async function negotiateNode(state: AgentSelectionState): Promise<Partial<AgentSelectionState>> {
  const { top3Candidates, scope, userPreferences } = state;
  
  const negotiations: NegotiationResult[] = [];
  
  for (const candidate of top3Candidates) {
    const mock = getTradespersonMock(candidate.agentId);
    if (mock) {
      const result = await mock.negotiate(scope, userPreferences);
      negotiations.push(result);
    }
  }
  
  return { negotiations };
}

// Node: Select winner
async function selectWinnerNode(state: AgentSelectionState): Promise<Partial<AgentSelectionState>> {
  const { negotiations, userPreferences } = state;
  
  // Simple scoring based on discount + rating
  const scored = negotiations.map(n => {
    let score = (n.discount ?? 0) * 0.5;
    if (userPreferences.priority === 'cost') {
      score += (n.discount ?? 0);
    }
    return { negotiation: n, score };
  });
  
  const winner = scored.sort((a, b) => b.score - a.score)[0];
  
  return {
    selectedAgentId: winner.negotiation.candidateId,
    reasoning: `Selected based on ${userPreferences.priority ?? 'balanced'} priority. ` +
      `Offered $${winner.negotiation.discount ?? 0} discount.`
  };
}

// Create the graph
const workflow = new StateGraph<AgentSelectionState>({
  channels: {
    top10Candidates: { default: () => [] },
    top3Candidates: { default: () => [] },
    negotiations: { default: () => [] },
    selectedAgentId: { default: () => null },
    reasoning: { default: () => '' },
    userPreferences: { default: () => ({}) },
    scope: { default: () => ({}) },
    errors: { default: () => [] },
  }
});

workflow.addNode('selectTop3', selectTop3Node);
workflow.addNode('negotiate', negotiateNode);
workflow.addNode('selectWinner', selectWinnerNode);

workflow.setEntryPoint('selectTop3');
workflow.addEdge('selectTop3', 'negotiate');
workflow.addEdge('negotiate', 'selectWinner');
workflow.addEdge('selectWinner', END);

export const agentSelectionGraph = workflow.compile();
```

### Success Criteria

#### Automated Verification:

- [ ] LangGraph compiles without errors
- [ ] Graph can be instantiated
- [ ] Integration test passes: node functions execute

---

## Phase 5: API Routes

### Overview

Create the Next.js App Router endpoints for the three operations.

### Changes Required

#### 1. Select Top 3 Endpoint

**File**: `app/api/agents/select-top3/route.ts`
**Changes**: Create POST handler

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { agentSelectionGraph } from '@/features/agents/negotiation/graph';
import { Candidate, UserPreferences } from '@/features/shared/types/AgentReasoning';

interface SelectTop3Request {
  top10: Candidate[];
  userPreferences: UserPreferences;
  scope: Record<string, any>;
}

interface SelectTop3Response {
  top3: Candidate[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SelectTop3Request = await request.json();
    const { top10, userPreferences, scope } = body;
    
    // Use LangGraph to select top 3
    const result = await agentSelectionGraph.invoke({
      top10Candidates: top10,
      userPreferences,
      scope,
    });
    
    const response: SelectTop3Response = {
      top3: result.top3Candidates,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Select top3 error:', error);
    return NextResponse.json(
      { error: 'Failed to select top 3 candidates' },
      { status: 500 }
    );
  }
}
```

#### 2. Negotiate Endpoint

**File**: `app/api/agents/negotiate/route.ts`
**Changes**: Create POST handler

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getTradespersonMock } from '@/features/agents/negotiation/mocks/tradesperson';
import { UserPreferences } from '@/features/shared/types/AgentReasoning';

interface NegotiateRequest {
  candidateId: string;
  scope: Record<string, any>;
  userPreferences: UserPreferences;
}

export async function POST(request: NextRequest) {
  try {
    const body: NegotiateRequest = await request.json();
    const { candidateId, scope, userPreferences } = body;
    
    const mock = getTradespersonMock(candidateId);
    if (!mock) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    const result = await mock.negotiate(scope, userPreferences);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Negotiate error:', error);
    return NextResponse.json(
      { error: 'Negotiation failed' },
      { status: 500 }
    );
  }
}
```

#### 3. Select Winner Endpoint

**File**: `app/api/agents/select-winner/route.ts`
**Changes**: Create POST handler

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { NegotiationResult, UserPreferences } from '@/features/shared/types/AgentReasoning';

interface SelectWinnerRequest {
  negotiations: NegotiationResult[];
  userPreferences: UserPreferences;
}

interface SelectWinnerResponse {
  selectedAgentId: string;
  reasoning: string;
}

// Simple selection logic (can be upgraded to LLM)
function selectWinner(
  negotiations: NegotiationResult[],
  preferences: UserPreferences
): { agentId: string; reasoning: string } {
  const scored = negotiations.map(n => {
    let score = 0;
    
    // Discount weight
    score += (n.discount ?? 0) * 0.4;
    
    // Priority-based scoring
    switch (preferences.priority) {
      case 'cost':
        score += (n.discount ?? 0) * 0.6;
        break;
      case 'quality':
        score += n.compromises.length * 0.2;
        break;
      default:
        score += (n.discount ?? 0) * 0.3;
    }
    
    return { agentId: n.candidateId, score, negotiation: n };
  });
  
  const winner = scored.sort((a, b) => b.score - a.score)[0];
  
  return {
    agentId: winner.agentId,
    reasoning: `Selected ${winner.agentId} with $${winner.negotiation.discount ?? 0} discount based on ${preferences.priority ?? 'balanced'} priority`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SelectWinnerRequest = await request.json();
    const { negotiations, userPreferences } = body;
    
    const result = selectWinner(negotiations, userPreferences);
    
    const response: SelectWinnerResponse = {
      selectedAgentId: result.agentId,
      reasoning: result.reasoning,
    };
    
    return NextResponse.json(response);
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

#### Automated Verification:

- [ ] API routes compile: `npm run build`
- [ ] Endpoints respond with correct status codes
- [ ] Integration test passes: `curl -X POST localhost:3000/api/agents/select-top3` with test data

#### Manual Verification:

- [ ] Test select-top3 with mock top10 data
- [ ] Test negotiate with specific candidate
- [ ] Test select-winner with mock negotiation results

---

## Phase 6: Dependencies & Integration

### Overview

Install required dependencies and verify the full system works.

### Changes Required

#### 1. Install Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@langchain/langgraph": "^0.2.0",
    "langchain": "^0.3.0",
    "zod": "^3.23.0"
  }
}
```

Run: `npm install`

#### 2. Export Shared Types

**File**: `features/shared/index.ts`
**Changes**: Create module exports

```typescript
export * from './types/AgentReasoning';
```

### Success Criteria

#### Automated Verification:

- [ ] Dependencies install without errors
- [ ] TypeScript compiles: `npm run build`
- [ ] No lint errors: `npm run lint`

#### Manual Verification:

- [ ] All three API endpoints respond correctly
- [ ] Full flow works: select-top3 → negotiate (×3) → select-winner

---

## Testing Strategy

### Unit Tests:

- Tradesperson mock different personalities
- Prompt template generation
- Winner selection logic with different priorities

### Integration Tests:

- End-to-end flow: top10 → top3 → negotiations → winner
- Error handling for invalid inputs

### Manual Testing Steps:

1. POST to `/api/agents/select-top3` with sample top10
2. Verify top3 returned
3. POST to `/api/agents/negotiate` for each top3
4. Verify negotiation responses
5. POST to `/api/agents/select-winner` with negotiations
6. Verify winner selected with reasoning

## Performance Considerations

- Negotiation with 3 candidates runs sequentially (can parallelize)
- No database calls in MVP (in-memory)
- LangGraph checkpointing not needed for simple flows

## Migration Notes

To upgrade from mock to LLM:

1. Implement `OpenAIProvider` or `AnthropicProvider` in `features/agents/reasoning/providers/`
2. Update graph nodes to call LLM instead of mock
3. No API changes needed (abstraction layer)

## References

- Original ticket: `thoughts/shared/research/2026-03-01-agent-selection-top3.md`
- Specification: `context/responsbilities.md:51-78`
- User flow: `context/user_flow.md:25-37`
- LangGraph docs: https://langchain-ai.github.io/langgraphjs/
