# Seldovia.com — AI / Placeholder Content to Verify Before Launch

This tracks everything on the site that was **AI-generated or written during the build**
(vs. content that is verbatim from Jenny/clients). Tick each item once Jenny confirms it.
Reason for this list: AI content can look unrealistic (images) or state wrong facts (copy),
so it must be verified before go-live.

## 1. Copy to verify (highest priority — can state wrong facts)
- [ ] **Business descriptions (~25)** — the blurbs on Explore business cards (`BIZ_BLURB` in `app.js`).
      Written during the build from business info. Confirm each is accurate, or tell us which to blank.
- [ ] **Seldovia House page** — rent amounts and pet policy (from Cook Inlet Housing's site; these change).
- [ ] **Arts Council page** — events list + contacts (from the org's site).
- [ ] **Kasitsna Bay page** — description + contacts (from UAF/NOAA).
- [ ] **"About Seldovia" blurb** on the Explore "About" tab.
- [ ] **Testimonial names** — cleaned to "First L." style; Zillow usernames shown as "Zillow review";
      one blank-name row shows "A Seldovia client". Review text itself is verbatim from Jenny's CSV.

## 2. AI imagery to review (artistic — replace if not wanted)
- [ ] **Hero banners still in AI watercolor** (Home + RE now replaced): Explore, Calendar, Blog,
      Webcams, Photos, Phone Book, Contact, News.
- [ ] **Business card images (~34)** — watercolor stand-ins for businesses with no real photo uploaded.
- [ ] **Home category tiles (cat-0…7)**.
- [ ] Decorative watercolor art (ferry/splash); logo is AI but Jenny-approved.

## 3. Content Jenny still needs to provide
- [ ] Phone numbers for directory entries missing them.
- [ ] Real business photos (to replace the watercolor stand-ins) — optional.
- [ ] Listing photos (Google Drive folder per listing) for listings with no photo.
- [ ] Final logo + Winter Watch plow-truck banner (save to `images/`).
- [ ] Direction on the Seldovia.com "business page" (full page vs. directory listing).

## 4. Verbatim / real (NOT AI — no action)
Listings & MLS copy · testimonial text · blog posts (Facebook + old-site archive) ·
Winter Watch (Sonny's words) · Jenny's uploaded photos · new Home/RE banners · the logo.

## 5. Launch blockers (separate from AI)
- [ ] Old-domain link cleanup + photo dedup (need Supabase service key).
- [ ] Confirm Supabase public sign-ups OFF.
- [ ] Keep the Flywheel backup of the old site.
- [ ] Privacy Policy + Terms of Service published (drafted from what the site actually does).
- [ ] Point SeldoviaWinterWatch.com → the Winter Watch page.
- [ ] DNS cutover of seldovia.com (web records only — never MX/email).
