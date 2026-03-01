---
date: 2026-02-28T18:11:47-08:00
researcher: dominion
git_commit: b684a34
branch: feature/search-and-ranking
repository: openville
topic: "Dev 2 Search & Ranking Implementation Plan"
tags: [implementation, dev2, search, ranking, rag]
status: complete
last_updated: 2026-02-28
last_updated_by: dominion
type: implementation_strategy
---

# Handoff: Dev 2 Search & Ranking Implementation Plan

## Task(s)

Created a comprehensive implementation plan for Dev 2 (Search & Ranking Engine) covering Steps 3-4 of the user flow. The plan includes:

- 10-step implementation walkthrough
- All TypeScript interfaces (SearchRequest, SearchResponse, SearchResult)
- Mock data structure (50 tradespeople)
- RAG pipeline (embedding + vector similarity)
- Ranking algorithm with 4 factors
- API endpoint specification
- Unit tests structure

**Status:** Complete - plan is ready for implementation

## Critical References

- `context/user_flow.md` - Documents Steps 3-4 requirements
- `context/responsbilities.md` - Dev 2 scope definition
- `thoughts/shared/plans/2026-02-28-dev2-complete-plan.md` - Full implementation plan

## Recent changes

- Created `features/search/types/index.ts:1-53` - All TypeScript interfaces for Dev 2
- Created `features/search/data/mockTradespeople.ts:1-2` - Started mock data file (placeholder)

## Learnings

Key design decisions made during planning:
1. **Single interface approach:** Using `SearchResult` with optional `embedding` field instead of separate `TrendingPerson` type - simplifies the codebase
2. **Direct yearsOnPlatform:** Storing `yearsOnPlatform` directly in mock data instead of `createdAt` (no calculation needed in API)
3. **Embedding cleanup:** API strips `embedding` field before returning response to Dev 3 (not sent to other devs)
4. **Simplified ranking:** 4 factors with configurable weights (relevance: 0.4, successCount: 0.2, rating: 0.2, timeOnPlatform: 0.1)

## Artifacts

- `thoughts/shared/plans/2026-02-28-dev2-complete-plan.md` - Complete 10-step implementation plan
- `features/search/types/index.ts` - Implemented interfaces
- `features/search/data/mockTradespeople.ts` - Placeholder for mock data

## Action Items & Next Steps

**For Developer 2 (Luis):** Implement the 10 files in order:
1. Create types file (DONE)
2. Complete mock data (50 entries)
3. Create embeddings.ts
4. Create services: embedding.ts, vectorSimilarity.ts, ragSearch.ts
5. Create ranking.ts and ranking.test.ts
6. Create API endpoint: app/api/search/ranked/route.ts
7. Create exports: features/search/index.ts

## Other Notes

- **Dev 2 scope boundaries strictly enforced:** Plan does NOT include any work for Dev 1, Dev 3, or Dev 4
- **Interface clarity:** Dev 1 knows what to send (SearchRequest), Dev 3 knows what to expect (SearchResponse with SearchResult[])
- **No dependencies on other modules:** Dev 2 is fully standalone
- **MVP approach:** Using deterministic mock embeddings (not real RAG) for testing
