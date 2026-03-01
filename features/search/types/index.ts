/* INPUT TYPES */
export interface UserPreferences {
    budget?: number;
    priority?: 'cost' | 'quality' | 'speed' | 'rating';
    dealBreakers?: string[];
    preferredQualifications?: string[];
    availabilityRequired?: string;
    minRating?: number;
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

/* OUTPUT TYPES - Extended to match Candidate type from selection */
export interface SearchResult {
    agentId: string;
    name: string;
    score: number;
    relevance: number;
    successCount: number;
    rating: number;
    yearsOnPlatform?: number;
    yearsExperience?: number;
    location?: string;
    services?: string[];
    specialties?: string[];
    hourlyRate?: number;
    basePrice?: number;
    description?: string;
    tags?: string[];
    embedding?: number[];
    availability?: string;
    certifications?: string[];
    responseTime?: string;
    [key: string]: unknown;
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