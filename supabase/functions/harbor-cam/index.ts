// Supabase Edge Function: harbor-cam
// -----------------------------------------------------------------------------
// The Seldovia Harbor camera is a private AXIS cam served over plain HTTP on a
// bare IP (http://104.254.224.134:4003). Seldovia.com is HTTPS, so browsers
// block a direct embed as "mixed content." This function fetches the cam's live
// JPEG snapshot server-side and re-serves it over HTTPS, so the site can show it.
//
// Right now the site uses a free public proxy (wsrv.nl) so the cam is already
// live. This is the self-owned replacement — deploy it whenever you want to stop
// depending on the third party.
//
// DEPLOY (no CLI needed — Supabase dashboard):
//   1. Supabase → your project → Edge Functions → "Deploy a new function"
//   2. Name it exactly:  harbor-cam
//   3. Paste this whole file as the function body
//   4. Turn OFF "Verify JWT" (an <img> tag can't send an auth header)
//   5. Deploy
//
// THEN point the site at it — in webcams.js change the PROXY function to:
//   function PROXY(o){ return "https://ycnbgyewuyietkhjxorz.supabase.co/functions/v1/harbor-cam"; }
// (the existing "&t=" cache-buster still forces a fresh frame each refresh)
// -----------------------------------------------------------------------------

const CAM = "http://104.254.224.134:4003/jpg/image.jpg";

Deno.serve(async () => {
  try {
    const r = await fetch(CAM, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return new Response("cam error", { status: 502 });
    const buf = await r.arrayBuffer();
    return new Response(buf, {
      headers: {
        "content-type": "image/jpeg",
        "cache-control": "no-store, max-age=0",
        "access-control-allow-origin": "*",
      },
    });
  } catch (_e) {
    return new Response("cam unreachable", { status: 504 });
  }
});
