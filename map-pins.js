/* Find Me Map pins (Jenny Oct 10). Shared by the public map (map.html) and the admin "Map Pins" tab.
   Pins live in settings.place_pins as {"Place name": {lat, lng}} or {"Place name": {skip:true}} (not a physical place).
   STARTER_PINS came from OpenStreetMap (Oct 12) for places it already knew; they show until Qwynny confirms or moves them. */
window.SELDOVIA_CENTER=[59.4383,-151.7136];
window.STARTER_PINS={"Boardwalk Hotel": [59.437988, -151.714531], "Linwood Bar & Grill": [59.438501, -151.715457], "Otterbahn Trail": [59.446837, -151.714002], "Seldovia Village Tribe": [59.437021, -151.711968], "Seldovia Public Library": [59.438807, -151.713954], "Susan B English School": [59.442225, -151.713521], "United States Post Office \u2014 Seldovia": [59.438662, -151.715108], "Seldovia Bay Ferry": [59.437556, -151.716249], "Rocky Ridge Trail": [59.43519, -151.689013], "Graduation Peak Trail": [59.435376, -151.662031], "Lollipop Park": [59.43761, -151.713892], "Mermaid Park": [59.440132, -151.716931], "Kasitsna Bay Laboratory": [59.467679, -151.551105]};
window.loadPins=function(){
  const base={}; Object.keys(STARTER_PINS).forEach(n=>base[n]={lat:STARTER_PINS[n][0],lng:STARTER_PINS[n][1],starter:true});
  if(!window.db) return Promise.resolve(base);
  return db.from("settings").select("value").eq("key","place_pins").maybeSingle().then(({data})=>{
    let saved={}; try{ saved=data&&data.value?JSON.parse(data.value):{}; }catch(e){}
    Object.keys(saved).forEach(n=>{ base[n]=saved[n]; });           // saved pins (and "skip") win over starter pins
    return base;
  }).catch(()=>base);
};

/* Jenny Oct 21: some listings have SEVERAL locations (chainsaw carvings, painted fire hydrants) — saved as
   {multi:[{lat,lng},...]} — and get their own icon. Places far from Seldovia (Homer, Kenai) go under "Out of Town". */
window.pinIconKind=function(name){ return /chainsaw|carving/i.test(name)?"chainsaw":(/hydrant/i.test(name)?"hydrant":""); };
window.pinIconHtml=function(kind){
  if(kind==="hydrant") return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#d32f2f" stroke="#fff" stroke-width="1.2" d="M9 3h6v2h1a1 1 0 0 1 1 1v2H7V6a1 1 0 0 1 1-1h1zM6 9h12v2h1.5v3H18v5h1v2H5v-2h1v-5H4.5v-3H6z"/><circle cx="12" cy="13" r="1.8" fill="#fff"/></svg>';
  if(kind==="chainsaw") return '<span style="font-size:20px;line-height:1">🪚</span>';
  return "";
};
window.pinPoints=function(q){ if(!q||q.skip) return []; if(Array.isArray(q.multi)) return q.multi.filter(p=>p&&isFinite(p.lat)&&isFinite(p.lng)); return (isFinite(q.lat)&&isFinite(q.lng))?[{lat:q.lat,lng:q.lng}]:[]; };
window.milesFromSeldovia=function(lat,lng){ const R=3958.8,r=x=>x*Math.PI/180,a=SELDOVIA_CENTER, dl=r(lat-a[0]), dn=r(lng-a[1]);
  const h=Math.sin(dl/2)**2+Math.cos(r(a[0]))*Math.cos(r(lat))*Math.sin(dn/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
window.OUT_OF_TOWN_MILES=13;
