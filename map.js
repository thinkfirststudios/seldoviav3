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

  const layers={}, markers={}; let active="all";
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
    const show=k=>{ active=k; keys.forEach(x=>{ (k==="all"?x!=="outoftown":k===x)?map.addLayer(layers[x]):map.removeLayer(layers[x]); });
      document.querySelectorAll("#mapChips button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.k===k));
      fit(k==="all"?keys.filter(x=>x!=="outoftown").flatMap(x=>bounds[x]):(bounds[k]||[])); };
    const chips=document.getElementById("mapChips");
    if(chips){ chips.innerHTML=[["all","All"]].concat(keys.map(k=>[k,k==="outoftown"?"Out of Town":(tabName(k)||k)])).map(([k,l])=>`<button type="button" class="tab" data-k="${k}" aria-pressed="${k==="all"}"><span class="fm-lbl">${k!=="all"?`<i class="fm-dot" style="background:${k==="outoftown"?"#7a7a7a":(COLORS[k]||"#2c4a3a")}"></i>`:""}${esc(l)}</span>${SUB[k]?`<small class="tab-sub">${esc(SUB[k])}</small>`:""}</button>`).join("");
      chips.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b) show(b.dataset.k); }); }
    keys.forEach(k=>{ if(k!=="outoftown") map.addLayer(layers[k]); });
    const cnt=document.getElementById("mapCount"); if(cnt) cnt.textContent=places.length+" places on the map so far";
    const want=new URLSearchParams(location.search).get("place");
    if(want && markers[want] && markers[want].length){
      const ms=markers[want];
      if(ms.length>1){ // e.g. Chainsaw Carvings: show just those, all of them
        keys.forEach(k=>map.removeLayer(layers[k])); const g=L.layerGroup(ms).addTo(map); fit(ms.map(x=>x.getLatLng()));
        document.querySelectorAll("#mapChips button").forEach(x=>x.setAttribute("aria-pressed","false"));
        if(cnt) cnt.innerHTML=`Showing all ${ms.length} ${esc((places.find(p=>p.name===want)||{}).shown||want)} · <a href="map.html">Show every place</a>`;
      } else { const ll=ms[0].getLatLng(); if(milesFromSeldovia(ll.lat,ll.lng)>OUT_OF_TOWN_MILES) map.addLayer(layers.outoftown); map.setView(ll,17); ms[0].openPopup(); }
    }
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
