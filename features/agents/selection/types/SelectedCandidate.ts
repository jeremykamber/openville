import { Candidate } from './Candidate';

export interface SelectedCandidate {
  candidate: Candidate;
  reasoning: string;
  matchScore: number;
}
