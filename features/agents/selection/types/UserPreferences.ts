export interface UserPreferences {
  budget?: number;
  priority?: 'cost' | 'quality' | 'speed' | 'rating';
  dealBreakers?: string[];
  preferredQualifications?: string[];
  availabilityRequired?: string;
  minRating?: number;
}
