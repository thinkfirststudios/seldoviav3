/* Public bulletin board — pulls the recent community notices LIVE from the Seldovia.com
   WordPress "Bulletin Board" category (REST API, category 1247, CORS-enabled). Each panel
   links to the original post on Seldovia.com, and the board auto-updates whenever Jenny
   posts there. If the WordPress feed is unreachable, it falls back to the Supabase notices. */
(function(){
  const board=document.querySelector("#board");
  if(!board) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const decode=s=>{ const t=document.createElement("textarea"); t.innerHTML=String(s); return t.value; };
  const strip=h=>decode(String(h).replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();
  const fmtISO=d=>{ const dt=new Date(d); return isNaN(dt)?"":`${MON[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
  const fmtDB=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MON[+m-1]} ${+day}, ${y}`; };

  // Community feed = Bulletin Board (1247) + Community (1140) + Events & Community (2788)
  // + In the News... (560) + News (2247). Posts in ANY of these, newest first.
  const WP="https://www.seldovia.com/wp-json/wp/v2/posts?categories=1247,1140,2788,560,2247&per_page=50&_fields=id,date,title,excerpt,link";

  function renderWP(posts){
    board.innerHTML = posts.map(p=>{
      const title=strip(p.title && p.title.rendered || "");
      let ex=strip(p.excerpt && p.excerpt.rendered || "");
      if(ex.length>210) ex=ex.slice(0,210).replace(/\s+\S*$/,"")+"…";
      return `<a class="note note-link" href="${esc(p.link)}" target="_blank" rel="noopener">
        <span class="n-cat">Bulletin</span>
        <h4>${esc(title)}</h4>
        ${ex?`<p>${esc(ex)}</p>`:""}
        <div class="n-foot"><span>Seldovia.com</span><span>${esc(fmtISO(p.date))}</span></div>
        <span class="n-open">Read more →</span></a>`;
    }).join("");
  }

  function fallbackSupabase(){
    if(!window.db) return;
    db.from("bulletin").select("*").eq("published",true).order("created_at",{ascending:false})
      .then(({data,error})=>{
        if(error || !data || !data.length) return;
        board.innerHTML = data.map(n=>{
          const inner=`<span class="n-cat">${esc(n.category||"Notice")}</span>
            <h4>${esc(n.title)}</h4>
            ${n.body?`<p>${esc(n.body)}</p>`:""}
            <div class="n-foot"><span>${esc(n.posted_by||"")}</span><span>${n.starts_on?esc(fmtDB(n.starts_on)):""}</span></div>`;
          return n.link
            ? `<a class="note note-link" href="${esc(n.link)}" target="_blank" rel="noopener">${inner}<span class="n-open">Open flyer →</span></a>`
            : `<article class="note">${inner}</article>`;
        }).join("");
      }).catch(()=>{});
  }

  fetch(WP).then(r=>r.ok?r.json():Promise.reject()).then(posts=>{
    if(Array.isArray(posts) && posts.length) renderWP(posts);
    else fallbackSupabase();
  }).catch(fallbackSupabase);
})();
