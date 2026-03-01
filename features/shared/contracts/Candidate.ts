export interface Candidate {
  agentId: string;
  name: string;
  headline: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  successCount: number;
  relevance: number;
  score: number;
  startingPrice: number | null;
  availabilityLabel: string;
  locationLabel: string;
  summary: string;
}
