/* Community calendar — pulls REAL events from the Seldovia Google Calendar (API v3) and
   renders them in the site's own agenda + month-grid UI. If no API key is set, or the
   fetch fails, it reveals the Google embed fallback (still the real calendar).
   Config (key + calendar id) lives in db.js: window.GCAL_KEY / window.GCAL_ID. */
(function(){
  const scroll=document.querySelector("#agendaScroll");
  if(!scroll) return;
  const KEY=window.GCAL_KEY, CID=window.GCAL_ID;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const MON3=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const pad=n=>String(n).padStart(2,"0");

  function fallback(){
    const fb=document.querySelector("#calFallback");
    ["#agenda","#monthgrid",".cal-toolbar"].forEach(sel=>{const el=document.querySelector(sel); if(el) el.style.display="none";});
    if(fb) fb.hidden=false;
  }
  if(!KEY || KEY.indexOf("PASTE")===0){ fallback(); return; } // key not set yet → embed

  const now=new Date();
  const timeMin=new Date(now.getFullYear(),now.getMonth(),1).toISOString();
  const timeMax=new Date(now.getFullYear(),now.getMonth()+6,0,23,59,59).toISOString();
  const url=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CID)}/events`
    +`?key=${encodeURIComponent(KEY)}&singleEvents=true&orderBy=startTime&maxResults=250`
    +`&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`;

  const fmt12=t=>{ if(!t) return "All day"; let[h,mi]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; h=h%12||12; return `${h}:${pad(mi)} ${ap}`; };
  const fmtDay=d=>{ const [y,m,day]=d.split("-").map(Number); const dt=new Date(y,m-1,day); return `${DOW[dt.getDay()]}, ${MON3[m-1]} ${day}`; };

  fetch(url).then(r=>r.ok?r.json():Promise.reject(r.status)).then(data=>{
    const items=(data.items||[]).filter(it=>it.status!=="cancelled");
    if(!items.length){ fallback(); return; }
    const evs=items.map(it=>{
      const s=it.start||{}, allDay=!s.dateTime, startISO=s.dateTime||s.date;
      const dt=new Date(startISO);
      return { d:`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`,
        t: allDay?"":`${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
        allDay, title:it.summary||"(untitled event)", where:it.location||"", link:it.htmlLink||"", key:startISO };
    }).sort((a,b)=>a.key.localeCompare(b.key));

    // AGENDA — grouped by day
    const byDay={}; evs.forEach(e=>{(byDay[e.d]=byDay[e.d]||[]).push(e);});
    scroll.innerHTML=Object.keys(byDay).sort().map(day=>`<div class="agenda-day">${esc(fmtDay(day))}</div>
      ${byDay[day].map(e=>`<div class="event"><div class="ev-time">${esc(fmt12(e.t))}</div>
        <div><div class="ev-title">${esc(e.title)}</div>${e.where?`<div class="ev-where">${esc(e.where)}</div>`:""}</div>
        <div class="col-right">${e.link?`<a class="ev-cat" href="${esc(e.link)}" target="_blank" rel="noopener" style="text-decoration:none">Details</a>`:""}</div></div>`).join("")}`).join("");

    // MONTH GRID — current month
    const y=now.getFullYear(), m=now.getMonth();
    const first=new Date(y,m,1).getDay(), dim=new Date(y,m+1,0).getDate(), prevDim=new Date(y,m,0).getDate();
    const evMap={}; evs.forEach(e=>{ const [ey,em,ed]=e.d.split("-").map(Number); if(ey===y&&em===m+1)(evMap[ed]=evMap[ed]||[]).push(e); });
    let cells="";
    for(let i=0;i<first;i++) cells+=`<div class="mg-cell out"><span class="d">${prevDim-first+i+1}</span></div>`;
    for(let d=1;d<=dim;d++){ const list=evMap[d]||[];
      const pips=list.slice(0,2).map(e=>`<span class="pip">${esc((e.allDay?"":fmt12(e.t)+" ")+e.title)}</span>`).join("");
      const more=list.length>2?`<span class="pip">+${list.length-2} more</span>`:"";
      cells+=`<div class="mg-cell ${list.length?'has':''}"><span class="d">${d}</span>${pips}${more}</div>`; }
    const trail=(7-((first+dim)%7))%7; for(let i=1;i<=trail;i++) cells+=`<div class="mg-cell out"><span class="d">${i}</span></div>`;
    document.querySelector("#mgBody").innerHTML=cells;

    // view toggle
    const hint=document.querySelector("#calHint");
    const setView=v=>{ const ag=v==="agenda";
      document.querySelector("#viewAgenda").setAttribute("aria-pressed",ag);
      document.querySelector("#viewMonth").setAttribute("aria-pressed",!ag);
      document.querySelector("#agenda").classList.toggle("hide",!ag);
      document.querySelector("#monthgrid").classList.toggle("show",!ag);
      if(hint) hint.textContent = ag ? "Upcoming events in Seldovia" : `${MON[m]} ${y}`; };
    document.querySelector("#viewAgenda").addEventListener("click",()=>setView("agenda"));
    document.querySelector("#viewMonth").addEventListener("click",()=>setView("month"));
  }).catch(()=>fallback());
})();
