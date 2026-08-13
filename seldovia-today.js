/* "Seldovia Today" bar — live Alaska time + temperature (Open-Meteo) + today's
   high & low tides (NOAA station 9455500, in Seldovia) + ferry. Also renders a
   full ferry-schedule widget into #ferryWidget when present (home page).
   All client-side, no API keys, all times in Alaska time. */
(function(){
  const el=document.querySelector("#seldoviaToday");
  const ferryBox=document.querySelector("#ferryWidget");
  if(!el && !ferryBox) return;

  const LAT=59.4386, LON=-151.7133, STATION="9455500";
  const FERRY_URL="https://seldoviabayferry.com/ferry-schedule/";
  // Summer 2026 — Kachemak Voyager. Update seasonally. Sailing days Thu–Mon.
  const FERRY={ days:[0,1,4,5,6], seldovia:["9:00 AM","4:30 PM"], homer:["11:00 AM","6:30 PM"],
    note:"Thu–Mon", price:"$38 one-way", dur:"~45 min", vessel:"Kachemak Voyager" };

  const akParts=()=>{
    const f=new Intl.DateTimeFormat("en-US",{timeZone:"America/Anchorage",weekday:"short",
      year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
    const p={}; f.formatToParts(new Date()).forEach(x=>p[x.type]=x.value);
    const wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[p.weekday];
    return {y:+p.year,m:+p.month,d:+p.day,hh:+(p.hour==="24"?0:p.hour),mm:+p.minute,wd};
  };
  const to12=hm=>{ const [H,Mi]=hm.split(":").map(Number); const ap=H>=12?"PM":"AM"; return `${((H+11)%12)+1}:${String(Mi).padStart(2,"0")} ${ap}`; };
  const sailingToday=()=>FERRY.days.includes(akParts().wd);
  const fmtAK=dt=>new Intl.DateTimeFormat("en-US",{timeZone:"America/Anchorage",hour:"numeric",minute:"2-digit",hour12:true}).format(dt);

  /* Sunrise/sunset (local astronomical calc — no API). Returns Date objects (UTC instants). */
  function sunTimes(date,lat,lng){
    const rad=Math.PI/180, dayMs=86400000, J1970=2440588, J2000=2451545;
    const toJulian=d=>d.valueOf()/dayMs-0.5+J1970, fromJulian=j=>new Date((j+0.5-J1970)*dayMs);
    const toDays=d=>toJulian(d)-J2000, e=rad*23.4397;
    const Man=d=>rad*(357.5291+0.98560028*d);
    const Lec=m=>m+rad*(1.9148*Math.sin(m)+0.02*Math.sin(2*m)+0.0003*Math.sin(3*m))+rad*102.9372+Math.PI;
    const dec=l=>Math.asin(Math.sin(e)*Math.sin(l));
    const cyc=(d,lw)=>Math.round(d-0.0009-lw/(2*Math.PI));
    const appr=(Ht,lw,n)=>0.0009+(Ht+lw)/(2*Math.PI)+n;
    const stJ=(ds,m,l)=>J2000+ds+0.0053*Math.sin(m)-0.0069*Math.sin(2*l);
    const ha=(h,phi,d)=>Math.acos((Math.sin(h)-Math.sin(phi)*Math.sin(d))/(Math.cos(phi)*Math.cos(d)));
    const lw=rad*-lng, phi=rad*lat, d=toDays(date), n=cyc(d,lw), ds=appr(0,lw,n);
    const m=Man(ds), l=Lec(m), de=dec(l), Jnoon=stJ(ds,m,l), w=ha(rad*-0.833,phi,de);
    if(isNaN(w)) return null;
    const Jset=stJ(appr(w,lw,n),m,l), Jrise=Jnoon-(Jset-Jnoon);
    return {sunrise:fromJulian(Jrise), sunset:fromJulian(Jset)};
  }

  /* ---------- The bar ---------- */
  if(el){
    const item=(id,icon,label,value)=>`<div class="today-item" id="${id}"><span class="ti-ico">${icon}</span><span class="ti-body"><span class="ti-label">${label}</span><span class="ti-value">${value}</span></span></div>`;
    // Daylight (sunrise/sunset + hours) — replaces the ferry slot (Jenny: keep transport modes even).
    let dayVal="…";
    const st=sunTimes(new Date(), LAT, LON);
    if(st){ const mins=Math.max(0,Math.round((st.sunset-st.sunrise)/60000)); dayVal=`↑ ${fmtAK(st.sunrise)} · ↓ ${fmtAK(st.sunset)} <span class="ti-sub">${Math.floor(mins/60)}h ${mins%60}m</span>`; }
    el.innerHTML=`<div class="today-inner">
      <span class="today-title">Seldovia&nbsp;Today</span>
      ${item("ti-time","🕐","Alaska time","…")}
      ${item("ti-temp","🌡️","Right now","…")}
      ${item("ti-tide","🌊","Tides today","…")}
      ${item("ti-sun","🌅","Daylight",dayVal)}
    </div>`;

    // Live clock
    const tick=()=>{ const box=el.querySelector("#ti-time .ti-value"); if(box)
      box.textContent=new Intl.DateTimeFormat("en-US",{timeZone:"America/Anchorage",hour:"numeric",minute:"2-digit",hour12:true}).format(new Date())+" AKT"; };
    tick(); setInterval(tick, 30000);

    // Weather
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FAnchorage`)
      .then(r=>r.json()).then(j=>{
        const WMO={0:["Clear","☀️"],1:["Mainly clear","🌤️"],2:["Partly cloudy","⛅"],3:["Overcast","☁️"],45:["Fog","🌫️"],48:["Fog","🌫️"],51:["Drizzle","🌦️"],53:["Drizzle","🌦️"],55:["Drizzle","🌦️"],61:["Light rain","🌧️"],63:["Rain","🌧️"],65:["Heavy rain","🌧️"],66:["Freezing rain","🌧️"],67:["Freezing rain","🌧️"],71:["Light snow","🌨️"],73:["Snow","🌨️"],75:["Heavy snow","❄️"],77:["Snow","🌨️"],80:["Showers","🌦️"],81:["Showers","🌧️"],82:["Heavy showers","🌧️"],85:["Snow showers","🌨️"],86:["Snow showers","🌨️"],95:["Thunderstorm","⛈️"],96:["Thunderstorm","⛈️"],99:["Thunderstorm","⛈️"]};
        const t=Math.round(j.current.temperature_2m); const [desc,icon]=WMO[j.current.weather_code]||["","🌡️"];
        const box=el.querySelector("#ti-temp");
        box.querySelector(".ti-ico").textContent=icon;
        box.querySelector(".ti-value").innerHTML=`${t}°F <span class="ti-sub">${desc}</span>`;
      }).catch(()=>{ const b=el.querySelector("#ti-temp"); if(b) b.remove(); });

    // Tides — ALL of today's highs & lows (Jenny: both highs and both lows)
    const ak=akParts();
    const ymd=`${ak.y}${String(ak.m).padStart(2,"0")}${String(ak.d).padStart(2,"0")}`;
    const todayStr=`${ak.y}-${String(ak.m).padStart(2,"0")}-${String(ak.d).padStart(2,"0")}`;
    fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=seldovia_com&datum=MLLW&station=${STATION}&time_zone=lst_ldt&units=english&interval=hilo&format=json&begin_date=${ymd}&range=48`)
      .then(r=>r.json()).then(j=>{
        const today=(j.predictions||[]).filter(p=>String(p.t).startsWith(todayStr));
        const box=el.querySelector("#ti-tide");
        if(!today.length){ box.remove(); return; }
        box.querySelector(".ti-value").innerHTML=today.map(p=>{
          const tm=p.t.split(" ")[1]; const ar=p.type==="H"?"▲":"▼";
          return `<b>${ar} ${to12(tm)}</b> <span class="ti-sub">${Math.round(+p.v*10)/10} ft</span>`;
        }).join(" · ");
      }).catch(()=>{ const b=el.querySelector("#ti-tide"); if(b) b.remove(); });
  }

  /* ---------- Home-page ferry widget ---------- */
  if(ferryBox){
    const running=sailingToday();
    ferryBox.innerHTML=`
      <div class="ferry-card">
        <div class="fw-head">
          <span class="fw-ico">⛴️</span>
          <div><span class="eyebrow">Getting here</span><h3>Today's Ferry — ${FERRY.vessel}</h3></div>
          <span class="fw-status ${running?"is-on":"is-off"}">${running?"Sailing today":"No sailings today"}</span>
        </div>
        <div class="fw-routes">
          <div class="fw-route"><h4>Seldovia → Homer</h4><p>${FERRY.seldovia.join(" · ")}</p></div>
          <div class="fw-route"><h4>Homer → Seldovia</h4><p>${FERRY.homer.join(" · ")}</p></div>
        </div>
        <p class="fw-note">${FERRY.price} · ${FERRY.dur} · Runs ${FERRY.note}. Buy tickets on board — no reservation needed. <a href="${FERRY_URL}" target="_blank" rel="noopener">Full schedule &amp; info →</a></p>
      </div>`;
  }
})();
