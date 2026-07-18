/* Public blog — load published posts from Supabase and render into the Gazette
   grid. If the DB is empty or unreachable, the built-in posts (rendered by
   app.js) stay as a graceful fallback. */
(function(){
  const grid=document.querySelector("#gazetteGrid");
  if(!grid || !window.db) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmt=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MONTHS[+m-1]} ${+day}, ${y}`; };
  db.from("posts").select("*").eq("published",true).order("post_date",{ascending:false})
    .then(({data,error})=>{
      if(error || !data || !data.length) return; // keep app.js fallback
      grid.innerHTML=data.map(p=>`<a class="post" href="gazette.html"><div class="post-media"><img class="post-photo" src="${esc(p.image_url||'')}" alt="${esc(p.title)}" loading="lazy" width="880" height="550"></div>
        <div class="post-body"><span class="kicker">${esc(p.category||'Blog')}</span><h4>${esc(p.title)}</h4><p>${esc(p.excerpt||'')}</p>
        <div class="post-meta"><span>${esc(fmt(p.post_date))}</span></div></div></a>`).join("");
    })
    .catch(()=>{});
})();
