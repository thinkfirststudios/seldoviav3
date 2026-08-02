/* Supabase backend config.
   AFTER creating your project (see SUPABASE_SETUP.md), open
   Dashboard → Project Settings → API and paste the two values below:
     - Project URL          -> SUPABASE_URL
     - publishable/anon key -> SUPABASE_KEY
   The publishable key is PUBLIC by design (it ships in the frontend);
   security is enforced by Row-Level Security, not by hiding this key.
   Never put the service_role / secret key here. */
const SUPABASE_URL = "https://ycnbgyewuyietkhjxorz.supabase.co";
const SUPABASE_KEY = "sb_publishable_UVnfz14d7L3vnbPWxYrYVg_3oY3GWdo";

// Until real values are pasted, window.db stays null and the whole site
// gracefully falls back to its built-in photos/posts.
window.db = (SUPABASE_URL.indexOf("http") === 0 && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* Contact form email delivery via Web3Forms (free, no monthly cost).
   Get a key: go to https://web3forms.com, enter the email that should RECEIVE
   the messages (Jenny's), and paste the access key they email you below.
   Until it's set, the contact form still saves to the admin inbox. */
window.WEB3FORMS_KEY = "PASTE_WEB3FORMS_ACCESS_KEY_HERE";

/* Google Calendar — pulls the real community events into the site's OWN calendar UI
   (agenda + month grid) instead of a plain Google iframe. Needs a public API key:
     1. console.cloud.google.com -> create/select a project
     2. APIs & Services -> Library -> enable "Google Calendar API"
     3. APIs & Services -> Credentials -> Create credentials -> API key
     4. (recommended) Restrict the key to the Calendar API + your site's domain
     5. paste it below.
   Until it's set, the calendar page falls back to the Google embed (still real events). */
window.GCAL_KEY = "PASTE_GOOGLE_CALENDAR_API_KEY_HERE";
window.GCAL_ID  = "b7a0284f173095d04d2ed21292bf2b6a05e685914bd3243db8480cebcaec11c4@group.calendar.google.com";
