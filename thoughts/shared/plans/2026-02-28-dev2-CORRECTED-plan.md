# Dev 2: Search & Ranking Engine - CORRECTED Implementation Plan

## Overview

This is Developer 2's (Luis) implementation plan for the Search & Ranking Engine.
Only implement what is listed here. DO NOT touch Dev 1, Dev 3, or Dev 4 tasks.

---

## What Dev 2 OWNS

- Step 3: RAG Search - Find top 50 relevant tradespeople
- Step 4: Ranking Algorithm - Score and rank top 10 candidates

## What Dev 2 DOES NOT OWN

| What | Who Owns It |
|------|-------------|
| Chat UI | Dev 1 (Yonie) |
| Agent reasoning/selection | Dev 3 (Jeremy) |
| Agent-to-agent negotiation | Dev 3 (Jeremy) |
| Transaction/payment | Dev 4 |
| Any file in `features/chat/` | Dev 1 |
| Any file in `features/agents/` | Dev 3 |
| Any file in `features/transaction/` | Dev 4 |

---

## Interface: Input (From Dev 1)

Dev 1 will send this to your API:

```typescript
interface SearchRequest {
  query: string;                              // e.g., "fix my gutters"
  userPreferences?: {
    budget?: number;                         // e.g., 500
    priority?: 'cost' | 'quality' | 'speed';
    location?: string;
    availability?: 'any' | 'weekdays' | 'weekends';
  };
  filters?: {
    serviceCategories?: string[];             // e.g., ['gutter repair']
    minRating?: number;                       // e.g., 4.0
    minSuccessCount?: number;                 // e.g., 10
    maxHourlyRate?: number;                   // e.g., 100
    location?: string;                        // e.g., 'NYC'
  };
  limit?: number;                             // default 10, max 50
}
```

---

## Interface: Output (To Dev 3)

Your API returns this to Dev 1, who passes it to Dev 3:

```typescript
interface SearchResponse {
  candidates: SearchResult[];                // Top 10 ranked tradespeople
  totalFound: number;                        // Total matches found (max 50)
  query: string;                             // Echo back the query
  rankingWeights: {
    relevance: number;       // 0.4
    successCount: number;    // 0.2
    rating: number;          // 0.2
    timeOnPlatform: number;  // 0.1
  };
}

interface SearchResult {
  agentId: string;            // Unique ID for Dev 3 to reference
  name: string;               // Business name
  score: number;              // Final composite score (0-1)
  relevance: number;          // RAG vector similarity (0-1)
  successCount: number;       // Jobs completed
  rating: number;             // Customer rating (1-5)
  yearsOnPlatform: number;   // How long on platform
  location: string;           // e.g., 'NYC'
  services: string[];         // e.g., ['gutter repair', 'roofing']
  hourlyRate: number;         // e.g., 75
  description?: string;       // Business description
  tags?: string[];            // e.g., ['gutters', 'roofing', 'exterior']
}
```

**IMPORTANT:** The `embedding` field is INTERNAL ONLY. Strip it before sending to Dev 3.

---

## Step-by-Step Implementation

### Step 1: Types File

**File:** `features/search/types/index.ts`

**Status:** DONE - No action needed

```typescript
// INPUT TYPES
export interface UserPreferences {
  budget?: number;
  priority?: 'cost' | 'quality' | 'speed';
  location?: string;
  availability?: 'any' | 'weekdays' | 'weekends';
}

export interface SearchRequest {
  query: string;
  userPreferences?: UserPreferences;
  filters?: SearchFilters;
  limit?: number;
}

export interface SearchFilters {
  serviceCategories?: string[];
  minRating?: number;
  minSuccessCount?: number;
  maxHourlyRate?: number;
  location?: string;
}

// OUTPUT TYPES
export interface SearchResult {
  agentId: string;
  name: string;
  score: number;
  relevance: number;
  successCount: number;
  rating: number;
  yearsOnPlatform: number;
  location: string;
  services: string[];
  hourlyRate: number;
  description?: string;
  tags?: string[];
  embedding?: number[];  // INTERNAL ONLY - strip before output
}

export interface SearchResponse {
  candidates: SearchResult[];
  totalFound: number;
  query: string;
  rankingWeights: RankingWeights;
}

export interface RankingWeights {
  relevance: number;
  successCount: number;
  rating: number;
  timeOnPlatform: number;
}
```

---

### Step 2: Mock Data

**File:** `features/search/data/mockTradespeople.ts`

**Status:** INCOMPLETE - Must add 50 entries

Create this file with 50 mock tradespeople. Vary:
- Services: plumbing, electrical, painting, hvac, roofing, carpentry, landscaping, gutter repair, etc.
- Locations: NYC, LA, Chicago, Houston, Phoenix, Miami
- Ratings: 3.0 to 5.0
- Success count: 5 to 250
- Hourly rate: $40 to $200
- Years on platform: 0.5 to 10

Include this helper function at the bottom:

```typescript
// Deterministic mock embedding generator (NOT real AI embeddings)
export function generateMockEmbedding(text: string): number[] {
  const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 1536 }, (_, i) => 
    Math.sin(seed * (i + 1)) * 0.5 + 0.5
  );
}
```

---

### Step 3: Pre-computed Embeddings

**File:** `features/search/data/embeddings.ts`

```typescript
import { SearchResult } from '../types';
import { mockTradespeople, generateMockEmbedding } from './mockTradespeople';

export const tradespeopleWithEmbeddings: SearchResult[] = mockTradespeople.map(person => ({
  ...person,
  embedding: generateMockEmbedding(`${person.name} ${person.description} ${person.services.join(' ')}`)
}));
```

---

### Step 4: Embedding Service

**File:** `features/search/services/embedding.ts`

```typescript
import { generateMockEmbedding } from '../data/mockTradespeople';

export class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    return generateMockEmbedding(text);
  }
}

export const embeddingService = new EmbeddingService();
```

---

### Step 5: Vector Similarity

**File:** `features/search/services/vectorSimilarity.ts`

```typescript
export class VectorSimilarity {
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimension');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const vectorSimilarity = new VectorSimilarity();
```

---

### Step 6: RAG Search Service

**File:** `features/search/services/ragSearch.ts`

```typescript
import { SearchResult, SearchRequest, SearchFilters } from '../types';
import { embeddingService } from './embedding';
import { vectorSimilarity } from './vectorSimilarity';
import { tradespeopleWithEmbeddings } from '../data/embeddings';

export class RAGSearchService {
  async search(request: SearchRequest): Promise<{
    results: SearchResult[];
    queryEmbedding: number[];
  }> {
    // Step 1: Generate embedding from query
    const queryEmbedding = await embeddingService.generateEmbedding(request.query);
    
    // Step 2: Calculate similarity scores for all tradespeople
    const scoredResults = tradespeopleWithEmbeddings.map(person => {
      const relevance = person.embedding 
        ? vectorSimilarity.cosineSimilarity(queryEmbedding, person.embedding)
        : 0;
      
      return { ...person, relevance };
    });
    
    // Step 3: Apply filters if provided
    let filteredResults = scoredResults;
    
    if (request.filters) {
      filteredResults = this.applyFilters(filteredResults, request.filters);
    }
    
    // Step 4: Sort by relevance and return top 50
    return {
      results: filteredResults
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 50),
      queryEmbedding
    };
  }
  
  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter(person => {
      // Filter by service categories
      if (filters.serviceCategories?.length) {
        const hasService = person.services.some(s => 
          filters.serviceCategories!.some(cat => 
            s.toLowerCase().includes(cat.toLowerCase())
          )
        );
        if (!hasService) return false;
      }
      
      // Filter by minimum rating
      if (filters.minRating && person.rating < filters.minRating) {
        return false;
      }
      
      // Filter by minimum success count
      if (filters.minSuccessCount && person.successCount < filters.minSuccessCount) {
        return false;
      }
      
      // Filter by maximum hourly rate
      if (filters.maxHourlyRate && person.hourlyRate > filters.maxHourlyRate) {
        return false;
      }
      
      // Filter by location
      if (filters.location && !person.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }
}

export const ragSearchService = new RAGSearchService();
```

---

### Step 7: Ranking Service

**File:** `features/search/services/ranking.ts`

```typescript
import { SearchResult, RankingWeights, UserPreferences } from '../types';

export class RankingService {
  private defaultWeights: RankingWeights = {
    relevance: 0.4,
    successCount: 0.2,
    rating: 0.2,
    timeOnPlatform: 0.1
  };
  
  rankCandidates(
    candidates: SearchResult[],
    userPreferences?: UserPreferences,
    customWeights?: Partial<RankingWeights>
  ): SearchResult[] {
    const weights = { ...this.defaultWeights, ...customWeights };
    
    return candidates.map(candidate => {
      // Normalize each factor to 0-1 range
      const relevanceScore = candidate.relevance;
      
      // Normalize success count (assuming max ~500)
      const successScore = Math.min(candidate.successCount / 500, 1);
      
      // Normalize rating (1-5 scale to 0-1)
      const ratingScore = candidate.rating / 5;
      
      // Normalize time on platform (assuming max 10 years)
      const timeScore = Math.min(candidate.yearsOnPlatform / 10, 1);
      
      // Calculate base composite score
      let compositeScore = 
        (relevanceScore * weights.relevance) +
        (successScore * weights.successCount) +
        (ratingScore * weights.rating) +
        (timeScore * weights.timeOnPlatform);
      
      // Apply user preference adjustments
      if (userPreferences?.budget && candidate.hourlyRate) {
        const budgetRatio = userPreferences.budget / candidate.hourlyRate;
        if (budgetRatio < 1) {
          // Candidate is over budget - penalize score
          compositeScore *= 0.5;
        } else if (budgetRatio > 1.5) {
          // Candidate is well under budget - bonus
          compositeScore *= 1.1;
        }
      }
      
      // Priority adjustments
      if (userPreferences?.priority === 'cost' && candidate.hourlyRate) {
        const rateBonus = Math.max(0, (200 - candidate.hourlyRate) / 200) * 0.1;
        compositeScore += rateBonus;
      } else if (userPreferences?.priority === 'quality') {
        const qualityBonus = (candidate.rating - 3) * 0.05;
        compositeScore += Math.max(0, qualityBonus);
      }
      
      return {
        ...candidate,
        score: Math.min(compositeScore, 1)
      };
    });
  }
  
  setWeights(weights: Partial<RankingWeights>): void {
    this.defaultWeights = { ...this.defaultWeights, ...weights };
  }
}

export const rankingService = new RankingService();
```

---

### Step 8: Unit Tests

**File:** `features/search/services/ranking.test.ts`

```typescript
import { rankingService } from './ranking';
import { SearchResult } from '../types';

describe('RankingService', () => {
  const mockCandidates: SearchResult[] = [
    {
      agentId: '1',
      name: 'High Rating Pro',
      score: 0,
      relevance: 0.9,
      successCount: 200,
      rating: 4.9,
      yearsOnPlatform: 5,
      location: 'NYC',
      services: ['plumbing'],
      hourlyRate: 100
    },
    {
      agentId: '2',
      name: 'Budget Friendly',
      score: 0,
      relevance: 0.7,
      successCount: 50,
      rating: 4.0,
      yearsOnPlatform: 1,
      location: 'NYC',
      services: ['plumbing'],
      hourlyRate: 50
    },
    {
      agentId: '3',
      name: 'Newbie',
      score: 0,
      relevance: 0.8,
      successCount: 10,
      rating: 3.5,
      yearsOnPlatform: 0.5,
      location: 'NYC',
      services: ['plumbing'],
      hourlyRate: 40
    }
  ];
  
  test('ranks by composite score by default', () => {
    const ranked = rankingService.rankCandidates(mockCandidates);
    expect(ranked[0].agentId).toBe('1');
  });
  
  test('prioritizes cost when budget is set', () => {
    const ranked = rankingService.rankCandidates(
      mockCandidates,
      { budget: 60, priority: 'cost' }
    );
    expect(ranked[0].agentId).toBe('2');
  });
  
  test('penalizes over-budget candidates', () => {
    const ranked = rankingService.rankCandidates(
      mockCandidates,
      { budget: 45 }
    );
    expect(ranked[2].score).toBeLessThan(ranked[2].relevance);
  });
  
  test('respects custom weights', () => {
    const ranked = rankingService.rankCandidates(
      mockCandidates,
      undefined,
      { relevance: 0.8, successCount: 0.2 }
    );
    expect(ranked[0].agentId).toBe('1');
  });
});
```

---

### Step 9: API Endpoint

**File:** `app/api/search/ranked/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SearchRequest, SearchResponse, SearchResult } from '@/features/search/types';
import { ragSearchService } from '@/features/search/services/ragSearch';
import { rankingService } from '@/features/search/services/ranking';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse and validate request
    const body: SearchRequest = await request.json();
    
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Step 2: Set limit (default 10, max 50)
    const limit = Math.min(body.limit || 10, 50);
    
    // Step 3: Execute RAG search (get top 50)
    const { results: ragResults } = await ragSearchService.search({
      query: body.query,
      userPreferences: body.userPreferences,
      filters: body.filters,
      limit: 50
    });
    
    // Step 4: Clean up results (remove internal embedding field)
    const candidates: SearchResult[] = ragResults.map(person => {
      const { embedding, ...rest } = person; // Remove embedding from output
      return rest;
    });
    
    // Step 5: Apply ranking
    const rankedCandidates = rankingService.rankCandidates(
      candidates,
      body.userPreferences
    );
    
    // Sort by score descending
    rankedCandidates.sort((a, b) => b.score - a.score);
    
    // Step 6: Build response
    const response: SearchResponse = {
      candidates: rankedCandidates.slice(0, limit),
      totalFound: ragResults.length,
      query: body.query,
      rankingWeights: {
        relevance: 0.4,
        successCount: 0.2,
        rating: 0.2,
        timeOnPlatform: 0.1
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Step 10: Exports

**File:** `features/search/index.ts`

```typescript
export * from './types';
export { ragSearchService } from './services/ragSearch';
export { rankingService } from './services/ranking';
export { embeddingService } from './services/embedding';
```

---

## Summary: All Files to Create

| Step | File | Status |
|------|------|--------|
| 1 | `features/search/types/index.ts` | DONE |
| 2 | `features/search/data/mockTradespeople.ts` | INCOMPLETE - Add 50 entries |
| 3 | `features/search/data/embeddings.ts` | NOT STARTED |
| 4 | `features/search/services/embedding.ts` | NOT STARTED |
| 5 | `features/search/services/vectorSimilarity.ts` | NOT STARTED |
| 6 | `features/search/services/ragSearch.ts` | NOT STARTED |
| 7 | `features/search/services/ranking.ts` | NOT STARTED |
| 8 | `features/search/services/ranking.test.ts` | NOT STARTED |
| 9 | `app/api/search/ranked/route.ts` | NOT STARTED |
| 10 | `features/search/index.ts` | NOT STARTED |

**Total: 10 files to create (1 done, 1 incomplete, 8 not started)**

---

## Complete Your Work

Once you finish all 10 steps:
1. Dev 1 can send queries to `POST /api/search/ranked`
2. Dev 3 will receive the response and can do their work
3. Your job is DONE
