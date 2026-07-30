/* Public bulletin board — loads notices from Supabase and ADDS them to the top
   of the built-in notices (rendered by app.js). Nothing already on the board is
   removed. A notice with a link becomes a clickable panel (Jenny: panels should
   link to the original flyer). */
(function(){
  const board=document.querySelector("#board");
  if(!board || !window.db) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmt=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MON[+m-1]} ${+day}, ${y}`; };

  db.from("bulletin").select("*").eq("published",true).order("created_at",{ascending:false})
    .then(({data,error})=>{
      if(error || !data || !data.length) return; // built-in notices stay
      const html=data.map(n=>{
        const inner=`<span class="n-cat">${esc(n.category||"Notice")}</span>
          <h4>${esc(n.title)}</h4>
          ${n.body?`<p>${esc(n.body)}</p>`:""}
          <div class="n-foot"><span>${esc(n.posted_by||"")}</span><span>${n.starts_on?esc(fmt(n.starts_on)):""}</span></div>`;
        return n.link
          ? `<a class="note note-link" href="${esc(n.link)}" target="_blank" rel="noopener">${inner}<span class="n-open">Open flyer →</span></a>`
          : `<article class="note">${inner}</article>`;
      }).join("");
      board.insertAdjacentHTML("afterbegin", html); // add to top, keep the rest
    })
    .catch(()=>{});
})();
