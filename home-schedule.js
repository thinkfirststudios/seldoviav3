/* Home "What's on this week" widget (Jenny #25) — pulls the next ~2 weeks of events
   from the community Tockify calendar (calname "seldovia", same calendar the Calendar
   page embeds). Tockify's API has no CORS header, so we read it through a public proxy
   and ALWAYS fall back to a tidy link if anything fails — never anything broken. */
(function(){
  const box=document.querySelector("#todaySchedule");
  if(!box) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const AKZ="America/Anchorage";
  const akDay=m=>new Intl.DateTimeFormat("en-US",{timeZone:AKZ,weekday:"short",month:"short",day:"numeric"}).format(new Date(m));
  const akTime=m=>new Intl.DateTimeFormat("en-US",{timeZone:AKZ,hour:"numeric",minute:"2-digit"}).format(new Date(m));
  const calLink=`<a class="ts-all" href="calendar.html">Full community calendar →</a>`;
  const shell=inner=>`<div class="today-sched">
      <div class="ts-head"><span class="eyebrow">Around Town</span><h3>What’s on this week</h3></div>
      ${inner}</div>`;
  const fallback=msg=>{ box.innerHTML=shell(`<p class="ts-empty">${esc(msg)}</p>${calLink}`); };

  // Render a graceful default IMMEDIATELY so the column is never blank while the (sometimes
  // slow/hanging) proxy loads. Events replace it if/when they arrive.
  fallback("Meetings, markets, music and more — see the community calendar.");

  const now=Date.now(), end=now+14*24*60*60*1000;
  const tock=`https://tockify.com/api/ngevent?max=20&longForm=false&calname=seldovia&startms=${now}&endms=${end}`;
  const url=`https://api.allorigins.win/raw?url=${encodeURIComponent(tock)}`;

  // The proxy can hang without ever erroring, so time-box it — otherwise the .catch never fires.
  const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),ms))]);
  withTimeout(fetch(url).then(r=>r.ok?r.json():Promise.reject()),6000).then(data=>{
    const items=(data.events||[])
      .filter(e=>e && e.when && e.when.start && e.when.start.millis)
      .sort((a,b)=>a.when.start.millis-b.when.start.millis);
    if(!items.length){ fallback("Nothing scheduled in the next couple weeks — see the full calendar."); return; }
    const rows=items.slice(0,6).map(e=>{
      const m=e.when.start.millis, allDay=e.when.allDay;
      const title=(e.content&&e.content.summary&&e.content.summary.text)||"Community event";
      return `<li class="ts-item"><span class="ts-when"><b>${esc(akDay(m))}</b><small>${esc(allDay?"All day":akTime(m))}</small></span>
        <span class="ts-title">${esc(title)}</span></li>`;
    }).join("");
    box.innerHTML=shell(`<ul class="ts-list">${rows}</ul>${calLink}`);
  }).catch(()=>{ /* default fallback already shown above */ });
})();
