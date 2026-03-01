-- Negotiations table
CREATE TABLE negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_agent_id TEXT NOT NULL,
  provider_agent_id TEXT NOT NULL,
  job_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  current_turn TEXT NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  summary TEXT
);

-- Negotiation messages
CREATE TABLE negotiation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'message',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Negotiation results
CREATE TABLE negotiation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  proposed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  final_price INTEGER,
  scope_description TEXT,
  scope_rooms INTEGER,
  scope_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_message TEXT
);

-- Indexes
CREATE INDEX idx_negotiations_job_id ON negotiations(job_id);
CREATE INDEX idx_negotiations_status ON negotiations(status);
CREATE INDEX idx_negotiation_messages_negotiation_id ON negotiation_messages(negotiation_id);
CREATE INDEX idx_negotiation_results_negotiation_id ON negotiation_results(negotiation_id);
