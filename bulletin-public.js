/* Public News board (Jenny: a pinboard, like the blog).
   Seldovia's OWN notices (posted in the admin -> Supabase `bulletin`) show FIRST, each with
   an optional photo, a linked calendar event, and its own shareable permalink
   (bulletin.html?post=<id>). After those, the LIVE community feed from Seldovia.com's
   WordPress fills in, newest first, with "Load more" paging. Laid out as a masonry pinboard. */
(function(){
  const board=document.querySelector("#board");
  if(!board) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const decode=s=>{ const t=document.createElement("textarea"); t.innerHTML=String(s); return t.value; };
  const strip=h=>decode(String(h).replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();
  const fmtISO=d=>{ const dt=new Date(d); return isNaN(dt)?"":`${MON[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
  const fmtDB=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MON[+m-1]} ${+day}, ${y}`; };
  const clip=(s,n)=>{ s=String(s||""); return s.length>n ? s.slice(0,n).replace(/\s+\S*$/,"")+"…" : s; };
  const norm=s=>String(s||"").trim().toLowerCase().replace(/\s+/g," ");
  const seen=new Set(); // dedup by title across own notices + the WP feed (stops repeats)

  const ownPosts=[]; // keep Supabase rows for the ?post= detail view
  function ownCard(n){
    const ev=n.event_url?`<a class="n-event" href="${esc(n.event_url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">📅 View event</a>`:"";
    const img=n.image_url?`<div class="n-media"><img src="${esc(n.image_url)}" alt="" loading="lazy"></div>`:"";
    return `<article class="note note-own" tabindex="0" role="link" data-post="${esc(n.id)}">
      ${img}
      <div class="n-body">
        <span class="n-cat">${esc(n.category||"Notice")}</span>
        <h4>${esc(n.title)}</h4>
        ${n.body?`<p>${esc(clip(n.body,220))}</p>`:""}
        ${ev}
        <div class="n-foot"><span>${esc(n.posted_by||"Seldovia.com")}</span><span>${n.starts_on?esc(fmtDB(n.starts_on)):esc(fmtISO(n.created_at))}</span></div>
        <span class="n-open">Open →</span>
      </div></article>`;
  }
  function wpCard(p){
    const title=strip(p.title && p.title.rendered || "");
    const ex=clip(strip(p.excerpt && p.excerpt.rendered || ""),220);
    return `<a class="note note-link" href="${esc(p.link)}" target="_blank" rel="noopener">
      <div class="n-body">
        <span class="n-cat">Community</span>
        <h4>${esc(title)}</h4>
        ${ex?`<p>${esc(ex)}</p>`:""}
        <div class="n-foot"><span>Seldovia.com</span><span>${esc(fmtISO(p.date))}</span></div>
        <span class="n-open">Read more →</span></div></a>`;
  }

  /* "Load more" pages the WordPress archive */
  const moreWrap=document.createElement("div");
  moreWrap.className="center-link"; moreWrap.style.marginTop="1.4rem"; moreWrap.style.display="none";
  const btn=document.createElement("button"); btn.type="button"; btn.className="btn btn-ghost"; btn.textContent="Load more";
  moreWrap.appendChild(btn); board.insertAdjacentElement("afterend", moreWrap);

  const WP="https://www.seldovia.com/wp-json/wp/v2/posts?categories=1247,1140,2788,560,2247&per_page=20&orderby=date&order=desc&_fields=id,date,title,excerpt,link";
  let page=0, totalPages=1, loadingWP=false;
  function loadWP(){
    if(loadingWP || page>=totalPages) return;
    loadingWP=true; page++; btn.textContent="Loading…";
    fetch(WP+"&page="+page)
      .then(r=>{ totalPages=parseInt(r.headers.get("x-wp-totalpages")||totalPages,10)||1; if(!r.ok) throw 0; return r.json(); })
      .then(posts=>{
        if(Array.isArray(posts)&&posts.length){
          const fresh=posts.filter(p=>{ const t=norm(strip((p.title&&p.title.rendered)||"")); if(!t||seen.has(t)) return false; seen.add(t); return true; });
          if(fresh.length) board.insertAdjacentHTML("beforeend", fresh.map(wpCard).join(""));
        }
        loadingWP=false; btn.textContent="Load more"; moreWrap.style.display=page>=totalPages?"none":""; })
      .catch(()=>{ loadingWP=false; page--; btn.textContent="Load more"; });
  }
  btn.addEventListener("click", loadWP);

  /* detail view for an own-post permalink */
  function openDetail(n){
    if(!n) return;
    const ov=document.createElement("div"); ov.className="bul-modal";
    const ev=n.event_url?`<a class="btn btn-ghost" href="${esc(n.event_url)}" target="_blank" rel="noopener">📅 View calendar event</a>`:"";
    const link=n.link?`<a class="btn btn-ghost" href="${esc(n.link)}" target="_blank" rel="noopener">Open flyer ↗</a>`:"";
    ov.innerHTML=`<div class="bul-modal-card" role="dialog" aria-modal="true">
      <button class="bul-close" aria-label="Close">×</button>
      ${n.image_url?`<img class="bul-modal-img" src="${esc(n.image_url)}" alt="">`:""}
      <span class="n-cat">${esc(n.category||"Notice")}</span>
      <h3>${esc(n.title)}</h3>
      <div class="bul-meta">${esc(n.posted_by||"Seldovia.com")}${n.starts_on?" · "+esc(fmtDB(n.starts_on)):""}</div>
      ${n.body?`<p class="bul-body">${esc(n.body)}</p>`:""}
      <div class="bul-actions">${ev}${link}<button class="btn btn-ghost bul-share" type="button">🔗 Copy link</button></div>
    </div>`;
    document.body.appendChild(ov); document.body.style.overflow="hidden";
    const close=()=>{ ov.remove(); document.body.style.overflow=""; history.replaceState(null,"",location.pathname); };
    ov.addEventListener("click",e=>{ if(e.target===ov||e.target.closest(".bul-close")) close(); });
    document.addEventListener("keydown",function onEsc(e){ if(e.key==="Escape"){ close(); document.removeEventListener("keydown",onEsc);} });
    ov.querySelector(".bul-share").addEventListener("click",()=>{
      const url=location.origin+location.pathname+"?post="+encodeURIComponent(n.id);
      navigator.clipboard&&navigator.clipboard.writeText(url); const b=ov.querySelector(".bul-share"); b.textContent="✓ Copied"; setTimeout(()=>b.textContent="🔗 Copy link",1500);
    });
  }
  board.addEventListener("click",e=>{ const c=e.target.closest(".note-own"); if(!c) return;
    const n=ownPosts.find(x=>String(x.id)===c.dataset.post); if(n){ history.replaceState(null,"","?post="+encodeURIComponent(n.id)); openDetail(n);} });
  board.addEventListener("keydown",e=>{ if(e.key!=="Enter") return; const c=e.target.closest(".note-own"); if(!c) return;
    const n=ownPosts.find(x=>String(x.id)===c.dataset.post); if(n) openDetail(n); });

  function afterOwn(){
    loadWP();
    const wanted=new URLSearchParams(location.search).get("post");
    if(wanted){ const n=ownPosts.find(x=>String(x.id)===wanted); if(n) openDetail(n); }
  }
  if(window.db){
    db.from("bulletin").select("*").eq("published",true)
      .then(({data,error})=>{
        if(!error && data && data.length){
          const key=p=>String(p.starts_on || (p.created_at||"").slice(0,10) || "");
          data.sort((a,b)=>key(b).localeCompare(key(a)));
          data.forEach(p=>seen.add(norm(p.title))); // WP feed won't repeat an own notice
          ownPosts.push(...data); board.innerHTML=data.map(ownCard).join("");
        }
        afterOwn();
      }).catch(afterOwn);
  } else { afterOwn(); }
})();
