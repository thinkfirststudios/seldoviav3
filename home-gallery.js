/* Home "Around the Bay" marquee — fill from the real photo library (Supabase) so it shows
   many varied, current photos instead of the same dozen. Rebuilds the shared GALLERY array
   in place so the existing lightbox keeps working, then re-renders both marquee tracks.
   Falls back silently to whatever app.js already rendered (the static set). */
(function(){
  const t1=document.querySelector("#galleryTrack"), t2=document.querySelector("#galleryTrack2");
  const G=window.GALLERY, fig=window.galFig;
  if(!t1 || !window.db || !Array.isArray(G) || typeof fig!=="function") return;

  db.from("photos").select("image_url,caption").order("taken_on",{ascending:false}).limit(400)
    .then(({data,error})=>{
      if(error || !data || !data.length) return;
      // Drop duplicate images so the sliders never show the same photo twice (Jenny: "doubles").
      const seen=new Set(); const uniq=data.filter(d=>{ if(!d.image_url||seen.has(d.image_url)) return false; seen.add(d.image_url); return true; });
      // Spread the picks evenly across the whole library so it isn't all one recent week.
      const N=Math.min(48, uniq.length), step=Math.max(1, Math.floor(uniq.length/N));
      const picks=[];
      for(let i=0; i<uniq.length && picks.length<N; i+=step){
        picks.push({ img:uniq[i].image_url, cap:uniq[i].caption||"Seldovia" });
      }
      if(picks.length<2) return;
      G.length=0; picks.forEach(p=>G.push(p)); // mutate in place → lightbox reads the new set

      // Two rows show DIFFERENT photos (Jenny): top gets the first half, bottom the second half.
      // Each row's HTML is doubled (and only doubled) so the -50% marquee loop stays seamless.
      const half=Math.ceil(G.length/2);
      let top=G.slice(0,half), bot=G.slice(half);
      if(!top.length) top=G.slice();            // never leave a row empty
      if(!bot.length) bot=G.slice();
      const rowHTML=arr=>arr.map(g=>fig(g,G.indexOf(g))).join("");
      // Build a block wide enough to fill the strip (repeat a short row-set), then duplicate the
      // WHOLE block so the -50% marquee loop is still seamless. Keeps a sparse row from looking empty.
      const block=arr=>{ const one=rowHTML(arr); const reps=Math.max(1, Math.ceil(12/arr.length)); const x=one.repeat(reps); return x+x; };
      t1.innerHTML=block(top);
      if(t2) t2.innerHTML=block(bot);
    }).catch(()=>{});
})();
