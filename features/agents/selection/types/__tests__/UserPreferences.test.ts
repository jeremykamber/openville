import { describe, it, expect } from 'vitest';
import { UserPreferences } from '../UserPreferences';

describe('UserPreferences Type', () => {
  it('accepts valid priority values', () => {
    const prefs: UserPreferences = {
      budget: 500,
      priority: 'cost',
      dealBreakers: ['no insurance'],
      minRating: 4.0,
    };

    expect(prefs.priority).toBe('cost');
  });

  it('allows all priority options', () => {
    const priorities: UserPreferences['priority'][] = ['cost', 'quality', 'speed', 'rating'];

    priorities.forEach(priority => {
      const prefs: UserPreferences = { priority } as UserPreferences;
      expect(prefs.priority).toBe(priority);
    });
  });
});
