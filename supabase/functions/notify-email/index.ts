// Seldovia.com email alerts (Jenny, Oct 6): email Jenny and Qwynny when someone
//   1) sends a message through the Contact page (table: messages), or
//   2) asks to be added to the Phone Book (table: directory_submissions, status "pending").
// Entries Jenny adds herself in the admin (status "approved") don't send an email.
//
// Runs as a Supabase Edge Function, called by two Database Webhooks (INSERT on each table).
// Emails are sent with Resend (free plan: 3,000 emails/month). Nothing here touches Netlify.
//
// Secrets to set in Supabase (Edge Functions → Secrets):
//   RESEND_API_KEY  your Resend API key (starts with "re_")
//   NOTIFY_TO       who gets the alerts, comma-separated, e.g. "jenny@seldoviaproperty.com,qcanlas@cyberbacker.com"
//   NOTIFY_FROM     sender, e.g. "Seldovia.com <alerts@thinkfirststudios.com>" (must be on a domain verified in Resend)
//   WEBHOOK_SECRET  any long random text; the same value goes in the webhooks' "x-webhook-secret" header
//   ADMIN_URL       (optional) link to the admin, e.g. "https://seldovia.com/admin.html"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const TO = (Deno.env.get("NOTIFY_TO") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const FROM = Deno.env.get("NOTIFY_FROM") ?? "Seldovia.com <onboarding@resend.dev>";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";
const ADMIN_URL = Deno.env.get("ADMIN_URL") ?? "https://thinkfirststudios.github.io/seldoviav3/admin.html";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const row = (k: string, v: unknown) =>
  v != null && String(v).trim() !== ""
    ? `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v).replace(/\n/g, "<br>")}</td></tr>`
    : "";
const wrap = (title: string, rows: string, note: string) => `
  <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;max-width:560px">
    <h2 style="font-size:18px;margin:0 0 12px">${esc(title)}</h2>
    <table style="border-collapse:collapse">${rows}</table>
    <p style="margin:18px 0 0">${note}</p>
    <p style="margin:18px 0 0;color:#888;font-size:12px">Sent automatically by Seldovia.com</p>
  </div>`;

Deno.serve(async (req) => {
  if (WEBHOOK_SECRET && req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("forbidden", { status: 403 });
  }
  let payload: { type?: string; table?: string; record?: Record<string, unknown> };
  try { payload = await req.json(); } catch { return new Response("bad request", { status: 400 }); }
  if (payload.type !== "INSERT" || !payload.record) return new Response("ignored");
  const r = payload.record as Record<string, any>;

  let subject = "", html = "", replyTo: string | undefined;
  if (payload.table === "messages") {
    subject = `New message on Seldovia.com${r.topic ? ` (${r.topic})` : ""} from ${r.name || "someone"}`;
    replyTo = r.email || undefined;
    html = wrap("New message from the Contact page",
      row("Name", r.name) + row("Email", r.email) + row("Topic", r.topic) + row("Message", r.message),
      `Just hit <b>Reply</b> to answer them. It's also in the admin under <b>Messages</b>: <a href="${esc(ADMIN_URL)}">open the admin</a>.`);
  } else if (payload.table === "directory_submissions") {
    if (r.status === "approved") return new Response("added in the admin; no email");
    const d = r.data || {};
    const isBiz = r.listing_type === "business";
    subject = `Phone Book request: ${r.display_name || d.name || d.business_name || "new entry"}`;
    html = wrap(isBiz ? "A business asked to be added to the Phone Book" : "Someone asked to be added to the Phone Book",
      isBiz
        ? row("Business", d.business_name || r.display_name) + row("Category", d.business_category) + row("Phone", d.business_phone) + row("Email", d.business_email) + row("Address", d.business_address) + row("Description", d.business_desc)
        : row("Name", d.name || r.display_name) + row("Phone", d.phone ? `${d.phone} (${d.phone_privacy || "private"})` : "") + row("Email", d.email ? `${d.email} (${d.email_privacy || "private"})` : "") + row("Address", d.address ? `${d.address} (${d.address_privacy || "private"})` : ""),
      `Nothing shows publicly until you approve it. Review it in the admin under <b>📇 Phone Book → New requests</b>: <a href="${esc(ADMIN_URL)}">open the admin</a>.`);
  } else {
    return new Response("ignored");
  }

  if (!RESEND_API_KEY || !TO.length) return new Response("not configured", { status: 500 });
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: TO, subject, html, reply_to: replyTo }),
  });
  return new Response(await res.text(), { status: res.ok ? 200 : 502 });
});
