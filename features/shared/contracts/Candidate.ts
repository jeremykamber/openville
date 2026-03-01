/**
 * Candidate — A tradesperson returned by the search/ranking pipeline.
 *
 * Aligned with the dev branch Candidate type from
 * features/agents/selection/types/Candidate.ts
 *
 * The index signature allows the backend to attach arbitrary metadata
 * (e.g., embedding vectors, computed fields) without frontend breakage.
 * The frontend only reads the typed fields it needs; the rest flows through.
 */
export interface Candidate {
  /** Unique agent identifier */
  agentId: string;
  /** Display name */
  name: string;
  /** Composite ranking score (0-1, computed by ranking service) */
  score: number;
  /** Cosine similarity relevance to query (0-1) */
  relevance: number;
  /** Number of successful jobs completed */
  successCount: number;
  /** Average rating (1-5) */
  rating: number;

  /* ── Optional fields from the backend ────────────────────────────── */
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

  /** Extensibility — backend can attach any additional fields */
  [key: string]: unknown;
}

/**
 * SelectedCandidate — A top-3 candidate chosen by the LLM agent
 * with reasoning and a match score.
 */
export interface SelectedCandidate {
  candidate: Candidate;
  /** LLM-generated explanation of why this candidate was selected */
  reasoning: string;
  /** How well this candidate matches user preferences (0-100) */
  matchScore: number;
}
