# Seldovia.com — backend setup (one time, ~10 minutes)

This gives Jenny a login where she posts a **daily photo**, **blog posts**, **bulletin
notices**, and **listings**, and they appear on the live site automatically. Free tier
is plenty for this.

> **Already did the first setup?** Just do two things again: (1) re-run **`supabase-setup.sql`**
> in the SQL Editor — it now also creates the `bulletin` and `listings` tables and is safe
> to re-run, and (2) add one more **public** Storage bucket named **`listings`**. That's it.

## 1. Create the project
1. Go to **https://supabase.com** → sign in (or sign up) → **New project**.
2. Name it `seldovia`, pick a strong database password (save it), region **West US**.
3. Wait ~2 min for it to finish provisioning.

## 2. Create the tables
1. Left sidebar → **SQL Editor** → **New query**.
2. Open the file **`supabase-setup.sql`** (in this folder), copy ALL of it, paste, click **Run**.
   - It's fine to run more than once — it won't duplicate anything.

## 3. Create the three photo buckets
1. Left sidebar → **Storage** → **New bucket** → name **`gallery`** → tick **"Public bucket"** → Save.
2. **New bucket** again → name **`blog`** → tick **"Public bucket"** → Save.
3. **New bucket** again → name **`listings`** → tick **"Public bucket"** → Save.
   *(If you created the buckets AFTER running the SQL, that's fine — the storage
   policies in the SQL already cover them. If you get a policy error, just re-run
   the SQL after making the buckets.)*

## 4. Create Jenny's login
1. Left sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter Jenny's email + a password → **Create user**. (Tell her these — she uses them at `/admin.html`.)
3. (Optional, recommended) Authentication → **Providers** → **Email** → turn **OFF** "Enable sign-ups"
   so only people you add can log in.

## 5. Give me the two connection values
1. Left sidebar → **Project Settings** (gear) → **API**.
2. Copy the **Project URL** (looks like `https://xxxx.supabase.co`).
3. Copy the **publishable / anon** key (the long one labeled *anon public* or *publishable*).
4. Paste both into **`db.js`** where it says `PASTE_...HERE` — or just send them to me and I'll drop them in.

That's it. Once `db.js` has those two values:
- Jenny logs in at **seldovia.com/admin.html**
- **📷 Daily Photo** tab → pick date, add a caption, choose a photo → **Post** → it shows up in the Photo Journal.
- **✍️ Blog Post** tab → write + optional photo → **Publish** → it shows up on the blog.

Until then, the public site keeps running on the built-in photos/posts (nothing breaks).
