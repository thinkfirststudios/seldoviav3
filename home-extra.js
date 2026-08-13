/* Home "of the day" widget. The admin picks which one shows and can EDIT the
   text (Supabase `settings`: home_extra = mode; facts / words / fundays = content).
   Built-in defaults live in extras-data.js. Marine weather is live (not editable).
   Defaults to the Alaska fact if the DB/setting isn't there yet. All client-side. */
(function(){
  const box=document.querySelector("#todayExtra");
  if(!box) return;
  const D=window.EXTRA_DEFAULTS||{facts:"",words:"",fundays:""};
  const LAT=59.4386, LON=-151.7133;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const lines=s=>String(s||"").split("\n").map(x=>x.trim()).filter(Boolean);
  const akDate=new Date().toLocaleDateString("en-CA",{timeZone:"America/Anchorage"}); // YYYY-MM-DD
  const [ay,am,ad]=akDate.split("-").map(Number);
  const doy=Math.floor((Date.UTC(ay,am-1,ad)-Date.UTC(ay,0,0))/86400000); // 1..366

  function card(icon,label,bodyHtml,link){
    return `<div class="extra-card">
      <span class="extra-ico" aria-hidden="true">${icon}</span>
      <div class="extra-main"><span class="eyebrow">${esc(label)}</span>
        <div class="extra-body">${bodyHtml}</div>
        ${link?`<div class="extra-link">${link}</div>`:""}</div></div>`;
  }
  function degToCompass(d){ const dirs=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]; return dirs[Math.round(d/22.5)%16]; }

  function render(mode, cfg){
    if(mode==="none"){ box.innerHTML=""; return; }
    if(mode==="word"){
      const arr=lines(cfg.words||D.words); if(!arr.length) return alaska(cfg);
      const item=arr[doy%arr.length]; const i=item.indexOf(" — ")>=0?item.indexOf(" — "):item.indexOf(" - ");
      const w=i>=0?item.slice(0,i):item, def=i>=0?item.slice(i+3):"";
      box.innerHTML=card("📖","Word of the day",`<p><b>${esc(w)}</b>${def?" — "+esc(def):""}</p>`);
      return;
    }
    if(mode==="funday"){
      const key=`${String(am).padStart(2,"0")}-${String(ad).padStart(2,"0")}`;
      const hit=lines(cfg.fundays||D.fundays).find(l=>l.slice(0,5)===key);
      const name=hit?hit.slice(5).trim():"";
      box.innerHTML=name ? card("🎉","Today is…",`<p>${esc(name)}!</p>`)
        : card("🎉","Fun day",`<p>Every day is a good day on Kachemak Bay.</p>`);
      return;
    }
    if(mode==="marine"){
      box.innerHTML=card("🌊","Marine weather",`<p>Checking the bay…</p>`);
      Promise.all([
        fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}&current=wave_height`).then(r=>r.json()).catch(()=>({})),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph&timezone=America%2FAnchorage`).then(r=>r.json()).catch(()=>({}))
      ]).then(([m,w])=>{
        const bits=[];
        const wave=m.current&&m.current.wave_height;
        if(wave!=null) bits.push(`Seas ~${Math.round(wave*3.28084*10)/10} ft`);
        if(w.current&&w.current.wind_speed_10m!=null) bits.push(`Wind ${Math.round(w.current.wind_speed_10m)} mph ${degToCompass(w.current.wind_direction_10m)}`);
        box.innerHTML=card("🌊","Marine weather",`<p>${bits.length?esc(bits.join(" · ")):"Conditions on Kachemak Bay"}</p>`,
          `<a href="https://marine.weather.gov/MapClick.php?zoneid=pkz741" target="_blank" rel="noopener">Full NWS marine forecast →</a>`);
      });
      return;
    }
    alaska(cfg);
  }
  function alaska(cfg){ const arr=lines(cfg.facts||D.facts); box.innerHTML=card("🧭","Alaska fact of the day",`<p>${esc(arr[doy%arr.length]||"")}</p>`); }

  // Read the admin's choice + any edited content; default to the Alaska fact.
  if(window.db){
    db.from("settings").select("key,value")
      .then(({data,error})=>{
        const cfg={}; if(!error && data) data.forEach(r=>cfg[r.key]=r.value);
        render(cfg.home_extra||"alaska_fact", cfg);
      }).catch(()=>render("alaska_fact",{}));
  } else { render("alaska_fact",{}); }
})();
