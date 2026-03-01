import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

export const hasSupabaseBrowserConfig = Boolean(supabaseUrl && supabaseKey);

let cachedClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!hasSupabaseBrowserConfig || !supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase browser environment variables");
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseKey);
  }

  return cachedClient;
}

export const supabase = hasSupabaseBrowserConfig ? getSupabaseBrowserClient() : null;
