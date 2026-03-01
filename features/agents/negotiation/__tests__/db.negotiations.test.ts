import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as db from '../db/negotiations';

// We'll mock supabaseAdmin to emulate DB insert/select
vi.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: {
    from: () => ({
      insert: () => ({ select: () => ({ single: async () => ({ data: {
        id: 'neg-1', buyer_agent_id: 'b1', provider_agent_id: 'p1', job_id: null, status: 'active', current_turn: 'buyer', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ended_at: null, summary: null
      } }) }) }),
    }),
  },
}));

describe('db/negotiations integration-like mapping', () => {
  it('createNegotiation returns mapped Negotiation', async () => {
    const n = await (db as any).createNegotiation('b1', 'p1');
    expect(n).toHaveProperty('id', 'neg-1');
    expect(n.buyerAgentId).toBe('b1');
  });
});
