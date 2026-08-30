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
    const isSold=l=>String(l.status||"").toLowerCase()==="sold";
    const card=l=>`
          <a class="place${isSold(l)?" place-sold":""}" href="listing.html?id=${encodeURIComponent(l.slug||l.id)}">
            <div class="place-media"><img class="place-photo" src="${(window.LISTING_PHOTOS&&LISTING_PHOTOS[l.slug]&&LISTING_PHOTOS[l.slug][0])||esc(l.image_url||'')}" alt="${esc(l.address)}" loading="lazy" width="600" height="400" onerror="this.closest('.place-media').classList.add('place-media-blank');this.remove()"><span class="badge-open${isSold(l)?" badge-sold":""}">${esc(l.status||"For Sale")}</span></div>
            <div class="place-body">
              <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.6rem"><span class="price" style="font-size:1.15rem">${esc(l.price||"")}</span><span style="font-size:.82rem;color:var(--accent-ink);font-weight:700">Details →</span></div>
              <h4>${esc(l.address)}</h4>
              <div class="place-loc" style="gap:1rem">${(l.beds||l.baths)?`<span><b style="color:var(--heading)">${esc(l.beds||"—")}</b> bd</span><span><b style="color:var(--heading)">${esc(l.baths||"—")}</b> ba</span><span><b style="color:var(--heading)">${esc(l.sqft||"—")}</b> sqft</span>`:`<span><b style="color:var(--heading)">Land</b></span>${l.sqft?`<span><b style="color:var(--heading)">${esc(l.sqft)}</b> sq ft lot</span>`:""}`}</div>
              ${l.listed_on?`<div class="listing-date">${isSold(l)?"":"Listed "}${esc(fmt(l.listed_on))}</div>`:""}
            </div>
          </a>`;
    db.from("listings").select("*").eq("published",true).order("listed_on",{ascending:false,nullsFirst:false})
      .then(({data,error})=>{
        if(error || !data || !data.length) return;
        const active=data.filter(l=>!isSold(l)), sold=data.filter(isSold);
        grid.insertAdjacentHTML("afterbegin", active.map(card).join(""));
        grid.dispatchEvent(new Event("scroll")); // nudge carousel arrows to recompute
        // Recently sold → its own section (kept out of active inventory, realtor best practice)
        const soldGrid=document.querySelector("#soldGrid"), soldSec=document.querySelector("#soldSection");
        if(soldGrid && sold.length){ soldGrid.innerHTML=sold.map(card).join(""); if(soldSec) soldSec.style.display=""; }
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
        // Prefer photos from a matching images/listings/<slug>/ folder; else use the admin-uploaded ones.
        const fp=(window.LISTING_PHOTOS&&LISTING_PHOTOS[l.slug])||null;
        const heroImg=fp?fp[0]:(l.image_url||"");
        const photos=fp?fp.slice(1):(Array.isArray(l.photos)?l.photos:[]);
        const allImgs=[heroImg, ...photos].filter(Boolean);
        // Main image becomes a swipe-right carousel of ALL photos (no need to scroll down).
        const heroBlock = allImgs.length>1
          ? `<div class="listing-carousel" data-count="${allImgs.length}">
               <div class="lc-track">${allImgs.map((u,i)=>`<img src="${esc(u)}" alt="${esc(l.address)} — photo ${i+1}"${i?' loading="lazy"':""}>`).join("")}</div>
               <button class="lc-btn lc-prev" type="button" aria-label="Previous photo">‹</button>
               <button class="lc-btn lc-next" type="button" aria-label="Next photo">›</button>
               <span class="badge-open">${esc(l.status||"For Sale")}</span>
               <span class="lc-count"><span class="lc-cur">1</span>/${allImgs.length}</span>
             </div>`
          : `<div class="listing-hero"><img src="${esc(heroImg)}" alt="${esc(l.address)}" onerror="this.closest('.listing-hero').classList.add('place-media-blank');this.remove()"><span class="badge-open">${esc(l.status||"For Sale")}</span></div>`;
        box.innerHTML=`
          <a class="back-link" href="real-estate.html">← All listings</a>
          ${heroBlock}
          <div class="listing-top">
            <div><div class="price" style="font-size:1.9rem">${esc(l.price||"")}</div><h1 style="margin:.15rem 0 0">${esc(l.address)}</h1><div class="listing-city">${esc(l.city||"Seldovia, AK")}</div>${l.listed_on?`<div class="listing-date">Listed ${esc(fmt(l.listed_on))}</div>`:""}</div>
            <a class="btn btn-primary" href="contact.html">${isLand?"Ask about this property":"Ask about this home"}</a>
          </div>
          <div class="listing-stats">
            ${isLand
              ? `<div><b>Land</b><span>Property Type</span></div>${l.sqft?`<div><b>${esc(l.sqft)}</b><span>Sq Ft Lot</span></div>`:""}`
              : `<div><b>${esc(l.beds||"—")}</b><span>Beds</span></div><div><b>${esc(l.baths||"—")}</b><span>Baths</span></div><div><b>${esc(l.sqft||"—")}</b><span>Sq Ft</span></div>`}
          </div>
          ${l.description?`<h3 class="listing-h">${isLand?"About this property":"About this home"}</h3><div class="listing-desc">${descHtml}</div>`:""}
          ${l.video_url?`<h3 class="listing-h">Video</h3>${videoEmbed(l.video_url)}`:""}
          <div class="re-cta" style="margin-top:2.2rem"><div><h3>Interested in ${esc(l.address)}?</h3><p>Reach out to Jenny for a showing, more photos, or the full disclosure packet.</p></div><a class="btn btn-primary" href="contact.html">Contact Jenny</a></div>`;

        // Wire the photo carousel: arrows + live counter (swipe/scroll works natively).
        const car=box.querySelector(".listing-carousel");
        if(car){
          const track=car.querySelector(".lc-track"), cur=car.querySelector(".lc-cur"), n=+car.dataset.count;
          const go=dir=>track.scrollBy({left:dir*track.clientWidth, behavior:"smooth"});
          car.querySelector(".lc-prev").addEventListener("click",()=>go(-1));
          car.querySelector(".lc-next").addEventListener("click",()=>go(1));
          track.addEventListener("scroll",()=>{ const i=Math.min(n,Math.max(1,Math.round(track.scrollLeft/track.clientWidth)+1)); if(cur) cur.textContent=i; },{passive:true});
        }

        // #11: click any listing photo to open a full-screen lightbox and scroll through the big versions.
        if(allImgs.length){
          document.body.insertAdjacentHTML("beforeend",`<div class="lightbox" id="reLightbox" role="dialog" aria-modal="true" aria-hidden="true">
            <button class="lb-close" aria-label="Close">&#10005;</button>
            <button class="lb-nav lb-prev" aria-label="Previous photo">&#8249;</button>
            <figure class="lb-fig"><img class="lb-img" alt=""></figure>
            <button class="lb-nav lb-next" aria-label="Next photo">&#8250;</button>
          </div>`);
          const lb=document.getElementById("reLightbox"), lbImg=lb.querySelector(".lb-img"); let li=0;
          const show=i=>{ li=(i+allImgs.length)%allImgs.length; lbImg.src=allImgs[li]; lb.classList.add("open"); lb.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; };
          const close=()=>{ lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); document.body.style.overflow=""; };
          lb.querySelector(".lb-close").addEventListener("click",close);
          lb.querySelector(".lb-prev").addEventListener("click",e=>{e.stopPropagation(); show(li-1);});
          lb.querySelector(".lb-next").addEventListener("click",e=>{e.stopPropagation(); show(li+1);});
          lb.addEventListener("click",e=>{ if(e.target===lb||e.target.classList.contains("lb-fig")) close(); });
          document.addEventListener("keydown",e=>{ if(!lb.classList.contains("open"))return; if(e.key==="Escape")close(); else if(e.key==="ArrowLeft")show(li-1); else if(e.key==="ArrowRight")show(li+1); });
          box.querySelectorAll(".lc-track img, .listing-hero img").forEach((im,i)=>{ im.style.cursor="zoom-in"; im.addEventListener("click",()=>show(i)); });
        }
      }).catch(()=>{});
  }
})();
