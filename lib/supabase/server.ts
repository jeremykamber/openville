import { createClient } from '@supabase/supabase-js';

// Support multiple common env var names so local setups using
// SUPABASE_URL / SUPABASE_PUBLISHABLE_DEFAULT_KEY work without changes.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for admin)');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
