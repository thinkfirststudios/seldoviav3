/* Explore "Local Favorite" feature card. Jenny edits it from the admin
   (Supabase `settings`: explore_feature = JSON with eyebrow/title/body/
   btnLabel/btnLink/image). The HTML holds the current defaults, so the card
   still shows if the DB/setting isn't there yet. All client-side. */
(function(){
  const wrap=document.querySelector(".feature");
  if(!wrap || !window.db) return;
  db.from("settings").select("value").eq("key","explore_feature").maybeSingle()
    .then(({data,error})=>{
      if(error || !data || !data.value) return;
      let f; try{ f=JSON.parse(data.value); }catch(e){ return; }
      const set=(id,txt)=>{ const el=document.getElementById(id); if(el && txt!=null && txt!=="") el.textContent=txt; };
      set("featEyebrow", f.eyebrow);
      set("featTitle",   f.title);
      set("featBody",    f.body);
      const btn=document.getElementById("featBtn");
      if(btn){
        if(f.btnLabel!=null && f.btnLabel!=="") btn.textContent=f.btnLabel;
        if(f.btnLink) btn.setAttribute("href", f.btnLink);
        if(f.btnLabel==="") btn.style.display="none"; // empty label hides the button
      }
      if(f.image){
        const m=document.getElementById("featureMedia");
        if(m) m.innerHTML=`<img class="feature-photo" src="${f.image}" alt="${(f.title||"").replace(/"/g,"&quot;")}" loading="lazy">`;
      }
    }).catch(()=>{});
})();
