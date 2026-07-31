/* Public real-estate listings from Supabase.
   - On the Real Estate page (#reGrid): prepends Jenny's real listings ahead of
     the built-in curated ones, with the listed date shown.
   - On a listing page (#listingDetail): if the ?id= slug isn't one of the
     built-in listings, render the Supabase listing (photos gallery + video).
   The built-in LISTINGS (rendered by app.js) stay as a graceful fallback. */
(function(){
  if(!window.db) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmt=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MON[+m-1]} ${+day}, ${y}`; };
  const isStatic=slug=>(typeof LISTINGS!=="undefined") && LISTINGS.some(x=>x.slug===slug);

  function videoEmbed(url){
    if(!url) return "";
    let m=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if(m) return `<div class="listing-video"><iframe src="https://www.youtube.com/embed/${m[1]}" title="Listing video" loading="lazy" allowfullscreen></iframe></div>`;
    m=url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if(m) return `<div class="listing-video"><iframe src="https://player.vimeo.com/video/${m[1]}" title="Listing video" loading="lazy" allowfullscreen></iframe></div>`;
    return `<p style="margin-top:.8rem"><a class="btn btn-ghost" href="${esc(url)}" target="_blank" rel="noopener">Watch the video →</a></p>`;
  }

  /* ---- Real Estate carousel ---- */
  const grid=document.querySelector("#reGrid");
  if(grid){
    db.from("listings").select("*").eq("published",true).order("listed_on",{ascending:false})
      .then(({data,error})=>{
        if(error || !data || !data.length) return;
        const cards=data.map(l=>`
          <a class="place" href="listing.html?id=${encodeURIComponent(l.slug||l.id)}">
            <div class="place-media"><img class="place-photo" src="${esc(l.image_url||"")}" alt="${esc(l.address)}" loading="lazy" width="600" height="400" onerror="this.closest('.place-media').classList.add('place-media-blank');this.remove()"><span class="badge-open">${esc(l.status||"For Sale")}</span></div>
            <div class="place-body">
              <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.6rem"><span class="price" style="font-size:1.15rem">${esc(l.price||"")}</span><span style="font-size:.82rem;color:var(--accent-ink);font-weight:700">Details →</span></div>
              <h4>${esc(l.address)}</h4>
              <div class="place-loc" style="gap:1rem">${(l.beds||l.baths)?`<span><b style="color:var(--heading)">${esc(l.beds||"—")}</b> bd</span><span><b style="color:var(--heading)">${esc(l.baths||"—")}</b> ba</span><span><b style="color:var(--heading)">${esc(l.sqft||"—")}</b> sqft</span>`:`<span><b style="color:var(--heading)">Land</b></span>${l.sqft?`<span><b style="color:var(--heading)">${esc(l.sqft)}</b> sq ft lot</span>`:""}`}</div>
              <div class="listing-date">Listed ${esc(fmt(l.listed_on))}</div>
            </div>
          </a>`).join("");
        grid.insertAdjacentHTML("afterbegin", cards);
        grid.dispatchEvent(new Event("scroll")); // nudge carousel arrows to recompute
      }).catch(()=>{});
  }

  /* ---- Listing detail ---- */
  const box=document.querySelector("#listingDetail");
  if(box){
    const id=new URLSearchParams(location.search).get("id");
    if(!id || isStatic(id)) return; // app.js already handled built-in listings
    db.from("listings").select("*").eq("slug",id).limit(1)
      .then(({data})=>{
        if(!data || !data.length) return;
        const l=data[0];
        const isLand = !l.beds && !l.baths;
        document.title=`${l.address} — Seldovia Property`;
        const descHtml=(l.description||"").split(/\n\n+/).map(p=>`<p>${esc(p.trim())}</p>`).join("");
        const photos=Array.isArray(l.photos)?l.photos:[];
        box.innerHTML=`
          <a class="back-link" href="real-estate.html">← All listings</a>
          <div class="listing-hero"><img src="${esc(l.image_url||"")}" alt="${esc(l.address)}" onerror="this.closest('.listing-hero').classList.add('place-media-blank');this.remove()"><span class="badge-open">${esc(l.status||"For Sale")}</span></div>
          <div class="listing-top">
            <div><div class="price" style="font-size:1.9rem">${esc(l.price||"")}</div><h1 style="margin:.15rem 0 0">${esc(l.address)}</h1><div class="listing-city">${esc(l.city||"Seldovia, AK")}</div><div class="listing-date">Listed ${esc(fmt(l.listed_on))}</div></div>
            <a class="btn btn-primary" href="contact.html">${isLand?"Ask about this property":"Ask about this home"}</a>
          </div>
          <div class="listing-stats">
            ${isLand
              ? `<div><b>Land</b><span>Property Type</span></div>${l.sqft?`<div><b>${esc(l.sqft)}</b><span>Sq Ft Lot</span></div>`:""}`
              : `<div><b>${esc(l.beds||"—")}</b><span>Beds</span></div><div><b>${esc(l.baths||"—")}</b><span>Baths</span></div><div><b>${esc(l.sqft||"—")}</b><span>Sq Ft</span></div>`}
          </div>
          ${l.description?`<h3 class="listing-h">${isLand?"About this property":"About this home"}</h3><div class="listing-desc">${descHtml}</div>`:""}
          ${photos.length?`<h3 class="listing-h">Photos</h3><div class="listing-gallery">${photos.map(u=>`<img src="${esc(u)}" loading="lazy" alt="${esc(l.address)}">`).join("")}</div>`:""}
          ${l.video_url?`<h3 class="listing-h">Video</h3>${videoEmbed(l.video_url)}`:""}
          <div class="re-cta" style="margin-top:2.2rem"><div><h3>Interested in ${esc(l.address)}?</h3><p>Reach out to Jenny for a showing, more photos, or the full disclosure packet.</p></div><a class="btn btn-primary" href="contact.html">Contact Jenny</a></div>`;
      }).catch(()=>{});
  }
})();
