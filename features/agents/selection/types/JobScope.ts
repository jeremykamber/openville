export interface JobScope {
  jobType: string;
  description: string;
  location?: string;
  urgency?: 'asap' | 'flexible' | 'scheduled';
  estimatedDuration?: string;
  [key: string]: unknown;
}
