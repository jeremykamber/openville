CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE market_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  services TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  location TEXT,
  hourly_rate INTEGER,
  base_price INTEGER,
  success_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  years_on_platform INTEGER,
  years_experience INTEGER,
  availability TEXT,
  certifications TEXT[] DEFAULT '{}',
  response_time TEXT,
  tags TEXT[] DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_market_candidates_agent_id ON market_candidates(agent_id);
CREATE INDEX idx_market_candidates_location ON market_candidates(location);
CREATE INDEX idx_market_candidates_rating ON market_candidates(rating);
CREATE INDEX idx_market_candidates_success_count ON market_candidates(success_count);
CREATE INDEX idx_market_candidates_embedding_ivfflat
  ON market_candidates
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
