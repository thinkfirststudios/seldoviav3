/* Photos page (Jenny Oct 8 + Oct 19):
   - "This Month's Photo Contest" box, edited by Qwynny in the admin (Photo Contest tab -> settings.photo_contest)
   - "Flier of the Month" beside the Photo of the Day; clicking it opens the site's own contest entry form
     (Contact page, "Enter the Monthly Photo Contest") — no Google sign-in. */
(function(){
  const box=document.getElementById("photoContest"); if(!box) return;
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ENTER="contact.html?topic=contest";
  const DEFAULT_FLIER="images/contest-flier.jpg?v=1";   // this month's flier from Jenny; the admin upload replaces it
  const placeFlier=(c)=>{
    if(c && c.show===false) return;
    const src=(c&&c.flier)||DEFAULT_FLIER;
    const put=()=>{ const cap=document.querySelector(".today-feature .today-cap"); if(!cap) return false;
      if(cap.querySelector(".pj-flier")) return true;
      cap.insertAdjacentHTML("beforeend",`<a class="pj-flier" href="${ENTER}" aria-label="Flier of the Month: enter this month's photo contest">
        <span class="eyebrow">Flier of the Month</span><img src="${esc(src)}" alt="This month's Seldovia.com photo contest flier" onerror="this.closest('.pj-flier').remove()">
        <span class="pj-flier-cta">Enter this month's photo contest →</span></a>`); return true; };
    if(!put()){ const app=document.getElementById("journalApp"); if(!app) return;
      const mo=new MutationObserver(()=>{ if(put()) mo.disconnect(); }); mo.observe(app,{childList:true,subtree:true}); setTimeout(()=>mo.disconnect(),20000); }
  };
  if(!window.db){ placeFlier(null); return; }
  db.from("settings").select("value").eq("key","photo_contest").maybeSingle().then(({data})=>{
    let c=null; try{ c=data&&data.value?JSON.parse(data.value):null; }catch(e){}
    placeFlier(c);
    if(!c || c.show===false) return;
    const para=t=>esc(t).split(/\n{2,}/).map(p=>`<p>${p.replace(/\n/g,"<br>")}</p>`).join("");
    box.innerHTML=`<div class="contest-card">
        <span class="eyebrow">Photo Contest</span>
        <h2>${esc(c.title||"This Month's Photo Contest")}</h2>
        ${c.deadline?`<p class="contest-deadline">📅 Enter by <b>${esc(c.deadline)}</b></p>`:""}
        ${c.prize?`<p class="contest-prize">🎉 ${esc(c.prize)}</p>`:""}
        ${c.blurb?`<div class="contest-blurb">${para(c.blurb)}</div>`:""}
        <a class="btn btn-primary" href="${ENTER}">Enter the contest</a>
        <p class="contest-rules"><a href="terms.html#contest">Contest rules</a></p></div>`;
    box.hidden=false;
  }).catch(()=>placeFlier(null));
})();
