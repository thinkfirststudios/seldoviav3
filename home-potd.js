/* Home "Photo of the Day" column (Jenny Oct 8): the newest daily photo (same rules as the Photos page:
   scheduled photos stay hidden until their date), linking to the Photos page. Falls back to a simple link. */
(function(){
  const box=document.querySelector("#homePotd"); if(!box) return;
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const head=`<div class="ts-head"><h3>Photo of the Day</h3></div>`;
  box.innerHTML=`<div class="potd-card">${head}<a class="potd-fallback" href="gallery.html">See today's photo →</a></div>`;
  if(!window.db) return;
  const akToday=new Date().toLocaleDateString("en-CA",{timeZone:"America/Anchorage"});
  db.from("photos").select("image_url,caption,taken_on").lte("taken_on",akToday).order("taken_on",{ascending:false}).limit(1)
    .then(({data})=>{ const p=data&&data[0]; if(!p||!p.image_url) return;
      const d=p.taken_on?new Date(p.taken_on+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"";
      box.innerHTML=`<div class="potd-card">${head}
        <a class="potd-link" href="gallery.html" aria-label="Photo of the Day: ${esc(p.caption||"Seldovia")}. See all photos">
          <span class="potd-media"><img src="${esc(p.image_url)}" alt="${esc(p.caption||"Seldovia photo of the day")}" loading="lazy"></span>
          <span class="potd-cap">${esc(p.caption||"")}</span>${d?`<span class="potd-date">${esc(d)}</span>`:""}
        </a><a class="ts-all" href="gallery.html">More photos →</a></div>`; })
    .catch(()=>{});
})();
