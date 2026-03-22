-- pgvector extension already enabled in initial migration
-- This adds the RPC function for database-level vector similarity search

CREATE OR REPLACE FUNCTION match_candidates(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 50,
  filter_location TEXT DEFAULT NULL,
  filter_min_rating NUMERIC DEFAULT NULL,
  filter_min_success_count INT DEFAULT NULL,
  filter_max_hourly_rate INT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  agent_id TEXT,
  name TEXT,
  description TEXT,
  services TEXT[],
  specialties TEXT[],
  location TEXT,
  hourly_rate INT,
  base_price INT,
  success_count INT,
  rating NUMERIC,
  years_on_platform INT,
  years_experience INT,
  availability TEXT,
  certifications TEXT[],
  response_time TEXT,
  tags TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mc.id,
    mc.agent_id,
    mc.name,
    mc.description,
    mc.services,
    mc.specialties,
    mc.location,
    mc.hourly_rate,
    mc.base_price,
    mc.success_count,
    mc.rating,
    mc.years_on_platform,
    mc.years_experience,
    mc.availability,
    mc.certifications,
    mc.response_time,
    mc.tags,
    (1 - (mc.embedding <=> query_embedding))::FLOAT AS similarity
  FROM market_candidates mc
  WHERE mc.embedding IS NOT NULL
    AND (filter_location IS NULL OR mc.location ILIKE '%' || filter_location || '%')
    AND (filter_min_rating IS NULL OR mc.rating >= filter_min_rating)
    AND (filter_min_success_count IS NULL OR mc.success_count >= filter_min_success_count)
    AND (filter_max_hourly_rate IS NULL OR mc.hourly_rate <= filter_max_hourly_rate)
  ORDER BY mc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
