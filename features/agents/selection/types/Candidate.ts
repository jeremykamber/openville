export interface Candidate {
  agentId: string;
  name: string;
  score: number;
  relevance: number;
  successCount: number;
  rating: number;
  specialties?: string[];
  availability?: string;
  basePrice?: number;
  yearsExperience?: number;
  certifications?: string[];
  responseTime?: string;
  [key: string]: unknown;
}
