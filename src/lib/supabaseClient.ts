import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL o Anon Key no configuradas. Revisa tu archivo .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
