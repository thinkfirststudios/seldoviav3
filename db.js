/* Supabase backend config.
   AFTER creating your project (see SUPABASE_SETUP.md), open
   Dashboard → Project Settings → API and paste the two values below:
     - Project URL          -> SUPABASE_URL
     - publishable/anon key -> SUPABASE_KEY
   The publishable key is PUBLIC by design (it ships in the frontend);
   security is enforced by Row-Level Security, not by hiding this key.
   Never put the service_role / secret key here. */
const SUPABASE_URL = "PASTE_PROJECT_URL_HERE";
const SUPABASE_KEY = "PASTE_PUBLISHABLE_ANON_KEY_HERE";

// Until real values are pasted, window.db stays null and the whole site
// gracefully falls back to its built-in photos/posts.
window.db = (SUPABASE_URL.indexOf("http") === 0 && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;
