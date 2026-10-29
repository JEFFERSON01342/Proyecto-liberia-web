import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabaseCredentials =
  SUPABASE_URL &&
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.includes('.supabase.co') &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY.length > 20;

export const supabase = hasSupabaseCredentials
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'libreria-cliente-auth-token',  // clave única → no choca con el admin
      },
    })
  : null;

export default supabase;
