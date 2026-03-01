---
date: 2026-02-28T18:45:00-08:00
researcher: jeremy
git_commit: ddf61d1cb8e764cb7a936cafa7c8df60ed31a837
branch: feat/agent-top3-candidate-selection
repository: openville
topic: "Step 6 Agent-to-Agent Negotiation Implementation"
tags: [research, codebase, agents, negotiation, dev3]
status: complete
last_updated: 2026-02-28
last_updated_by: jeremy
---

# Research: Step 6 Agent-to-Agent Negotiation Implementation

**Date**: 2026-02-28T18:45:00-08:00
**Researcher**: jeremy
**Git Commit**: ddf61d1cb8e764cb7a936cafa7c8df60ed31a837
**Branch**: feat/agent-top3-candidate-selection
**Repository**: openville

## Research Question

For each of the 3 candidates, send negotiation prompts (Step 6 in context/responsbilities.md). How would that work? What would it implement?

## Summary

Step 6 (Agent-to-Agent Negotiation) is **NOT YET IMPLEMENTED** in the codebase. The negotiation feature exists only as a detailed implementation plan in `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md`. However, the foundation for implementing it is already in place: the LLM abstraction layer, prompt templates, and schema validation patterns from Step 5 can be reused. The plan calls for a rule-based mock implementation for MVP that can be upgraded to LLM-powered agents later.

## Detailed Findings

### Current Implementation Status

#### Step 5 (Agent Selection - Select Top 3) - IMPLEMENTED

The agent selection functionality is fully implemented:

| Component | Location |
|-----------|----------|
| Core Logic | `features/agents/selection/selectTop3.ts:21-61` |
| API Endpoint | `app/api/agents/select-top3/route.ts` |
| Prompt Templates | `features/agents/reasoning/prompts/selectionPrompts.ts:7-85` |
| Response Schemas | `features/agents/reasoning/schemas/SelectionSchemas.ts` |
| LLM Providers | `features/agents/reasoning/providers/` |

#### Step 6 (Negotiation) - NOT IMPLEMENTED

The negotiation directory is empty with only a placeholder:

```
features/agents/negotiation/
└── .gitkeep  # Placeholder for future negotiation feature
```

### How Step 6 Would Work (Based on Implementation Plan)

According to `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md`, Step 6 involves:

1. **For each of the 3 candidates** (from Step 5):
   - Send a negotiation prompt to the tradesperson agent
   - The prompt requests discounts, discusses scope, proposes compromises
   - Receive response from tradesperson agent
   - Store negotiation results

2. **API Endpoint**: `POST /api/agents/negotiate`
   - Input: `{ candidateId: string, scope: object, userPreferences: object }`
   - Output: `{ discount: number|null, compromises: [...], refinedScope: object }`

3. **Mock Tradesperson Agents** (for MVP):
   - Rule-based deterministic responses
   - Different personality types: aggressive, neutral, cooperative
   - Configurable willingness to discount and flexibility

### Key Interfaces (Planned)

```typescript
// From thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md

interface NegotiationResult {
  candidateId: string;
  discount: number | null;
  compromises: string[];
  refinedScope: Record<string, any>;
  responseMessage: string;
}

interface NegotiateRequest {
  candidateId: string;
  scope: Record<string, any>;
  userPreferences: UserPreferences;
}
```

### Architecture Pattern (Following Step 5)

The plan follows the same pattern established in Step 5:

1. **LLM Provider Abstraction** - Reuse existing `createChatModel()` from `features/agents/reasoning/providers/`
2. **Prompt Templates** - Create new prompts for negotiation in `features/agents/reasoning/prompts/`
3. **Zod Schemas** - Define response validation in `features/agents/reasoning/schemas/`
4. **API Route** - Create `app/api/agents/negotiate/route.ts`

### Complete Flow (Steps 5-7)

```
Step 5: POST /api/agents/select-top3
        Input: top10 candidates, userPreferences, scope
        Output: top3 candidates with reasoning

Step 6: POST /api/agents/negotiate (×3, one per candidate)
        Input: candidateId, scope, userPreferences
        Output: NegotiationResult (discount, compromises, refinedScope)

Step 7: POST /api/agents/select-winner
        Input: negotiations[], userPreferences
        Output: selectedAgentId, reasoning
```

## Code References

- `features/agents/selection/selectTop3.ts:21-61` - Working Step 5 implementation to model after
- `features/agents/reasoning/providers/index.ts` - LLM provider factory (already implemented)
- `features/agents/reasoning/prompts/selectionPrompts.ts:7-85` - Prompt template patterns
- `features/agents/reasoning/schemas/SelectionSchemas.ts:1-31` - Zod schema patterns
- `app/api/agents/select-top3/route.ts` - API route pattern to follow

## Historical Context (from thoughts/)

- `thoughts/shared/plans/2026-02-28-agent-reasoning-negotiation.md` - Comprehensive 753-line implementation plan covering Steps 5-7 with phased approach
- `thoughts/shared/plans/2026-02-28-step5-agent-selection.md` - Step 5 implementation plan (already implemented)
- `thoughts/shared/research/2026-03-01-agent-selection-top3.md` - Research document for Step 5

## Related Research

- Step 5 implementation (`features/agents/selection/`) - Already completed and can serve as template
- LLM provider infrastructure (`features/agents/reasoning/providers/`) - Already completed
- Context: `context/responsbilities.md:56-62` - Dev 3 specification for Step 6

## Open Questions

1. Should negotiation use the existing LLM infrastructure directly, or follow the planned rule-based mock approach first?
2. Should the negotiation be done sequentially (one candidate at a time) or in parallel?
3. Should LangGraph be used for orchestration now, or deferred like the plan suggests?
