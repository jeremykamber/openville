import { describe, it, expect } from 'vitest';
import {
  Candidate,
  UserPreferences,
  JobScope,
} from '../../types';

describe('Selection Types', () => {
  describe('Candidate', () => {
    it('should have required fields', () => {
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

    it('should allow optional fields', () => {
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

  describe('UserPreferences', () => {
    it('should accept valid priority values', () => {
      const prefs: UserPreferences = {
        budget: 500,
        priority: 'cost',
        dealBreakers: ['no insurance'],
        minRating: 4.0,
      };
      
      expect(prefs.priority).toBe('cost');
    });

    it('should allow all priority options', () => {
      const priorities: UserPreferences['priority'][] = ['cost', 'quality', 'speed', 'rating'];
      
      priorities.forEach(priority => {
        const prefs: UserPreferences = { priority };
        expect(prefs.priority).toBe(priority);
      });
    });
  });

  describe('JobScope', () => {
    it('should require jobType and description', () => {
      const scope: JobScope = {
        jobType: 'Plumbing',
        description: 'Fix leaky faucet',
      };
      
      expect(scope.jobType).toBe('Plumbing');
    });

    it('should allow urgency options', () => {
      const scope: JobScope = {
        jobType: 'Plumbing',
        description: 'Fix leaky faucet',
        urgency: 'asap',
      };
      
      expect(scope.urgency).toBe('asap');
    });
  });
});
