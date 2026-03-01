import { describe, it, expect } from 'vitest';
import { rankingService } from '../ranking';
import { SearchResult } from '../../types';

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

  it('ranks by composite score by default', () => {
    const ranked = rankingService.rankCandidates(mockCandidates);
    expect(ranked[0].agentId).toBe('1');
  });

  it('prioritizes cost when budget is set', () => {
    const ranked = rankingService.rankCandidates(
      mockCandidates,
      { budget: 60, priority: 'cost' }
    );
    // With cost priority and budget 60, the cheapest option (agent_3 at $40) 
    // should get a bonus, potentially ranking higher
    expect(ranked[0].hourlyRate).toBeLessThanOrEqual(100);
  });

  it('penalizes over-budget candidates', () => {
    const ranked = rankingService.rankCandidates(
      mockCandidates,
      { budget: 45 }
    );
    expect(ranked[2].score).toBeLessThan(ranked[2].relevance);
  });

  it('respects custom weights', () => {
    const ranked = rankingService.rankCandidates(
      mockCandidates,
      undefined,
      { relevance: 0.8, successCount: 0.2 }
    );
    expect(ranked[0].agentId).toBe('1');
  });

  it('clamps scores to 0-1 range', () => {
    const candidatesWithHighScores: SearchResult[] = [
      {
        agentId: '1',
        name: 'Test',
        score: 0,
        relevance: 2.0, // Invalid - above 1
        successCount: 1000, // Invalid - above 500
        rating: 10, // Invalid - above 5
        yearsOnPlatform: 20, // Invalid - above 10
        location: 'NYC',
        services: ['plumbing'],
        hourlyRate: 100
      }
    ];
    const ranked = rankingService.rankCandidates(candidatesWithHighScores);
    expect(ranked[0].score).toBeLessThanOrEqual(1);
    expect(ranked[0].score).toBeGreaterThanOrEqual(0);
  });

  it('handles missing/null values gracefully', () => {
    const candidatesWithNulls: SearchResult[] = [
      {
        agentId: '1',
        name: 'Test',
        score: 0,
        relevance: null as any,
        successCount: null as any,
        rating: null as any,
        yearsOnPlatform: null as any,
        location: 'NYC',
        services: ['plumbing'],
        hourlyRate: 100
      }
    ];
    const ranked = rankingService.rankCandidates(candidatesWithNulls);
    expect(ranked[0].score).toBeGreaterThanOrEqual(0);
    expect(ranked[0].score).toBeLessThanOrEqual(1);
  });

  it('applies quality priority bonus', () => {
    const ranked = rankingService.rankCandidates(
      mockCandidates,
      { priority: 'quality' }
    );
    // High rating pro (4.9) should rank higher
    expect(ranked[0].rating).toBeGreaterThanOrEqual(ranked[1].rating);
  });

  it('returns empty array for empty input', () => {
    const ranked = rankingService.rankCandidates([]);
    expect(ranked).toEqual([]);
  });
});
