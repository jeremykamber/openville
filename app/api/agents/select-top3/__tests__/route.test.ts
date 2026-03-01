import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

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
