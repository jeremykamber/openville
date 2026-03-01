import { Candidate } from './Candidate';
import { UserPreferences } from './UserPreferences';
import { JobScope } from './JobScope';

export interface SelectTop3Request {
  top10: Candidate[];
  userPreferences: UserPreferences;
  scope: JobScope;
}
