/* Public blog — load Jenny's newer posts from Supabase and ADD them to the top
   of the built-in archive (503 migrated posts rendered by app.js). Nothing that's
   already there is removed. If the DB is empty/unreachable, only the built-in
   posts show. */
(function(){
  const grid=document.querySelector("#gazetteGrid");
  if(!grid || !window.db) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmt=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MONTHS[+m-1]} ${+day}, ${y}`; };
  const bodyHtml=t=>"<p>"+esc((t||"").trim()).replace(/\n{2,}/g,"</p><p>").replace(/\n/g,"<br>")+"</p>";

  // Key a post by title + date so we never show the same one twice.
  const norm=s=>String(s||"").trim().toLowerCase().replace(/\s+/g," ");
  const keyOf=(title,dateText)=>norm(title)+"|"+norm(dateText);

  db.from("posts").select("*").eq("published",true).order("post_date",{ascending:false})
    .then(({data,error})=>{
      if(error || !data || !data.length) return; // built-in posts stay
      // Skip any DB post that already exists in the built-in archive (or is a
      // duplicate of another DB post). This is what stops the duplicate photos.
      const existing=new Set([...grid.querySelectorAll(".post")].map(card=>{
        const t=card.querySelector("h4"), d=card.querySelector(".post-meta span");
        return keyOf(t?t.textContent:"", d?d.textContent:"");
      }));
      const seen=new Set();
      data=data.filter(p=>{ const k=keyOf(p.title,fmt(p.post_date));
        if(existing.has(k)||seen.has(k)) return false; seen.add(k); return true; });
      if(!data.length) return;
      const html=data.map(p=>`<article class="post">
        ${p.image_url?`<div class="post-media"><img class="post-photo" src="${esc(p.image_url)}" alt="${esc(p.title)}" loading="lazy" onerror="this.closest('.post-media').style.display='none'"></div>`:""}
        <div class="post-body"><span class="kicker">${esc(p.category||'Blog')}</span><h4>${esc(p.title)}</h4>
        <div class="post-meta"><span>${esc(fmt(p.post_date))}</span></div>
        <div class="post-text clamp">${bodyHtml(p.body||p.excerpt)}</div>
        <button class="show-more" type="button">Read more</button></div></article>`).join("");
      grid.insertAdjacentHTML("afterbegin", html);
      // wire "Read more" on just the newly-added cards
      [...grid.querySelectorAll(".post")].slice(0,data.length).forEach(card=>{
        const text=card.querySelector(".post-text"), btn=card.querySelector(".show-more");
        if(!text||!btn) return;
        if(text.scrollHeight<=text.clientHeight+4){ btn.remove(); return; }
        btn.addEventListener("click",()=>{ const c=text.classList.toggle("clamp"); btn.textContent=c?"Read more":"Read less"; });
      });
    })
    .catch(()=>{});
})();
