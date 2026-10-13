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
    const places=(window.EXPLORE_LIVE||[]).filter(p=>{ const q=pins[p.name]; return q && !q.skip && isFinite(q.lat) && isFinite(q.lng); });
    places.forEach(p=>{ const q=pins[p.name], c=COLORS[p.key]||"#2c4a3a";
      const m=L.circleMarker([q.lat,q.lng],{radius:9,color:"#fff",weight:2,fillColor:c,fillOpacity:.95});
      m.bindPopup(`<div class="fm-pop"><b>${esc(p.shown)}</b><br><span>${esc(p.label||tabName(p.key))}</span>
        <div class="fm-pop-links"><a href="explore.html?find=${encodeURIComponent(p.name)}">See it on Explore</a> ·
        <a href="https://www.google.com/maps/dir/?api=1&destination=${q.lat},${q.lng}" target="_blank" rel="noopener">Directions ↗</a></div></div>`);
      (layers[p.key]=layers[p.key]||L.layerGroup().addTo(map)).addLayer(m); markers[p.name]=m; });
    const keys=Object.keys(layers);
    const chips=document.getElementById("mapChips");
    if(chips){ chips.innerHTML=[["all","All"]].concat(keys.map(k=>[k,tabName(k)||k])).map(([k,l])=>`<button type="button" class="tab" data-k="${k}" aria-pressed="${k==="all"}">${k!=="all"?`<i class="fm-dot" style="background:${COLORS[k]||"#2c4a3a"}"></i>`:""}${esc(l)}</button>`).join("");
      chips.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; active=b.dataset.k;
        chips.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));
        keys.forEach(k=>{ (active==="all"||active===k)?map.addLayer(layers[k]):map.removeLayer(layers[k]); });
        // zoom to fit the pins being shown (some are out of town, e.g. Kasitsna Bay Lab)
        const shown=places.filter(p=>active==="all"||p.key===active).map(p=>markers[p.name].getLatLng());
        if(shown.length===1) map.setView(shown[0],15); else if(shown.length) map.fitBounds(L.latLngBounds(shown),{padding:[40,40],maxZoom:17}); }); }
    const cnt=document.getElementById("mapCount"); if(cnt) cnt.textContent=places.length+" places on the map so far";
    const want=new URLSearchParams(location.search).get("place");
    if(want && markers[want]){ map.setView(markers[want].getLatLng(),17); markers[want].openPopup(); }
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
