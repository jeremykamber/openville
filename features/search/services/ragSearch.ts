import { SearchResult, SearchRequest, SearchFilters } from '../types';
import { embeddingService } from './embedding';
import { vectorSimilarity } from './vectorSimilarity';
import { tradespeopleWithEmbeddings } from '../data/embeddings';

export class RAGSearchService {
    async search(request: SearchRequest): Promise<{
      results: SearchResult[];
      queryEmbedding: number[];
    }> {
      /* Step 1: Generate embedding from query */
      const queryEmbedding = await embeddingService.generateEmbedding(request.query);
      
      /*  Step 2: Calculate similarity scores for all tradespeople */
      const scoredResults = tradespeopleWithEmbeddings.map(person => {
        const relevance = person.embedding 
          ? vectorSimilarity.cosineSimilarity(queryEmbedding, person.embedding)
          : 0;
        
        return { ...person, relevance };
      });
      
      /* Step 3: Apply filters if provided */
      let filteredResults = scoredResults;
      
      if (request.filters) {
        filteredResults = this.applyFilters(filteredResults, request.filters);
      }
      
      /* Step 4: Sort by relevance and return top 50 */
      return {
        results: filteredResults
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 50),
        queryEmbedding
      };
    }
    
    private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
      return results.filter(person => {
        /* Filter by service categories */
        if (filters.serviceCategories?.length) {
          const hasService = person.services.some(s => 
            filters.serviceCategories!.some(cat => 
              s.toLowerCase().includes(cat.toLowerCase())
            )
          );
          if (!hasService) return false;
        }
        
        /* Filter by minimum rating (explicit null check so 0 is accepted) */
        if (filters.minRating !== undefined && filters.minRating !== null && person.rating < filters.minRating) {
          return false;
        }
        
        /* Filter by minimum success count (explicit null check so 0 is accepted) */
        if (filters.minSuccessCount !== undefined && filters.minSuccessCount !== null && person.successCount < filters.minSuccessCount) {
          return false;
        }
        
        /* Filter by maximum hourly rate (explicit null check so 0 is accepted) */
        if (filters.maxHourlyRate !== undefined && filters.maxHourlyRate !== null && person.hourlyRate > filters.maxHourlyRate) {
          return false;
        }
        
        /* Filter by location */
        if (filters.location && !person.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    }
  }
  
  export const ragSearchService = new RAGSearchService();