/* "Seldovia Today" bar — live temperature (Open-Meteo) + next tide (NOAA station
   9455500, in Seldovia) + today's ferry (season schedule + booking link).
   All times computed in Alaska time so it's correct for any visitor. No API keys. */
(function(){
  const el=document.querySelector("#seldoviaToday");
  if(!el) return;
  const LAT=59.4386, LON=-151.7133, STATION="9455500";
  const FERRY_URL="https://seldoviabayferry.com/ferry-schedule/";
  // Summer 2026 — Kachemak Voyager. Update seasonally. Sailing days Thu–Mon.
  const FERRY={ days:[0,1,4,5,6], depart:["9:00 AM","4:30 PM"], note:"Thu–Mon" }; // 0=Sun … 6=Sat

  // --- Alaska "now" parts ---
  const akParts=(()=>{
    const f=new Intl.DateTimeFormat("en-US",{timeZone:"America/Anchorage",weekday:"short",
      year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
    const p={}; f.formatToParts(new Date()).forEach(x=>p[x.type]=x.value);
    const wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[p.weekday];
    return {y:+p.year,m:+p.month,d:+p.day,hh:+(p.hour==="24"?0:p.hour),mm:+p.minute,wd};
  })();
  const nowMin=akParts.hh*60+akParts.mm;
  const ymd=`${akParts.y}${String(akParts.m).padStart(2,"0")}${String(akParts.d).padStart(2,"0")}`;

  const WMO={0:["Clear","☀️"],1:["Mainly clear","🌤️"],2:["Partly cloudy","⛅"],3:["Overcast","☁️"],
    45:["Fog","🌫️"],48:["Fog","🌫️"],51:["Drizzle","🌦️"],53:["Drizzle","🌦️"],55:["Drizzle","🌦️"],
    61:["Light rain","🌧️"],63:["Rain","🌧️"],65:["Heavy rain","🌧️"],66:["Freezing rain","🌧️"],67:["Freezing rain","🌧️"],
    71:["Light snow","🌨️"],73:["Snow","🌨️"],75:["Heavy snow","❄️"],77:["Snow","🌨️"],
    80:["Showers","🌦️"],81:["Showers","🌧️"],82:["Heavy showers","🌧️"],85:["Snow showers","🌨️"],86:["Snow showers","🌨️"],
    95:["Thunderstorm","⛈️"],96:["Thunderstorm","⛈️"],99:["Thunderstorm","⛈️"]};

  const item=(icon,label,value)=>`<div class="today-item"><span class="ti-ico">${icon}</span><span class="ti-body"><span class="ti-label">${label}</span><span class="ti-value">${value}</span></span></div>`;

  // Ferry (synchronous)
  let ferryHtml;
  if(FERRY.days.includes(akParts.wd)){
    ferryHtml=item("⛴️","Ferry today",`${FERRY.depart.join(" · ")} <a href="${FERRY_URL}" target="_blank" rel="noopener">schedule →</a>`);
  }else{
    ferryHtml=item("⛴️","Ferry",`Runs ${FERRY.note} · <a href="${FERRY_URL}" target="_blank" rel="noopener">schedule →</a>`);
  }

  el.innerHTML=`<div class="today-inner">
    <span class="today-title">Seldovia&nbsp;Today</span>
    <div class="today-item" id="ti-temp"><span class="ti-ico">🌡️</span><span class="ti-body"><span class="ti-label">Right now</span><span class="ti-value">…</span></span></div>
    <div class="today-item" id="ti-tide"><span class="ti-ico">🌊</span><span class="ti-body"><span class="ti-label">Next tide</span><span class="ti-value">…</span></span></div>
    ${ferryHtml}
  </div>`;

  // Weather
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FAnchorage`)
    .then(r=>r.json()).then(j=>{
      const t=Math.round(j.current.temperature_2m);
      const [desc,icon]=WMO[j.current.weather_code]||["",""];
      const box=el.querySelector("#ti-temp");
      box.querySelector(".ti-ico").textContent=icon||"🌡️";
      box.querySelector(".ti-value").innerHTML=`${t}°F <span class="ti-sub">${desc}</span>`;
    }).catch(()=>{ el.querySelector("#ti-temp").remove(); });

  // Tides — request ~36h so there's always a "next"
  fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=seldovia_com&datum=MLLW&station=${STATION}&time_zone=lst_ldt&units=english&interval=hilo&format=json&begin_date=${ymd}&range=36`)
    .then(r=>r.json()).then(j=>{
      const preds=(j.predictions||[]).map(p=>{
        const [d,tm]=p.t.split(" "); const [Y,M,D]=d.split("-").map(Number); const [h,mi]=tm.split(":").map(Number);
        return {abs:(Y*366+M*31+D)*1440 + h*60+mi, day:`${Y}${String(M).padStart(2,"0")}${String(D).padStart(2,"0")}`,
                min:h*60+mi, type:p.type, v:Math.round(+p.v*10)/10, hm:tm};
      });
      const nowAbs=(akParts.y*366+akParts.m*31+akParts.d)*1440 + nowMin;
      const next=preds.find(p=>p.abs>nowAbs);
      const box=el.querySelector("#ti-tide");
      if(!next){ box.remove(); return; }
      const [H,Mi]=next.hm.split(":").map(Number); const ap=H>=12?"PM":"AM"; const h12=((H+11)%12)+1;
      const kind=next.type==="H"?"High":"Low";
      box.querySelector(".ti-value").innerHTML=`${kind} ${h12}:${String(Mi).padStart(2,"0")} ${ap} <span class="ti-sub">${next.v} ft</span>`;
    }).catch(()=>{ el.querySelector("#ti-tide").remove(); });
})();
