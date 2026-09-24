import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.SUPABASE_URL;
const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigError =
  !url || !key ? "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diatur (lihat .env.example)." : null;

export const supabase = supabaseConfigError ? null : createClient(url, key);
