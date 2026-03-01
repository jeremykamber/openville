import { SelectedCandidate } from './SelectedCandidate';

export interface SelectTop3Response {
  top3: SelectedCandidate[];
  summary: string;
}
