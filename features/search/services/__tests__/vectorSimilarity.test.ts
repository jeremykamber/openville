import { describe, it, expect } from 'vitest';
import { vectorSimilarity } from '../vectorSimilarity';

describe('VectorSimilarity', () => {
  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      const vector = [1, 2, 3, 4, 5];
      expect(vectorSimilarity.cosineSimilarity(vector, vector)).toBe(1);
    });

    it('returns 0 for orthogonal vectors', () => {
      const a = [1, 0, 0];
      const b = [0, 1, 0];
      expect(vectorSimilarity.cosineSimilarity(a, b)).toBe(0);
    });

    it('returns -1 for opposite vectors', () => {
      const a = [1, 2, 3];
      const b = [-1, -2, -3];
      expect(vectorSimilarity.cosineSimilarity(a, b)).toBe(-1);
    });

    it('handles empty vectors', () => {
      expect(vectorSimilarity.cosineSimilarity([], [])).toBe(0);
    });

    it('handles null/undefined vectors', () => {
      expect(vectorSimilarity.cosineSimilarity(null as any, [1, 2, 3] as any)).toBe(0);
      expect(vectorSimilarity.cosineSimilarity([1, 2, 3] as any, null as any)).toBe(0);
    });

    it('handles zero-norm vectors', () => {
      const zeroVector = [0, 0, 0];
      const normalVector = [1, 2, 3];
      expect(vectorSimilarity.cosineSimilarity(zeroVector, normalVector)).toBe(0);
      expect(vectorSimilarity.cosineSimilarity(normalVector, zeroVector)).toBe(0);
      expect(vectorSimilarity.cosineSimilarity(zeroVector, zeroVector)).toBe(0);
    });

    it('throws error for mismatched vector dimensions', () => {
      const a = [1, 2, 3];
      const b = [1, 2];
      expect(() => vectorSimilarity.cosineSimilarity(a, b)).toThrow('Vectors must have same dimension');
    });

    it('calculates correct similarity for realistic vectors', () => {
      const a = [0.5, 0.5, 0.5, 0.5];
      const b = [0.7, 0.7, 0.0, 0.0];
      const similarity = vectorSimilarity.cosineSimilarity(a, b);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });
  });
});
