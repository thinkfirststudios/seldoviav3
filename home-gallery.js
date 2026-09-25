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
      // Spread the picks evenly across the whole library so it isn't all one recent week.
      const N=Math.min(48, data.length), step=Math.max(1, Math.floor(data.length/N));
      const picks=[];
      for(let i=0; i<data.length && picks.length<N; i+=step){
        picks.push({ img:data[i].image_url, cap:data[i].caption||"Seldovia" });
      }
      if(picks.length<2) return;
      G.length=0; picks.forEach(p=>G.push(p)); // mutate in place → lightbox reads the new set

      // Two rows show DIFFERENT photos (Jenny): top gets the first half, bottom the second half,
      // so the marquees never overlap the same images. Each row's HTML is doubled for a seamless loop.
      const half=Math.ceil(G.length/2);
      const top=G.slice(0,half), bot=G.slice(half);
      const rowHTML=arr=>arr.map(g=>fig(g,G.indexOf(g))).join("");
      const a=rowHTML(top); t1.innerHTML=a+a;
      if(t2){ const b=rowHTML(bot); t2.innerHTML=b+b; }
    }).catch(()=>{});
})();
