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
      // Title is now Jenny's logo image (Oct 7); the admin's title field no longer changes the heading.
      set("featBody",    f.body);
      const btn=document.getElementById("featBtn");
      if(btn){
        if(f.btnLabel!=null && f.btnLabel!=="") btn.textContent=f.btnLabel;
        // Jenny Oct 8: the button goes to the Blog. Older saved settings still point at the phone book, so map those.
        const link=(f.btnLink==="phone-book.html"||!f.btnLink)?"gazette.html":f.btnLink;
        btn.setAttribute("href", link);
        if(link==="gazette.html" && /phone book/i.test(btn.textContent)) btn.textContent="Read the Seldovia Blog";
        if(f.btnLabel==="") btn.style.display="none"; // empty label hides the button
      }
      // Jenny Oct 8: her "You know you're in Seldovia when..." logo is always the picture here (no photo).
    }).catch(()=>{});
})();
