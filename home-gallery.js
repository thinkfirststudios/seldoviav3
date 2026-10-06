/* Home "Around the Bay" photo rows — fed from the whole photo library (Supabase).
   Rebuilt Oct 6 (Jenny): "always have new photos appear", never the same photo passing itself in the two rows,
   and the top row must not freeze or go missing.
   - The rows are moved by JavaScript instead of a CSS loop. When a photo scrolls off one side it comes back on the
     other side as a NEW photo, drawn from one shuffled list of the whole library, so photos don't repeat until the
     whole library has been shown and the two rows never show the same photo.
   - The old CSS loop paused on :hover, and on phones a tap "sticks" as hover, so a touched row could stay frozen.
     Now a mouse pauses a row while it's over it; a touch pauses it briefly and it always starts again.
   - Each photo keeps an index into window.GALLERY, so tapping still opens the full-size viewer (app.js).
   Falls back silently to whatever app.js already rendered (the static set) if the library can't load. */
(function(){
  const rows=[document.querySelector("#galleryTrack"), document.querySelector("#galleryTrack2")].filter(Boolean);
  const G=window.GALLERY, fig=window.galFig;
  if(!rows.length || !window.db || !Array.isArray(G) || typeof fig!=="function") return;
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  db.from("photos").select("image_url,caption").order("taken_on",{ascending:false}).limit(2000)
    .then(({data,error})=>{
      if(error || !data || data.length<4) return;
      const seen=new Set();
      // Leave out real-estate listing shots that live in the photo library (Alex, Oct 6: "listing photos showed up").
      const pool=data.filter(d=>d.image_url && !/listing/i.test(d.caption||"") && !seen.has(d.image_url) && seen.add(d.image_url))
                     .map(d=>({img:d.image_url, cap:d.caption||"Seldovia"}));
      for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
      let ptr=0;
      G.length=0;                                    // the viewer reads the photos actually shown
      const next=()=>{ const p=pool[ptr++ % pool.length]; G.push(p); return G.length-1; };
      const fill=(el,idx)=>{ const g=G[idx], im=el.querySelector("img"), cap=el.querySelector("figcaption");
        el.dataset.idx=idx; im.src=g.img; im.alt=g.cap; if(cap) cap.textContent=g.cap; };

      rows.forEach((track,r)=>{
        const strip=track.parentElement, gap=16, dir=r===0?-1:1;      // top row moves left, bottom row moves right
        track.style.animation="none"; track.style.willChange="transform";
        // Enough photos to cover the strip plus one spare on each side.
        const probe=document.createElement("div"); probe.innerHTML=fig(G[next()]||pool[0],G.length-1); const first=probe.firstElementChild;
        track.innerHTML=""; track.appendChild(first);
        const w=()=>first.getBoundingClientRect().width||300;
        const need=()=>Math.ceil(strip.clientWidth/(w()+gap))+2;
        const addOne=atStart=>{ const t=document.createElement("div"); t.innerHTML=fig(G[next()],G.length-1);
          const el=t.firstElementChild; atStart?track.insertBefore(el,track.firstChild):track.appendChild(el); return el; };
        while(track.children.length<need()) addOne(false);
        if(reduce) return;                             // no motion: the strip scrolls by hand (CSS)

        let x=dir<0?0:-(w()+gap), last=0, paused=false, resumeT=null;
        const SPEED=34;                                // pixels per second
        const step=t=>{
          const dt=last?Math.min(0.1,(t-last)/1000):0; last=t;
          if(!paused && !document.hidden){
            x+=dir*SPEED*dt;
            const span=w()+gap;
            if(dir<0 && -x>=span){ const el=track.firstElementChild; track.appendChild(el); fill(el,next()); x+=span; }
            if(dir>0 && x>=0){ const el=track.lastElementChild; track.insertBefore(el,track.firstElementChild); fill(el,next()); x-=span; }
            while(track.children.length<need()) addOne(false);
            track.style.transform=`translate3d(${x.toFixed(2)}px,0,0)`;
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        // Mouse: pause while pointing at a row. Touch: pause briefly, then always carry on.
        strip.addEventListener("pointerenter",e=>{ if(e.pointerType==="mouse"){ paused=true; clearTimeout(resumeT); } });
        strip.addEventListener("pointerleave",e=>{ if(e.pointerType==="mouse") paused=false; });
        strip.addEventListener("pointerdown",e=>{ if(e.pointerType!=="mouse"){ paused=true; clearTimeout(resumeT); resumeT=setTimeout(()=>paused=false,2500); } });
      });
    }).catch(()=>{});
})();
