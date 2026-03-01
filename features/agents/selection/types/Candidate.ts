export interface Candidate {
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
