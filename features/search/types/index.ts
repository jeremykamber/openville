/* INPUT TYPES */
export interface UserPreferences {
    budget?: number;
    priority?: 'cost' | 'quality' | 'speed';
    location?: string;
    availability?: 'any' | 'weekdays' | 'weekends';
}

export interface SearchRequest {
    query: string;
    userPreferences?: UserPreferences;
    filters?: SearchFilters;
    limit?: number;
}

export interface SearchFilters {
    serviceCategories?: string[];
    minRating?: number;
    minSuccessCount?: number;
    maxHourlyRate?: number;
    location?: string;
}

/* OUTPUT TYPES */
export interface SearchResult {
    agentId: string;
    name: string;
    score: number;
    relevance: number;
    successCount: number;
    rating: number;
    yearsOnPlatform: number;
    location: string;
    services: string[];
    hourlyRate: number;
    description?: string;
    tags?: string[];
    embedding?: number[];
}

export interface SearchResponse {
    candidates: SearchResult[];
    totalFound: number;
    query: string;
    rankingWeights: RankingWeights;
}

export interface RankingWeights {
    relevance: number;
    successCount: number;
    rating: number;
    timeOnPlatform: number;
}