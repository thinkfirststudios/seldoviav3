/* "This Month's Photo Contest" box on the Photos page (Jenny/Qwynny, Oct 8). Qwynny edits it in the admin
   (Photo Contest tab -> settings.photo_contest). The same form link also drives the "Send it our way!" link. */
(function(){
  const box=document.getElementById("photoContest"); if(!box || !window.db) return;
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  db.from("settings").select("value").eq("key","photo_contest").maybeSingle().then(({data})=>{
    let c=null; try{ c=data&&data.value?JSON.parse(data.value):null; }catch(e){}
    if(!c) return;
    if(c.link) document.querySelectorAll(".photo-submit-link").forEach(a=>a.href=c.link);
    if(c.show===false) return;
    const para=t=>esc(t).split(/\n{2,}/).map(p=>`<p>${p.replace(/\n/g,"<br>")}</p>`).join("");
    box.innerHTML=`<div class="contest-card">
        <span class="eyebrow">Photo Contest</span>
        <h2>${esc(c.title||"This Month's Photo Contest")}</h2>
        ${c.deadline?`<p class="contest-deadline">📅 Enter by <b>${esc(c.deadline)}</b></p>`:""}
        ${c.prize?`<p class="contest-prize">🎉 ${esc(c.prize)}</p>`:""}
        ${c.blurb?`<div class="contest-blurb">${para(c.blurb)}</div>`:""}
        ${c.link?`<a class="btn btn-primary" href="${esc(c.link)}" target="_blank" rel="noopener">Enter the contest</a>`:""}
        <p class="contest-rules"><a href="terms.html">Contest rules</a></p></div>`;
    box.hidden=false;
  }).catch(()=>{});
})();
