import { describe, it, expect } from 'vitest';
import { JobScope } from '../JobScope';

describe('JobScope Type', () => {
  it('requires jobType and description', () => {
    const scope: JobScope = {
      jobType: 'Plumbing',
      description: 'Fix leaky faucet',
    };

    expect(scope.jobType).toBe('Plumbing');
  });

  it('allows urgency options', () => {
    const scope: JobScope = {
      jobType: 'Plumbing',
      description: 'Fix leaky faucet',
      urgency: 'asap',
    };

    expect(scope.urgency).toBe('asap');
  });
});
