/* Find Me Map (Jenny Oct 10): every Explore place with a pin, plus a "Find me" button that uses the phone's GPS
   (only after the visitor allows it; the location never leaves their phone). Free: Leaflet + OpenStreetMap. */
(function(){
  const el=document.getElementById("findMap"); if(!el || !window.L) return;
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const COLORS={travel:"#2f6f9f",stay:"#8a4fb0",eat:"#d0632b",shop:"#c2185b",activities:"#2e8b57",gardens:"#5a9e2f",landmarks:"#8d6e3f",services:"#455a64",life:"#b8860b"};
  const tabName=k=>{ const t=(typeof PLACE_TABS!=="undefined"?PLACE_TABS:[]).find(x=>x[0]===k); return t?t[1]:""; };
  const map=L.map(el,{scrollWheelZoom:false}).setView(SELDOVIA_CENTER,15);
  if(window.ResizeObserver) new ResizeObserver(()=>map.invalidateSize()).observe(el);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
  map.on("focus",()=>map.scrollWheelZoom.enable()); map.on("blur",()=>map.scrollWheelZoom.disable());

  const layers={}, markers={}; let active="all", focusGroup=null;
  Promise.all([window.loadLiveSearch?loadLiveSearch():Promise.resolve(), loadPins()]).then(([,pins])=>{
    const places=(window.EXPLORE_LIVE||[]).filter(p=>pinPoints(pins[p.name]).length);
    const bounds={};                 // layer key -> [latlngs]
    places.forEach(p=>{ const q=pins[p.name], pts=pinPoints(q), kind=pinIconKind(p.name), multi=pts.length>1||Array.isArray(q.multi);
      markers[p.name]=[];
      pts.forEach((pt,i)=>{
        // Out of Town (Jenny Oct 21): pins far from Seldovia get their own button so they don't zoom the map out
        const key=(milesFromSeldovia(pt.lat,pt.lng)>OUT_OF_TOWN_MILES||p.key==="outoftown")?"outoftown":p.key, c=COLORS[p.key]||"#2c4a3a";
        const mk=kind ? L.marker([pt.lat,pt.lng],{icon:L.divIcon({className:"fm-icon",html:pinIconHtml(kind),iconSize:[26,26],iconAnchor:[13,13]})})
                      : L.circleMarker([pt.lat,pt.lng],{radius:9,color:"#fff",weight:2,fillColor:c,fillOpacity:.95});
        mk.bindPopup(`<div class="fm-pop"><b>${esc(p.shown)}${multi?` #${i+1}`:""}</b><br><span>${esc(p.label||tabName(p.key))}</span>
          <div class="fm-pop-links"><a href="explore.html?find=${encodeURIComponent(p.name)}">Check it out</a> ·
          <a href="https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}" target="_blank" rel="noopener">Directions ↗</a></div></div>`);
        (layers[key]=layers[key]||L.layerGroup()).addLayer(mk); (bounds[key]=bounds[key]||[]).push([pt.lat,pt.lng]); markers[p.name].push(mk); }); });
    // same order as the Explore tabs (Jenny Oct 17); Out of Town last, and hidden from "All" so Seldovia stays in view
    const order=(typeof PLACE_TABS!=="undefined"?PLACE_TABS:[]).map(t=>t[0]);
    const keys=Object.keys(layers).sort((a,b)=>(a==="outoftown")-(b==="outoftown")||(order.indexOf(a)+1||99)-(order.indexOf(b)+1||99));
    const SUB=(typeof TAB_SUB!=="undefined")?TAB_SUB:{};
    const fit=pts=>{ if(pts.length===1) map.setView(pts[0],15); else if(pts.length) map.fitBounds(L.latLngBounds(pts),{padding:[40,40],maxZoom:17}); };
    const cnt=document.getElementById("mapCount"), countText=places.length+" places on the map so far";
    const show=(k,noFit)=>{ active=k; if(focusGroup){ map.removeLayer(focusGroup); focusGroup=null; if(cnt) cnt.textContent=countText; }
      keys.forEach(x=>{ (k==="all"?x!=="outoftown":k===x)?map.addLayer(layers[x]):map.removeLayer(layers[x]); });
      document.querySelectorAll("#mapChips button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.k===k));
      if(!noFit) fit(k==="all"?keys.filter(x=>x!=="outoftown").flatMap(x=>bounds[x]):(bounds[k]||[])); };
    const chips=document.getElementById("mapChips");
    if(chips){ chips.innerHTML=[["all","All"]].concat(keys.map(k=>[k,k==="outoftown"?"Out of Town":(tabName(k)||k)])).map(([k,l])=>`<button type="button" class="tab" data-k="${k}" aria-pressed="${k==="all"}"><span class="fm-lbl">${k!=="all"?`<i class="fm-dot" style="background:${k==="outoftown"?"#7a7a7a":(COLORS[k]||"#2c4a3a")}"></i>`:""}${esc(l)}</span>${SUB[k]?`<small class="tab-sub">${esc(SUB[k])}</small>`:""}</button>`).join("");
      chips.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b) show(b.dataset.k); }); }
    keys.forEach(k=>{ if(k!=="outoftown") map.addLayer(layers[k]); });
    if(cnt) cnt.textContent=countText;
    const focusPlace=name=>{ const ms=markers[name]; if(!ms||!ms.length) return;
      show("all",true);
      if(ms.length>1){ // e.g. Chainsaw Carvings: show just those, all of them
        keys.forEach(k=>map.removeLayer(layers[k])); focusGroup=L.layerGroup(ms).addTo(map); fit(ms.map(x=>x.getLatLng()));
        document.querySelectorAll("#mapChips button").forEach(x=>x.setAttribute("aria-pressed","false"));
        if(cnt) cnt.innerHTML=`Showing all ${ms.length} ${esc((places.find(p=>p.name===name)||{}).shown||name)} · <a href="map.html">Show every place</a>`;
      } else { const ll=ms[0].getLatLng(); if(milesFromSeldovia(ll.lat,ll.lng)>OUT_OF_TOWN_MILES) map.addLayer(layers.outoftown); map.setView(ll,17); ms[0].openPopup(); } };
    const want=new URLSearchParams(location.search).get("place");
    if(want) focusPlace(want);

    // ---- Search (Qwynny Nov 5): uses the site search's Explore entries, so names, categories and descriptions all match.
    // A place with no pin still shows up, with a link to its Explore page, so nobody thinks it's missing from Seldovia.
    const input=document.getElementById("mapSearch"), box=document.getElementById("mapResults"); if(!input||!box) return;
    const nameOf=it=>new URLSearchParams(it.href.split("?")[1]).get("find");
    const rank=raw=>{ const q=raw.trim().split(/\s+/).filter(Boolean);
      const scored=INDEX.filter(it=>it.type==="Explore").map(it=>({it,r:scoreMatch(it,q)})).filter(x=>x.r);
      const strict=scored.filter(x=>x.r.all);
      return (strict.length?strict:scored).sort((a,b)=>b.r.s-a.r.s).slice(0,8).map(x=>x.it); };
    let idx=-1;
    const close=()=>{ box.classList.remove("show"); input.setAttribute("aria-expanded","false"); input.removeAttribute("aria-activedescendant"); idx=-1; };
    const mark=i=>{ const items=[...box.querySelectorAll(".r-item")]; idx=i;
      items.forEach((x,n)=>{ x.classList.toggle("active",n===i); x.setAttribute("aria-selected",n===i); });
      if(items[i]){ input.setAttribute("aria-activedescendant",items[i].id); items[i].scrollIntoView({block:"nearest"}); } else input.removeAttribute("aria-activedescendant"); };
    const render=()=>{ const raw=input.value; if(!raw.trim()){ close(); box.innerHTML=""; return; }
      const res=rank(raw);
      box.innerHTML=res.length ? res.map((it,i)=>{ const n=nameOf(it);
          return markers[n]
            ? `<button type="button" class="r-item fm-result" id="mapOpt${i}" role="option" aria-selected="false" data-place="${esc(n)}"><span class="r-title">${hl(it.title,raw)}</span><span class="r-desc">${esc(it.desc)}</span></button>`
            : `<a class="r-item fm-result" id="mapOpt${i}" role="option" aria-selected="false" href="${esc(it.href)}"><span class="r-title">${hl(it.title,raw)}</span><span class="r-desc">No pin on the map yet · See details →</span></a>`; }).join("")
        : `<div class="r-empty">No places match “${esc(raw.trim())}”. <a href="explore.html">Browse Explore</a></div>`;
      box.classList.add("show"); input.setAttribute("aria-expanded","true"); mark(res.length?0:-1); };
    const pick=b=>{ close(); input.value=b.querySelector(".r-title").textContent; input.blur(); focusPlace(b.dataset.place);
      el.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}); };
    input.addEventListener("input",render);
    input.addEventListener("focus",()=>{ if(input.value.trim()) render(); });
    input.addEventListener("keydown",e=>{ const items=box.querySelectorAll(".r-item");
      if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); if(items.length) mark(e.key==="ArrowDown"?Math.min(idx+1,items.length-1):Math.max(idx-1,0)); }
      else if(e.key==="Enter"){ e.preventDefault(); if(items[idx]) items[idx].click(); }
      else if(e.key==="Escape") close(); });
    box.addEventListener("click",e=>{ const b=e.target.closest("button.fm-result"); if(b) pick(b); });
    document.addEventListener("click",e=>{ if(!input.contains(e.target)&&!box.contains(e.target)) close(); });
    if(input.value.trim()&&document.activeElement===input) render(); // they started typing before the places finished loading
  });

  // ---- Find me ----
  const btn=document.getElementById("findMeBtn"), msg=document.getElementById("findMeMsg");
  let me=null, ring=null, watch=null, first=true;
  const miles=(a,b)=>{ const R=3958.8,r=x=>x*Math.PI/180, dl=r(b[0]-a[0]), dn=r(b[1]-a[1]);
    const h=Math.sin(dl/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dn/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
  if(btn) btn.addEventListener("click",()=>{
    if(!("geolocation" in navigator)){ msg.textContent="Sorry, this browser can't share your location."; return; }
    if(watch!=null){ if(me) map.setView(me.getLatLng(),17); return; }
    msg.textContent="Finding you… (your phone may ask for permission)";
    watch=navigator.geolocation.watchPosition(pos=>{
      const ll=[pos.coords.latitude,pos.coords.longitude], acc=pos.coords.accuracy||30, d=miles(ll,SELDOVIA_CENTER);
      if(!me){ me=L.circleMarker(ll,{radius:8,color:"#fff",weight:3,fillColor:"#1a73e8",fillOpacity:1}).addTo(map).bindPopup("You are here"); ring=L.circle(ll,{radius:acc,color:"#1a73e8",weight:1,fillOpacity:.12}).addTo(map); }
      else { me.setLatLng(ll); ring.setLatLng(ll).setRadius(acc); }
      if(d>25){ msg.textContent=`You're about ${Math.round(d).toLocaleString()} miles from Seldovia. Come on over! Once you're in town, tap Find me again.`; }
      else { msg.textContent="📍 Found you! The blue dot is you. It moves as you walk."; if(first) map.setView(ll,17); }
      first=false; btn.textContent="📍 Show me again";
    },err=>{ watch=null; msg.textContent=err.code===1?"Location is turned off for this site. To use Find me, allow location in your browser settings and try again.":"Couldn't find your location just now. Please try again."; },
    {enableHighAccuracy:true,maximumAge:10000,timeout:20000});
  });
})();
