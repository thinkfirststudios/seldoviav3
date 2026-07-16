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

/* ============================================================ PWA (installable, offline-capable) ============================================================ */
(function(){
  const head=document.head;
  const add=(rel,href,extra)=>{const l=document.createElement("link"); l.rel=rel; l.href=href; if(extra)Object.assign(l,extra); head.appendChild(l);};
  if(!document.querySelector('link[rel="manifest"]')) add("manifest","manifest.json");
  add("apple-touch-icon","images/icon-180.png");
  if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
})();

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
// Jenny's Seldovia Blog — recovered posts (original titles, dates, images preserved). PROD: managed via admin.
const GAZETTE=[
 {title:"In Seldovia, working moms wear many hats and often all in the same day.",excerpt:"It’s early mornings with the tide schedule in mind, kids bundled up before school boats or boardwalk walks, and workdays shaped by weather, community needs, and family life all at once.",date:"Mar 12, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/post-0.jpg"},
 {title:"Author Event – “My Heart is Good” with Josh Wisniewski",excerpt:"We love celebrating local talent, and Seldovia is full of it.",date:"Mar 11, 2026",read:"1 min",cat:"Events",img:"images/gazette/post-1.jpg"},
 {title:"New Library Hours – Thank You Volunteers!",excerpt:"We’re so grateful for the volunteers who keep our library open and thriving.",date:"Mar 10, 2026",read:"1 min",cat:"Community",img:"images/gazette/post-2.jpg"},
 {title:"National Napping Day is a reminder that slowing down is just as important as showing up.",excerpt:"Sometimes the best way to reset isn’t coffee… it’s a blanket, a window view of the harbor, and a few peaceful minutes of doing nothing at all.",date:"Mar 9, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/post-3.jpg"},
 {title:"March 8 marks the start of Daylight Saving Time.",excerpt:"At 2:00 A.M., the clocks jump ahead one hour so don’t forget to spring forward.",date:"Mar 8, 2026",read:"1 min",cat:"Community",img:"images/gazette/post-4.jpg"},
 {title:"Living here means learning from the water, the weather, and the quiet strength of a coastal town that stands beautifully against the elements.",excerpt:"From this view on the Homer Spit, looking across the bay toward Seldovia, you can almost feel the character of the place calling you home.",date:"Mar 7, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/post-5.jpg"},
 {title:"Week 10 of 2026 in Seldovia carries the feeling of a season gently beginning to turn.",excerpt:"Winter still shapes the landscape, but the light feels brighter and the days a little longer, hinting at the quiet approach of change.",date:"Mar 6, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/post-6.jpg"},
 {title:"A big thank you to Seldovia Village Tribe for providing such a beautiful fitness center for our community.",excerpt:"Having a warm, welcoming place to walk on the treadmill, lift weights, or stretch it out on the mats makes all the difference during these long, cold winter days.",date:"Mar 6, 2026",read:"1 min",cat:"Community",img:"images/gazette/post-7.jpg"},
 {title:"Did you know your name often has a special meaning or history behind it?",excerpt:"Some names come from nature, some from family traditions, and others from different cultures around the world.",date:"Mar 5, 2026",read:"1 min",cat:"Community",img:"images/gazette/post-8.jpg"},
 {title:"March 2026 Photo Contest – “Color in Motion”",excerpt:"March is here, and with it comes longer days, warmer temps (fingers crossed), and all the vibrant energy of early spring in Seldovia!",date:"Mar 5, 2026",read:"1 min",cat:"Events",img:"images/gazette/post-9.jpg"}
];
const GALLERY=[{h:240,cap:"Morning fog over the harbor"},{h:320,cap:"Boardwalk homes at high tide"},{h:200,cap:"Floatplane off the bay"},{h:300,cap:"Salmonberries on the Otterbahn"},{h:220,cap:"Sea otters near the breakwater"},{h:280,cap:"Fireweed and the far range"},{h:210,cap:"Fresh halibut on the dock"},{h:300,cap:"Midnight-gold summer light"},{h:230,cap:"Kayaks on a glassy morning"}];
const EVENTS=[{d:"2026-07-15",t:"09:00",title:"Farmers & Makers Market",where:"Seldovia Bay Pavilion",cat:"Market",dur:"til 1 PM"},{d:"2026-07-15",t:"18:30",title:"Open Mic on the Boardwalk",where:"Linwood Bar & Grill",cat:"Music",dur:"til late"},{d:"2026-07-17",t:"10:00",title:"Otterbahn Trail Cleanup",where:"Trailhead by the school",cat:"Volunteer",dur:"2 hrs"},{d:"2026-07-18",t:"08:00",title:"Halibut Derby — Weigh-in",where:"City Dock",cat:"Fishing",dur:"daily"},{d:"2026-07-19",t:"19:00",title:"Community Potluck & Bonfire",where:"Outside Beach",cat:"Community",dur:"til dusk"},{d:"2026-07-21",t:"17:30",title:"City Council Meeting",where:"Seldovia City Hall",cat:"Civic",dur:"1.5 hrs"},{d:"2026-07-22",t:"11:00",title:"Kids' Tide-Pool Walk",where:"Outside Beach",cat:"Family",dur:"90 min"},{d:"2026-07-24",t:"18:00",title:"Gallery Night — Local Artists",where:"Seldovia Arts Council",cat:"Arts",dur:"til 9 PM"},{d:"2026-07-26",t:"09:30",title:"Sunday Kayak Paddle",where:"Small-Boat Harbor",cat:"Outdoors",dur:"3 hrs"},{d:"2026-07-28",t:"12:00",title:"Senior Lunch & Cards",where:"SVT Community Room",cat:"Community",dur:"2 hrs"},{d:"2026-07-31",t:"18:00",title:"End-of-Month Fish Fry",where:"Harbor Pavilion",cat:"Food",dur:"til 8 PM"},{d:"2026-08-01",t:"09:00",title:"Farmers & Makers Market",where:"Seldovia Bay Pavilion",cat:"Market",dur:"til 1 PM"}];
// Jenny's active listings (real). Photos live in images/listings/ (optimized).
const LISTINGS=[
 {addr:"230 Kachemak St", price:"$475,000", beds:"3", baths:"1.5", sqft:"1,122", status:"For Sale", img:"images/listings/230-kachemak-st.jpg"},
 {addr:"195 Lookout Aly", price:"$345,000", beds:"2", baths:"1.5", sqft:"1,376", status:"For Sale", img:"images/listings/195-lookout-aly.jpg"},
 {addr:"3108 Jakolof Bay Rd", price:"$219,900", beds:"1", baths:"1", sqft:"768", status:"For Sale", img:"images/listings/3108-jakolof-bay-rd.jpg"}
];
// Community members — opt-in, privacy-first: each person shares only what they want,
// so fields are intentionally uneven. PROD: populated from approved Netlify Form submissions.
const MEMBERS=[
 {name:"The Chissus Family",addr:"Main Street",phone:"(907) 555-0148",bday:"",anniv:"Jun 14",photo:"",featured:true},
 {name:"Mara & Jo Hendrickson",addr:"Boardwalk",phone:"",bday:"Mar 3",anniv:"Aug 22",photo:""},
 {name:"Tom Reyes",addr:"",phone:"(907) 555-0163",bday:"Nov 9",anniv:"",photo:""},
 {name:"Susan English",addr:"Winifred Ave",phone:"",bday:"",anniv:"",photo:""},
 {name:"D. Whitfield",addr:"",phone:"(907) 555-0129",bday:"Jul 30",anniv:"",photo:""},
 {name:"The Hansen Household",addr:"Jakolof Bay Rd",phone:"(907) 555-0175",bday:"",anniv:"Sep 5",photo:""}
];
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
// Category tiles use hand-verified tag+lock pairs (specific-concept flickr tags
// are unreliable, so each was previewed and locked to a good image).
const CAT_TAGS=[{t:"log-cabin,alaska",l:1},{t:"seafood,dinner,plate",l:3},{t:"fishing-boat,harbor",l:1},{t:"latte,coffee",l:2},{t:"mural,streetart",l:1},{t:"mountains,hiking",l:1},{t:"spa,wellness",l:1},{t:"fireworks,night",l:2}];
const GAL_TAGS=["harbor,fog,alaska","boardwalk,coast,alaska","seaplane,bay,alaska","berries,forest,trail","otter,sea,wildlife","wildflowers,mountains,alaska","fishing,dock,harbor","sunset,coast,alaska","kayak,water,alaska"];

// Seldovia essentials strip — PROD: replace sample values with live feeds
// (AMHS ferry, NOAA tide station, NWS marine/weather, harbor webcams).
if($("#essentials")){
  const I={
    ferry:'<path d="M3 17c1.5 1 3 1 4.5 0S10.5 16 12 17s3 1 4.5 0S19.5 16 21 17"/><path d="M4 14l1-4h14l1 4"/><path d="M12 6V4M8 10V7h8v3"/>',
    tide:'<path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M12 3v5"/>',
    marine:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  const svg=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const cards=[
    {k:"Ferry",v:"3:15 PM",s:"Next sailing · Homer ⇄ Seldovia",ic:I.ferry,href:"calendar.html"},
    {k:"Tides",v:"High 14.2 ft",s:"2:40 PM · Low 1.1 ft 8:55 PM",ic:I.tide},
    {k:"Marine & weather",v:"54°F",s:"Wind 8 kt SW · Seas 1 ft · Clear",ic:I.marine},
    {k:"Local time",v:'<span id="akClock">—</span>',s:"Seldovia, Alaska",ic:I.clock}
  ];
  $("#essentials").innerHTML=cards.map(c=>{const inner=`<span class="es-ico">${svg(c.ic)}</span><span class="es-txt"><span class="es-k">${esc(c.k)}</span><span class="es-v">${c.v}</span><span class="es-s">${esc(c.s)}</span></span>`;
    return c.href?`<a class="es-card" href="${c.href}">${inner}</a>`:`<div class="es-card">${inner}</div>`;}).join("");
  const tick=()=>{const el=$("#akClock"); if(!el)return; try{el.textContent=new Date().toLocaleTimeString('en-US',{timeZone:'America/Anchorage',hour:'numeric',minute:'2-digit'});}catch(e){el.textContent=new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});}};
  tick(); setInterval(tick,15000);
}

// hero quick-cats
if($("#quickcats")) $("#quickcats").innerHTML=[["Restaurants","dining"],["Lodging","lodging"],["Charters","charters"],["Trails","outdoors"],["Arts","arts"],["Events","events"]].map(([label,key])=>
  `<a class="quickcat" href="explore.html?cat=${key}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>${esc(label)}</a>`).join("");

// category tiles
if($("#catGrid")) $("#catGrid").innerHTML=CATEGORIES.map((c,i)=>{
  const ct=CAT_TAGS[i]||{t:"coast,alaska,nature",l:i+1};
  const img=flickr(600,600,ct.t,ct.l);
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
// Gazette — real recovered posts with their own optimized images.
if($("#gazetteGrid")) $("#gazetteGrid").innerHTML=GAZETTE.map((g,i)=>{
  return `<a class="post" href="gazette.html"><div class="post-media"><img class="post-photo" src="${g.img}" alt="${esc(g.title)}" loading="lazy" width="880" height="550"></div>
    <div class="post-body"><span class="kicker">${esc(g.cat)}</span><h4>${esc(g.title)}</h4><p>${esc(g.excerpt)}</p>
    <div class="post-meta"><span>${esc(g.date)}</span><span>·</span><span>${esc(g.read)} read</span></div></div></a>`;}).join("");

// gallery
if($("#masonry")) $("#masonry").innerHTML=GALLERY.map((im,i)=>{
  const img=`<img src="${flickr(300,im.h,GAL_TAGS[i%GAL_TAGS.length],i+1)}" alt="${esc(im.cap)}" loading="lazy" width="300" height="${im.h}">`;
  return `<figure tabindex="0">${img}<figcaption>${esc(im.cap)}</figcaption></figure>`;}).join("");

// real estate listings
if($("#reGrid")) $("#reGrid").innerHTML=LISTINGS.map((l,i)=>`
  <a class="place" href="real-estate.html"><div class="place-media"><img class="place-photo" src="${l.img}" alt="${esc(l.addr)}" loading="lazy" width="600" height="400" onerror="this.closest('.place-media').classList.add('place-media-blank');this.remove()"><span class="badge-open">${esc(l.status)}</span></div>
  <div class="place-body">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.6rem"><span class="price" style="font-size:1.15rem">${esc(l.price)}</span><span style="font-size:.82rem;color:var(--accent-ink);font-weight:700">Details →</span></div>
    <h4>${esc(l.addr)}</h4>
    <div class="place-loc" style="gap:1rem"><span><b style="color:var(--heading)">${esc(l.beds)}</b> bd</span><span><b style="color:var(--heading)">${esc(l.baths)}</b> ba</span><span><b style="color:var(--heading)">${esc(l.sqft)}</b> sqft</span></div>
  </div></a>`).join("");

// directory / phone book — community members + businesses, privacy-first
if($("#dirList")){
  const PEOPLE=MEMBERS.map(m=>({...m,type:"person"}));
  const BIZ=DIRECTORY.map(d=>({...d,type:"biz"}));
  const ALL=[...PEOPLE,...BIZ];
  const bizCats=[...new Set(DIRECTORY.map(d=>d.cat))];
  const CHIPS=["All","People","Businesses",...bizCats];
  let dirCat="All", dirQuery="";
  $("#dirChips").innerHTML=CHIPS.map((c,i)=>`<button class="chip" aria-pressed="${i===0}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");

  const avatar=r=>r.photo?`<img class="d-photo" src="${r.photo}" alt="${esc(r.name)}" loading="lazy">`:`<div class="d-ico">${esc(r.name[0])}</div>`;
  const celebrations=r=>{const b=[]; if(r.bday)b.push(`<span class="cel">🎂 ${esc(r.bday)}</span>`); if(r.anniv)b.push(`<span class="cel">💍 ${esc(r.anniv)}</span>`); return b.length?`<div class="d-cel">${b.join("")}</div>`:"";};
  const personCard=p=>{const feat=p.featured?'featured':''; const bits=[]; if(p.addr)bits.push(esc(p.addr)); if(p.phone)bits.push(esc(p.phone));
    return `<div class="dir-item person ${feat}">${avatar(p)}
      <div class="d-main"><div class="d-cat">Neighbor</div><h4>${esc(p.name)}</h4>
      ${bits.length?`<div class="d-contact">${bits.join(" · ")}</div>`:'<div class="d-contact d-muted">Listed — details private</div>'}
      ${celebrations(p)}</div>
      ${p.featured?'<span class="spon-flag">★ Featured</span>':''}</div>`;};
  const bizCard=d=>`<div class="dir-item ${d.spon?'featured':''}"><div class="d-ico">${esc(d.name[0])}</div>
      <div class="d-main"><div class="d-cat">${esc(d.cat)}</div><h4>${esc(d.name)}</h4><div class="d-contact">${esc(d.phone)} · Seldovia, AK</div></div>
      ${d.spon?'<span class="spon-flag">★ Sponsor</span>':''}</div>`;

  const renderDir=()=>{const q=dirQuery.trim().toLowerCase();
    const rows=ALL.filter(r=>{
      const inCat = dirCat==="All" || (dirCat==="People"&&r.type==="person") || (dirCat==="Businesses"&&r.type==="biz") || (r.type==="biz"&&r.cat===dirCat);
      const inQ = !q || r.name.toLowerCase().includes(q) || (r.cat||"").toLowerCase().includes(q) || (r.addr||"").toLowerCase().includes(q);
      return inCat && inQ;
    });
    $("#dirList").innerHTML=rows.length?rows.map(r=>r.type==="person"?personCard(r):bizCard(r)).join(""):`<div class="dir-empty">No matches — try another word or category.</div>`;};
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
