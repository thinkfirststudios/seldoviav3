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
