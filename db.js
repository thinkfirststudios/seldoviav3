/* Supabase client — the publishable key is PUBLIC by design (it ships in the
   frontend). Real security is enforced by Row-Level Security on the database,
   not by hiding this key. Do NOT put the service_role / secret key here. */
const SUPABASE_URL = "https://vvorpsxekqldfacosgcg.supabase.co";
const SUPABASE_KEY = "sb_publishable_gXP8yEUMpbu2oizwlMMLag_6-t_96_-";
window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
