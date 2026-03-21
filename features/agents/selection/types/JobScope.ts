export interface JobScope {
  jobType: string;
  description: string;
  location?: string;
  urgency?: 'asap' | 'flexible' | 'scheduled';
  estimatedDuration?: string;
  rooms?: number;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}
