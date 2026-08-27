/* Seldovia Blog feed — paginated + searchable.
   The `posts` table now holds the full Seldovia.com archive (~2,800 posts,
   2011–present), so the blog page pages through the database newest-first
   instead of rendering everything at once, and offers a live search box that
   queries every post server-side. Falls back to whatever app.js rendered
   (static archive) if the database can't be reached. */
(function(){
  const grid = document.querySelector("#gazetteGrid");
  if(!grid || !window.db) return;

  const PAGE = 24;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const strip = h => String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const fmtDB = d => { if(!d) return ""; const [y,m,day]=String(d).split("-"); return `${MON[+m-1]} ${+day}, ${y}`; };
  const fixUrl = u => u.replace(/^(https?:\/\/)+/i, m=>m.slice(m.toLowerCase().lastIndexOf("http")));
  const mdExcerpt = raw => esc(strip(raw)).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,txt,url)=>
    /^(https?:\/\/|mailto:|\/|#|[\w.-]+\.html)/i.test(url)?`<a href="${fixUrl(url)}" target="_blank" rel="noopener">${txt}</a>`:m);

  function card(it){
    const linkAttr = ` href="${esc(it.href)}"`;
    const media = it.img ? `<a class="post-media"${linkAttr}><img class="post-photo" src="${esc(it.img)}" alt="${esc(it.title)}" loading="lazy" onerror="this.closest('.post-media').style.display='none'"></a>` : "";
    const body = mdExcerpt(it.excerpt);
    return `<article class="post">${media}<div class="post-body"><span class="kicker">${esc(it.cat||"Blog")}</span>`
      + `<h4><a${linkAttr}>${esc(it.title)}</a></h4>`
      + `<div class="post-meta"><span>${esc(it.date)}</span></div>`
      + `<div class="post-text clamp">${body}</div>`
      + `<a class="show-more"${linkAttr}>Read more →</a></div></article>`;
  }
  const item = p => ({ cat:p.category||"Blog", title:p.title, date:fmtDB(p.post_date),
    img:p.image_url, excerpt:p.body||p.excerpt||"", href:"post.html?id="+p.id });

  // --- build search box + "load more" around the grid ---
  const section = grid.closest("section") || grid.parentElement;
  const tools = document.createElement("div");
  tools.className = "blog-tools";
  tools.innerHTML = `<input id="blogSearch" type="search" placeholder="Search the Seldovia archive…" autocomplete="off" aria-label="Search posts">`
    + `<span id="blogCount" class="blog-count" aria-live="polite"></span>`;
  section.insertBefore(tools, grid);
  const moreWrap = document.createElement("div");
  moreWrap.className = "blog-more";
  moreWrap.innerHTML = `<button id="blogMore" class="btn btn-ghost" type="button" hidden>Load more posts</button>`;
  section.appendChild(moreWrap);
  const searchEl = tools.querySelector("#blogSearch");
  const countEl  = tools.querySelector("#blogCount");
  const moreBtn  = moreWrap.querySelector("#blogMore");

  let offset = 0, total = 0, loading = false, done = false, query = "", token = 0;

  async function load(reset){
    if(loading) return; loading = true;
    if(reset){ done = false; }
    if(done){ loading = false; return; }
    const myToken = reset ? ++token : token;
    const start = reset ? 0 : offset;

    let q = db.from("posts").select("*", { count: "exact" }).eq("published", true);
    if(query){ const like = "%" + query.replace(/[%,()]/g, " ") + "%"; q = q.or(`title.ilike.${like},body.ilike.${like}`); }
    q = q.order("post_date", { ascending: false }).range(start, start + PAGE - 1);

    let res; try { res = await q; } catch { loading = false; return; }
    loading = false;
    if(myToken !== token) return;              // a newer search superseded this one
    if(res.error){ moreBtn.hidden = true; return; }

    const data = res.data || [];
    total = res.count ?? total;
    if(reset){ offset = 0; grid.innerHTML = ""; } // take over from the static fallback
    grid.insertAdjacentHTML("beforeend", data.map(p => card(item(p))).join(""));
    offset += data.length;
    done = offset >= total || !data.length;
    moreBtn.hidden = done;
    countEl.textContent = total
      ? `${total.toLocaleString()} ${total===1?"post":"posts"}${query?` matching “${query}”`:""}`
      : (query ? `No posts match “${query}”` : "");
  }

  moreBtn.addEventListener("click", () => load(false));
  let debounce;
  searchEl.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { query = searchEl.value.trim(); load(true); }, 300);
  });

  load(true);
})();
