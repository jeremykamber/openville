# Agent-to-Agent Negotiation Implementation Plan

## Overview

Implement Step 6: Agent-to-Agent Negotiation using LLMs for turn-based negotiation between a buyer's agent and service provider agents. This feature enables LLMs to negotiate price and scope dynamically, with full conversation history persisted in Supabase.

## Current State Analysis

### What Exists

- **Step 5 (Select Top 3)**: Fully implemented at `features/agents/selection/selectTop3.ts:21-61`
- **LLM Providers**: Factory pattern at `features/agents/reasoning/providers/index.ts:9-20`
- **Prompt Templates**: Patterns established in `features/agents/reasoning/prompts/selectionPrompts.ts:7-85`
- **Schema Validation**: Zod schemas at `features/agents/reasoning/schemas/SelectionSchemas.ts:1-31`
- **API Route Pattern**: Established at `app/api/agents/select-top3/route.ts`
- **Types**: Candidate, UserPreferences, JobScope at `features/agents/selection/types/`

### What's Missing

- **Negotiation directory**: Empty placeholder at `features/agents/negotiation/`
- **Supabase integration**: Not yet implemented in codebase
- **Negotiation types**: Need to create
- **Database schema**: Need to create for Supabase

## Desired End State

After implementation:

1. **Database**: Supabase tables for negotiations, messages, and results
2. **Negotiation API**: `POST /api/agents/negotiate` for turn-based LLM conversation
3. **Negotiation State Machine**: Support for initiate, respond, agree/disagree, cancel
4. **Result Finalization**: Structured NegotiationResult with price, scope, timestamps, agent IDs
5. **Persistence**: All messages and results stored in Supabase

### Key Discoveries:

- LLM factory pattern at `features/agents/reasoning/providers/index.ts:9-20` - reuse for negotiation
- Prompt patterns at `features/agents/reasoning/prompts/selectionPrompts.ts:46-85` - build builder functions similarly
- Schema patterns at `features/agents/reasoning/schemas/SelectionSchemas.ts:1-31` - use Zod for validation
- No Supabase setup exists yet - will create from scratch

## What We're NOT Doing

- Rule-based mock agents (per user's request to use LLMs)
- LangGraph orchestration (keep simple with direct LLM calls for now)
- Real-time WebSocket updates (polling or basic REST for MVP)
- Multi-party negotiations (only buyer + one provider at a time)

## Implementation Approach

### Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Buyer Agent    │◄───►│  Negotiation API │◄───►│  Supabase DB    │
│  (LLM)          │     │  /negotiate      │     │  - negotiations │
└─────────────────┘     └──────────────────┘     │  - messages     │
                          │                      │  - results      │
                          ▼                       └─────────────────┘
                 ┌──────────────────┐
                 │ Provider Agent   │
                 │ (LLM)            │
                 └──────────────────┘
```

### Negotiation Flow

1. Buyer agent initiates negotiation with candidate
2. Turn-based LLM conversation begins (messages array)
3. Either agent can propose price/scope changes
4. Buyer agent can propose NegotiationResult via tool call
5. Provider agent agrees or disagrees
6. If disagree, continue negotiation
7. Buyer agent can cancel at any time
8. On agreement, NegotiationResult is finalized

## Phase 1: Supabase Setup & Database Schema

### Overview

Set up Supabase client and create database schema for persistence.

### Changes Required

#### 1. Supabase Client Setup

**File**: `lib/supabase/server.ts` (server-side client)
**Changes**: Create Supabase server client for API routes

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

**File**: `lib/supabase/client.ts` (client-side)
**Changes**: Create client for any client-side needs

**File**: `.env.local.example`
**Changes**: Add Supabase env vars

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 2. Database Schema

**File**: `supabase/migrations/001_create_negotiation_tables.sql`
**Changes**: Create tables for negotiations

```sql
-- Negotiations table
CREATE TABLE negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_agent_id TEXT NOT NULL,
  provider_agent_id TEXT NOT NULL,
  job_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  current_turn TEXT NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  summary TEXT
);

-- Negotiation messages
CREATE TABLE negotiation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'message',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Negotiation results
CREATE TABLE negotiation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  proposed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  final_price INTEGER,
  scope_description TEXT,
  scope_rooms INTEGER,
  scope_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_message TEXT
);

-- Indexes
CREATE INDEX idx_negotiations_job_id ON negotiations(job_id);
CREATE INDEX idx_negotiations_status ON negotiations(status);
CREATE INDEX idx_negotiation_messages_negotiation_id ON negotiation_messages(negotiation_id);
CREATE INDEX idx_negotiation_results_negotiation_id ON negotiation_results(negotiation_id);
```

### Success Criteria

#### Automated Verification:

- [ ] Supabase client initializes without errors
- [ ] Database tables created: `negotiations`, `negotiation_messages`, `negotiation_results`
- [ ] Indexes created successfully

#### Manual Verification:

- [ ] Can connect to Supabase with environment variables
- [ ] Tables visible in Supabase dashboard

---

## Phase 2: Negotiation Types & Schemas

### Overview

Create TypeScript types and Zod schemas for negotiation components.

### Changes Required

#### 1. Type Definitions

**File**: `features/agents/negotiation/types/Negotiation.ts`
**Changes**: Create Negotiation interface

```typescript
export type NegotiationStatus = 'active' | 'completed' | 'cancelled';
export type NegotiationTurn = 'buyer' | 'provider';

export interface Negotiation {
  id: string;
  buyerAgentId: string;
  providerAgentId: string;
  jobId?: string;
  status: NegotiationStatus;
  currentTurn: NegotiationTurn;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
  summary?: string;
}
```

**File**: `features/agents/negotiation/types/NegotiationMessage.ts`
**Changes**: Create message interface

```typescript
export type SenderType = 'buyer' | 'provider';
export type MessageType = 'message' | 'proposal' | 'cancellation';

export interface NegotiationMessage {
  id: string;
  negotiationId: string;
  sender: string;
  senderType: SenderType;
  content: string;
  messageType: MessageType;
  createdAt: Date;
}
```

**File**: `features/agents/negotiation/types/NegotiationResult.ts`
**Changes**: Create result interface

```typescript
export type ResultStatus = 'pending' | 'accepted' | 'rejected';

export interface NegotiationScope {
  description?: string;
  rooms?: number;
  [key: string]: unknown;
}

export interface NegotiationResult {
  id: string;
  negotiationId: string;
  proposedBy: string;
  status: ResultStatus;
  finalPrice?: number;
  scope?: NegotiationScope;
  createdAt: Date;
  respondedAt?: Date;
  responseMessage?: string;
}
```

**File**: `features/agents/negotiation/types/index.ts`
**Changes**: Export all types

#### 2. Zod Schemas

**File**: `features/agents/negotiation/schemas/NegotiationSchemas.ts`
**Changes**: Create validation schemas

```typescript
import { z } from 'zod';

export const NegotiationMessageSchema = z.object({
  negotiationId: z.string().uuid(),
  sender: z.string(),
  senderType: z.enum(['buyer', 'provider']),
  content: z.string().min(1),
  messageType: z.enum(['message', 'proposal', 'cancellation']).default('message'),
});

export const NegotiationResultSchema = z.object({
  negotiationId: z.string().uuid(),
  proposedBy: z.string(),
  finalPrice: z.number().int().positive().optional(),
  scope: z.object({
    description: z.string().optional(),
    rooms: z.number().int().positive().optional(),
    details: z.record(z.unknown()).optional(),
  }).optional(),
});

export const NegotiationResultResponseSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  responseMessage: z.string().optional(),
});

export type NegotiationMessageInput = z.infer<typeof NegotiationMessageSchema>;
export type NegotiationResultInput = z.infer<typeof NegotiationResultSchema>;
export type NegotiationResultResponse = z.infer<typeof NegotiationResultResponseSchema>;
```

### Success Criteria

#### Automated Verification:

- [ ] TypeScript compiles without errors
- [ ] Zod schemas validate correctly

---

## Phase 3: Negotiation Prompt Templates

### Overview

Create prompt templates for LLM-powered negotiation agents.

### Changes Required

#### 1. Buyer Agent Prompts

**File**: `features/agents/negotiation/prompts/buyerPrompts.ts`
**Changes**: Create buyer agent prompts

```typescript
import { Candidate, JobScope, UserPreferences } from '@/features/agents/selection/types';
import { Negotiation, NegotiationMessage } from '../types';

export const BUYER_AGENT_SYSTEM_PROMPT = `You are a helpful AI assistant representing a buyer looking to hire a service provider.

Your goal is to negotiate the best possible deal for your user:
- Get a fair price within their budget
- Ensure the scope of work meets their needs
- Be professional but firm

## Negotiation Rules:
1. You can propose price adjustments (higher or lower)
2. You can propose scope changes (more or less work)
3. You can accept or reject proposals from the provider
4. If negotiations aren't going well, you can cancel

## Proposal Format:
When you want to propose a final deal, use this format:
- Price: $[amount]
- Scope: [description of work]
- Reason: [why this is fair]

## Cancellation:
If you feel the negotiation isn't productive, say "CANCEL_NEGOTIATION" and explain why.

Respond naturally as a helpful assistant negotiating on behalf of your user.`;

export function buildBuyerInitialPrompt(
  candidate: Candidate,
  scope: JobScope,
  preferences: UserPreferences
): string {
  return `## Negotiation Context

**Your User's Job:**
- Type: ${scope.jobType}
- Description: ${scope.description}
- Location: ${scope.location ?? 'Not specified'}
- Urgency: ${scope.urgency ?? 'flexible'}

**Your User's Budget:** ${preferences.budget ? `$${preferences.budget}` : 'No specific budget'}
**Priority:** ${preferences.priority ?? 'balanced'}

**Service Provider:**
- Name: ${candidate.name}
- Base Price: ${candidate.basePrice ? `$${candidate.basePrice}` : 'Not specified'}
- Rating: ${candidate.rating} stars
- Experience: ${candidate.yearsExperience ?? 'Not specified'} years

Please start the negotiation by introducing yourself and discussing the job.`;
}

export function buildBuyerTurnPrompt(
  negotiation: Negotiation,
  messages: NegotiationMessage[],
  preferences: UserPreferences
): string {
  const recentMessages = messages.slice(-6).map(m => 
    `${m.senderType === 'buyer' ? 'You' : 'Provider'}: ${m.content}`
  ).join('\n\n');

  return `## Conversation So Far
${recentMessages}

## Your User's Preferences:
- Budget: ${preferences.budget ? `$${preferences.budget}` : 'No specific budget'}
- Priority: ${preferences.priority ?? 'balanced'}

What would you like to say or propose next?`;
}
```

#### 2. Provider Agent Prompts

**File**: `features/agents/negotiation/prompts/providerPrompts.ts`
**Changes**: Create provider agent prompts

```typescript
import { Candidate, JobScope } from '@/features/agents/selection/types';
import { Negotiation, NegotiationMessage } from '../types';

export const PROVIDER_AGENT_SYSTEM_PROMPT = `You are a helpful AI assistant representing a service provider (tradesperson).

Your goal is to negotiate a fair deal:
- Get a price that reflects your work value
- Be willing to compromise on scope
- Maintain professionalism

## Negotiation Rules:
1. You can accept or reject price proposals
2. You can counter with different prices
3. You can propose scope changes
4. Be friendly and cooperative

## Responding to Proposals:
When the buyer proposes a deal, respond with:
- ACCEPT: [if you agree with the terms]
- REJECT: [if you disagree, explain why]
- COUNTER: [your alternative proposal]

Respond naturally as a helpful tradesperson.`;

export function buildProviderInitialPrompt(
  candidate: Candidate,
  scope: JobScope,
  buyerName: string = 'the customer'
): string {
  return `## Negotiation Context

**Customer's Job:**
- Type: ${scope.jobType}
- Description: ${scope.description}
- Location: ${scope.location ?? 'Not specified'}

**Your Details:**
- Name: ${candidate.name}
- Base Price: ${candidate.basePrice ? `$${candidate.basePrice}` : 'Not specified'}
- Rating: ${candidate.rating} stars

Please respond to ${buyerName}'s inquiry professionally.`;
}

export function buildProviderTurnPrompt(
  negotiation: Negotiation,
  messages: NegotiationMessage[],
  candidate: Candidate
): string {
  const recentMessages = messages.slice(-6).map(m => 
    `${m.senderType === 'buyer' ? 'Customer' : 'You'}: ${m.content}`
  ).join('\n\n');

  return `## Conversation So Far
${recentMessages}

## Your Details:
- Base Price: ${candidate.basePrice ? `$${candidate.basePrice}` : 'Not specified'}
- Rating: ${candidate.rating} stars

What would you like to say or propose next?`;
}
```

### Success Criteria

#### Automated Verification:

- [ ] TypeScript compiles without errors
- [ ] All prompt functions return valid strings

---

## Phase 4: Negotiation Core Logic

### Overview

Implement the core negotiation logic with LLM calls.

### Changes Required

#### 1. Database Operations

**File**: `features/agents/negotiation/db/negotiations.ts`
**Changes**: Create Supabase operations

```typescript
import { supabaseAdmin } from '@/lib/supabase/server';
import { Negotiation, NegotiationMessage, NegotiationResult } from '../types';

export async function createNegotiation(
  buyerAgentId: string,
  providerAgentId: string,
  jobId?: string
): Promise<Negotiation> {
  const { data, error } = await supabaseAdmin
    .from('negotiations')
    .insert({
      buyer_agent_id: buyerAgentId,
      provider_agent_id: providerAgentId,
      job_id: jobId,
      status: 'active',
      current_turn: 'buyer',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create negotiation: ${error.message}`);
  return mapDbToNegotiation(data);
}

export async function getNegotiation(id: string): Promise<Negotiation | null> {
  const { data, error } = await supabaseAdmin
    .from('negotiations')
    .select()
    .eq('id', id)
    .single();

  if (error) return null;
  return mapDbToNegotiation(data);
}

export async function addMessage(
  negotiationId: string,
  sender: string,
  senderType: 'buyer' | 'provider',
  content: string,
  messageType: 'message' | 'proposal' | 'cancellation' = 'message'
): Promise<NegotiationMessage> {
  const { data, error } = await supabaseAdmin
    .from('negotiation_messages')
    .insert({
      negotiation_id: negotiationId,
      sender,
      sender_type: senderType,
      content,
      message_type: messageType,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add message: ${error.message}`);
  return mapDbToMessage(data);
}

export async function getMessages(negotiationId: string): Promise<NegotiationMessage[]> {
  const { data, error } = await supabaseAdmin
    .from('negotiation_messages')
    .select()
    .eq('negotiation_id', negotiationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to get messages: ${error.message}`);
  return data.map(mapDbToMessage);
}

export async function updateNegotiationStatus(
  id: string,
  status: 'active' | 'completed' | 'cancelled',
  summary?: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('negotiations')
    .update({
      status,
      summary,
      ended_at: status !== 'active' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`Failed to update negotiation: ${error.message}`);
}

export async function createNegotiationResult(
  negotiationId: string,
  proposedBy: string,
  finalPrice?: number,
  scope?: { description?: string; rooms?: number; details?: Record<string, unknown> }
): Promise<NegotiationResult> {
  const { data, error } = await supabaseAdmin
    .from('negotiation_results')
    .insert({
      negotiation_id: negotiationId,
      proposed_by: proposedBy,
      status: 'pending',
      final_price: finalPrice,
      scope_description: scope?.description,
      scope_rooms: scope?.rooms,
      scope_details: scope?.details,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create result: ${error.message}`);
  return mapDbToResult(data);
}

export async function respondToResult(
  resultId: string,
  status: 'accepted' | 'rejected',
  responseMessage?: string
): Promise<NegotiationResult> {
  const { data, error } = await supabaseAdmin
    .from('negotiation_results')
    .update({
      status,
      response_message: responseMessage,
      responded_at: new Date().toISOString(),
    })
    .eq('id', resultId)
    .select()
    .single();

  if (error) throw new Error(`Failed to respond to result: ${error.message}`);
  return mapDbToResult(data);
}

function mapDbToNegotiation(row: Record<string, unknown>): Negotiation {
  return {
    id: row.id as string,
    buyerAgentId: row.buyer_agent_id as string,
    providerAgentId: row.provider_agent_id as string,
    jobId: row.job_id as string | undefined,
    status: row.status as Negotiation['status'],
    currentTurn: row.current_turn as Negotiation['currentTurn'],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    endedAt: row.ended_at ? new Date(row.ended_at as string) : undefined,
    summary: row.summary as string | undefined,
  };
}

function mapDbToMessage(row: Record<string, unknown>): NegotiationMessage {
  return {
    id: row.id as string,
    negotiationId: row.negotiation_id as string,
    sender: row.sender as string,
    senderType: row.sender_type as NegotiationMessage['senderType'],
    content: row.content as string,
    messageType: row.message_type as NegotiationMessage['messageType'],
    createdAt: new Date(row.created_at as string),
  };
}

function mapDbToResult(row: Record<string, unknown>): NegotiationResult {
  return {
    id: row.id as string,
    negotiationId: row.negotiation_id as string,
    proposedBy: row.proposed_by as string,
    status: row.status as NegotiationResult['status'],
    finalPrice: row.final_price as number | undefined,
    scope: row.scope_description ? {
      description: row.scope_description as string,
      rooms: row.scope_rooms as number | undefined,
      details: row.scope_details as Record<string, unknown> | undefined,
    } : undefined,
    createdAt: new Date(row.created_at as string),
    respondedAt: row.responded_at ? new Date(row.responded_at as string) : undefined,
    responseMessage: row.response_message as string | undefined,
  };
}
```

#### 2. Negotiation Engine

**File**: `features/agents/negotiation/negotiate.ts`
**Changes**: Core negotiation logic

```typescript
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createChatModel } from '../reasoning/providers';
import { Candidate, UserPreferences, JobScope } from '../selection/types';
import { Negotiation, NegotiationMessage } from './types';
import {
  createNegotiation,
  getNegotiation,
  addMessage,
  getMessages,
  updateNegotiationStatus,
  createNegotiationResult,
  respondToResult,
} from './db/negotiations';
import {
  BUYER_AGENT_SYSTEM_PROMPT,
  buildBuyerInitialPrompt,
  buildBuyerTurnPrompt,
} from './prompts/buyerPrompts';
import {
  PROVIDER_AGENT_SYSTEM_PROMPT,
  buildProviderInitialPrompt,
  buildProviderTurnPrompt,
} from './prompts/providerPrompts';

export interface NegotiateOptions {
  providerType?: 'openai' | 'openrouter' | 'mock';
  temperature?: number;
}

export async function startNegotiation(
  buyerAgentId: string,
  candidate: Candidate,
  preferences: UserPreferences,
  scope: JobScope,
  jobId?: string,
  options: NegotiateOptions = {}
): Promise<Negotiation> {
  const negotiation = await createNegotiation(buyerAgentId, candidate.agentId, jobId);
  
  const model = createChatModel(options.providerType ?? 'openai');
  
  const buyerPrompt = buildBuyerInitialPrompt(candidate, scope, preferences);
  const providerPrompt = buildProviderInitialPrompt(candidate, scope);

  const buyerResponse = await model.invoke([
    new SystemMessage(BUYER_AGENT_SYSTEM_PROMPT),
    new HumanMessage(buyerPrompt),
  ]);

  await addMessage(negotiation.id, buyerAgentId, 'buyer', buyerResponse.content as string);

  const providerResponse = await model.invoke([
    new SystemMessage(PROVIDER_AGENT_SYSTEM_PROMPT),
    new HumanMessage(providerPrompt + `\n\nCustomer says: ${buyerResponse.content}`),
  ]);

  await addMessage(negotiation.id, candidate.agentId, 'provider', providerResponse.content as string);

  return { ...negotiation, currentTurn: 'buyer' };
}

export async function sendBuyerMessage(
  negotiationId: string,
  buyerAgentId: string,
  message: string,
  candidate: Candidate,
  preferences: UserPreferences,
  options: NegotiateOptions = {}
): Promise<{ messages: NegotiationMessage[]; buyerResponse: string; providerResponse: string }> {
  const negotiation = await getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await addMessage(negotiationId, buyerAgentId, 'buyer', message);
  const allMessages = await getMessages(negotiationId);

  const model = createChatModel(options.providerType ?? 'openai');
  
  // Provider responds to buyer's message
  const providerPrompt = buildProviderTurnPrompt(negotiation, allMessages, candidate);
  const providerResponse = await model.invoke([
    new SystemMessage(PROVIDER_AGENT_SYSTEM_PROMPT),
    new HumanMessage(providerPrompt),
  ]);
  await addMessage(negotiationId, candidate.agentId, 'provider', providerResponse.content as string);

  // Get updated messages and have buyer respond for multi-turn negotiation
  const messagesAfterProvider = await getMessages(negotiationId);
  const buyerTurnPrompt = buildBuyerTurnPrompt(negotiation, messagesAfterProvider, preferences);
  const buyerAutoResponse = await model.invoke([
    new SystemMessage(BUYER_AGENT_SYSTEM_PROMPT),
    new HumanMessage(buyerTurnPrompt),
  ]);
  await addMessage(negotiationId, buyerAgentId, 'buyer', buyerAutoResponse.content as string);

  const updatedMessages = await getMessages(negotiationId);

  return {
    messages: updatedMessages,
    buyerResponse: buyerAutoResponse.content as string,
    providerResponse: providerResponse.content as string,
  };
}

export async function sendSingleMessage(
  negotiationId: string,
  senderId: string,
  senderType: 'buyer' | 'provider',
  message: string,
  candidate: Candidate,
  preferences: UserPreferences,
  options: NegotiateOptions = {}
): Promise<{ messages: NegotiationMessage[]; response: string }> {
  const negotiation = await getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await addMessage(negotiationId, senderId, senderType, message);
  const allMessages = await getMessages(negotiationId);

  const model = createChatModel(options.providerType ?? 'openai');
  
  const isBuyer = senderType === 'buyer';
  const responderPrompt = isBuyer 
    ? buildProviderTurnPrompt(negotiation, allMessages, candidate)
    : buildBuyerTurnPrompt(negotiation, allMessages, preferences);
  
  const responderSystemPrompt = isBuyer 
    ? PROVIDER_AGENT_SYSTEM_PROMPT 
    : BUYER_AGENT_SYSTEM_PROMPT;

  const response = await model.invoke([
    new SystemMessage(responderSystemPrompt),
    new HumanMessage(responderPrompt),
  ]);

  const responderId = isBuyer ? candidate.agentId : negotiation.buyerAgentId;
  await addMessage(negotiationId, responderId, isBuyer ? 'provider' : 'buyer', response.content as string);

  const updatedMessages = await getMessages(negotiationId);

  return {
    messages: updatedMessages,
    response: response.content as string,
  };
}

export async function proposeNegotiationResult(
  negotiationId: string,
  proposerId: string,
  finalPrice: number,
  scope: { description?: string; rooms?: number },
  options: NegotiateOptions = {}
): Promise<{ resultId: string; response: string; accepted: boolean }> {
  const negotiation = await getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  const result = await createNegotiationResult(negotiationId, proposerId, finalPrice, scope);
  
  const isBuyer = proposerId === negotiation.buyerAgentId;
  const responderId = isBuyer ? negotiation.providerAgentId : negotiation.buyerAgentId;
  const proposerCandidate = isBuyer 
    ? { agentId: negotiation.providerAgentId, name: 'Provider' }
    : { agentId: negotiation.buyerAgentId, name: 'Buyer' };

  const model = createChatModel(options.providerType ?? 'openai');
  
  const prompt = `A negotiation result has been proposed:
- Price: $${finalPrice}
- Scope: ${scope.description ?? `${scope.rooms} rooms`}

Do you accept or reject this proposal? Respond with ACCEPT or REJECT and explain your reasoning.`;

  const response = await model.invoke([
    new SystemMessage(isBuyer ? PROVIDER_AGENT_SYSTEM_PROMPT : BUYER_AGENT_SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);

  const responseText = response.content as string;
  const accepted = responseText.toUpperCase().includes('ACCEPT');
  
  await respondToResult(result.id, accepted ? 'accepted' : 'rejected', responseText);

  if (accepted) {
    await updateNegotiationStatus(negotiationId, 'completed', 
      `Agreed on price $${finalPrice} for ${scope.description ?? `${scope.rooms} rooms`}`);
  }

  return {
    resultId: result.id,
    response: responseText,
    accepted,
  };
}

export async function cancelNegotiation(
  negotiationId: string,
  cancellerId: string,
  reason: string
): Promise<Negotiation> {
  const negotiation = await getNegotiation(negotiationId);
  if (!negotiation || negotiation.status !== 'active') {
    throw new Error('Negotiation not found or not active');
  }

  await addMessage(negotiationId, cancellerId, cancellerId === negotiation.buyerAgentId ? 'buyer' : 'provider', 
    `CANCEL_NEGOTIATION: ${reason}`, 'cancellation');
  
  await updateNegotiationStatus(negotiationId, 'cancelled', reason);
  
  return (await getNegotiation(negotiationId))!;
}
```

### Success Criteria

#### Automated Verification:

- [ ] TypeScript compiles without errors
- [ ] All database functions correctly typed

---

## Phase 5: API Routes

### Overview

Create API routes for negotiation operations.

### Changes Required

#### 1. Start Negotiation Endpoint

**File**: `app/api/agents/negotiate/start/route.ts`
**Changes**: Create POST endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { startNegotiation } from '@/features/agents/negotiation/negotiate';
import { Candidate, UserPreferences, JobScope } from '@/features/agents/selection/types';

interface StartNegotiationRequest {
  buyerAgentId: string;
  candidate: Candidate;
  preferences: UserPreferences;
  scope: JobScope;
  jobId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StartNegotiationRequest = await request.json();
    const { buyerAgentId, candidate, preferences, scope, jobId } = body;

    if (!buyerAgentId) {
      return NextResponse.json({ error: 'buyerAgentId is required' }, { status: 400 });
    }
    if (!candidate?.agentId) {
      return NextResponse.json({ error: 'candidate with agentId is required' }, { status: 400 });
    }
    if (!preferences) {
      return NextResponse.json({ error: 'preferences is required' }, { status: 400 });
    }
    if (!scope) {
      return NextResponse.json({ error: 'scope is required' }, { status: 400 });
    }

    const providerType = process.env.USE_MOCK_LLM === 'true' 
      ? 'mock' 
      : (process.env.LLM_PROVIDER === 'openrouter' ? 'openrouter' : 'openai');

    const negotiation = await startNegotiation(
      buyerAgentId, 
      candidate, 
      preferences, 
      scope, 
      jobId,
      { providerType }
    );

    const messages = await getMessages(negotiation.id);

    return NextResponse.json({ negotiation, messages });
  } catch (error) {
    console.error('Start negotiation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

#### 2. Send Message Endpoint

**File**: `app/api/agents/negotiate/[id]/message/route.ts`
**Changes**: Create POST endpoint for sending messages

This endpoint handles the full negotiation turn:
1. Client sends buyer's message
2. Provider LLM responds
3. Buyer LLM auto-responds (enabling multi-turn autonomous negotiation)

**Response**: Returns `{ messages, buyerResponse, providerResponse }`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendBuyerMessage } from '@/features/agents/negotiation/negotiate';

interface SendMessageRequest {
  buyerAgentId: string;
  message: string;
  candidate: {
    agentId: string;
    name: string;
    basePrice?: number;
    rating: number;
  };
  preferences: {
    budget?: number;
    priority?: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const body: SendMessageRequest = await request.json();
    const { buyerAgentId, message, candidate, preferences } = body;

    if (!buyerAgentId) {
      return NextResponse.json({ error: 'buyerAgentId is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const providerType = process.env.USE_MOCK_LLM === 'true' 
      ? 'mock' 
      : (process.env.LLM_PROVIDER === 'openrouter' ? 'openrouter' : 'openai');

    const result = await sendBuyerMessage(
      negotiationId,
      buyerAgentId,
      message,
      candidate,
      preferences,
      { providerType }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Send message error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

#### 3. Propose Result Endpoint

**File**: `app/api/agents/negotiate/[id]/propose/route.ts`
**Changes**: Create POST endpoint for proposing results

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { proposeNegotiationResult } from '@/features/agents/negotiation/negotiate';

interface ProposeResultRequest {
  proposerId: string;
  finalPrice: number;
  scope: {
    description?: string;
    rooms?: number;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const body: ProposeResultRequest = await request.json();
    const { proposerId, finalPrice, scope } = body;

    if (!proposerId) {
      return NextResponse.json({ error: 'proposerId is required' }, { status: 400 });
    }
    if (!finalPrice || finalPrice <= 0) {
      return NextResponse.json({ error: 'finalPrice must be a positive number' }, { status: 400 });
    }

    const providerType = process.env.USE_MOCK_LLM === 'true' 
      ? 'mock' 
      : (process.env.LLM_PROVIDER === 'openrouter' ? 'openrouter' : 'openai');

    const result = await proposeNegotiationResult(
      negotiationId,
      proposerId,
      finalPrice,
      scope,
      { providerType }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Propose result error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

#### 4. Cancel Negotiation Endpoint

**File**: `app/api/agents/negotiate/[id]/cancel/route.ts`
**Changes**: Create POST endpoint for cancelling

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cancelNegotiation } from '@/features/agents/negotiation/negotiate';

interface CancelRequest {
  cancellerId: string;
  reason: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const body: CancelRequest = await request.json();
    const { cancellerId, reason } = body;

    if (!cancellerId) {
      return NextResponse.json({ error: 'cancellerId is required' }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 });
    }

    const negotiation = await cancelNegotiation(negotiationId, cancellerId, reason);

    return NextResponse.json({ negotiation });
  } catch (error) {
    console.error('Cancel negotiation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

#### 5. Get Negotiation Endpoint

**File**: `app/api/agents/negotiate/[id]/route.ts`
**Changes**: Create GET endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getNegotiation, getMessages } from '@/features/agents/negotiation/db/negotiations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: negotiationId } = await params;
    const negotiation = await getNegotiation(negotiationId);

    if (!negotiation) {
      return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    const messages = await getMessages(negotiationId);

    return NextResponse.json({ negotiation, messages });
  } catch (error) {
    console.error('Get negotiation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### Success Criteria

#### Automated Verification:

- [ ] All routes compile without errors
- [ ] Routes follow existing API patterns from `app/api/agents/select-top3/route.ts`

---

## Phase 6: Integration with Step 5

### Overview

Integrate negotiation into the existing agent selection flow.

### Changes Required

#### 1. Update Selection Response

**File**: `features/agents/selection/types/SelectTop3Response.ts`
**Changes**: Add negotiation fields

```typescript
export interface SelectTop3Response {
  top3: SelectedCandidate[];
  summary: string;
  negotiationIds?: string[];
}
```

#### 2. Negotiation Orchestration

**File**: `features/agents/negotiation/runNegotiations.ts`
**Changes**: Run negotiations for all top 3 candidates

```typescript
import { SelectedCandidate } from '../selection/types';
import { startNegotiation, cancelNegotiation } from './negotiate';
import { UserPreferences, JobScope, Candidate } from '../selection/types';

export interface RunNegotiationsOptions {
  buyerAgentId: string;
  candidates: SelectedCandidate[];
  preferences: UserPreferences;
  scope: JobScope;
  jobId?: string;
  providerType?: 'openai' | 'openrouter' | 'mock';
  maxRounds?: number;
}

export interface NegotiationOutcome {
  negotiationId: string;
  candidateId: string;
  status: 'completed' | 'cancelled' | 'failed';
  finalPrice?: number;
  summary?: string;
}

export async function runNegotiations(
  options: RunNegotiationsOptions
): Promise<NegotiationOutcome[]> {
  const { buyerAgentId, candidates, preferences, scope, jobId, providerType, maxRounds = 3 } = options;
  const outcomes: NegotiationOutcome[] = [];

  for (const selected of candidates) {
    try {
      const negotiation = await startNegotiation(
        buyerAgentId,
        selected.candidate,
        preferences,
        scope,
        jobId,
        { providerType }
      );

      outcomes.push({
        negotiationId: negotiation.id,
        candidateId: selected.candidate.agentId,
        status: 'completed',
        summary: negotiation.summary,
      });
    } catch (error) {
      outcomes.push({
        negotiationId: '',
        candidateId: selected.candidate.agentId,
        status: 'failed',
        summary: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return outcomes;
}
```

### Success Criteria

#### Automated Verification:

- [ ] Integration compiles without errors
- [ ] Follows existing patterns from Step 5

---

## Testing Strategy

### Unit Tests:

- Zod schema validation
- Database mapping functions
- Prompt builder functions

### Integration Tests:

- API endpoints return correct status codes
- Database operations persist data correctly
- LLM calls properly formatted

### Manual Testing Steps:

1. Start negotiation with a candidate - verify messages appear
2. Send messages back and forth - verify conversation flows
3. Propose a result - verify acceptance/rejection works
4. Cancel negotiation - verify status updates
5. Check Supabase - verify all data persisted

---

## Performance Considerations

- LLM calls are synchronous and may take several seconds
- Consider running negotiations in parallel for multiple candidates
- Add caching for repeated candidate lookups
- Consider rate limiting for LLM provider calls

## Migration Notes

- Supabase needs to be provisioned first (environment variables)
- Run migration to create tables before deploying
- No existing data migration needed (new feature)

---

## References

- Original research: `thoughts/shared/research/2026-02-28-ENG-agent-negotiation-step6.md`
- Step 5 implementation: `features/agents/selection/selectTop3.ts:21-61`
- LLM providers: `features/agents/reasoning/providers/index.ts:9-20`
- API pattern: `app/api/agents/select-top3/route.ts`
