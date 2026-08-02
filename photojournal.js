/* Public Photo Journal — loads Jenny's daily photos from Supabase and renders:
     1. "Seldovia Today"  — the most recent photo, featured big
     2. "This month over the years" — photos taken in the current calendar month (option C, seasonal)
     3. The journal — every photo grouped by month, newest month first, with dates
   If the DB is empty/unreachable, the built-in static gallery (rendered by app.js
   into #staticGallery) stays as a graceful fallback. */
(function(){
  const app=document.querySelector("#journalApp");
  if(!app || !window.db) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const MON3=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmt=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MON3[+m-1]} ${+day}, ${y}`; };
  const fig=p=>`<figure class="jphoto">
      <img src="${esc(p.image_url)}" alt="${esc(p.caption||"")}" loading="lazy">
      <figcaption><b>${esc(fmt(p.taken_on))}</b>${p.caption?" · "+esc(p.caption):""}</figcaption></figure>`;

  db.from("photos").select("*").order("taken_on",{ascending:false})
    .then(({data,error})=>{
      if(error || !data || !data.length) return; // keep static gallery as-is
      // The built-in "More Seldovia photos" gallery below stays visible (nothing is removed).

      const akToday=new Date().toLocaleDateString("en-CA",{timeZone:"America/Anchorage"}); // YYYY-MM-DD in Alaska
      const newest=data[0];
      // Only feature a photo in "Seldovia Today" if it was actually posted TODAY. Otherwise
      // the hero is skipped and every photo simply lives in the gallery below (nothing stale up top).
      const featured=(newest.taken_on===akToday)?newest:null;
      const curMonth=+akToday.split("-")[1]-1; // 0-11, Alaska time
      const seasonal=data.filter(p=>(+p.taken_on.split("-")[1]-1)===curMonth && (!featured||p.id!==featured.id));

      // group everything by YYYY-MM, newest month first (the newest photo still lives in its month here)
      const groups={};
      data.forEach(p=>{ const [y,m]=p.taken_on.split("-"); (groups[`${y}-${m}`]=groups[`${y}-${m}`]||[]).push(p); });
      const keys=Object.keys(groups).sort().reverse();

      let html = featured ? `
        <section class="today-feature">
          <div class="today-media"><img src="${esc(featured.image_url)}" alt="${esc(featured.caption||"Seldovia today")}"></div>
          <div class="today-cap">
            <span class="eyebrow">Seldovia Today</span>
            <h2>${esc(featured.caption||"A moment from around the bay")}</h2>
            <div class="today-date">${esc(fmt(featured.taken_on))}</div>
          </div>
        </section>` : "";

      if(seasonal.length){
        html+=`<section class="journal-section">
          <div class="section-head"><span class="eyebrow">This month over the years</span>
          <h2 class="title">${MON[curMonth]} in Seldovia</h2>
          <p>The same season, remembered across the years.</p></div>
          <div class="journal-grid">${seasonal.map(fig).join("")}</div></section>`;
      }

      html+=keys.map(k=>{
        const [y,m]=k.split("-");
        return `<section class="journal-section">
          <div class="journal-month"><h3>${MON[+m-1]} ${y}</h3></div>
          <div class="journal-grid">${groups[k].map(fig).join("")}</div></section>`;
      }).join("");

      app.innerHTML=html;

      // Move the webcams up under the Daily Photo — or to the very top when no photo is
      // featured today — so they stay prominent either way (Jenny's ask).
      const wc=document.querySelector("#webcamsSection");
      if(wc){ const feat=app.querySelector(".today-feature");
        if(feat) feat.insertAdjacentElement("afterend", wc);
        else app.insertAdjacentElement("afterbegin", wc); }

      // click-to-enlarge lightbox (reuses the site .lightbox styles), with prev/next over every journal photo
      const imgs=[...app.querySelectorAll("img")];
      if(!imgs.length) return;
      document.body.insertAdjacentHTML("beforeend", `<div class="lightbox" id="journalLightbox" role="dialog" aria-modal="true" aria-hidden="true">
        <button class="lb-close" aria-label="Close">&#10005;</button>
        <button class="lb-nav lb-prev" aria-label="Previous photo">&#8249;</button>
        <figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>
        <button class="lb-nav lb-next" aria-label="Next photo">&#8250;</button>
      </div>`);
      const lb=document.querySelector("#journalLightbox"), lbImg=lb.querySelector(".lb-img"), lbCap=lb.querySelector(".lb-cap");
      let cur=0;
      const show=i=>{ cur=(i+imgs.length)%imgs.length; const im=imgs[cur]; lbImg.src=im.src; lbImg.alt=im.alt||""; lbCap.textContent=im.alt||""; lb.classList.add("open"); lb.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; };
      const close=()=>{ lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); document.body.style.overflow=""; };
      lb.querySelector(".lb-close").addEventListener("click",close);
      lb.querySelector(".lb-prev").addEventListener("click",e=>{e.stopPropagation(); show(cur-1);});
      lb.querySelector(".lb-next").addEventListener("click",e=>{e.stopPropagation(); show(cur+1);});
      lb.addEventListener("click",e=>{ if(e.target===lb||e.target.classList.contains("lb-fig")) close(); });
      document.addEventListener("keydown",e=>{ if(!lb.classList.contains("open"))return; if(e.key==="Escape")close(); else if(e.key==="ArrowLeft")show(cur-1); else if(e.key==="ArrowRight")show(cur+1); });
      imgs.forEach((im,i)=>{ im.style.cursor="zoom-in"; im.addEventListener("click",()=>show(i)); });
    })
    .catch(()=>{}); // network error → static fallback stays
})();
