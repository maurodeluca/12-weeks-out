import { createClient } from '@supabase/supabase-js';

// The publishable/anon key is designed to be exposed in client-side code —
// row level security in supabase/schema.sql is what actually protects data.
export const SUPABASE_URL = 'https://xxfrkwajdrdxifnpgmeu.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_g53AhbzBTU-8rAKvulbb4w_yCeXmAPa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
