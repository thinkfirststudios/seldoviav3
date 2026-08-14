#!/usr/bin/env python
"""
Watercolor heading generator (Seldovia.com).

Jenny wanted the real "watercolor brush stroke" Lovestory look on the site's
headings. That texture is stored as PNG artwork inside the Lovestory SVG OpenType
font (the `SVG ` table), and it does NOT render live in Chrome/Brave. So instead of
using it as a web font, we pull the textured glyphs straight out of the font and
composite each fixed heading into a transparent PNG that works in every browser.

Run:  python gen-headings.py
Out:  images/headings/*.png   (referenced from the HTML as <img> inside the heading)

Colors:
  "ink"   -> keep the original dark watercolor (for headings on light backgrounds)
  "white" -> recolor to soft white, keeping the dry-brush texture (hero on a photo)

To add/adjust a heading, edit MANIFEST below and re-run. Nothing here touches the
live site until the generated PNG is referenced from a page.
"""
import base64, io, os
from fontTools.ttLib import TTFont
from PIL import Image
import numpy as np
import xml.etree.ElementTree as ET

FONT = "Lovestory Files/1-Lovestory FONTS/SVG Fonts/Lovestory SVG.otf"
OUT  = "images/headings"
PX   = 340  # glyph em size in px -> high-res for retina; CSS scales down

NS   = "{http://www.w3.org/2000/svg}"
XLINK= "{http://www.w3.org/1999/xlink}"

# text, color-mode, output filename.  "white" = hero on a photo; "ink" = dark on light bg.
MANIFEST = [
    # home
    ("Discover Everything Seldovia",            "white", "hero-discover.png"),
    ("How can I help?",                         "ink",   "how-can-i-help.png"),
    ("Seldovia in photos",                      "ink",   "seldovia-in-photos.png"),
    ("The local businesses we're grateful for", "ink",   "sponsors-grateful.png"),
    # real estate
    ("Finding your place on the bay",           "ink",   "re-finding-your-place.png"),
    ("Recently sold",                           "ink",   "recently-sold.png"),
    ("What my clients say",                      "ink",   "what-my-clients-say.png"),
    # photo journal
    ("A daily diary of Seldovia",               "ink",   "gallery-daily-diary.png"),
    ("Seldovia webcams",                        "ink",   "seldovia-webcams.png"),
    ("More Seldovia photos",                    "ink",   "more-seldovia-photos.png"),
    # bulletin
    ("Notices, happenings & friendly fliers",   "ink",   "bulletin-notices.png"),
    # explore / phone book / calendar / directory / gazette / contact / thanks
    ("Most popular things to do",               "ink",   "explore-most-popular.png"),
    ("Neighbors & local businesses",            "ink",   "phonebook-neighbors.png"),
    ("What's happening around town",            "ink",   "calendar-whats-happening.png"),
    ("Add your listing",                        "ink",   "directory-add-listing.png"),
    ("Notes & stories from Seldovia",           "ink",   "gazette-notes-stories.png"),
    ("Say hello",                               "ink",   "contact-say-hello.png"),
    ("Thank you!",                              "ink",   "thanks-thankyou.png"),
    # WHITE versions of the page-hero titles, for the photo-banner treatment (readable on photos)
    ("Notices, happenings & friendly fliers",   "white", "bulletin-notices-white.png"),
    ("A daily diary of Seldovia",               "white", "gallery-daily-diary-white.png"),
    ("Finding your place on the bay",           "white", "re-finding-your-place-white.png"),
    ("Say hello",                               "white", "contact-say-hello-white.png"),
    ("Most popular things to do",               "white", "explore-most-popular-white.png"),
    ("Neighbors & local businesses",            "white", "phonebook-neighbors-white.png"),
    ("What's happening around town",            "white", "calendar-whats-happening-white.png"),
    ("Add your listing",                        "white", "directory-add-listing-white.png"),
    ("Notes & stories from Seldovia",           "white", "gazette-notes-stories-white.png"),
]

def build_font():
    f = TTFont(FONT)
    return dict(
        upm=f['head'].unitsPerEm, cmap=f.getBestCmap(),
        order=f.getGlyphOrder(), hmtx=f['hmtx'], docs=f['SVG '].docList,
    )

def doc_for_gid(F, gid):
    for d in F['docs']:
        if d[1] <= gid <= d[2]:
            return d[0]
    return None

def glyph_png(F, gid):
    doc = doc_for_gid(F, gid)
    if not doc: return None
    root = ET.fromstring(doc)
    target = root if root.get("id") == f"glyph{gid}" else None
    if target is None:
        for el in root.iter():
            if el.get("id") == f"glyph{gid}": target = el; break
    if target is None: target = root
    img = target if target.tag == f"{NS}image" else target.find(f".//{NS}image")
    if img is None: return None
    href = img.get(f"{XLINK}href") or img.get("href")
    pim = Image.open(io.BytesIO(base64.b64decode(href.split(",", 1)[1]))).convert("RGBA")
    return dict(x=float(img.get("x", 0)), y=float(img.get("y", 0)),
                w=float(img.get("width")), h=float(img.get("height")), im=pim)

def recolor(im, mode):
    if mode == "ink":
        return im  # original dark watercolor
    a = np.asarray(im).astype(float)
    rgb, alpha = a[..., :3] / 255.0, a[..., 3] / 255.0
    lum = 0.299*rgb[..., 0] + 0.587*rgb[..., 1] + 0.114*rgb[..., 2]
    dark = 1.0 - lum  # 1 where ink is darkest
    if mode == "white":
        out = np.zeros_like(a)
        out[..., 0] = 252; out[..., 1] = 250; out[..., 2] = 245
        # keep the dry-brush texture: denser ink -> more opaque white
        out[..., 3] = (alpha * (0.55 + 0.45*dark) * 255).clip(0, 255)
        return Image.fromarray(out.astype('uint8'), 'RGBA')
    return im

def render(F, text, mode, px=PX):
    text = text.replace("’", "'")  # curly apostrophe -> straight (font has only straight)
    S = px / F['upm']
    cmap, order, hmtx = F['cmap'], F['order'], F['hmtx']
    glyphs, penx = [], 0.0
    for ch in text:
        cp = ord(ch)
        if ch == " ":
            penx += (hmtx[cmap[cp]][0] if cp in cmap else F['upm']*0.3); continue
        if cp not in cmap:
            penx += F['upm']*0.3; continue
        gname = cmap[cp]; gid = order.index(gname)
        g = glyph_png(F, gid)
        if g: glyphs.append((penx, g))
        penx += hmtx[gname][0]
    minT = min(g['y'] for _, g in glyphs); maxB = max(g['y']+g['h'] for _, g in glyphs)
    pad = int(PX*0.06)
    W = int(penx*S) + pad*2; H = int((maxB-minT)*S) + pad*2
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for px0, g in glyphs:
        im = recolor(g['im'].resize((max(1, round(g['w']*S)), max(1, round(g['h']*S)))), mode)
        canvas.alpha_composite(im, (round((px0+g['x'])*S)+pad, round((g['y']-minT)*S)+pad))
    return canvas.crop(canvas.getbbox())

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    F = build_font()
    for text, mode, fn in MANIFEST:
        img = render(F, text, mode)
        img.save(os.path.join(OUT, fn))
        print(f"  {fn:28s} {img.size}  ({mode})  \"{text}\"")
    print("done ->", OUT)
