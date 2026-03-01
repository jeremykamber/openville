import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selectTop3 } from '../selectTop3';
import { Candidate, UserPreferences, JobScope } from '../types';

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

import { createChatModel } from '../../reasoning/providers';

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error for less than 3 candidates', async () => {
    const tooFewCandidates = mockCandidates.slice(0, 2);
    
    await expect(
      selectTop3(tooFewCandidates, mockPreferences, mockScope)
    ).rejects.toThrow('At least 3 candidates required for selection');
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
    vi.mocked(createChatModel).mockReturnValueOnce({
      withStructuredOutput: vi.fn(() => async () => ({
        top3: [
          { agentId: 'invalid-id', reasoning: 'test', matchScore: 90 },
          { agentId: 'tp-002', reasoning: 'test', matchScore: 80 },
          { agentId: 'tp-003', reasoning: 'test', matchScore: 70 },
        ],
        summary: 'test',
      })),
    } as unknown as ReturnType<typeof createChatModel>);

    await expect(
      selectTop3(mockCandidates, mockPreferences, mockScope, { providerType: 'mock' })
    ).rejects.toThrow(/Invalid agentId/);
  });
});
