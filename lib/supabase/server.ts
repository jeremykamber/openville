import { createClient } from "@supabase/supabase-js";

// Support multiple common env var names so local setups using
// SUPABASE_URL / SUPABASE_PUBLISHABLE_DEFAULT_KEY work without changes.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  process.env.SUPABASE_PROJECT_URL ??
  process.env.SUPABASE_API_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ADMIN_KEY ??
  process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.SUPABASE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_KEY ??
  process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables (one of NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY, are required for admin)",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
