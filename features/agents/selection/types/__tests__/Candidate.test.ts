import { describe, it, expect } from 'vitest';
import { Candidate } from '../Candidate';

describe('Candidate Type', () => {
  it('has required fields', () => {
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

  it('allows optional fields', () => {
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
