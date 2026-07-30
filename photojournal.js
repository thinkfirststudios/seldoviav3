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

      const today=data[0];
      const curMonth=new Date().getMonth(); // 0-11
      const seasonal=data.filter(p=>(+p.taken_on.split("-")[1]-1)===curMonth && p.id!==today.id);

      // group everything by YYYY-MM, newest month first
      const groups={};
      data.forEach(p=>{ const [y,m]=p.taken_on.split("-"); (groups[`${y}-${m}`]=groups[`${y}-${m}`]||[]).push(p); });
      const keys=Object.keys(groups).sort().reverse();

      let html=`
        <section class="today-feature">
          <div class="today-media"><img src="${esc(today.image_url)}" alt="${esc(today.caption||"Seldovia today")}"></div>
          <div class="today-cap">
            <span class="eyebrow">Seldovia Today</span>
            <h2>${esc(today.caption||"A moment from around the bay")}</h2>
            <div class="today-date">${esc(fmt(today.taken_on))}</div>
          </div>
        </section>`;

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
    })
    .catch(()=>{}); // network error → static fallback stays
})();
