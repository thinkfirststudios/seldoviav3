/* Merged Blog + News feed.
   Jenny asked to combine Blog and News into one page (blog layout, clickable
   thumbnails). This prepends her Supabase blog posts and news notices to the
   built-in archive (rendered by app.js into #gazetteGrid), styled as blog
   cards, deduped against the archive, newest first.
   Self-hosted only (no live seldovia.com feed) so it survives the domain flip;
   the full recent archive arrives via the content migration. */
(function(){
  const grid = document.querySelector("#gazetteGrid");
  if(!grid || !window.db) return;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const strip = h => String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const fmtDB = d => { if(!d) return ""; const [y,m,day]=String(d).split("-"); return `${MON[+m-1]} ${+day}, ${y}`; };
  const fmtISO = d => { const dt=new Date(d); return isNaN(dt)?"":`${MON[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
  const norm = s => String(s||"").trim().toLowerCase().replace(/\s+/g," ");
  const clip = (s,n) => { s=strip(s); return s.length>n ? s.slice(0,n).replace(/\s+\S*$/,"")+"…" : s; };

  // titles already in the built-in archive, so we never show one twice
  const seen = new Set([...grid.querySelectorAll(".post h4")].map(h => norm(h.textContent)));

  function card(it){
    const linkAttr = it.href ? ` href="${esc(it.href)}"${it.ext?' target="_blank" rel="noopener"':''}` : "";
    const media = (it.img && it.href) ? `<a class="post-media"${linkAttr}><img class="post-photo" src="${esc(it.img)}" alt="${esc(it.title)}" loading="lazy" onerror="this.closest('.post-media').style.display='none'"></a>`
                : it.img ? `<div class="post-media"><img class="post-photo" src="${esc(it.img)}" alt="${esc(it.title)}" loading="lazy" onerror="this.closest('.post-media').style.display='none'"></div>` : "";
    const title = it.href ? `<h4><a${linkAttr}>${esc(it.title)}</a></h4>` : `<h4>${esc(it.title)}</h4>`;
    const more = it.href ? `<a class="show-more"${linkAttr}>${esc(it.moreLabel||"Read more →")}</a>` : "";
    return `<article class="post">${media}<div class="post-body"><span class="kicker">${esc(it.cat||"Blog")}</span>${title}<div class="post-meta"><span>${esc(it.date)}</span></div><div class="post-text clamp">${esc(it.excerpt||"")}</div>${more}</div></article>`;
  }

  Promise.all([
    db.from("posts").select("*").eq("published",true).order("post_date",{ascending:false}).then(r=>r.data||[]).catch(()=>[]),
    db.from("bulletin").select("*").eq("published",true).then(r=>r.data||[]).catch(()=>[])
  ]).then(([posts,bul]) => {
    const items = [];
    posts.forEach(p => items.push({
      when: p.post_date || "", cat: p.category || "Blog", title: p.title,
      date: fmtDB(p.post_date), img: p.image_url, excerpt: clip(p.body || p.excerpt, 180)
    }));
    bul.forEach(n => { const when = n.starts_on || (n.created_at||"").slice(0,10);
      items.push({
        when, cat: n.category || "Notice", title: n.title,
        date: n.starts_on ? fmtDB(n.starts_on) : fmtISO(n.created_at),
        img: n.image_url, excerpt: clip(n.body, 180),
        href: n.event_url || "", ext: !!n.event_url, moreLabel: n.event_url ? "View event →" : ""
      });
    });
    // dedupe against the archive + each other, then newest first
    const fresh = [];
    items.forEach(it => { const k = norm(it.title); if(!it.title || seen.has(k)) return; seen.add(k); fresh.push(it); });
    if(!fresh.length) return;
    fresh.sort((a,b) => String(b.when).localeCompare(String(a.when)));
    grid.insertAdjacentHTML("afterbegin", fresh.map(card).join(""));
  }).catch(()=>{});
})();
