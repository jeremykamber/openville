import { describe, it, expect } from 'vitest';
import { ragSearchService } from '../ragSearch';

describe('RAGSearchService', () => {
  describe('search', () => {
    it('returns results for valid query', async () => {
      const result = await ragSearchService.search({ query: 'fix gutters' });
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.queryEmbedding).toBeDefined();
      expect(result.queryEmbedding.length).toBe(1536);
    });

    it('returns top 50 results max', async () => {
      const result = await ragSearchService.search({ query: 'fix', limit: 50 });
      expect(result.results.length).toBeLessThanOrEqual(50);
    });

    it('calculates relevance scores', async () => {
      const result = await ragSearchService.search({ query: 'gutter repair' });
      expect(result.results[0].relevance).toBeGreaterThanOrEqual(0);
      expect(result.results[0].relevance).toBeLessThanOrEqual(1);
    });

    it('sorts results by relevance descending', async () => {
      const result = await ragSearchService.search({ query: 'fix gutters' });
      for (let i = 1; i < result.results.length; i++) {
        expect(result.results[i - 1].relevance).toBeGreaterThanOrEqual(result.results[i].relevance);
      }
    });
  });

  describe('filtering', () => {
    it('filters by service categories', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { serviceCategories: ['plumbing'] }
      });
      expect(result.results.every(r => 
        r.services.some(s => s.toLowerCase().includes('plumbing'))
      )).toBe(true);
    });

    it('filters by minimum rating', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { minRating: 4.5 }
      });
      expect(result.results.every(r => r.rating >= 4.5)).toBe(true);
    });

    it('filters by minimum rating of 0', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { minRating: 0 }
      });
      // Should return results (0 means no minimum)
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('filters by minimum success count', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { minSuccessCount: 100 }
      });
      expect(result.results.every(r => r.successCount >= 100)).toBe(true);
    });

    it('filters by minimum success count of 0', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { minSuccessCount: 0 }
      });
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('filters by max hourly rate', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { maxHourlyRate: 60 }
      });
      expect(result.results.every(r => r.hourlyRate <= 60)).toBe(true);
    });

    it('filters by max hourly rate of 0', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { maxHourlyRate: 0 }
      });
      // Should return empty since no one has rate <= 0
      expect(result.results.length).toBe(0);
    });

    it('filters by location', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { location: 'NYC' }
      });
      expect(result.results.every(r => 
        r.location.toLowerCase().includes('nyc')
      )).toBe(true);
    });

    it('combines multiple filters', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: {
          minRating: 4.0,
          location: 'NYC'
        }
      });
      expect(result.results.every(r => 
        r.rating >= 4.0 && r.location.toLowerCase().includes('nyc')
      )).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty query', async () => {
      const result = await ragSearchService.search({ query: '' });
      expect(result.results).toBeDefined();
    });

    it('handles null/undefined filters', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: undefined
      });
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('handles empty serviceCategories array', async () => {
      const result = await ragSearchService.search({
        query: 'fix',
        filters: { serviceCategories: [] }
      });
      expect(result.results.length).toBeGreaterThan(0);
    });
  });
});
