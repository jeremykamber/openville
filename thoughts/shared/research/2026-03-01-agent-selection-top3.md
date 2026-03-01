---
date: 2026-03-01T00:41:05Z
researcher: Jeremy
git_commit: b684a3434e382c1e3e91224ec4c621e92aac970b
branch: feat/agent-top3-candidate-selection
repository: openville
topic: "Agent Selection - LLM takes top 10, applies human priorities, narrows to top 3 candidates"
tags: [research, codebase, agent-selection, llm-reasoning]
status: complete
last_updated: 2026-03-01
last_updated_by: Jeremy
---

# Research: Agent Selection - LLM takes top 10, applies human priorities, narrows to top 3 candidates

**Date**: 2026-03-01T00:41:05Z
**Researcher**: Jeremy
**Git Commit**: b684a3434e382c1e3e91224ec4c621e92aac970b
**Branch**: feat/agent-top3-candidate-selection
**Repository**: openville

## Research Question

How does the codebase currently implement agent selection - where an LLM takes top 10 candidates, applies human priorities, and narrows to top 3 candidates?

## Summary

The agent selection functionality is **not yet implemented** in the codebase. Only the foundational module structure and a TypeScript type definition for `Candidate` exist. The planned API endpoints and LLM reasoning logic need to be developed according to the specification in `context/responsbilities.md`.

## Detailed Findings

### Planned Module Structure

According to `context/responsbilities.md`, the Agent Reasoning & Negotiation module (Dev 3) should handle:

- **Step 5: Agent Selection** — LLM reasoner takes top 10, applies human priorities, narrows to top 3 candidates
- **Step 6: Agent-to-Agent Negotiation** — For each of the 3 candidates, send negotiation prompts
- **Step 7: Final Selection** — LLM reasoner compares negotiation outcomes, selects winner

### Current Implementation State

#### Directory Structure Created (`features/agents/`)

The following directory structure has been scaffolded:

```
features/agents/
├── api/              # API endpoints (empty)
├── negotiation/      # Negotiation logic (empty)
├── reasoning/        # Reasoning logic (empty)
└── selection/
    └── types/
        └── Candidate.ts  # Type definition only
```

#### Candidate Type Definition

File: `features/agents/selection/types/Candidate.ts:1-9`

```typescript
export interface Candidate {
  agentId: string;
  name: string;
  score: number;
  relevance: number;
  successCount: number;
  rating: number;
  [key: string]: any;
}
```

This interface defines the structure for candidate tradespeople returned from the search/ranking step (Step 4 of the user flow).

### Expected API Endpoints (Not Yet Implemented)

According to the specification in `context/responsbilities.md`, the following API endpoints should be created:

| Endpoint | Purpose | Input | Output |
|----------|---------|-------|--------|
| `POST /api/agents/select-top3` | Narrow top 10 to top 3 | `{ top10: [...], userPreferences: object }` | `{ top3: [...] }` |
| `POST /api/agents/negotiate` | Run negotiation with candidate | `{ candidateId: string, scope: object, userPreferences: object }` | `{ discount: number\|null, compromises: [...], refinedScope: object }` |
| `POST /api/agents/select-winner` | Make final choice | `{ negotiations: [...], userPreferences: object }` | `{ selectedAgentId: string, reasoning: string }` |

### User Flow Context

From `context/user_flow.md`, Step 5 is described as:

> **Step 5: Agent Reasoning.** The AI agent analyzes the top 10 results, considers the human's priorities and preferences, and narrows it down to a top 3 list of candidates.

The flow diagram shows this happening after the search/ranking returns the top 10 candidates:

```
[Platform Search (RAG + Ranking)]  --> returns Top 10
        |
        v
[User's AI Agent (Narrows to Top 3 based on human priorities)]
```

### Implementation Requirements (Documented)

The specification calls for:

1. **LLM prompt templates** for reasoning and negotiation
2. **Tradesperson agent mock/handler** (can be simple rule-based for MVP)
3. **Reasoning logic** to apply human priorities when selecting top 3 from top 10

## Code References

- `features/agents/selection/types/Candidate.ts:1-9` — Candidate interface
- `context/responsbilities.md:51-78` — Dev 3 specification (Agent Reasoning & Negotiation)
- `context/user_flow.md:25-27` — Step 5 description

## Architecture Documentation

### Module Connection (from context)

```
[Dev 1: Chat UI] 
       |
       | POST /api/chat/message
       v
[Dev 2: Search API] -----> [Dev 3: Agent Reasoning]
       |                        |
       | POST /api/search      | POST /api/agents/*
       v                        v
[Dev 1: Display Results]  [Dev 3: Negotiation Loop]
       |                        |
       |                        | POST /api/agents/select-winner
       v                        v
[Dev 4: Payment UI] <------ [Dev 4: Transaction API]
```

### Git-Friendly Module Structure (from context)

```
src/
├── chat/              # Dev 1: Chat UI components
├── search/            # Dev 2: Search & ranking
├── agents/            # Dev 3: Agent reasoning
│   ├── reasoning/
│   ├── negotiation/
│   └── api.ts
├── transaction/       # Dev 4: Payment & transactions
└── shared/            # Shared types, utils
```

Note: The codebase currently uses `features/` directory instead of `src/`.

## Historical Context (from thoughts/)

No existing research documents found in `thoughts/shared/` or `thoughts/research/` related to agent selection.

## Related Research

No related research documents exist at this time.

## Open Questions

1. Where will the API routes be implemented? (Currently no `app/api/agents/` directory exists)
2. What LLM provider will be used for the reasoning logic?
3. Are there existing prompt templates or should they be created from scratch?
4. Will the tradesperson agent mock be rule-based or use actual LLM calls?
