---
date: 2026-02-28T22:43:04-08:00
git_commit: 1af26d646f63a4385b3a1897b869e29074d5e7b6
branch: feat/agent-final-selection
repository: openville
topic: "LLM reasoner for negotiation outcome comparison and winner selection"
tags: [research, codebase, negotiation, llm, selection]
status: complete
---

# Research: LLM Reasoner for Negotiation Outcome Comparison and Winner Selection

## Research Question

Make it so that an LLM reasoner compares negotiation outcomes, applies human priorities, selects winner

## Summary

The codebase currently has negotiation logic that runs between buyer and provider agents, producing NegotiationResult outcomes stored in database. Selection logic exists for top-3 candidates using LLM with priority application, but no final winner selection after negotiations. External research shows LLMs can effectively compare outcomes and select winners using structured prompting, Chain-of-Thought reasoning, and priority weighting, but have limitations in arithmetic and susceptibility to adversarial inputs.

## Detailed Findings

### Negotiation System Components

- **Negotiation Execution**: `features/agents/negotiation/runNegotiations.ts` runs negotiations with multiple candidates, returning NegotiationOutcome array
- **Outcome Storage**: NegotiationResult types include status, pricing, scope, compromises; stored in negotiation_results table via SupabaseNegotiationRepository
- **Current Selection**: Top-3 selection in `features/agents/selection/selectTop3.ts` applies priorities ('cost', 'quality', 'speed', 'rating') using LLM with structured output
- **API Endpoints**: `/api/agents/select-top3`, `/api/agents/negotiate/start`, `/api/agents/negotiate/[id]` for negotiation management
- **Planned but Missing**: Winner selection endpoint `/api/agents/select-winner` mentioned in plans but not implemented

### LLM Integration Patterns

- **Provider Abstraction**: `createChatModel()` factory supports OpenAI, OpenRouter, mock providers
- **Structured Output**: Uses `withStructuredOutput()` with Zod schemas for deterministic responses
- **Prompt Engineering**: Separate system/user prompts for buyer and provider roles in negotiations
- **Multi-turn Conversations**: Negotiation uses dual LLM agents (buyer/provider) with message persistence

### Existing Selection Patterns

- **Weighted Scoring**: `features/search/services/ranking.ts` applies composite scores with priority bonuses/penalties
- **LLM Selection**: `selectTop3.ts` uses LLM to choose top 3 candidates with reasoning and match scores
- **Score Sorting**: Descending sort by score used throughout ranking and selection
- **Priority Weighting**: Different scoring formulas for cost, quality, speed, rating priorities

### External Best Practices

- **NegotiationArena Framework**: Uses structured CoT prompting for multi-agent negotiations, evaluates outcomes by BATNA thresholds and collective scores
- **Real-time LLM Support**: LLMs can provide summaries, emotion analysis, compromise suggestions during negotiations
- **Post-analysis**: LLMs compare strategies against theories, simulate alternative outcomes
- **Limitations**: Arithmetic deficits, susceptibility to prompt hacking, irrational behaviors in ultimatum games

## SOLID Notes

### Negotiation Components
- **S (Single Responsibility)**: `negotiate.ts` handles negotiation logic (line 22-52), `SupabaseNegotiationRepository.ts` handles data access - separate concerns observed
- **O (Open/Closed)**: Factory pattern in providers allows extension with new LLM providers without modifying existing code
- **L (Liskov Substitution)**: ChatModel interface allows different implementations (OpenAI, OpenRouter) to be substituted
- **I (Interface Segregation)**: ChatModel interface has focused methods (invoke, withStructuredOutput) without forcing unused methods
- **D (Dependency Inversion)**: Repository pattern abstracts database operations behind NegotiationRepository interface

### Selection Components
- **S**: `selectTop3.ts` focuses on LLM selection, `ranking.ts` on weighted scoring - separate responsibilities
- **O**: Structured output schemas allow adding new response formats without changing core logic
- **L**: UserPreferences.priority enum allows different priority types to be processed uniformly
- **I**: SelectTop3Options interface has optional parameters without forcing all to be provided
- **D**: Ranking service depends on abstractions (UserPreferences interface) rather than concrete types

## Code References

- `features/agents/negotiation/runNegotiations.ts:1` - Core negotiation execution
- `features/agents/negotiation/types/NegotiationResult.ts:1` - Outcome type definitions
- `features/agents/selection/selectTop3.ts:21` - Current LLM selection logic
- `features/agents/reasoning/providers/index.ts:9` - LLM provider factory
- `features/search/services/ranking.ts:11` - Weighted scoring pattern
- `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md:591` - Planned winner selection function

## Open Questions

- How to integrate winner selection into existing negotiation workflow?
- What metrics to use for comparing negotiation outcomes beyond discount and compromises?
- How to handle ties or edge cases in winner selection?
- Should winner selection use same LLM provider as negotiation or separate one?