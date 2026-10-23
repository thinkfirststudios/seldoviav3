/* Home: "Recent News & Stories" under Seldovia Today (Jenny Oct 20/21) — the newest 5 post titles + a link to the page.
   Also puts "Enjoying Seldovia.com? Support the site" under the calendar column, where there's more room. */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const sup=document.getElementById("homeSupport");
  if(sup && window.SUPPORT_URL) sup.innerHTML=`<a class="today-support" href="${window.SUPPORT_URL}" target="_blank" rel="noopener">☕ Enjoying Seldovia.com? <b>Support the site</b></a>`;
  const box=document.getElementById("homeNews"); if(!box || !window.db) return;
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Anchorage"}).format(new Date());
  db.from("posts").select("id,title,post_date").eq("published",true).lte("post_date",today)
    .order("post_date",{ascending:false}).limit(5).then(({data})=>{
      if(!data || !data.length) return;
      box.innerHTML=`<div class="home-news"><h3>Recent News &amp; Stories</h3>
        <ul>${data.map(p=>`<li><a href="post.html?id=${encodeURIComponent(p.id)}">${esc(p.title)}</a></li>`).join("")}</ul>
        <a class="ts-all" href="gazette.html">Read Recent News &amp; Stories →</a></div>`;
    }).catch(()=>{});
})();
