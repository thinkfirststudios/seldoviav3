/* Home "What's on today" widget — Jenny wanted the daily schedule on the home page.
   Pulls the next several days of events from the community Google Calendar (same key/id
   as the calendar page). Until the API key is set, or if it fails, it shows a tidy
   link to the full calendar rather than anything broken. */
(function(){
  const box=document.querySelector("#todaySchedule");
  if(!box) return;
  const KEY=window.GCAL_KEY, CID=window.GCAL_ID;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MON3=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const pad=n=>String(n).padStart(2,"0");
  const fmt12=t=>{ if(!t) return "All day"; let[h,mi]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; h=h%12||12; return `${h}:${pad(mi)} ${ap}`; };
  const calLink=`<a class="ts-all" href="calendar.html">Full community calendar →</a>`;

  const shell=inner=>`<div class="today-sched">
      <div class="ts-head"><span class="eyebrow">Around Town</span><h3>What’s on this week</h3></div>
      ${inner}</div>`;
  const fallback=msg=>{ box.innerHTML=shell(`<p class="ts-empty">${esc(msg)}</p>${calLink}`); };

  if(!KEY || KEY.indexOf("PASTE")===0){ fallback("Meetings, markets, music and more — see the community calendar."); return; }

  const now=new Date();
  const timeMin=new Date(now.getFullYear(),now.getMonth(),now.getDate()).toISOString();
  const timeMax=new Date(now.getFullYear(),now.getMonth(),now.getDate()+7,23,59,59).toISOString();
  const url=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CID)}/events`
    +`?key=${encodeURIComponent(KEY)}&singleEvents=true&orderBy=startTime&maxResults=20`
    +`&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`;

  fetch(url).then(r=>r.ok?r.json():Promise.reject()).then(data=>{
    const items=(data.items||[]).filter(it=>it.status!=="cancelled");
    if(!items.length){ fallback("Nothing scheduled in the next few days — check the full calendar."); return; }
    const rows=items.slice(0,6).map(it=>{
      const s=it.start||{}, allDay=!s.dateTime, dt=new Date(s.dateTime||s.date);
      const day=`${DOW[dt.getDay()]} ${MON3[dt.getMonth()]} ${dt.getDate()}`;
      const time=allDay?"All day":fmt12(`${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
      return `<li class="ts-item"><span class="ts-when"><b>${esc(day)}</b><small>${esc(time)}</small></span>
        <span class="ts-title">${esc(it.summary||"Community event")}</span></li>`;
    }).join("");
    box.innerHTML=shell(`<ul class="ts-list">${rows}</ul>${calLink}`);
  }).catch(()=>fallback("See the community calendar for what’s happening around town."));
})();
