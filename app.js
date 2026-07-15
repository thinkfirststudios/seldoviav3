/* ============================================================
   Seldovia.com — shared script for the multi-page site.
   Included on every page. Injects the shared header/footer,
   then renders whichever content containers exist on the page.
   Mock data is clearly sample content. PROD notes mark where
   real integrations (AK MLS IDX, calendar feed, directory DB) connect.
   ============================================================ */
const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const PAGE=document.body.dataset.page||"home";

/* ============================================================ SHARED CHROME (header / drawer / footer) ============================================================ */
const NAV=[
  ["explore.html","Explore","explore"],
  ["calendar.html","Calendar","calendar"],
  ["gazette.html","Gazette","gazette"],
  ["gallery.html","Gallery","gallery"],
  ["real-estate.html","Real Estate","realestate"],
  ["phone-book.html","Phone Book","phonebook"],
  ["bulletin.html","Bulletin","bulletin"],
  ["contact.html","Contact","contact"],
];
const navLinks=(cls="")=>NAV.map(([href,label,key])=>`<a class="${cls} ${key===PAGE?'active':''}" href="${href}">${label}</a>`).join("");

const HEADER=`
<header class="masthead">
  <div class="masthead-inner">
    <a class="brand" href="index.html" aria-label="Seldovia Property home">
      <img class="brand-logo" src="images/seldovia-property-logo.jpg" alt="Seldovia Property" width="180" height="180">
    </a>
    <nav class="mainnav" aria-label="Primary">${navLinks()}</nav>
    <div class="head-actions">
      <div class="navsearch" role="search">
        <span class="s-icon" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span>
        <input type="search" id="navSearch" placeholder="Search…" aria-label="Search the whole site" autocomplete="off">
        <div class="results" id="navResults" role="listbox" style="left:0; right:0; top:calc(100% + 8px);"></div>
      </div>
      <a class="btn btn-primary add-listing" href="contact.html">+ Add a Listing</a>
      <button class="icon-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-scrim" data-close></div>
  <nav class="drawer-panel" aria-label="Mobile">
    <a class="${PAGE==='home'?'active':''}" href="index.html" data-close>Home</a>
    ${navLinks("").replace(/<a /g,'<a data-close ')}
    <a class="btn btn-primary" href="contact.html" data-close>+ Add a Listing</a>
  </nav>
</div>`;

const FOOTER=`
<footer class="site">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-col foot-brand">
        <span class="word">Seldovia.com</span>
        <p>A warm, community-first guide to our little town on Kachemak Bay. Made as a gift to Seldovia.</p>
        <div class="foot-util"><span>Tide: High 14.2 ft</span><span>Ferry: 3:15 PM</span><span>54&deg;F</span><span id="footTime">&mdash;:&mdash;</span></div>
      </div>
      <div class="foot-col"><h4>Explore</h4><ul><li><a href="explore.html">Directory</a></li><li><a href="gazette.html">The Gazette</a></li><li><a href="gallery.html">Gallery</a></li><li><a href="calendar.html">Calendar</a></li></ul></div>
      <div class="foot-col"><h4>Community</h4><ul><li><a href="phone-book.html">Phone Book</a></li><li><a href="bulletin.html">Bulletin Board</a></li><li><a href="index.html#sponsors">Sponsors</a></li><li><a href="contact.html">Contact</a></li></ul></div>
      <div class="foot-col"><h4>Real Estate</h4><ul><li><a href="real-estate.html">Featured listings</a></li><li><a href="real-estate.html">Buying guide</a></li><li><a href="real-estate.html">Selling guide</a></li><li><a href="contact.html">Home valuation</a></li></ul></div>
    </div>
    <div class="foot-bottom">
      <p class="disclaimer">&copy; <span id="year">2026</span> Seldovia.com — a community project. Real estate services provided by Seldovia Property, a licensed Alaska real estate brokerage (Jenny Chissus, Broker/Owner). Listing information believed reliable but not guaranteed; Alaska is a non-disclosure state. Equal Housing Opportunity.</p>
      <p>Made with care on Kachemak Bay 🏔️</p>
    </div>
  </div>
</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;

document.body.insertAdjacentHTML("afterbegin", HEADER);
document.body.insertAdjacentHTML("beforeend", FOOTER);

/* ============================================================ MOCK DATA ============================================================ */
const CATEGORIES=[{b:"Stay",s:"Lodges & cabins",key:"lodging"},{b:"Eat & Drink",s:"Dining & cafés",key:"dining"},{b:"Charters & Tours",s:"On the water",key:"charters"},{b:"Cafés",s:"Coffee & bakery",key:"dining"},{b:"Arts & Galleries",s:"Local makers",key:"arts"},{b:"Outdoors & Trails",s:"Hikes & beaches",key:"outdoors"},{b:"Beauty & Wellness",s:"Spa & self-care",key:"wellness"},{b:"Events",s:"What's on",key:"events"}];
const PLACES=[{name:"Seldovia Boardwalk Hotel",cat:"Lodging",key:"lodging",rate:4.9,rev:212,open:true},{name:"Tide Pool Café",cat:"Café",key:"dining",rate:4.8,rev:176,open:true},{name:"Kachemak Bay Charters",cat:"Charters",key:"charters",rate:4.9,rev:143,open:true},{name:"Salmonberry Bakery",cat:"Bakery",key:"dining",rate:4.7,rev:98,open:true},{name:"Slough Arts Gallery",cat:"Arts",key:"arts",rate:4.6,rev:64,open:false},{name:"Otterbahn Trail",cat:"Outdoors",key:"outdoors",rate:4.9,rev:230,open:true},{name:"Otter Cove Lodge",cat:"Lodging",key:"lodging",rate:4.8,rev:151,open:true},{name:"Linwood Bar & Grill",cat:"Dining",key:"dining",rate:4.5,rev:120,open:true},{name:"Outside Beach Park",cat:"Outdoors",key:"outdoors",rate:4.7,rev:88,open:true}];
const GAZETTE=[{title:"Halibut derby returns to the harbor",excerpt:"The summer classic is back, with daily weigh-ins on the city dock and a fish fry to close it out.",date:"Jul 9, 2026",read:"3 min",cat:"Community"},{title:"Restoring the historic boardwalk",excerpt:"Volunteers spent the weekend replacing planks and repainting rails along the slough.",date:"Jul 2, 2026",read:"4 min",cat:"Heritage"},{title:"A record year for the berry pickers",excerpt:"Salmonberries came early and heavy this summer. Locals share their favorite spots (sort of).",date:"Jun 24, 2026",read:"2 min",cat:"Outdoors"},{title:"New mural brightens the ferry terminal",excerpt:"Students and local artists turned a grey wall into a bay-blue welcome for visitors.",date:"Jun 15, 2026",read:"3 min",cat:"Arts"},{title:"Barging your building materials",excerpt:"A practical guide to getting lumber and appliances across the bay without the headache.",date:"Jun 6, 2026",read:"5 min",cat:"Living Here"},{title:"Meet the Village Tribe garden",excerpt:"Fresh greens grow at the edge of town — and everyone's invited to help and harvest.",date:"May 28, 2026",read:"3 min",cat:"Community"}];
const GALLERY=[{h:240,cap:"Morning fog over the harbor"},{h:320,cap:"Boardwalk homes at high tide"},{h:200,cap:"Floatplane off the bay"},{h:300,cap:"Salmonberries on the Otterbahn"},{h:220,cap:"Sea otters near the breakwater"},{h:280,cap:"Fireweed and the far range"},{h:210,cap:"Fresh halibut on the dock"},{h:300,cap:"Midnight-gold summer light"},{h:230,cap:"Kayaks on a glassy morning"}];
const EVENTS=[{d:"2026-07-15",t:"09:00",title:"Farmers & Makers Market",where:"Seldovia Bay Pavilion",cat:"Market",dur:"til 1 PM"},{d:"2026-07-15",t:"18:30",title:"Open Mic on the Boardwalk",where:"Linwood Bar & Grill",cat:"Music",dur:"til late"},{d:"2026-07-17",t:"10:00",title:"Otterbahn Trail Cleanup",where:"Trailhead by the school",cat:"Volunteer",dur:"2 hrs"},{d:"2026-07-18",t:"08:00",title:"Halibut Derby — Weigh-in",where:"City Dock",cat:"Fishing",dur:"daily"},{d:"2026-07-19",t:"19:00",title:"Community Potluck & Bonfire",where:"Outside Beach",cat:"Community",dur:"til dusk"},{d:"2026-07-21",t:"17:30",title:"City Council Meeting",where:"Seldovia City Hall",cat:"Civic",dur:"1.5 hrs"},{d:"2026-07-22",t:"11:00",title:"Kids' Tide-Pool Walk",where:"Outside Beach",cat:"Family",dur:"90 min"},{d:"2026-07-24",t:"18:00",title:"Gallery Night — Local Artists",where:"Seldovia Arts Council",cat:"Arts",dur:"til 9 PM"},{d:"2026-07-26",t:"09:30",title:"Sunday Kayak Paddle",where:"Small-Boat Harbor",cat:"Outdoors",dur:"3 hrs"},{d:"2026-07-28",t:"12:00",title:"Senior Lunch & Cards",where:"SVT Community Room",cat:"Community",dur:"2 hrs"},{d:"2026-07-31",t:"18:00",title:"End-of-Month Fish Fry",where:"Harbor Pavilion",cat:"Food",dur:"til 8 PM"},{d:"2026-08-01",t:"09:00",title:"Farmers & Makers Market",where:"Seldovia Bay Pavilion",cat:"Market",dur:"til 1 PM"}];
const LISTINGS=[{name:"Waterfront cabin on the slough",cat:"Waterfront · Cabin",beds:2,baths:1,acre:"0.4 ac",open:true},{name:"Spruce-edge buildable parcel",cat:"Parcel · Off-grid",beds:"—",baths:"—",acre:"2.1 ac",open:true},{name:"Boardwalk historic home",cat:"Historic · In-town",beds:3,baths:2,acre:"0.2 ac",open:true},{name:"Hilltop home, bay panorama",cat:"View · Home",beds:3,baths:2,acre:"1.0 ac",open:true},{name:"Cozy off-grid retreat",cat:"Cabin · Off-grid",beds:1,baths:1,acre:"5.0 ac",open:true},{name:"Harbor-view commercial space",cat:"Commercial · In-town",beds:"—",baths:1,acre:"0.15 ac",open:false}];
const DIRECTORY=[{name:"Seldovia Boardwalk Hotel",cat:"Lodging",phone:"(907) 555-0142",spon:true},{name:"Tide Pool Café",cat:"Food & Drink",phone:"(907) 555-0198",spon:false},{name:"Kachemak Bay Charters",cat:"Charters",phone:"(907) 555-0170",spon:true},{name:"Seldovia General Store",cat:"Shopping",phone:"(907) 555-0111",spon:false},{name:"Bay Fuel & Marine",cat:"Marine",phone:"(907) 555-0133",spon:false},{name:"Slough Arts Gallery",cat:"Arts",phone:"(907) 555-0165",spon:false},{name:"Susan B. English School",cat:"Public",phone:"(907) 555-0100",spon:false},{name:"Seldovia Medical Clinic",cat:"Health",phone:"(907) 555-0122",spon:false},{name:"Otter Cove Lodge",cat:"Lodging",phone:"(907) 555-0188",spon:true},{name:"Harbor Water Taxi",cat:"Charters",phone:"(907) 555-0155",spon:false},{name:"Salmonberry Bakery",cat:"Food & Drink",phone:"(907) 555-0177",spon:false},{name:"Seldovia Public Library",cat:"Public",phone:"(907) 555-0109",spon:false}];
const NOTES=[{cat:"Free",title:"Free firewood — you haul",body:"Spruce rounds from a downed tree near Jakolof Bay Rd. First come, first served.",by:"The Hansens",when:"Jul 12"},{cat:"Lost & Found",title:"Found: blue rain jacket",body:"Left at the ferry terminal bench. Describe it and it's yours — check at the General Store.",by:"Terminal staff",when:"Jul 11"},{cat:"Wanted",title:"Ride-share to Homer Sat",body:"Two folks + groceries looking to split the water-taxi Saturday morning. Text the board.",by:"Mara & Jo",when:"Jul 10"},{cat:"For Sale",title:"14' aluminum skiff",body:"Solid little boat, 9.9 hp, trailer included. Great for calm-day crossings.",by:"D. Whitfield",when:"Jul 9"},{cat:"Volunteer",title:"Trail crew needs hands",body:"Otterbahn cleanup Friday at 10. Gloves and cocoa provided — kids welcome!",by:"Trails Committee",when:"Jul 8"},{cat:"Announcement",title:"Library summer hours",body:"Open Tue–Sat, 11–5 through August. New books in from the Homer exchange.",by:"Seldovia Library",when:"Jul 7"}];
const TESTIMONIALS=[{name:"Richard Duffy",role:"Visitor from Anchorage",c:"#663015",t:"We found the ferry times, a cabin, and a kayak tour all in one afternoon. Coming back every summer now."},{name:"Dana Sanders",role:"Seldovia local",c:"#DF1284",t:"Finally a calendar you can actually scroll. I check the bulletin board every morning with my coffee."},{name:"Marta Ivanoff",role:"Gallery owner",c:"#7f8a6b",t:"Listing my gallery here brought in real foot traffic. It feels like the whole town in one place."},{name:"Tom & Lily Reyes",role:"New homeowners",c:"#a8683a",t:"We bought our first cabin on the bay through the site. Warm, honest, and genuinely helpful."}];
const SPONSORS=[{name:"Boardwalk Hotel",cat:"Lodging",c:"#663015"},{name:"Kachemak Charters",cat:"Fishing",c:"#DF1284"},{name:"Tide Pool Café",cat:"Food & Drink",c:"#7f8a6b"},{name:"Bay Fuel & Marine",cat:"Marine",c:"#4f5a3d"},{name:"Otter Cove Lodge",cat:"Lodging",c:"#a8683a"},{name:"Slough Arts",cat:"Arts",c:"#b0357e"}];

/* ============================================================ RENDER (each guarded — runs only if its container exists on this page) ============================================================ */
function stars(r){const full=Math.round(r); return "★★★★★".slice(0,full)+"☆☆☆☆☆".slice(0,5-full);}
// ---- On-theme placeholder photos (LoremFlickr, keyworded per item) ----
// PROD: replace these keyworded placeholders with real Seldovia photography.
const flickr=(w,h,tags,lock)=>`https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;
const TAGS_BY_KEY={lodging:"cabin,forest,alaska",dining:"seafood,harbor,alaska",charters:"boat,ocean,alaska",arts:"art,gallery,coast",outdoors:"trail,forest,mountains",wellness:"spa,forest,nature",events:"festival,outdoor,community"};
const GAL_TAGS=["harbor,fog,alaska","boardwalk,coast,alaska","seaplane,bay,alaska","berries,forest,trail","otter,sea,wildlife","wildflowers,mountains,alaska","fishing,dock,harbor","sunset,coast,alaska","kayak,water,alaska"];

// hero quick-cats
if($("#quickcats")) $("#quickcats").innerHTML=[["Restaurants","dining"],["Lodging","lodging"],["Charters","charters"],["Trails","outdoors"],["Arts","arts"],["Events","events"]].map(([label,key])=>
  `<a class="quickcat" href="explore.html?cat=${key}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>${esc(label)}</a>`).join("");

// category tiles
if($("#catGrid")) $("#catGrid").innerHTML=CATEGORIES.map((c,i)=>{
  const img=flickr(600,600,TAGS_BY_KEY[c.key]||"coast,alaska,nature",i+1);
  return `<a class="cat-tile" href="explore.html?cat=${c.key}" aria-label="${esc(c.b)}"><img class="cat-photo" src="${img}" alt="" loading="lazy" width="600" height="600"><span class="cap"><b>${esc(c.b)}</b><span>${esc(c.s)}</span></span></a>`;}).join("");

// feature media
if($("#featureMedia")) $("#featureMedia").innerHTML=`<img class="feature-photo" src="${flickr(900,700,"harbor,mountains,alaska",7)}" alt="" loading="lazy" width="900" height="700">`;

// places (directory highlights) with tabs — reads ?cat= from URL for deep-links
const PLACE_TABS=[["all","All"],["dining","Dining"],["lodging","Lodging"],["charters","Charters"],["outdoors","Outdoors"],["arts","Arts"]];
let placeTab=(new URLSearchParams(location.search).get("cat"))||"all";
if(!PLACE_TABS.some(([k])=>k===placeTab)) placeTab="all";
function renderPlaces(){
  if(!$("#placeGrid")) return;
  const rows=PLACES.filter(p=>placeTab==="all"||p.key===placeTab);
  $("#placeGrid").innerHTML=rows.map(p=>`
    <a class="place" href="explore.html">
      <div class="place-media"><img class="place-photo" src="${flickr(600,400,TAGS_BY_KEY[p.key]||'coast,alaska,nature',PLACES.indexOf(p)+1)}" alt="" loading="lazy" width="600" height="400">
        <span class="badge-open" style="${p.open?'':'background:#efe6e2;color:#9a877f'}">${p.open?'Open':'Closed'}</span>
        <button class="heart" aria-label="Save ${esc(p.name)}" aria-pressed="false" onclick="event.preventDefault();event.stopPropagation();this.setAttribute('aria-pressed', this.getAttribute('aria-pressed')==='true'?'false':'true')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>
        </button>
      </div>
      <div class="place-body">
        <div class="rating"><span class="stars">${stars(p.rate)}</span> <b>${p.rate.toFixed(1)}</b><span>(${p.rev})</span> <span class="cat">· ${esc(p.cat)}</span></div>
        <h4>${esc(p.name)}</h4>
        <div class="place-loc"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> Seldovia, AK</div>
      </div>
    </a>`).join("");
}
if($("#placeTabs")){
  $("#placeTabs").innerHTML=PLACE_TABS.map(([k,l])=>`<button class="tab" data-key="${k}" aria-pressed="${k===placeTab}">${esc(l)}</button>`).join("");
  $("#placeTabs").addEventListener("click",e=>{const b=e.target.closest(".tab"); if(!b)return; placeTab=b.dataset.key; $$("#placeTabs .tab").forEach(t=>t.setAttribute("aria-pressed",t===b)); renderPlaces();});
}
renderPlaces();

// gazette
// PROD: swap these keyworded placeholders for real Gazette article photos
// On-theme nature/coastal placeholders via LoremFlickr, tagged per article.
const GAZ_TAGS=["harbor,fishing,alaska","boardwalk,coast,alaska","berries,forest,alaska","coast,ocean,alaska","harbor,boat,alaska","garden,vegetables,green"];
if($("#gazetteGrid")) $("#gazetteGrid").innerHTML=GAZETTE.map((g,i)=>{
  const tags=GAZ_TAGS[i%GAZ_TAGS.length];
  return `<a class="post" href="gazette.html"><div class="post-media"><img class="post-photo" src="${flickr(640,400,tags,i+1)}" alt="" loading="lazy" width="640" height="400"></div>
    <div class="post-body"><span class="kicker">${esc(g.cat)}</span><h4>${esc(g.title)}</h4><p>${esc(g.excerpt)}</p>
    <div class="post-meta"><span>${esc(g.date)}</span><span>·</span><span>${esc(g.read)} read</span></div></div></a>`;}).join("");

// gallery
if($("#masonry")) $("#masonry").innerHTML=GALLERY.map((im,i)=>{
  const img=`<img src="${flickr(300,im.h,GAL_TAGS[i%GAL_TAGS.length],i+1)}" alt="${esc(im.cap)}" loading="lazy" width="300" height="${im.h}">`;
  return `<figure tabindex="0">${img}<figcaption>${esc(im.cap)}</figcaption></figure>`;}).join("");

// real estate listings
if($("#reGrid")) $("#reGrid").innerHTML=LISTINGS.map((l,i)=>`
  <a class="place" href="real-estate.html"><div class="place-media place-media-blank"><span class="ph-label"><span class="ph-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></span><span class="ph-txt">Photo placeholder</span></span><span class="badge-open">${l.open?'Available':'Pending'}</span></div>
  <div class="place-body">
    <div class="rating"><span class="cat" style="font-weight:800;color:var(--accent-ink)">${esc(l.cat)}</span></div>
    <h4>${esc(l.name)}</h4>
    <div class="place-loc" style="gap:1rem"><span><b style="color:var(--heading)">${esc(l.beds)}</b> bd</span><span><b style="color:var(--heading)">${esc(l.baths)}</b> ba</span><span><b style="color:var(--heading)">${esc(l.acre)}</b></span></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.2rem"><span class="price">Price on request</span><span style="font-size:.82rem;color:var(--accent-ink);font-weight:700">Details →</span></div>
  </div></a>`).join("");

// directory / phone book
if($("#dirList")){
  const DIR_CATS=["All",...new Set(DIRECTORY.map(d=>d.cat))]; let dirCat="All", dirQuery="";
  $("#dirChips").innerHTML=DIR_CATS.map((c,i)=>`<button class="chip" aria-pressed="${i===0}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  const renderDir=()=>{const q=dirQuery.trim().toLowerCase();
    const rows=DIRECTORY.filter(d=>(dirCat==="All"||d.cat===dirCat)&&(!q||d.name.toLowerCase().includes(q)||d.cat.toLowerCase().includes(q)));
    $("#dirList").innerHTML=rows.length?rows.map(d=>`<div class="dir-item ${d.spon?'sponsored':''}"><div class="d-ico">${esc(d.name[0])}</div>
      <div><div class="d-cat">${esc(d.cat)}</div><h4>${esc(d.name)}</h4><div class="d-contact">${esc(d.phone)} · Seldovia, AK</div></div>
      ${d.spon?'<span class="spon-flag">★ Sponsor</span>':''}</div>`).join(""):`<div class="dir-empty">No matches — try another word or category.</div>`;};
  renderDir();
  $("#dirChips").addEventListener("click",e=>{const b=e.target.closest(".chip"); if(!b)return; dirCat=b.dataset.cat; $$("#dirChips .chip").forEach(c=>c.setAttribute("aria-pressed",c===b)); renderDir();});
  $("#dirSearch").addEventListener("input",e=>{dirQuery=e.target.value; renderDir();});
}

// bulletin
if($("#board")) $("#board").innerHTML=NOTES.map(n=>`<article class="note"><span class="n-cat">${esc(n.cat)}</span><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p><div class="n-foot"><span>${esc(n.by)}</span><span>${esc(n.when)}</span></div></article>`).join("");

// testimonials
if($("#quoteGrid")) $("#quoteGrid").innerHTML=TESTIMONIALS.map(t=>`<div class="quote"><span class="qmark">&rdquo;</span><div class="quote-head"><span class="avatar" style="background:${t.c}">${esc(t.name[0])}</span><span><b>${esc(t.name)}</b><span>${esc(t.role)}</span></span></div><p>${esc(t.t)}</p></div>`).join("");

// sponsors
if($("#sponsorTrack")){const spHTML=SPONSORS.map(s=>`<a class="sponsor" href="contact.html" aria-label="${esc(s.name)} — ${esc(s.cat)}"><span class="logo" style="background:${s.c}">${esc(s.name[0])}</span><span class="s-name">${esc(s.name)}</span><span class="s-cat">${esc(s.cat)}</span></a>`).join(""); $("#sponsorTrack").innerHTML=spHTML+spHTML;}

// home photo gallery (auto-scroll)
const galFig=(g,tags,lock)=>`<figure class="gallery-photo"><img src="${flickr(600,450,tags,lock)}" alt="${esc(g.cap)}" loading="lazy" width="600" height="450"><figcaption>${esc(g.cap)}</figcaption></figure>`;
if($("#galleryTrack")){const gHTML=GALLERY.map((g,i)=>galFig(g,GAL_TAGS[i%GAL_TAGS.length],i+1)).join(""); $("#galleryTrack").innerHTML=gHTML+gHTML;}
if($("#galleryTrack2")){const gHTML=GALLERY.map((g,i)=>({g,t:GAL_TAGS[i%GAL_TAGS.length],l:i+30})).reverse().map(o=>galFig(o.g,o.t,o.l)).join(""); $("#galleryTrack2").innerHTML=gHTML+gHTML;}

/* ============================================================ CALENDAR ============================================================ */
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const parseD=s=>{const[y,m,d]=s.split("-").map(Number); return{y,m:m-1,d};};
const fmtDayLabel=s=>{const{y,m,d}=parseD(s); const dt=new Date(y,m,d); return `${DOW[dt.getDay()]}, ${MONTHS[m]} ${d}`;};
const fmt12=t=>{let[h,mi]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; h=h%12||12; return `${h}:${String(mi).padStart(2,"0")} ${ap}`;};
if($("#agendaScroll")){
  const byDay={}; EVENTS.forEach(e=>{(byDay[e.d]??=[]).push(e);});
  $("#agendaScroll").innerHTML=Object.keys(byDay).sort().map(day=>`<div class="agenda-day">${esc(fmtDayLabel(day))}</div>
    ${byDay[day].sort((a,b)=>a.t.localeCompare(b.t)).map(e=>`<div class="event"><div class="ev-time">${esc(fmt12(e.t))}<small>${esc(e.dur)}</small></div>
      <div><div class="ev-title">${esc(e.title)}</div><div class="ev-where">${esc(e.where)}</div></div>
      <div class="col-right"><span class="ev-cat">${esc(e.cat)}</span><button class="add-cal" data-title="${esc(e.title)}">+ Add</button></div></div>`).join("")}`).join("");
  const y=2026,m=6, first=new Date(y,m,1).getDay(), dim=new Date(y,m+1,0).getDate(), prevDim=new Date(y,m,0).getDate();
  const evMap={}; EVENTS.forEach(e=>{const{y:ey,m:em,d:ed}=parseD(e.d); if(ey===y&&em===m)(evMap[ed]??=[]).push(e);});
  let cells=""; for(let i=0;i<first;i++)cells+=`<div class="mg-cell out"><span class="d">${prevDim-first+i+1}</span></div>`;
  for(let d=1;d<=dim;d++){const evs=evMap[d]||[]; const pips=evs.slice(0,2).map(e=>`<span class="pip">${esc(fmt12(e.t))} ${esc(e.title)}</span>`).join(""); const more=evs.length>2?`<span class="pip">+${evs.length-2} more</span>`:"";
    cells+=`<div class="mg-cell ${evs.length?'has':''}"><span class="d">${d}</span>${pips}${more}</div>`;}
  const trail=(7-((first+dim)%7))%7; for(let i=1;i<=trail;i++)cells+=`<div class="mg-cell out"><span class="d">${i}</span></div>`;
  $("#mgBody").innerHTML=cells;
  const setCalView=v=>{const ag=v==="agenda"; $("#viewAgenda").setAttribute("aria-pressed",ag); $("#viewMonth").setAttribute("aria-pressed",!ag);
    $("#agenda").classList.toggle("hide",!ag); $("#monthgrid").classList.toggle("show",!ag);
    $("#calHint").innerHTML=ag?'Upcoming events · <span class="sample-flag">sample feed</span>':'July 2026 · <span class="sample-flag">sample feed</span>';};
  $("#viewAgenda").addEventListener("click",()=>setCalView("agenda"));
  $("#viewMonth").addEventListener("click",()=>setCalView("month"));
}
document.addEventListener("click",e=>{const b=e.target.closest(".add-cal"); if(b){e.preventDefault(); toast(`"${b.dataset.title}" — saved to your calendar (demo)`);}});

/* ============================================================ GLOBAL SEARCH ============================================================ */
const INDEX=[
  ...PLACES.map(p=>({type:"Place",title:p.name,desc:`${p.cat} · ${p.rate}★`,href:"explore.html",kw:p.cat+" "+p.key})),
  ...LISTINGS.map(l=>({type:"Real Estate",title:l.name,desc:l.cat,href:"real-estate.html",kw:l.cat})),
  ...CATEGORIES.map(c=>({type:"Category",title:c.b,desc:c.s,href:"explore.html?cat="+c.key,kw:c.key})),
  ...GAZETTE.map(g=>({type:"Gazette",title:g.title,desc:g.excerpt,href:"gazette.html",kw:g.cat})),
  ...EVENTS.map(e=>({type:"Event",title:e.title,desc:`${fmtDayLabel(e.d)} · ${e.where}`,href:"calendar.html",kw:e.cat+" "+e.where})),
  ...DIRECTORY.map(d=>({type:"Directory",title:d.name,desc:`${d.cat} · ${d.phone}`,href:"phone-book.html",kw:d.cat})),
  ...NOTES.map(n=>({type:"Bulletin",title:n.title,desc:n.body,href:"bulletin.html",kw:n.cat})),
  {type:"Guide",title:"Getting to Seldovia",desc:"Ferry, floatplane, and water-taxi options from Homer.",href:"explore.html",kw:"ferry floatplane water taxi homer travel arrive"},
  {type:"Info",title:"Ferry schedule (AMHS)",desc:"Alaska Marine Highway sailings to and from Homer.",href:"calendar.html",kw:"ferry amhs tustumena schedule boat"},
];
function scoreMatch(it,q){const hay=(it.title+" "+it.desc+" "+it.kw+" "+it.type).toLowerCase(); let s=0;
  q.forEach(tok=>{if(!tok)return; const t=it.title.toLowerCase(); if(t.startsWith(tok))s+=6; else if(t.includes(tok))s+=4; if(hay.includes(tok))s+=2; else if(hay.split(/\W+/).some(w=>w.startsWith(tok)))s+=1;}); return s;}
function runSearch(raw){const q=raw.toLowerCase().trim().split(/\s+/).filter(Boolean); if(!q.length)return[]; return INDEX.map(it=>({it,s:scoreMatch(it,q)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,8).map(x=>x.it);}
function hl(text,raw){const q=raw.trim().split(/\s+/).filter(Boolean).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")); if(!q.length)return esc(text); return esc(text).replace(new RegExp("("+q.join("|")+")","ig"),"<mark>$1</mark>");}
function renderResults(box,raw){const res=runSearch(raw);
  if(!raw.trim()){box.classList.remove("show"); box.innerHTML=""; return;}
  if(!res.length){box.innerHTML=`<div class="r-empty">No results for "${esc(raw)}". Try "ferry," "cabin," or "market."</div>`; box.classList.add("show"); return;}
  box.innerHTML=res.map((r,i)=>`<a class="r-item ${i===0?'active':''}" href="${r.href}" role="option"><span class="r-type">${esc(r.type)}</span><span><span class="r-title">${hl(r.title,raw)}</span><span class="r-desc">${hl(r.desc,raw)}</span></span></a>`).join("");
  box.classList.add("show");}
function wireSearch(inputId,boxId){const input=document.getElementById(inputId),box=document.getElementById(boxId); if(!input||!box)return; let idx=0;
  input.addEventListener("input",()=>{idx=0; renderResults(box,input.value);});
  input.addEventListener("focus",()=>{if(input.value)renderResults(box,input.value);});
  input.addEventListener("keydown",e=>{const items=$$(".r-item",box);
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault(); if(!items.length)return; idx=e.key==="ArrowDown"?Math.min(idx+1,items.length-1):Math.max(idx-1,0); items.forEach((it,i)=>it.classList.toggle("active",i===idx)); items[idx].scrollIntoView({block:"nearest"});}
    else if(e.key==="Enter"){if(items[idx]){e.preventDefault(); items[idx].click();}}
    else if(e.key==="Escape"){box.classList.remove("show"); input.blur();}});
  box.addEventListener("click",()=>setTimeout(()=>box.classList.remove("show"),60));
  document.addEventListener("click",e=>{if(!input.contains(e.target)&&!box.contains(e.target))box.classList.remove("show");});}
wireSearch("navSearch","navResults");
wireSearch("heroSearch","heroResults");
if($("#heroSearchBtn")) $("#heroSearchBtn").addEventListener("click",()=>{const v=$("#heroSearch").value; if(v)renderResults($("#heroResults"),v); else $("#heroSearch").focus();});

/* ============================================================ MISC UI ============================================================ */
const drawer=$("#drawer"),menuBtn=$("#menuBtn");
function setDrawer(o){drawer.classList.toggle("open",o); menuBtn.setAttribute("aria-expanded",o); drawer.setAttribute("aria-hidden",!o);}
menuBtn.addEventListener("click",()=>setDrawer(true));
drawer.addEventListener("click",e=>{if(e.target.matches("[data-close], [data-close] *"))setDrawer(false);});
document.addEventListener("keydown",e=>{if(e.key==="Escape")setDrawer(false);});
if($("#contactForm")) $("#contactForm").addEventListener("submit",e=>{e.preventDefault(); if(!$("#cName").value||!$("#cEmail").value||!$("#cMsg").value){toast("Please add your name, email, and a message."); return;} e.target.reset(); toast("Thanks! Your message is on its way (demo).");});
let toastT; function toast(msg){const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove("show"),2600);}
function tickTime(){try{const s=new Intl.DateTimeFormat("en-US",{timeZone:"America/Anchorage",hour:"numeric",minute:"2-digit"}).format(new Date()); const ft=$("#footTime"); if(ft)ft.textContent=s+" AKT";}catch(_){}}
tickTime(); setInterval(tickTime,30000);
if($("#year")) $("#year").textContent=new Date().getFullYear();
