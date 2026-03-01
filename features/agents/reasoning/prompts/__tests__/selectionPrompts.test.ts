import { describe, it, expect } from 'vitest';
import {
  SELECT_TOP3_SYSTEM_PROMPT,
  buildSelectionUserPrompt,
} from '../selectionPrompts';
import { Candidate, UserPreferences, JobScope } from '@/features/agents/selection/types';

describe('Selection Prompts', () => {
  describe('SELECT_TOP3_SYSTEM_PROMPT', () => {
    it('should contain personal agent language', () => {
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('helpful AI assistant');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('your user');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain("what YOUR USER wants");
    });

    it('should specify JSON output format', () => {
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"top3"');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"agentId"');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"reasoning"');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"matchScore"');
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('"summary"');
    });

    it('should mention deal breakers', () => {
      expect(SELECT_TOP3_SYSTEM_PROMPT).toContain('deal breaker');
    });
  });

  describe('buildSelectionUserPrompt', () => {
    const mockCandidate: Candidate = {
      agentId: 'tp-001',
      name: "Joe's Plumbing",
      score: 0.9,
      relevance: 0.85,
      successCount: 100,
      rating: 4.5,
      basePrice: 200,
      yearsExperience: 10,
    };

    const mockPreferences: UserPreferences = {
      budget: 250,
      priority: 'cost',
      dealBreakers: ['no license'],
      minRating: 4.0,
    };

    const mockScope: JobScope = {
      jobType: 'Plumbing',
      description: 'Fix leaky faucet',
      urgency: 'flexible',
    };

    it('should include job details', () => {
      const prompt = buildSelectionUserPrompt([mockCandidate], mockPreferences, mockScope);
      
      expect(prompt).toContain('Plumbing');
      expect(prompt).toContain('Fix leaky faucet');
    });

    it('should include user preferences', () => {
      const prompt = buildSelectionUserPrompt([mockCandidate], mockPreferences, mockScope);
      
      expect(prompt).toContain('$250 or less');
      expect(prompt).toContain('cost');
      expect(prompt).toContain('no license');
      expect(prompt).toContain('4.0');
    });

    it('should include candidate data', () => {
      const prompt = buildSelectionUserPrompt([mockCandidate], mockPreferences, mockScope);
      
      expect(prompt).toContain('tp-001');
      expect(prompt).toContain("Joe's Plumbing");
      expect(prompt).toContain('200'); // basePrice
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalCandidate: Candidate = {
        agentId: 'min-1',
        name: 'Minimal',
        score: 0.5,
        relevance: 0.5,
        successCount: 1,
        rating: 3.0,
      };
      
      const prompt = buildSelectionUserPrompt([minimalCandidate], {}, { jobType: 'Test', description: 'Test' });
      
      expect(prompt).toContain('min-1');
    });
  });
});
