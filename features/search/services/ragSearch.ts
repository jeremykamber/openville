import { SearchResult, SearchRequest, SearchFilters } from '../types';
import { embeddingService } from './embedding';
import { vectorSimilarity } from './vectorSimilarity';
import { tradespeopleWithEmbeddings } from '../data/embeddings';

export class RAGSearchService {
    async search(request: SearchRequest): Promise<{
      results: SearchResult[];
      queryEmbedding: number[];
    }> {
      const queryEmbedding = await embeddingService.generateEmbedding(request.query);
      
      const scoredResults = tradespeopleWithEmbeddings.map(person => {
        const relevance = person.embedding 
          ? vectorSimilarity.cosineSimilarity(queryEmbedding, person.embedding)
          : 0;
        
        return { ...person, relevance };
      });
      
      let filteredResults = scoredResults;
      
      if (request.filters) {
        filteredResults = this.applyFilters(filteredResults, request.filters);
      }
      
      return {
        results: filteredResults
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 50),
        queryEmbedding
      };
    }
    
    private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
      return results.filter(person => {
        if (filters.serviceCategories?.length) {
          const personServices = person.services || [];
          const hasService = personServices.some(s => 
            filters.serviceCategories!.some(cat => 
              s.toLowerCase().includes(cat.toLowerCase())
            )
          );
          if (!hasService) return false;
        }
        
        if (filters.minRating !== undefined && filters.minRating !== null && (person.rating || 0) < filters.minRating) {
          return false;
        }
        
        if (filters.minSuccessCount !== undefined && filters.minSuccessCount !== null && (person.successCount || 0) < filters.minSuccessCount) {
          return false;
        }
        
        if (filters.maxHourlyRate !== undefined && filters.maxHourlyRate !== null && (person.hourlyRate || 0) > filters.maxHourlyRate) {
          return false;
        }
        
        if (filters.location && !(person.location || '').toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    }
  }
  
  export const ragSearchService = new RAGSearchService();