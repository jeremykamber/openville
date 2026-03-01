import { createClient } from "@supabase/supabase-js";

// Gather possible environment variable names for Supabase URL and Key.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_PROJECT_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SECRET_KEY;

// Optionally, you can distinguish between publishable and secret keys if needed:
// const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
// const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("Missing Supabase URL environment variable");
}
if (!supabaseKey) {
  throw new Error("Missing Supabase Key environment variable");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
