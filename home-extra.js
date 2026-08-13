/* Home "of the day" widget. The admin picks which one shows (Supabase settings row
   key='home_extra'): Alaska fact / marine weather / word of the day / fun day / none.
   Defaults to the Alaska fact if the DB or setting isn't there yet. All client-side. */
(function(){
  const box=document.querySelector("#todayExtra");
  if(!box) return;
  const LAT=59.4386, LON=-151.7133;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  // Day index in Alaska time (stable per calendar day) for rotating the static lists.
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

  /* ---- Alaska fact of the day ---- */
  const FACTS=[
    "Seldovia's name comes from the Russian \"Seldevoy,\" meaning \"herring bay.\"",
    "There is no road to Seldovia — you arrive by ferry, small plane, or water taxi.",
    "Alaska has more coastline than all other U.S. states combined, about 34,000 miles.",
    "Kachemak Bay is one of the most productive estuaries in the world.",
    "At Seldovia's latitude, midsummer brings well over 18 hours of daylight.",
    "Alaska is the only U.S. state whose name is typed on one row of a keyboard.",
    "Denali, at 20,310 feet, is the highest peak in North America.",
    "Seldovia's historic boardwalk once ran along the whole waterfront on pilings over the tide.",
    "Alaska has roughly 3 million lakes and more than 100,000 glaciers.",
    "Kachemak Bay tides swing more than 20 feet — among the largest in the United States.",
    "The 1964 Good Friday earthquake dropped Seldovia's land several feet, reshaping the shoreline.",
    "Halibut caught near Seldovia can top 300 pounds.",
    "Alaska sits so far west that part of it crosses into the Eastern Hemisphere.",
    "Sea otters, once nearly gone from these waters, are again common in Kachemak Bay.",
    "Seldovia is home to the Seldovia Village Tribe, an active Alaska Native community.",
    "Bald eagles are a daily sight along the Seldovia waterfront.",
    "Alaska was purchased from Russia in 1867 for about two cents an acre.",
    "The Otterbahn Trail winds from town to Outside Beach through coastal spruce forest.",
    "Kachemak Bay State Park, across the water, was Alaska's first state park.",
    "In winter, Seldovia can drop to just over 5 hours of daylight.",
    "Wild blueberries, salmonberries, and highbush cranberries grow all around Seldovia.",
    "The Alaska Marine Highway ferries are officially part of the U.S. National Highway System.",
  ];

  /* ---- Word of the day ---- */
  const WORDS=[
    ["Petrichor","The earthy scent after rain on dry ground."],
    ["Halcyon","Calm, peaceful, and happy — like a still day on the bay."],
    ["Littoral","Of or on the shore between high and low tide."],
    ["Nautical","Relating to sailors, ships, or navigation."],
    ["Gloaming","Twilight; the soft light after sunset."],
    ["Estuary","Where a river's fresh water meets the sea's tide."],
    ["Boreal","Of the northern forests and their cool climate."],
    ["Fathom","A unit of water depth (6 feet); also, to understand deeply."],
    ["Slough","A slow, marshy channel of water (as in Songs on the Slough)."],
    ["Aurora","Natural light display in the northern night sky."],
    ["Weir","A small dam or fence set in a stream to catch fish."],
    ["Cove","A small, sheltered bay."],
    ["Tidepool","A rocky pool left full of sea life at low tide."],
    ["Skiff","A small, light boat for shallow water."],
    ["Verdant","Green with growing plants; lush."],
    ["Mariner","A sailor; one who navigates the sea."],
  ];

  /* ---- Fun (non-political) day of the day ---- */
  const FUNDAYS={ "01-01":"New Year's Day","02-02":"Groundhog Day","03-14":"Pi Day","04-22":"Earth Day",
    "06-08":"World Oceans Day","06-21":"Summer Solstice","07-11":"National Blueberry Muffin Day",
    "08-09":"National Book Lovers Day","08-16":"National Roller Coaster Day","09-19":"Talk Like a Pirate Day",
    "10-04":"National Taco Day","11-17":"National Take a Hike Day","12-21":"Winter Solstice" };

  function degToCompass(d){ const dirs=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]; return dirs[Math.round(d/22.5)%16]; }

  const RENDER={
    alaska_fact(){ box.innerHTML=card("🧭","Alaska fact of the day",`<p>${esc(FACTS[doy%FACTS.length])}</p>`); },
    word(){ const [w,d]=WORDS[doy%WORDS.length]; box.innerHTML=card("📖","Word of the day",`<p><b>${esc(w)}</b> — ${esc(d)}</p>`); },
    funday(){ const key=`${String(am).padStart(2,"0")}-${String(ad).padStart(2,"0")}`;
      const today=FUNDAYS[key];
      box.innerHTML=today ? card("🎉","Today is…",`<p>${esc(today)}!</p>`)
        : card("🎉","Fun day",`<p>Every day is a good day on Kachemak Bay.</p>`); },
    marine(){
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
    },
  };

  function show(mode){
    if(mode==="none"){ box.innerHTML=""; return; }
    (RENDER[mode]||RENDER.alaska_fact)();
  }

  // Read the admin's choice; default to the Alaska fact if unset / DB not ready.
  if(window.db){
    db.from("settings").select("value").eq("key","home_extra").maybeSingle()
      .then(({data,error})=>{ show((!error && data && data.value) ? data.value : "alaska_fact"); })
      .catch(()=>show("alaska_fact"));
  } else { show("alaska_fact"); }
})();
