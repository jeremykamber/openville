export interface Candidate {
  id: string;
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
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}
