/* Public bulletin board — pulls community notices LIVE from Seldovia.com's WordPress
   (Bulletin Board 1247 + Community 1140 + Events & Community 2788 + In the News... 560 +
   News 2247), newest first, each panel linking to the original post. A "Load more" button
   pages through the full archive. Falls back to Supabase notices if WordPress is unreachable. */
(function(){
  const board=document.querySelector("#board");
  if(!board) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const decode=s=>{ const t=document.createElement("textarea"); t.innerHTML=String(s); return t.value; };
  const strip=h=>decode(String(h).replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();
  const fmtISO=d=>{ const dt=new Date(d); return isNaN(dt)?"":`${MON[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
  const fmtDB=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MON[+m-1]} ${+day}, ${y}`; };

  const BASE="https://www.seldovia.com/wp-json/wp/v2/posts?categories=1247,1140,2788,560,2247&per_page=30&orderby=date&order=desc&_fields=id,date,title,excerpt,link";
  let page=0, totalPages=1, loading=false;

  function card(p){
    const title=strip(p.title && p.title.rendered || "");
    let ex=strip(p.excerpt && p.excerpt.rendered || "");
    if(ex.length>210) ex=ex.slice(0,210).replace(/\s+\S*$/,"")+"…";
    return `<a class="note note-link" href="${esc(p.link)}" target="_blank" rel="noopener">
      <span class="n-cat">Bulletin</span>
      <h4>${esc(title)}</h4>
      ${ex?`<p>${esc(ex)}</p>`:""}
      <div class="n-foot"><span>Seldovia.com</span><span>${esc(fmtISO(p.date))}</span></div>
      <span class="n-open">Read more →</span></a>`;
  }

  // "Load more" button lives just under the board
  const moreWrap=document.createElement("div");
  moreWrap.className="center-link"; moreWrap.style.marginTop="1.6rem"; moreWrap.style.display="none";
  const btn=document.createElement("button");
  btn.type="button"; btn.className="btn btn-ghost"; btn.textContent="Load more";
  moreWrap.appendChild(btn);
  board.insertAdjacentElement("afterend", moreWrap);

  function loadMore(){
    if(loading || page>=totalPages) return;
    loading=true; page++; btn.textContent="Loading…";
    fetch(BASE+"&page="+page)
      .then(r=>{ totalPages=parseInt(r.headers.get("x-wp-totalpages")||totalPages,10)||1; if(!r.ok) throw 0; return r.json(); })
      .then(posts=>{
        if(Array.isArray(posts) && posts.length) board.insertAdjacentHTML("beforeend", posts.map(card).join(""));
        loading=false; btn.textContent="Load more";
        moreWrap.style.display = page>=totalPages ? "none" : "";
      })
      .catch(()=>{ loading=false; page--; if(page===0) fallbackSupabase(); else { btn.textContent="Load more"; } });
  }
  btn.addEventListener("click", loadMore);

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

  loadMore(); // first page
})();
