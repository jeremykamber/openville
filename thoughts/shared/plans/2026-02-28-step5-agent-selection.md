# Step 5: Agent Selection Implementation Plan

## Overview

Implement the Agent Selection step where an LLM reasoner takes top 10 candidates from the search/ranking step, applies human priorities and preferences, and narrows to a top 3 list of candidates with reasoning for each selection.

**Design Decision**: LLM-driven selection - the LLM receives candidates + preferences, returns top 3 with reasoning.

## Current State Analysis

- `features/agents/selection/types/Candidate.ts` - Basic candidate type exists
- `features/agents/reasoning/` - Empty directory (scaffolded)
- No LLM provider configured
- No prompt templates exist
- No API endpoint exists for this step
- Next.js 16 App Router project

## Desired End State

**API Endpoint**: `POST /api/agents/select-top3`

**Input**:
```typescript
{
  top10: Candidate[];
  userPreferences: UserPreferences;
  scope: JobScope;
}
```

**Output**:
```typescript
{
  top3: {
    candidate: Candidate;
    reasoning: string;
    matchScore: number;
  }[];
  summary: string;
}
```

### Key Discoveries

- `context/responsbilities.md:56` - Step 5 description
- `context/user_flow.md:25-27` - Step 5 in user flow
- LangGraph for LLM orchestration (using @langchain/core types)
- Need LLM abstraction layer per previous plan decision

## What We're NOT Doing

- Database persistence (in-memory for MVP)
- Streaming LLM responses (future enhancement)
- Caching of LLM responses
- Multiple rounds of reasoning (single pass only)
- Integration with actual search API (receives mock/top10 input)

## Implementation Approach

1. **Type-First Development** - Each type in its own file
2. **LangGraph Integration** - Use @langchain/core for messages, base chat model
3. **Prompt Engineering** - Personal agent persona
4. **TDD with Vitest** - Comprehensive tests first, implement until passing

---

## Phase 1: Type Definitions (One File Per Type)

### Overview

Create isolated type files for each type - no combined type files.

### Changes Required

#### 1. Candidate Type (Update)

**File**: `features/agents/selection/types/Candidate.ts`

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
  yearsExperience?: number;
  certifications?: string[];
  responseTime?: string;
  [key: string]: any;
}
```

#### 2. UserPreferences Type

**File**: `features/agents/selection/types/UserPreferences.ts`

```typescript
export interface UserPreferences {
  budget?: number;
  priority?: 'cost' | 'quality' | 'speed' | 'rating';
  dealBreakers?: string[];
  preferredQualifications?: string[];
  availabilityRequired?: string;
  minRating?: number;
}
```

#### 3. JobScope Type

**File**: `features/agents/selection/types/JobScope.ts`

```typescript
export interface JobScope {
  jobType: string;
  description: string;
  location?: string;
  urgency?: 'asap' | 'flexible' | 'scheduled';
  estimatedDuration?: string;
  [key: string]: any;
}
```

#### 4. SelectedCandidate Type

**File**: `features/agents/selection/types/SelectedCandidate.ts`

```typescript
import { Candidate } from './Candidate';

export interface SelectedCandidate {
  candidate: Candidate;
  reasoning: string;
  matchScore: number;
}
```

#### 5. SelectTop3Response Type

**File**: `features/agents/selection/types/SelectTop3Response.ts`

```typescript
import { SelectedCandidate } from './SelectedCandidate';

export interface SelectTop3Response {
  top3: SelectedCandidate[];
  summary: string;
}
```

#### 6. SelectTop3Request Type

**File**: `features/agents/selection/types/SelectTop3Request.ts`

```typescript
import { Candidate } from './Candidate';
import { UserPreferences } from './UserPreferences';
import { JobScope } from './JobScope';

export interface SelectTop3Request {
  top10: Candidate[];
  userPreferences: UserPreferences;
  scope: JobScope;
}
```

#### 7. Index/Barrel Export

**File**: `features/agents/selection/types/index.ts`

```typescript
export * from './Candidate';
export * from './UserPreferences';
export * from './JobScope';
export * from './SelectedCandidate';
export * from './SelectTop3Response';
export * from './SelectTop3Request';
```

### Success Criteria

#### Automated Verification:

- [x] All 6 type files created with no import errors
- [x] Barrel export works: `import { Candidate, UserPreferences, JobScope } from '@/features/agents/selection/types'`
- [x] TypeScript compiles: `npm run build`

---

## Phase 2: LLM Provider with LangGraph Types

### Overview

Use @langchain/core types for messages and base chat model interface instead of custom types.

### Changes Required

#### 1. Install Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "@langchain/core": "^0.3.0",
    "openai": "^4.28.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

Run: `npm install`

#### 2. LangGraph Chat Model Interface

**File**: `features/agents/reasoning/providers/ChatModel.ts`

```typescript
import { BaseMessage } from '@langchain/core/messages';
import { z } from 'zod';

export interface ChatModelOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatModel {
  invoke(
    input: BaseMessage | BaseMessage[],
    options?: ChatModelOptions
  ): Promise<BaseMessage>;
  
  withStructuredOutput<Z extends z.ZodSchema>(
    schema: Z,
    options?: ChatModelOptions
  ): (input: string | BaseMessage) => Promise<z.infer<Z>>;
}
```

#### 3. OpenAI Chat Model Implementation

**File**: `features/agents/reasoning/providers/OpenAIChatModel.ts`

```typescript
import OpenAI from 'openai';
import { BaseMessage, HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ChatModel, ChatModelOptions } from './ChatModel';
import { z } from 'zod';

export class OpenAIChatModel implements ChatModel {
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model = 'gpt-4o-mini') {
    this.client = new OpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    });
    this.model = model;
  }

  async invoke(
    input: BaseMessage | BaseMessage[],
    options?: ChatModelOptions
  ): Promise<BaseMessage> {
    const messages = Array.isArray(input) 
      ? input 
      : [input];
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m instanceof SystemMessage ? 'system' 
          : m instanceof HumanMessage ? 'user'
          : m instanceof AIMessage ? 'assistant'
          : 'user',
        content: m.content,
      })) as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    const content = response.choices[0]?.message?.content ?? '';
    return new AIMessage(content);
  }

  withStructuredOutput<Z extends z.ZodSchema>(
    schema: Z,
    options?: ChatModelOptions
  ): (input: string | BaseMessage) => Promise<z.infer<Z>> {
    return async (input: string | BaseMessage): Promise<z.infer<Z>> => {
      const messages = Array.isArray(input) 
        ? input 
        : [input];
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map(m => ({
          role: m instanceof SystemMessage ? 'system' 
            : m instanceof HumanMessage ? 'user'
            : m instanceof AIMessage ? 'assistant'
            : 'user',
          content: m.content,
        })) as any,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content ?? '{}';
      return JSON.parse(content) as z.infer<Z>;
    };
  }
}
```

#### 4. Provider Factory

**File**: `features/agents/reasoning/providers/index.ts`

```typescript
import { ChatModel } from './ChatModel';
import { OpenAIChatModel } from './OpenAIChatModel';

export type ProviderType = 'openai' | 'anthropic' | 'mock';

export function createChatModel(type: ProviderType = 'openai'): ChatModel {
  switch (type) {
    case 'openai':
      return new OpenAIChatModel();
    case 'mock':
      return createMockChatModel();
    default:
      return new OpenAIChatModel();
  }
}

function createMockChatModel(): ChatModel {
  return {
    async invoke(input) {
      console.log('[Mock] Input:', 
        Array.isArray(input) 
          ? input.map(m => m.content).join('\n')
          : input.content
      );
      return { 
        content: '{"error": "Mock - implement for tests"}',
        type: 'ai' 
      } as any;
    },
    withStructuredOutput(schema) {
      return async (input) => {
        console.log('[Mock] Structured input:', 
          typeof input === 'string' ? input : input.content
        );
        return {} as any;
      };
    }
  } as ChatModel;
}

export * from './ChatModel';
export * from './OpenAIChatModel';
```

### Success Criteria

#### Automated Verification:

- [x] Dependencies install: `npm install`
- [x] LangGraph types import correctly
- [x] ChatModel interface compiles

---

## Phase 3: Prompt Engineering (Personal Agent Persona)

### Overview

Create prompts where the LLM acts as the user's personal AI agent.

### Changes Required

#### 1. System Prompt (Personal Agent Voice)

**File**: `features/agents/reasoning/prompts/selectionPrompts.ts`

```typescript
import { 
  Candidate, 
  UserPreferences, 
  JobScope 
} from '@/features/agents/selection/types';

export const SELECT_TOP3_SYSTEM_PROMPT = `You are a helpful AI assistant helping your user find the best service provider for their needs.

Your user has asked you to help them hire someone for a job. It's your job to select the best 3 candidates from the options available and explain why each one is a good choice for your user.

## How to think about this:

Your user has told you what's important to them:
- Their budget: How much they want to spend
- What matters most: Whether they care more about saving money, getting quality work, speed, or working with someone well-rated
- Any deal breakers: Things that would automatically rule out a candidate
- Preferred qualifications: Skills or experience they'd like the person to have

You need to find the 3 candidates that best match what your user wants.

## Important rules:

1. Always prioritize your user's stated preferences
2. If a candidate violates a deal breaker, don't include them
3. Be specific about WHY each candidate is a good match - cite actual details
4. Your #1 pick should be your strongest recommendation
5. Think about what would matter TO YOUR USER, not just what's objectively best

## What to return:

You MUST return a JSON object with this exact structure:

{
  "top3": [
    {
      "agentId": "string - must match exactly from the candidate list provided",
      "reasoning": "string - 1-2 sentences explaining why this candidate is a good choice for YOUR USER",
      "matchScore": number - 0-100 score for how well they match your user's needs (100 = perfect match)
    }
  ],
  "summary": "string - 2-3 sentences explaining your overall thinking and why these are the best choices for your user"
}

Return ONLY valid JSON - no markdown, no explanations outside the JSON structure.`;

export function buildSelectionUserPrompt(
  candidates: Candidate[],
  preferences: UserPreferences,
  scope: JobScope
): string {
  const candidatesJson = candidates.map(c => ({
    agentId: c.agentId,
    name: c.name,
    relevance: c.relevance,
    systemScore: c.score,
    successCount: c.successCount,
    rating: c.rating,
    basePrice: c.basePrice ?? 'Not specified',
    specialties: c.specialties ?? [],
    yearsExperience: c.yearsExperience ?? 'Not specified',
    certifications: c.certifications ?? [],
    availability: c.availability ?? 'Not specified',
    responseTime: c.responseTime ?? 'Not specified',
  }));

  return `## The Job
- Type of work: ${scope.jobType}
- Description: ${scope.description}
- When needed: ${scope.urgency ?? 'flexible'}
${scope.location ? `- Where: ${scope.location}` : ''}
${scope.estimatedDuration ? `- How long: ${scope.estimatedDuration}` : ''}

## What My User Wants
- Budget: ${preferences.budget ? `$${preferences.budget} or less` : 'No specific budget'}
- What matters most: ${preferences.priority ?? 'a good balance of cost and quality'}
${preferences.dealBreakers?.length ? `- Won't consider: ${preferences.dealBreakers.join(', ')}` : '- No deal breakers'}
${preferences.preferredQualifications?.length ? `- Would prefer: ${preferences.preferredQualifications.join(', ')}` : ''}
${preferences.minRating ? `- Must have at least ${preferences.minRating} stars` : ''}

## Available Candidates

${JSON.stringify(candidatesJson, null, 2)}

Please select the top 3 candidates that would be best for my user and explain your reasoning.`;
}
```

### Success Criteria

#### Automated Verification:

- [x] Prompts generate valid strings
- [x] System prompt contains personal agent voice

---

## Phase 4: Response Schemas & Parsing

### Overview

Create Zod schemas and parsing utilities.

### Changes Required

#### 1. LLM Response Schema

**File**: `features/agents/reasoning/schemas/SelectionSchemas.ts`

```typescript
import { z } from 'zod';

export const SelectedCandidateSchema = z.object({
  agentId: z.string(),
  reasoning: z.string(),
  matchScore: z.number().min(0).max(100),
});

export const SelectTop3LLMResponseSchema = z.object({
  top3: z.array(SelectedCandidateSchema),
  summary: z.string(),
});

export type SelectTop3LLMResponse = z.infer<typeof SelectTop3LLMResponseSchema>;
```

#### 2. Response Parser

**File**: `features/agents/reasoning/utils/parseResponse.ts`

```typescript
import { z } from 'zod';
import { SelectTop3LLMResponseSchema, SelectTop3LLMResponse } from '../schemas/SelectionSchemas';

export class ResponseParseError extends Error {
  constructor(
    message: string, 
    public readonly rawResponse: string,
    public readonly cause?: z.ZodError
  ) {
    super(message);
    this.name = 'ResponseParseError';
  }
}

export function parseSelectionResponse(rawResponse: string): SelectTop3LLMResponse {
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return SelectTop3LLMResponseSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ResponseParseError(
        `Invalid response structure: ${error.errors.map(e => e.message).join(', ')}`,
        rawResponse,
        error
      );
    }
    if (error instanceof ResponseParseError) {
      throw error;
    }
    throw new ResponseParseError(
      `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      rawResponse
    );
  }
}
```

### Success Criteria

#### Automated Verification:

- [x] Schema validates correct responses
- [x] Parser throws on invalid responses with raw content preserved

---

## Phase 5: Selection Service

### Overview

Create the service that orchestrates LLM calls.

### Changes Required

#### 1. Selection Service

**File**: `features/agents/selection/selectTop3.ts`

```typescript
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createChatModel } from '../reasoning/providers';
import { 
  Candidate, 
  UserPreferences, 
  JobScope, 
  SelectTop3Response,
  SelectedCandidate 
} from './types';
import { 
  SELECT_TOP3_SYSTEM_PROMPT, 
  buildSelectionUserPrompt 
} from '../reasoning/prompts/selectionPrompts';
import { parseSelectionResponse } from '../reasoning/utils/parseResponse';
import { SelectTop3LLMResponseSchema } from '../reasoning/schemas/SelectionSchemas';

export interface SelectTop3Options {
  providerType?: 'openai' | 'mock';
  temperature?: number;
}

export async function selectTop3(
  candidates: Candidate[],
  preferences: UserPreferences,
  scope: JobScope,
  options: SelectTop3Options = {}
): Promise<SelectTop3Response> {
  if (candidates.length < 3) {
    throw new Error('At least 3 candidates required for selection');
  }

  const model = createChatModel(options.providerType ?? 'openai');
  const userPrompt = buildSelectionUserPrompt(candidates, preferences, scope);

  const structuredOutput = model.withStructuredOutput(SelectTop3LLMResponseSchema, {
    temperature: options.temperature ?? 0.7,
  });

  const llmResponse = await structuredOutput([
    new SystemMessage(SELECT_TOP3_SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const candidateMap = new Map(candidates.map(c => [c.agentId, c]));
  
  const top3: SelectedCandidate[] = llmResponse.top3.map(item => {
    const candidate = candidateMap.get(item.agentId);
    if (!candidate) {
      throw new Error(`Invalid agentId in LLM response: ${item.agentId}`);
    }
    return {
      candidate,
      reasoning: item.reasoning,
      matchScore: item.matchScore,
    };
  });

  return {
    top3,
    summary: llmResponse.summary,
  };
}
```

### Success Criteria

#### Automated Verification:

- [x] Service compiles

---

## Phase 6: API Route

### Overview

Create the Next.js App Router endpoint.

### Changes Required

#### 1. API Route

**File**: `app/api/agents/select-top3/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { selectTop3 } from '@/features/agents/selection/selectTop3';
import { SelectTop3Request, SelectTop3Response } from '@/features/agents/selection/types';

export async function POST(request: NextRequest): Promise<NextResponse<SelectTop3Response>> {
  try {
    const body: SelectTop3Request = await request.json();
    
    const { top10, userPreferences, scope } = body;

    if (!top10 || !Array.isArray(top10) || top10.length < 3) {
      return NextResponse.json(
        { error: 'top10 must be an array with at least 3 candidates' },
        { status: 400 }
      );
    }

    if (!userPreferences) {
      return NextResponse.json(
        { error: 'userPreferences is required' },
        { status: 400 }
      );
    }

    if (!scope) {
      return NextResponse.json(
        { error: 'scope is required' },
        { status: 400 }
      );
    }

    const providerType = process.env.USE_MOCK_LLM === 'true' ? 'mock' : 'openai';
    
    const result = await selectTop3(top10, userPreferences, scope, {
      providerType,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Select top3 error:', error);
    
    const message = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
```

### Success Criteria

#### Automated Verification:

- [x] Route compiles: `npm run build`

---

## Phase 7: Comprehensive Vitest Testing (TDD)

### Overview

Write comprehensive tests FIRST, then implement until all tests pass.

### Changes Required

#### 1. Install Vitest (if not already)

Ensure `vitest` is in devDependencies.

#### 2. Test: Type Exports

**File**: `features/agents/selection/types/__tests__/types.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  Candidate,
  UserPreferences,
  JobScope,
  SelectedCandidate,
  SelectTop3Response,
  SelectTop3Request,
} from '../types';

describe('Selection Types', () => {
  describe('Candidate', () => {
    it('should have required fields', () => {
      const candidate: Candidate = {
        agentId: 'test-1',
        name: 'Test Agent',
        score: 0.9,
        relevance: 0.85,
        successCount: 100,
        rating: 4.5,
      };
      
      expect(candidate.agentId).toBe('test-1');
      expect(candidate.name).toBe('Test Agent');
    });

    it('should allow optional fields', () => {
      const candidate: Candidate = {
        agentId: 'test-1',
        name: 'Test Agent',
        score: 0.9,
        relevance: 0.85,
        successCount: 100,
        rating: 4.5,
        basePrice: 200,
        yearsExperience: 10,
        certifications: ['licensed', 'bonded'],
      };
      
      expect(candidate.basePrice).toBe(200);
      expect(candidate.certifications).toContain('licensed');
    });
  });

  describe('UserPreferences', () => {
    it('should accept valid priority values', () => {
      const prefs: UserPreferences = {
        budget: 500,
        priority: 'cost',
        dealBreakers: ['no insurance'],
        minRating: 4.0,
      };
      
      expect(prefs.priority).toBe('cost');
    });

    it('should allow all priority options', () => {
      const priorities: UserPreferences['priority'][] = ['cost', 'quality', 'speed', 'rating'];
      
      priorities.forEach(priority => {
        const prefs: UserPreferences = { priority };
        expect(prefs.priority).toBe(priority);
      });
    });
  });

  describe('JobScope', () => {
    it('should require jobType and description', () => {
      const scope: JobScope = {
        jobType: 'Plumbing',
        description: 'Fix leaky faucet',
      };
      
      expect(scope.jobType).toBe('Plumbing');
    });

    it('should allow urgency options', () => {
      const scope: JobScope = {
        jobType: 'Plumbing',
        description: 'Fix leaky faucet',
        urgency: 'asap',
      };
      
      expect(scope.urgency).toBe('asap');
    });
  });
});
```

#### 3. Test: Prompt Generation

**File**: `features/agents/reasoning/prompts/__tests__/selectionPrompts.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  SELECT_TOP3_SYSTEM_PROMPT,
  buildSelectionUserPrompt,
} from '../selectionPrompts';
import { Candidate, UserPreferences, JobScope } from '@/features/agents/selection/types';

describe('Selection Prompts', () => {
  describe('SELECT_TOP3_SYSTEM_PROMPT', () => {
    it('should contain personal agent language', () => {
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('helpful AI assistant');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('your user');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain("what YOUR USER wants");
    });

    it('should specify JSON output format', () => {
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"top3"');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"agentId"');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"reasoning"');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"matchScore"');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"summary"');
    });

    it('should mention deal breakers', () => {
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('deal breaker');
    });
  });

  describe('buildSelectionUserPrompt', () => {
    const mockCandidate: Candidate = {
      agentId: 'tp-001',
      name: "Joe's Plumbing",
      score: 0.9,
      relevance: 0.85,
      successCount: 100,
      rating: 4.5,
      basePrice: 200,
      yearsExperience: 10,
    };

    const mockPreferences: UserPreferences = {
      budget: 250,
      priority: 'cost',
      dealBreakers: ['no license'],
      minRating: 4.0,
    };

    const mockScope: JobScope = {
      jobType: 'Plumbing',
      description: 'Fix leaky faucet',
      urgency: 'flexible',
    };

    it('should include job details', () => {
      const prompt = buildSelectionUserPrompt([mockCandidate], mockPreferences, mockScope);
      
      expect(prompt).toContain('Plumbing');
      expect(prompt).toContain('Fix leaky faucet');
    });

    it('should include user preferences', () => {
      const prompt = buildSelectionUserPrompt([mockCandidate], mockPreferences, mockScope);
      
      expect(prompt).toContain('$250 or less');
      expect(prompt).toContain('cost');
      expect(prompt).toContain('no license');
      expect(prompt).toContain('4.0');
    });

    it('should include candidate data', () => {
      const prompt = buildSelectionUserPrompt([mockCandidate], mockPreferences, mockScope);
      
      expect(prompt).toContain('tp-001');
      expect(prompt).toContain("Joe's Plumbing");
      expect(prompt).toContain('200'); // basePrice
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalCandidate: Candidate = {
        agentId: 'min-1',
        name: 'Minimal',
        score: 0.5,
        relevance: 0.5,
        successCount: 1,
        rating: 3.0,
      };
      
      const prompt = buildSelectionUserPrompt([minimalCandidate], {}, { jobType: 'Test', description: 'Test' });
      
      expect(prompt).toContain('min-1');
    });
  });
});
```

#### 4. Test: Response Parsing

**File**: `features/agents/reasoning/utils/__tests__/parseResponse.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { parseSelectionResponse, ResponseParseError } from '../parseResponse';

describe('parseSelectionResponse', () => {
  const validResponse = JSON.stringify({
    top3: [
      { agentId: 'tp-001', reasoning: 'Great match', matchScore: 95 },
      { agentId: 'tp-002', reasoning: 'Good match', matchScore: 85 },
      { agentId: 'tp-003', reasoning: 'Decent match', matchScore: 75 },
    ],
    summary: 'Selected based on cost priority',
  });

  it('should parse valid JSON response', () => {
    const result = parseSelectionResponse(validResponse);
    
    expect(result.top3).toHaveLength(3);
    expect(result.top3[0].agentId).toBe('tp-001');
    expect(result.top3[0].matchScore).toBe(95);
    expect(result.summary).toBe('Selected based on cost priority');
  });

  it('should handle JSON wrapped in markdown', () => {
    const markdownResponse = '```json\n' + validResponse + '\n```';
    const result = parseSelectionResponse(markdownResponse);
    
    expect(result.top3).toHaveLength(3);
  });

  it('should handle JSON with surrounding text', () => {
    const textResponse = `Here is my response: ${validResponse} Let me know if you need anything else.`;
    const result = parseSelectionResponse(textResponse);
    
    expect(result.top3).toHaveLength(3);
  });

  it('should throw ResponseParseError for invalid JSON', () => {
    expect(() => parseSelectionResponse('not json')).toThrow(ResponseParseError);
  });

  it('should throw ResponseParseError for invalid structure', () => {
    const invalidStructure = JSON.stringify({ wrongField: 'value' });
    
    expect(() => parseSelectionResponse(invalidStructure)).toThrow(ResponseParseError);
  });

  it('should preserve raw response in error', () => {
    const badResponse = 'this is not valid json';
    
    try {
      parseSelectionResponse(badResponse);
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseParseError);
      expect((error as ResponseParseError).rawResponse).toBe(badResponse);
    }
  });

  it('should validate matchScore range (0-100)', () => {
    const outOfRange = JSON.stringify({
      top3: [{ agentId: 't1', reasoning: 'test', matchScore: 150 }],
      summary: 'test',
    });
    
    expect(() => parseSelectionResponse(outOfRange)).toThrow(ResponseParseError);
  });

  it('should require agentId to be string', () => {
    const invalidId = JSON.stringify({
      top3: [{ agentId: 123, reasoning: 'test', matchScore: 50 }],
      summary: 'test',
    });
    
    expect(() => parseSelectionResponse(invalidId)).toThrow(ResponseParseError);
  });
});
```

#### 5. Test: Selection Service

**File**: `features/agents/selection/__tests__/selectTop3.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selectTop3 } from '../selectTop3';
import { Candidate, UserPreferences, JobScope } from '../types';

// Mock the providers module
vi.mock('../../reasoning/providers', () => ({
  createChatModel: vi.fn(() => ({
    withStructuredOutput: vi.fn(() => async () => ({
      top3: [
        { agentId: 'tp-001', reasoning: 'Best cost match', matchScore: 90 },
        { agentId: 'tp-002', reasoning: 'Good quality', matchScore: 85 },
        { agentId: 'tp-003', reasoning: 'Decent option', matchScore: 80 },
      ],
      summary: 'Selected based on budget priority',
    })),
  })),
}));

describe('selectTop3', () => {
  const mockCandidates: Candidate[] = [
    { agentId: 'tp-001', name: 'Cheap Plumber', score: 0.9, relevance: 0.85, successCount: 50, rating: 4.0, basePrice: 100 },
    { agentId: 'tp-002', name: 'Quality Plumber', score: 0.95, relevance: 0.9, successCount: 200, rating: 4.8, basePrice: 300 },
    { agentId: 'tp-003', name: 'Average Plumber', score: 0.8, relevance: 0.75, successCount: 30, rating: 4.2, basePrice: 150 },
    { agentId: 'tp-004', name: 'Fast Plumber', score: 0.85, relevance: 0.8, successCount: 100, rating: 4.5, basePrice: 250 },
    { agentId: 'tp-005', name: 'Budget Plumber', score: 0.7, relevance: 0.65, successCount: 10, rating: 3.8, basePrice: 80 },
  ];

  const mockPreferences: UserPreferences = {
    budget: 200,
    priority: 'cost',
    minRating: 4.0,
  };

  const mockScope: JobScope = {
    jobType: 'Plumbing',
    description: 'Fix leaky faucet',
  };

  it('should throw error for less than 3 candidates', async () => {
    const tooFewCandidates = mockCandidates.slice(0, 2);
    
    await expect(
      selectTop3(tooFewCandidates, mockPreferences, mockScope)
    ).rejects.toThrow('At least 3 candidates required');
  });

  it('should return top 3 with enriched candidate data', async () => {
    const result = await selectTop3(mockCandidates, mockPreferences, mockScope, {
      providerType: 'mock',
    });
    
    expect(result.top3).toHaveLength(3);
    expect(result.top3[0].candidate.agentId).toBe('tp-001');
    expect(result.top3[0].candidate.name).toBe('Cheap Plumber');
  });

  it('should preserve reasoning from LLM', async () => {
    const result = await selectTop3(mockCandidates, mockPreferences, mockScope, {
      providerType: 'mock',
    });
    
    expect(result.top3[0].reasoning).toBe('Best cost match');
  });

  it('should include summary', async () => {
    const result = await selectTop3(mockCandidates, mockPreferences, mockScope, {
      providerType: 'mock',
    });
    
    expect(result.summary).toBe('Selected based on budget priority');
  });

  it('should throw error for invalid agentId in LLM response', async () => {
    // Mock returns an agentId that doesn't exist in candidates
    vi.mocked('../../reasoning/providers').createChatModel.mockReturnValueOnce({
      withStructuredOutput: vi.fn(() => async () => ({
        top3: [
          { agentId: 'invalid-id', reasoning: 'test', matchScore: 90 },
          { agentId: 'tp-002', reasoning: 'test', matchScore: 80 },
          { agentId: 'tp-003', reasoning: 'test', matchScore: 70 },
        ],
        summary: 'test',
      })),
    } as any);

    await expect(
      selectTop3(mockCandidates, mockPreferences, mockScope, { providerType: 'mock' })
    ).rejects.toThrow('Invalid agentId');
  });
});
```

#### 6. Test: API Route

**File**: `app/api/agents/select-top3/__tests__/route.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the selectTop3 function
vi.mock('@/features/agents/selection/selectTop3', () => ({
  selectTop3: vi.fn(),
}));

import { selectTop3 } from '@/features/agents/selection/selectTop3';
const mockedSelectTop3 = vi.mocked(selectTop3);

describe('POST /api/agents/select-top3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    top10: [
      { agentId: 'tp-001', name: 'Test', score: 0.9, relevance: 0.9, successCount: 10, rating: 4.5 },
      { agentId: 'tp-002', name: 'Test2', score: 0.8, relevance: 0.8, successCount: 5, rating: 4.0 },
      { agentId: 'tp-003', name: 'Test3', score: 0.7, relevance: 0.7, successCount: 3, rating: 3.5 },
    ],
    userPreferences: { budget: 200, priority: 'cost' },
    scope: { jobType: 'Plumbing', description: 'Fix faucet' },
  };

  it('should return 400 if top10 is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/agents/select-top3', {
      method: 'POST',
      body: JSON.stringify({ userPreferences: {}, scope: {} }),
    });

    const res = await POST(req);
    
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty('error');
  });

  it('should return 400 if top10 has less than 3 candidates', async () => {
    const req = new NextRequest('http://localhost:3000/api/agents/select-top3', {
      method: 'POST',
      body: JSON.stringify({
        ...validBody,
        top10: validBody.top10.slice(0, 2),
      }),
    });

    const res = await POST(req);
    
    expect(res.status).toBe(400);
  });

  it('should return 400 if userPreferences is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/agents/select-top3', {
      method: 'POST',
      body: JSON.stringify({
        top10: validBody.top10,
        scope: validBody.scope,
      }),
    });

    const res = await POST(req);
    
    expect(res.status).toBe(400);
  });

  it('should return 400 if scope is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/agents/select-top3', {
      method: 'POST',
      body: JSON.stringify({
        top10: validBody.top10,
        userPreferences: validBody.userPreferences,
      }),
    });

    const res = await POST(req);
    
    expect(res.status).toBe(400);
  });

  it('should return 500 if selectTop3 throws', async () => {
    mockedSelectTop3.mockRejectedValueOnce(new Error('LLM error'));

    const req = new NextRequest('http://localhost:3000/api/agents/select-top3', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    
    expect(res.status).toBe(500);
    expect(await res.json()).toHaveProperty('error');
  });

  it('should return result on success', async () => {
    const mockResult = {
      top3: [
        { candidate: validBody.top10[0], reasoning: 'test', matchScore: 90 },
      ],
      summary: 'test summary',
    };
    mockedSelectTop3.mockResolvedValueOnce(mockResult);

    const req = new NextRequest('http://localhost:3000/api/agents/select-top3', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockResult);
  });
});
```

#### 7. Run Tests & Implement Until Passing

**Step 7a**: Run tests to see failures:
```bash
npm run test
```

**Step 7b**: Implement each component until tests pass:
- Fix type imports
- Implement any missing functions
- Fix any logical errors

**Step 7c**: Re-run tests until ALL pass:
```bash
npm run test -- --coverage
```

**Step 7d**: Verify 100% of tests pass before proceeding.

### Success Criteria

#### Automated Verification:

- [x] All vitest tests run without errors: `npm run test`
- [x] Test coverage shows all files covered
- [x] No failing tests remain

---

## Phase 8: Environment & Manual Testing

### Changes Required

#### 1. Environment Template

**File**: `.env.local.example`

```bash
# LLM Provider
OPENAI_API_KEY=your_openai_api_key_here

# Development options
USE_MOCK_LLM=false
```

#### 2. Manual Test Script

**File**: `scripts/test-select-top3.ts`

```typescript
import { selectTop3 } from '@/features/agents/selection/selectTop3';

const mockCandidates = [
  { agentId: 'tp-001', name: "Joe's Plumbing", score: 0.92, relevance: 0.95, successCount: 150, rating: 4.8, basePrice: 200, yearsExperience: 15 },
  { agentId: 'tp-002', name: 'Quick Fix Plumbing', score: 0.88, relevance: 0.90, successCount: 45, rating: 4.5, basePrice: 150, yearsExperience: 5 },
  { agentId: 'tp-003', name: 'Premium Plumbing Co', score: 0.95, relevance: 0.98, successCount: 300, rating: 4.9, basePrice: 350, yearsExperience: 25 },
  { agentId: 'tp-004', name: 'Budget Plumbers', score: 0.75, relevance: 0.80, successCount: 20, rating: 4.2, basePrice: 100, yearsExperience: 2 },
  { agentId: 'tp-005', name: 'Reliable Rooter', score: 0.85, relevance: 0.88, successCount: 80, rating: 4.6, basePrice: 180, yearsExperience: 10 },
  { agentId: 'tp-006', name: 'City Wide Services', score: 0.82, relevance: 0.85, successCount: 60, rating: 4.4, basePrice: 220, yearsExperience: 8 },
  { agentId: 'tp-007', name: 'Master Plumbers Inc', score: 0.91, relevance: 0.93, successCount: 180, rating: 4.7, basePrice: 280, yearsExperience: 20 },
  { agentId: 'tp-008', name: 'Value Plumbing', score: 0.78, relevance: 0.82, successCount: 35, rating: 4.3, basePrice: 130, yearsExperience: 6 },
  { agentId: 'tp-009', name: 'Expert Electric', score: 0.86, relevance: 0.89, successCount: 90, rating: 4.6, basePrice: 200, yearsExperience: 12 },
  { agentId: 'tp-010', name: 'A+ Home Services', score: 0.83, relevance: 0.87, successCount: 55, rating: 4.5, basePrice: 190, yearsExperience: 9 },
];

const preferences = {
  budget: 200,
  priority: 'cost' as const,
  minRating: 4.0,
};

const scope = {
  jobType: 'Plumbing',
  description: 'Fix leaky faucet in kitchen',
  urgency: 'flexible' as const,
};

async function test() {
  console.log('Testing selectTop3 with real LLM...\n');
  
  const result = await selectTop3(mockCandidates, preferences, scope);
  
  console.log('=== Result ===');
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
```

### Success Criteria

#### Automated Verification:

- [x] Build passes: `npm run build`
- [x] Lint passes: `npm run lint`

#### Manual Verification:

- [ ] Run test script with real OpenAI key
- [ ] Verify reasoning sounds like personal agent
- [ ] Verify #1 pick has highest matchScore

---

## Testing Strategy Summary

### All Tests (Vitest)

| Test File | What It Tests |
|-----------|---------------|
| `types/__tests__/types.test.ts` | All type definitions |
| `prompts/__tests__/selectionPrompts.test.ts` | Prompt generation |
| `utils/__tests__/parseResponse.test.ts` | JSON parsing |
| `__tests__/selectTop3.test.ts` | Selection service logic |
| `api/agents/select-top3/__tests__/route.test.ts` | API validation |

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- selectionPrompts.test.ts

# Watch mode during development
npm run test -- --watch
```

### Success Criteria - Final

All of the following MUST pass:

- [x] `npm run test` - All tests pass
- [x] `npm run build` - TypeScript compiles
- [x] `npm run lint` - No lint errors
- [ ] Manual test with real LLM produces expected output

---

## Performance Considerations

- LLM call latency: expect 1-3 seconds per request
- No caching in MVP
- Token usage: ~500-1000 input tokens, ~200-500 output tokens

## Error Handling

| Error Type | Response |
|------------|----------|
| Invalid input | 400 Bad Request |
| LLM API error | 502 Bad Gateway |
| JSON parse error | 500 with details |
| Timeout | 504 Gateway Timeout |

## Migration Notes

To switch LLM provider:

1. Create new chat model class (e.g., `AnthropicChatModel`)
2. Export from `providers/index.ts`
3. Update `createChatModel` switch
4. No other changes needed (uses LangGraph interface)

## References

- Original ticket: `thoughts/shared/research/2026-03-01-agent-selection-top3.md`
- Specification: `context/responsbilities.md:56`
- User flow: `context/user_flow.md:25-27`
- LangGraph types: https://js.langchain.com/docs/core_messages/
- Vitest: https://vitest.dev/
