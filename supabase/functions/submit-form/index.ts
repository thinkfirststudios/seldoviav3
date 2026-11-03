// Seldovia.com "Are you human?" check for the public forms (Jenny, Nov 2 2026)
// -----------------------------------------------------------------------------
// No picture puzzles, no squiggly words. Each visitor's browser quietly solves a
// small math puzzle (ALTCHA-style proof of work, about a second) while they fill
// in the form. This function hands out the puzzle and checks the answer before
// saving the form, so bots that skip the page can't post straight to the database.
//
//   GET  /submit-form          -> a fresh puzzle (expires in 20 minutes)
//   POST /submit-form          -> { kind, solution, website, elapsed, data } ; saves if it checks out
//        kind "message"   -> messages              (Contact, Photo Contest, Winter Watch)
//        kind "directory" -> directory_submissions (Phone Book "Add your listing"; always status pending)
//
// Honeypot: "website" is a hidden field people never see. If it's filled in, or the form
// was sent faster than a person could type, we answer "ok" but quietly save nothing.
// Saving uses the service key (built into Supabase), so the public no longer needs
// insert rights on those tables (see sql/spam-filter-nov3.sql, run AFTER the site ships).
// The existing notify-email webhooks still fire on every saved row.
//
// DEPLOY (Supabase dashboard, no CLI needed):
//   1. Edge Functions -> Secrets: add ALTCHA_HMAC_KEY = any long random text
//   2. Edge Functions -> Deploy a new function -> name it exactly: submit-form
//   3. Paste this whole file, then turn OFF "Verify JWT" (the site's publishable key isn't a JWT)

const HMAC_KEY = Deno.env.get("ALTCHA_HMAC_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MAX_NUMBER = 60000;           // puzzle size: ~0.5-2s on a phone
const EXPIRES_SEC = 20 * 60;        // a puzzle is good for 20 minutes
const MIN_ELAPSED_MS = 1500;        // faster than this = a bot (a person with autofill still takes longer)

const ALLOWED = [
  /^https:\/\/(www\.)?seldovia\.com$/,
  /^https:\/\/seldovia\.netlify\.app$/,
  /^https:\/\/thinkfirststudios\.github\.io$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED.some((r) => r.test(origin)) ? origin : "https://seldovia.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
  "Vary": "Origin",
});

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (s: string) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const hmac = async (s: string) => {
  const key = await crypto.subtle.importKey("raw", enc.encode(HMAC_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(s)));
};
const randInt = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % (max + 1);
const safeEq = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

async function newChallenge() {
  const salt = hex(crypto.getRandomValues(new Uint8Array(12)).buffer) + "?expires=" + (Math.floor(Date.now() / 1000) + EXPIRES_SEC);
  const challenge = await sha256(salt + randInt(MAX_NUMBER));
  return { algorithm: "SHA-256", challenge, maxnumber: MAX_NUMBER, salt, signature: await hmac(challenge) };
}

async function verify(sol: Record<string, unknown> | null | undefined) {
  if (!sol || sol.algorithm !== "SHA-256") return false;
  const { challenge, salt, signature } = sol as Record<string, string>;
  const number = Number(sol.number);
  if (typeof challenge !== "string" || typeof salt !== "string" || typeof signature !== "string" || !Number.isInteger(number)) return false;
  const exp = Number(new URLSearchParams(salt.split("?")[1] ?? "").get("expires"));
  if (!exp || exp < Date.now() / 1000) return false;
  if (!safeEq(await sha256(salt + number), challenge)) return false;
  return safeEq(await hmac(challenge), signature);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function insert(table: string, row: Record<string, unknown>) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`${table}: ${r.status} ${await r.text()}`);
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  if (req.method === "OPTIONS") return new Response(null, { headers: h });
  if (!HMAC_KEY || !SERVICE_KEY) return json({ ok: false, error: "not configured" }, 500);
  if (req.method === "GET") return json(await newChallenge());
  if (req.method !== "POST") return json({ ok: false }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad request" }, 400); }

  // Bots: honeypot filled in, or sent impossibly fast. Pretend it worked, save nothing.
  if (str(body.website, 500) || Number(body.elapsed) < MIN_ELAPSED_MS) return json({ ok: true });
  if (!(await verify(body.solution as Record<string, unknown>))) return json({ ok: false, error: "human check failed" }, 403);

  const d = (body.data ?? {}) as Record<string, unknown>;
  try {
    if (body.kind === "message") {
      const row = { name: str(d.name, 200), email: str(d.email, 320), topic: str(d.topic, 200), message: str(d.message, 20000) };
      if (!row.name || !row.email || !row.message) return json({ ok: false, error: "missing fields" }, 400);
      await insert("messages", row);
    } else if (body.kind === "directory") {
      const data = d.data && typeof d.data === "object" && !Array.isArray(d.data) ? d.data : {};
      if (JSON.stringify(data).length > 50000) return json({ ok: false, error: "too large" }, 400);
      const photo = str(d.photo_url, 1000);
      await insert("directory_submissions", {
        listing_type: str(d.listing_type, 100), display_name: str(d.display_name, 300) || "(unnamed)",
        photo_url: photo.startsWith(`${SUPABASE_URL}/storage/v1/object/public/uploads/`) ? photo : null,
        data, status: "pending",
      });
    } else return json({ ok: false, error: "unknown form" }, 400);
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "save failed" }, 500);
  }
  return json({ ok: true });
});
