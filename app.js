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

/* ============================================================ PWA + cache
   Service worker REMOVED for now — its caching kept serving stale files
   during active development. Unregister any existing worker and clear its
   caches so every visit loads fresh from the network. (We can re-add a
   well-behaved SW before launch for offline/installable.) ============ */
(function(){
  const head=document.head;
  const add=(rel,href)=>{const l=document.createElement("link"); l.rel=rel; l.href=href; head.appendChild(l);};
  if(!document.querySelector('link[rel="manifest"]')) add("manifest","manifest.json?v=2");
  add("apple-touch-icon","images/icon-180.png?v=2");
  add("icon","images/favicon-64.png?v=2");
  if("serviceWorker" in navigator){
    navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
    if(window.caches) caches.keys().then(ks=>ks.forEach(k=>caches.delete(k))).catch(()=>{});
  }
})();

/* Graceful image fallback: if any image fails to load (e.g. a flaky external
   placeholder service), hide it and show a soft wash instead of a broken icon. */
window.addEventListener("error", e=>{
  const t=e.target;
  if(t && t.tagName==="IMG"){ t.style.display="none"; const p=t.closest(".cat-tile,.place-media,.post-media,.gallery-photo,figure")||t.parentElement; if(p) p.classList.add("img-fallback"); }
}, true);

/* ============================================================ SHARED CHROME (header / drawer / footer) ============================================================ */
const NAV=[
  ["explore.html","Explore","explore"],
  ["calendar.html","Calendar","calendar"],
  ["gazette.html","Seldovia Blog","gazette"],
  ["webcams.html","Webcams","webcams"],
  ["gallery.html","Photos","gallery"],
  ["real-estate.html","Real Estate","realestate"],
  ["phone-book.html","Phone Book","phonebook"],
  ["contact.html","Contact","contact"],
];
// From the admin, open the public site in ONE reusable preview tab so the admin
// stays open and Jenny/Qwynny never have to back-arrow their way home (Qwynny).
const _preview = PAGE==="admin" ? ' target="seldoviaPreview" rel="noopener"' : '';
const navLinks=(cls="")=>NAV.map(([href,label,key])=>`<a class="${cls} ${key===PAGE?'active':''}"${_preview} href="${href}">${label}</a>`).join("");

const HEADER=`
<header class="masthead">
  <div class="masthead-inner">
    <a class="brand" href="index.html"${_preview} aria-label="Seldovia.com home">
      <img class="brand-logo" src="images/logo-header.png" alt="Seldovia.com — Alaska's Best Kept Secret" width="620" height="413">
    </a>
    <nav class="mainnav" aria-label="Primary">${navLinks()}</nav>
    <div class="head-actions">
      <div class="navsearch" role="search">
        <span class="s-icon" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span>
        <input type="search" id="navSearch" placeholder="Search…" aria-label="Search the whole site" autocomplete="off">
        <div class="results" id="navResults" role="listbox" style="left:0; right:0; top:calc(100% + 8px);"></div>
      </div>
      <button class="icon-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-scrim" data-close></div>
  <nav class="drawer-panel" aria-label="Mobile">
    <a class="${PAGE==='home'?'active':''}"${_preview} href="index.html" data-close>Home</a>
    ${navLinks("").replace(/<a /g,'<a data-close ')}
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
      <div class="foot-col"><h4>Explore</h4><ul><li><a href="explore.html">Directory</a></li><li><a href="gazette.html">Seldovia Blog</a></li><li><a href="gallery.html">Photos</a></li><li><a href="calendar.html">Calendar</a></li></ul></div>
      <div class="foot-col"><h4>Community</h4><ul><li><a href="phone-book.html">Phone Book</a></li><li><a href="index.html#sponsors">Sponsors</a></li><li><a href="contact.html">Contact</a></li></ul></div>
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
// From the admin, every link to the public site opens the ONE reusable preview
// tab, so the admin stays put and you never back-arrow home (Qwynny).
if(PAGE==="admin") document.querySelectorAll('a[href]').forEach(a=>{ const h=a.getAttribute("href")||"";
  if(/\.html($|[?#])/.test(h) && !/^https?:/.test(h) && !h.startsWith("admin") && !a.target){ a.target="seldoviaPreview"; a.rel="noopener"; } });

/* Watercolor filter — displaces shape edges into organic, bleeding washes.
   Used by .splash-wrap/.wc-splash decorations (community pages). */
document.body.insertAdjacentHTML("beforeend", `
<svg class="wc-defs" aria-hidden="true" focusable="false" width="0" height="0">
  <filter id="wcEdge" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.014 0.021" numOctaves="4" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/>
    <feGaussianBlur stdDeviation="3"/>
  </filter>
  <filter id="wcEdgeSm" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="3" result="n2"/>
    <feDisplacementMap in="SourceGraphic" in2="n2" scale="9" xChannelSelector="R" yChannelSelector="G"/>
    <feGaussianBlur stdDeviation="1"/>
  </filter>
</svg>`);

/* ============================================================ MOCK DATA ============================================================ */
// 8 home categories (Jenny's groupings). Order maps to images/categories/cat-0..7.jpg.
const CATEGORIES=[{b:"About",s:"Location & history",key:"about"},{b:"Travel",s:"Getting to Seldovia",key:"travel"},{b:"Lodging + Camping",s:"Places to stay",key:"stay"},{b:"Eat",s:"Restaurants, bar & stores",key:"eat"},{b:"Shop + Gifts",s:"Shops, gifts & nursery",key:"shop"},{b:"Activities",s:"Tours, charters & trails",key:"activities"},{b:"Businesses",s:"Local trades & services",key:"services"},{b:"Organizations",s:"Public & Govt.",key:"life"}];
// REAL Seldovia places — sourced from the existing seldovia.com business directory.
// No star ratings or review counts: we don't have real review data, so we don't invent it.
// Explore directory — all Seldovia businesses, grouped into the 8 categories (key).
const PLACES=[
 // Travel
 {name:"Alaska Marine Highway System",cat:"Ferry",key:"travel",phone:"(800) 642-0066"},
 {name:"Smokey Bay Air",cat:"Air Taxi",key:"travel",phone:"(907) 531-0602",url:"https://www.SmokeyBayAir.com"},
 {name:"Mako's Water Taxi",cat:"Water Taxi",key:"travel",phone:"(907) 235-9055",url:"https://www.makoswatertaxi.com"},
 {name:"Halo Cab",cat:"Taxi",key:"travel",phone:"(907) 205-7828"},
 {name:"Kar-a-Van Transfer",cat:"Transfer",key:"travel",phone:"(907) 234-7802"},
 // Stay
 {name:"Boardwalk Hotel",cat:"Hotel",key:"stay",phone:"(907) 234-7816",url:"https://www.SeldoviaHotel.com"},
 {name:"Sea Parrot Inn",cat:"Inn",key:"stay",phone:"(844) 377-7829",url:"https://www.seaparrotinn.com"},
 {name:"Seldovia Suites",cat:"Suites",key:"stay",phone:"(907) 234-3700"},
 {name:"Seldovia Harbor Inn",cat:"Inn",key:"stay",phone:"(907) 202-3095"},
 {name:"Between Beaches",cat:"Lodging",key:"stay",phone:"(907) 290-6785",url:"https://betweenbeachesalaska.com"},
 {name:"Alaska Dancing Eagles Cabin Rental",cat:"Cabin Rental",key:"stay",phone:"(907) 360-6363",url:"https://www.dancingeagles.com"},
 {name:"Asta Waterfront Suite",cat:"Suite",key:"stay",phone:"(907) 231-6522"},
 {name:"Aero Tech Lodge",cat:"Lodge",key:"stay",phone:"(907) 234-6200"},
 {name:"The Great Escape — Alaskan Vacation Rentals",cat:"Vacation Rentals",key:"stay",url:"https://www.greatescapealaska.com"},
 // Eat
 {name:"Jack and Aiva's Restaurant",cat:"Restaurant",key:"eat",phone:"(907) 234-7440"},
 {name:"Thyme on the Boardwalk",cat:"Gift Shop & Nursery",key:"shop",phone:"(907) 440-2213",url:"https://www.ThymeOnTheBoardwalk.com"},
 {name:"Linwood Bar & Grill",cat:"Bar & Grill",key:"eat",phone:"(907) 630-0573"},
 // Shop
 {name:"Crabpot Grocery",cat:"Grocery",key:"shop",phone:"(907) 234-7435"},
 {name:"Seldovia Sea Glass",cat:"Gifts & Art",key:"shop"},
 // Activities
 {name:"Alaska Free Diver",cat:"Diving & Tours",key:"activities",phone:"(907) 205-7963",url:"https://www.AlaskaFreeDiver.com"},
 {name:"Seldovia Fishing Adventures",cat:"Fishing Charters",key:"activities",phone:"(907) 234-7417",url:"https://www.fishhalibut.com"},
 {name:"Seldovia Outdoor Rentals & Gifts",cat:"Rentals & Gifts",key:"activities",phone:"(907) 302-0320",url:"https://seldovia.fun"},
 {name:"Otterbahn Trail",cat:"Trail",key:"activities"},
 {name:"Outside Beach Park",cat:"Beach & Park",key:"activities"},
 // Services
 {name:"Fathoms Hair & Nail Salon",cat:"Salon",key:"shop",phone:"(907) 726-7255"},
  {name:"Seldovia Fuel and Hardware",cat:"Fuel & Hardware",key:"services",phone:"(907) 234-7622"},
 {name:"Seldovia Property",cat:"Real Estate",key:"services",phone:"(907) 234-8000",url:"https://www.SeldoviaProperty.com"},
 {name:"Winter Watch",cat:"Property Care",key:"services",phone:"(907) 406-0775",url:"https://www.SeldoviaWinterWatch.com"},
 // Life in Seldovia
 {name:"City of Seldovia",cat:"City Government",key:"life",phone:"(907) 234-7643"},
 {name:"Seldovia Village Tribe",cat:"Tribe",key:"life",phone:"(907) 234-7898"},
 {name:"Seldovia Native Association",cat:"Native Association",key:"life",phone:"(907) 234-7625"},
 {name:"Seldovia Chamber of Commerce",cat:"Chamber of Commerce",key:"life",phone:"(907) 234-7612"},
 {name:"Seldovia Health and Wellness",cat:"Health & Wellness",key:"services",phone:"(907) 435-3262"},
 {name:"Seldovia Public Library",cat:"Library",key:"life",phone:"(907) 234-7662"},
 {name:"Susan B English School",cat:"School",key:"life",phone:"(907) 234-7616"},
 {name:"Seldovia Sea Otter Community Center",cat:"Community Center",key:"life",phone:"(907) 234-4110"},
 {name:"Seldovia Police Department",cat:"Police",key:"life",phone:"(907) 234-7640"},
 {name:"United States Post Office — Seldovia",cat:"Post Office",key:"life",phone:"(907) 234-7831"},
 // More real Seldovia businesses (from the current seldovia.com merchants list + Jenny's email)
 {name:"Rainbow Tours",cat:"Tours & Passenger Ferry",key:"travel",phone:"(907) 235-7272",url:"https://www.rainbowtours.net"},
 {name:"True North Air",cat:"Air Taxi",key:"travel",phone:"(907) 952-2726"},
 {name:"Seldovia Bay Ferry",cat:"Passenger Ferry",key:"travel",url:"https://seldoviabayferry.com"},
 {name:"Perley's Rides",cat:"Taxi & Truck Rental",key:"travel",phone:"(907) 299-8223"},
 {name:"Seldovia Nature Tours",cat:"Nature Tours",key:"activities",url:"https://www.seldovianaturetours.com"},
 {name:"Rocky Ridge Trail",cat:"Trail",key:"activities"},
 {name:"Tutka Bay Lagoon Trail",cat:"Trail",key:"activities"},
 {name:"Graduation Peak Trail",cat:"Trail",key:"activities"},
 {name:"Seldovia Salmonberry",cat:"Local Art & Gifts",key:"shop",phone:"(907) 632-9314"},
 {name:"SVT Museum & Gift Shop",cat:"Museum & Gifts",key:"shop",phone:"(907) 234-7898",url:"https://svt.org"},
 {name:"Seldovia Liquor Store",cat:"Beverages & Gifts",key:"shop",phone:"(907) 202-1938"},
 {name:"Schooner Beach Studio",cat:"Cut-Paper Art",key:"shop",phone:"(541) 520-7331"},
 {name:"Make it Reality",cat:"3D Printing & Laser",key:"services",phone:"(414) 367-9570"},
 // Lodging + eateries added with Qwynny's Canva photos
 {name:"Herring Bay Lodge",cat:"Lodge",key:"stay"},
 {name:"Treehouse Cove Lodge",cat:"Lodge",key:"stay"},
 {name:"Breezy's by the Bay",cat:"Restaurant",key:"eat"},
 {name:"Alaska Grizzly Air B&B Rentals",cat:"B&B & Rentals",key:"stay"},
 {name:"House on the Rock B&B",cat:"Bed & Breakfast",key:"stay"},
 {name:"Thyme on the Boardwalk Waterfront Cottage",cat:"Waterfront Cottage",key:"stay"},
 {name:"Otter Cove Ice Cream at the Boardwalk Hotel",cat:"Ice Cream",key:"eat"},
 {name:"Eternal Buzz",cat:"Coffee & Treats",key:"eat"},
 // Out of Town — regional businesses & sponsors (Jenny #16)
 {name:"Alaska Bus Company",cat:"Bus & Charter",key:"outoftown"},
 {name:"Homer Sign Company",cat:"Signs & Printing",key:"outoftown"},
 {name:"Kenai Airport Inn",cat:"Lodging · Kenai",key:"outoftown"}
];
// Business photos from Qwynny's Canva set. Default shows the B&W version;
// <slug>-color.jpg is the color upgrade for sponsors (future admin swap).
const BIZ_IMG={
 "Smokey Bay Air":"smokey-bay-air","Halo Cab":"halo-cab","True North Air":"true-north-air","Perley's Rides":"perley-s-rides",
 "Sea Parrot Inn":"sea-parrot-inn","Seldovia Suites":"central-suites-of-seldovia-seldovia-suites","Seldovia Harbor Inn":"seldovia-harbor-inn",
 "Alaska Dancing Eagles Cabin Rental":"alaska-dancing-eagles-cabin-rental","Asta Waterfront Suite":"asta-waterfront-suite",
 "The Great Escape — Alaskan Vacation Rentals":"great-escape-alaska-vacation-rentals",
 "Jack and Aiva's Restaurant":"jack-aiva-s-restaurant","Thyme on the Boardwalk":"thyme-on-the-boardwalk","Linwood Bar & Grill":"linwood-bar-grill",
 "Crabpot Grocery":"crabpot-grocery","Seldovia Salmonberry":"seldovia-salmonberry","SVT Museum & Gift Shop":"svt-museum-gift-shop","Seldovia Liquor Store":"seldovia-liquor-store",
 "Alaska Free Diver":"alaska-freediver","Seldovia Fishing Adventures":"seldovia-fishing-adventures","Seldovia Outdoor Rentals & Gifts":"seldovia-outdoor-rentals",
 "Fathoms Hair & Nail Salon":"fathoms-hair-salon","Seldovia Fuel and Hardware":"seldovia-fuel-and-hardware","Winter Watch":"winter-watch","Make it Reality":"make-it-reality",
 "Seldovia Public Library":"seldovia-public-library",
 "Herring Bay Lodge":"herring-bay-lodge","Treehouse Cove Lodge":"treehouse-cove-lodge","Breezy's by the Bay":"breezy-s-by-the-bay",
 "Alaska Grizzly Air B&B Rentals":"alaska-grizzly-air-b-b-rentals","House on the Rock B&B":"seldovia-fishing-adventures-house-on-the-rock-b-b",
 "Thyme on the Boardwalk Waterfront Cottage":"thyme-on-the-boardwalk-waterfront-cottage",
 "Otter Cove Ice Cream at the Boardwalk Hotel":"otter-cove-ice-cream-at-the-boardwalk-hotel","Eternal Buzz":"eternal-buzz"
};
// Jenny's own uploaded business photos (admin -> settings.explore_photos), name -> url. Wins over the built-in image.
const EXPLORE_PHOTOS={};
const bizPhoto=(p,color)=>{ if(EXPLORE_PHOTOS[p.name]) return EXPLORE_PHOTOS[p.name]; const s=BIZ_IMG[p.name]; return s?`images/businesses/${s}-${color?"color":"bw"}.jpg`:(p.img||"images/placeholder-business.png"); };
// Category letter badge (top-right of each Explore card), per Jenny's key:
// L Lodging, T Travel, B Business, E Eat, S Shops, A Activity, O Organization, G Government
const CAT_BADGE={travel:"T",stay:"L",eat:"E",shop:"S",activities:"A",services:"B",life:"O",about:""};
const BADGE_LABEL={L:"Lodging",T:"Travel",B:"Business",E:"Eat",S:"Shops",A:"Activity",O:"Organization",G:"Government"};
const GOVT_BIZ=new Set(["City of Seldovia","Seldovia Police Department","United States Post Office — Seldovia","Susan B English School"]);
// p._govt (set by an admin override) wins; otherwise fall back to the GOVT_BIZ list.
const placeBadge=p=>{ let b=CAT_BADGE[p.key]||""; if(p.key==="life"){ const g=(p._govt!==undefined)?p._govt:GOVT_BIZ.has(p.name); if(g) b="G"; } return b; };
// Category tokens Jenny can pick from in the admin ("🏷️ Explore Categories").
// Government is a flavor of "life" (Public Services) that shows a G badge.
const EXPLORE_CATS=[
  {token:"about",     label:"Location + History",              key:"about",      govt:false},
  {token:"travel",    label:"Travel",                          key:"travel",     govt:false},
  {token:"stay",      label:"Lodging + Camping",               key:"stay",       govt:false},
  {token:"eat",       label:"Eat",                             key:"eat",        govt:false},
  {token:"shop",      label:"Shop + Gifts",                    key:"shop",       govt:false},
  {token:"activities",label:"Activities",                      key:"activities", govt:false},
  {token:"services",  label:"Services / Business",             key:"services",   govt:false},
  {token:"life",      label:"Organization + Public Services",  key:"life",       govt:false},
  {token:"govt",      label:"Government",                       key:"life",       govt:true},
];
const CAT_BY_TOKEN=Object.fromEntries(EXPLORE_CATS.map(c=>[c.token,c]));
// The business's category token from the built-in data (before any admin override).
function baseToken(p){ return p.key==="life" ? (GOVT_BIZ.has(p.name)?"govt":"life") : p.key; }
// Apply Jenny's saved overrides ({ "<business name>": "<token>" }) onto PLACES.
function applyExploreOverrides(map){
  if(!map) return;
  PLACES.forEach(p=>{ const t=map[p.name], c=t&&CAT_BY_TOKEN[t]; if(c){ p.key=c.key; p._govt=c.govt; } });
}
// Exposed so the admin panel can list businesses and edit their categories.
window.EXPLORE={ get PLACES(){return PLACES;}, EXPLORE_CATS, CAT_BY_TOKEN, baseToken, bizPhoto };
// Jenny's Seldovia Blog — recovered posts (original titles, dates, images preserved). PROD: managed via admin.
const GAZETTE=[
 {title:"Thank you, Jennifer!",excerpt:"Jennifer, thank you so much for your kind words! It makes me so happy to hear how pleased you are with your Seldovia investment and my service.",date:"Jul 17, 2026",read:"1 min",cat:"Kind Words",img:"images/gazette/2026-07-17.jpg",body:`Jennifer, thank you so much for your kind words! It makes me so happy to hear how pleased you are with your Seldovia investment and my service.

Your thoughtful review truly means a lot to me. It is nice getting to know you better with each visit, and I loved sharing coffee together on the boat that morning. Looking forward to seeing your Seldovia getaway come to life! I think a picnic on your beach is definitely in order when you're back this summer! See you both soon!`},
 {title:"Three incredible Seldovia opportunities",excerpt:"Whether you envision a charming boutique, a thriving Bed & Breakfast, a waterfront café, or a one-of-a-kind investment property, these three incredible listings offer endless possibilities in the heart of Seldovia.",date:"Jul 16, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-07-16.jpg",body:`Whether you envision a charming boutique, a thriving Bed & Breakfast, a waterfront café, or a one-of-a-kind investment property, these three incredible listings offer endless possibilities in the heart of Seldovia.

📍 251 Main Street
🌅 Harborfront commercial space
🏠 2-bedroom home + 1-bedroom apartment
🛍️ Main Street storefront
🚗 Garage/shop
🌿 Seldovia's only large waterfront lawn

📍 175 Augustine North Avenue
🌊 Nearly 90 feet of waterfront
🛏️ 7 bedrooms | 6 bathrooms
🏡 Turnkey Bed & Breakfast
🚤 Waterfront guest cabin
🌱 Greenhouse, smokehouse & oversized garage/shop

📍 230 Kachemak Street
🌊 Iconic historic waterfront property
🏡 Waterfront Commercial Residential zoning
📏 Approximately 0.20 acres—nearly 4× the size of many neighboring waterfront lots
🌅 Expansive waterfront deck overlooking the slough
✨ A rare opportunity to own and preserve a piece of Seldovia's history

From breathtaking views and walkable downtown locations to established income potential, these properties are ready for your next adventure.

✨ Live where you work. Build your dream. Experience the best of coastal Alaska.

📩 Ready to learn more or schedule a showing? Contact Jenny today and discover which opportunity is the perfect fit for your future!`},
 {title:"230 Kachemak Street — a historic waterfront legacy",excerpt:"One of Seldovia's iconic historic waterfront properties — approximately 0.20 acres, nearly 4× larger than many neighboring waterfront lots.",date:"Jul 15, 2026",read:"1 min",cat:"Real Estate",img:"images/listings/230-kachemak-st/230-kachemak-st.jpg",body:`📍 230 Kachemak Street, Seldovia, AK 99663
🏡 One of Seldovia's iconic historic waterfront properties
🌊 Approximately 0.20 acres—nearly 4× larger than many neighboring waterfront lots
📍 Prime location along Seldovia's iconic waterfront
🏠 Waterfront Commercial Residential zoning with endless possibilities
🛏️ Main-floor bedrooms with beautiful sunrise views over the slough
🛌 Private upstairs guest retreat with separate exterior entrance
🏡 Additional unfinished attic sleeping space full of rustic charm
🍽️ Spacious kitchen with two refrigerators—perfect for gathering family & friends
🌅 400+ sq. ft. waterfront deck overlooking the slough
🦅 Watch salmon, eagles, boats, kayakers & fishermen from your own deck
🏪 Ideal for a private residence, guest accommodations, gallery, boutique, studio, or mixed-use business
✨ Rich in Seldovia history with incredible potential to preserve a local landmark
❤️ A rare chance to own a truly one-of-a-kind waterfront legacy property

📞 Call Jenny Chissus with Seldovia Property at (907) 406-0044`},
 {title:"195 Lookout Aly — sunny corner lot with slough & harbor views",excerpt:"A charming 1,376 sq. ft. Lindal Cedar Home on a sunny corner lot overlooking Seldovia Slough, Main Street & the harbor beyond.",date:"Jul 14, 2026",read:"1 min",cat:"Real Estate",img:"images/listings/195-lookout-aly/195-lookout-aly.jpg",body:`📍 195 Lookout Aly, Seldovia, AK 99663
☀️ Sunny corner lot with slough & harbor views
🌊 Overlooks Seldovia Slough, Main Street & the harbor beyond
🏡 Charming 1,376 sq. ft. Lindal Cedar Home
🛏️ 2 bedrooms | 1.5 bathrooms
♿ Accessible entry ramps & easy home access
🌿 Established salmonberry & raspberry gardens
🌅 Sunny decks on both sides of the home
🌲 Mature trees & peaceful surroundings
🛠️ 554 sq. ft. rustic workshop for projects, hobbies & storage
🚶 Walkable location near harbor, shops, restaurants & community amenities
✨ Comfortable Seldovia living with beautiful views and small-town charm

📞 Call Jenny Chissus with Seldovia Property at (907) 406-0044`},
 {title:"Under Contract! 321 Eagle Run Loop",excerpt:"This beautiful, spacious home in the heart of Seldovia is officially pending! Congratulations to the seller and the buyers on reaching this exciting milestone.",date:"Jul 13, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-07-13.jpg",body:`Under Contract!

This beautiful, spacious home in the heart of Seldovia is officially pending! Congratulations to the seller and the buyers on reaching this exciting milestone. 😊🙏`},
 {title:"The Alaska town that proves you don't need much to live well",excerpt:"In today's fast-paced world, it's easy to believe that a good life requires more. But what if the secret to living well isn't having more?",date:"Jul 12, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-07-12.jpg",body:`In today's fast-paced world, it's easy to believe that a good life requires more. More space, more possessions, more appointments, and more things competing for our attention.

But what if the secret to living well isn't having more?

What if it's needing less?`},
 {title:"Before you dream of moving to Seldovia, read this",excerpt:"Moving to Seldovia isn't just about changing your address, it's about choosing a different way of life. Before you make that decision, ask yourself these questions.",date:"Jul 11, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-07-11.jpg",body:`Moving to Seldovia isn't just about changing your address, it's about choosing a different way of life.

Before you make that decision, ask yourself these questions.

💗 Can you trade convenience for peace and quiet?
💗 Can you plan ahead instead of making last-minute trips?
💗 Can you embrace a slower pace?
💗 Can you handle the unexpected?
💗 Can you find entertainment outdoors?
💗 Can you become part of a close-knit community?
💗 Can you appreciate all four seasons?
💗 Can you live with less and enjoy life more?
💗 Can you picture yourself calling Seldovia home?

If these questions excite you more than they worry you, Seldovia might be exactly what you've been searching for.

Because moving here isn't just about finding a new home. It's about discovering a lifestyle that's unlike anywhere else.`},
 {title:"You don't retire TO Seldovia. You come alive here.",excerpt:"What if retirement wasn't about doing less but living more? One of the greatest gifts of retirement is having time — and in Seldovia, that time can be spent doing what truly brings you joy.",date:"Jul 10, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-07-10.jpg",body:`What if retirement wasn't about doing less but living more?

One of the greatest gifts of retirement is having time. In Seldovia, that time can be spent doing what truly brings you joy.

Many residents spend their days fishing for halibut and salmon, exploring nearby beaches and friends by boat, berry picking in the summer, gardening, creating art, volunteering, or taking in unforgettable sunsets. Others enjoy traveling to nearby communities while always looking forward to returning home.

Retirement here isn't the end of the journey, it's the beginning of your greatest adventure. 😊💕`},
 {title:"Happy Fourth of July — 250 years of freedom",excerpt:"Today marks 250 years of celebrating the ideals of freedom, independence, and the enduring spirit that unites communities across the nation.",date:"Jul 4, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-07-04.jpg",body:`Today marks 250 years of celebrating the ideals of freedom, independence, and the enduring spirit that unites communities across the nation. As we gather with family, friends, and neighbors, may we take a moment to appreciate the people, places, and traditions that make this day so meaningful.

From all of us, we wish you a safe, happy, and memorable Independence Day filled with laughter, celebration, and spectacular fireworks. Happy Fourth of July!`},
 {title:"New listing: 3108 Jakolof Bay Road",excerpt:"A cozy open-concept cabin on 3 private acres overlooking the Barbara Creek area, with breathtaking views of Kachemak Bay, the Homer Spit & the lights of Homer.",date:"Jul 3, 2026",read:"1 min",cat:"Real Estate",img:"images/listings/3108-jakolof-bay-rd/3108-jakolof-bay-rd.jpg",body:`📍 3108 Jakolof Bay Road, Seldovia, AK 99663
🌲 Cozy open-concept cabin on 3 private acres
🌅 Overlooks the Barbara Creek area with breathtaking views of Kachemak Bay, the Homer Spit & the lights of Homer
🛏️ Loft bedroom with living area, new kitchen & bathroom below
🍳 Bright, updated kitchen with open living space
🔥 Brand-new Toyo stove & beautiful Italian tile hearth
🎨 Freshly painted and move-in ready
🌲 Recent tree clearing for even more sunshine & expanded views
🛠️ Heated 448 sq. ft. shop/garage for vehicles, projects & Alaska gear
🧰 Insulated wired outbuilding—ideal for a workshop, bunkhouse, studio or storage
💧 Water catchment system with insulated tank beneath the cabin
🪵 Over 4 cords of cut, split & stacked firewood included
🚽 Even the outhouse comes with a view! 😍
🌿 Peaceful, private Alaska retreat with room to relax, garden & explore

📞 Call Jenny Chissus with Seldovia Property at (907) 406-0044`},
 {title:"A coastal town that never looks the same twice",excerpt:"In Seldovia, Alaska, there's a familiar feeling you can't quite put into words — you think you know a place, and then it quietly changes on you.",date:"Jul 3, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-07-03_01.jpg",body:`In Seldovia, Alaska, there's a familiar feeling you can't quite put into words, you think you know a place, and then it quietly changes on you.

Even the same walk down the street or dock never feels identical twice. The tide has shifted. The wind has changed direction. The light lands differently on the water. And somehow, that's enough to make it feel like a new place again. 🌱✨`},
 {title:"175 Augustine North Avenue — 3,500+ sq. ft. waterfront home + iconic waterfront cabin",excerpt:"Successful turnkey Bed & Breakfast with nearly 90 feet of waterfront on the Seldovia Slough.",date:"Jul 3, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-07-03_02.jpg",body:`📍 175 Augustine North Avenue, Seldovia, AK 99663
🏡 3,500+ sq. ft. waterfront home + iconic waterfront cabin
🛏️ 7 bedrooms | 🛁 6 bathrooms
🏨 Successful turnkey Bed & Breakfast
🌊 Nearly 90 feet of waterfront on the Seldovia Slough
🏔️ Incredible views of the slough, Seldovia Bay, mountains & sunsets
🚶 Easy walk to the harbor, Main Street, restaurants, shops & airport
🛖 Waterfront cabin built over the water with wraparound deck
🚣 Launch your kayak or paddleboard right from the beach below
🚗 Oversized two-car garage & shop with plenty of room for Alaska gear
🌿 Huge two-story greenhouse for flowers & vegetables
🔥 Smokehouse with hot & cold smokers and prep area
🚙 Large driveway with room for boats, trailers, RVs & guest parking
🐟 Dedicated fish processing room with workspace & freezers
🏘️ Waterfront Commercial Residential zoning with endless possibilities
🎨 Furniture, furnishings & much of the equipment included (excluding personal items & select artwork)
🌐 https://www.seldoviaproperty.com/
📞 Call Jenny with Seldovia Property: (907) 406-0044`},
 {title:"This charming cabin captured plenty of attention and hearts from the moment it hit the market!",excerpt:"After just 6 days, it's officially Pending! Congratulations to both the seller and the buyer!",date:"Jul 2, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-07-02_02.jpg",body:`This charming cabin captured plenty of attention and hearts from the moment it hit the market! 🏡✨

After just 6 days, it's officially Pending! Congratulations to both the seller and the buyer! 😊`},
 {title:"Most of my clients didn't start as buyers.",excerpt:"They started as visitors, across the bay for a boat ride, a fun concert, Festival or for the 4th of July, or to see friends…",date:"Jul 2, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-07-02_01.jpg",body:`Most of my clients didn't start as buyers.

They started as visitors, across the bay for a boat ride, a fun concert, Festival or for the 4th of July, or to see friends…

Just passing through, curious, they wanted to see what the place was about. And they went back home, back to their routine, back to everything that was waiting for them.

Then a few weeks later sometimes a month, sometimes longer, my phone lights up.

"I haven't been able to stop thinking about it. What's on the market in Seldovia?"

I. Smile. Every. Time.`},
 {title:"No roads in. No highway out. Just Kachemak Bay, the mountains, and a community of about 300 people who chose this place on purpose.",excerpt:"And that's the thing about Seldovia, nobody ends up here by accident.",date:"Jul 1, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-07-01.jpg",body:`No roads in. No highway out. Just Kachemak Bay, the mountains, and a community of about 300 people who chose this place on purpose.

And that's the thing about Seldovia, nobody ends up here by accident.

People find us, fall in love with the quiet, the eagles, the way neighbors actually show up for each other, and they start asking a question they never expected to ask:

What would it take to stay?

I get to answer that question for a living.

This town has a boardwalk with stories in every plank, and waters that have supported livelihoods and allowed recreational dreams to come true!

Kachemak Bay right at your doorstep. Dark winters that somehow bring people closer together instead of pushing them apart.

It's not the easiest life. But it might be the most meaningful one you'll ever choose.`},
 {title:"In Seldovia, Log Cabin Day fits right into the landscape and way of life.",excerpt:"Built from the land, shaped by hand, and made to last.",date:"Jun 28, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-06-28.jpg",body:`In Seldovia, Log Cabin Day fits right into the landscape and way of life.

Built from the land, shaped by hand, and made to last.

In a place like Seldovia, where forests meet the sea and nature sets the pace, the spirit of self-reliance and simplicity still makes sense.

Log Cabin Day isn't only about looking back. It's about appreciating a way of life that still feels close to home here in Alaska.

Quiet, grounded, and built with purpose, that's a story Seldovia understands well.`},
 {title:"351 Shoreline Drive — Pending",excerpt:"A 1 bedroom, 1 bath cottage with an east-facing bay window, copper sink, live-edge kitchen counters, and custom willow wood staircase railings.",date:"Jun 27, 2026",read:"1 min",cat:"Real Estate",img:"",body:`📍 351 Shoreline Drive, Seldovia, AK 99663
🛏️ 1 bedroom, 1 bath cottage
🌅 East-facing bay window with abundant natural light
📖 Cozy reading nook
🚰 Copper sink & handcrafted live-edge kitchen counters
🪵 Custom willow wood staircase railings
🛏️ Spacious upstairs bedroom with window seat & forest views
🌿 Landscaped yard with rhubarb, raspberries, salmonberries & strawberries
☀️ Sunny deck
🔧 Garden shed & additional lean-to storage with washer
🚗 Ample parking for vehicles, ATVs & a boat
💧 City water, sewer & HEA power
🚶 Walking distance to shops, restaurants, harbor, post office, school & airport
🌐 https://www.seldoviaproperty.com/
📞 Call Jenny with Seldovia Property (907) 406-0044`},
 {title:"In Seldovia, evenings like this are more than just entertainment, they're part of what makes the community feel like home.",excerpt:"BINGO at Linwood Bar & Grill is a simple, fun tradition where neighbors gather, conversations flow easily, and laughter fills the room.",date:"Jun 27, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-06-27.jpg",body:`In Seldovia, evenings like this are more than just entertainment, they're part of what makes the community feel like home.

BINGO at Linwood Bar & Grill is a simple, fun tradition where neighbors gather, conversations flow easily, and laughter fills the room. It's not about being the luckiest player in the room—it's about being together, sharing the moment, and enjoying a laid-back night out.  And, there are always cool prizes! 😀`},
 {title:"Love, Love, Love.",excerpt:"Every review someone takes the time to write is a gift, and I never take them for granted.",date:"Jun 26, 2026",read:"1 min",cat:"Kind Words",img:"images/gazette/2026-06-26.jpg",body:`Love, Love, Love.

Every review someone takes the time to write is a gift, and I never take them for granted.

I'm truly humbled by the kind words my clients share, but even more than the reviews themselves, I'm grateful for the people behind them. Helping folks sell their properties or assisting someone in finding their place in Seldovia is a responsibility I take seriously. There's nothing more rewarding than knowing they feel well cared for throughout the process.

To everyone who has trusted me, referred a friend, or taken a few minutes to leave a review…Thank you!! Your support means more than you know, and seeing happy clients enjoying their Seldovia dreams is the absolute very best part of what I do! ❤️`},
 {title:"Dreaming of waterfront living in Seldovia, Alaska?",excerpt:"Imagine waking up to the tide right outside your window, coffee in hand, with nothing but quiet water, mountain views, and fresh coastal air to start your day.",date:"Jun 25, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-06-25.jpg",body:`Dreaming of waterfront living in Seldovia, Alaska?

Imagine waking up to the tide right outside your window, coffee in hand, with nothing but quiet water, mountain views, and fresh coastal air to start your day.

Check in the comments to view these beautiful listings!`},
 {title:"If someone visited Seldovia for one view only, where would you take them?",excerpt:"If someone visited Seldovia for one view only, where would you take them?",date:"Jun 24, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-06-24.jpg",body:`If someone visited Seldovia for one view only, where would you take them?`},
 {title:"Ferry day! Hi there, Tusty",excerpt:"Ferry day! Hi there, Tusty",date:"Jun 23, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-06-23.jpg",body:`Ferry day! Hi there, Tusty 🚢👋`},
 {title:"Happy Father's Day from our little coastal corner of Alaska!",excerpt:"Where dads aren't just providers, they're storytellers, trail guides, fishermen, problem-solvers, and the calm in every storm.",date:"Jun 21, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-06-21.jpg",body:`Happy Father's Day from our little coastal corner of Alaska!

Where dads aren't just providers, they're storytellers, trail guides, fishermen, problem-solvers, and the calm in every storm.

Today, we celebrate the fathers of Seldovia and every corner of the world.

Happy Father's Day to all dads!`},
 {title:"American Eagle Day reminds us how special it is to share places like Seldovia with such incredible wildlife.",excerpt:"From soaring above the bay to resting along the shoreline, bald eagles are a powerful symbol of Alaska's wild beauty and freedom.",date:"Jun 20, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-06-20.jpg",body:`American Eagle Day reminds us how special it is to share places like Seldovia with such incredible wildlife. From soaring above the bay to resting along the shoreline, bald eagles are a powerful symbol of Alaska's wild beauty and freedom. 🦅🌊`},
 {title:"Just Sold!",excerpt:"Wishing both the sellers and the new owners all the best as this little piece of Seldovia begins its next chapter.",date:"Jun 19, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-06-19.jpg",body:`Just Sold! Wishing both the sellers and the new owners all the best as this little piece of Seldovia begins its next chapter. 🙏✨`},
 {title:"We've just recorded!",excerpt:"Big congratulations to both parties on a successful closing, and here's to what comes next for this incredible property!",date:"Jun 12, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-06-12.jpg",body:`We've just recorded! Big congratulations to both parties on a successful closing, and here's to what comes next for this incredible property! 😊`},
 {title:"Summer in Seldovia, Alaska brings increased activity in small aircraft operations",excerpt:"During this season, air traffic typically includes a mix of scheduled commuter flights, private aircraft, and charter services.",date:"Jun 11, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-06-11.jpg",body:`Summer in Seldovia, Alaska brings increased activity in small aircraft operations as the town sees more seasonal movement, visitors, and supply deliveries.

During this season, air traffic typically includes a mix of scheduled commuter flights, private aircraft, and charter services.

These flights connect Seldovia to nearby hubs such as Homer and other parts of the Kenai Peninsula and Anchorage, making it easier for residents, seasonal homeowners, and visitors to access our community.  We are so thankful for such a great airstrip!`},
 {title:"Our June 2026 flipbook is now live!",excerpt:"Take a look at the newest listings and current market update in Seldovia, Alaska.",date:"Jun 9, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-06-09.jpg",body:`Our June 2026 flipbook is now live! Take a look at the newest listings and current market update in Seldovia, Alaska.

If you have any questions about a property or want insight into the current market, feel free to reach out to me. I'm happy to help you navigate buying or selling in Seldovia! 907-406-0044`},
 {title:"333 Anderson Way — Heart-of-Town Seldovia Location",excerpt:"Three town lots (0.69 acres total), a sun-filled ranch home, a 768 sq ft shop, and commercial zoning with expansion potential.",date:"Jun 8, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-06-08_01.jpg",body:`📍 333 Anderson Way Seldovia, AK 99663
🏘️ Heart-of-Town Seldovia Location
🌳 Three Town Lots (0.69 Acres Total)
☀️ Sun-Filled Ranch Home
🏠 2 BR, 1.5 BA Single-Level Living
📐 1,120 Sq Ft Layout
🏗️ 768 Sq Ft Spacious Shop
🔧 Additional Storage Sheds (192 & 256 Sq Ft)
💧 Utility-Ready Building (Water, Sewer, Power)
🚶 Walkable to Harbor, Shops & School
🏢 Commercial Zoning & Expansion Potential
🌐 https://www.seldoviaproperty.com/
📞 Call Jenny with Seldovia Property (907) 406-0044`},
 {title:"60187 Chesloknu Lease — Waterfront Seldovia Bay Location",excerpt:"A custom-built log home with rare private road access, bay and mountain views, an expansive loft and artist's atelier, and beach access.",date:"Jun 8, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-06-08_02.jpg",body:`📍 60187 Chesloknu Lease Seldovia, AK 99663
🌊 Waterfront Seldovia Bay Location
🚗 Rare Private Road Access
🪵 Custom-Built Log Home
🏔️ Bay & Mountain Views
🌅 Sunrise & Sunset Views
☀️ Sun-Filled Property
🛋️ Open-Concept Living Space
🎨 Expansive Loft & Artist's Atelier
🦌 Exceptional Wildlife Viewing
🏖️ Beach Access & Wraparound Deck
🌐 https://www.seldoviaproperty.com/
📞 Call Jenny with Seldovia Property (907) 406-0044`},
 {title:"Thank you so much for the kind review Rich!",excerpt:"Thank you so much for the kind review Rich!",date:"Jun 6, 2026",read:"1 min",cat:"Kind Words",img:"images/gazette/2026-06-06.jpg",body:`Thank you so much for the kind review Rich! 🙏`},
 {title:"Glorious Seldovia Summer Sunset!",excerpt:"Glorious Seldovia Summer Sunset!",date:"Jun 5, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-06-05.jpg",body:`Glorious Seldovia Summer Sunset! ❤️`},
 {title:"On Flag Day in Seldovia, the day doesn't start with a crowd, it starts with a potluck at Jack and Aiva's restaurant.",excerpt:"Slowly, dishes begin to show up on tables like they've always belonged there.",date:"Jun 2, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-06-02.jpg",body:`On Flag Day in Seldovia, the day doesn't start with a crowd, it starts with a potluck at Jack and Aiva's restaurant.

Slowly, dishes begin to show up on tables like they've always belonged there. Someone brings something still warm, someone else arrives with a tray that's been carefully wrapped, and before long the place feels less like a restaurant and more like a shared kitchen for the whole town.

It's simple, but it's the kind of simple that holds a community together.`},
 {title:"When you just need to give your mind a break, your ears a rest, your thoughts a bit of reprieve… where do you go?",excerpt:"One special thing about Seldovia, is that there are many places you can walk to in town, where you can find a quiet moment.",date:"May 31, 2026",read:"1 min",cat:"Living Here",img:"",body:`When you just need to give your mind a break, your ears a rest, your thoughts a bit of reprieve… where do you go?

One special thing about Seldovia, is that there are many places you can walk to in town, where you can find a quiet moment. Inside Beach, Church Beach, the Otterbahn Trail, the picnic tables at the pavilion or maybe a stroll along the docks or grab a seat along the harbor…

Come find your quiet spot!`},
 {title:"Coffee in hand, tide shifting quietly, and the harbor slowly coming to life, everything feels softer here.",excerpt:"Like the ocean has its own way of coloring the start of the day.",date:"May 30, 2026",read:"1 min",cat:"Living Here",img:"",body:`Coffee in hand, tide shifting quietly, and the harbor slowly coming to life, everything feels softer here, like the ocean has its own way of coloring the start of the day.

It's not just a morning. It's a reminder of where you are. ☀️🌊`},
 {title:"Answer: B. Salmon",excerpt:"Salmon have long been part of life around Seldovia, shaping local traditions, summer fishing seasons, and countless memories made out on the water.",date:"May 29, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-29.jpg",body:`Answer: B. Salmon 🐟

Salmon have long been part of life around Seldovia, shaping local traditions, summer fishing seasons, and countless memories made out on the water. From coho, king salmon to sockeye, these fish return to Alaska's coastal waters each year and are a familiar sight for both locals and visitors exploring the bay.

The waters surrounding Seldovia are rich with marine life, and salmon play a huge role in the ecosystem here. Alongside fishing boats and harbor views, it's common to spot bald eagles soaring overhead, sea otters drifting nearby, and even whales passing through Kachemak Bay during the season.`},
 {title:"A global celebration of one of the most iconic and versatile dishes!",excerpt:"Even in Seldovia, it's the kind of comfort food that just hits the spot after a long day—simple, satisfying, and always a favorite!",date:"May 28, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-28_2.jpg",body:`A global celebration of one of the most iconic and versatile dishes!

Even in Seldovia, it's the kind of comfort food that just hits the spot after a long day—simple, satisfying, and always a favorite!

Wanna have a onion smash burger? That sounds soooo good!`},
 {title:"As a resident of Seldovia for almost 24 years, there has not been a time without Jim in it.",excerpt:"His bright eyes and tender heart have always been a welcome part of every interaction.",date:"May 28, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-28_1.jpg",body:`As a resident of Seldovia for almost 24 years, there has not been a time without Jim in it. His bright eyes and tender heart have always been a welcome part of every interaction, whether at the dump, talking through the window of his big equipment, sitting at a local restaurant, or stopping by to see the status of his beets and flourishing garden.

Jim was on speed dial for me as he was the "go to" for any client needing dirt work, driveways and help with septic, pilings or moving big things… He is leaving a huge void in our personal and professional worlds and our hearts are broken with this great loss to our entire community.

Our hearts are with the entire Hopkins family – rest in peace Jim – we love you!`},
 {title:"Aside from the MV Tustumena that serves the broader Alaska coastline, we're especially grateful here in Seldovia for the Seldovia Bay Ferry.",excerpt:"Our daily lifeline across Kachemak Bay.",date:"May 27, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-27.jpg",body:`Aside from the MV Tustumena that serves the broader Alaska coastline, we're especially grateful here in Seldovia for the Seldovia Bay Ferry, our daily lifeline across Kachemak Bay.

Living in Seldovia means understanding that the bay isn't a barrier, it's a lifeline. And the Seldovia Bay Ferry is one of the most important threads holding that lifeline together, day after day, trip after trip.`},
 {title:"Don't let those amazing May memories sit forgotten in your camera roll!",excerpt:"This is your chance to share your favorite moments and join the contest!",date:"May 27, 2026",read:"1 min",cat:"Community",img:"",body:`Don't let those amazing May memories sit forgotten in your camera roll! This is your chance to share your favorite moments and join the contest!`},
 {title:"One of the most special parts of summer is the return of seasonal residents.",excerpt:"For many Seldovians, summer isn't just about sunshine, it's about reunion.",date:"May 26, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-26.jpg",body:`One of the most special parts of summer is the return of seasonal residents. For many Seldovians, summer isn't just about sunshine, it's about reunion. Friends, families, and neighbors who spend the colder months away come back to their homes, cabins, and favorite spots. There's something comforting about seeing familiar faces again, picking up conversations where they left off months ago, and sharing stories that feel like they never paused.

Along with them come visitors, travelers who make their way across Kachemak Bay to experience Seldovia for the first time or return because they fell in love with it before.`},
 {title:"Today is a day of remembrance, reflection, and gratitude.",excerpt:"We pause to honor the men and women who gave their lives in service to our country.",date:"May 25, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-25.jpg",body:`Today is a day of remembrance, reflection, and gratitude. We pause to honor the men and women who gave their lives in service to our country, their sacrifice is the reason for the freedoms we live with today.

We remember them. We honor them. And we are grateful. 🙏`},
 {title:"Here, dreams don't feel far away or out of reach, they feel lived in.",excerpt:"Not something to chase, but something you're quietly part of already.",date:"May 24, 2026",read:"1 min",cat:"Living Here",img:"",body:`Here, dreams don't feel far away or out of reach, they feel lived in. Not something to chase, but something you're quietly part of already.

In Seldovia, it's not about escaping life to find something better… it's about realizing you've been standing in it all along.`},
 {title:"Seldovia lives in rhythm with the bay, and that rhythm is carried by the transportation that serves it.",excerpt:"Kachemak Bay isn't just a backdrop, it's the highway.",date:"May 23, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-23.jpg",body:`Seldovia lives in rhythm with the bay, and that rhythm is carried by the transportation that serves it.

Kachemak Bay isn't just a backdrop, it's the highway. Every trip in and out of town depends on reliable service boats and ferries that connect Seldovia to Homer and the wider world. Whether it's the regular ferry run bringing residents, visitors, and supplies, or smaller skiffs and water taxis moving across the water, these services are the quiet backbone of daily life here.

And maybe that's part of why people stay tied to it year after year. The journey isn't just a commute, it's part of the experience.`},
 {title:"As Seldovians, these everyday patterns become second nature, but they're also what make the town feel like home.",excerpt:"A small business scene where everyone knows everyone, work and life naturally overlap, and supporting local is just the way it is.",date:"May 22, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-22.jpg",body:`As Seldovians, these everyday patterns become second nature, but they're also what make the town feel like home.

1. A Small Business Scene Where Everyone Knows Everyone

Local businesses aren't just places to shop—they're where relationships live. As Seldovians, it's normal to be greeted by name, catch up while buying something simple, and support places that feel more like neighbors than stores.

2. Work and Life Naturally Overlap

In a small town, business owners, teachers, parents, and workers often wear multiple hats. It's common to see the same people in different roles throughout the week, which makes everyday interactions feel familiar and grounded.

3. Supporting Local Is Just the Way It Is

As Seldovians, there's a shared understanding that supporting each other keeps the community strong, whether it's buying local, attending events, or helping a neighbor's business grow.`},
 {title:"Congratulations to the seller & buyer! This property is now officially under contract!",excerpt:"A rare property like this is more than just land, it's a front-row seat to one of the most beautiful stretches of coastline anywhere.",date:"May 21, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-05-21.jpg",body:`Congratulations to the seller & buyer! This property is now officially under contract! A rare property like this is more than just land, it's a front-row seat to one of the most beautiful stretches of coastline anywhere. 😊`},
 {title:"Are you team sweet, herbal, or black?",excerpt:"In Seldovia, a simple cup of tea can feel like a pause in the day, something warm in your hands after time outside.",date:"May 21, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-21_2.jpg",body:`Are you team sweet, herbal, or black?

In Seldovia, a simple cup of tea can feel like a pause in the day, something warm in your hands after time outside, or a slow start to the morning while everything is still quiet.

Happy International Tea Day!`},
 {title:"Today we celebrate more than a milestone, we celebrate the hard work, growth, and determination that brought you here.",excerpt:"Congratulations, graduates! Your future is just beginning.",date:"May 19, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-19.jpg",body:`Today we celebrate more than a milestone, we celebrate the hard work, growth, and determination that brought you here.

As you move ahead, carry with you the lessons learned, the friendships built, and the memories made along the way. Seldovia is proud of you today and always.

Congratulations, graduates! Your future is just beginning.`},
 {title:"Here's our updated flipbook for the month of May featuring the latest Seldovia real estate listings.",excerpt:"Take a scroll through and see what catches your eye!",date:"May 19, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-05-19_2.jpg",body:`Here's our updated flipbook for the month of May featuring the latest Seldovia real estate listings. Take a scroll through and see what catches your eye!`},
 {title:"In Seldovia, homemade always hits a little different.",excerpt:"Whether it's sour dough bread, cookies, sticky buns or something even sweeter — what's baking in your kitchen today?",date:"May 17, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-17.jpg",body:`In Seldovia, homemade always hits a little different. Whether it's sour dough bread, cookies, sticky buns or something even sweeter — what's baking in your kitchen today?`},
 {title:"Here, life isn't rushed forward. It gently moves between memory and possibility.",excerpt:"Reminding you that both are worth slowing down for.",date:"May 16, 2026",read:"1 min",cat:"Living Here",img:"",body:`Here, life isn't rushed forward. It gently moves between memory and possibility, reminding you that both are worth slowing down for.

Seldovia isn't just a place, it's a feeling of continuity, where every step carries you from what was… into what's next. 🌅`},
 {title:"A reminder to slow down, enjoy the ride, and appreciate the simple commute in Seldovia.",excerpt:"Fresh air, quiet roads, and a different way to start the day!",date:"May 15, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-15.jpg",body:`A reminder to slow down, enjoy the ride, and appreciate the simple commute in Seldovia. Fresh air, quiet roads, and a different way to start the day! 🚲`},
 {title:"For many of us, the Tusty has always been part of life here.",excerpt:"It brings groceries, supplies, visitors, and loved ones returning home.",date:"May 14, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-14.jpg",body:`For many of us, the Tusty has always been part of life here. It brings groceries, supplies, visitors, and loved ones returning home. Sometimes it carries people heading off on new adventures, and other times it brings them back after being away.

But beyond all of that, it's the feeling connected to it that stands out most. Watching it pull into Seldovia Bay never really gets old. It reminds us how connected this small coastal community is, even tucked away across Kachemak Bay.

So many memories in Seldovia somehow involve the Tusty—waiting at the dock, waving goodbye, welcoming someone home, or simply watching it arrive from the shoreline.

It's more than just a ferry to us. It's part of the story of living here.`},
 {title:"Answer: Sea otters!",excerpt:"The waters around this Alaska coastal town are often home to sea otters, playful and curious creatures that delight locals and visitors alike.",date:"May 13, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-13.jpg",body:`Answer: Sea otters!

The waters around this Alaska coastal town are often home to sea otters, playful and curious creatures that delight locals and visitors alike.

We do see occasional orcas, seals and humpback whales in the bay!

Fun fact: Sea otters float together "raft" in the bay, and watching them swim, roll and play is one of Seldovia's most charming sights!`},
 {title:"In a small, close-knit community like Seldovia, though we don't have any nurses living full-time here, we have many first responders who serve our community whenever a call arises!",excerpt:"They're familiar faces, calm voices in urgent moments, and a steady presence when people need support the most.",date:"May 12, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-12.jpg",body:`In a small, close-knit community like Seldovia, though we don't have any nurses living full-time here, we have many first responders who serve our community whenever a call arises! They're familiar faces, calm voices in urgent moments, and a steady presence when people need support the most. Their impact is felt deeply in everyday life here.

From routine care to emergencies, they help keep our community healthy, safe, and cared for no matter the distance or conditions.

Thank you to all nurses, and I'm adding First Responders - especially those serving remote communities like ours. Your work truly makes a difference 💙`},
 {title:"One of the things I love most about spring in Seldovia is how gently it arrives.",excerpt:"Or just when you think it has arrived… snowfall! There's no sudden change overnight, it slowly, consistently unfolds in front of you, almost quietly.",date:"May 11, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-11.jpg",body:`One of the things I love most about spring in Seldovia is how gently it arrives. Or just when you think it has arrived… snowfall! There's no sudden change overnight, it slowly, consistently unfolds in front of you, almost quietly.

Nothing feels rushed. Spring takes its time, and somehow that makes you appreciate it even more. 😊`},
 {title:"Otterbahn Trail is not just a trail through nature, it's a pause from everything that feels rushed.",excerpt:"And somewhere along the way, you realize it's not about getting somewhere at all—it's about slowing down enough to feel present again.",date:"May 10, 2026",read:"1 min",cat:"Living Here",img:"",body:`Otterbahn Trail is not just a trail through nature, it's a pause from everything that feels rushed.

And somewhere along the way, you realize it's not about getting somewhere at all—it's about slowing down enough to feel present again.

Seldovia isn't just a place you walk through. It's where unhurried joy finds you, one step at a time.`},
 {title:"“Life doesn't come with a manual, it comes with a mother.”",excerpt:"Happy Mother's Day to all the incredible moms and mother figures.",date:"May 10, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-10.jpg",body:`"Life doesn't come with a manual, it comes with a mother." 🌸

Happy Mother's Day to all the incredible moms and mother figures 💛

In Seldovia, we see every day how deeply mothers shape families and community through quiet strength, endless care, and love that shows up in a thousand small ways.

Today is for celebrating you, honoring you, and saying thank you for everything you do 💛`},
 {title:"Answer: Dense wildlife populations!",excerpt:"Why is Seldovia popular with wildlife photographers? The area is home to dense wildlife populations.",date:"May 7, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-07.jpg",body:`Answer: Dense wildlife populations!

Why is Seldovia popular with wildlife photographers? The area is home to dense wildlife populations, from over 100 different bird species with many bald eagles and sea otters to an occasional moose and one of the highest population of black bears in the state, offering photographers countless opportunities to capture Alaska's natural beauty.

Fun fact: With its mix of coastal waters, forests, and mountains, Seldovia provides a living wildlife gallery, perfect for both amateur and professional photographers looking to snap that iconic shot!`},
 {title:"Cheers to the seller and new owners of this lot in the heart of Seldovia!",excerpt:"Exciting opportunities and new beginnings are ahead.",date:"May 6, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-05-06.jpg",body:`Cheers to the seller and new owners of this lot in the heart of Seldovia! Exciting opportunities and new beginnings are ahead.

It's so great to see folks returning to Seldovia! It's true that once you live here, it's hard to find somewhere else that fills your heart the way Seldovia does! It's a magnetic force being/calling you home! 😊`},
 {title:"It's not just the scenery that makes this Seldovia special, it's what it does to you.",excerpt:"The wild, untouched beauty has a way of grounding you, clearing your mind, and reminding you to breathe a little deeper.",date:"May 5, 2026",read:"1 min",cat:"Living Here",img:"",body:`It's not just the scenery that makes this Seldovia special, it's what it does to you. The wild, untouched beauty has a way of grounding you, clearing your mind, and reminding you to breathe a little deeper.

In Seldovia, the wild doesn't overwhelm you—it restores you. And sometimes, that's exactly what a busy heart needs.`},
 {title:"In places like Seldovia, we're just like everyone else… except our “drive-thru” might involve a boat.",excerpt:"And our view is a mountain or ocean instead of a parking lot.",date:"May 3, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-03.jpg",body:`In places like Seldovia, we're just like everyone else… except our "drive-thru" might involve a boat, and our view is a mountain or ocean instead of a parking lot 🦌

Meanwhile, the igloo idea is still going strong somewhere on the internet… probably next to "we all ride moose to work" 🦌

In Seldovia, we've got warm homes, strong coffee, Starlink, Wi-Fi, city water and sewer, school days, work days, and neighbors who will absolutely wave at you from across the street or along the harbor like it's totally normal!

So no, we're not out here building igloos after breakfast. We're just trying to keep our coffee warm like the rest of the world 😊

What's the funniest Alaska myth you've ever heard? I need a good laugh 😂`},
 {title:"Answer: Milder winters and cooler summers!",excerpt:"Thanks to its coastal location, Seldovia enjoys milder winters and cooler summers than the interior.",date:"May 2, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-02.jpg",body:`Answer: Milder winters and cooler summers!

Thanks to its coastal location, Seldovia enjoys milder winters and cooler summers than the interior, making the weather a bit more forgiving while still giving residents that true Alaskan experience enjoying the beauty and weather of all 4 seasons.

Fun fact: The ocean acts as a natural thermostat, keeping the town cozy in winter and pleasantly cool in summer perfect for fishing, kayaking, and exploring the outdoors year-round!`},
 {title:"What's one thing you love most about our small-town gatherings?",excerpt:"Have you ever noticed how something as simple as sharing a meal can bring a whole community closer?",date:"May 1, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-01.jpg",body:`What's one thing you love most about our small-town gatherings?

Have you ever noticed how something as simple as sharing a meal can bring a whole community closer?

That's exactly what a potluck in Seldovia is all about. Everyone brings something to the table whether it's a favorite dish, a helping hand, or simply their presence. And somehow, it all comes together to create something bigger than the event itself.`},
 {title:"Take a look at our latest flipbook to explore our active listings.",excerpt:"From unique opportunities to beautiful homes in Seldovia, this collection gives you a closer look at what's currently available in the market.",date:"Apr 30, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-04-30.jpg",body:`Take a look at our latest flipbook to explore our active listings.

From unique opportunities to beautiful homes in Seldovia, this collection gives you a closer look at what's currently available in the market. Whether you're searching for your next home, an investment, or just browsing what's out there, it's all in one easy place to flip through and explore.`},
 {title:"In Seldovia, May always feels like a quiet turning point.",excerpt:"Winter starts to loosen its grip, the days stretch a little longer, and suddenly life moves back outside again.",date:"Apr 30, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-30_2.jpg",body:`In Seldovia, May always feels like a quiet turning point. Winter starts to loosen its grip, the days stretch a little longer, and suddenly life moves back outside again.

May in Seldovia isn't just another month, it's a reminder that brighter, busier, more active days are just around the corner.

So, what are you most looking forward to this May? ☀️👇`},
 {title:"Biking season is back in Seldovia.",excerpt:"There's a certain rhythm that returns to Seldovia when the days stretch a little longer and the air finally warms up.",date:"Apr 28, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-04-28.jpg",body:`Biking season is back in Seldovia.

There's a certain rhythm that returns to Seldovia when the days stretch a little longer and the air finally warms up.

You hear it before you always see it—tires on pavement, laughter echoing a little farther down the road, and kids rediscovering the simple freedom of their bikes.

And that's exactly why this season always comes with a quiet reminder for all of us driving through town.

Take it slow. Stay aware. Look twice, then look again.

Not because the roads are dangerous, but because they're shared. And in a small community like ours, that awareness matters.

So as bikes reappear across Seldovia this season, let's meet them with care, attention, and kindness on the road.`},
 {title:"Thank you Shelly, for this review. I really appreciate you taking the time to share this!",excerpt:"Thank you Shelly, for this review. I really appreciate you taking the time to share this!",date:"Apr 27, 2026",read:"1 min",cat:"Kind Words",img:"images/gazette/2026-04-27.jpg",body:`Thank you Shelly, for this review. I really appreciate you taking the time to share this! 😊`},
 {title:"What makes Seldovia special isn't that it takes you away from life, but that it brings you closer to it.",excerpt:"Closer to simple routines, closer to nature, closer to people who feel like community.",date:"Apr 26, 2026",read:"1 min",cat:"Living Here",img:"",body:`What makes Seldovia special isn't that it takes you away from life, but that it brings you closer to it. Closer to simple routines, closer to nature, closer to people who feel like community. Somewhere along the way, you stop feeling like you're missing out and start feeling like you've finally arrived. 😊`},
 {title:"Today, we celebrate the incredible dedication and compassion of veterinarians who care for the animals that mean so much to us.",excerpt:"Here in Seldovia, we are especially grateful for Dr. Marlowe, who visits our community every third Thursday of each month.",date:"Apr 25, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-04-25.jpg",body:`Today, we celebrate the incredible dedication and compassion of veterinarians who care for the animals that mean so much to us.

Here in Seldovia, we are especially grateful for Dr. Marlowe, who visits our community every third Thursday of each month to provide care for our beloved pets and animals.

In a small town like ours, having consistent, reliable veterinary care is truly invaluable. We're so grateful for Dr. Marlowe, who travels in each month to care for our furry friends and ensure they get the attention they deserve.

Thank you, Dr. Marlowe, for your heart, your time, and the care you bring to our community, you are deeply appreciated! 💙🐱🐾`},
 {title:"Boats Are the “Roads” of Seldovia",excerpt:"One of the most unique things about Seldovia is that everything moves by water or air. For many residents, boats are the most practical way to get around.",date:"Apr 24, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-24.jpg",body:`Boats Are the "Roads" of Seldovia

One of the most unique things about Seldovia is that everything moves by water or air. For many residents, boats are the most practical way to get around. Whether it's a quick trip across the bay or a longer journey to nearby Homer, boats make everyday travel possible.

Getting Supplies and Essentials

Groceries, fuel, building materials, and other essentials often arrive by boat. Many families also use boats to travel for shopping trips or to pick up supplies, making them an essential part of planning daily life in a remote coastal community.

Please see the comment section to read the full continuation of this post.`},
 {title:"Here, where life moves at a gentler pace, there's always time to curl up with a good story.",excerpt:"Whether it's by the window on a rainy day or outside enjoying the fresh air, books have a way of making every moment feel a little more special.",date:"Apr 23, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-04-23.jpg",body:`Here, where life moves at a gentler pace, there's always time to curl up with a good story. Whether it's by the window on a rainy day or outside enjoying the fresh air, books have a way of making every moment feel a little more special.

Today, we celebrate the creativity behind every page and the life-changing joy that reading brings to all of us.`},
 {title:"Earth Day in Seldovia is a reminder of how lucky we are to call this beautiful place home.",excerpt:"Living in a place surrounded by mountains, ocean, and wildlife reminds us every day how important it is to care for our planet.",date:"Apr 22, 2026",read:"1 min",cat:"Community",img:"",body:`Earth Day in Seldovia is a reminder of how lucky we are to call this beautiful place home. 🌊🌲

Living in a place surrounded by mountains, ocean, and wildlife reminds us every day how important it is to care for our planet.

Let's continue being good stewards of the beauty around us by keeping our waters clean, our land preserved, and our community connected to nature. Every small action makes a difference. 💚`},
 {title:"Living in Seldovia means being surrounded by water in one of the most beautiful coastal settings in Alaska.",excerpt:"And with that close connection comes an important reality: knowing how to swim isn't just helpful, it's essential.",date:"Apr 21, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-21.jpg",body:`Living in Seldovia means being surrounded by water in one of the most beautiful coastal settings in Alaska. The ocean is part of daily life here from boat rides to fishing trips, from beach walks to simply enjoying the view. And with that close connection comes an important reality: knowing how to swim isn't just helpful, it's essential.

Safety First, Always‼️

Alaska's waters are cold, and conditions can change quickly. Even in calm weather, unexpected situations can happen—slippery docks, sudden waves, or accidents while boating.

Life jackets are essential, but knowing how to swim can make a critical difference. It provides a layer of safety not just for yourself, but for those around you. It's not about fear, it's about being prepared and capable in an environment where water is always nearby.

Continue reading in the comment section below.`},
 {title:"Pending and moving forward!",excerpt:"A big congratulations to the sellers and buyers of this lot in Seldovia, one step closer to making it official!",date:"Apr 20, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-04-20_2.jpg",body:`Pending and moving forward! A big congratulations to the sellers and buyers of this lot in Seldovia, one step closer to making it official! 🎉`},
 {title:"People have a lot of ideas about living in Alaska but the reality, especially in Seldovia, might surprise you.",excerpt:"Here are 5 common myths… and the truth behind them.",date:"Apr 20, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-20.jpg",body:`People have a lot of ideas about living in Alaska but the reality, especially in Seldovia, might surprise you.

Here are 5 common myths… and the truth behind them:

1. Myth: You're completely isolated
Reality: Seldovia is a close-knit, welcoming community. You're never really alone, neighbors look out for each other, and connections run deep.

2. Myth: There's no access to essentials
Reality: There are local stores, regular deliveries, and trips to Homer for groceries and supplies. It just takes a bit of planning.

See the comment section to read more.`},
 {title:"In Seldovia, life isn't measured by how fast you go but by how deeply you experience each moment.",excerpt:"Here, “enough” isn't measured by more, it's found in connection, in calm, and in the kind of beauty that never asks for attention.",date:"Apr 19, 2026",read:"1 min",cat:"Living Here",img:"",body:`In Seldovia, life isn't measured by how fast you go but by how deeply you experience each moment.

Here, "enough" isn't measured by more, it's found in connection, in calm, and in the kind of beauty that never asks for attention but always leaves an impression.`},
 {title:"In a place like Seldovia, where life moves at a slower pace and every connection matters, husbands play such an important role in keeping families grounded and strong.",excerpt:"Happy Husband Appreciation Day to all the amazing husbands in our community!",date:"Apr 18, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-04-18.jpg",body:`In a place like Seldovia, where life moves at a slower pace and every connection matters, husbands play such an important role in keeping families grounded and strong. 💙🌲

Happy Husband Appreciation Day to all the amazing husbands in our community!

Today, we honor you for the sacrifices you make, the strength you show, and the love you give!`},
 {title:"Answer: It controls transportation and supply delivery!",excerpt:"Why is weather such an important part of daily planning in Seldovia? Because changing conditions can directly affect transportation and supply delivery.",date:"Apr 17, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-17.jpg",body:`Answer: It controls transportation and supply delivery!

Why is weather such an important part of daily planning in Seldovia? Because changing conditions can directly affect transportation and supply delivery. Boats and small planes are essential for travel and bringing in goods, and both depend heavily on safe weather to operate.

Fun fact: In coastal Alaska towns like Seldovia, checking the forecast isn't just about dressing for the day, it's about knowing when groceries, mail, and visitors might arrive!`},
 {title:"There's nothing quite like enjoying a warm, comforting brunch in a place as peaceful as Seldovia.",excerpt:"Whether you're starting your day by the water or gathering with friends and family, Eggs Benedict feels like the perfect treat to slow down and savor the moment!",date:"Apr 16, 2026",read:"1 min",cat:"Living Here",img:"",body:`There's nothing quite like enjoying a warm, comforting brunch in a place as peaceful as Seldovia.

Whether you're starting your day by the water or gathering with friends and family, Eggs Benedict feels like the perfect treat to slow down and savor the moment!`},
 {title:"There's something special about getting your hands in the soil and watching something grow.",excerpt:"In Seldovia, even the smallest gardens bring so much beauty and life to our community.",date:"Apr 14, 2026",read:"1 min",cat:"Community",img:"",body:`There's something special about getting your hands in the soil and watching something grow.

In Seldovia, even the smallest gardens bring so much beauty and life to our community.

Thanks to Suzie from Thyme on the Boardwalk garden store and nursery, we have absolutely gorgeous parks that are loving cared for by Suzie and her woofers! If you see her at 11pm in the garden in the center of town, stop and lend a hand or a word of encouragement and gratitude! She is a big part of what makes our downtown so beautiful!

Whether you're planting flowers, growing your own food, or simply enjoying the process, gardening is a reminder of patience, care, and the rewards of nurturing something over time. 🌿`},
 {title:"Yes, you can stay connected in Seldovia but it's a little different from big-city living.",excerpt:"Internet is available and continues to improve, allowing residents to work remotely, run businesses, and stay in touch with loved ones.",date:"Apr 13, 2026",read:"2 min",cat:"Living Here",img:"images/gazette/2026-04-13.jpg",body:`Yes, you can stay connected in Seldovia but it's a little different from big-city living.

Internet is available and continues to improve, allowing residents to work remotely, run businesses, and stay in touch with loved ones. However, reliability can vary depending on weather and demand.

🛒 Groceries & Food Access

Seldovia has a local store where you can pick up basic groceries and essentials. You'll find pantry staples, frozen goods, and everyday items and the selection is amazing - Chris and Tata do a great job of making the Crabpot a place to get everything from ice cream to artichoke hearts and fresh veggies and fruit! But they are just one store, so you may have special favorites that you'll need to grab those elsewhere! We love to shop local and support our neighbors and friends!

If you need something from Anchorage, Ronnie with True North Air shops Costco, Fast food places, Best Buy, West Marine, whatever you need and will bring it right to our airport for you! First Class for sure!

For bigger shopping trips, many residents travel to Homer, or Kenai & Soldotna where there are larger grocery stores and more variety. This often means planning ahead, making lists, and stocking up.

It's common to:
✅ Buy in bulk
✅ Keep a well-stocked pantry
✅ Use freezers for long-term storage

Fresh produce is available, but it may be seasonal or more expensive due to transportation.

📦 Shipping & Deliveries

Getting packages in Seldovia is totally doable but patience is key.

Mail and freight typically come through Homer before reaching Seldovia by boat or plane. This means deliveries can take longer than expected, especially during bad weather.

Locals get used to:
✅ Ordering ahead of time
✅ Tracking shipments closely
✅ Being flexible with delivery dates`},
 {title:"Answer: Small local clinic; major care in nearby Homer!",excerpt:"While the town has a small local clinic for routine care, residents often travel to Homer or Anchorage for major medical services.",date:"Apr 12, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-04-12.jpg",body:`Answer: Small local clinic; major care in nearby Homer!

While the town has a small local clinic for routine care, residents often travel to Homer or Anchorage for major medical services. This setup is common in remote Alaska communities, where access to specialized care requires a bit of planning.

Fun fact: Our fantastic volunteer Fire and EMS teams are amazing first responders and help in times of crisis. Telemedicine and emergency transport options, including boats and small aircraft, help ensure that even in this remote coastal town, residents can get the care they need when it matters most!`},
 {title:"Nothing matters more than happy clients!",excerpt:"Thank you Frank for this wonderful review.",date:"Apr 11, 2026",read:"1 min",cat:"Kind Words",img:"images/gazette/2026-04-11.jpg",body:`Nothing matters more than happy clients! Thank you Frank for this wonderful review. 😊`},
 {title:"Family and community mean so much, siblings are often our first best friends and lifelong companions.",excerpt:"From growing up together to sharing memories by the water and supporting each other through every season of life.",date:"Apr 10, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-04-10.jpg",body:`Family and community mean so much, siblings are often our first best friends and lifelong companions. ❤️

From growing up together to sharing memories by the water and supporting each other through every season of life, the bond between siblings is something truly special.

Today, we celebrate those connections, the laughter, the memories, and the unbreakable love that makes siblings such an important part of our lives!`},
 {title:"Here's what locals in Seldovia look forward to most when spring begins to arrive:",excerpt:"Longer days, the harbor coming back to life, the first signs of green, and the return of fishing season.",date:"Apr 9, 2026",read:"2 min",cat:"Living Here",img:"images/gazette/2026-04-09.jpg",body:`Here's what locals in Seldovia look forward to most when spring begins to arrive:

🌅 Longer, Brighter Days
After months of shorter daylight, the return of longer evenings feels like a gift. The sun lingers a little more each day, bringing warmth, light, and a sense of possibility.

🌊 The Harbor Coming Back to Life
Boats return, the docks feel busier, and there's a renewed sense of movement along the waterfront.

🌱 The First Signs of Green
After a winter of whites and grays, those first hints of green feel magical. Budding trees, fresh grass, and early blooms remind everyone that a new season has truly begun.

🎣 The Return of Fishing Season
Though many locals and commercial fishermen fish all winter, for many in Seldovia, spring marks the beginning of fishing season. There's excitement in the air as people prepare gear, plan trips, and look forward to days out on the water.

🛠️ Getting Back to Projects
Spring is when people start building, repairing, and creating again. Whether it's fixing up cabins, working on boats, or starting new projects, there's a shared energy of productivity.

☕ Reconnecting with Neighbors
As the weather warms up, and days grow long, people naturally spend more time outside. Friendly conversations return to boardwalks, streets, porches and docks, and the sense of community grows even stronger.

🚤 More Travel and Connection
With easier access to and from Homer, spring brings more visitors, more movement, and more opportunities to connect with others beyond town.`},
 {title:"When was the last time you paused and just took it all in?",excerpt:"In Seldovia, the mist, the wildlife, and the quiet beauty of nature create moments worth slowing down for.",date:"Apr 8, 2026",read:"1 min",cat:"Living Here",img:"",body:`When was the last time you paused and just took it all in? In Seldovia, the mist, the wildlife, and the quiet beauty of nature create moments worth slowing down for. 🌿 What's your favorite way to soak in these views?`},
 {title:"Your chance to own a beautiful home in the heart of Seldovia",excerpt:"This 3 bed, 2 bath home sits on a spacious hillside lot, offering both privacy and convenience.",date:"Apr 7, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-04-07.jpg",body:`Your chance to own a beautiful home in the heart of Seldovia 🌳✨

This 3 bed, 2 bath home sits on a spacious hillside lot, offering both privacy and convenience. With a large shop/garage, there's plenty of room for storage, hobbies, or creating the perfect workspace.

All of this is just a short distance from everything in town, giving you the best of both worlds: peaceful living with easy access to the heart of the community.

If you've been waiting for the right place to call home in Seldovia, this could be it. Click here to learn more
https://www.seldoviaproperty.com/.../321-eagle-run-loop…`},
 {title:"Here in our quiet coastal town, we're surrounded by the kind of environment that naturally supports a healthier way of life.",excerpt:"But health goes beyond the environment, it's also about the choices we make every day.",date:"Apr 7, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-07_2.jpg",body:`Here in our quiet coastal town, we're surrounded by the kind of environment that naturally supports a healthier way of life—fresh air, open space, and the calming presence of nature. But health goes beyond the environment, it's also about the choices we make every day.

From staying active and eating well to taking time for rest and mental well-being, every effort counts!

Today is a reminder to take care of yourself and appreciate the natural beauty that helps us live healthier, more balanced lives. 🌊`},
 {title:"As spring begins to awaken around our Seldovia, Easter invites us to remember the profound Christian celebration of Jesus Christ's resurrection.",excerpt:"It is a powerful reminder of new beginnings, redemption, and brighter days ahead, mirroring the renewal we see in the world around us.",date:"Apr 5, 2026",read:"1 min",cat:"Community",img:"",body:`As spring begins to awaken around our Seldovia, Easter invites us to remember the profound Christian celebration of Jesus Christ's resurrection, the ultimate victory over death and the promise of eternal life. It is a powerful reminder of new beginnings, redemption, and brighter days ahead, mirroring the renewal we see in the world around us.

Whether you're enjoying time with family, reflecting in quiet moments of faith and gratitude, or taking in the beauty of nature as it stirs to life, may your day be filled with peace, love, and renewed hope. Blessed Easter from our Seldovia community! He is risen indeed.`},
 {title:"Answer: About 250 people!",excerpt:"This cozy Alaska coastal town is home to roughly 250 residents, making it a tight-knit community where everyone knows their neighbors.",date:"Apr 4, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-04.jpg",body:`Answer: About 250 people!

This cozy Alaska coastal town is home to roughly 250 residents, making it a tight-knit community where everyone knows their neighbors. Life here moves at a slower pace, surrounded by stunning wilderness and the calm waters of Kachemak Bay.

This is a number based on just the city population, not the whole area of Seldovia, out in Seldovia Village and out at MacDonald Spit and to Jakolof Bay!

Fun fact: While the population is small, Seldovia welcomes visitors and seasonal workers who help keep the town vibrant and full of activity during the summer months!`},
 {title:"May today bring you peace, and may the days ahead be filled with blessings and renewal.",excerpt:"May today bring you peace, and may the days ahead be filled with blessings and renewal.",date:"Apr 3, 2026",read:"1 min",cat:"Community",img:"",body:`May today bring you peace, and may the days ahead be filled with blessings and renewal. ✨`},
 {title:"Life in Seldovia isn't about keeping up, it's about slowing down, breathing deeper, and finding meaning in the little things.",excerpt:"It's where peace feels natural, connection feels stronger, and every moment has space to be appreciated.",date:"Apr 2, 2026",read:"1 min",cat:"Living Here",img:"",body:`Life in Seldovia isn't about keeping up, it's about slowing down, breathing deeper, and finding meaning in the little things. It's where peace feels natural, connection feels stronger, and every moment has space to be appreciated. 💙`},
 {title:"Today we celebrate one of the most iconic landmarks in the world, the Eiffel Tower.",excerpt:"Built in 1887, it started as a bold experiment and became a global symbol of romance, art, and human imagination reaching for the sky.",date:"Mar 31, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-03-31.jpg",body:`Today we celebrate one of the most iconic landmarks in the world, the Eiffel Tower. Built in 1887, it started as a bold experiment and became a global symbol of romance, art, and human imagination reaching for the sky.

Even from a small coastal town in Alaska, it's easy to appreciate how landmarks whether towering steel or a quiet harbor connect people to memory, culture, and a sense of wonder. Sometimes it's not about where you are, but how a place makes you feel.`},
 {title:"We are thankful for the traveling PAs, RNs, and doctors that serve us here in Seldovia.",excerpt:"Even though we don't have doctors living full time in town, we still know how important they are when the need arises!",date:"Mar 30, 2026",read:"1 min",cat:"Community",img:"",body:`We are thankful for the traveling PAs, RNs, and doctors that serve us here in Seldovia. Even though we don't have doctors living full time in town, we still know how important they are when the need arises!

Especially in Seldovia, where we are off the road system and medical care often means traveling, waiting, and trusting someone far from home.

Doctors in Homer, Soldotna or even Anchorage become a vital part of life for Seldovians. They're the ones families rely on when something can't be handled locally, when weather delays travel, or when care requires a long trip by boat or plane. Their work reaches beyond clinic walls and into places like ours, where access isn't always easy but the need is just as real.

If a doctor has helped you or your family, near or far, today is a good day to say thank you.`},
 {title:"Living in Seldovia isn't always easy to explain to people who haven't experienced it firsthand.",excerpt:"From the outside, it can seem quiet maybe even too quiet. Limited stores, fewer events, and a slower pace might make some wonder if life here is “boring.”",date:"Mar 28, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-03-28.jpg",body:`Living in Seldovia isn't always easy to explain to people who haven't experienced it firsthand. From the outside, it can seem quiet maybe even too quiet. Limited stores, fewer events, and a slower pace might make some wonder if life here is "boring."

What may look like "not much going on" is actually a lifestyle built around simplicity, awareness, and adaptability.

What some might call boring is often just unfamiliar.

Without the typical entertainment options found in larger towns, residents create their own ways of enjoying life—through time outdoors, community interactions, hobbies, and shared experiences. Social life is less about variety and more about meaning.

Living in Seldovia isn't about constant activity or endless options. It's about connection, resilience, and appreciating a lifestyle that's closely tied to both people and place.

So is Seldovia boring or misunderstood?

For many, it's simply misunderstood.`},
 {title:"In Seldovia, a hat isn't just an accessory, it's part of daily life.",excerpt:"One minute it's blocking the sun off the harbor, the next it's keeping the wind out of your ears or the rain off your face.",date:"Mar 27, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-03-27.jpg",body:`In Seldovia, a hat isn't just an accessory, it's part of daily life. One minute it's blocking the sun off the harbor, the next it's keeping the wind out of your ears or the rain off your face.

So grab your favorite hat today and wear it proudly! 🧢`},
 {title:"Living or spending time here isn't just about the views, it's about the experience of being surrounded by wild beauty.",excerpt:"It invites you to pause, reflect, and truly take it all in.",date:"Mar 26, 2026",read:"1 min",cat:"Living Here",img:"",body:`Living or spending time here isn't just about the views, it's about the experience of being surrounded by wild beauty that invites you to pause, reflect, and truly take it all in.`},
 {title:"Mariah and John! Thank you - what a pleasure it was for me to help your sweet family into your first home!",excerpt:"I just LOVE that you grew up here, and now find that Seldovia is your “full time home” to raise your little girl!",date:"Mar 25, 2026",read:"1 min",cat:"Kind Words",img:"images/gazette/2026-03-25.jpg",body:`Mariah and John! Thank you - what a pleasure it was for me to help your sweet family into your first home! I just LOVE that you grew up here, and now find that Seldovia is your "full time home" to raise your little girl!

I'm excited to see you make this cute house your own - you are both very hard workers and have great ideas and the energy to love on that property!

I see sunny gardens and full swing sets with lots of laughter in your future! Thank you for your kind testimonial! 💗`},
 {title:"In a small coastal town like Seldovia, life has a way of keeping your inner child alive.",excerpt:"From the frozen winters where kids and adults race down snowy hills on sleds, to the rainy days where puddles invite a little jumping and splashing.",date:"Mar 22, 2026",read:"1 min",cat:"Living Here",img:"",body:`In a small coastal town like Seldovia, life has a way of keeping your inner child alive. From the frozen winters where kids and adults race down snowy hills on sleds, to the rainy days where puddles invite a little jumping and splashing, there's always a moment to embrace pure, playful joy.

Today, we challenge you to do something silly that makes you feel like a kid again. Maybe it's building a snow fort, skipping rocks by the lagoon, or even dancing on the boardwalk like no one's watching. Whatever it is, let it remind you of the simple happiness that comes from being carefree.`},
 {title:"Standing tall in the snowfall!",excerpt:"Living in Seldovia gives you the chance to witness and often get close-up views of this beautiful creature!",date:"Mar 21, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-03-21.jpg",body:`Standing tall in the snowfall! Living in Seldovia gives you the chance to witness and often get close-up views of this beautiful creature! 🦅❄️`},
 {title:"SBE Lifeguard Certification Class",excerpt:"The Seldovia Lifeguard Certification Class is such an important opportunity.",date:"Mar 21, 2026",read:"1 min",cat:"Community",img:"",body:`SBE Lifeguard Certification Class

The Seldovia Lifeguard Certification Class is such an important opportunity. Here's hoping Jen gets a full roster of participants ready to step up and help keep our pool staffed and safe.

Training local lifeguards means more swim time, more programs, and peace of mind for families. If you've considered it, even just a bit, this could be your moment to serve the community in a meaningful way.

Thank you to all those who already volunteer at our pool!!!`},
 {title:"In Seldovia, spring doesn't arrive all at once, it tiptoes in.",excerpt:"The snow softens, (or it blasts us once more just to let us know that winter is not releasing its grasp quite yet!) daylight lingers a little longer.",date:"Mar 20, 2026",read:"1 min",cat:"Living Here",img:"",body:`In Seldovia, spring doesn't arrive all at once, it tiptoes in. The snow softens, (or it blasts us once more just to let us know that winter is not releasing its grasp quite yet!) daylight lingers a little longer, and the harbor starts to look more awake than asleep.

There are more and more patches of bare ground, less and less ice and a few brave birds returning, or that familiar sound of water moving freely again.

The first day of spring reminds us that change is coming, slowly but surely, and that brighter days are ahead for our little Alaska town by the water.`},
 {title:"8 eggs today! Even in the snow!",excerpt:"8 eggs today! Even in the snow! Good girls",date:"Mar 20, 2026",read:"1 min",cat:"Living Here",img:"",body:`8 eggs today! Even in the snow! Good girls 🖤❤️👍`},
 {title:"Linwood BINGO – A Fun Night Out",excerpt:"BINGO at the Linwood Bar & Grill is one of those simple, classic Seldovia nights that brings everyone together.",date:"Mar 19, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-03-19.jpg",body:`Linwood BINGO – A Fun Night Out

BINGO at the Linwood Bar & Grill is one of those simple, classic Seldovia nights that brings everyone together.

It's a chance to get out of the house, share some laughs, and maybe even win a sweet prize. If you haven't gone in a while, grab a friend and join the fun.

Community happens when we show up. It's true!!! See you there!`},
 {title:"Whether you're searching for your next property or keeping an eye on the market, everything is now in one convenient place.",excerpt:"Browse anytime and stay up to date with what's available!",date:"Mar 18, 2026",read:"1 min",cat:"Real Estate",img:"",body:`Whether you're searching for your next property or keeping an eye on the market, everything is now in one convenient place. Browse anytime and stay up to date with what's available! 👉
www.SeldoviaProperty.com`},
 {title:"Today isn't just about green and gold it's about celebrating joy, kindness, and a little bit of luck in our lives.",excerpt:"Take a moment to share a smile, spread some cheer, and enjoy the magic of the day.",date:"Mar 17, 2026",read:"1 min",cat:"Community",img:"",body:`Today isn't just about green and gold it's about celebrating joy, kindness, and a little bit of luck in our lives.

Take a moment to share a smile, spread some cheer, and enjoy the magic of the day. 🌈

Wishing everyone a lucky and happy St. Patrick's Day!`},
 {title:"Seldovia truly shows up for kids, especially in the winter months.",excerpt:"From outdoor adventure days (just bring your gear!) to hands-on fun! They are making granola bars, decorating cupcakes, planting bulbs.",date:"Mar 15, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-03-15.jpg",body:`Seldovia truly shows up for kids, especially in the winter months. From outdoor adventure days (just bring your gear!) to hands-on fun! They are making granola bars, decorating cupcakes, planting bulbs, creating gnome shamrock planters, crafting seed bombs, whipping up edible dirt cups, and making rainbow twirlys! There is always something creative and active happening.

These activities don't just fill an afternoon; they build skills, friendships, and confidence.

A heartfelt thank you to the organizers and volunteers who plan, prep, and clean up so our kiddos have safe, engaging ways to learn and play.

Parents, please take advantage of it! Our community invests in its kids, and it shows.`},
 {title:"Today, we invite you to write your story whether it's a memory, a dream, or a reflection on life in our Alaska coastal town.",excerpt:"Share the tales that make you who you are, and celebrate the experiences that connect us all!",date:"Mar 14, 2026",read:"1 min",cat:"Community",img:"",body:`Today, we invite you to write your story whether it's a memory, a dream, or a reflection on life in our Alaska coastal town.

Share the tales that make you who you are, and celebrate the experiences that connect us all!`},
 {title:"In Seldovia, working moms wear many hats and often all in the same day.",excerpt:"It's early mornings with the tide schedule in mind, kids bundled up before school boats or boardwalk walks, and workdays shaped by weather, community needs, and family life all at once.",date:"Mar 12, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/post-0.jpg",body:`It's early mornings with the tide schedule in mind, kids bundled up before school boats or boardwalk walks, and workdays shaped by weather, community needs, and family life all at once.

National Working Moms Day is a moment to recognize the strength it takes to do it all in a remote town, where support often comes from neighbors and success is measured not just in productivity, but in care, connection, and commitment.

To the working moms of Seldovia: your hard work keeps families strong and this town moving forward. 🌸 Thank you for all you do as you are often the unsung heroes!`},
 {title:"Author Event – “My Heart is Good” with Josh Wisniewski",excerpt:"We love celebrating local talent, and Seldovia is full of it.",date:"Mar 11, 2026",read:"1 min",cat:"Events",img:"images/gazette/2026-03-11.jpg",body:`Author Event – "My Heart is Good" with Josh Wisniewski

https://tinyurl.com/2jahp5hn

We love celebrating local talent, and Seldovia is full of it. The author event featuring My Heart is Good with Josh Wisniewski is a great reminder of how many artists, writers, and musicians call this place home.

When we attend these events, we're not just supporting one person, we're supporting a culture of creativity in our town. Let's keep showing up for our own.`},
 {title:"New Library Hours – Thank You Volunteers!",excerpt:"We're so grateful for the volunteers who keep our library open and thriving.",date:"Mar 10, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-03-10.jpg",body:`New Library Hours – Thank You Volunteers!

We're so grateful for the volunteers who keep our library open and thriving. With expanded hours, it's even easier to stop in, browse the shelves, check out a movie, or discover something new to listen to.

Our little library is such a gift! Welcoming, well-loved, and full of resources for every age. Thank you to everyone who gives their time to make it possible.`},
 {title:"National Napping Day is a reminder that slowing down is just as important as showing up.",excerpt:"Sometimes the best way to reset isn't coffee… it's a blanket, a window view of the harbor, and a few peaceful minutes of doing nothing at all.",date:"Mar 9, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/post-3.jpg",body:`National Napping Day is a reminder that slowing down is just as important as showing up. Sometimes the best way to reset isn't coffee… it's a blanket, a window view of the harbor, and a few peaceful minutes of doing nothing at all.

So if today gives you an excuse to close your eyes and listen to the sounds of the water, take it. You've earned it.`},
 {title:"March 8 marks the start of Daylight Saving Time.",excerpt:"At 2:00 A.M., the clocks jump ahead one hour so don't forget to spring forward.",date:"Mar 8, 2026",read:"1 min",cat:"Community",img:"images/gazette/post-4.jpg",body:`March 8 marks the start of Daylight Saving Time. At 2:00 A.M., the clocks jump ahead one hour so don't forget to spring forward.

Longer, brighter evenings, more time to enjoy the outdoors, and a gentle reminder that spring is on its way! Hooray!`},
 {title:"Living here means learning from the water, the weather, and the quiet strength of a coastal town that stands beautifully against the elements.",excerpt:"And from this view on the Homer Spit, looking across the bay toward Seldovia, you can almost feel the character of the place calling you home.",date:"Mar 7, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/post-5.jpg",body:`Living here means learning from the water, the weather, and the quiet strength of a coastal town that stands beautifully against the elements.

And from this view on the Homer Spit, looking across the bay toward Seldovia, you can almost feel the character of the place calling you home. 🌊✨`},
 {title:"A big thank you to Seldovia Village Tribe for providing such a beautiful fitness center for our community.",excerpt:"Having a warm, welcoming place to walk on the treadmill, lift weights, or stretch it out on the mats makes all the difference during these long, cold winter days.",date:"Mar 6, 2026",read:"1 min",cat:"Community",img:"images/gazette/post-7.jpg",body:`A big thank you to Seldovia Village Tribe for providing such a beautiful fitness center for our community. Having a warm, welcoming place to walk on the treadmill, lift weights, or stretch it out on the mats makes all the difference during these long, cold winter days.

If you've been meaning to get moving, this is your nudge… it's right here in town and ready for you. We're lucky to have it!`},
 {title:"Did you know your name often has a special meaning or history behind it?",excerpt:"Some names come from nature, some from family traditions, and others from different cultures around the world.",date:"Mar 5, 2026",read:"1 min",cat:"Community",img:"images/gazette/post-8.jpg",body:`Did you know your name often has a special meaning or history behind it? Some names come from nature, some from family traditions, and others from different cultures around the world.

Does your name's meaning match your personality? We'd love to hear!

My 3 children's names mean Handsome, Poet, From the Sea! What are the meanings of your kids names?`},
 {title:"March 2026 Photo Contest – “Color in Motion”",excerpt:"March is here, and with it comes longer days, warmer temps (fingers crossed), and all the vibrant energy of early spring in Seldovia!",date:"Mar 5, 2026",read:"1 min",cat:"Events",img:"images/gazette/post-9.jpg",body:`March 2026 Photo Contest – "Color in Motion"

March is here, and with it comes longer days, warmer temps (fingers crossed), and all the vibrant energy of early spring in Seldovia!`},
 {title:"Walk along the quiet docks, watch the waves ripple under the sunset, and feel the gentle rhythm of life here in Seldovia.",excerpt:"This is a place where your soul can rest, where every moment reminds you of home.",date:"Mar 4, 2026",read:"1 min",cat:"Living Here",img:"",body:`Walk along the quiet docks, watch the waves ripple under the sunset, and feel the gentle rhythm of life here in Seldovia. This is a place where your soul can rest, where every moment reminds you of home, and where nature and community come together in perfect harmony. 🦅❤️`},
 {title:"Answer: Wooden boardwalks!",excerpt:"Back in the day, this coastal town relied on wooden boardwalks instead of paved streets.",date:"Mar 3, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-03-03.jpg",body:`Answer: Wooden boardwalks!

Back in the day, this coastal town relied on wooden boardwalks instead of paved streets. These walkways connected homes, shops, and docks, allowing residents to move around easily along the waterfront.

Fun fact: Some of Seldovia's boardwalks are still in use today, preserving a piece of the town's unique history and charm!`},
 {title:"Dr. Seuss, born Theodor Seuss Geisel, was an American author and illustrator famous for his whimsical rhymes.",excerpt:"In our little Alaska coastal town, imagination is everywhere, on the boardwalk, by the lagoon, and even in the snow!",date:"Mar 2, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-03-02.jpg",body:`Dr. Seuss, born Theodor Seuss Geisel, was an American author and illustrator famous for his whimsical rhymes, imaginative characters, and playful stories that have delighted children and adults around the world for generations.

In our little Alaska coastal town, imagination is everywhere, on the boardwalk, by the lagoon, and even in the snow!

💡 Question for you: If you could spend a day in a Dr. Seuss world here in Seldovia, what kind of adventure would you have?`},
 {title:"With boardwalks full of stories and eagles in the sky, Seldovia shows us that freedom can be simple.",excerpt:"With boardwalks full of stories and eagles in the sky, Seldovia shows us that freedom can be simple. Happy March!",date:"Mar 1, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-03-01.jpg",body:`With boardwalks full of stories and eagles in the sky, Seldovia shows us that freedom can be simple. Happy March! 🌿🦅`},
 {title:"Just another beautiful sunrise over the Seldovia lagoon.",excerpt:"Just another beautiful sunrise over the Seldovia lagoon.",date:"Feb 28, 2026",read:"1 min",cat:"Living Here",img:"",body:`Just another beautiful sunrise over the Seldovia lagoon. 🌊`},
 {title:"In Seldovia, getting around isn't just about going from point A to point B, it's about reading the world around you.",excerpt:"A child trudges across the icy roads, watching for black ice and wearing good boots with traction is important!",date:"Feb 27, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-27.jpg",body:`In Seldovia, getting around isn't just about going from point A to point B, it's about reading the world around you.

A child trudges across the icy roads, watching for black ice and wearing good boots with traction is important! Every step is a lesson in patience and observation. Nearby, a snowmobile glides over a trail, the rider adjusting balance and speed to navigate hidden dips, drifted snow, and icy patches.

Out on the harbor, boats move like chess pieces, guided by tides, wind, and currents. Docking isn't casual; it's a careful calculation of angle, momentum, and timing, learned through repeated trips and watching elders handle tricky dockings. Even foggy mornings become a classroom, residents read the wind, track barometric shifts, and rely on hand signals and radios to communicate across distance.

These skills aren't just practical they're survival, honed through years of trial and error, taught by neighbors, and passed down to the next generation. In Seldovia, transportation is a dance with nature, and anyone who masters it gains more than mobility, they gain confidence, awareness, and a deep respect for the environment.`},
 {title:"In Seldovia, life is shaped by nature itself.",excerpt:"In Seldovia, life is shaped by nature itself.",date:"Feb 26, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-26.jpg",body:`In Seldovia, life is shaped by nature itself. 🌊🦅`},
 {title:"Life in Seldovia comes with unique challenges.",excerpt:"When storms block the harbor with ice (either here or in Homer) residents can't just race to the other side of the bay.",date:"Feb 25, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-25.jpg",body:`Life in Seldovia comes with unique challenges. When storms block the harbor with ice (either here or in Homer) residents can't just race to the other side of the bay. When winter freezes pipes or heavy snow damages a dock, ingenuity becomes essential.

Some favorite DIY fixes include:

❄️ Frozen Pipes: Using insulation, heated cables, or temporary reroutes until permanent solutions can be installed.

❄️ Dock Repairs: Quick boarding or reinforced supports to keep vessels safe during unpredictable tides.

❄️ Power or Heating Issues: Backup generators, wood stoves, and creative energy-saving setups to get through outages.

In a town where waiting for deliveries isn't an option, resourcefulness is survival and neighbors sharing knowledge and lending hands make these solutions possible.

Here, DIY isn't just about fixing problems; it's about keeping life flowing, staying connected, and learning from each challenge.`},
 {title:"Answer: A naturally sheltered bay!",excerpt:"Unlike many coastal towns, Seldovia benefits from a naturally sheltered bay that shields boats and docks from the full force of rough waters.",date:"Feb 24, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-24.jpg",body:`Answer: A naturally sheltered bay!

Unlike many coastal towns, Seldovia benefits from a naturally sheltered bay that shields boats and docks from the full force of rough waters. This calm harbor has been essential for fishing boats at harbor, transportation, and daily life in town.

Fun fact: This natural protection helped Seldovia grow into a thriving community, allowing residents to safely dock vessels even in harsh Alaskan weather!`},
 {title:"What safety tips would you share with other parents when it comes to kids playing on ices over lakes or trails?",excerpt:"Here are a few that work for our family: dress for visibility and warmth, set firm boundaries, and encourage buddy play.",date:"Feb 23, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-23.jpg",body:`What safety tips would you share with other parents when it comes to kids playing on ices over lakes or trails? Here are a few that work for our family:

🌊 Dress for visibility and warmth. Bright colors, reflective strips, and waterproof layers help kids stay seen and protected from cold and wind. Good boots with traction reduce slipping on icy paths.

🌊 Set firm boundaries. Teach children which areas are safe and which are off-limits especially near any moving water, thin ice, or steep edges. Clear rules make it easier for kids to play with confidence.

🌊 Encourage buddy play. Kids should never play alone on remote trails. Having a friend nearby means quicker help if someone slips or gets scared.

With guidance and shared responsibility, icy places (roads, frozen lakes) and trails can remain places of adventure instead of risk. In a close-knit town, safety grows when adults stay alert and children learn to respect the environment around them.`},
 {title:"Answer: 1845 feet long, perfect for the daily Cesna 172 or 206, and Pipers, Beavers, Navahos can also operate on these shorter runways, and of course an occasional helicopter.",excerpt:"Seldovia's airport isn't your typical commercial hub, it's a small regional airstrip designed for bush planes.",date:"Feb 22, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-22.jpg",body:`Answer: 1845 feet long, perfect for the daily Cesna 172 or 206, and Pipers, Beavers, Navahos can also operate on these shorter runways, and of course an occasional helicopter.

Seldovia's airport isn't your typical commercial hub, it's a small regional airstrip designed for bush planes, which are essential for connecting remote Alaska communities. These airports handle small aircraft that can land on shorter runways, making travel, deliveries, and emergency services possible in areas where roads are limited or nonexistent.

Fun fact: Bush planes are a lifeline for towns like Seldovia, bringing everything from groceries to visitors, and even providing medevac services when needed.`},
 {title:"In a town like Seldovia, cut off from the road system, medical emergencies are met with calm, preparation, and community trust.",excerpt:"There's no quick drive to a hospital, no rush of sirens down highways.",date:"Feb 21, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-02-21.jpg",body:`In a town like Seldovia, cut off from the road system, medical emergencies are met with calm, preparation, and community trust. There's no quick drive to a hospital, no rush of sirens down highways. Instead, response begins with awareness knowing the weather, the tides, and the available options before an emergency ever happens.

Residents learn early to be prepared. Homes are stocked with first-aid supplies, neighbors know who has medical training, and communication travels fast when something isn't right.

In moments of urgency, we have a fantastic volunteer fire and EMS department. With an ambulance and firetruck we are able to offer first line support! Many people step in without hesitation, checking on one another, making calls, and coordinating help while staying steady and focused.

We also have a beautiful and brand new clinic in town that can help anyone needing care. It is staffed with providers that travel from the Homer side on a very regular basis.

However, in an emergency, on off hours, in the dark or during bad weather, transportation to a hospital becomes a critical piece. Depending on conditions, help may arrive/depart by boat or air, and timing is everything. Weather can delay movement, so patience and clear thinking matter just as much as speed. These moments reveal how deeply residents rely on trust, not just in systems, but in each other.`},
 {title:"Visiting a place like Seldovia is a privilege and with it comes an unspoken understanding of respect for both the people and the place.",excerpt:"In a town where everyone knows each other, and the harbor is both livelihood and community hub, visitors quickly learn that their actions ripple beyond themselves.",date:"Feb 19, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-19.jpg",body:`Visiting a place like Seldovia is a privilege and with it comes an unspoken understanding of respect for both the people and the place. In a town where everyone knows each other, and the harbor is both livelihood and community hub, visitors quickly learn that their actions ripple beyond themselves.

Simple gestures make a difference: giving way on narrow docks, asking before photographing someone's property or boat, and showing patience when schedules are influenced by tides or weather. Taking the time to listen, learn, and engage with locals fosters goodwill and creates meaningful experiences that go beyond sightseeing.

Being mindful also means participating thoughtfully in shared spaces. Leaving no trace, following rules, and supporting small businesses all contribute to the town's rhythm and sustainability. Visitors who approach Seldovia with curiosity and care often find themselves welcomed like neighbors, not strangers.

In a tight-knit harbor town, respect isn't just polite—it's essential to maintaining the balance that makes life here special. Visitors who honor that balance leave with memories of connection, kindness, and the unique beauty of a community shaped by both water and tradition.`},
 {title:"It was a mean night on the Richardson Highway back in '98.",excerpt:"Snow blowing sideways, wind cutting like a knife, and the kind of cold that makes you glad you plugged the block heater in before leaving Delta Junction.",date:"Feb 18, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-18.jpg",body:`It was a mean night on the Richardson Highway back in '98. Snow blowing sideways, wind cutting like a knife, and the kind of cold that makes you glad you plugged the block heater in before leaving Delta Junction.

I was heading north in my old Ford when I saw headlights cocked off the shoulder. Guy had slid his truck into the ditch. Wife in the cab with a baby, all of them looking half-frozen. I pulled over, grabbed the tow strap I always carry, and yanked him out. Truck was running rough after the slide, so I told them to follow me.

Mechanic in town was closed, so I took them to my place instead. My wife heated up some moose stew, got the baby warm by the wood stove, and we let them crash on the couch. Next morning I helped the husband, Tom was his name, swap a bad belt with parts I had lying around.

Tom was a fisherman from Homer, up looking for winter work after the season went flat. They were scraping bottom, baby on the way had changed everything. I gave him a couple hundred bucks I could spare and a lead on a warehouse job a buddy mentioned. He shook my hand hard, said he wouldn't forget it. I shrugged. Out here you stop when somebody's in trouble. That's just how it is.

Fifteen years later I'm in the Fred Meyer in Fairbanks when a young man walks up. "You're the one who pulled my dad out of that ditch, right?" Turns out he was Tom's son, all grown.

Tom had told that story so many times it became family scripture. Read more here: https://www.seldoviaproperty.com/.../it-was-a-mean-night…`},
 {title:"Happy Random Acts of Kindness Day from Seldovia!",excerpt:"Today is all about spreading a little love and making someone's day brighter whether it's a smile, a helping hand, or a thoughtful note.",date:"Feb 17, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-02-17.jpg",body:`Happy Random Acts of Kindness Day from Seldovia! 😘

Today is all about spreading a little love and making someone's day brighter whether it's a smile, a helping hand, or a thoughtful note. It's often the small gestures that make the biggest difference.

Take a moment to do something kind for someone today, you never know the ripple effect it might have! 😊`},
 {title:"Today, we honor the leaders who shaped our nation and celebrate the history that brings us together.",excerpt:"Whether you're spending the day relaxing, enjoying winter adventures, or cozying up at home, we hope it's a wonderful day filled with gratitude and good moments.",date:"Feb 16, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-02-16.jpg",body:`Today, we honor the leaders who shaped our nation and celebrate the history that brings us together.

Whether you're spending the day relaxing, enjoying winter adventures, or cozying up at home, we hope it's a wonderful day filled with gratitude and good moments. 🙏`},
 {title:"Here's a quick summary of what really matters when buyers hunt for a home in Seldovia, it's not just about the pretty waterfront view (though that's nice too!):",excerpt:"Walkable proximity, outdoor living spaces, and flexible multi-functional interiors — the features that turn a house into a true home.",date:"Feb 15, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-02-15.jpg",body:`Here's a quick summary of what really matters when buyers hunt for a home in Seldovia, it's not just about the pretty waterfront view (though that's nice too!):

🌿 Walkable proximity to the harbor, town center, stores, school, and community spots, because Seldovia is truly a walking town where everything feels close and connected.

🌿 Outdoor living spaces like decks, patios, or yards, perfect for soaking in those stunning mountain and harbor views, hosting summer gatherings, watching wildlife, or just relaxing on those endless sunny days.

🌿 Flexible, multi-functional interiors — extra rooms or open layouts that work as guest spaces, workshops, home offices, or cozy spots to ride out the long, dark winters with hobbies, work, or family time.

In a place like Seldovia, the perfect home isn't just four walls and a roof, it really supports the whole lifestyle here. It's about making everyday life easier, staying tied to our community, and being able to fully embrace the incredible natural beauty all around us.

Whether you're strolling to the docks for coffee, firing up the grill on your deck with friends as the sun lingers forever, or curling up in a cozy multi-purpose room when winter rolls in, these features turn a house into a true home in one of the most special spots on earth.

What about you, if you were picking a place in Seldovia, which of these would be your top must-have?`},
 {title:"Happy Valentine's Day from Seldovia, Alaska!",excerpt:"Whether you're celebrating with a loved one, family, friends, or even treating yourself, today is all about love, kindness, and the little moments that make life special.",date:"Feb 14, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-02-14.jpg",body:`Happy Valentine's Day from Seldovia, Alaska!

Whether you're celebrating with a loved one, family, friends, or even treating yourself, today is all about love, kindness, and the little moments that make life special. From cozy winter walks to shared smiles by the fire, or walks on the beach… may your day be full of warmth and happiness! ❤️`},
 {title:"In most places, road access is considered essential. In Seldovia, the water often matters more.",excerpt:"Buyers here are drawn less by highways and driveways, but by the quiet pull of the harbor and the wide-open views of mountains and tidewater.",date:"Feb 13, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-02-13.jpg",body:`In most places, road access is considered essential. In Seldovia, the water often matters more. Buyers here are drawn less by highways and driveways, but by the quiet pull of the harbor and the wide-open views of mountains and tidewater. A home facing the water offers something roads cannot: a front-row seat to nature's daily rhythms.

For many buyers, this connection to the water represents freedom rather than limitation. Boats replace cars, running lines and docks replace driveways, and travel becomes an experience rather than a task.

In Seldovia, choosing a waterfront home isn't about giving something up. It's about choosing what matters more: connection over convenience, scenery over speed, and a way of life guided by tides instead of traffic. For many buyers, that trade is exactly what makes a property truly valuable.

Take a look at one of my amazing waterfront listings right on Seldovia Bay here: https://my.flexmls.com/jennychissus/search/office_listing_categories/Active/listings/20230910205956685677000000?_variant=`},
 {title:"While we are still in the middle of winter, we anticipate a time when winter finally loosens its grip on Seldovia.",excerpt:"Waterfront properties tell a unique story of the season they've endured.",date:"Feb 12, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-02-12.jpg",body:`While we are still in the middle of winter, we anticipate a time when winter finally loosens its grip on Seldovia. Waterfront properties tell a unique story of the season they've endured. Snowmelt seeps into the soil, winds leave their mark on docks and railings, and months of salt air and ice quietly test every board, beam, and window.

The first step is observation. Owners walk the shoreline slowly, noting ice damage, loose boards, and areas where tides may have shifted the ground. Docks are checked for stability, cleats tightened, and pilings inspected for wear. Even small repairs matter here, where the next storm or high tide can undo months of neglect.

If you are not here in the winter, your home needs attention, and my husband and son run Winter Watch, a business here in Seldovia, that will keep an eye on your property over the long dark winter months. Making sure windows aren't broken in a storm, the heat stays on (or returns after a power outage) and the roofs and decks aren't collecting dangerous amounts of snow. They are your eyes and ears while you are away, making sure there aren't unwanted visitors in your absence. They will also keep your driveways plowed and clear for for fuel delivery and emergency access as well as safe comings and goings for those who enjoy winters in Seldovia but need that extra bit of help!

Maintaining a waterfront property during and after winter isn't just about fixing what may have broken, it's about readying a home for the life that returns with spring.`},
 {title:"In Seldovia, the harbor isn't just a spot for tying up boats, it's where our stories live on, carried in every tide and etched into every weathered dock.",excerpt:"This year, our principal at Susan B. English School, Diane Maples, gave students an exciting challenge: build a solid business plan and pitch it Shark Tank-style.",date:"Feb 11, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-02-11.jpg",body:`In Seldovia, the harbor isn't just a spot for tying up boats, it's where our stories live on, carried in every tide and etched into every weathered dock.

The elders still share tales of simpler times: fishing with basic gear and hardworking hands, reading storms in the sky's shifting colors, and how this small harbor served as the true center of work, laughter, and neighborly support.

This year, our principal at Susan B. English School, Diane Maples, gave the junior high and high school students an exciting challenge: build a solid business plan and pitch it Shark Tank-style to a panel of local business leaders.

The kids had to think through everything, from the core idea to marketing, budgeting, and teaming up with each other or other businesses in town, while focusing on what our community and visitors really need. It all had to stay true to Seldovia's soul: our traditions, our people, the stunning natural beauty around us, and a deep respect for our history and culture.

I was genuinely honored (and a tad nervous) when they asked me to join the "sharks." Out of the 11 presentations, almost every one centered on serving tourists in creative ways: Read more here https://www.seldoviaproperty.com/.../in-seldovia-the…`},
 {title:"In Seldovia, summer brings warmth, long days, and a sense of possibility that draws people in from near and far.",excerpt:"Many arrive with a seasonal mindset a temporary retreat from the bustle of city life.",date:"Feb 10, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-10.jpg",body:`In Seldovia, summer brings warmth, long days, and a sense of possibility that draws people in from near and far. Many arrive with a seasonal mindset a temporary retreat from the bustle of city life.

Over time, seasonal owners begin to see themselves not as visitors, but as part of the community. They learn the names of neighbors, volunteer for local projects, and invest not just in property, but in the people and the town itself. The quiet pride of contributing, of being recognized as part of Seldovia's fabric, transforms a temporary escape into a lifelong home.

In Seldovia, summer may be fleeting, but the connections it creates are enduring. Many who once came for just a few months find that leaving is never truly an option—the town, the people, and the way of life have become a part of them.`},
 {title:"OK - dates are crazy!",excerpt:"The ACTUAL due date is February 15, 2026 for the Property Tax exemption application with the Kenai Peninsula Borough.",date:"Feb 10, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-02-10_2.jpg",body:`OK - dates are crazy!

LOL!  The ACTUAL due date is February 15, 2026 for the Property Tax exemption application with the Kenai Peninsula Borough.

However, February 15 is a SUNDAY, so they pushed it to the 16th (which is why I had that noted on my card for you all) but the 16th is President's Day and the borough is CLOSED!  So, the actual drop dead due date is February 17 by 5pm.

But hey, don't procrastinate - just get it done today! 🙂.

I wanted to confirm the date situation because I did have someone ask me - and so I talked to Cynthia at the KPB and she confirmed that if you must wait til the last minute - your application has to be submitted online by 5pm on the 17th or if mailed, it must be postmarked by the 17th!

All the info on the exemptions, including Senior and Disabled Veteran and Volunteer Firefighter exemptions are on this page:
https://www.kpb.us/.../assessing-forms/exemptions-deferments`},
 {title:"Today is the perfect excuse to enjoy your favorite slice (or two… or three 😉).",excerpt:"So grab a slice, share it with someone you love, and make today extra delicious!",date:"Feb 9, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-02-09.jpg",body:`Today is the perfect excuse to enjoy your favorite slice (or two… or three 😉).

So grab a slice, share it with someone you love, and make today extra delicious!

Breezy's makes a very good pizza - do check it out! The bread part (crust - LOL) is AMAZING!`},
 {title:"Surviving winter in Seldovia isn't just about enduring cold, it's about living in harmony with it.",excerpt:"In a town without roads, transportation becomes a careful dance with nature.",date:"Feb 7, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-07.jpg",body:`Surviving winter in Seldovia isn't just about enduring cold, it's about living in harmony with it. In a town without roads, transportation becomes a careful dance with nature: even if our harbor isn't frozen in Seldovia, boats are docked for sometimes a few weeks, awaiting Homer's harbor to thaw, planes are scheduled around weather, and snowmobiles or sleds taking over daily routes. Planning ahead isn't optional, it's survival.

In Seldovia, we all know the importance of not just a BIG but a stocked pantry, as sometimes fresh food and resources become a community effort. Local fishermen, hunters, and gardeners share their summer harvests, while neighbors take care of each other, firewood, and homemade preserves. What goes around comes around, and we all are eager to lend a hand. Even small acts, checking on a neighbor's roof after a storm or helping clear snow from the docks, can make the difference between comfort and hardship.

Health and wellness are tightly linked to connection. Doctors and emergency services are limited, so residents rely on each other. Parents teach kids outdoor skills early—fire-starting, ice navigation, and reading weather signs, skills that build confidence and safety in a harsh landscape. Mental resilience is equally important; neighbors create warmth through shared meals, stories, and traditions that turn isolation into community.`},
 {title:"My office, my happy place!",excerpt:"You're always welcome to stop by and say hello!",date:"Feb 6, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-02-06.jpg",body:`My office, my happy place! You're always welcome to stop by and say hello! 👋`},
 {title:"So when it comes time to leave, it isn't just geography you're stepping away from.",excerpt:"It's the rhythm of life you've grown into. It's the simple certainty of belonging to a place where time feels different.",date:"Feb 5, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-05.jpg",body:`So when it comes time to leave, it isn't just geography you're stepping away from. It's the rhythm of life you've grown into. It's the simple certainty of belonging to a place where time feels different, where the world feels smaller but somehow more meaningful.

Even when new places promise opportunity, Seldovia leaves its imprint on you, a deep sense of home that cannot be traded for convenience or forgotten with distance.

Leaving may take you elsewhere, but Seldovia rests with you. It stays in the habits you carry forward, in the values shaped by connection and care, and in the quiet moments when your heart still listens for the sound of water against the docks or shore, as if home might answer back.`},
 {title:"Stay warm, savor every spoonful, and enjoy the simple comforts of winter in Seldovia.",excerpt:"Stay warm, savor every spoonful, and enjoy the simple comforts of winter in Seldovia.",date:"Feb 4, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-04.jpg",body:`Stay warm, savor every spoonful, and enjoy the simple comforts of winter in Seldovia. 💛`},
 {title:"An ordinary day in Seldovia begins quietly, with soft light over the harbor and the call of seabirds echoing through town.",excerpt:"Mornings unfold with simple rituals: coffee by the window, kids heading off to school, fishermen preparing for the day.",date:"Feb 3, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-03.jpg",body:`An ordinary day in Seldovia begins quietly, with soft light over the harbor and the call of seabirds echoing through town.

Mornings unfold with simple rituals: coffee by the window, kids heading off to school, fishermen preparing for the day, and shop doors and coffee shops opening with familiar smiles. By afternoon, the town quietly hums with steady life, errands run on foot, quick conversations happen at the Post Office between tasks, and the natural world offers its own small wonders, from eagles circling overhead to the twice daily tide changing course.

As evening settles in, the mountains glow with fading sunlight and homes fill with warmth and conversation. Dinner is shared, stories are told, and the pace of the day slows even more.

Nothing grand may have happened, yet everything feels full.`},
 {title:"In Seldovia, childhood is a year-round adventure shaped by the rhythm of the seasons.",excerpt:"In winter, kids stuff feet and pants into snow boots, grab gloves and hats, run through snow-dusted streets, sliding down icy hills.",date:"Feb 2, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-02-02.jpg",body:`In Seldovia, childhood is a year-round adventure shaped by the rhythm of the seasons. In winter, kids stuff feet and pants into snow boots, grab gloves and hats, run through snow-dusted streets, sliding down icy hills, and racing along frozen harbor edges and skating or playing hockey along the waterfront.

When summer arrives, the snow boots give way to sandals, tennis shoes and bare feet. Children explore tide pools along the shoreline, fish from the docks, or chase each other through sunlit parks and endless bike riding through town. Long evenings stretch like golden ribbons, filled with the smell of grilled seafood, berry picking, and the hum of community celebrations. Every day feels wide open, a chance to discover the beauty of the natural world that surrounds them.

Growing up in Seldovia means experiencing two very different worlds. It's a childhood where the seasons aren't just a backdrop, but a playground, a classroom, and a canvas for memories that last a lifetime.`},
 {title:"Want to make sure your application has been received?",excerpt:"Enter your Parcel Information Number (PIN) into the search field.",date:"Jan 31, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-01-31.jpg",body:`Want to make sure your application has been received? 👇

Enter your Parcel Information Number (PIN) into the search field.
https://www.kpb.us/.../assessing-forms/exemptions-deferments

If your parcel has been successfully submitted, it will appear in the results along with the date submitted.

Not sure what your PIN is? You can find it using
https://geo.kpb.us/vertigisstudio/web/....

For step-by-step instructions on identifying your parcel number, click
https://www.kpb.us/.../Identify%20Your%20Parcel%20with....`},
 {title:"Happy National Puzzle Day!",excerpt:"Drop it in the comments and see if others feel the same energy this season.",date:"Jan 29, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-29.jpg",body:`Happy National Puzzle Day!

Drop it in the comments and see if others feel the same energy this season. 🌼🌸`},
 {title:"In Seldovia, every season tells its own story, and potlucks become a way to live within that story.",excerpt:"Summer potlucks are woven into the rhythm of long days and endless light; winter potlucks are a quiet celebration of endurance, warmth, and community spirit.",date:"Jan 28, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-28.jpg",body:`In Seldovia, every season tells its own story, and potlucks become a way to live within that story.

Summer potlucks are woven into the rhythm of long days and endless light. Neighbors gather on sun-warmed docks or in gardens bursting with produce, bringing dishes that reflect the season's abundance freshly caught fish, berries still glistening from morning harvests, and pies that carry the taste of the sun. Children's laughter echoes across the harbor while boats sway gently in the water, and conversations drift into the evening as if time itself slows to accommodate connection.

Winter potlucks, by contrast, are a quiet celebration of endurance, warmth, and community spirit. With snow blanketing rooftops and frozen edges along the harbor, gatherings move indoors to kitchens and community halls where the scent of simmering stews and baking bread fills every corner. Stories are shared by firelight, laughter rings louder in the cozy spaces, and even simple acts, lending a hand with dishes or sharing a jar of preserves, take on a profound meaning. We love serving up our summer King Salmon as salmon patties, rich with butter and dill - could eat those all day!  These gatherings remind everyone that, even in the darkest months, connection and care sustain the heartbeat of the town.

Both celebrate the way neighbors come together, turning simple dishes into memories, and ordinary days into moments that linger long after the last plate is cleared.`},
 {title:"You know, living in a small, tight-knit town like this really changes what “neighbors” means.",excerpt:"They're not just the people next door, they truly become like extended family.",date:"Jan 27, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-27.jpg",body:`You know, living in a small, tight-knit town like this really changes what "neighbors" means. They're not just the people next door, they truly become like extended family. Especially as a parent, that kind of support is everything.

If your car won't start one morning, someone's already offering you a ride or give you a jump. When work and school schedules collide, another neighbor happily steps in to watch the kids for a bit.

All those big celebrations, little milestones, and even the everyday ups and downs, they get shared. It builds this beautiful web of care that just feels like family.

Here, parents aren't raising their kids in isolation. We're all in it together, alongside friends and neighbors who know the daily rhythm of life in this place. That network of trust and genuine kindness is what turns a town into a real community. No one feels like they're doing it all alone, and every kid grows up wrapped in way more love than any single family could ever give on their own.`},
 {title:"Time to celebrate the one who laughs at your bad jokes, supports your crazy ideas, and makes life more fun every day.",excerpt:"Don't forget hugs, high-fives, or even a little dance in the kitchen count today!",date:"Jan 26, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-26.jpg",body:`Time to celebrate the one who laughs at your bad jokes, supports your crazy ideas, and makes life more fun every day.

Don't forget hugs, high-fives, or even a little dance in the kitchen count today! 💃🕺`},
 {title:"The day often starts quietly down at the harbor, with that soft morning mist rolling over the water and seabirds calling in the distance.",excerpt:"A wedding in Seldovia isn't only about the two people getting married, it's all about their families, the community, and even the town itself weaving in.",date:"Jan 25, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-25.jpg",body:`The day often starts quietly down at the harbor, with that soft morning mist rolling over the water and seabirds calling in the distance.

People are moving around in their homes, families getting ready, neighbors popping by with a smile or a quick hello. All the little preparations just blend right into the normal rhythm of life here, no big rush, just that easy, familiar flow.

When the couple says their vows, it's usually right there with the mountains and oceans in view. The natural surroundings feel like they're joining in, eagles might drift overhead, the sun catches on the ripples, and the surroundings are hushed, like it's listening. Everything's intimate and unhurried.

There's none of that frantic pace you get in bigger places; here, you really feel every moment.Then as the sun starts to set and the sky turns that warm gold pink or red over the water, there's this quiet sense of it all coming together.

A wedding in Seldovia isn't only about the two people getting married, it's all about their families, the community, and even the town itself weaving in. Everyone's there in spirit, part of the celebration, and it leaves these memories that stick with you long after the vows are spoken. 💗`},
 {title:"Parents wake early, the soft light spilling over the water that surrounds the town.",excerpt:"First comes checking on their kids making sure breakfast is ready, backpacks are packed, and that everyone is out the door safely.",date:"Jan 24, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-24.jpg",body:`Parents wake early, the soft light spilling over the water that surrounds the town. First comes checking on their kids making sure breakfast is ready, backpacks are packed, and that everyone is out the door safely.

By mid-morning, people weave their way through tasks that are part business, part community service. A neighbor waves from across the street; they trade a quick update about the upcoming community meeting. Deliveries are scheduled around tide times, and sky weather, emails wait patiently, and calls sometimes happen from the edge of the harbor.

Lunchtime brings a moment to breathe watching the eagles circle overhead, listening to the quiet hum of the harbor. By afternoon, it's errands, check-ins with neighbors, helping a friend repair a roof or untangle a net. Evenings are for family: homework, dinner, maybe a quick walk to say hello to another neighbor or lend a hand.

As the sun dips behind the mountains, they feel the subtle satisfaction of the day: work done, family cared for, community touched. Life here isn't always easy, and balance is never perfect but every connection, every small act, threads together the tapestry of living in a place where roads may be few, but hearts are close.`},
 {title:"Just another beautiful reminder of life in Seldovia, eagles right outside your door.",excerpt:"Just another beautiful reminder of life in Seldovia, eagles right outside your door.",date:"Jan 23, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-23.jpg",body:`Just another beautiful reminder of life in Seldovia, eagles right outside your door. 🦅`},
 {title:"In Seldovia, shopping isn't just a routine it's a chance to connect.",excerpt:"Locals know each other by name at the Crabpot, Flube or meeting True North Air out at the airport, swapping stories.",date:"Jan 22, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-22.jpg",body:`In Seldovia, shopping isn't just a routine it's a chance to connect. Locals know each other by name at the Crabpot, Flube or meeting True North Air out at the airport, swapping stories, sharing tips on the best catch of the week, or asking how someone's family is doing. Every trip around town is an opportunity to strengthen community ties.

Cooking in Seldovia is deeply tied to the land and the sea. Fresh fish, berries (frozen from summer's harvest in the winter), and garden produce often make their way to family tables, while traditional recipes are passed down through generations. Meals aren't just about nourishment, they're about sharing family stories, teaching kids skills, and celebrating local flavors.

Connections extend beyond the kitchen. Neighbors help each other out with ingredients, lend kitchen tools, or gather for a spontaneous meal. Potlucks, holiday feasts, and simple dinners alike become moments where the community comes together. In Seldovia, food and shopping are never just practical, they're woven into the fabric of everyday life, keeping people close, caring, and connected.`},
 {title:"Life in Seldovia may feel remote, but the community is anything but isolated when it comes to safety.",excerpt:"The local fire departments are always ready, staffed by dedicated volunteers who know every street, dock, and trail.",date:"Jan 20, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-20.jpg",body:`Life in Seldovia may feel remote, but the community is anything but isolated when it comes to safety. The local fire departments are always ready, staffed by dedicated volunteers who know every street, dock, and trail. From emergency calls to fire prevention education, they're the backbone of safety in town.

The clinic provides essential healthcare services, from routine check-ups to urgent care, keeping residents healthy and supported close to home. Having medical care nearby is a comfort that makes life here feel secure, especially for families and older adults.

Beyond formal services, the community plays a huge role in safety. Neighbors watch out for one another, the City and Fire & EMS organizes preparedness events, and everyone pitches in during emergencies. Whether it's a storm, a health concern, or a town-wide project, people come together quickly and effectively. 🙏`},
 {title:"Today we honor Martin Luther King Jr. and his powerful legacy of equality, courage, and service.",excerpt:"On this day, may we take time to reflect, listen, and find small ways to serve our communities with kindness and respect.",date:"Jan 19, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-19.jpg",body:`Today we honor Martin Luther King Jr. and his powerful legacy of equality, courage, and service. 🙏

On this day, may we take time to reflect, listen, and find small ways to serve our communities with kindness and respect carrying his vision forward through our everyday actions.`},
 {title:"Today is all about sharing warmth, flavor, and time with family and friends.",excerpt:"Soup Swap Day started in 2006 when Knox Gardner and a friend in Seattle invited people to swap homemade soups.",date:"Jan 17, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-17.jpg",body:`Today is all about sharing warmth, flavor, and time with family and friends. 🍲

Soup Swap Day started in 2006 when Knox Gardner and a friend in Seattle invited people to swap homemade soups and it quickly became a cozy tradition celebrated across the U.S. and beyond.

Whether you're making your favorite recipe, trying a new one, or simply enjoying the comfort of a hot bowl with loved ones, it's the perfect excuse to connect, share, and savor the season.

What is your favorite soup and why?`},
 {title:"Teaching in Seldovia goes far beyond lesson plans and classroom hours.",excerpt:"Here, educators aren't just teachers, they're neighbors, mentors, coaches, and trusted members of the community.",date:"Jan 16, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-16.jpg",body:`Teaching in Seldovia goes far beyond lesson plans and classroom hours. Here, educators aren't just teachers, they're neighbors, mentors, coaches, and trusted members of the community. In a small town, the impact of a teacher reaches well outside the school walls.

Class sizes are small, which allows teachers to truly know their students, their strengths, challenges, families, and interests. Learning is personal, flexible, and shaped by the needs of each child. Teachers often guide the same students for years, watching them grow not just academically, but as individuals.

Teaching in Seldovia isn't just about shaping minds. It's about shaping lives, building trust, and becoming part of a place where education is woven into the heart of the community.`},
 {title:"Going to school in a remote Alaska town is an experience shaped as much by the community and landscape as by the classroom itself.",excerpt:"Schools are small, often serving multiple grade levels under one roof.",date:"Jan 14, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-14.jpg",body:`Going to school in a remote Alaska town is an experience shaped as much by the community and landscape as by the classroom itself. Schools are small, often serving multiple grade levels under one roof.

Students grow up learning alongside the same classmates year after year, forming bonds that feel more like family than friendships. Teachers know not only their students, but their parents, siblings, and stories—education here is deeply personal.

The environment is part of the curriculum. Weather isn't an inconvenience; it's a teacher. Students learn early how to respect the elements, plan ahead, and adapt when conditions change.

Most importantly, students grow up with a strong sense of place. They learn where they come from, why it matters, and how to care for it.`},
 {title:"Clear your desk, clear your mind!",excerpt:"Does anyone else have trouble with this? I want everything at my fingertips… which means my desk is full!",date:"Jan 12, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-12.jpg",body:`Clear your desk, clear your mind!

Does anyone else have trouble with this? I want everything at my fingertips… which means my desk is full! But I do know that I feel more peaceful with a clean desk - I'll make that a priority today! 😊

Today's the perfect reminder to clear the clutter, organize your workspace, and make room for fresh ideas.`},
 {title:"There are days in Seldovia when you wake up expecting a delivery, only to hear the flight's delayed.",excerpt:"Milk or egg supply might be low, the mailbox emptier than usual, and errands need rethinking.",date:"Jan 11, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-11.jpg",body:`There are days in Seldovia when you wake up expecting a delivery, only to hear the flight's delayed. Milk or egg supply might be low, the mailbox emptier than usual, and errands need rethinking.

That's when you notice the small ways the community keeps life moving. A neighbor drops off extra bread. Another shares a bag of frozen vegetables. Tasks get swapped, meals are stretched or altered, and everyone pitches in quietly to fill the gaps.

Living here teaches resourcefulness and flexibility. It's a reminder that being remote isn't a limitation, it's an invitation to rely on planning, creativity, and the quiet support of a close-knit community.`},
 {title:"January in Seldovia is quieter than most months.",excerpt:"The holidays are behind us, the days are short (but gaining minutes every day) and winter settles in with a calm, sometimes stark, beauty.",date:"Jan 10, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-10.jpg",body:`January in Seldovia is quieter than most months. The holidays are behind us, the days are short (but gaining minutes every day) and winter settles in with a calm, sometimes stark, beauty.

Living through January in Seldovia teaches patience, resilience, and appreciation for the quiet joys often overlooked in busier seasons. It's a month to slow down, connect with community, and find beauty in the stillness. ❄️🌀`},
 {title:"It's never too late…",excerpt:"to plan a stay at the Diamond Center Hotel in Anchorage!",date:"Jan 9, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-09.jpg",body:`It's never too late…

to plan a stay at the Diamond Center Hotel in Anchorage! 🏨✨`},
 {title:"In Seldovia, plans are more like suggestions once winter settles in.",excerpt:"Boats don't always leave when they're supposed to. Flights get delayed. Weather rolls in quietly and stays longer than expected.",date:"Jan 8, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-08.jpg",body:`In Seldovia, plans are more like suggestions once winter settles in. ❄️

Boats don't always leave when they're supposed to. Flights get delayed. Weather rolls in quietly and stays longer than expected. Schedules bend, and sometimes they disappear altogether.

And when that happens, we adjust.

You'll see someone picking up an extra bag of groceries, just in case. A neighbor offering a ride without being asked. A message passed along that something didn't arrive and another message soon after saying, "We'll figure it out."

Winter teaches patience here. It also teaches trust. Trust that if the ferry doesn't come, someone has what you need. If plans fall apart, another plan will form. If the day doesn't go as expected, tomorrow will.

Life slows down when winter takes over, but it doesn't stop. It simply shifts into something quieter and more connected. In Seldovia, flexibility isn't just helpful it's how the community works. 😴🤗`},
 {title:"Today we celebrate National Bird Day!",excerpt:"From bald eagles soaring high over the harbor to seabirds resting quietly along the shoreline, Seldovia is lucky to be surrounded by incredible birdlife year-round.",date:"Jan 5, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-05.jpg",body:`Today we celebrate National Bird Day! 🐦❄️ From bald eagles soaring high over the harbor to seabirds resting quietly along the shoreline, or on your roof, Seldovia is lucky to be surrounded by incredible birdlife year-round.

Even in the heart of winter, these birds bring movement, sound, and life to our skies and waters.

Take a moment today to look up, slow down, and appreciate the wild beauty that makes our community so special.`},
 {title:"Excited to see this home in Seldovia being passed along to a sweet family moving to Seldovia full-time, congratulations!",excerpt:"Excited to see this home in Seldovia being passed along to a sweet family moving to Seldovia full-time, congratulations!",date:"Jan 5, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-01-05_2.jpg",body:`Excited to see this home in Seldovia being passed along to a sweet family moving to Seldovia full-time, congratulations! 😊👨‍👩‍👧‍👦`},
 {title:"In Seldovia, people notice when something feels off.",excerpt:"When a light doesn't turn on at the usual time. When footsteps don't pass by a familiar path. When a door that's always opened in the morning stays closed.",date:"Jan 4, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-04.jpg",body:`In Seldovia, people notice when something feels off. When a light doesn't turn on at the usual time. When footsteps don't pass by a familiar path. When a door that's always opened in the morning stays closed.

No alarms are raised right away. Instead, someone pauses. Someone asks. Someone checks in.

A knock at the door. A call or text message. A quiet walk down the trail "just to make sure everything's okay." Most of the time, it is. And when it's not, help arrives quickly not because it's an obligation, but because it's simply how things work here.

This is the safety net you don't see on a map. It's built from routines, familiarity, and care. From knowing your neighbors' habits without ever needing to say it out loud. From watching out for one another in small, steady ways.

In Seldovia, missing a day doesn't mean being forgotten. It means someone noticed and someone cared enough to check. 😊`},
 {title:"On January 3, 1959, Alaska officially became the 49th state of the United States of America!",excerpt:"Known as the 'Last Frontier,' Alaska was purchased from Russia in 1867 and took nearly a century to become a state.",date:"Jan 3, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-03.jpg",body:`On January 3, 1959, Alaska officially became the 49th state of the United States of America! ❄️

Known as the 'Last Frontier,' Alaska was purchased from Russia in 1867 and took nearly a century to become a state. Today, it's celebrated for its breathtaking landscapes, abundant wildlife, and rich cultural heritage.

We are so thankful to be part of the United States of America!`},
 {title:"As we step into 2026, may your days be filled with joy, peace, and unforgettable moments.",excerpt:"Wishing you and your loved ones a wonderful year ahead!",date:"Jan 1, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-01-01.jpg",body:`As we step into 2026, may your days be filled with joy, peace, and unforgettable moments.

Wishing you and your loved ones a wonderful year ahead! 🎉✨`},
 {title:"From snowy mornings to cozy evenings by the water, Seldovia has been full of beauty, laughter, and unforgettable moments.",excerpt:"Tonight, let's raise our glasses — to friends, family, neighbors, and all the little joys that make life in Seldovia so special.",date:"Dec 31, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-31.jpg",body:`From snowy mornings to cozy evenings by the water, Seldovia has been full of beauty, laughter, and unforgettable moments.

Tonight, let's raise our glasses — to friends, family, neighbors, and all the little joys that make life in Seldovia so special.

Here's to laughter, adventure, and sparkling new memories in the year ahead! 🥂❄️

Thanks to the Swick and Giles families, see you at the fireworks show at the airport tonight!`},
 {title:"Winter calm along Seldovia Slough",excerpt:"Winter calm along Seldovia Slough",date:"Dec 30, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-30.jpg",body:`Winter calm along Seldovia Slough 🦢❄️`},
 {title:"There are times you'll see a neighbor loading extra canned goods into a skiff not for themselves, but for a family who missed the last Tusty run.",excerpt:"Small gestures like these become part of the rhythm of winter.",date:"Dec 29, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-29.jpg",body:`There are times you'll see a neighbor loading extra canned goods into a skiff not for themselves, but for a family who missed the last Tusty run. On another day, someone will chop an extra stack of firewood and leave it at a doorstep with a note: "You never know when the wind'll pick up." Small gestures like these become part of the rhythm of winter.

Errands are carefully planned, shared, and swapped. People trade chores for meals or supplies. A walk down a snowy path often turns into a brief check-in with someone who could use a hand. Even the children's laughter on sledding hills reminds everyone that cold doesn't mean lonely.

It's in these small, shared acts planning, helping, connecting that the heart of the community shines brightest. ❄️💛`},
 {title:"Time's almost up! Just 2 days left to get your entries in!",excerpt:"Time's almost up! Just 2 days left to get your entries in!",date:"Dec 29, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-29_2.jpg",body:`Time's almost up! Just 2 days left to get your entries in!`},
 {title:"How are you spending these chilly days in Seldovia?",excerpt:"How are you spending these chilly days in Seldovia?",date:"Dec 28, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-28.jpg",body:`How are you spending these chilly days in Seldovia?`},
 {title:"It doesn't happen often at all here in Seldovia, but when the harbor freezes, everything slows down.",excerpt:"Living through a frozen harbor teaches patience in a way few things can.",date:"Dec 27, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-26.jpg",body:`It doesn't happen often at all here in Seldovia, but when the harbor freezes, everything slows down.  There was plenty of ice in the harbor last week, but it has already melted, or moved on and we're clear again!

But we are certainly affected by Homer's harbor icing over, Makos can't travel across and heading over out of Seldovia harbor leaves you nowhere to dock!

Boats rest quietly. Footsteps sound sharper. The water that once moved constantly becomes still, almost watchful. Living through a frozen harbor teaches patience in a way few things can.

Living through it doesn't just change how you move through winter—it changes how you see time, patience, and home. ⛄`},
 {title:"From our Seldovia homes to yours, Merry Christmas!",excerpt:"From our Seldovia homes to yours, Merry Christmas!",date:"Dec 25, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-25.jpg",body:`From our Seldovia homes to yours, Merry Christmas! 🎄🎄🎁`},
 {title:"Whether you're spending the evening with family, neighbors, or in the peaceful comfort of home, may your Christmas Eve be filled with warmth, joy, and the simple moments that make this season magical.",excerpt:"May your Christmas Eve be filled with warmth, joy, and the simple moments that make this season magical.",date:"Dec 24, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-24.jpg",body:`Whether you're spending the evening with family, neighbors, or in the peaceful comfort of home, may your Christmas Eve be filled with warmth, joy, and the simple moments that make this season magical. 🎄✨`},
 {title:"Winter in Seldovia brings quiet streets, snow-covered homes, and shorter days but it also brings something deeply meaningful: neighbors looking out for one another.",excerpt:"When storms roll in or the cold settles deep, people check in not because they have to, but because they care.",date:"Dec 23, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-23.jpg",body:`Winter in Seldovia brings quiet streets, snow-covered homes, and shorter days but it also brings something deeply meaningful: neighbors looking out for one another.

A quick text, a knock on the door, helping shovel a path, plowing a burm free on the way, or asking if someone needs supplies before the weather turns. These small gestures happen without announcement or expectation. They're simply part of life here.

When storms roll in or the cold settles deep, people check in not because they have to, but because they care. It's an unspoken understanding that in winter, community matters even more.

This quiet tradition is one of the things that makes Seldovia feel like home. It's not just about surviving winter it's about sharing it, together. 😘`},
 {title:"Hello, Seldovia! Welcome to Week 52 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Dec 22, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-22.jpg",body:`Hello, Seldovia! Welcome to Week 52 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com ✨❄️☀️

Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"The little tricks that make winter easier. The habits that save time, energy, or sanity.",excerpt:"Keep kitty litter or sand in your trunk for traction. If you get stuck on ice, sprinkle it under the tires.",date:"Dec 22, 2025",read:"1 min",cat:"Living Here",img:"",body:`The little tricks that make winter easier. The habits that save time, energy, or sanity. The lessons learned the hard way that now feel second nature.

Here's one of mine: Keep kitty litter or sand in your trunk for traction. If you get stuck on ice, sprinkle it under the tires. It also adds weight over the drive wheels for better grip on icy roads.

💬 Share your tips below and help everyone survive and even enjoy Seldovia winters!`},
 {title:"Winter in Seldovia is unlike anywhere else in Alaska.",excerpt:"Temperatures drop, snow and frost cover the harbor, and days are short but residents have learned to embrace the season rather than wait it out.",date:"Dec 21, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-21.jpg",body:`Winter in Seldovia is unlike anywhere else in Alaska. Temperatures drop, snow and frost cover the harbor, and days are short but residents have learned to embrace the season rather than wait it out. ❄️✨

Daily life is shaped by the cold: homeowners plan for supplies ahead of storms, bundle up for outdoor chores, and rely on both neighbors and community resources to navigate winter safely. Yet this planning also brings connection and a sense of pride neighbors checking in, lending a hand, or sharing a warm meal strengthens the bonds that make Seldovia unique.

Compared to living in Fairbanks, Seldovia winters are easy!  So much more temperate, but still dangerous if you're not prepared.

Recreation doesn't stop for winter. Residents ice fish, ski, snowshoe, or take quiet walks along the snowy shoreline. Wildlife and natural beauty provide constant reminders of the incredible environment Seldovia offers year-round. 😊`},
 {title:"Winter in Seldovia is beautiful, but it takes a little know-how to live comfortably through it.",excerpt:"Locals here have learned that preparation and routine make all the difference.",date:"Dec 19, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-19.jpg",body:`Winter in Seldovia is beautiful, but it takes a little know-how to live comfortably through it. Locals here have learned that preparation and routine make all the difference.

1️⃣ Layer Smartly
Dress in warm, breathable layers so you can stay comfortable indoors and out.

2️⃣ Prepare Your Home Early
Stack firewood, check generators, and winterize before storms arrive.

3️⃣ Plan Ahead
Supplies and errands take extra thought in winter, planning saves stress later.

4️⃣ Slow Down & Stay Safe
Icy paths (get a pair of ice cleats) and short daylight hours are reminders to move carefully and give yourself extra time.

5️⃣ Stay Connected
Winter is easier when neighbors check in, share rides, and lend a helping hand.

6️⃣ Find the Cozy Moments
Warm drinks, good books, and simple gatherings make the season feel lighter and brighter.

Living in Seldovia during winter is about more than staying warm, it's about embracing the season, supporting your community, and finding joy in the little moments that make winter truly special.`},
 {title:"Seldovia is one of those rare places that makes you rethink what “home” really means.",excerpt:"It's small, tucked into the Alaskan coast, and easy to overlook on a map, but once you're here, it leaves its mark.",date:"Dec 18, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-18.jpg",body:`Seldovia is one of those rare places that makes you rethink what "home" really means. It's small, tucked into the Alaskan coast, and easy to overlook on a map, but once you're here, it leaves its mark.

Yes, it's remote. Supplies need planning. Weather can rearrange your schedule in an instant. Services are limited. But that's also the beauty. You learn patience, resourcefulness, and a deeper appreciation for the little things—a clear sunrise over the harbor, the first snow of the season, or a quiet walk along a frozen trail.

Before moving, ask yourself: do you want a house, or do you want a home that's part of a living, breathing community? Do you want convenience, or do you want meaning, peace, and authenticity? Seldovia gives the latter and for those who embrace it, it becomes unforgettable. ✨`},
 {title:"Celebrate National Cupcake Day in Seldovia by making your favorite cupcakes and sharing them with friends and neighbors!",excerpt:"Sweet moments are better when shared, and a cupcake is the perfect way to spread a little joy in our community!",date:"Dec 15, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-15.jpg",body:`Celebrate National Cupcake Day in Seldovia by making your favorite cupcakes and sharing them with friends and neighbors!

Sweet moments are better when shared, and a cupcake is the perfect way to spread a little joy in our community! 🧁`},
 {title:"Thinking about living in or investing in Seldovia? Here's what makes this small Alaska town unique:",excerpt:"Location & lifestyle, limited inventory, community, and investment potential — Seldovia is one of the most affordable communities on the Kenai Peninsula!",date:"Dec 14, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-12-14.jpg",body:`Thinking about living in or investing in Seldovia? Here's what makes this small Alaska town unique:

Location & Lifestyle: Seldovia isn't just a home—it's a lifestyle. Waterfront views, access to fishing, hiking, and a tight-knit community make it ideal for those seeking adventure, tranquility, and connection.

Limited Inventory: Homes here are limited, which means the choices are slim and many opportunities don't last long. Whether it's a cozy cabin, a modern home, or a property with waterfront access, availability can be competitive.

Community Matters: Seldovia isn't a place to just buy a house; it's a place to be part of a community. Local knowledge, relationships, and understanding the town's rhythms are key to finding the right fit.

Investment Potential: Waterfront properties, vacation rentals, and land parcels hold strong appeal. For those looking to invest, Seldovia offers a rare chance to combine lifestyle and value.  Seldovia is one of the most affordable communities on the Kenai Peninsula!  Check our another article I wrote about some facts and figures of our market in comparison to other communities on the peninsula!  CLICK HERE to read more!
https://www.seldoviaproperty.com/.../your-family-home-is…

Professional Guidance Helps: Navigating Seldovia real estate is easier with someone who knows the town. As your local agent, I understand the market, the properties, and the unique quirks of living here year-round.`},
 {title:"As our Fall extends into our Winter - take a walk along the boardwalk, before the snow falls and savor the colorful early sunsets!",excerpt:"Fall may be ending, but Seldovia's charm continues to shine through every season.",date:"Dec 13, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-13.jpg",body:`As our Fall extends into our Winter - take a walk along the boardwalk, before the snow falls and savor the colorful early sunsets!

But it is cold this week and the skies are blue! It is so important to appreciate the gentle rhythm that only this time of year brings. Fall may be ending, but Seldovia's charm continues to shine through every season.`},
 {title:"It's always exciting to see land change hands and new dreams take root in our community.",excerpt:"To the buyers, welcome to your next adventure!",date:"Dec 12, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-12-12.jpg",body:`It's always exciting to see land change hands and new dreams take root in our community. To the buyers, welcome to your next adventure! 😊🌲`},
 {title:"Today is International Animal Rights Day, and it's a perfect reminder of how deeply connected we are to the animals around us.",excerpt:"From the wildlife that thrives in Seldovia's waters and forests to the beloved pets in our homes.",date:"Dec 10, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-10.jpg",body:`Today is International Animal Rights Day, and it's a perfect reminder of how deeply connected we are to the animals around us, from the wildlife that thrives in Seldovia's waters and forests to the beloved pets in our homes. 🌲`},
 {title:"When people hear “remote Alaska,” they often picture isolation, harsh winters, and a whole lot of quiet, and outhouses!",excerpt:"Living here redefines what “remote” truly is. In Seldovia, remote doesn't mean disconnected it means connected in a different, more meaningful way.",date:"Dec 9, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-09.jpg",body:`When people hear "remote Alaska," they often picture isolation, harsh winters, and a whole lot of quiet, and outhouses!  And yes Seldovia is quiet. But it's the kind of quiet that feels comforting, not lonely.

Living here redefines what "remote" truly is. In Seldovia, remote doesn't mean disconnected it means connected in a different, more meaningful way. You're closer to the tides, the trails, the wildlife, and the kind of beauty most people only see on postcards.

And Seldovia has all the luxuries of connected living, high speed internet, cell service, flight and boat services, local grocery, K-12 School, Medical Clinic, Post Office, Library and all the amazing organizations as well as all the amenities like power, water and sewer!  We live the beauty of remote living without many of the struggles!

Remote living here isn't about being far away from life, it's about being closer to the kind of life people dream about.`},
 {title:"Living in places like Seldovia comes with a kind of peace you don't fully understand until you feel it.",excerpt:"Here, “less-traveled” doesn't mean “less to offer.” It means more room to breathe, more time to slow down.",date:"Dec 8, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-08.jpg",body:`Living in places like Seldovia comes with a kind of peace you don't fully understand until you feel it.

Here, "less-traveled" doesn't mean "less to offer." It means more room to breathe, more time to slow down, and more chances to actually enjoy the beauty and people around you.

Seldovia isn't just a place to live... it's a place to live well. 😊✨`},
 {title:"Seldovia's magic isn't in fancy attractions or crowded streets full of shopping and activities.",excerpt:"It's in the quiet mornings over the harbor, the calm of snowy boardwalks, and the simplicity that lets life feel a little slower and a lot more meaningful.",date:"Dec 7, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-07.jpg",body:`Seldovia's magic isn't in fancy attractions or crowded streets full of shopping and activities.

It's in the quiet mornings over the harbor, the calm of snowy boardwalks, and the simplicity that lets life feel a little slower and a lot more meaningful.

Sometimes, the best parts of a town aren't things you can see, they're the lack of things that distract you from the important things. And that's exactly what makes Seldovia so special. ❤️`},
 {title:"December in Seldovia has a calm, cozy feel that's hard to describe unless you've lived it.",excerpt:"Mornings start slowly, a soft winter glow over the harbor, quiet streets, and that fresh crunch of snow under your boots.",date:"Dec 6, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-06.jpg",body:`December in Seldovia has a calm, cozy feel that's hard to describe unless you've lived it.

Mornings start slowly, a soft winter glow over the harbor, quiet streets, and that fresh crunch of snow under your boots as you step outside with a warm cup of coffee.  Hopefully that is coming soon!  LOL!

By midday, you see the little moments that make this town special. Neighbors stop to chat, the smell of wood stoves burning drifts through the air, and everyone seems to look out for each other a little more this time of year. Even simple things like walking the boardwalk or checking the tides feel peaceful.

And when evening comes, holiday lights reflect off the water, the sky turns those soft winter colors, and everything feels warm and familiar.

December here isn't busy or rushed. It's steady, quiet, and filled with small moments that remind you why people love calling Seldovia home.`},
 {title:"Frozen beauty at Lake Irene",excerpt:"Frozen beauty at Lake Irene",date:"Dec 5, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-05.jpg",body:`Frozen beauty at Lake Irene ❄️🏔️🌲`},
 {title:"Living in a small Alaska community all winter isn't just possible, it's deeply rewarding in ways most people never expect.",excerpt:"Yes, the days get shorter and the weather gets colder, but the trade-off is a season filled with quiet beauty, real connection, and a slower rhythm that feels grounding.",date:"Dec 4, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-04.jpg",body:`Living in a small Alaska community all winter isn't just possible, it's deeply rewarding in ways most people never expect. 😊

Yes, the days get shorter and the weather gets colder, but the trade-off is a season filled with quiet beauty, real connection, and a slower rhythm that feels grounding.

In Seldovia, winter brings a kind of magic you can't find anywhere else. You learn to appreciate the stillness, the simple routines, and the pride that comes with living somewhere wild and wonderful. 🌲✨

It's peaceful, it's challenging, it's cozy and for many of us, it feels like home in the truest way.`},
 {title:"Today is all about sharing a little joy and spreading kindness.",excerpt:"Whether it's a homemade treat for a neighbor, a thoughtful note for a friend, or a simple act of service for someone in need.",date:"Dec 3, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-12-03.jpg",body:`Today is all about sharing a little joy and spreading kindness. 🎁❤️

Whether it's a homemade treat for a neighbor, a thoughtful note for a friend, or a simple act of service for someone in need, every gift strengthens the bonds that make Seldovia feel like home. Even the smallest gestures a cup of cocoa, a smile, or helping someone carry groceries can create ripples of warmth throughout our town.

Let's use today to celebrate the joy of giving and the power of community! 😊✨`},
 {title:"Hello, Seldovia! Welcome to Week 49 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Dec 1, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 49 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"Whether it's for preserving summer's berry harvest, storing homemade pickles, freshly canned smoked salmon or holding the first wildflowers of spring, these humble jars connect us to tradition and to each other.",excerpt:"There's something deeply comforting about how a simple mason jar can carry so much — flavor, memory, and love.",date:"Nov 30, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-30.jpg",body:`Whether it's for preserving summer's berry harvest, storing homemade pickles, freshly canned smoked salmon or holding the first wildflowers of spring, these humble jars connect us to tradition and to each other.

You'll find them tucked into kitchen shelves filled with jams, lined up at community potlucks filled with fresh salads, pickled beets or used as candle holders that cast a warm glow over cozy dinners. There's something deeply comforting about how a simple mason jar can carry so much — flavor, memory, and love.

In a small town like Seldovia, where homemade and handcrafted are part of daily living, mason jars remind us that beauty isn't always about extravagance it's about care, creativity, and heart. 💛`},
 {title:"There's a rhythm to life in Seldovia that starts at dawn, a handful of neighbors loading gear into small skiffs, cups of coffee in hand.",excerpt:"Fishing here isn't just an activity; it's how people connect.",date:"Nov 29, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-29.jpg",body:`There's a rhythm to life in Seldovia that starts at dawn, a handful of neighbors loading gear into small skiffs, cups of coffee in hand, trading the day's best tide tips as they head to their favorite spots. Fishing here isn't just an activity; it's how people connect. 🎣☕

Kids learn to bait hooks beside grandparents, newcomers get led to hidden coves by neighbors who've fished these waters for decades, and evenings often end with a shared meal where the day's catch becomes everyone's dinner.

Living here means your front porch overlooks a way of life built on respect for the sea, friendly faces, and the kind of small-town kindness that makes Seldovia feel like home. ✨

If you want a life where outdoor adventure and community warmth go hand in hand, Seldovia delivers: every sunrise, every cast, every shared meal. 😊`},
 {title:"When fall deepens and winter winds start to roll in, Seldovia reveals a side few travelers get to see, the raw breathtaking power of the sea.",excerpt:"Storm watching here isn't just about witnessing waves crash against the breakwater; it's about feeling the pulse of nature in real time.",date:"Nov 28, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-28.jpg",body:`When fall deepens and winter winds start to roll in, Seldovia reveals a side few travelers get to see, the raw breathtaking power of the sea. Storm watching here isn't just about witnessing waves crash against the breakwater; it's about feeling the pulse of nature in real time.

From the harbor, you can see the whitecaps churn under gray skies, gulls battling the wind, and the rhythm of the tide shifting with every gust. Locals often gather at safe vantage points along Inside Beach, the harbor front, or overlooking Outside Beach to watch the spectacle unfold. It's both humbling and awe-inspiring, a reminder of how deeply life in Seldovia is tied to the ocean's moods.

For visitors, it's a chance to experience Alaska beyond the postcard calm to see the same wild beauty that shapes the community's resilience and respect for nature. Just bring a warm coat, a thermos of coffee, and let the storm tell its story.`},
 {title:"Happy Thanksgiving from Seldovia!",excerpt:"Today, we're thankful for our beautiful town, the people who make it special, and the sense of community that brings us together year after year.",date:"Nov 27, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-27.jpg",body:`Happy Thanksgiving from Seldovia!

Today, we're thankful for our beautiful town, the people who make it special, and the sense of community that brings us together year after year. May your day be filled with gratitude, good food, shared laughter, and moments that remind you of what truly matters. 🦃✨`},
 {title:"In Seldovia, winter brings more than just snow it brings a shift in rhythm.",excerpt:"As daylight shortens to just a little over 6 hours, locals adjust their routines around the light.",date:"Nov 26, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-26.jpg",body:`In Seldovia, winter brings more than just snow it brings a shift in rhythm.

As daylight shortens to just a little over 6 hours, locals adjust their routines around the light. You'll see the sport fishermen heading out at dawn to make the most of the brief glow, in hopes of bringing home a Winter King, students walking to school under soft morning twilight, and neighbors timing errands between sunrise and sunset. 🎏

It's a season that encourages balance — work and rest, solitude and connection. Evenings often mean gathering indoors or sharing meals.

While the days are short, the spirit of the town shines brighter than ever. 🌙

Winter in Seldovia reminds us that beauty isn't about how long the light lasts, it's about how you embrace the beauty of the dark - star watching, bonfire building and putting up your Christmas lights in September! 🎄`},
 {title:"There's a shift happening subtle, steady, and heartfelt. Many folks are choosing to leave the noise and speed of larger Alaska towns.",excerpt:"Both young and old, come for the calm, but they stay for the closeness.",date:"Nov 25, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-25.jpg",body:`There's a shift happening subtle, steady, and heartfelt. Many folks are choosing to leave the noise and speed of larger Alaska towns and instead planting their roots in small communities like Seldovia. And the reason isn't just the scenery, though the mountains, ocean, and endless sky do feel like they're working together to slow the world down.

It's the way of life here. ✨

Both young and old, come for the calm, but they stay for the closeness.

They find that life is simpler (not always easier) when everything is within reach: local shops, quiet walking paths, forests that feel untouched, and views that never get old. There's no rush here, no traffic, no pressure to keep up. Instead, Seldovia offers space not just physical space, but mental and emotional space. Space to breathe, to reflect, to enjoy the days ahead.

And maybe that's what makes Seldovia such a draw!

It's not an escape.
It's a return to simplicity, to community, and to the beauty of living life at your own pace. 💫🌊`},
 {title:"Imagine waking up to the sound of gulls and the soft hum of the tide rolling in.",excerpt:"The first thing you check isn't the news, it's the weather and the tides.",date:"Nov 24, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-24.jpg",body:`Imagine waking up to the sound of gulls and the soft hum of the tide rolling in. The first thing you check isn't the news, it's the weather and the tides. If it's calm, the boats will head out early. If fog settles in, plans shift.

By mid-morning, locals can be seen walking along the Main Street, coffee in hand, greeting neighbors as they pass. Someone's loading fishing gear, another's heading out for a hike before the rain moves in. 🎣🥾

In the afternoon, kids play outside until the sun dips behind the mountains and in winter, that happens early, so evenings are spent by the fire, cooking, watching a movie, crafting, or planning for the next fair-weather day. 🌞

Here in Seldovia, nature sets the pace. It teaches patience, flexibility, and appreciation for life's simple rhythms. And that's part of what makes living here so special.

#seldoviaalaska #seldovia #seldoviaak #seldoviaproperty`},
 {title:"Nothing like that rich, bold shot of espresso to kickstart the day!",excerpt:"Here in Seldovia, a good espresso pairs perfectly with good company and harbor views.",date:"Nov 23, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-23.jpg",body:`Nothing like that rich, bold shot of espresso to kickstart the day!

Here in Seldovia, a good espresso pairs perfectly with good company and harbor views. 💛

How do you take your espresso, hot, cold, bold and black or with a swirl of sweetness?

I'm not a coffee drinker - but I appreciate all those who are - as I know I'm in the minority! LOL!  I'll take a "Jenny Chai" or hot chocolate though!`},
 {title:"Success looks different here. It's not measured by how fast you climb or how much you own, it's about how deeply you live.",excerpt:"Success isn't having everything. It's having the freedom to enjoy anything.",date:"Nov 22, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-22.jpg",body:`Success looks different here. It's not measured by how fast you climb or how much you own, it's about how deeply you live. ♻️

In Seldovia, success might look like knowing your neighbors by name, spending an afternoon helping with a community project, or taking a walk by the slough as the tide rolls in. It's being able to attend every school event with your kiddos or eating every meal with your family daily, or how about today, when the neighbor's dog runs up on your deck as he passes by on his walk with his "mom" for a sweet hello and pat on the head!

Success isn't having everything. It's having the freedom to enjoy anything. When your time is yours, you're not just successful, you're free.

Seldovia allows you to slow down, forces you to connect to the most important things! 😊

It's about balance, connection, and the freedom to live life at a pace that feels human again. 🌊🥰`},
 {title:"Frosty Outside Beach on a day trip to Homer!",excerpt:"Frosty Outside Beach on a day trip to Homer!",date:"Nov 21, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-21.jpg",body:`Frosty Outside Beach on a day trip to Homer! ❄️`},
 {title:"Today, we wear purple to honor those affected by pancreatic cancer and to raise awareness about this often silent but devastating disease.",excerpt:"Every voice matters. Every story shared brings hope.",date:"Nov 20, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-20.jpg",body:`Today, we wear purple to honor those affected by pancreatic cancer and to raise awareness about this often silent but devastating disease. Early detection saves lives, so let's spread the word, learn the signs, and support ongoing research and those fighting this battle every day.

Today I remember my Mother-in-law Ginny who succumbed to this terrible disease two years ago, and others close to us who are suffering still.  May the cure be found!

Every voice matters. Every story shared brings hope. 💜`},
 {title:"From early mornings on the water to helping neighbors when it's needed most, your quiet strength and care make Seldovia the place we're proud to call home.",excerpt:"Happy International Men's Day!",date:"Nov 19, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-19.jpg",body:`From early mornings on the water to helping neighbors when it's needed most, your quiet strength and care make Seldovia the place we're proud to call home.

Here's to the men who lead with kindness, courage, and community spirit.

Let's celebrate the role men play in the success of our society!  We couldn't do any of this without them!  Each is an important part of the success of both - men and women!  Let's let the guys know just how much we appreciate them!

Happy International Men's Day! 👏`},
 {title:"When I first came to Seldovia, 23 years ago I thought I was just visiting a quiet little town by the sea. But it didn't take long to realize this place changes you in the best way.",excerpt:"Seldovia taught me that you don't need much to live richly.",date:"Nov 18, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-18.jpg",body:`When I first came to Seldovia, 23 years ago I thought I was just visiting a quiet little town by the sea. But it didn't take long to realize this place changes you in the best way. ✨

Some folks say "Slowdovia" as it is so much different than across the bay, life here moves at its own pace, with its own rhythm. You start measuring time not by deadlines, but by tides, ferry schedules, and the way the light hits the bay in the evening.

The quiet isn't empty; it's full of meaning. It's the laughter of kids biking down Main Street, the smell of salmon on the Traeger while you watch the Tustumena depart for Homer, and the comfort of knowing your neighbors will check on you when the storm rolls in. 🌊♻️

Seldovia taught me that you don't need much to live richly. You just need people who care, wood for the stove, a view that humbles you every morning, and the kind of peace that only a small town can give. ❄️🌙`},
 {title:"There's something so comforting about the smell of fresh bread baking, it fills the kitchen with warmth and brings everyone together.",excerpt:"Today's a perfect reminder to slow down, mix up something simple, and enjoy the little things that make life here feel like home.",date:"Nov 17, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-17.jpg",body:`There's something so comforting about the smell of fresh bread baking, it fills the kitchen with warmth and brings everyone together.

In a small town like Seldovia, homemade bread feels extra special whether it's shared with neighbors, brought to a gathering, or enjoyed with a cup of coffee while watching the tide. ☕

Today's a perfect reminder to slow down, mix up something simple, and enjoy the little things that make life here feel like home. 😊`},
 {title:"In Seldovia, there's a quiet rhythm to daily life, the hum of the harbor, the crunch of gravel roads, and the simple gesture that ties everyone together: The Wave.",excerpt:"It's our Seldovia way of saying, “I see you. We're part of the same story.”",date:"Nov 16, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-16.jpg",body:`In Seldovia, there's a quiet rhythm to daily life, the hum of the harbor, the crunch of gravel roads, and the simple gesture that ties everyone together:

The Wave. 🌊

Whether you're passing someone on the boardwalk, meeting a skiff out on the water, or just driving by on your ATV, a wave isn't just politeness, it's connection.

It's our Seldovia way of saying, "I see you. We're part of the same story."

In a small Alaskan town where community means everything, those small gestures remind us that even in the most remote places, kindness travels far. 💛`},
 {title:"I've always been a card sender, there's just something special about putting thoughts into words and sending a little note to brighten someone's day.",excerpt:"On I Love to Write Day, I'm thankful for the chance to share pieces of life here in Seldovia.",date:"Nov 15, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-15.jpg",body:`I've always been a card sender, there's just something special about putting thoughts into words and sending a little note to brighten someone's day. 😊

Writing has always been my way of slowing down, reflecting, and connecting.

On I Love to Write Day, I'm thankful for the chance to share pieces of life here in Seldovia and for every message, letter, and story that helps us feel a little closer. 🌊♻️`},
 {title:"History of World Kindness Day",excerpt:"World Kindness Day originated in 1997 when a group of humanitarian organizations from various countries gathered in Tokyo for the first “World Kindness Movement” conference.",date:"Nov 13, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-13.jpg",body:`History of World Kindness Day

World Kindness Day originated in 1997 when a group of humanitarian organizations from various countries gathered in Tokyo for the first "World Kindness Movement" conference. Frustrated by global conflicts and a perceived decline in compassion, delegates from Japan, Australia, Thailand, Singapore, the UK, Canada, and the US pledged to promote kindness as a counterforce to violence.

They formally launched the movement on November 13, 1997, and chose that date, November 13 as World Kindness Day to mark the occasion.

The global day gained traction in 1998 when it was officially observed, and by 2000, over 28 countries participated. Today, it's recognized in more than 50 nations, with events ranging from free hugs campaigns to school programs teaching empathy.

Elias & Mia:
In a bustling city park, an elderly man named Elias sat alone on his usual bench every afternoon, feeding pigeons with crumbs from his pocket. His wife had passed years ago, and his children lived far away…

Read more here: https://www.seldoviaproperty.com/.../history-of-world…`},
 {title:"Encore! Thanks Ecola for this great shot from last night!",excerpt:"Encore! Thanks Ecola for this great shot from last night!",date:"Nov 12, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-12.jpg",body:`Encore!  Thanks Ecola for this great shot from last night!`},
 {title:"Be sure to check your mail for the notice from the KPB Assessing Department.",excerpt:"Don't miss this opportunity to maximize your property tax savings for 2026—get your application in today!",date:"Nov 12, 2025",read:"1 min",cat:"Real Estate",img:"",body:`Be sure to check your mail for the notice from the KPB Assessing Department (If you haven't applied for this exemption before, you wouldn't have received this attached notice - so I wanted to make sure you knew this is available if you qualify!). Don't miss this opportunity to maximize your property tax savings for 2026—get your application in today!

Click on the link below to complete and submit the application online.
$75k Residential Exemption Application - Online Form
https://www.kpb.us/.../75k-residential-exemption-application

For a paper copy of the exemption application, follow the link below
$75k Residential Exemption Application - Printable Form
https://www.kpb.us/.../Documents/75K_Resident_Fillable.pdf`},
 {title:"Today, we pause to honor the men and women who have bravely served our country, our veterans.",excerpt:"To each of you who has served: thank you. Your strength and sacrifice inspire us every day.",date:"Nov 11, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-11.jpg",body:`Today, we pause to honor the men and women who have bravely served our country, our veterans. Their courage, dedication, and love for freedom have shaped the nation we are proud to call home.

Here in Seldovia, that gratitude feels especially close to the heart. Many of our veterans are our neighbors, friends, and family members the same faces we see at the harbor, in local shops, or walking along the boardwalk.

To each of you who has served: thank you. Your strength and sacrifice inspire us every day. 💙`},
 {title:"Chances are good that clear skies will reveal a spectacular light show over Seldovia tonight. Don't miss it!",excerpt:"Chances are good that clear skies will reveal a spectacular light show over Seldovia tonight.",date:"Nov 11, 2025",read:"1 min",cat:"Living Here",img:"",body:`Chances are good that clear skies will reveal a spectacular light show over Seldovia tonight. Don't miss it!

Read here to learn more: https://auroranotify.com/`},
 {title:"Hello, Seldovia! Welcome to Week 46 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Nov 10, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 46 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌙✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"From our quiet shores here in Seldovia to Marines stationed around the world, we pause today to say thank you.",excerpt:"Happy Birthday, U.S. Marine Corps!",date:"Nov 10, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-10.jpg",body:`From our quiet shores here in Seldovia to Marines stationed around the world, we pause today to say thank you. 🙏

As we honor 250 years of the Marine Corps, we remember the strength that comes from service, brotherhood, and commitment to something greater than ourselves.

Happy Birthday, U.S. Marine Corps! 🇺🇸`},
 {title:"The water taxi, ferry, or small planes are our highways, and each trip comes with its own rhythm and reward.",excerpt:"It's not just about living without a road it's about living with purpose.",date:"Nov 9, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-09.jpg",body:`The water taxi, ferry, or small planes are our highways, and each trip comes with its own rhythm and reward.

But what might seem like isolation to some feels like connection to others. Without the rush of traffic or endless errands, neighbors become family, and the landscape becomes your companion. You learn to plan ahead, live intentionally, and appreciate the beauty of simplicity. 🌞🌊♻️

It's not just about living without a road it's about living with purpose, grounded in community and surrounded by nature that reminds you daily just how extraordinary "remote" can be.`},
 {title:"It's a question locals in Seldovia hear often and the answer is almost always the same: Never.",excerpt:"The quiet in Seldovia isn't empty; it's so full!",date:"Nov 8, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-08.jpg",body:`It's a question locals in Seldovia hear often and the answer is almost always the same:

Never. ✨

The quiet in Seldovia isn't empty; it's so full! It's the sound of eagles calling across the harbor, waves brushing against the shore, and wind moving through the spruce trees.

In a world that never stops buzzing, the stillness of Seldovia feels like a gift. It gives space to think, to breathe, to notice the small things the sparkle of sunlight on the water, the laughter from a neighbor's porch, the rhythm of the tides. 🌊♻️

The quiet doesn't mean nothing's happening. It means you can finally hear what matters most!  As long as you turn off your phone! LOL! 😄`},
 {title:"Seldovia may be small, but its opportunities are big.",excerpt:"Folks interested in investing in not just a home, but a lifestyle are discovering that this coastal community offers something rare.",date:"Nov 7, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-11-07.jpg",body:`Seldovia may be small, but its opportunities are big. Folks interested in investing in not just a home, but a lifestyle are discovering that this coastal community offers something rare:  affordable entry into Alaska's remote lifestyle, combined with strong long-term potential.

🏡 Real Estate with Character: From charming cabins to buildable lots, properties here aren't just investments; they're gateways to a simpler, more connected way of life.

🌲 Tourism Potential: With fishing, hiking, wildlife, and rich culture, Seldovia is a growing destination for travelers seeking "Real Alaska." That makes vacation rentals and boutique lodges smart plays for steady returns.

🌊 Lifestyle + Value: Unlike crowded markets, Seldovia offers balance, an investment that doubles as a personal retreat. Your property here isn't just numbers on paper; it's time on the water, trails, and beaches.

In a world where investors are chasing crowded, expensive markets, Seldovia stands out as a hidden opportunity. The smart ones know: it's better to get in early.

✨ Ready to explore the possibilities? Visit SeldoviaProperty.com or connect with Jenny Chissus at Seldovia Property to see what's waiting for you.`},
 {title:"Tustumena coming in RIGHT NOW to Seldovia! Better late than not!",excerpt:"Thankful for the Tusty!",date:"Nov 6, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-06.jpg",body:`Tustumena coming in RIGHT NOW to Seldovia! Better late than not! Thankful for the Tusty! 🌊⛴️`},
 {title:"Homer may be the “Hamlet by the Sea,” but just across Kachemak Bay lies Seldovia smaller, quieter, and in many ways, more personal.",excerpt:"If Homer is Alaska's bustling harbor, Seldovia is its hidden heartbeat.",date:"Nov 5, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-05.jpg",body:`Homer may be the "Hamlet by the Sea," but just across Kachemak Bay lies Seldovia smaller, quieter, and in many ways, more personal, and closer to the halibut fishing grounds, taking 2-3 hours off the total travel time to the big fish!

✨ The Journey Matters: To reach Seldovia, you take a boat, plane, or ferry. That extra step filters the rush and leaves you with a community that feels truly tucked away.

🌲 A Village Vibe: Homer hums with activity, but Seldovia thrives on connection. Here, you'll find fewer crowds, more conversations, and neighbors who quickly become friends.

🌲 Nature, Up Close: Both towns offer stunning scenery, but Seldovia's trails, tidepools, and beaches often feel like your own private discovery. No traffic, no noise just pure Alaska.

🍎 Culture with Roots: While Homer is lively with galleries and markets, Seldovia celebrates with berry festivals, local art, and traditions that honor both history and nature.

👉 If Homer is Alaska's bustling harbor, Seldovia is its hidden heartbeat. Sometimes, the places harder to reach end up being the ones worth holding onto.`},
 {title:"Straight from Seldovia soil.",excerpt:"Straight from Seldovia soil.",date:"Nov 4, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-11-04.jpg",body:`Straight from Seldovia soil. 🥕`},
 {title:"Hello, Seldovia! Welcome to Week 45 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Nov 3, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 45 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"Whether it's fresh halibut, smoked salmon, or classic turkey stacked between two slices of homemade bread there's something extra special about a sandwich enjoyed by the sea.",excerpt:"What's your favorite local go-to sandwich spot here in Seldovia?",date:"Nov 3, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-03.jpg",body:`Whether it's fresh halibut, smoked salmon, or classic turkey stacked between two slices of homemade bread there's something extra special about a sandwich enjoyed by the sea.

What's your favorite local go-to sandwich spot here in Seldovia? 🌊♻️`},
 {title:"Locals swap recipes as easily as they swap stories!",excerpt:"In Seldovia, the taste of the bay isn't just about flavor, it's about belonging.",date:"Nov 2, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-02.jpg",body:`Locals swap recipes as easily as they swap stories! 🐟

Halibut baked with wild herbs, salmon grilled over alder wood, or crab pulled straight from the trap and shared with friends on the dock. Visitors quickly notice that meals here can feel more like gatherings, moments where family, friends and community come together.

Each dish tells a story of hard work and harmony with the sea of a way of life that values freshness, sustainability, and connection. In Seldovia, the taste of the bay isn't just about flavor, it's about belonging. 😊`},
 {title:"Don't forget to turn those clocks back Saturday night.",excerpt:"Time to reset and soak in an extra hour to enjoy those cozy autumn mornings.",date:"Nov 1, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-11-01.jpg",body:`Don't forget to turn those clocks back Saturday night. Time to reset and soak in an extra hour to enjoy those cozy autumn mornings. 🍁⏰`},
 {title:"There's no tricks, but plenty of treats for all your little ghosts and goblins this Halloween!",excerpt:"Score some major points with the kids (and candy for yourself) by checking out Harmony's Trick-or-Treat map.",date:"Oct 31, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-10-31.jpg",body:`There's no tricks, but plenty of treats for all your little ghosts 👻 and goblins 👺 this Halloween!

Score some major points with the kids (and candy for yourself) by checking out Harmony's Trick-or-Treat map with all the folks who are ready to serve up the traditional treats!

Okay, now tell me…

1) What kind of candy will you be handing out this year?

2) What kind of Halloween candy are you going to be snagging from your kid's haul?`},
 {title:"Leaving Seldovia is never easy. It's not just the distance, it's stepping away from the rhythm of the tides.",excerpt:"This is the gift of Seldovia. It never stops calling you back.",date:"Oct 30, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-30.jpg",body:`Leaving Seldovia is never easy. It's not just the distance, it's stepping away from the rhythm of the tides, the quiet strength of the mountains, and the close-knit heart of a community that knows your name. 🌿

When you're gone, memories of simple moments linger: walking the docks at sunset, picking berries in late summer, hearing the gulls echo across the harbor. These aren't just experiences, they're threads of home woven into who you are. 🌞✨

And when you return, no matter how long you've been away, Seldovia greets you like an old friend. The salty air feels familiar, the rugged shoreline grounds you, and suddenly, everything inside you exhales, you're home.

This is the gift of Seldovia. It never stops calling you back. ❤️`},
 {title:"From cozy cabins to sunny docks, cats in Seldovia always find the best spots to nap, watch the tide, or keep their humans company.",excerpt:"Today we celebrate our furry felines who add a little (a lot of) extra warmth, mischief, and love to our days.",date:"Oct 29, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-10-29.jpg",body:`From cozy cabins to sunny docks, cats in Seldovia always find the best spots to nap, watch the tide, or keep their humans company.

Today we celebrate our furry felines who add a little (a lot of) extra warmth, mischief, and love to our days. 🐾`},
 {title:"What helps businesses here work and grow:",excerpt:"Essential services, local year-round customers, a natural resource–based economy, tourism, adaptability, and community support.",date:"Oct 28, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-28.jpg",body:`What helps businesses here work and grow:

🌊 Essential services + infrastructure:

Seldovia has a K-12 school, internet, harbor, water/sewer services, docks, small airport and floatplane access.  Small shops, restaurants, Post Office and the local clinic meet daily needs, so people don't always have to go elsewhere.

🌊 Local, year-round customers:

With a tight-knit community, businesses are grateful for loyalty. Even residents who travel or fish seasonally come back, and locals support each other. The population may be small, but engagement is strong.

🌊 Natural resource–based economy:

Fishing, boat services, harbor work, timber for personal wood heat and milling, foraging, tourism all these provide both direct business and support for secondary businesses (lodging, guiding, supplies).

🌊 Tourism & destination value:

Visitors are drawn to the wild beauty, trails, marine life, fishing, art, and quiet — so lodging, vacation rentals, local art,  tours, and guiding services can succeed, especially when quality and authenticity are emphasized.

🌊 Adaptability & diversification:

Businesses often need to wear many hats: in summer they may offer fishing charters, local foods, restaurants; in off-season, folk shift focus to create their crafts, online sales, or essential goods. Being multi-purpose helps offset seasonal swings.

🌊 Community support & shared resources:

Volunteers, local government, nonprofits, and residents often pitch in from helping with events that bring visitors, to promoting local artisans, to sharing or trading goods. Strong local relationships matter.`},
 {title:"Hello, Seldovia! Welcome to Week 44 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Oct 28, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 44 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"It starts with the smell of fresh coffee, (or donuts on Tuesdays!) the hum of quiet or loud conversations, and the view of the harbor.",excerpt:"In Seldovia, even the simplest spaces have a way of weaving people together.",date:"Oct 27, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-27.jpg",body:`It starts with the smell of fresh coffee, (or donuts on Tuesdays!) the hum of quiet or loud conversations, and the view of the harbor or action outside the windows. ☕🍩

In a small town like Seldovia, an eatery isn't just a place to grab a drink, or some food it's a gathering spot, a pause in the day where connections happen.

Visitors come in as strangers, unsure where to sit, and often find themselves sharing a table or the bar with a local. Before long, stories are traded about fishing, travel, family, or the history of this little town by the sea. By the time the coffee cups and plates are empty, strangers leave as friends, tied together by warmth, laughter, and the magic of small-town connection. 😄

In Seldovia, even the simplest spaces have a way of weaving people together. ✨`},
 {title:"Embrace the spirit of generosity on this National Make A Difference Day!",excerpt:"Let's spread love, share smiles, and uplift each other.",date:"Oct 25, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-10-25.jpg",body:`🌍✨ Embrace the spirit of generosity on this National Make A Difference Day!

Let's join hands and make a positive impact in our communities and beyond. 💖 Whether it's a small act of kindness or a grand gesture, every bit counts.

Let's spread love, share smiles, and uplift each other. 🥰💖`},
 {title:"A still moment at Homer's harbor. Every trip to Seldovia begins with views like this",excerpt:"A still moment at Homer's harbor. Every trip to Seldovia begins with views like this",date:"Oct 24, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-24.jpg",body:`A still moment at Homer's harbor. Every trip to Seldovia begins with views like this 🌞♻️🌊`},
 {title:"In Seldovia, life unfolds at a gentler pace.",excerpt:"Parents find comfort knowing their children can roam with some independence, explore trails, and play outside.",date:"Oct 24, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-24_2.jpg",body:`In Seldovia, life unfolds at a gentler pace. Parents find comfort knowing their children can roam with some independence, explore trails, and play outside without the constant buzz of traffic or the pressures or concerns of city living.

🔷 Everyday Amenities Within Reach
Despite being a small town, families enjoy access to:
• A local school and library 📚
• The health clinic and wellness center 🏥
• The harbor, ferry service, and air taxi ✈️
• Grocery stores, coffee shops, and restaurants ☕🍴
• Parks, trails, and beaches for endless outdoor adventures 🌲🏖️

Without the distractions of big-city life, families focus on what matters: quality time, community traditions, and the freedom to explore the outdoors.`},
 {title:"Each challenge and setback provides insight, growth, and perspective that success alone cannot teach.",excerpt:"In every misstep, there's an opportunity to refine, adapt, and move forward with greater purpose.",date:"Oct 23, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-10-23.jpg",body:`Each challenge and setback provides insight, growth, and perspective that success alone cannot teach.

In every misstep, there's an opportunity to refine, adapt, and move forward with greater purpose. Keep going, keep learning!`},
 {title:"When the tide slips away, rocky coves and sandy stretches transform into vibrant, living aquariums.",excerpt:"Sometimes, the most memorable discoveries are right at your feet.",date:"Oct 22, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-22.jpg",body:`When the tide slips away, rocky coves and sandy stretches transform into vibrant, living aquariums, revealing the intricate ecosystems that thrive just beneath the surface. 🌊

Visitors can spot starfish clinging to rocks like living jewels, tiny crabs and tiny octopus darting between stones, and sea anemones swaying gently with the current. 🦀🦀

For those who love nature, photography, or simply slowing down to notice the small wonders of the world, tidepooling is a gentle reminder that adventure doesn't always require a boat, a long hike, or distant travel. Sometimes, the most memorable discoveries are right at your feet. 🐙🚶`},
 {title:"Considering a home purchase in Seldovia? If you're exploring a mortgage, connecting with a LOCAL lender is a key step.",excerpt:"A preapproval letter, sometimes called a 90% letter, shows sellers you're a serious buyer, strengthening your offer.",date:"Oct 21, 2025",read:"2 min",cat:"Real Estate",img:"images/gazette/2025-10-21.jpg",body:`Considering a home purchase in Seldovia? If you're buying with cash, you're all set, but if you're exploring a mortgage, connecting with a LOCAL lender is a key step.  Dealing with a local loan officer is so beneficial as they are familiar with properties that are remote, off-road, as well as waterfront properties all over the Peninsula!  They know the local programs and will ensure you get the best rates!

I recommend holding off on a preapproval letter until you've identified a property you love. Why? A preapproval involves a credit check, which can slightly impact your score—something to avoid if the perfect home isn't on the market yet. Our Seldovia market is small, and "your" property might not be available right away, so patience can pay off.

Once you've found the right home, a local lender will work diligently to secure the best rates and loan options tailored to your needs. They'll ensure you can comfortably afford the offer, and that it is competitive and matches the property's requirements, as some homes may not qualify for certain loans. A quick meeting with a lender can clarify what works best for your situation.

A preapproval letter, sometimes called a 90% letter, shows sellers you're a serious buyer, strengthening your offer. It also outlines your purchasing power and should align with your offer amount—for example, a $350,000 offer should be backed by a preapproval for that amount, even if you qualify for more.

Having this letter ready speeds up the process once you're under contract, as your financials are already verified.

Ready to explore your options? Let's connect to get you started!  I would be happy to refer you to a few great lenders who have successfully helped folks buy in Seldovia!`},
 {title:"Hello, Seldovia! Welcome to Week 43 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Oct 20, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 43 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"In many places, success is measured by accumulation. But in Seldovia, the rhythm of life asks a different question: what if enough is already here?",excerpt:"Sometimes the greatest wealth is knowing when to stop striving and start savoring.",date:"Oct 20, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-20.jpg",body:`In many places, success is measured by accumulation. Bigger houses, faster cars, endless upgrades. But in Seldovia, the rhythm of life asks a different question: what if enough is already here?

For locals, "enough" can be a freezer full of salmon, a warm woodstove in winter, or neighbors who show up when you need a hand. It might be the joy of gathering berries, sharing a meal, or watching the sun sink behind the mountains, painting the sky in colors no screen could replicate. 🌅

Here, abundance is measured not by excess, but by sufficiency. The right amount of food, warmth, and community to feel content. Visitors often remark on this slower, simpler pace, realizing that "enough" feels richer than chasing "more."

Seldovia offers a gentle reminder in a noisy world: sometimes the greatest wealth is knowing when to stop striving and start savoring. 🌲🌊✨`},
 {title:"When visitors dream of Alaska, they imagine rugged coastlines, wildlife around every corner, and a community rooted in tradition and resilience. In Seldovia, that dream is alive and real.",excerpt:"Seldovia isn't just a stop on the map. It's the Alaska that lingers in your heart long after you've left.",date:"Oct 20, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-20_2.jpg",body:`When visitors dream of Alaska, they imagine rugged coastlines, wildlife around every corner, and a community rooted in tradition and resilience. In Seldovia, that dream is alive and real.

Unlike the bustling tourist hubs, Seldovia offers a quieter authenticity. Here, boardwalks carry the history of fishing families, trails lead to quiet beaches, and neighbors welcome you like old friends. Life moves at a slower pace, rich with stories, salmon dinners, and moments of quiet wonder.

Seldovia isn't just a stop on the map. It's the Alaska that lingers in your heart long after you've left. ✨`},
 {title:"What will you look for in your NEXT home?",excerpt:"A, B, C or D? Comment your pick below!",date:"Oct 16, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-10-16.jpg",body:`What will you look for in your NEXT home? 🌳✨

A, B, C or D? Comment your pick below!`},
 {title:"Every sale marks not just a transaction but a new story unfolding in our little coastal town.",excerpt:"We're so happy to see another dream taking root right here in Seldovia!",date:"Oct 16, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-10-16_2.jpg",body:`Every sale marks not just a transaction but a new story unfolding in our little coastal town. We're so happy to see another dream taking root right here in Seldovia! 😊`},
 {title:"Growing up in Seldovia means childhood isn't rushed, it unfolds at the pace of the tide.",excerpt:"For children, it means growing up with roots knowing they belong to a circle that's bigger than their own family.",date:"Oct 15, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-15.jpg",body:`Growing up in Seldovia means childhood isn't rushed, it unfolds at the pace of the tide. Kids here learn to ride their bikes down quiet streets where every passerby waves and knows their name. They spend summers barefoot on the beach, picking salmonberries, fishing off the dock or skipping rocks with friends who feel more like siblings. 😄

Neighbors look out for one another's kids, offering rides, snacks, or encouragement without hesitation. It's the kind of place where a scraped knee is tended by whichever parent is nearby, and every graduation feels like a celebration for the whole town. 🙌

For children, it means growing up with roots knowing they belong to a circle that's bigger than their own family. For parents, it means raising kids in an environment where kindness, connection, and accountability are part of daily life. ❤️`},
 {title:"On a personal note, today we celebrate my husband Sonny's birthday!",excerpt:"Charlie was one of a kind and is missed but will never be forgotten.",date:"Oct 14, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-10-14.jpg",body:`On a personal note, today we celebrate my husband Sonny's birthday! ❤️

Today would have also been Charlie Kirk's 32nd birthday, and he is being honored posthumously with the Presidential Medal of Freedom while the day is being recognized as Charlie Kirk Day of Remembrance.

Charlie made a huge impact on the world in his desire to keep open dialogue in search of truth, especially with high school and college age students.

There are so many examples of this!  However, one of my favorite Charlie videos is this one… where he talks about his commitment to his faith and his love of family!  Charlie was one of a kind and is missed but will never be forgotten.`},
 {title:"A few summers ago, a couple from the Lower 48 stepped off the ferry wide-eyed and quiet, just soaking in the stillness of Seldovia.",excerpt:"Visitors remind us to see with fresh wonder. Locals remind them that the heart of Seldovia beats strongest in its people.",date:"Oct 13, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-13.jpg",body:`A few summers ago, a couple from the Lower 48 stepped off the ferry wide-eyed and quiet, just soaking in the stillness of Seldovia. They asked where they might find a good walk, and a local pointed them toward the Otterbahn Trail.

Hours later, they returned faces lit up, talking about wildflowers they'd never seen, an eagle that followed them overhead, and the silence of the forest that felt "like stepping into another world." 🌍

For the locals, that moment was a reminder: what we pass by every day, the tide moving in and out, the spruce trees lining the trails, the way the light hits the mountains is extraordinary to someone seeing it for the first time. 🌊🌞

But visitors learn something too. That same couple was invited to a backyard fish fry later that evening. They saw how Seldovians gather, sharing salmon, stories, and laughter like family. They realized that life here isn't just about breathtaking views, it's about people who take care of each other, who know every name, and who always have an extra chair at the table.

That's the exchange. Visitors remind us to see with fresh wonder. Locals remind them that the heart of Seldovia beats strongest in its people. Together, those lessons weave the real story of our community. 👨‍👩‍👧‍👦`},
 {title:"Hello, Seldovia! Welcome to Week 42 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Oct 13, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 42 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"Thyme on the Boardwalk at low tide!",excerpt:"Thyme on the Boardwalk at low tide!",date:"Oct 12, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-12.jpg",body:`Thyme on the Boardwalk at low tide! 🌊♻️`},
 {title:"In Seldovia, pilots are more than just flyers they are the heartbeat of our community.",excerpt:"Next time you see a plane in our skies, take a moment to appreciate the incredible role pilots play.",date:"Oct 11, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-11.jpg",body:`In Seldovia, pilots are more than just flyers they are the heartbeat of our community. Nestled between mountains and sea, our town depends on aviation for almost everything: essential supplies, fresh groceries, mail, medical transport, and even visitors who keep local businesses thriving. ✈️

Flying here isn't easy. Pilots navigate unpredictable weather, rugged terrain, and narrow airstrips to keep Seldovia connected to the outside world. Each takeoff and landing is a mix of skill, courage, and deep knowledge of Alaska's skies. 🌊

Many of our pilots have grown up in small towns just like ours, learning early that flying here isn't just a job, it's a responsibility. They deliver more than cargo; they deliver hope, connection, and the lifeline that keeps Seldovia alive and thriving. 🌿✨

Next time you see a plane in our skies, take a moment to appreciate the incredible role pilots play in keeping our community safe, supplied, and connected.`},
 {title:"The overall objective of World Mental Health Day is to raise awareness of mental health issues around the world.",excerpt:"Mental health struggles are not a sign of weak faith but a human experience God meets with compassion.",date:"Oct 10, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-10-10.jpg",body:`The overall objective of World Mental Health Day is to raise awareness of mental health issues around the world and to mobilize efforts in support of mental health.

The Day provides an opportunity for all stakeholders working on mental health issues to talk about their work, and what more needs to be done to make mental health care a reality for people worldwide.

The Christian perspective on Mental Health can be helpful as we process our own struggles and make ourselves available to help others.

God cares about your whole being as scripture affirms that God is concerned with your mental and emotional well-being. Psalm 34:18 says, "The Lord is close to the brokenhearted and saves those who are crushed in spirit."

Mental health struggles are not a sign of weak faith but a human experience God meets with compassion.

Read more here: https://www.seldoviaproperty.com/.../the-overall…`},
 {title:"Seldovia isn't just a beautiful place to visit, it's a place where your investment can grow while also giving others a chance to experience “Real Alaska.”",excerpt:"Vacation and nightly rentals here are in high demand in the summer months.",date:"Oct 9, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-10-09.jpg",body:`Seldovia isn't just a beautiful place to visit, it's a place where your investment can grow while also giving others a chance to experience "Real Alaska."

Vacation and nightly rentals here are in high demand in the summer months, offering visitors a cozy home base while exploring fishing, hiking, and the charm of small-town Alaska. For investors, this means an opportunity for both financial return and community impact. Every rental supports local businesses, creates memories for travelers, and strengthens Seldovia's future as a destination.

🌊 If you've been considering investing, check out this unique opportunity:

This spacious property boast a 2-bedroom, 2-bath owner's residence upstairs and a 1 bedroom apartment facing the bay downstairs!  Right in the heart of Seldovia, this is more than just a residence,it's an investment in your future. With room to host, modern comforts, and plenty of space to grow, it's the perfect opportunity to continue a successful vacation rental, add a small business on street side as well as create your own Alaskan retreat. 🌊🌲

🔗 Explore the full listing here:
https://my.flexmls.com/.../lis.../20241021193630126208000000`},
 {title:"In a small community like Seldovia, school is more than just a place to learn, it's the heart of the town.",excerpt:"Children here attend Susan B. English School, a K–12 school that serves local families with small class sizes.",date:"Oct 8, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-08.jpg",body:`In a small community like Seldovia, school is more than just a place to learn, it's the heart of the town. Children here attend Susan B. English School, a K–12 school that serves local families with small class sizes and personalized attention.

🏫 Multi-grade classrooms create a unique learning environment where older students often help younger ones, building a strong sense of mentorship and community. Teachers know every student and their whole family, and education feels tailored to each child.

🚶 Getting to school looks a little different than in the city. Many kids walk, ride their bikes, or get dropped off by parents on their way to work. Few live too far to walk, and no one lives more than 10 miles away, so the short commute means kids can spend more time at home or outside enjoying the outdoors.  Or, like for us, who live right in town, our kids came home for lunch the majority of the time!  As much as school is important, family time is the BEST - and you get a lot of it in Seldovia!

📚 School activities go beyond the classroom, students join in community events, holiday performances, sports, and local traditions. The school often brings everyone together, making it both an educational hub and a gathering place for Seldovia residents.`},
 {title:"Our garden's first onions! Drying them… and yes, another way to use a baby gate!!!",excerpt:"Our garden's first onions! Drying them… and yes, another way to use a baby gate!!!",date:"Oct 7, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-07.jpg",body:`Our garden's first onions! Drying them… and yes, another way to use a baby gate!!! 😂`},
 {title:"In Seldovia, life moves at a different pace, one that's deeply rooted in connection, community, and familiarity.",excerpt:"Everyone knows your name, your story, and even your favorite seat at the local eateries.",date:"Oct 7, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-07_2.jpg",body:`In Seldovia, life moves at a different pace, one that's deeply rooted in connection, community, and familiarity. ✨

You step off the ferry in Seldovia, and before you've even reached Main Street, someone waves hello. At the Flube, Alicia, Amon or Charlie always greets you by your name and knows how you like your coffee or Chai. On your walk back, a neighbor stops to ask if you'll be at the potluck tonight, and another offers fresh berries from their garden, or a fresh filet from a fishing excursion that day. 😊

Everyone knows your name, your story, and even your favorite seat at the local eateries. That sense of connection makes even the most ordinary moments extraordinary. ❤️`},
 {title:"Excited to welcome this young family to Seldovia!",excerpt:"Wishing you all the best as you make wonderful memories here. Congratulations!",date:"Oct 6, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-10-06.jpg",body:`Excited to welcome this young family to Seldovia! Wishing you all the best as you make wonderful memories here. Congratulations! 🌊❤️💜`},
 {title:"Hello, Seldovia! Welcome to Week 41 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Oct 6, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 41 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨`},
 {title:"Keep your home in top shape with our essential home maintenance checklist.",excerpt:"From changing filters to tidying up the garden, this October we've got you covered.",date:"Oct 6, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-10-06_2.jpg",body:`Keep your home in top shape with our essential home maintenance checklist. From changing filters to tidying up the garden, this October we've got you covered. ✨`},
 {title:"In Seldovia, our teachers do more than teach they nurture, encourage, and help our kids grow in every way.",excerpt:"On World Teachers' Day, we celebrate YOU — thank you for everything you do for our community!",date:"Oct 5, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-10-05.jpg",body:`In Seldovia, our teachers do more than teach they nurture, encourage, and help our kids grow in every way.

On World Teachers' Day, we celebrate YOU — thank you for everything you do for our community! 💗😊`},
 {title:"In Seldovia, the sky isn't just something to glance at it's a daily guide.",excerpt:"Locals have learned to “read” the weather the way others might read a book.",date:"Oct 4, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-04.jpg",body:`In Seldovia, the sky isn't just something to glance at it's a daily guide. Locals have learned to "read" the weather the way others might read a book, noticing subtle changes that predict what's coming next.

👉 A sudden shift in the wind and smell in the air off Kachemak Bay might signal rain before the clouds even gather.
👉 The way the tide interacts with the slough often hints at how strong the winds will be later in the day.
👉 And those glowing, fiery sunsets? They're more than beautiful, they're often a promise of clear skies tomorrow.

As a visitor, you might just find yourself picking up a few of these unspoken lessons, too. 🌊✨`},
 {title:"One of the hidden joys of spending time in Seldovia is witnessing how the wildflowers mark the passing of the seasons.",excerpt:"Beyond their beauty, these wildflowers play a vital role in Seldovia's ecosystem.",date:"Oct 3, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-03.jpg",body:`One of the hidden joys of spending time in Seldovia is witnessing how the wildflowers mark the passing of the seasons.

🌱 Spring (May–June):
✨ Lupines blanket hillsides with rich purple and blue tones, thriving in open meadows and along roadsides.
✨ Buttercups and forget-me-nots (Alaska's state flower) add bursts of cheerful yellow and blue as the snow melts away.

🌞 Summer (July–August):
✨ Fireweed dominates the landscape with its striking pink stalks. Locals even say you can tell summer's end by how high the fireweed blooms have climbed.
✨ Daisies, yarrow, and wild roses spread across fields and trails, attracting bees and butterflies.
✨ Salmonberry and blueberry blossoms provide both beauty and the promise of sweet berries later in the season.

🍂 Late Summer–Early Fall (August–September):
✨ Fireweed turns to fluffy white seed, floating across the breeze like snow.
✨ Goldenrod and late-blooming asters keep splashes of color alive as the days grow shorter.

Beyond their beauty, these wildflowers play a vital role in Seldovia's ecosystem supporting pollinators, enriching the soil, and providing food for both wildlife and people.`},
 {title:"Long before the first snow falls, residents are already busy ensuring their homes and hearts are ready for the months ahead.",excerpt:"Winter here is not just a challenge but a celebration of resilience, resourcefulness, and community.",date:"Oct 2, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-10-02.jpg",body:`Long before the first snow falls, residents are already busy ensuring their homes and hearts are ready for the months ahead.

🌲 Winter Prep in Seldovia Includes:

✅ Stocking up firewood to keep the stoves burning through long nights.
✅ Harvesting and preserving food from summer and fall gardens.
✅ Checking boats, cabins, and roofs to withstand storms and heavy snow.
✅ Community spirit — neighbors lend a hand, swap supplies, and share tips to make sure no one faces the season unprepared.

Winter here is not just a challenge but a celebration of resilience, resourcefulness, and community. When the snow falls and the sea swells, Seldovia residents know they've earned their peace by preparing well.`},
 {title:"So great to see new Seldovians making moves right away to get on and enjoy their new properties!",excerpt:"Thanks Jim for doing such a beautiful job with this new driveway!",date:"Oct 2, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-10-02_2.jpg",body:`So great to see new Seldovians making moves right away to get on and enjoy their new properties! Thanks Jim for doing such a beautiful job with this new driveway! 🚗✨`},
 {title:"Ready for a little real estate adventure? Take a fun tour through the Seldovia market with our September Flipbook!",excerpt:"Whether you're looking for a cozy cabin by the water, a charming cottage, or your dream home, we've got something for everyone!",date:"Oct 1, 2025",read:"1 min",cat:"Real Estate",img:"",body:`Ready for a little real estate adventure? Take a fun tour through the Seldovia market with our September Flipbook!  Click through to see all our current listings and maybe even find THE one!

Whether you're looking for a cozy cabin by the water, a charming cottage, or your dream home in this beautiful Alaskan town, we've got something for everyone! 🌲🌞`},
 {title:"Seldovia's history is written in its buildings.",excerpt:"Many of the waterfront structures stand on pilings, a reminder of how the town was once designed to accommodate tides and a large fishing industry.",date:"Sep 30, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-30.jpg",body:`Seldovia's history is written in its buildings. Many of the waterfront structures stand on pilings, a reminder of how the town was once designed to accommodate tides and a large fishing industry.

After the 1964 Good Friday Earthquake, much of Seldovia had to be rebuilt, but several historic landmarks still remain, offering a window into the past.

Notable examples include:

✨ The old boardwalk buildings that highlight Seldovia's roots as a bustling fishing and trading hub.
✨ St. Nicholas Russian Orthodox Church, which reflects the influence of Russian settlers in Alaska.
✨ Preserved waterfront homes and cabins, showcasing traditional Alaskan craftsmanship and adaptation to coastal living.

These buildings are more than structures, they are cultural markers that tell the story of resilience, adaptation, and community spirit. Walking through Seldovia, you're not just seeing homes and shops, you're stepping into history that continues to shape the town today.

👉 Did you know that many of Seldovia's historic buildings had to be raised or rebuilt after the land dropped several feet during the 1964 earthquake?`},
 {title:"Hello, Seldovia! Welcome to Week 40 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Sep 29, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 40 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"Happy National Coffee Day!",excerpt:"Let's raise our mugs and celebrate the magic of coffee - a daily dose of energy, warmth, and inspiration.",date:"Sep 29, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-29.jpg",body:`Happy National Coffee Day! ☕

Let's raise our mugs and celebrate the magic of coffee - a daily dose of energy, warmth, and inspiration. Whether you like it black, creamy, or sweet, coffee brings folks together.

Here's to endless cups of creativity and caffeinated moments! 🎉✨

#seldoviaalaska #seldovia #seldoviaak #seldoviacom #Alaska #alaskalife #alaskaliving #seldovialife #coffeeday`},
 {title:"Life in Seldovia is all about connection to each other, to the land, and to the sea.",excerpt:"While our town may be small, we're proud to be part of Alaska's coastal heartbeat.",date:"Sep 28, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-28.jpg",body:`Life in Seldovia is all about connection to each other, to the land, and to the sea.

While our town may be small, we're proud to be part of Alaska's coastal heartbeat. From local fishermen bringing in fresh catch, to small businesses fueling our economy, to neighbors volunteering and lifting each other up, Seldovia shows what it means to thrive together. 💙

Our community doesn't just live by the water, we live with it —celebrating traditions, protecting our environment, and sharing the beauty of this place with visitors who soon feel like family.`},
 {title:"Happy World Tourism Day!",excerpt:"Let's celebrate the beauty of travel, the diversity of cultures, and the unforgettable memories that unite us all.",date:"Sep 27, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-27.jpg",body:`🌍✈️ Happy World Tourism Day! 🎏

Let's celebrate the beauty of travel, the diversity of cultures, and the unforgettable memories that unite us all.

Whether you're exploring new destinations or revisiting familiar ones, let's cherish the experiences that broaden our horizons and connect us to the world.

Here's to more adventures and meaningful journeys ahead! 🌍🌟`},
 {title:"Fall colors over Anchorage!",excerpt:"Fall colors over Anchorage!",date:"Sep 26, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-26.jpg",body:`Fall colors over Anchorage! 🍁`},
 {title:"We're recorded! This beautiful 3+ acre parcel on Nutbeem Road has officially closed.",excerpt:"Congratulations to the Sellers and the Buyers on this exciting new chapter in Seldovia!",date:"Sep 25, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-25_2.jpg",body:`We're recorded! ✨

This beautiful 3+ acre parcel on Nutbeem Road has officially closed. Congratulations to the Sellers and the Buyers on this exciting new chapter in Seldovia!`},
 {title:"A unique opportunity has just been secured in the heart of Seldovia!",excerpt:"This property carries both charm and potential, giving the new owners a head start on creating their Seldovia dream.",date:"Sep 25, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-25.jpg",body:`A unique opportunity has just been secured in the heart of Seldovia! Congratulations to the Sellers and the Buyers!

This property carries both charm and potential, giving the new owners a head start on creating their Seldovia dream. 😊🌿`},
 {title:"The modern world often feels louder, faster, and more disconnected than ever before. Yet in Seldovia, life moves differently!",excerpt:"Here, connection isn't found in Wi-Fi signals or endless notifications, it's found in genuine human moments.",date:"Sep 24, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-24.jpg",body:`The modern world often feels louder, faster, and more disconnected than ever before. Yet in Seldovia, life moves differently! Here, connection isn't found in Wi-Fi signals or endless notifications, it's found in genuine human moments.

Like a 2 minute errand to the Post Office becomes a 25 minute visit with a neighbor!  Or a stop at the Crabpot means a meaningful hello to a friend in the aisle! 🌿✨

Even nature itself encourages connection. Without the constant buzz of city life, evenings are spent watching sunsets together, sharing stories by a fire, or simply walking the beach. It's in these unhurried moments that people find what so many crave: belonging.

In a world where it's easy to feel disconnected, Seldovia quietly reminds us that the strongest connections are built not online, but in person with kindness, presence, and care. 💙`},
 {title:"Embracing the changing colors and crisp air on this beautiful First Day of Fall!",excerpt:"Let the pumpkin spice “everything” begin!",date:"Sep 23, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-23.jpg",body:`Embracing the changing colors and crisp air on this beautiful First Day of Fall! 🌷 Let the pumpkin spice "everything" begin! 🎃✨`},
 {title:"Taken from East End Road in Homer, this breathtaking view looks across Kachemak Bay toward Seldovia!",excerpt:"Taken from East End Road in Homer, this breathtaking view looks across Kachemak Bay toward Seldovia!",date:"Sep 22, 2025",read:"1 min",cat:"Living Here",img:"",body:`Taken from East End Road in Homer, this breathtaking view looks across Kachemak Bay toward Seldovia!`},
 {title:"Hello, Seldovia! Welcome to Week 39 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Sep 22, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 39 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"Seldovia is a foodie's paradise, especially when it comes to seasonal delights!",excerpt:"From fresh seafood to wild berries, each season brings its own flavors to savor.",date:"Sep 21, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-21.jpg",body:`Seldovia is a foodie's paradise, especially when it comes to seasonal delights! From fresh seafood to wild berries, each season brings its own flavors to savor. Here's what to try and where to find it:

Spring 🌱
✅ Mushrooms – Hunt in the forests or ask locals where to forage safely.
✅ Early Greens & Herbs

Summer 🌞
✅ Wild Salmonberries & Blueberries – Pick your own   or enjoy in treats at the local restaurants.
✅ Fresh Halibut & Salmon, rock fish and cod are available in the sea and some restaurants.  But you should go out and catch it yourself!  That is the adventure!

Fall 🍂
✅ Hedgehog Mushrooms – A favorite among foragers for soups and sautés.
✅ Game Meats – Goat, moose, duck and bear are around Seldovia.  And there's always Winter King salmon!

Winter ❄️
✅ Hearty Soups & Stews – Local cafes serve warming dishes perfect for chilly days.

Pro Tip: Many seasonal foods are best experienced through local festivals, markets, and restaurants so plan your visit around these for a true taste of Seldovia!`},
 {title:"A cozy home isn't about square footage or luxury finishes, it's about the feeling it gives you.",excerpt:"Ready to find the place that feels just right for you? Reach out today!",date:"Sep 20, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-20.jpg",body:`A cozy home isn't about square footage or luxury finishes, it's about the feeling it gives you. The laughter shared around the table, the comfort of a favorite chair, and the love that fills every corner. 💗

Ready to find the place that feels just right for you? Reach out today!`},
 {title:"Writers find quiet corners to let their stories flow, poets capture the raw beauty in verse, and dreamers discover visions shaped by the sea and sky.",excerpt:"If you were here, what kind of story would Seldovia inspire you to write?",date:"Sep 19, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-19.jpg",body:`Writers find quiet corners to let their stories flow, poets capture the raw beauty in verse, and dreamers discover visions shaped by the sea and sky.

📖 Why Seldovia Inspires:
✨ The stillness of nature opens space for reflection.
✨ The rich history and culture spark imagination.
✨ The dramatic landscapes feel like living poetry & living art.

Whether it's journaling by the water, sketching ideas in a cozy cabin, or simply breathing in the crisp coastal air, Seldovia gives dreamers the gift of perspective and possibility. 🌅

If you were here, what kind of story would Seldovia inspire you to write?`},
 {title:"We're pending! Two parcels just outside downtown Seldovia are off the market.",excerpt:"Congratulations to everyone involved in this rare Alaskan opportunity!",date:"Sep 18, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-18_2.jpg",body:`We're pending! Two parcels just outside downtown Seldovia are off the market. Congratulations to everyone involved in this rare Alaskan opportunity! 😊`},
 {title:"Happy National Cheeseburger Day!",excerpt:"What better excuse to treat yourself than today?",date:"Sep 18, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-18.jpg",body:`🍔 Happy National Cheeseburger Day! 🍔

What better excuse to treat yourself than today? Whether you like it stacked high with all the fixings or simple and classic, or a Smash Burger - a cheeseburger is always a reason to smile. 😋`},
 {title:"Living off the grid in Seldovia isn't just a choice, it's a lifestyle that asks for resilience, creativity, and a love for nature's raw beauty.",excerpt:"For many, living off the grid here is more than survival it's thriving in harmony with nature.",date:"Sep 17, 2025",read:"2 min",cat:"Living Here",img:"images/gazette/2025-09-17.jpg",body:`Living off the grid in Seldovia isn't just a choice , it's a lifestyle that asks for resilience, creativity, and a love for nature's raw beauty. Many who choose this path seek freedom from the noise of modern life, a deeper connection with the land, and the satisfaction of self-reliance.

⚡ The Challenges:

Power: Generators, solar panels, and fuel storage become daily concerns. A cloudy week or mechanical hiccup can quickly change your plans.

Water: Hauling water or setting up rain or water catchment systems requires effort and planning, especially in the winter months.

Food & Supplies: off-gridders rely on gardening, fishing, hunting, or long supply runs. Every trip to town is a strategic mission.

Weather: Seldovia's coastal storms and long winters test patience, equipment, and resourcefulness.

✨ The Joys:

Freedom: You decide how to power your home, grow your food, and manage your time.

Connection: Every day brings a stronger bond with the land, the sea, and the community around you.

Simplicity: Life slows down — each task has meaning, and each success feels earned.

Beauty: From snow-dusted mountains to summer's endless light, Seldovia gives back all it takes.

For many, living off the grid here is more than survival it's thriving in harmony with nature, finding joy in the small victories, and building a life where every sunrise is recognized as a gift. 🌅`},
 {title:"Seldovia's weather can be unpredictable, so packing smart makes your trip more comfortable and enjoyable.",excerpt:"Here's a handy guide: clothing, outdoor essentials, and optional items.",date:"Sep 16, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-16.jpg",body:`Seldovia's weather can be unpredictable, so packing smart makes your trip more comfortable and enjoyable. Here's a handy guide:

✨ Clothing
Layered outfits – Temperatures can change quickly; pack base layers, fleece, and a waterproof jacket.
Rain gear – Waterproof jacket, pants, and boots are essential, even in summer.
Comfortable shoes – Hiking boots or sturdy sneakers for trails and town exploration.
Hat & gloves – Especially for spring, fall, and winter visits.

✨ Outdoor Essentials
Backpack – For day hikes and beach walks.
Reusable water bottle – Stay hydrated during adventures.
Sunscreen & sunglasses – Even on cloudy days, UV protection is important.
Binoculars & camera – Capture wildlife and stunning scenery.

✨ Optional Items
Fishing gear – If you plan to try Seldovia's famous fishing.
Kayak or paddleboard equipment – For water enthusiasts.
Snacks & picnic supplies – Perfect for scenic stops.

No matter the season, being prepared means you can fully enjoy Seldovia's natural beauty, charming town, and outdoor adventures.`},
 {title:"Exploring Seldovia doesn't have to break the bank!",excerpt:"This charming Alaskan town is full of experiences you can enjoy on any budget.",date:"Sep 15, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-15.jpg",body:`Exploring Seldovia doesn't have to break the bank! This charming Alaskan town is full of experiences you can enjoy on any budget:

🥾 Hike the Trails – Take in breathtaking views without spending a dime.
🚣 Fish or Paddle – Bring your gear and enjoy the waters of Seldovia.
🍎 Pick Wild Berries – Taste the flavors of the season straight from nature.
📷 Capture Nature's Beauty – Wander the shores, forests, and mountains with your camera.
🎉 Local Festivals & Events – Many are free or low-cost, offering fun, food, and chilling with our community of good folks.

Seldovia is proof that some of the best adventures in life are simple, beautiful, and free!`},
 {title:"Hello, Seldovia! Welcome to Week 38 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Sep 15, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 38 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"Happy Grandparents Day to the pillars of family and wisdom!",excerpt:"Celebrate the generations that have built our families and enriched our lives.",date:"Sep 14, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-14.jpg",body:`Happy Grandparents Day to the pillars of family and wisdom! 🌳❤️

Celebrate the generations that have built our families and enriched our lives. Hug a grandparent today!`},
 {title:"5 ways to explore Seldovia: stroll the boardwalk, rent a bike, paddle around, hit the trails, and savor local eats.",excerpt:"In Seldovia, the journey is part of the experience and the best views are often found on foot or by pedal.",date:"Sep 13, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-13.jpg",body:`1. Stroll the Historic Boardwalk
Enjoy views of the slough, colorful buildings, and local shops at your own pace.

2. Rent a Bike
Cover more ground while still enjoying the fresh air. Biking is perfect for exploring the harbor, Outside Beach, and scenic overlooks.

3. Paddle Around
Kayak rentals let you explore Seldovia from the water—paddle the slough, coastline, and even to nearby beaches.

4. Hit the Trails
From the short Otterbahn Trail to longer hikes like Rocky Ridge, there's no shortage of walking adventures.

5. Savor Local Eats
Fuel your journey at coffee shops, food carts and restaurants right in town—most within a few minutes' walk of the harbor.

In Seldovia, the journey is part of the experience and the best views are often found on foot or by pedal.`},
 {title:"Happy National Day of Encouragement!",excerpt:"Today, let's lift each other up with kind words and positive vibes.",date:"Sep 12, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-12.jpg",body:`Happy National Day of Encouragement! Today, let's lift each other up with kind words and positive vibes. A little encouragement can go a long way, who are you cheering on today? 💖🙌`},
 {title:"Today, on Patriot Day, we pause to remember the lives lost, the heroes who stepped forward, and the strength that brought us together.",excerpt:"May we honor their memory by living with unity, compassion, and resilience every day.",date:"Sep 11, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-11.jpg",body:`Today, on Patriot Day, we pause to remember the lives lost, the heroes who stepped forward, and the strength that brought us together. May we honor their memory by living with unity, compassion, and resilience every day. ❤️🤍💙`},
 {title:"Long before Seldovia became the quiet coastal haven we know today, its shores were alive with the rhythms of the native people.",excerpt:"The name Seldovia is thought to come from the Russian word “seldevoy,” meaning “herring.”",date:"Sep 10, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-10.jpg",body:`Long before Seldovia became the quiet coastal haven we know today, its shores were alive with the rhythms of the native people. They fished the rich waters, gathered berries in the surrounding hills, and built a way of life deeply tied to the seasons and the sea.

The name Seldovia is thought to come from the Russian word "seldevoy," meaning "herring," a nod to the once-abundant fish that drew both Indigenous peoples and Russian traders to these waters in the 18th century.

When Russian explorers arrived, they brought new trade opportunities, religion, and ways of life, leaving lasting marks on the community.

Later, the American fishing industry transformed Seldovia into a lively port town, with canneries, fishing fleets, and boardwalks bustling with activity. For decades, the harbor was a lifeline to the peninsula, bringing in supplies, news, and visitors from around the world.

✨ To learn more about Seldovia, visit www.Seldovia.com.`},
 {title:"Here's what you need to know before you pitch your tent:",excerpt:"Getting here, camping spots, what to bring, activities, and leave no trace.",date:"Sep 8, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-08_2.jpg",body:`Here's what you need to know before you pitch your tent:

1. Getting Here
Seldovia is only accessible by boat, ferry, or small plane. Plan your travel in advance and consider bringing your gear with you, as supplies in town may be limited.

2. Camping Spots

Outside Beach – Popular for beachside camping and tidepool exploration.
Sandy Beach – Ideal for those arriving by kayak or skiff, with scenic views and quiet surroundings.

3. What to Bring
Warm, layered clothing (even in summer)
Rain gear and waterproof tent
Bug spray and bear-safe food storage
Cooking supplies and drinking water (or a water filter)

4. Activities
Hiking local trails like Otterbahn or Rocky Ridge
Kayaking along the slough and coastline
Fishing for halibut, salmon, or rockfish
Beachcombing for shells, driftwood, and sea glass

5. Leave No Trace
Help preserve Seldovia's natural beauty by packing out all trash, respecting wildlife, and minimizing your campfire impact.`},
 {title:"57739 Seldovia Bay Lease — 1.68 acres with 600 feet along the bay and 600 feet along the lagoon.",excerpt:"Solar + generator make everything easy. Comes with a boat! Amazing views all around.",date:"Sep 8, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-08.jpg",body:`📍 57739 Seldovia Bay Lease Seldovia, AK 99663
🌲 1.68 acres
🌞⚡ Solar + generator make everything easy
🌊 600 feet along the bay
🌿 600 feet along the lagoon
🏘️ Straight across from Seldovia
🚤 Comes with a boat!
🛁 Snorkel tub
😍 Amazing views all around
🔗 https://my.flexmls.com/.../lis.../20230910205956685677000000
🌐 www.SeldoviaProperty.com
📞 Call Jenny with Seldovia Property: (907) 406-0044`},
 {title:"A big congratulations to both the Sellers and the Buyers of this beautiful lot located right in the heart of Seldovia!",excerpt:"Such a great spot with so much potential, we can't wait to see what new memories and opportunities grow here.",date:"Sep 8, 2025",read:"1 min",cat:"Real Estate",img:"",body:`A big congratulations to both the Sellers and the Buyers of this beautiful lot located right in the heart of Seldovia! 🌿✨

Such a great spot with so much potential, we can't wait to see what new memories and opportunities grow here.`},
 {title:"A huge thank you to Liane! Grateful for the opportunity and for your kind words, looking forward to seeing you soon!",excerpt:"A huge thank you to Liane! Grateful for the opportunity and for your kind words.",date:"Sep 7, 2025",read:"1 min",cat:"Kind Words",img:"images/gazette/2025-09-07.jpg",body:`A huge thank you to Liane! Grateful for the opportunity and for your kind words, looking forward to seeing you soon! 💗`},
 {title:"It's Read A Book Day! Let's celebrate the power of stories, knowledge, and imagination today.",excerpt:"Put down your phone and let's get lost in the pages while we embrace the joy of reading!",date:"Sep 6, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-06.jpg",body:`It's Read A Book Day! 📚🌍 Let's celebrate the power of stories, knowledge, and imagination today.

Whether it's learning something new, being inspired by a biography, or enjoying an adventure, romance, mystery or fantasy, books have the magical ability to transport us to different worlds, and help us grow to be the people we want to be, for ourselves, and for others.

Put down your phone and let's get lost in the pages while we embrace the joy of reading! 📖💫🌟`},
 {title:"Happy National Cheese Pizza Day!",excerpt:"There's nothing like a classic slice of cheesy goodness to make any day better.",date:"Sep 5, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-05_2.jpg",body:`Happy National Cheese Pizza Day! There's nothing like a classic slice of cheesy goodness to make any day better.

Whether you prefer it thin crust or deep dish, let's celebrate the ultimate comfort food! 🍕`},
 {title:"It's always exciting to see dreams take root here, whether it's building a future home, creating a getaway retreat, or simply investing in a piece of Seldovia's beauty!",excerpt:"Thinking about buying or selling in Seldovia? Reach out today, let's make your real estate goals a reality!",date:"Sep 5, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-05.jpg",body:`It's always exciting to see dreams take root here, whether it's building a future home, creating a getaway retreat, or simply investing in a piece of Seldovia's beauty! 💗

👉 Thinking about buying or selling in Seldovia? Reach out today, let's make your real estate goals a reality!`},
 {title:"Start your day along the Seldovia Slough, where colorful boats and reflections dance across the water.",excerpt:"The skies over Seldovia put on a nightly masterpiece worth framing.",date:"Sep 4, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-04.jpg",body:`Start your day along the Seldovia Slough, where colorful boats and reflections dance across the water. Then wander the Otterbahn Trail for vibrant wildflowers, coastal bluffs, and sweeping views of Kachemak Bay. Don't miss the historic boardwalk—its weathered planks and character-filled homes are pure Alaskan charm.

For wildlife lovers, the harbor and nearby beaches offer chances to photograph otters, eagles, and the occasional bear foraging along the shore. If you're lucky enough to be here at low tide, the tidepools sparkle with starfish, anemones, and crabs, perfect for close-up shots.

And when the day winds down, head to the Watchpoint or catch the glow from your own deck—the skies over Seldovia put on a nightly masterpiece worth framing. 🌞🌿`},
 {title:"L1 Shoreline Drive — Waterfront Seldovia lot for sale, .18 acres of buildable land with a natural beach.",excerpt:"Unobstructed sunrise views, close to everything, heavily treed, wild berries abound.",date:"Sep 3, 2025",read:"1 min",cat:"Real Estate",img:"",body:`📍 L1 Shoreline Drive Seldovia, AK 99663
🌊 Waterfront Property
🌲 .18 Acres
🏗️ Buildable Land
🏖️ Natural Beach
⚡ Utilities Nearby
🌅 Unobstructed Sunrise Views
🌲 Close to Everything
🌲 Heavily Treed
🍎 Wild Berries Abound
🔗 https://my.flexmls.com/.../lis.../20250715170737248737000000
🌐 https://www.seldoviaproperty.com/
📞 Call Jenny with Seldovia Property (907) 406-0044`},
 {title:"No matter the season, Seldovia offers adventures that will leave you in awe.",excerpt:"From summer fishing trips and berry picking to winter walks and cozy gatherings, our little coastal town is full of charm year-round.",date:"Sep 2, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-02.jpg",body:`No matter the season, Seldovia offers adventures that will leave you in awe. 🌊🏔️ From summer fishing trips and berry picking to winter walks and cozy gatherings, our little coastal town is full of charm year-round. Here are some favorites:

🎣 Cast for salmon, halibut, or rockfish in our rich waters.
🥾 Explore scenic trails surrounded by breathtaking views.
🛶 Kayak through calm bays and spot eagles, otters, and more.
🌅 Capture the vibrant colors of a Seldovia sunset.
🍽️ Savor fresh, local seafood at welcoming eateries.

Whether you're here for a weekend getaway or a long, peaceful stay, there's always something to enjoy in Seldovia, Alaska. 💙`},
 {title:"Hello, Seldovia! Welcome to Week 36 of 2025!",excerpt:"Stay connected and in the loop with everything happening around town, from community events to fun activities.",date:"Sep 1, 2025",read:"1 min",cat:"Community",img:"",body:`Hello, Seldovia! Welcome to Week 36 of 2025!

Stay connected and in the loop with everything happening around town, from community events to fun activities, all posted daily on
www.Seldovia.com 🌊✨

👉 Don't miss a moment. Bookmark the site and check back often to see what's new in Seldovia!`},
 {title:"Happy Labor Day from Seldovia!",excerpt:"Today we celebrate the hard work, dedication, and spirit of those who keep our community strong.",date:"Sep 1, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-01.jpg",body:`✨ Happy Labor Day from Seldovia! ✨

Today we celebrate the hard work, dedication, and spirit of those who keep our community strong. Whether you're casting a line, enjoying the trails, or simply soaking up the last days of summer, we hope you take this time to relax and recharge—you've earned it! 💙

Here's to the workers, dreamers, and doers thank you for all that you do. 🙌`},
 {title:"Here are a few tips to make the most of your time on the water.",excerpt:"Watch the tides, use local bait, explore both river and coastal waters, and bring your camera!",date:"Aug 30, 2025",read:"1 min",cat:"Living Here",img:"",body:`Here are a few tips to make the most of your time on the water:

🌊 Watch the tides, sometimes choosing early mornings or late evenings when fish are most active can be productive!
🎣 Use local bait like salmon eggs or herring to attract the big ones.
🚣 Explore both river spots and coastal waters—variety is key!
🌊 Don't forget sunscreen, a hat, and plenty of water to stay comfortable.
📷 Bring your camera, you never know when you'll reel in a memorable catch!`},
 {title:"So great to see beautiful unimproved Barabara Heights parcels being bought and plans made!",excerpt:"Welcome to this nice couple who want to spend more time in Seldovia!",date:"Aug 30, 2025",read:"1 min",cat:"Real Estate",img:"",body:`So great to see beautiful unimproved Barabara Heights parcels being bought and plans made and life brought to the land! Welcome to this nice couple who want to spend more time in Seldovia! Can't wait to see what you will create in this space! Congratulations!`},
 {title:"Congratulations to the new owner of this truly one-of-a-kind Seldovia property!",excerpt:"One of the best parts of my job is handing over the keys to a new beginning.",date:"Aug 29, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-08-29.jpg",body:`✨ Congratulations to the new owner of this truly one-of-a-kind Seldovia property! ✨

What an exciting day! One of the best parts of my job is handing over the keys to a new beginning. This unique spot is full of charm and character, and I know it will be a wonderful place to create lasting memories. 😊`},
 {title:"Challenges aren't roadblocks; they're stepping stones.",excerpt:"Stay strong, stay focused, and shine through!",date:"Aug 29, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-08-29_2.jpg",body:`Challenges aren't roadblocks; they're stepping stones. Stay strong, stay focused, and shine through! 💗`},
 {title:"From thrilling outdoor adventures to peaceful moments in nature, Seldovia offers endless ways to soak in its beauty.",excerpt:"Cast a line, explore scenic trails, pick wild berries, paddle the calm bays, and don't miss the sunsets.",date:"Aug 27, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-27.jpg",body:`From thrilling outdoor adventures to peaceful moments in nature. Seldovia offers endless ways to soak in its beauty.

🎣 Cast a line and fish for salmon or halibut in our bountiful waters.
🥾 Explore scenic hiking trails with breathtaking views around every corner.
🍎 Pick wild berries.
🚣 Paddle the calm bays or take a boat tour to discover hidden coves and wildlife.
🌅 Don't miss the stunning sunsets that light up the sky with colors you won't forget.`},
 {title:"Summer in Seldovia means delicious flavors and unforgettable celebrations!",excerpt:"From fresh seafood straight off the boat to wild berry treats, our local food scene shines bright.",date:"Aug 24, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-24.jpg",body:`Summer in Seldovia means delicious flavors and unforgettable celebrations! From fresh seafood straight off the boat to wild berry treats, our local food scene shines bright.

Don't miss the fun at our summer festivals where you can taste amazing dishes, enjoy live music, and connect with the community. Whether you're sampling salmonberry jams or savoring freshly caught fish, every bite tells a story of this special place.`},
 {title:"The beautiful Iliamna, nature's masterpiece in Alaska.",excerpt:"The beautiful Iliamna, nature's masterpiece in Alaska.",date:"Aug 23, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-23.jpg",body:`The beautiful Iliamna, nature's masterpiece in Alaska. ✨`},
 {title:"Dreaming of a home tucked away in one of Alaska's most charming coastal towns?",excerpt:"Buying property in a place like Seldovia is exciting but it's also different from buying in a city or suburb.",date:"Aug 22, 2025",read:"2 min",cat:"Real Estate",img:"images/gazette/2025-08-22.jpg",body:`Dreaming of a home tucked away in one of Alaska's most charming coastal towns? Buying property in a place like Seldovia is exciting but it's also different from buying in a city or suburb.

Here's what you can expect when searching for your piece of paradise in a remote Alaska town.

🚢 1. Access Shapes Everything
Seldovia isn't connected to the road system—EVERYONE has to arrive by boat or plane. That means materials for building or remodeling come over on the AMHS or flown in. It's part of what gives our community character.

🏠 2. Fewer Listings, Special Finds
Remote markets are small, which means there might only be a handful of homes for sale at any given time. When a property hits the market here, it's often something special—so buyers who are serious need to be ready to move quickly when the right place pops up.

💡 3. Expect a Mix of Old and New
You'll see everything from historic cabins that have been loved for decades to newly built homes with modern features. Many properties carry the charm of their history—while others are blank canvases waiting for your vision.

🌿 4. Lifestyle Comes First
Buying in a place like Seldovia isn't just about a house it's about embracing a way of life. Think boat and plane commutes to Homer, berry bushes in the yard, wildlife sightings from your window, and a strong sense of community you won't find anywhere else.

🛠️ 5. Be Prepared for Logistics
From inspections to insurance to maintenance, things work a little differently here. Working with a local real estate expert (👋 that's where I come in!) makes navigating those steps easier and ensures you understand every part of the process.

https://www.seldoviaproperty.com/.../dreaming-of-a-home...`},
 {title:"A perfect Seldovia day calls for a walk along Outside Beach.",excerpt:"A perfect Seldovia day calls for a walk along Outside Beach.",date:"Aug 21, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-21.jpg",body:`A perfect Seldovia day calls for a walk along Outside Beach. 🌊`},
 {title:"Exciting News in Seldovia! This new family of five is beginning their journey here!",excerpt:"They'll be working on their home in phases, starting with raw land.",date:"Aug 20, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-08-20.jpg",body:`Exciting News in Seldovia! This new family of five is beginning their journey here! They'll be working on their home in phases, starting with raw land and slowly building it into the place they'll one day call home.

We can't wait to watch their vision come to life and welcome them fully into the Seldovia community! 🌲🏡
https://www.seldoviaproperty.com/.../exciting-news-in...`},
 {title:"No matter the season, Seldovia's spirit shines through — changing, growing, and reminding us why this place feels like home all year round.",excerpt:"What's your favorite season here?",date:"Aug 20, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-20_2.jpg",body:`No matter the season, Seldovia's spirit shines through — changing, growing, and reminding us why this place feels like home all year round.

What's your favorite season here?`},
 {title:"Went pending in just 3 days!",excerpt:"Opportunities like this don't come around often—properties in Seldovia are truly special.",date:"Aug 19, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-08-19.jpg",body:`✨ Went pending in just 3 days! ✨

Opportunities like this don't come around often—properties in Seldovia are truly special, and when they're available, they can move quickly! These lots are not only centrally located but also full of potential for creating a dream getaway or investment. 😊
https://www.seldoviaproperty.com/.../went-pending-in-just...`},
 {title:"Happy National Aviation Day!",excerpt:"Here in Seldovia, aviation isn't just a way to travel—it's a lifeline, an adventure, and sometimes even the best view in town.",date:"Aug 19, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-19_2.jpg",body:`Happy National Aviation Day!

Here in Seldovia, aviation isn't just a way to travel—it's a lifeline, an adventure, and sometimes even the best view in town.

From mail deliveries and medevac flights to breathtaking fly-ins and sightseeing tours, we're grateful for the pilots and planes that keep our skies (and spirits) soaring. ✈️`},
 {title:"One of the most magical parts of life in Seldovia? The wildlife!",excerpt:"From the harbor to the forest, you never know what you'll spot.",date:"Aug 18, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-18.jpg",body:`One of the most magical parts of life in Seldovia? The wildlife! From the harbor to the forest, you never know what you'll spot.

🦦 Sea otters float by year-round, often seen lounging in the harbor.
🦅 Bald eagles soar overhead in every season—keep your camera ready!
🐋 Whales pass through in spring and summer, creating unforgettable moments.
🐟 Salmon run in the slough and rivers during summer, drawing bears and anglers alike.
🦌 Moose are occasional visitors, and black bears are busy in the area all summer long.

Whether you live here or visit for a weekend, wildlife isn't just something you see—it's something you experience!
https://www.seldoviaproperty.com/.../one-of-the-most...`},
 {title:"Here's your reminder for today!",excerpt:"Here's your reminder for today!",date:"Aug 17, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-08-17.jpg",body:`Here's your reminder for today! 😊`},
 {title:"Thinking about raising a family in Seldovia?",excerpt:"Here's why this small coastal town is a big win for growing up.",date:"Aug 16, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-16.jpg",body:`Thinking about raising a family in Seldovia? Here's why this small coastal town is a big win for growing up:`},
 {title:"Embrace the calm and unwind—it's National Relaxation Day!",excerpt:"Seldovia is great for this - so many places to enjoy and take “time out” from technology, people and chaos.",date:"Aug 15, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-08-15.jpg",body:`Embrace the calm and unwind—it's National Relaxation Day! 🧖‍♀️✨

Take a moment for yourself, indulge in self-care, and let the stress melt away. Seldovia is great for this - so many places to enjoy and take "time out" from technology, people and chaos that seems to fill our days!

Here's to a day of tranquility, rejuvenation, and relaxation! 🌷🕊️`},
 {title:"This morning's rainbow was nature's way of saying, “Good morning, Seldovia!”",excerpt:"This morning's rainbow was nature's way of saying, “Good morning, Seldovia!”",date:"Aug 14, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-14.jpg",body:`This morning's rainbow was nature's way of saying, "Good morning, Seldovia!" 🌈`},
 {title:"Seldovia looks even more magical from the sky, don't you think?",excerpt:"An aerial glimpse of Seldovia Slough homes, captured in 2022.",date:"Aug 12, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-12.jpg",body:`Seldovia looks even more magical from the sky, don't you think?

An aerial glimpse of Seldovia Slough homes, captured in 2022.`},
 {title:"Life's most precious memories aren't bought or earned, they're felt deeply in the present.",excerpt:"So pause, breathe, and soak it all in.",date:"Aug 10, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-10.jpg",body:`Life's most precious memories aren't bought or earned, they're felt deeply in the present.

So pause, breathe, and soak it all in. Whether it's a quiet sunrise, a shared laugh, or a breathtaking view, the real value comes from embracing the moment with gratitude and joy. 😊`},
 {title:"Happy Book Lovers Day!",excerpt:"Let's celebrate the power of stories, knowledge, and imagination today.",date:"Aug 9, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-08-09.jpg",body:`📚 Happy Book Lovers Day! 🌍✨

Let's celebrate the power of stories, knowledge, and imagination today. Whether it's an adventure, romance, mystery, or fantasy, books have the magical ability to transport us to different worlds, learn new things and expand our horizons.

Let's get lost in the pages and embrace the joy of reading! 📖💫🌟`},
 {title:"Mini Salmonberry Pavlovas — A Must-Try!",excerpt:"Light, sweet, and bursting with salmonberry flavor!",date:"Aug 8, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-08-08.jpg",body:`Mini Salmonberry Pavlovas — A Must-Try!

Light, sweet, and bursting with salmonberry flavor! Add your own twist and you could win this year's Salmonberry Contest. 😊✨`},
 {title:"Here's a little inspiration to spark your creativity — join the fun at the Salmonberry Delights Contest this Sunday!",excerpt:"Whip up your own delicious recipe and join the fun!",date:"Aug 8, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-08-08_2.jpg",body:`Here's a little inspiration to spark your creativity, whip up your own delicious recipe and join the fun at the Salmonberry Delights Contest this Sunday! 😊`},
 {title:"Here's a little inspiration for your next masterpiece — salmonberry pie.",excerpt:"Sweet, tangy, and full of Seldovia summer flavor.",date:"Aug 7, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-08-07.jpg",body:`Here's a little inspiration for your next masterpiece — salmonberry pie 🥧🍑

Sweet, tangy, and full of Seldovia summer flavor... maybe this will spark your winning idea for the upcoming Salmonberry Delights Contest! 😊`},
 {title:"Did you know Seldovia's winters are surprisingly mild for Alaska?",excerpt:"What's YOUR favorite way to stay cozy during a Seldovia winter?",date:"Aug 4, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-08-04.jpg",body:`Did you know Seldovia's winters are surprisingly mild for Alaska? What's YOUR favorite way to stay cozy during a Seldovia winter? ☕🔥

#seldoviaalaska #seldovia #seldoviaak #seldoviacom #Alaska #alaskalife #alaskaliving #seldovialife`},
 {title:"It's Official – Closed! This beautiful 3+ acre lot has officially found its new owners!",excerpt:"Congratulations to the buyers on securing such an incredible piece of Seldovia.",date:"Aug 1, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-08-01.jpg",body:`🎉 It's Official – Closed! 🎉

This beautiful 3+ acre lot has officially found its new owners! Congratulations to the buyers on securing such an incredible piece of Seldovia. ✨

#seldovia #seldoviaalaska #seldoviaak #seldoviaproperty #alaska #alaskalife`},
 {title:"August is here, and with it comes 31 fresh pages.",excerpt:"Every day is a new chance to write a story you love—full of purpose, joy, and maybe even a little adventure.",date:"Aug 1, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-08-01_2.jpg",body:`August is here, and with it comes 31 fresh pages. Every day is a new chance to write a story you love—full of purpose, joy, and maybe even a little adventure. 🌿🌞

What kind of story are you writing this month?`},
 {title:"Tell us you've been to Seldovia without telling us you've been to Seldovia...",excerpt:"Tell us you've been to Seldovia without telling us you've been to Seldovia...",date:"Jul 31, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-07-31.jpg",body:`Tell us you've been to Seldovia without telling us you've been to Seldovia... 😊

#seldovia #seldoviaalaska #seldoviaak #seldoviaproperty #alaska #alaskalife #alaskaliving`},
 {title:"Tag your ride-or-die bestie below and let them know why you're grateful!",excerpt:"The inside jokes that never get old, the late-night talks, and the adventures we'll remember forever.",date:"Jul 30, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-07-30.jpg",body:`Today, let's celebrate:
• The inside jokes that never get old 😂
• The late-night talks that make everything feel better 🌙
• The adventures, big and small, that we'll remember forever 🌍

Tag your ride-or-die bestie below and let them know why you're grateful!`},
 {title:"The Slough was like glass this day as we slowly motored up towards the airstrip.",excerpt:"Calm, quiet, and perfectly reflective. A peaceful moment in Seldovia.",date:"Jul 29, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-07-29.jpg",body:`The Slough was like glass this day as we slowly motored up towards the airstrip. Calm, quiet, and perfectly reflective. A peaceful moment in Seldovia. 🌊🌿`},
 {title:"Listed and Pending in ONE Day!",excerpt:"This Seldovia property didn't waste any time on the market and already pending in just one day!",date:"Jul 28, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-28.jpg",body:`Listed and Pending in ONE Day!

This Seldovia property didn't waste any time on the market and already pending in just one day! Congratulations to the seller and the soon-to-be new owners! 🎉`},
 {title:"Happy Parents' Day!",excerpt:"Today we celebrate the love, guidance, and strength of parents everywhere.",date:"Jul 27, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-07-27.jpg",body:`Happy Parents' Day! 👨‍👩‍👧‍👦

Today we celebrate the love, guidance, and strength of parents everywhere. Whether by birth, choice, or heart—thank you for the care, patience, and support you give every single day.

Here's to all the parents who shape our lives with unconditional love. 👏✨`},
 {title:"Before you fall in love with that dream home, get your financial green light!",excerpt:"Pre-approval shows you how much you can borrow, proves you're a serious buyer, and gives you a head start.",date:"Jul 24, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-24.jpg",body:`Before you fall in love with that dream home, get your financial green light! ✅

Pre-approval shows you how much you can borrow, proves you're a serious buyer, and gives you a head start once you're ready to make an offer.

It's more than a number, it's your ticket to shop with confidence. 🧳🔑`},
 {title:"Congratulations to the Seller and Buyers of these two great Seldovia lots!",excerpt:"It's always an honor to be part of such meaningful milestones.",date:"Jul 22, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-22.jpg",body:`Congratulations to the Seller and Buyers of these two great Seldovia lots! Thank you for trusting me to help guide this journey, it's always an honor to be part of such meaningful milestones. 😊✨`},
 {title:"Everything Seldovia, All in One Place!",excerpt:"Whether you're planning a visit, dreaming of making Seldovia your home, or you're a local—Seldovia.com has it all.",date:"Jul 21, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-07-21.jpg",body:`Everything Seldovia, All in One Place!

Whether you're planning a visit, dreaming of making Seldovia your home, or you're a local wanting to stay in the loop—Seldovia.com has it all.

📅 Stay updated on upcoming events
🏡 Browse current real estate listings
📸 See the latest community photos
📍 Discover local businesses and stories

It's your one-stop connection to this beautiful, tight-knit coastal town we love so much. Come explore what makes Seldovia truly special—visit Seldovia.com today!

#seldovia #seldoviaalaska #seldoviaak #seldoviaproperty #alaska #alaskalife #alaskaliving #seldoviacom`},
 {title:"Happy National Ice Cream Day!",excerpt:"Whether you're enjoying a cone by the harbor, a sundae at home, or a scoop after a beach walk—today's the perfect excuse to treat yourself!",date:"Jul 20, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-07-20.jpg",body:`Happy National Ice Cream Day!

Whether you're enjoying a cone by the harbor, a sundae at home, or a scoop after a beach walk—today's the perfect excuse to treat yourself!

What's your favorite flavor to enjoy in Seldovia?`},
 {title:"Congratulations to the happy sellers and the lucky new buyer of this beautiful, heavily wooded and level lot in Seldovia!",excerpt:"Can't wait to see what's next for this special property.",date:"Jul 18, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-18.jpg",body:`Congratulations to the happy sellers and the lucky new buyer of this beautiful, heavily wooded and level lot in Seldovia! Can't wait to see what's next for this special property. 🌞😊`},
 {title:"This large, beautifully wooded parcel sits right on Jakolof Bay Road, offering year-round access and HEA power nearby.",excerpt:"Bonus: The neighboring property is also for sale! Grab both and own a full 6-acre slice of Seldovia paradise!",date:"Jul 15, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-15.jpg",body:`🌲 This large, beautifully wooded parcel sits right on Jakolof Bay Road, offering year-round access and 💡 HEA power nearby—making it a prime location for your dream escape.

Surrounded by towering Sitka spruce, and bursting with blueberries and salmonberries 🫐, this land feels like pure Alaskan wilderness. With multiple building sites nestled among the trees 🌿 and the potential for breathtaking views from the top 🏔️, the possibilities are wide open.

✨ Bonus: The neighboring property is also for sale! Grab both and own a full 6-acre slice of Seldovia paradise!

🔗 Visit www.SeldoviaProperty.com for more info!`},
 {title:"A picture-perfect spot has found its next chapter, and we're so thrilled for everyone involved.",excerpt:"Here's to peaceful mornings, salty air, and countless memories to come!",date:"Jul 15, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-15_2.jpg",body:`A picture-perfect spot has found its next chapter, and we're so thrilled for everyone involved. Here's to peaceful mornings, salty air, and countless memories to come!

Thank you for letting me be part of this special moment in Seldovia. 🌿✨`},
 {title:"Crafting your dream home starts before you even get the keys, right in the heart of the purchase and sale contract.",excerpt:"Many properties in Seldovia are being sold turn-key.",date:"Jul 14, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-14.jpg",body:`Crafting your dream home starts before you even get the keys, right in the heart of the purchase and sale contract. 🔑

Many properties in Seldovia are being sold turn-key, as getting things to town (and out of town) is sometime a logistical and costly challenge!

As a buyer, you're always in a position to request specific items remain in the house if there's something that really catches your eye. Whether it's that stunning dining room table in the dining room or the top-of-the-line Traeger smoker, don't hesitate to make your desires known. By clearly outlining which items you would like to be included, its part of the negotiations as it helps to create the space exactly as you envision it.

📋 Have questions about how to make the most of your purchase agreement? Let's dive in together to ensure that your new home meets all your expectations!`},
 {title:"It's in the small, quiet moments, laughter with loved ones, a deep breath of fresh air.",excerpt:"Perfection isn't the goal. Living fully, with gratitude and heart that's where the magic is!",date:"Jul 13, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-07-13.jpg",body:`It's in the small, quiet moments, laughter with loved ones, a deep breath of fresh air, the feeling of peace after a long day where we find true joy.

Perfection isn't the goal. Living fully, with gratitude and heart that's where the magic is! ✨`},
 {title:"We were all set for a smooth listing photoshoot — and then this little local star strolled right in!",excerpt:"Perfect lighting, beautiful setting, everything in place. And then... a pose!",date:"Jul 12, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-07-12.jpg",body:`We were all set for a smooth listing photoshoot perfect lighting, beautiful setting, everything in place. And then... this little local star strolled right in and decided to strike a pose! 🐱😊`},
 {title:"A Perfect Place to Sit and Relax",excerpt:"Imagine unwinding with a cup of coffee and watching the world go by—this could be your everyday view from our Main Street listing.",date:"Jul 11, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-11.jpg",body:`A Perfect Place to Sit and Relax 🌊

Imagine unwinding with a cup of coffee and watching the world go by—this could be your everyday view from our Main Street listing in Seldovia.

Whether you're looking for peace, charm, or a cozy spot to call home, this place has it all, including income opportunities with a successful B&B and superb retail/office space along Main Street!

Don't miss the chance to own a front-row seat to a small-town home and business opportunity! Visit www.SeldoviaProperty.com to learn more! 😊✨`},
 {title:"One of the best parts of my work is hearing from clients after the sale or purchase is complete.",excerpt:"Thank you to everyone who has trusted me with such an important part of your life.",date:"Jul 10, 2025",read:"1 min",cat:"Kind Words",img:"images/gazette/2025-07-10.jpg",body:`One of the best parts of my work is hearing from clients after the sale or purchase is complete. Whether it's a quick note, a thoughtful message, or a kind word in passing, it means the world to me! 😊

Thank you to everyone who has trusted me with such an important part of your life. I'm grateful every day for the opportunity to be a part of your journey here in Seldovia. 👏✨`},
 {title:"Happy Fried Chicken Day!",excerpt:"There's nothing quite like crispy, golden goodness.",date:"Jul 6, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-07-06.jpg",body:`Happy Fried Chicken Day! 🍗

There's nothing quite like crispy, golden goodness. 😋 Whether you prefer it spicy 🌶️, classic 🍽️, or with a side of fries 🍟, let's celebrate this delicious comfort food!

What's your favorite way to enjoy fried chicken?`},
 {title:"Happy Fourth of July, Seldovia!",excerpt:"Let's hear it for the red, white, and blueberry (Our 4th theme this year!)",date:"Jul 4, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-07-04.jpg",body:`Happy Fourth of July, Seldovia! Let's hear it for the red, white, and blueberry (Our 4th theme this year!) 🇺🇸🫐

How do you plan on celebrating today? Let me know in the comments! 😊`},
 {title:"Looking for steady income and long-term growth? Rental properties might be your smartest move yet.",excerpt:"Check out Seldovia Property's current listings and see what rental opportunities might be waiting for you!",date:"Jul 3, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-03.jpg",body:`Looking for steady income and long-term growth? Rental properties might be your smartest move yet.

Check out Seldovia Property's current listings and see what rental opportunities might be waiting for you! Visit our website at www.SeldoviaProperty.com. ✨🌿`},
 {title:"Pricing your home right from the start makes all the difference.",excerpt:"Curious what your home is worth? Let's connect for a free, no-pressure home valuation.",date:"Jul 2, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-07-02.jpg",body:`Pricing your home right from the start makes all the difference. ✨

The key is understanding the market, evaluating your home's unique features, and setting a price that attracts serious buyers while maximizing your return.

Curious what your home is worth? Let's connect for a free, no-pressure home valuation. I'm here to help as your Seldovia Connection! 😊`},
 {title:"What I love about sunsets is... how they paint the sky with colors that words can't capture.",excerpt:"Reminding us to pause and appreciate the simple, beautiful moments. What do you love most about Seldovia sunset?",date:"Jul 1, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-07-01.jpg",body:`What I love about sunsets is... How they paint the sky with colors that words can't capture, reminding us to pause and appreciate the simple, beautiful moments. What do you love most about Seldovia sunset? 💛`},
 {title:"Because who doesn't love a pop of pink?",excerpt:"Because who doesn't love a pop of pink?",date:"Jun 30, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-30.jpg",body:`Because who doesn't love a pop of pink? 💗`},
 {title:"Here are some common real estate terms to help you feel confident and informed on your buying or selling journey.",excerpt:"Here are some common real estate terms to help you feel confident and informed.",date:"Jun 29, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-06-29.jpg",body:`Here are some common real estate terms to help you feel confident and informed on your buying or selling journey. 🌿✨`},
 {title:"Unlock Your Dream Home in 9 Easy Steps!",excerpt:"A simple, nine-step homebuyer guide to take you from “just looking” to “welcome home.”",date:"Jun 26, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-06-26.jpg",body:`Unlock Your Dream Home in 9 Easy Steps! Here's a simple, nine-step homebuyer guide to take you from "just looking" to "welcome home." 🏡✨`},
 {title:"Pending in Just 6 Days!",excerpt:"Big congratulations to both the sellers and buyers of this beautiful 3+ acre property in Seldovia!",date:"Jun 24, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-06-24.jpg",body:`Pending in Just 6 Days!

Big congratulations to both the sellers and buyers of this beautiful 3+ acre property in Seldovia! Exciting times ahead as this special piece of land begins its next chapter. 😊✨`},
 {title:"Witnessed the Seldovia Summer Solstice Music Festival right from my office window!",excerpt:"Music, laughter, and sunshine filling the air!",date:"Jun 23, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-06-23.jpg",body:`Witnessed the Seldovia Summer Solstice Music Festival right from my office window; music, laughter, and sunshine filling the air! 🎶🎻

One of the many joys of living and working in the heart of this vibrant little town. 💛`},
 {title:"Joy doesn't always arrive, it's something we build in the small moments.",excerpt:"The choices we make, and the way we show up each day!",date:"Jun 22, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-22.jpg",body:`Joy doesn't always arrive, it's something we build in the small moments, the choices we make, and the way we show up each day! Happy Sunday! ✨😊`},
 {title:"The summer solstice is often associated with June 21, but the exact date varies.",excerpt:"In Seldovia, the Summer Solstice is celebrated each year with our Music Festival!",date:"Jun 21, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-21.jpg",body:`The summer solstice is often associated with June 21, but the exact date varies. It typically occurs between June 20 and June 22 in the Northern Hemisphere, depending on the Earth's orbit and the Gregorian calendar.

The ACTUAL solstice happens at a precise moment when the Earth's tilt maximizes sunlight in the Northern Hemisphere—and this moment shifts slightly each year.

For example, in 2025, it's expected around June 20 at 10:43 PM UTC.

June 21 is a common celebration date due to tradition and calendar consistency, especially in cultures like those observing Midsummer. But the astronomical event isn't always exactly on that day!

Historically, the summer solstice has been celebrated across cultures for millennia, tied to agriculture, fertility, and renewal.

Solstice celebrations range from modern pagan rituals at Stonehenge to secular festivals like Sweden's Midsummer, where communities gather for music, food, and dancing. It's a blend of astronomical wonder and cultural heritage, reflecting humanity's deep connection to seasonal cycles.

In Seldovia, the Summer Solstice is celebrated each year with our Music Festival! This is a great time to visit our community, enjoy amazing music, time with friends, and hopefully beautiful weather on the longest days of the year! 🌞🎻
https://www.seldovia.com/save-the-dates-june-19-21st-for...`},
 {title:"Today's the Official First Day of Summer!",excerpt:"Longer days, brighter skies, and all the salty, sun-kissed Seldovia adventures await!",date:"Jun 20, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-06-20.jpg",body:`Today's the Official First Day of Summer! Longer days, brighter skies, and all the salty, sun-kissed Seldovia adventures await! Whether you're hiking, fishing, beachcombing, or just soaking in the views, summer starts now. 🌊🌲

How are you celebrating the season's arrival?`},
 {title:"Finally Under Contract!",excerpt:"This cozy cabin, nestled right by the water's edge, offers breathtaking views and that peaceful coastal lifestyle so many dream about.",date:"Jun 19, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-06-19.jpg",body:`Finally Under Contract! 🌊

This cozy cabin, nestled right by the water's edge, offers breathtaking views and that peaceful coastal lifestyle so many dream about. It's been a pleasure helping bring this special property to the next chapter and we're excited for all the memories that await the new owners! 😊`},
 {title:"Whether you're on a hike, kayaking the coastline, or simply relaxing on your porch, the wildlife in Seldovia is never far.",excerpt:"It's all part of the everyday magic here!",date:"Jun 16, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-06-16.jpg",body:`Whether you're on a hike, kayaking the coastline, or simply relaxing on your porch, the wildlife in Seldovia is never far, it's all part of the everyday magic here! 🌲🦅🦦`},
 {title:"Happy Father's Day, Seldovia!",excerpt:"So many great dads in our world! Go find one, give him a “Hi Five” and let him know just how important he is.",date:"Jun 15, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-15.jpg",body:`Happy Father's Day, Seldovia! 💙

Today, I'm celebrating the dads in my life! Unfortunately, my father and father-in-law are no longer with us - but my husband is the greatest dad I know, and our oldest son is doing an amazing job with his two littles!

So many great dads in our world! Go find one, give him a "Hi Five" and let him know just how important he is to our families in our community! What are you doing to celebrate the dads in your life today? 🤝`},
 {title:"Here in Seldovia, the flag waves proudly over our harbor, our homes, and our hearts.",excerpt:"Take a moment today to reflect, celebrate, and fly the flag high!",date:"Jun 14, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-14.jpg",body:`Here in Seldovia, the flag waves proudly over our harbor, our homes, and our hearts—reminding us of the values we hold dear and the beauty of living in a community that honors its roots.

Take a moment today to reflect, celebrate, and fly the flag high! ✨`},
 {title:"We'd love to see your slice of summer in Seldovia!",excerpt:"We'd love to see your slice of summer in Seldovia!",date:"Jun 13, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-06-13.jpg",body:`We'd love to see your slice of summer in Seldovia! ❤️`},
 {title:"It's Official! This cozy cabin is now officially recorded and ready for its next chapter!",excerpt:"Congratulations to the new owners, here's to new beginnings, warm spaces, and a lifetime of memories waiting to be made!",date:"Jun 12, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-06-12.jpg",body:`It's Official! This cozy cabin is now officially recorded and ready for its next chapter! Congratulations to the new owners, here's to new beginnings, warm spaces, and a lifetime of memories waiting to be made! 🪵🔑`},
 {title:"Should You Consider the Needs of Your Pets When Purchasing a Home?",excerpt:"Definitely! Our pets are more than just animals, they're family.",date:"Jun 11, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-06-11.jpg",body:`Should You Consider the Needs of Your Pets When Purchasing a Home?
Definitely! Our pets are more than just animals, they're family. 🐱🐕

When searching for your next home, it's important to think about how the space will work for them too.

✨ Does the yard offer enough room to play?
✨ Are there nearby trails or beaches for walks and adventures?
✨ Is there space indoors for them to rest, play, or feel safe during storms or fireworks?
✨ Is the location pet-friendly and safe from traffic?

A home that suits your lifestyle and supports your pets' well-being makes for a happier household all around. Whether you're looking for wide open spaces or a cozy cottage by the water, keeping your pets in mind ensures you're making the best choice for the whole family—two-legged and four-legged alike! 🐾💛

Thinking of making a move with your pets in mind? Let's find the perfect place together. Give me a call today!`},
 {title:"Hello, Seldovia! Welcome to Week 23 of 2025!",excerpt:"June is rolling along with fresh adventures, community gatherings, and fun for all ages.",date:"Jun 10, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-10.jpg",body:`Hello, Seldovia! Welcome to Week 23 of 2025!

June is rolling along with fresh adventures, community gatherings, and fun for all ages—be sure to check out what's happening this week!

Upcoming Events

🎒 SVT Kids Summer Program – Hike days, Outdoor days, Activity days. Check the flier for all the details!

🎟️ SBE Booster Club Paddleboard Raffle – Tickets available June 7th through July 26th at Booster Club Activities, Seldovia Coffee Roasters, and Seldovia Liquor Store.

Saturday, June 14, 2025
Flag Day Breakfast Potluck at Jack and Aiva's Restaurant. Call (907) 406-0044 with any questions or to get involved.

Weekly Activities

Seldovia Village Tribe (SVT)
• Fitness Center – Weekdays, 8:00–10:00 AM and 1:00–2:00 PM (Monday, Wednesday, Friday)
• Basketball Practice (Grades K–5) – 3:15–4:30 PM at SBE Gym
• Open Swim – Tuesdays, 3:15–5:00 PM

Sea Otter Community Center (SOCC)
• Percussion & Dance Classes with Eddie Wood – See the flier for dates and times
• Yoga – Tuesdays & Thursdays, 10:00–11:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Adult Ceramics Studio – Tuesdays, Thursdays & Fridays. Only $25 for 3 weeks—no registration required!

Seldovia Public Library – Spring Hours
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Church Services

Seldovia Bible Chapel
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Evening Bible Studies: Men's: 7:00 PM (Fellowship Hall); Women's: 7:00 PM (Church)

St. Nicholas Russian Orthodox Church
• Vespers – Saturdays, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help, your Seldovia Connection!`},
 {title:"Celebrating the joy of friendship on this special day!",excerpt:"Happy National Best Friends Day to the ones who've always been there through thick and thin.",date:"Jun 8, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-08.jpg",body:`Celebrating the joy of friendship on this special day! 💗 Happy National Best Friends Day to the ones who've always been there through thick and thin. Here's to the laughs, the memories, and the endless adventures with our ride-or-die crews! ✨`},
 {title:"In honor of National Black Bear Day, we're giving a nod to one of our most iconic (and shy!) neighbors.",excerpt:"Black bears are a treasured part of Seldovia's wild beauty.",date:"Jun 7, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-06-07.jpg",body:`In honor of National Black Bear Day, we're giving a nod to one of our most iconic (and shy!) neighbors. From wandering the forests to snacking on berries, black bears are a treasured part of Seldovia's wild beauty.

Let's celebrate them with respect, curiosity, and care—for the bears, and the wild spaces they call home. 🖤🌲`},
 {title:"Friday is #NationalDonutDay!",excerpt:"Why not surprise the kids with some yummy donuts?",date:"Jun 6, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-06.jpg",body:`Friday is #NationalDonutDay! 🍩 Why not surprise the kids with some yummy donuts? Home-made or shipped in from Homer - we love these FAT BOMBS! 😋✨`},
 {title:"Lace up those sneakers and hit the ground running—it's National Running Day!",excerpt:"Today is all about celebrating the joy of movement.",date:"Jun 4, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-04.jpg",body:`Lace up those sneakers and hit the ground running—it's National Running Day! ✨

Whether you're a seasoned marathoner or just starting your running journey, today is all about celebrating the joy of movement. Let's embrace the rhythm of our footsteps and the wind in our hair. Let's make every stride count and chase those endorphins! Happy Running, everyone! 🏃`},
 {title:"Happy National Egg Day!",excerpt:"Here in Seldovia, we're celebrating the freshest kind, straight from the coop!",date:"Jun 3, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-03.jpg",body:`Happy National Egg Day! 🥚

Here in Seldovia, we're celebrating the freshest kind, straight from the coop! Whether scrambled, poached, or sunny-side up, there's nothing like local eggs from happy hens right here in our community. 🍳💛`},
 {title:"Hello, Seldovia! Happy June and welcome to a new week full of connection, discovery, and summertime fun!",excerpt:"The Seldovia Chinook Challenge is happening now through July 3!",date:"Jun 2, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-02.jpg",body:`Hello, Seldovia! Happy June and welcome to a new week full of connection, discovery, and summertime fun!

Upcoming Events:

🎣 Seldovia Chinook Challenge – Happening now through July 3, 2025
Cast your line and compete for the biggest catch—good luck, anglers! Sign up at the Harbor Master's office.

Tuesday, June 3, 2025
• SVT Thrive: Medicinal Herbalism – 12:30–1:30 PM in the Elder's Room at ATC

Wednesday, June 4, 2025
• Seldovia Planning Commission Regular Meeting – 6:00 PM at Council Chambers
• Seldovia Chamber Membership Meeting – 1:15 PM at Jack and Aiva's Restaurant

Weekly Activities

Seldovia Village Tribe (SVT)
• Basketball Practice (Grades K–5) – Thursdays, 3:15–4:30 PM at SBE Gym
• Open Swim – Tuesdays, 3:15–5:00 PM

Sea Otter Community Center (SOCC)
• Yoga – Tuesdays & Thursdays, 10:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Adult Ceramics Studio – Tuesdays, Thursdays & Fridays. Only $25 for 3 weeks—no registration needed!

Seldovia Public Library – Spring Hours
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Church Services

Seldovia Bible Chapel
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Evening Bible Studies – Men's: 7:00 PM (Fellowship Hall); Women's: 7:00 PM (Church)

St. Nicholas Russian Orthodox Church
• Vespers – Saturdays, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com, if something catches your eye, I'm always here to help, your Seldovia Connection! 🌞✨`},
 {title:"Dreaming of waterfront living? Check out this stunning timber frame home in Seldovia, Alaska!",excerpt:"Built in 2017, this gorgeous property boasts over 4,600 square feet of luxurious space, including 6 spacious bedrooms and a giant loft.",date:"Jun 2, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-06-02_2.jpg",body:`Dreaming of waterfront living? Check out this stunning timber frame home in Seldovia, Alaska! Built in 2017, this gorgeous property boasts over 4,600 square feet of luxurious space, including 6 spacious bedrooms and a giant loft perfect for gatherings. Fully furnished with custom amenities - just bring your toothbrush and your kayak!

Imagine cooking in your commercial kitchen or enjoying a drink at your custom bar while soaking in breathtaking views! With beach access and over an acre of land, the possibilities are endless—think lodge potential or your personal retreat.

What would you love most about living in a home like this? Share your thoughts in the comments! 🌊💬 #SeldoviaLiving #WaterfrontHome #AlaskaRealEstate #SeldoviaProperty #Seldovia`},
 {title:"Hello, June!",excerpt:"Longer days, warmer breezes, and endless adventures await in Seldovia! What's first on your summer bucket list?",date:"Jun 1, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-06-01.jpg",body:`Hello, June! 🌞

Longer days, warmer breezes, and endless adventures await in Seldovia! What's first on your summer bucket list?`},
 {title:"Hello, Seldovia! Welcome to Week 21 of 2025!",excerpt:"We're heading into the final week of May with sunshine, celebration, and community connection!",date:"May 26, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-26.jpg",body:`Hello, Seldovia! Welcome to Week 21 of 2025!

We're heading into the final week of May with sunshine, celebration, and community connection!

UPCOMING EVENTS:

Monday, May 26, 2025
• Happy Memorial Day! Take a moment to honor and remember our fallen heroes.

Tuesday, May 27, 2025
• Seldovia City Council Special Meeting – 6:00 PM at Council Chambers
• SVT Thrive Writing Workshop – 12:30–2:30 PM in the Elder's Room at ATC
• SVT Final Swims – 3:15–5:00 PM

Wednesday, May 28, 2025
• SVT Swim Finale – 3:15 PM at Susan B. English School
• Seldovia BioBlitz – begins today with intertidal invertebrates led by Erin and Valisa (runs through Saturday, May 31)

Thursday, May 29, 2025
• BioBlitz macroalgae (seaweed) exploration with Tania Spurkland

Friday, May 30, 2025
• SVT Summer Kickoff BBQ – 1:00 PM at the outside beach (contact Laurel Hilts at 907-435-3252 for details)
• SVT Final Swims – 6:00–8:00 PM

Saturday, May 31, 2025
• BioBlitz botany and bird inventory with Cindy Mom

WEEKLY ACTIVITIES:

Seldovia Village Tribe (SVT)
• Basketball Practice (Grades K–5) – 3:15–4:30 PM at SBE Gym
• Open Swim – Tuesdays, 3:15–5:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (meet at ATC)
• After School Time (Grades K–5) – Mon/Wed/Fri, 3:15–5:00 PM at Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM (M/W/F)
• Open Gym – Fridays, 6:00–8:00 PM

Sea Otter Community Center (SOCC)
• Yoga – Tue & Thu, 10:00 AM
• Workout with Lisa – weekdays, 9:00–9:45 AM
• Open Club Day – Wednesdays, 3:15–5:00 PM
• Chess Club – Thursdays, 3:15–5:00 PM
• Arts & Crafts Club – Thursdays, 3:15–5:00 PM

Seldovia Public Library – Spring Hours
• Mon: 2:00–4:00 PM
• Tue: 2:00–7:00 PM
• Wed: 2:00–4:00 PM
• Thu: 2:00–4:00 PM
• Sat: 2:00–5:00 PM

Seldovia Bible Chapel
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Bible Studies – Men's at 7:00 PM (Fellowship Hall), Women's at 7:00 PM (Church)

St. Nicholas Russian Orthodox Church
• Vespers Service – Saturdays, 5:00–6:00 PM (call Ginny Glenn at 970-404-1249)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help, your Seldovia Connection!`},
 {title:"Dust off the bike and enjoy the views — biking isn't just a commute, it's a joy.",excerpt:"You also get the benefit of saying hello to all your friends and neighbors along the way!",date:"May 20, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-05-20.jpg",body:`You also get the benefit of saying hello to all your friends and neighbors along the way! Library are all within easy walking and biking distance! So dust off the bike and enjoy the views, biking isn't just a commute—it's a joy. ❤️

Whether you're pedaling along the boardwalk or cruising through the quiet backroads, today's the perfect excuse to leave the car behind and enjoy the ride.

You also get the benefit of saying hello to all your friends and neighbors along the way! 😊`},
 {title:"Thinking about making Seldovia your home?",excerpt:"Whether you're drawn to the quiet charm of Main Street, the stunning waterfront views, or the tucked-away trails of the surrounding hillside, each corner of Seldovia offers something unique.",date:"May 19, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-05-19.jpg",body:`Thinking about making Seldovia your home? Whether you're drawn to the quiet charm of Main Street, the stunning waterfront views, or the tucked-away trails of the surrounding hillside, each corner of Seldovia offers something unique.

Here are a few key things to consider:
✨ Lifestyle – Want to be close to the harbor, the school, or nature trails?
🚶 Walkability – Some areas are steps from local shops and cafes, while others offer more privacy.
🏠 Views & Vibe – From oceanfront tranquility to forested serenity—what calls to you?
🏡 Property Type – Ready-to-move-in homes, fixer-uppers, or vacant land to build your dream.

No matter your goals, I'm here to help you find your perfect spot in our beautiful corner of Alaska. Let's explore what fits you best!`},
 {title:"Hello, Seldovia! Welcome to Week 20 of 2025!",excerpt:"The final bell is ringing at Susan B. English, the derby boats are heading out, and the community is coming together.",date:"May 19, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-19_2.jpg",body:`Hello, Seldovia! Welcome to Week 20 of 2025!

The final bell is ringing at Susan B. English, the derby boats are heading out, and the community is coming together for celebration and remembrance. Let's welcome the week with fresh energy and appreciation for all the ways we can gather, grow, and enjoy Seldovia!

Upcoming Events:

Monday, May 19, 2025
• POSTPONED – City of Seldovia Spring Clean-Up Week was scheduled for May 19–22

Thursday, May 22, 2025
• Susan B. English School – End of School Year

Friday, May 23, 2025
• Seldovia Chamber of Commerce's Annual Human Powered Fishing Derby begins! (May 23-25)
🐟 Saturday, May 24 – Derby continues
🐟 Sunday, May 25 – Derby Finale & Community Potluck at 5:00 PM
➤ Join the Facebook group for updates: The Seldovia Human Powered Fishing Derby

Sunday, May 25, 2025
• Blessing of the Fishermen and Fleet – 10:00 PM at the Gateway Pavilion on Main Street

Weekly Activities:

Seldovia Village Tribe (SVT)
• SVT Basketball Practice (Grades K–5) – 3:15–4:30 PM at the SBE Gymnasium
• Open Swim – Tuesdays, 3:15–5:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (Meet at ATC – all abilities welcome!)
• After School Time (Grades K–5) – Mondays, Wednesdays, Fridays, 3:15–5:00 PM at Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM and 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym & Swim – Fridays, 6:00–8:00 PM (Swim ended May 16)

Sea Otter Community Center (SOCC)
• Yoga – Tuesday and Thursday, 10:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Open Club Day – Wednesdays, 3:15–5:00 PM
• Chess Club – Thursdays, 3:15–5:00 PM
• Arts & Crafts Club – Thursdays, 3:15–5:00 PM
• Ceramics Studio – Kids and adults, see flyer for times and details

Susan B. English School – Updated Pool Schedule
• Lap Swim – Monday, Wednesday, Friday, 8:00–10:00 AM
• Lap Swim – Tuesday and Friday, 5:00–6:00 PM
• 50+ Exercise – Monday, Wednesday, Friday, 10:00–11:00 AM
• Tot Swim – Thursdays, 10:00–11:30 AM (for families with children ages 4 and under)

Seldovia Public Library – Spring Hours
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Seldovia Bible Chapel
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM at the Fellowship Hall; Women's Bible Study – 7:00 PM at the Church

St. Nicholas Russian Orthodox Church
• Vespers Service – Saturdays, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more info)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help, your Seldovia Connection!`},
 {title:"Happy World Baking Day!",excerpt:"Today we're sending a big THANK YOU to all of Seldovia's amazing bakers.",date:"May 17, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-17.jpg",body:`Happy World Baking Day! 🍞🥐

Today we're sending a big THANK YOU to all of Seldovia's amazing bakers who fill our town with the smell of fresh bread, sweet treats, and warm smiles.

From perfectly golden loaves to irresistible pastries, you make our days a little sweeter and our community a whole lot tastier.`},
 {title:"We just recorded on this cozy cabin in Seldovia. Congratulations to our wonderful buyers!",excerpt:"Here's to new beginnings, peaceful mornings, and making memories in this special corner of Nutbeem Road.",date:"May 16, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-05-16.jpg",body:`We just recorded on this cozy cabin in Seldovia. Congratulations to our wonderful buyers! Here's to new beginnings, peaceful mornings, and making memories in this special corner of Nutbeem Road. 🌱✨`},
 {title:"Let the grillin' and chillin' begin! Happy National BBQ Day!",excerpt:"Fire up the grill and let the deliciousness unfold.",date:"May 16, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-16_2.jpg",body:`Let the grillin' and chillin' begin! Happy National BBQ Day! 🔥

Fire up the grill and let the deliciousness unfold. Gather 'round for sizzling bites and good times. Let's make this BBQ day one for the books! 🍖🌭`},
 {title:"Today, we celebrate the love, strength, and support that families bring into our lives.",excerpt:"In a small town like Seldovia, family often extends beyond the walls of a home.",date:"May 15, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-15.jpg",body:`Today, we celebrate the love, strength, and support that families bring into our lives—whether by blood, by choice, or by community. In a small town like Seldovia, family often extends beyond the walls of a home.

Here's to the people who lift us up, cheer us on, and make us feel at home no matter where we are. 💗`},
 {title:"When it comes to your dream home, how many rooms do you need?",excerpt:"Is bigger better with a spacious layout, or would you minimize your footprint?",date:"May 14, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-05-14.jpg",body:`When it comes to your dream home, how many rooms do you need?

How many bedrooms, a home office, and a guest room? Maybe a library, yoga studio or sewing room?

Is bigger better with a spacious layout, or would you minimize your footprint? Maybe more outdoor living spaces? 🤔`},
 {title:"This remote, peaceful town offers a true getaway where the hustle and bustle of daily life can't follow.",excerpt:"It's just you, the quiet waters, and the beauty of Seldovia.",date:"May 13, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-05-13.jpg",body:`This remote, peaceful town offers a true getaway where the hustle and bustle of daily life can't follow. It's just you, the quiet waters, and the beauty of Seldovia.`},
 {title:"Hello, Seldovia! Welcome to Week 19 of 2025!",excerpt:"It's mid-May and our community is blooming with energy!",date:"May 12, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-12.jpg",body:`Hello, Seldovia! Welcome to Week 19 of 2025!

It's mid-May and our community is blooming with energy! Check out what's happening in Seldovia this week!

Upcoming Events:

Monday, May 12, 2025
• Seldovia City Council Regular Meeting – 6:00 PM at Council Chambers (Agenda available online or at City Hall)

Tuesday, May 13, 2025
• SVT Thrive "Nettles" with Jenifer Dickson
• SVT Homeschool Wood Shop Class (Grades K–5) – 1:30–2:30 PM (May 13–15)

Thursday, May 15, 2025
• SVT Dr. Marlowe Veterinary Services – Call Debbie Cameron @ (907) 435-3255 to schedule an appointment!

Friday, May 16, 2025
• Seldovia Bay Ferry is sailing today – All aboard!

Saturday, May 17, 2025
• SOCC Science Friday (on Saturday!): "Science on the Boat" – (See the attached flier for more information)
• SVT Science Birding Trip – Contact Laurel Hilts at 907-435-3252 for more information.

Weekly Activities:

Seldovia Village Tribe (SVT)
• Swimming Lessons for Pre-K – Mondays, Wednesdays, Fridays until May 7
• SVT Basketball Practice (Grades K–5) – 3:15–4:30 PM at the SBE Gymnasium
• Open Swim – Tuesdays, 3:15–5:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (Meet at ATC – all abilities welcome!)
• After School Time (Grades K–5) – Mondays, Wednesdays, Fridays, 3:15–5:00 PM at Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM and 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym & Swim – Fridays, 6:00–8:00 PM (Swim ends May 16)

Sea Otter Community Center (SOCC)
• Yoga – Tuesday and Thursday, 10:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Open Club Day – Wednesdays, 3:15–5:00 PM
• Chess Club – Thursdays, 3:15–5:00 PM
• Arts & Crafts Club – Thursdays, 3:15–5:00 PM
• Ceramics Studio for kids and adults – See flyer for times and details

Susan B. English School Updated Pool Schedule
• Lap Swim – Monday, Wednesday, Friday, 8:00–10:00 AM
• Lap Swim – Tuesday and Friday, 5:00–6:00 PM
• 50+ Exercise – Monday, Wednesday, Friday, 10:00–11:00 AM
• Tot Swim – Thursdays, 10:00–11:30 AM. For families with children ages 4 and under.

Seldovia Public Library – Spring Hours
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Seldovia Bible Chapel
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM at the Fellowship Hall; Women's Bible Study – 7:00 PM at the Church

St. Nicholas Russian Orthodox Church
• Vespers Service – Saturdays, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more info)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help, your Seldovia Connection!`},
 {title:"Happy World Nurse Day!",excerpt:"Let's celebrate and honor the incredible dedication, compassion, and expertise of nurses worldwide.",date:"May 12, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-12_2.jpg",body:`Happy World Nurse Day! 🏥❤️

Let's celebrate and honor the incredible dedication, compassion, and expertise of nurses worldwide. Thank you for your tireless efforts in caring for us and making a difference in the lives of so many. 🙌🩺🌍`},
 {title:"Having a great mom means growing up with a fierce cheerleader, a gentle guide, and a safe haven.",excerpt:"The ripple of a mother's love transforms the world, one tender moment at a time.",date:"May 11, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-11.jpg",body:`...creating memories that anchor you through life's storms. ✨

Having a great mom means growing up with a fierce cheerleader, a gentle guide, and a safe haven—someone who teaches you to navigate life's highs and lows with grace. Her sacrifices often go unspoken, but she shapes who you are. From late nights to warm hugs (even when you resist!), and her unwavering belief in you—these are the precious gifts that last a lifetime.

Whether you're blessed with an incredible mom or strive every day to be one, know this: the ripple of a mother's love transforms the world, one tender moment at a time. 💖`},
 {title:"I've always felt like a match maker!",excerpt:"It's all about the connection the moment it just feels right.",date:"May 10, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-05-10.jpg",body:`I've always felt like a match maker! 🥹

It's all about the connection the moment it just feels right. Whether it's the cozy living room or that perfect view, the right home makes your heart skip a beat.

Ready to fall in love with your dream property? Give me a call - Jenny, broker/owner of Seldovia Property - 907-406-0044! I would love to help you make that connection! ✨`},
 {title:"Hit the thumbs up if you're a sunrise lover. Tap the heart if you're a sunset chaser!",excerpt:"Let's see which moment wins!",date:"May 9, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-05-09.jpg",body:`Hit the 👍 if you're a sunrise lover. Tap the ❤️ if you're a sunset chaser!

Let's see which moment wins! ✨`},
 {title:"Dreaming of finally owning a home this year? It's closer than you think!",excerpt:"Here's how to make it happen — from setting a budget to closing the deal.",date:"May 6, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-05-06.jpg",body:`Dreaming of finally owning a home this year? It's closer than you think! Here's how to make it happen:

1. SET A BUDGET: Calculate what you can afford based on your income and debts using online mortgage calculators, and start saving for a down payment. Call me if you need a hand working through the details!

2. CONNECT WITH AN AGENT: Find a trustworthy expert. Yep - you've got me!

3. GET PREAPPROVED: If you are truly "ready" to start the active search, this will give you an idea of how much you can borrow and show sellers you're serious.

4. START HOUSE HUNTING: Work with me to identify homes within your budget and your desired area.

5. MAKE AN OFFER: Once you find your home, I'll help you put together the offer that works for you and your family!

6. CLOSE THE DEAL: Sign the final papers, and become a homeowner! Whoop Whoop!

If you plan ahead and stay focused, this could be the year you finally get the keys to your future! Reach out today, and let's start making it happen. 🏡✨`},
 {title:"Hello, Seldovia! Welcome to Week 18 of 2025!",excerpt:"May is in full swing, bringing a fresh round of community events, meetings, and family fun!",date:"May 5, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-05.jpg",body:`Hello, Seldovia! Welcome to Week 18 of 2025!

May is in full swing, bringing a fresh round of community events, meetings, and family fun!

Upcoming Events

Monday, May 5, 2025
• SRSA Board Special Meeting – 5:00 PM. Available via Zoom and in person. The public is encouraged to attend and participate.

Wednesday, May 7, 2025
• SBE PAC Meeting – 4:00 PM in the Susan B. English Commons Area or via Zoom
• City of Seldovia Planning Commission Regular Meeting – 6:00 PM at Council Chambers

Friday, May 9, 2025
• SVT Cold Water Safety Training – May 9–10 (See flyer for more details)
• SVT Bike Rodeo – 3:15–4:30 PM at the Susan B. English School parking lot

Saturday, May 10, 2025
• SBE Booster Club Dinner & Auction 5pm at the Susan B. English School

Weekly Activities

Seldovia Village Tribe (SVT)
• Swimming Lessons for Pre-K – Mondays, Wednesdays, Fridays until May 7
• SVT Basketball Practice (Grades K–5) – 3:15–4:30 PM at the SBE Gymnasium
• Open Swim – Tuesdays, 3:15–5:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (Meet at ATC – all abilities welcome!)
• After School Time (Grades K–5) – Mondays, Wednesdays, Fridays, 3:15–5:00 PM at Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM and 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym & Swim – Fridays, 6:00–8:00 PM (Swim ends May 16)

Sea Otter Community Center (SOCC)
• Yoga – Tuesday and Thursday, 10:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Open Club Day – Wednesdays, 3:15–5:00 PM
• Chess Club – Thursdays, 3:15–5:00 PM until May 8
• Arts & Crafts Club 3:15-5:00pm
• Ceramics Studio for kids and adults – See flyer for times and details

Susan B. English School Pool
• Lap Swim – Monday, Wednesday, Friday, 8:00–10:00 AM
• Lap Swim – Tuesday and Friday, 5:00–6:00 PM
• 50+ Exercise – Monday, Wednesday, Friday, 10:00–11:00 AM

Seldovia Public Library – Spring Hours
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Seldovia Bible Chapel
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM at the Fellowship Hall; Women's Bible Study – 7:00 PM at the Church

St. Nicholas Russian Orthodox Church
• Vespers Service – Saturdays, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more info)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help, your Seldovia Connection!`},
 {title:"A Big Shout-Out to Our Seldovia Firefighters!",excerpt:"Thank you for your time, your expertise, and your unwavering dedication to keeping Seldovia safe.",date:"May 4, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-04.jpg",body:`A Big Shout-Out to Our Seldovia Firefighters! 🚒🔥

Let's take a moment to recognize the brave men and women who show up with courage, skill, and heart whenever our community needs them most.

Thank you for your time, your expertise, and your unwavering dedication to keeping Seldovia safe. We are so grateful for all that you do! 🙌`},
 {title:"Teaching is more than a profession—it's a passion that shapes futures.",excerpt:"On this Teacher Appreciation Day, let's celebrate the incredible mentors, guides, and lifelong learners who light the way for our youth.",date:"May 3, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-05-03.jpg",body:`Teaching is more than a profession—it's a passion that shapes futures. 📚🌟

Here in Seldovia, our teachers are in a position to do more than educate—they inspire, nurture, and help our community grow stronger every day. 💙

Do you have a special teacher that comes to mind? If so, give them a call today, a text or write a letter. A great teacher's incredible impact lasts a lifetime, and it is so important to let them know!

On this Teacher Appreciation Day, let's celebrate the incredible mentors, guides, and lifelong learners who light the way for our youth. Whether it's in a cozy classroom by the bay or out exploring nature as part of a lesson, thank you for all you do. ✨`},
 {title:"The days are longer, the wildflowers are blooming, and the town starts to come alive with that early summer energy.",excerpt:"May is the quiet, beautiful beginning of all the summer fun to come.",date:"May 2, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-05-02.jpg",body:`The days are longer, the wildflowers are blooming, and the town starts to come alive with that early summer energy. Whether you're here for wildlife, beach walks, or just a peaceful escape. 🌞🌊

May is the quiet, beautiful beginning of all the summer fun to come. Who's ready to make some memories in Seldovia?`},
 {title:"Whether you're fresh off the ferry or just strolling the boardwalk, The Linwood Bar & Grill is your go-to spot for hearty meals, cold drinks, and that classic small-town charm.",excerpt:"Swing by for lunch, stay for sunset, and leave with memories!",date:"Apr 30, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-30_3.jpg",body:`Whether you're fresh off the ferry or just strolling the boardwalk, The Linwood Bar & Grill is your go-to spot for hearty meals, cold drinks, and that classic small-town charm. 🍽️✨

Swing by for lunch, stay for sunset, and leave with memories (and maybe a full belly!). Whether you're a first-timer or a longtime local, there's always something new to try.

All summer the Linwood hosts live music over the weekends, so it is another great reason to swing by! 🎶

Photo credit to Linwood Bar & Grill`},
 {title:"SALE PENDING! In just 4 DAYS, this cozy cabin in Seldovia has found its perfect match!",excerpt:"From the moment it hit the market, we knew it wouldn't last long.",date:"Apr 30, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-30_2.jpg",body:`SALE PENDING! ✨

In just 4 DAYS, this cozy cabin in Seldovia has found its perfect match! 🔥🔥 From the moment it hit the market, we knew it wouldn't last long. The charm, the glorious woods, the special personal touches, and that cabin feel. It's no wonder this cabin has already found new owners excited to make it their own!`},
 {title:"This stunning waterfront lot went pending in just 4 DAYS and closed in a mere 2 WEEKS!",excerpt:"Talk about a quick and seamless transaction!",date:"Apr 30, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-30.jpg",body:`This stunning waterfront lot went pending in just 4 DAYS and closed in a mere 2 WEEKS! Talk about a quick and seamless transaction! 🌊🌊

It's safe to say this one didn't last long, and the new owners are ready to enjoy all the beauty and peace that comes with this prime spot. Congratulations! ✨`},
 {title:"As of 2025, the estimated population of Seldovia, Alaska, is approximately 254 residents.",excerpt:"It's the kind of place where neighbors wave, the local café knows your order, and life moves with the rhythm of the tides.",date:"Apr 29, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-29.jpg",body:`As of 2025, the estimated population of Seldovia, Alaska, is approximately 254 residents, according to Alaska Demographics. This only includes those who live inside the City limits full-time.

With less than 300 people calling Seldovia City their year-round home, it's the kind of place where neighbors wave, the local café knows your order, and life moves with the rhythm of the tides. 🌊✨

Want to know what it's really like to live or visit here? Tap into local events, real estate, and our daily calendar at www.Seldovia.com for a glimpse into our Seldovia life!`},
 {title:"Hello, Seldovia! Welcome to Week 17 of 2025!",excerpt:"The sun is staying out longer, and our town is coming alive with spring energy!",date:"Apr 29, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-29_2.jpg",body:`Hello, Seldovia! Welcome to Week 17 of 2025!

The sun is staying out longer, and our town is coming alive with spring energy! From community celebrations to Sea Week adventures, there's something for everyone to enjoy. Take a look below and mark your calendars!

Upcoming Events

Tuesday, April 29, 2025
• Seldovia City Council Budget Worksession – 5:00 PM at Council Chambers
• Sea Week at Susan B. English School – April 28–May 2 (A fun-filled adventure all week long learning about the sea, boating, and water safety!)
• SVT Thrive: Infant Learning Program – 12:30–1:30 PM at ATC in Seldovia

Sunday, May 4, 2025
Join us as we celebrate Jonathan and Melanie Hoard and their 20 years of faithful service at Seldovia Bible Chapel!
• Worship Service at 11:00 AM. Potluck lunch following the service.

Weekly Activities

Seldovia Village Tribe (SVT)
• Open Swim – Tuesdays, 3:15–5:00 PM and Fridays, 6:00–8:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (Meet at ATC – all abilities welcome!)
• After School Time (Grades K–5) – Mondays, Wednesdays, Fridays, 3:15–5:00 PM at Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM and 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym – Fridays, 6:00–8:00 PM

Sea Otter Community Center (SOCC)
• Yoga – Tuesday to Thursday, 10:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Open Club Day – Wednesdays, 3:15–5:00 PM
• Chess Club – Thursdays, 3:15–5:00 PM
• Ceramics Studio for kids and adults – see flyer for times and details

Susan B. English School Pool
• Lap Swim – Monday, Wednesday, Friday, 8:00–10:00 AM
• Lap Swim – Tuesday and Friday, 5:00–6:00 PM
• 50+ Exercise – Monday, Wednesday, Friday, 10:00–11:00 AM

Seldovia Public Library – Spring Hours
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Seldovia Bible Chapel
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM at the Fellowship Hall; Women's Bible Study – 7:00 PM at the Church

St. Nicholas Russian Orthodox Church
• Vespers Service – Saturdays, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more info)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help!`},
 {title:"Do you agree? Yes or no?",excerpt:"Do you agree? Yes or no?",date:"Apr 28, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-28.jpg",body:`Do you agree? Yes or no?`},
 {title:"Want to experience Seldovia like a local?",excerpt:"Whether you're looking to unwind by the water, explore art-filled corners, or grab a bite where the locals eat—we've got you covered.",date:"Apr 27, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-27.jpg",body:`Want to experience Seldovia like a local?

Whether you're looking to unwind by the water, explore art-filled corners, or grab a bite where the locals eat—we've got you covered.

Visit Seldovia.com for a full list of Seldovia's favorite locales and start planning your one-of-a-kind coastal adventure today! ✨`},
 {title:"How to Get Here: getting to Seldovia is half the adventure!",excerpt:"You can reach our charming coastal town by ferry, plane, or water taxi.",date:"Apr 26, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-26.jpg",body:`✨ How to Get Here: ✨
Getting to Seldovia is half the adventure! You can reach our charming coastal town by:

🚢 Ferry: Hop on the Seldovia Bay Ferry, Rainbow Connection or Tustumena Ferry for a scenic ride across Kachemak Bay right into the heart of Seldovia.

✈️ Plane: Enjoy breathtaking aerial views by flying into Seldovia on a small plane. Our airport is in easy walking distance to town!

🛥️ Water Taxi: For a more personal experience, water taxis provide a direct route to Jakolof Bay dock (pictured in the post) or you can charter a trip right into the heart of Seldovia.

What to Do Once You Arrive:
Check out this quick list of must-dos:

🏞️ Explore the Trails: From hiking in the Seldovia Wilderness to strolls along the coastline, the natural beauty is endless.

🐟 Fishing: Whether you're a seasoned pro or a beginner, Seldovia offers prime fishing spots.

🍽️ Local Eats: Enjoy delicious seafood and local cuisine at Seldovia's cozy eateries.

🏘️ Discover the History: Take a walk along the historic boardwalk or visit the Seldovia Historical Museum.

🚶 Tour around: Rent a bicycle, golf cart or kayak to tour the area by land or sea!

🛍️ Shop: We don't have a mall or big box stores (we love that about Seldovia) but we do have a few great places to pick up a treasure, a snack or drink or gift to go!`},
 {title:"Honestly, buying a home can be scary - just the “not knowing” what comes next.",excerpt:"The most important thing is to give me a call - we will walk through it together!",date:"Apr 25, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-25.jpg",body:`Honestly, buying a home can be scary - just the "not knowing" what comes next, what questions you should ask, what you don't want to forget, how to get started, what steps to get all the way to closing...

The most important thing is to give me a call - we will walk through it together! I'll help you in every way I can to answer your questions, get answers if I don't have them and help you gather all the information you need to make a great decision for you and your family! 😊

I got you!

So, if you are thinking about buying or selling, just give a call, we can start the conversation. I'd love to help make that next step easier! 📞`},
 {title:"Here's a Term You'll Want to Know!",excerpt:"Whether you're buying your first home or just love learning the lingo, understanding the basics makes the journey smoother.",date:"Apr 24, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-24.jpg",body:`Here's a Term You'll Want to Know! Whether you're buying your first home or just love learning the lingo, understanding the basics makes the journey smoother. Stay tuned for more real estate wisdom! 🏡`},
 {title:"Happy World Book Day!",excerpt:"Let's celebrate the power of stories, knowledge, and imagination today.",date:"Apr 23, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-23.jpg",body:`📚 Happy World Book Day! 🌍✨ Let's celebrate the power of stories, knowledge, and imagination today.

Whether it's an adventure, romance, mystery or fantasy, books have the magical ability to transport us to different worlds.

Or maybe, you are looking to learn some history, how to's or you're looking for encouragement, ideas and inspiration... it is ALL possible in a book!

Let's get lost in the pages and embrace the joy of reading! 📖💫🌟`},
 {title:"Celebrate Earth Day in Seldovia!",excerpt:"There are so many ways to get involved in Seldovia—whether it's volunteering, donating, or simply spreading the word about causes that matter.",date:"Apr 22, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-22.jpg",body:`Celebrate Earth Day in Seldovia! 🌍🌎

There are so many ways to get involved in Seldovia—whether it's volunteering, donating, or simply spreading the word about causes that matter. Every little effort helps keep our beautiful town thriving! ♻️`},
 {title:"Spring brings sunshine, blooming flowers, and the perfect market conditions to sell your home!",excerpt:"Increased buyer activity, maximized curb appeal, and favorable weather for showings and moving.",date:"Apr 21, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-21.jpg",body:`Spring brings sunshine, blooming flowers, and the perfect market conditions to sell your home! Here's why:

• Increased buyer activity: More families are out searching for their dream homes during this season, creating higher demand for your property.

• Maximized curb appeal: Spring's vibrant colors and landscapes naturally enhance the attractiveness of your home, impressing potential buyers at first sight.

• Favorable weather for showings and moving thanks to the pleasant weather. And for Seldovians, the Tusty is running - so moving in or out of Seldovia is easier!

Thinking of capitalizing on the spring market? Reach out today for a consultation!`},
 {title:"Hello, Seldovia! Welcome to Week 16 of 2025!",excerpt:"We've got a great lineup of events and activities this week in Seldovia!",date:"Apr 21, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-21_2.jpg",body:`Hello, Seldovia! Welcome to Week 16 of 2025!

We've got a great lineup of events and activities this week in Seldovia! Check out the exciting things happening:

Upcoming Events

Russian Orthodox Church:
Tuesday, April 22, 2025 -
• Father Mark Solomon is Coming to Seldovia!
– Tuesday, 5:00 PM: Vespers and Confessions
– Wednesday, 9:00 AM: Divine Liturgy
– Potluck Meal after Liturgy at Maurice & Ginny Glenn's home (379 Spruce St.) Everyone is invited to attend!!!

• SBE Pool Homeschool Swim Lessons start today! (See the photo flyer for more information)

Thursday, April 24, 2025
• SVT Spring Carnival – April 24 & 25
– Thursday, April 24: 3:15–7:00 PM
– Friday, April 25: 12:00–7:00 PM
See the flyer for the full list of activities!

Saturday, April 26, 2025
• SBE Lifeguard Certification Course – Saturday & Sunday, April 27th. $250 per person. Must be 16 years or older. Contact Amelia at 907-205-7963 or email amelia.pollack@gmail.com
• SAC - Earth Day Film Festival – 6:30–9:00 PM at the Sea Otter Community Center (SOCC)

Sunday, April 27, 2025
• Grace Haven Community Church Easter Service – Rescheduled to 5:00 PM on April 27.

WEEKLY ACTIVITIES:

Seldovia Village Tribe (SVT) Weekly Activities
• Open Swim – Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (Meet at ATC – All abilities welcome!)
• After School Time (Grades K–5) – Mondays, Wednesdays, Fridays, 3:15–5:00 PM at Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym – Fridays, 6:00–8:00 PM

Sea Otter Community Center (SOCC) Weekly Activities
• Yoga – Tuesday–Thursday, 10:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Open Club Day – Wednesdays, 3:15–5:00 PM
• Chess Club – Thursdays, 3:15–5:00 PM

Susan B. English School POOL Weekly Activities
• Lap Swim – Monday, Wednesday, Friday, 8:00–10:00 AM
• Lap Swim – Tuesday & Friday, 5:00–6:00 PM
• 50+ Exercise – Monday, Wednesday, Friday, 10:00–11:00 AM

Seldovia Public Library – Spring Hours
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Seldovia Bible Chapel Weekly Activities
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM at the Fellowship Hall; Women's Bible Study – 7:00 PM at the Church

St. Nicholas Russian Orthodox Church
• Vespers Service – Saturdays, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more info)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help!`},
 {title:"May our hearts be filled with hope, peace, and love as we remember the sacrifice of Jesus Christ.",excerpt:"Wishing everyone a happy and blessed Easter holiday.",date:"Apr 20, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-20_2.jpg",body:`May our hearts be filled with hope, peace, and love as we remember the sacrifice of Jesus Christ. Wishing everyone a happy and blessed Easter holiday. 🐰🐣🌿`},
 {title:"Hoppy Easter Sunday, everyone!",excerpt:"May your basket be full of chocolate eggs, your day be sprinkled with joy, and your hearts be as light as bunny hops!",date:"Apr 20, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-20.jpg",body:`Hoppy Easter Sunday, everyone! 🐰🌷

May your basket be full of chocolate eggs, your day be sprinkled with joy, and your hearts be as light as bunny hops! 🌼💛`},
 {title:"Check out Seldovia.com for events, photos, daily calendar and all the information on businesses, services and organizations that make Seldovia extra special!",excerpt:"Yes, it is all about the people!",date:"Apr 19, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-19.jpg",body:`Check out Seldovia.com for events, photos, daily calendar and all the information on businesses, services and organizations that make Seldovia extra special! ✨

Yes, it is all about the people! 😊☁️`},
 {title:"On this Good Friday, may your day be filled with reflection, renewal and the promise of His grace.",excerpt:"On this Good Friday, may your day be filled with reflection, renewal and the promise of His grace.",date:"Apr 18, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-18.jpg",body:`On this Good Friday, may your day be filled with reflection, renewal and the promise of His grace. 🙏🌷`},
 {title:"Your real estate agent works tirelessly to guide you home—and they deserve a little extra appreciation!",excerpt:"Here are 4 simple ways to show your agent just how much you value their hard work, dedication, and expertise.",date:"Apr 17, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-17.jpg",body:`Your real estate agent works tirelessly to guide you home—and they deserve a little extra appreciation! 💛 Here are 4 simple ways to show your agent just how much you value their hard work, dedication, and expertise. ✨

1. Leave a Positive Review
A well-written online review on platforms like Google or Zillow can go a long way in attracting new clients. Sharing your positive experience also helps build their reputation.

2. If you've had a great experience, recommend your agent to others who are looking to buy or sell. Personal referrals are invaluable.

3. Give them a shoutout on your social media profiles, whether it's sharing a post about the home they helped you buy or a simple thank-you tag. It's a great way to show public appreciation and help them grow their network.

4. Whether it's a phone call on the anniversary of your home purchase or checking in periodically, ongoing support reinforces your trust and appreciation for their hard work.`},
 {title:"Navigating the real estate market can be complex, but the right agent provides invaluable expertise to ensure a smooth and successful experience.",excerpt:"Here's how a professional agent can assist you!",date:"Apr 16, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-16.jpg",body:`Navigating the real estate market can be complex, but the right agent provides invaluable expertise to ensure a smooth and successful experience. Here's how a professional agent can assist you! 👇✨`},
 {title:"Friendly Reminder: Tax Deadline is here!",excerpt:"Don't forget to file your taxes and check that off the to-do list and stay financially savvy!",date:"Apr 15, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-15.jpg",body:`⏰ Friendly Reminder: Tax Deadline is here! 🧾 Don't forget to file your taxes and check that off the to-do list and stay financially savvy! 💰🧾`},
 {title:"This one's extra special, these wonderful buyers have been searching with me for three years to find the perfect place to call their own.",excerpt:"I'm so thrilled to say we finally found the one!",date:"Apr 14, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-14.jpg",body:`This one's extra special, these wonderful buyers have been searching with me for three years to find the perfect place to call their own. It's been a journey full of patience, persistence, and hope... and I'm so thrilled to say we finally found the one! ✨`},
 {title:"Hello, Seldovia! Welcome to Week 15 of 2025!",excerpt:"Whether you're looking to improve your skills, enjoy some bingo, or participate in a community egg hunt, there's plenty to do in Seldovia this week.",date:"Apr 14, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-14_2.jpg",body:`Hello, Seldovia! Welcome to Week 15 of 2025!

We're excited to kick off Week 15 with a variety of events, classes, and activities for all ages! Whether you're looking to improve your skills, enjoy some bingo, or participate in a community egg hunt, there's plenty to do in Seldovia this week. Be sure to check out all the upcoming happenings:

Upcoming Events

Monday, April 14, 2025
• Start of SVT Swimming Lessons for Pre-K Kids – 11:00 AM–12:00 PM every Monday, Wednesday, and Friday

Tuesday, April 15, 2025
• SVT - Reducing the Toxic Burden in Your Life – 12:30–1:30 PM at the Elder's Room, ATC Building

Wednesday, April 16, 2025
• SVT - Children's Library Elder Reading – 11:00 AM–12:00 PM (For ages 0–6 years) at the Corner Gathering Room, ATC Building
• SVT BINGO – 6:00–8:00 PM at the Seldovia Conference Center

Thursday, April 17, 2025
• JOY Club – 3:15–4:15 PM (For all children K–6th grade. Need a ride? Text or call Pastor Jonathan Hoard at 907-202-3947)
• SBE Tot Swim – 10:00–11:30 AM (For families with children ages 4 & under. Older siblings welcome if the pool remains a calm learning space)
• Dr. Marlowe Veterinary Services in town – Call Debbie Cameron at 907-435-3255 to schedule an appointment

Friday, April 18, 2025
• Deadline – 4th of July Coordinator Application
• SVT - Tie Dye Fun & More! – 1:00–3:00 PM (Corner Room, ATC Building)
• SBC - Good Friday Service – 3:00 PM
• Linwood Bar & Grill Free Bingo – 6:00 PM

Saturday, April 19, 2025
• SVT - Community Easter Egg Hunt – 11:30 AM at Susan B. English School (For children birth–6th grade)
• SBC - Family Lunch & Children's Easter Egg Hunt – 12:00 PM

Sunday, April 20, 2025
• SBC - Community 'Son-Rise' Service – 7:30 AM at Outside Beach followed by a breakfast potluck at the Bible Chapel
• Resurrection Sunday Morning Worship – 11:00 AM (featuring special songs from the Children's Choir)

Seldovia Village Tribe (SVT) Weekly Activities
• Open Swim – Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (Meet at ATC – All abilities welcome!)
• After School Time (Grades K–5) – Mondays, Wednesdays, Fridays, 3:15–5:00 PM at Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym – Fridays, 6:00–8:00 PM

Sea Otter Community Center (SOCC) Weekly Activities
• Yoga – Tuesday–Thursday, 10:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Open Club Day – Wednesdays, 3:15–5:00 PM
• Chess Club – Thursdays, 3:15–5:00 PM

Susan B. English School Weekly Activities
• Lap Swim – Monday, Wednesday, Friday, 8:00–10:00 AM
• Lap Swim – Tuesday & Friday, 5:00–6:00 PM
• 50+ Exercise – Monday, Wednesday, Friday, 10:00–11:00 AM

Seldovia Public Library – Spring Hours
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Seldovia Bible Chapel Weekly Activities
• Sunday School – Sundays, 9:45–10:45 AM
• Morning Worship – Sundays, 11:00 AM
• Chapel Teens Ground Zero (Grades 7–12) – Sundays, 3:00 PM
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM at the Fellowship Hall; Women's Bible Study – 7:00 PM at the Church

St. Nicholas Russian Orthodox Church
• Vespers Service – Saturdays, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more info)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help! 😄🏡`},
 {title:"Per an analysis by NerdWallet, the average price of homeowners insurance is $1,915 annually.",excerpt:"It's an essential part of protecting your house from the unexpected.",date:"Apr 13, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-13.jpg",body:`Per an analysis by NerdWallet, the average price of homeowners insurance is $1,915 annually, or $160 a month, for a $300,000 home. Though that may seem steep, it's an essential part of protecting your house from the unexpected.

Of course, numerous factors impact the overall price, including your state, claim history, credit history, and the age and location of the home, making it important that you work with a qualified agent to find the best coverage for you and your property. Reach out to get started! 📲`},
 {title:"Step back in time and take a stroll along Seldovia's historic boardwalk—a place where the past meets the present in the most picturesque way.",excerpt:"Whether you're here for the history, the scenery, or just a peaceful walk, the Seldovia Boardwalk is a must-visit!",date:"Apr 12, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-12.jpg",body:`Step back in time and take a stroll along Seldovia's historic boardwalk—a place where the past meets the present in the most picturesque way. Once a bustling hub of activity, this wooden boardwalk has stood the test of time, offering visitors a glimpse into Seldovia's rich history while showcasing its undeniable coastal charm.

✨ Why You'll Love the Seldovia Boardwalk:
✅ A Piece of History – Walk where generations before have traveled, connecting Seldovia's past to today. 📸🌲
✅ Scenic Waterfront Views – The perfect spot to take in breathtaking views of the harbor, boats, and wildlife. 🌊🦅
✅ Local Shop & Gardens – Browse a charming local business and sit in a garden as you experience the heart of the community.

Whether you're here for the history, the scenery, or just a peaceful walk, the Seldovia Boardwalk is a must-visit!`},
 {title:"Turn up the warmth without burning a hole in your pocket!",excerpt:"Winter heating bills can really give you chills, so here are some savvy tips to keep your home cozy and costs down.",date:"Apr 10, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-10.jpg",body:`Turn up the warmth without burning a hole in your pocket! 🔥❄️ Winter heating bills can really give you chills, so here are some savvy tips to keep your home cozy and costs down:

🔷 Seal drafts around doors and windows, and replace damaged trim.
🔷 Improve your insulation, especially in unfinished rooms.
🔷 Schedule maintenance checks on your heating appliances.
🔷 When possible, put on a sweater instead of cranking up the heat.

Let's make this winter cozy and budget friendly. Send me a message today to discuss your home-improvement needs! 🏡🔨`},
 {title:"Depending on how cold... I've got to warm up first!",excerpt:"A warm cup of tea might do it, a soft sherpa blanket - and if I seem to have lowered my core temp - I don't hesitate to take a hot shower!",date:"Apr 9, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-09.jpg",body:`Depending on how cold... I've got to warm up first! A warm cup of tea might do it, a soft sherpa blanket - and if I seem to have lowered my core temp - I don't hesitate to take a hot shower! That will fix it! LOL!

Curling up with a book, sending a few cards, catching up on the latest news, checking in with friends on socials, working on Chamber Biz, tidying my studio or calling my mom - and of course, chatting with my family are "go tos" for me! What about you? 😊✨`},
 {title:"Hello, Seldovia! Welcome to Week 14 of 2025!",excerpt:"It's a new week in Seldovia, and we've got exciting events, classes, and activities lined up for everyone!",date:"Apr 7, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-04-07.jpg",body:`Hello, Seldovia! Welcome to Week 14 of 2025!

It's a new week in Seldovia, and we've got exciting events, classes, and activities lined up for everyone! Check out what's happening this week:

Upcoming Events

Tuesday, April 8, 2025
• SBE Principal/Teacher Interviews – 4:00–7:00 PM. If you have any questions, please don't hesitate to contact Mr. Druce.

Thursday, April 10, 2025
• JOY Club – 3:15–4:15 PM. For all children ages K-6th grade. For more information or if you need a ride, please text or call Pastor Jonathan Hoard at 907-202-3947.
• SVT – Knitting Class with Honeybee Nordenson – 6:00–8:00 PM. Sign up @ svt.org/events/knitting-class.

Friday, April 11, 2025
• SVT – EggCellent Early Release Time – 1:40–3:30 PM @ Seldovia Conference Center. For more information, contact Laurie Glenn at 907-234-7898.
• Linwood Bar & Grill Free Bingo – 6:00 PM. Join us for 10 rounds of bingo with fun local prizes donated by the Linwood and other businesses in town. Thanks, Haley, for running the games while Jackie is away—so much fun ahead!

Seldovia Village Tribe (SVT) Weekly Activities
• Open Swim – Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (Meet at Alaska Tribal Cache Building – All abilities welcome!)
• After School Time (Grades K-5) – Mondays, Wednesdays, Fridays, 3:15–5:00 PM @ Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym – Fridays, 6:00–8:00 PM

Sea Otter Community Center (SOCC) Weekly Activities
• Yoga – Tuesday–Thursday, 10:00 AM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• Open Club Day – Wednesdays, 3:15–5:00 PM (No Open Club this Wednesday, April 9)
• Chess Club – Thursdays, 3:15–5:00 PM

Seldovia Public Library Spring Schedule
• Monday: 2:00–4:00 PM
• Tuesday: 2:00–7:00 PM
• Wednesday: 2:00–4:00 PM
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM

Seldovia Bible Chapel Weekly Activities
• Morning Worship – Sundays, 11:00 AM
• Sunday School – Sundays, 9:45–10:45 AM
• Chapel Teens Ground Zero (Grades 7-12) – Sundays, 3:00 PM (Fun, refreshments, and Bible study for teens.)
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM | Church Fellowship Hall; Women's Bible Study – 7:00 PM | Church

St. Nicholas Russian Orthodox Church
• Vespers Service – Every Saturday, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more info.)
• Sunday Service – 10:00 AM

Grace Haven Community Church
• Sunday Worship – 10:00 AM

Stay connected, and check out the latest updates on the calendar at Seldovia.com. If you're looking for real estate or need assistance, I'm just a call away!`},
 {title:"Majestic mountains standing tall against the sky. Breathtaking views in Kenai!",excerpt:"Majestic mountains standing tall against the sky. Breathtaking views in Kenai!",date:"Apr 6, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-06.jpg",body:`Majestic mountains standing tall against the sky. Breathtaking views in Kenai! 🏔️✨`},
 {title:"If you're looking for a scenic and peaceful hike in Seldovia, the Otterbahn Trail is a must!",excerpt:"It's the perfect spot to stretch your legs, take in the fresh air, and experience the beauty of Seldovia.",date:"Apr 5, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-05.jpg",body:`If you're looking for a scenic and peaceful hike in Seldovia, the Otterbahn Trail is a must! This beautiful trail winds through lush forests, over wooden bridges, and leads to breathtaking coastal views. Whether you're a nature lover, photographer, or just in need of a refreshing walk, this trail has something for everyone.

✨ What Makes Otterbahn Trail Special?
✅ A Walk Through Nature – Enjoy towering trees, wildflowers, and the chance to spot local wildlife. 🌲
✅ A Perfect Escape – A quiet, relaxing trail that feels like a hidden paradise.
✅ Beach Access – The trail leads straight to Outside Beach, where you can soak in stunning ocean views. 🌊☁️

It's the perfect spot to stretch your legs, take in the fresh air, and experience the beauty of Seldovia.`},
 {title:"Look what we caught ice fishing on the Lake Louise – a beautiful LITTLE whitefish!",excerpt:"This bait fish, along with 30 of his friends are coming home with us to Seldovia.",date:"Apr 4, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-04.jpg",body:`Look what we caught ice fishing on the Lake Louise – a beautiful LITTLE whitefish! This bait fish, along with 30 of his friends are coming home with us to Seldovia, where it'll play a role in our summer fishing adventures.

And we've heard from a local that they are pretty good eating! So we will see! Fun to catch though! 😊`},
 {title:"There's nothing quite like spending time at Outside Beach—one of Seldovia's most beautiful and peaceful spots.",excerpt:"If you've ever spent time at Outside Beach, you know it's more than just a beach—it's an experience!",date:"Apr 3, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-04-03.jpg",body:`There's nothing quite like spending time at Outside Beach—one of Seldovia's most beautiful and peaceful spots. Whether you're strolling along the shore searching for sea glass and unique driftwood or gathering around a cozy bonfire as the sun sets, this beach is the perfect place to embrace the magic of coastal life.

✨ Why Outside Beach is a Must-Visit:
✅ Taking your favorite dog for a run - a real run - wind in their fur kind of run! So good!
✅ Beachcombing Treasures – Find shells, sea glass, and natural wonders washed up by the tides. 🌊
✅ Breathtaking Views – Take in the stunning scenery of the ocean and surrounding mountains. 🏔️
✅ Unforgettable Evenings – There's nothing better than a warm bonfire with friends, the sound of waves, and the Alaskan sky above. 🔥🌌

If you've ever spent time at Outside Beach, you know it's more than just a beach—it's an experience!`},
 {title:"Thinking about selling your home? The first step might surprise you!",excerpt:"It's not staging or listing—it's getting an accurate valuation.",date:"Apr 2, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-02.jpg",body:`Thinking about selling your home? 🌲 The first step might surprise you! It's not staging or listing —it's getting an accurate valuation.

Whether you opt for a professional appraisal or a comparative market analysis (CMA), knowing your home's true worth is crucial for setting the right price. This ensures that your property is competitive in today's market while maximizing your return. 💰🔑

Don't leave money on the table—start the selling process on the right note from the very beginning. Reach out today!`},
 {title:"Why I Love Being Seldovia's Real Estate Agent?",excerpt:"It's more than just a job—it's about bringing people together.",date:"Apr 1, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-04-01.jpg",body:`Why I Love Being Seldovia's Real Estate Agent?

If you were to ask me how I like being Seldovia's real estate agent, I'd say "I love it."

But if you were to ask me on a deeper level..

I'd tell you it's more than just a job—it's about bringing people together. It's about helping people find not just a house, but a place they can truly call home. It's about welcoming new faces into our incredible community and guiding those who have cherished Seldovia for years through their next big chapter.

Every property tells a story, and I feel honored to be a part of those stories. Whether it's finding the perfect waterfront getaway, helping a family settle into their dream home, or assisting a seller as they move on to new adventures, every transaction is personal to me.

Seldovia isn't just a location on a map—it's a way of life, and I'm grateful every day to be able to share that with others. 💙🌲`},
 {title:"Hello, Seldovia! Welcome to Week 13 of 2025!",excerpt:"The Tustumena is back in Seldovia this week, and there's plenty more to look forward to.",date:"Mar 31, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-31.jpg",body:`Hello, Seldovia! Welcome to Week 13 of 2025!

The Tustumena is back in Seldovia this week, and there's plenty more to look forward to—from local meetings and fun gatherings to outdoor adventures. Mark your calendars and don't miss out!

Upcoming Events

Monday, March 31, 2025
• Seldovia Chamber of Commerce – Deadline for the 4th of July Coordinator Application

Wednesday, April 2, 2025
• Joint Worksession – Safe Streets 4 All. Seldovia City Council & Planning Commission – 5:00 PM @ Council Chambers
• Seldovia Planning Commission Regular Meeting – 6:00 PM @ Council Chambers
• SOCC - Mental Health First Aid Classes for Teens (April 2, 3 & 4) 12-3pm at the Sea Otter Community Center

Thursday, April 3, 2025
• Tustumena is back in Seldovia!
• SVT - Knitting Class with Honeybee Nordenson – 6:00–8:00 PM @ Corner Room, ATC (For ages 12 and up. Sign up at svt.org/events/knitting-class)

Friday, April 4, 2025
• Linwood Bar & Grill Free Bingo – 6:00 PM. Join us for 10 rounds of bingo with fun local prizes donated by the Linwood and other businesses in town. Thanks, Haley, for running the games while Jackie is away—so much fun ahead!

Stay connected and check out the daily calendar at Seldovia.com for the latest updates!

Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help! 😄🏡`},
 {title:"3 things I won't do as your real estate agent.",excerpt:"Pressure a client, hide important details, or overpromise and underdeliver.",date:"Mar 30, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-03-30.jpg",body:`1. Pressure a Client Into a Decision – Buying or selling a home is a big deal, and my job is to guide and educate, not push.

2. Hide Important Property Details – Transparency is key! I believe in honesty, even if it means a tougher conversation.

3. Overpromise & Underdeliver – I set realistic expectations and work hard to exceed them, not just say what people want to hear.`},
 {title:"Cottage charm, modern lines, or right on the water — which is at the top of your list?",excerpt:"It can be hard to choose since every style comes with its own perks!",date:"Mar 29, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-03-29.jpg",body:`It can be hard to choose since every style comes with its own perks! But if you had to pick, are you all about the cozy charm of a cottage, the sleek lines of modern design, or do you really need to just be on the water?

Whatever your preference, share what's at the top of your list! And if you're ready to house hunt, reach out—together, we can find a place that feels like home to you. 😊✨`},
 {title:"As a home seller, understanding counteroffers is key to maximizing your return.",excerpt:"A counteroffer opens the door for negotiation and can pave the way for a successful sale.",date:"Mar 28, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-03-28.jpg",body:`As a home seller, understanding counteroffers is key to maximizing your return. If the first offer doesn't meet expectations, a counteroffer opens the door for negotiation. This clearly documented process can create opportunities for better terms and pave the way for a successful sale. 🌲🧳📚

Navigating the nuances of negotiation can make all the difference in achieving your selling goals. Whether it's adjusting the price, timelines, or inclusions, every detail counts.

Ready to refine your selling strategies and make the most of your offers? Let's connect!`},
 {title:"Should you sell “as is”?",excerpt:"If your home needs major repairs and you're not up for the work—or you need to sell fast—selling “as is” might be the move.",date:"Mar 27, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-03-27.jpg",body:`Should you sell "as is"?

If your home needs major repairs and you're not up for the work—or you need to sell fast—selling "as is" might be the move. But if it's currently in decent shape, putting in a little extra work could get you a higher price!

Unsure about which approach is right for you? Reach out for some expert guidance! 🌲☁️`},
 {title:"Here's why Jakolof Bay deserves a place on your Seldovia bucket list!",excerpt:"Stunning natural beauty, outdoor adventures, and a fisherman's paradise.",date:"Mar 26, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-03-26.jpg",body:`Here's why Jakolof Bay deserves a place on your Seldovia bucket list! 🌿✨

1. Stunning Natural Beauty
Jakolof Bay is surrounded by towering forests, rugged mountains, and the sparkling waters of Kachemak Bay. The peaceful atmosphere and incredible scenery make it the perfect place to relax, unwind, and reconnect with nature.

2. Outdoor Adventures Await
For outdoor enthusiasts, Jakolof Bay is a dream come true! Kayak along the shoreline, go hiking on nearby trails, or drop a fishing line into the bay. You might even spot sea otters, seals, or eagles soaring overhead.

3. A Fisherman's Paradise
If you love fishing, Jakolof Bay is the place to be. The area is rich with halibut, salmon, and rockfish, making it an excellent spot to reel in a fresh catch. Whether you're an experienced angler or a beginner, the waters here won't disappoint.`},
 {title:"A house is just a structure, but a home is where you feel comfortable, happy, and truly yourself.",excerpt:"If you're looking for a place that gives you that feeling, let's talk!",date:"Mar 25, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-03-25.jpg",body:`A house is just a structure, but a home is where you feel comfortable, happy, and truly yourself. If you're looking for a place that gives you that feeling, let's talk! 😊`},
 {title:"Many people think working in real estate is just about selling houses, but there's so much more to it than that.",excerpt:"What's something about real estate you've always been curious about?",date:"Mar 24, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-03-24.jpg",body:`Many people think working in real estate is just about selling houses, but there's so much more to it than that. 👇

1. You Work Around the Clock – There's no 9-to-5 schedule! Real estate can be a 24/7 job, with calls, showings, and negotiations happening early mornings, evenings, and weekends.

2. Every Transaction is Unique – No two sales are the same! Each property, client, and negotiation presents its own challenges and learning opportunities.

3. You Wear Many Hats – A real estate agent is also a marketer, negotiator, advisor, problem solver, and sometimes even a therapist!

4. You Have to Know More Than Just Houses – A good agent understands zoning laws, market trends, local amenities, home repairs, staging, and even lending options.

5. It's Incredibly Rewarding – Helping people find their dream home or make a successful sale is one of the best feelings, making all the hard work and long hours worth it!

What's something about real estate you've always been curious about? Drop your questions below!`},
 {title:"Hello, Seldovia! Welcome to Week 12 of 2025!",excerpt:"Spring is in the air, and we've got a week full of exciting community events, meetings, and activities for all ages.",date:"Mar 24, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-24_2.jpg",body:`Hello, Seldovia! Welcome to Week 12 of 2025!

Spring is in the air, and we've got a week full of exciting community events, meetings, and activities for all ages. Mark your calendars and join in!

Upcoming Events
Monday, March 24, 2025
• Seldovia City Council Regular Meeting – 6:00 PM @ Council Chambers
• SOCC - Arts & Crafts Club – 3:15–5:00 PM (Sign-up required at seldoviasocc@gmail.com. Limit 10 students.)

Tuesday, March 25, 2025
• Seldovia Volunteer Fire & EMS Board Meeting – 6:00 PM @ Multi-Purpose Building
• SOCC Games (All Ages) – 1:00–3:00 PM (Sign-up via email: seldoviasocc@gmail.com)

Wednesday, March 26, 2025
• SBE Track Meeting with Coach Jen Swick – 3:15 PM @ SBE Common Areas (This was originally scheduled for the 24th but was moved to the 26th.)
• Seldovia City Council Budget Worksession – 6:00 PM @ Council Chambers

Thursday, March 27, 2025
• Seldovia Public Library Book Club – Orbital by Samantha Harvey, 6:30–8:00 PM. (This is a quick read and a beautiful love letter to Planet Earth.)

Friday, March 28, 2025
• Linwood Bar & Grill Free Bingo – 6:00 PM. Join us for 10 rounds of bingo with fun local prizes donated by the Linwood and other businesses in town. Thanks, Haley, for running the games while Jackie is away—so much fun ahead!

Seldovia Village Tribe (SVT) Weekly Activities
• Open Swim – Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
• Outdoor Walking – Thursdays, 2:00 PM (Meet at Alaska Tribal Cache Building) – All abilities welcome!
• After School Time (Grades K-5) – Mondays, Wednesdays, Fridays, 3:15–5:00 PM @ Corner Room, ATC
• Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym – Fridays, 6:00–8:00 PM

Sea Otter Community Center (SOCC) Weekly Activities
• Arts & Crafts – Mondays & Wednesdays, 10:00 AM–12:00 PM (Sign-up required at seldoviasocc@gmail.com. Limit 10 students.)
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• SOCC Games (All Ages) – Tuesdays, 1:00–3:00 PM
• Take a Hike with Ms. Lisa – Thursdays, 1:00–3:00 PM
• Chess Club – Thursdays, 3:15–5:00 PM

Seldovia Bible Chapel Weekly Activities
• Morning Worship – Sundays, 11:00 AM
• Sunday School – Sundays, 9:45–10:45 AM
• Chapel Teens Ground Zero (Grades 7-12) – Sundays, 3:00 PM (Fun, refreshments, and Bible study for teens.)
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM | Church Fellowship Hall; Women's Bible Study – 7:00 PM | Church

St. Nicholas Russian Orthodox Church
• Vespers Service – Every Saturday, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more info.)
• Sunday Service – 10:00 AM

Seldovia Public Library Spring Schedule
• Thursday: 2:00–4:00 PM
• Saturday: 2:00–5:00 PM
• Tuesday: 2:00–7:00 PM

Stay connected and check out the daily calendar at Seldovia.com for the latest updates! Thinking about real estate in Seldovia? Visit www.SeldoviaProperty.com—if something catches your eye, I'm always here to help! 😄🏡`},
 {title:"Welcoming the season of renewal with open arms! Happy Spring!",excerpt:"Welcoming the season of renewal with open arms! Happy Spring!",date:"Mar 20, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-03-20.jpg",body:`Welcoming the season of renewal with open arms! Happy Spring! 🌷🌞`},
 {title:"If you could recommend just ONE must-visit spot, what would it be?",excerpt:"Drop your top pick in the comments!",date:"Mar 19, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-03-19.jpg",body:`If you could recommend just ONE must-visit spot, what would it be? Drop your top pick in the comments! 🗺️✨`},
 {title:"Hello, Seldovia! Welcome to Week 11 of 2025!",excerpt:"Spring is just around the corner, and there's plenty happening in town!",date:"Mar 17, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-17.jpg",body:`Hello, Seldovia! Welcome to Week 11 of 2025!

Spring is just around the corner, and there's plenty happening in town! From book clubs to open gym nights, there's something for everyone. Check out this week's events and activities!

Seldovia Public Library Spring hours - Open Thursday 2-4 PM, Saturday 2-5 PM, and Tuesday 2-7 PM.

Upcoming Events

Monday, March 17, 2025
Happy St. Patrick's Day! 🍀

Tuesday, March 18, 2025
• Susan B. English School PAC Meeting – Our pool is at risk of closing due to budget cuts. We're sending a letter to the school board in opposition—your voice matters! Join us to help keep our pool open. We'll also discuss the middle school track season. Interested in coaching? Contact Mr. Druce ASAP!

Wednesday, March 19, 2025
• SOCC Open Club Day is CANCELLED.
• SVT BINGO, 6-8pm at the Alaska Tribal Cache Building.

Thursday, March 20, 2025
• Seldovia Public Library Book Club – 6:30-8:00 PM. Meet downstairs in the Archive Reading Room. Please access the library via the back door on Lipke Lane (opposite Hopkins' house).
• KPC "Know Your Land 2025" – 6:00-7:00 PM. All sessions held in person at the KPC Kachemak Bay campus and on Zoom. Hosted in Seldovia with Caley Gasch LIVE. To attend virtually, register for the Zoom here: bit.ly/KnowYourLand2025
• SVT Children's Library Elder's Reading – 11:00 AM-12:00 PM in the Corner Gathering Room at the Alaska Cache Building

Friday, March 21, 2025
• Linwood Bar & Grill Free Bingo – 6:00 PM. Join us for 10 rounds of exciting bingo featuring fun local prizes donated by the Linwood and other businesses in town. Thanks, Haley, for running the games while Jackie is away! So. Much. Fun!

Seldovia Village Tribe (SVT) Weekly Activities
• Open Swim – Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
• Outdoor Walking – Thursdays at 2:00 PM (Meet at Alaska Tribal Cache Building) – All abilities welcome!
• After School Time (Grades K-5) – Fridays, 3:15–5:00 PM at the Corner Room @ ATC
• Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym – Fridays, 6:00–8:00 PM

Weekly Activities at Sea Otter Community Center (SOCC)
• Arts & Crafts Club – Mondays, 3:15–5:00 PM | March 10 & 12, 10:00 AM–12:00 PM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• SOCC Games (All Ages) – 1:00–3:00 PM
• 1st–3rd Grade Girls Cheer Club – Wednesdays & Thursdays, 3:15–4:15 PM
• Take a Hike with Ms. Lisa – Thursdays, 1:00–3:00 PM
• Chess Club – Thursdays, any time between 3:15–5:00 PM

Seldovia Bible Chapel Weekly Activities
• Morning Worship – Sundays, 11:00 AM
• Sunday School – Sundays, 9:45–10:45 AM
• Chapel Teens Ground Zero (Grades 7-12) – Sundays, 3:00 PM (Fun, refreshments, and Bible study for teens)
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM | Church Fellowship Hall; Women's Bible Study – 7:00 PM | Church

St. Nicholas Russian Orthodox Church
Have you heard the bells? Thanks Ginny for ringing them before and after each service! It is so nice to hear them ringing in town!
• Vespers Service – Every Saturday, 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more information)
• Sunday Service – 10:00 AM

Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"Happy St. Patrick's Day!",excerpt:"In honor of the big day, this is your friendly reminder to wear green... and don't get pinched!",date:"Mar 17, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-17_2.jpg",body:`Happy St. Patrick's Day! ☘️

In honor of the big day, this is your friendly reminder to wear green... and don't get pinched! 😆`},
 {title:"Looks like winter decided to stick around a little longer!",excerpt:"Looks like winter decided to stick around a little longer!",date:"Mar 14, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-03-14.jpg",body:`Looks like winter decided to stick around a little longer! ❄️`},
 {title:"Poppin' into a day filled with fluffy kernels and buttery goodness!",excerpt:"Happy Popcorn Lovers Day to all the snack enthusiasts out there.",date:"Mar 13, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-13.jpg",body:`Poppin' into a day filled with fluffy kernels and buttery goodness! 🍿❤️

Happy Popcorn Lovers Day to all the snack enthusiasts out there. Grab your favorite movie, a bucket of popcorn, and let's celebrate the art of snacking in style! 🎬✨`},
 {title:"My view of the moon this morning!",excerpt:"My view of the moon this morning!",date:"Mar 11, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-03-11.jpg",body:`My view of the moon this morning! 🌙✨

#seldovia #seldoviaalaska #seldoviaak #seldoviaproperty #alaska #alaskalife #alaskaliving #moonset`},
 {title:"Week 10 of 2025 — weekly activities across Seldovia.",excerpt:"SVT, Sea Otter Community Center, Bible Chapel, St. Nicholas Church, and library schedules.",date:"Mar 10, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-10_2.jpg",body:`Seldovia Village Tribe (SVT) Weekly Activities:
• Open Swim – Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
• Outdoor Walking – Thursdays at 2:00 PM (Meet at Alaska Tribal Cache Building) – All abilities welcome!
• After School Time (Grades K-5) – Fridays, 3:15–5:00 PM at the Corner Room @ ATC
• Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM (Monday, Wednesday, Friday)
• Open Gym – Fridays, 6:00–8:00 PM

Weekly Activities at Sea Otter Community Center (SOCC):
• Arts & Crafts Club – Mondays, 3:15–5:00 PM | March 10 & 12, 10:00 AM–12:00 PM
• Workout with Lisa – Weekdays, 9:00–9:45 AM
• 1st–3rd Grade Girls Cheer Club – Wednesdays & Thursdays, 3:15–4:15 PM
• Take a Hike with Ms. Lisa – Thursdays, 1:00–3:00 PM
• Chess Club – Thursdays, any time between 3:15–5:00 PM

Seldovia Bible Chapel Weekly Activities:
• Morning Worship – Sundays, 11:00 AM
• Sunday School – Sundays, 9:45–10:45 AM
• Chapel Teens Ground Zero (Grades 7-12) – Sundays, 3:00 PM (Fun, refreshments, and Bible study for teens)
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM | Church Fellowship Hall; Women's Bible Study – 7:00 PM | Church

St. Nicholas Russian Orthodox Church:
• Vespers Service every Saturday – 5:00–6:00 PM (Contact Ginny Glenn at 970-404-1249 for more information)
• Sunday Service - 10am

Seldovia Public Library Schedule:
Check out the photo for details!

Enjoy the week, Seldovia! 😊`},
 {title:"Hello, Seldovia! Welcome to Week 10 of 2025!",excerpt:"Spring Break is here! Wishing all the Susan B. English students a fun and relaxing week.",date:"Mar 10, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-10.jpg",body:`Hello, Seldovia! Welcome to Week 10 of 2025!

Spring Break is here! Wishing all the Susan B. English students a fun and relaxing week. Check out what's happening around town and make the most of it!

Upcoming Events

Monday, March 10, 2025
• SVT Spring Break Outdoor Fun – 1:00–3:00 PM at Susan B. English School
• Seldovia City Council Regular Meeting – 6:00 PM at Council Chambers

Tuesday, March 11, 2025
• Seldovia City Council Work session (Council Training) – 3:00 PM at Council Chambers

Wednesday, March 12, 2025
• SOCC Teen Night, 7-10pm. Snacks, Music & Games!

Friday, March 14, 2025
• SVT Spring Break Movie Time – 1:00–3:00 PM at Seldovia Conference Center
• 6:00pm - Join us for 10 rounds of exciting bingo featuring fun local prizes donated by the Linwood and other businesses in town. Thanks Haley for running the games while Jackie is away! So. Much. Fun!

Saturday, March 15, 2025
• SBE Basketball Scrimmage – Doors open at 3:45 PM, game starts at 4:00 PM

Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"According to the National Association of Realtors, the top reason people move is to be closer to family and friends.",excerpt:"If you're considering changing up your living situation, reach out today!",date:"Mar 10, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-03-10_3.jpg",body:`According to the National Association of Realtors, the top reason people move is to be closer to family and friends. 👨‍👩‍👧‍👦

Other key factors include wanting more space, wanting to scale down, and seeking a more desirable neighborhood.

If you're considering changing up your living situation, reach out today, and let's work together to find the right home for you! 🥰💗`},
 {title:"Don't forget to set your clocks one hour ahead tonight for Daylight Savings Time.",excerpt:"More sunlight and longer evenings await, so let's make the most of the extra daylight.",date:"Mar 9, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-09.jpg",body:`⏰ Don't forget to set your clocks one hour ahead tonight for Daylight Savings Time. More sunlight and longer evenings await, so let's make the most of the extra daylight.

🕰️ Don't be late for your Sunday morning activities! 😊`},
 {title:"We celebrate the incredible women who not only build homes but also dreams.",excerpt:"Happy International Women's Day to the strong, inspiring women who make the world a better place.",date:"Mar 8, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-08.jpg",body:`We celebrate the incredible women who not only build homes but also dreams. 🌲🌞 Happy International Women's Day to the strong, inspiring women who make the world a better place. 💪❤️`},
 {title:"On National Dentist Day, we're all smiles as we recognize the dental professionals who keep our grins healthy and our spirits high!",excerpt:"Share your dental care tips or a shout-out to your dentist who keeps your smile shining bright.",date:"Mar 6, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-06.jpg",body:`On National Dentist Day, we're all smiles as we recognize the dental professionals who keep our grins healthy and our spirits high! 🦷 Share your dental care tips or a shout-out to your dentist who keeps your smile shining bright. 😁`},
 {title:"Hello, Seldovia! Welcome to Week 9 of 2025!",excerpt:"March is here, and there are plenty of great events and activities happening around town!",date:"Mar 3, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-03.jpg",body:`Hello, Seldovia! Welcome to Week 9 of 2025!

March is here, and there are plenty of great events and activities happening around town! Stay connected and enjoy what our community has to offer.

Upcoming Events

Monday, March 3, 2025
• SVT Fire Prevention Presentation – Join HERE: https://svt.zoom.us/j/89200631373

Tuesday, March 4, 2025
• SVT Gentle Exercise with Jenifer Dickson. Seldovia Conference Center | 11:30 AM – 12:30 PM
• SVT - Thrive "Crunchy Cruciferous". Kitchen at ATC in Seldovia | 12:30 – 1:30 PM

Wednesday, March 5, 2025
• Seldovia Planning Commission Regular Meeting. Council Chambers | 6:00 PM
• SVT Bingo. Seldovia Conference Center | 6:00 – 8:00 PM

• Linwood Bar & Grill - Free Bingo, Fridays at 6:00 PM. Join us for 10 rounds of exciting bingo featuring fun local prizes donated by the Linwood and other businesses in town. A big thank you to Jackie for organizing this community favorite!

Seldovia Village Tribe (SVT) Weekly Activities
• Open Swim – Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
• Outdoor Walking – Thursdays at 2:00 PM (Meet at Alaska Tribal Cache Building) – All abilities welcome!
• After School Time (Grades K-5) – Fridays, 3:15–5:00 PM, at the Corner Room @ ATC
• Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM (Monday, Wednesday, Friday)

Seldovia Bible Chapel Weekly Activities
• Morning Worship – Sundays, 11:00 AM
• Sunday School – Sundays, 9:45–10:45 AM
• Chapel Teens Ground Zero (Grades 7-12) – Sundays, 3:00 PM (Fun, refreshments, and Bible study for teens)
• Tuesday Evening Bible Studies: Men's Bible Study – 7:00 PM | Church Fellowship Hall; Women's Bible Study – 7:00 PM | Church

Susan B. English School Weekly Activities
Pool Schedule – Check out the photo for details!

Seldovia Public Library Winter Schedule
Check out the photo for details!

Stay warm, stay active, and enjoy another wonderful week in Seldovia! 😊

Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"Here are some key factors to consider when deciding if Seldovia living is the perfect fit.",excerpt:"Do you love the outdoors, a tight-knit community, a slower pace, limited accessibility, and self-sufficiency?",date:"Mar 2, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-03-02.jpg",body:`Here are some key factors to consider when deciding if Seldovia living is the perfect fit.

1. Do You Love the Outdoors? 🌿
Seldovia is a paradise for outdoor enthusiasts. Whether you enjoy fishing, kayaking, hiking, or simply taking in breathtaking ocean views, the town offers endless opportunities for adventure. If you thrive in nature and appreciate a more rugged lifestyle, Seldovia could be a great match.

2. Are You Looking for a Tight-Knit Community? 👩‍👩‍👧‍👦
With a small population, Seldovia has a close and welcoming community. Neighbors support each other, and local events bring residents together. If you value meaningful connections and enjoy being part of a community that looks out for one another, you'll feel right at home.

3. Can You Adapt to a Slower Pace? 🚶‍♀️
Life in Seldovia moves at a different rhythm. There are no big-box stores or fast-food chains—just local businesses, stunning landscapes, and peaceful surroundings. If you prefer the hustle and bustle of city life, Seldovia might feel too remote, but if you seek tranquility, it could be exactly what you need.

4. Are You Comfortable with Limited Accessibility? ✈️🛥
Seldovia is only accessible by boat or plane, which means travel requires extra planning. If you're someone who enjoys convenience and frequent travel, this could be a challenge. However, if you embrace the idea of a more remote lifestyle and enjoy the journey as much as the destination, Seldovia has its own rewards.

5. Do You Appreciate Self-Sufficiency? 🪵
Living in Seldovia often means relying on yourself and the community. Whether it's gathering firewood, fishing for your own food, or making do with limited shopping options, self-sufficiency is a valued skill. If you enjoy a hands-on lifestyle and problem-solving, Seldovia living could be a fulfilling experience.`},
 {title:"Please share your favorite recipe or creation!",excerpt:"Our annual Salmonberry Delights Contest will be held here in Seldovia on August 6th!",date:"Mar 1, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-03-01.jpg",body:`Please Share your favorite recipe or creation! 👇

Remember - our annual Salmonberry Delights Contest will be held here in Seldovia on August 6th - stay tuned for more information! 😊✨`},
 {title:"Thank You Paul & Lori!",excerpt:"I am incredibly lucky to work with such amazing clients, and today, I want to give a special shoutout to Paul & Lori!",date:"Feb 28, 2025",read:"1 min",cat:"Kind Words",img:"images/gazette/2025-02-28.jpg",body:`Thank You Paul & Lori! 🙏

I am incredibly lucky to work with such amazing clients, and today, I want to give a special shoutout to Paul & Lori! Receiving your thoughtful gift was such a wonderful surprise! 💗`},
 {title:"From construction to transportation to real estate, Seldovia has a dedicated team of professionals ready to help you with all your needs.",excerpt:"The experts in Seldovia are here to support you every step of the way.",date:"Feb 27, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-27.jpg",body:`From construction to transportation to real estate, Seldovia has a dedicated team of professionals ready to help you with all your needs.

Whether you're building your dream home, navigating the town's unique landscape, or searching for your perfect property, the experts in Seldovia are here to support you every step of the way. 🔨✈️🏡

Check out the full list and connect with the best services Seldovia has to offer.
https://www.seldovia.com/to-do/professional-services/`},
 {title:"When it comes to convenience, quality, and exceptional service, Seldovia Fuel & Lube ranks top of the list in Seldovia.",excerpt:"This trusted establishment has everything you need under one roof.",date:"Feb 25, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-25.jpg",body:`When it comes to convenience, quality, and exceptional service, Seldovia Fuel & Lube ranks top of the list in Seldovia. Whether you're a local resident, a visiting boater, or an adventurer exploring the beauty of Seldovia, this trusted establishment has everything you need under one roof. 😄

Why Choose Seldovia Fuel & Lube? 👇

✨ Locally owned and operated – A business that understands and values the needs of Seldovia's residents.
✨ Variety and convenience – A one-stop destination for supplies, fuel, and more.
✨ Exceptional service – A friendly team that treats customers like family.

Next time you need supplies, fuel, or just a friendly smile, stop by Seldovia Fuel & Lube! Whether you're prepping for a fishing trip, stocking up on essentials, or fueling up for your next adventure, they've got you covered. 🙌`},
 {title:"Hello, Seldovia! Welcome to Week 8 of 2025!",excerpt:"Important city meetings and exciting community activities to keep you connected — plus FREE skating at the Waterfront Ice Rink!",date:"Feb 24, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-24.jpg",body:`Hello, Seldovia! Welcome to Week 8 of 2025!

Let's kick off the week with important city meetings and exciting community activities to keep you connected. Plus, don't forget—the Waterfront Ice Rink is open every day for FREE skating! ⛸️❄️

Upcoming Events

Monday, February 24, 2025

IditaRead begins today!
If you haven't already decorated your sled, the library is open until 5:00 pm today.

Seldovia City Council Worksession
Council Chambers | 4:30 PM | In Person at Council Chambers, 260 Seldovia Street, or by Zoom Webinar. Webinar ID: 845 7628 0095, Passcode: 864684

Seldovia City Council Regular Meeting
Council Chambers | 6:00 PM | In Person at Council Chambers, 260 Seldovia Street, or by Zoom Webinar. Webinar ID: 845 7628 0095, Passcode: 864684

Tuesday, February 25, 2025
NSF Annual Community Participation Workshop
Seldovia Conference Center | 7:00–8:30 PM

Linwood Bar & Grill - FREE BINGO
Fridays at 6:00 PM
Join us for 10 rounds of exciting bingo featuring fun local prizes donated by the Linwood and other businesses in town. A big thank you to Jackie for organizing this community favorite!

Seldovia Village Tribe (SVT) Weekly Activities
Elementary Homeschool Art Class (with Ecola Collier) – Mondays, 1:30–2:30 PM
Open Swim – Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
Walking Club – Thursdays – All abilities welcome!
After School Time (Grades K-5) – Fridays, 3:15 PM
Open Gym – Fridays, 6:00 PM – Fun for the whole family!
Fitness Center – Weekdays, 8:00–10:00 AM & 1:00–2:00 PM

Sea Otter Community Center (SOCC) Weekly Activities
Workout with Lisa – Weekdays, 9:00–9:45 AM
Yoga – Tuesdays & Thursdays, 10:00–11:00 AM
1st-3rd Grade Girls Cheer Club – Wednesdays & Thursdays, 3:15–4:15 PM

Seldovia Bible Chapel Weekly Activities
Morning Worship – Sundays, 11:00 AM
Sunday School – Sundays, 9:45–10:45 AM
Chapel Teens Ground Zero (Grades 7-12) – Sundays, 3:00 PM
Tuesday Evening Bible Studies
Men's Bible Study – 7:00 PM | Location: Church Fellowship Hall
Women's Bible Study – 7:00 PM | Location: Church

Susan B. English School Weekly Activities
Pool Schedule – Check out the photo for details!

Seldovia Public Library Winter Schedule
Check out the photo for details!

Stay connected, mark your calendars, and make the most of these exciting opportunities. Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"I'll go first—magical! What's yours?",excerpt:"I'll go first—magical! What's yours?",date:"Feb 23, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-23.jpg",body:`I'll go first—magical! ❄️✨ What's yours?`},
 {title:"Showering Extra Love on Fur-babies!",excerpt:"Happy Love Your Pet Day! Whether they have floppy ears or a wagging tail, today is all about spoiling our furry companions!",date:"Feb 20, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-20.jpg",body:`Showering Extra Love on Fur-babies! 🐱🐕

Happy Love Your Pet Day! Whether they have floppy ears or a wagging tail, today is all about spoiling our furry companions!

Share an emoji of your beloved pet below and let's spread the love! 🥰`},
 {title:"Brie, thank you so much!",excerpt:"It's been so much fun watching you and Josh bring your homestead to life, from chickens to bunnies, pigs, and more!",date:"Feb 18, 2025",read:"1 min",cat:"Kind Words",img:"images/gazette/2025-02-18.jpg",body:`Brie, thank you so much! It's been so much fun watching you and Josh bring your homestead to life, from chickens to bunnies, pigs, and more! It's been a pleasure working with you, and I'm so grateful for the opportunity to be a part of your journey. 😊`},
 {title:"Presidential quotes to reflect on this Presidents Day.",excerpt:"Wise words. What is your favorite presidential quote?",date:"Feb 17, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-17_2.jpg",body:`"Change is the law of life. And those who look only to the past or present are certain to miss the future." — John F Kennedy

"The dogmas of the quiet past are inadequate to the stormy present. The occasion is piled high with difficulty, and we must rise with the occasion. As our case is new, so we must think anew and act anew." — Abraham Lincoln

"In any moment of decision, the best thing you can do is the right thing, the next best thing is the wrong thing, and the worst thing you can do is nothing." — Theodore Roosevelt

"Strong hearts and helpful hands are needed, and, fortunately, we have them in every part of our beloved country." — William McKinley

"There can be no greater good than the quest for peace, and no finer purpose than the preservation of freedom." — Ronald Reagan

Wise words. What is your favorite presidential quote?`},
 {title:"Hello, Seldovia! Welcome to Week 7 of 2025!",excerpt:"City meetings, Presidents Day schedule changes, and community activities — plus FREE skating at the Waterfront Ice Rink!",date:"Feb 17, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-17.jpg",body:`Hello, Seldovia! Welcome to Week 7 of 2025!

Let's kick off the week with important city meetings and exciting community activities to keep you connected. Plus, don't forget—the Waterfront Ice Rink is open every day for FREE skating! ⛸️❄️

Upcoming Activities, Meetings and Schedule Changes:

Monday, February 17 – Presidents Day 🇺🇸
SVT Administrative Offices & Fitness Center – Closed
Susan B. English School – No School (No Swim)
SVT Kids Beach Fun 🏖️
Time: 1:00–3:00 PM | All ages welcome!

Tuesday, February 18
Seldovia Oil Spill Response Team Annual Membership Meeting
Time: 6:00 PM | Location: Multi-Purpose Building

Wednesday, February 19
SVT Bingo Night 🎉
Time: 6:00 PM | Location: Alaska Tribal Cache Building

Linwood Bar & Grill - FREE BINGO
Fridays at 6:00 PM
Join us for 10 rounds of exciting bingo featuring fun local prizes donated by the Linwood and other businesses in town. A big thank you to Jackie for organizing this community favorite!

Seldovia Village Tribe (SVT) Weekly Activities:
Elementary Homeschool Art Class (with Ecola Collier): Mondays, 1:30–2:30 PM
Open Swim: Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
After School Time (Grades K-5): Fridays, 3:15 PM
Open Gym: Fridays, 6:00 PM – Fun for the whole family!
Fitness Center: Weekdays, 8:00–10:00 AM & 1:00–2:00 PM

Sea Otter Community Center (SOCC) Weekly Activities:
Workout with Lisa: Weekdays, 9:00–9:45 AM
Yoga: Tuesdays & Thursdays, 10:00–11:00 AM
1st-3rd Grade Girls Cheer Club: Wednesdays & Thursdays, 3:15–4:15 PM

Seldovia Bible Chapel Weekly Activities:
Morning Worship: Sundays, 11:00 AM
Sunday School: Sundays, 9:45–10:45 AM
Chapel Teens Ground Zero (Grades 7-12): Sundays, 3:00 PM – Fun, refreshments, and Bible study for teens.
Tuesday Evening Bible Studies:
Men's Bible Study: 7:00 PM | Location: Church Fellowship Hall
Women's Bible Study: 7:00 PM | Location: Church

Susan B. English School Weekly Activities:
Pool Schedule: Check out the photo for details!

Seldovia Public Library Winter Schedule:
Check out the photo for details!

Have a fantastic week, Seldovia! ❄️

Stay connected, mark your calendars, and make the most of these exciting opportunities. Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"Happy Valentine's Day!",excerpt:"To celebrate the day, here are 7 things I love about living in Seldovia.",date:"Feb 14, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-02-14.jpg",body:`Happy Valentine's Day! 💕

There are many ways to celebrate love! Love of people, love of situation, love of work, love of place, love of possibilities, etc! It truly isn't all about flowers and chocolate or jewelry (those are nice though!) 😄

To celebrate the day, here are 7 things I love about living in Seldovia: 🌲🌷

• Our caring community
• Our gorgeous environs
• Small town atmosphere
• The tranquility
• Subsistence fishing!

What about you?`},
 {title:"Moon over Fairbanks this morning!",excerpt:"Moon over Fairbanks this morning!",date:"Feb 11, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-02-11.jpg",body:`Moon over Fairbanks this morning! 🌙✨`},
 {title:"Hello, Seldovia, and welcome to Week 6 of 2025!",excerpt:"City meetings and community activities — plus FREE skating every day at the Waterfront Ice Rink!",date:"Feb 10, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-10.jpg",body:`Hello, Seldovia, and welcome to Week 6 of 2025!

Let's start the week strong with important city meetings and a host of community activities to keep you engaged and informed. Plus, don't forget—the Waterfront Ice Rink is open for FREE skating every day! ⛸️❄️

Upcoming Events:

City & Department Meetings:

Monday, February 10, 2025
Seldovia City Council Worksession
Time: 4:00 PM

Seldovia City Council Regular Meeting
Time: 6:00 PM at Council Chambers
In Person at Council Chambers, 260 Seldovia Street, or by Zoom Webinar. Webinar ID: 845 7628 0095, Passcode: 864684

Tuesday, February 11, 2025
Seldovia Volunteer Fire Department Executive Board Meeting
Time: 6:00 PM in the Multi-Purpose Room

Community Fun:
Linwood Bar & Grill - FREE BINGO
When: Fridays at 6:00 PM
Join us for 10 rounds of exciting bingo featuring fun local prizes donated by the Linwood and other businesses in town. A big thank you to Jackie for putting together this community favorite!

Weekly Activities for Seldovia Village Tribe (SVT):
Elementary Homeschool Art Class (with Ecola Collier): Mondays, 1:30–2:30 PM
Open Swim: Tuesdays, 3:15–5:00 PM & Fridays, 6:00–8:00 PM
After School Time (Grades K-5): Fridays, 3:15 PM
Open Gym: Fridays, 6:00 PM – Fun for the whole family!
Fitness Center: Weekdays, 8:00–10:00 AM & 1:00–2:00 PM

Weekly Activities at Sea Otter Community Center (SOCC):
Workout with Lisa: Weekdays, 9:00–9:45 AM
Yoga: Tuesdays & Thursdays, 10:00–11:00 AM
1st-3rd Grade Girls Cheer Club: Wednesdays & Thursdays, 3:15–4:15 PM

Weekly Activities at Seldovia Bible Chapel:
Sunday School: 9:45–10:45 AM
Morning Worship: 11:00 AM
Teens Ground Zero (Grades 7-12): Sundays, 3:00 PM – Enjoy fun, refreshments, and Bible study for teens.

Weekly Activities at Susan B. English School:
Pool Schedule: Check out the photo for details!

Stay connected, mark your calendars, and make the most of these exciting opportunities. Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"Celebrating one of the most important cornerstones of society.",excerpt:"Strong marriages create loving families, resulting in happy and successful children who grow up to be our next generation of amazing adults.",date:"Feb 9, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-09.jpg",body:`Celebrating one of the most important cornerstones of society. 💑✨

Strong marriages create loving families, resulting in happy and successful children who grow up to be our next generation of amazing adults who bring new energy, hope, ideas and promise into the world! ❤️`},
 {title:"Sending Warmth Across the Miles! It's Send a Card to a Friend Day!",excerpt:"Take a moment to brighten someone's day with a heartfelt message. Let's send out “Happy Mail” one card at a time!",date:"Feb 7, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-07.jpg",body:`Sending Warmth Across the Miles! 💌💖 It's Send a Card to a Friend Day!

I truly like getting mail that is not a bill, or an advertisement, but a note from a friend! Don't you?

Take a moment to brighten someone's day with a heartfelt message. Let's send out "Happy Mail" one card at a time! Who will you send a little love to today? Tag them below! 💌📬

#seldovia #seldoviaalaska #seldoviaak #seldoviaproperty #alaska #alaskalife #alaskaliving`},
 {title:"There's nothing that quite warms you up during these winter months like a delicious home-made soup!",excerpt:"Do you have a favorite home-made recipe that you love, and maybe would like to share?",date:"Feb 4, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-04.jpg",body:`There's nothing that quite warms you up during these winter months like a delicious home-made soup! Comfort food for sure! 🍲🥄

We've been making a brocolli vegetable soup that tastes great is filling AND super easy to heat up for lunch... speedy speedy! 🥦

Do you have a favorite home-made recipe that you love, and maybe would like to share?`},
 {title:"Hello Seldovia, and welcome to Week 5 of 2025!",excerpt:"Here's a look at what's happening this week in our wonderful community.",date:"Feb 3, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-03.jpg",body:`Hello Seldovia, and welcome to Week 5 of 2025! Here's a look at what's happening this week in our wonderful community:

Upcoming Events:

Tuesday, February 4, 2025
Dr. Marlowe's Veterinary Services
Call Debbie Cameron at (907) 435-3255 to schedule an appointment!

Wednesday, February 5, 2025
Children's Library Elder Reading (Ages 0-6), Wednesdays | 11:00 AM

Thursday, February 6, 2025
Walking Club: All abilities welcome! | 11:30am-12pm

Linwood Bar & Grill - FREE BINGO
When: Fridays at 6:00 PM
Join in for 10 rounds of exciting Bingo with fun local prizes donated by the Linwood and other businesses in town. Thank you, Jackie, for organizing this community favorite!

Weekly Activities for Seldovia Village Tribe (SVT):
Elementary Homeschool Art Class (with Ecola Collier): Mondays, 1:30–2:30 PM
Open Swim: Tuesdays 3:15-5pm & Fridays 6-8pm
After School Time (Grades K-5): Mondays, Wednesdays & Fridays, 3:15 PM
Open Gym: Fridays, 6:00 PM – Fun for the whole family!
Fitness Center: Weekdays, 8–10 AM & 1–2 PM

Weekly Activities at Sea Otter Community Center (SOCC):
Workout with Lisa: Weekdays, 9–9:45 AM
Yoga: Tuesdays & Thursdays, 10–11 AM
1st-3rd Grade Girls Cheer Club: Wednesdays & Thursdays, 3:15–4:15 PM

Weekly Activities at Seldovia Bible Chapel:
Sunday School: 9:45–10:45 AM
Morning Worship: 11:00 AM
Teens Ground Zero (Grades 7-12): Sundays, 3:00 PM – Fun, refreshments, and Bible study for teens.

Weekly Activities at Susan B. English School:
Check out the photo for the pool schedule!

Stay connected, get involved, and make the most of this wonderful week! Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"Guess who's popping up today? It's Groundhog Day!",excerpt:"Will we get an early spring or more winter? Fingers crossed for sunshine!",date:"Feb 2, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-02-02.jpg",body:`Guess who's popping up today? It's Groundhog Day! 🌱

Some interesting facts:
The first Groundhog Day was observed in 1887 in Punxsutawney, Pennsylvania.

On Groundhog Day, a groundhog, named Punxsutawney Phil, from Punxsutawney, emerges in the morning to a large crowd.

If Phil sees his shadow, there will be 6 more weeks of frigid weather. If Phil looks down, and does not see his shadow, then that means that Spring is coming along with sunshine and warmth!

Funny fact: Phil's success rate at predicting the weather is only about 39%. Haha!

Groundhogs typically have a lifespan of 6-8 years. However, each groundhog day, Phil is given a "Magical Potion" to extend his life for seven more years!

Will we get an early spring or more winter? Fingers crossed for sunshine! 🌞 What's your prediction? Share below! 🌱🌸`},
 {title:"Seldovia's Outside Beach is a serene spot that offers a perfect blend of relaxation and adventure.",excerpt:"Whether you're looking to unwind with the sound of waves crashing against the shore, or you're eager to explore the natural beauty of the area, there's something for everyone.",date:"Jan 31, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-01-31.jpg",body:`Seldovia's Outside Beach is a serene spot that offers a perfect blend of relaxation and adventure. Whether you're looking to unwind with the sound of waves crashing against the shore, or you're eager to explore the natural beauty of the area, there's something for everyone. 🌊✨

Let's get inspired at Outside Beach:

1. Beachcombing – Wander along the shore and discover unique seashells, driftwood, and other treasures washed up by the ocean.
2. Wildlife Viewing – Keep an eye out for sea otters, birds, and the occasional seal as they make appearances along the ocean.
3. Photography – Capture stunning views of the rugged coastline, dramatic skies, and peaceful waters. It's a photographer's dream!
4. Picnicking – Pack a lunch and enjoy a peaceful meal with the beach as your backdrop. There are perfect spots to sit and take in the scenery.
5. Kayaking and Paddleboarding – For those seeking more adventure, kayaking and paddleboarding offer an exciting way to explore the waters around Outside Beach.
6. Relaxation – Simply sit back, relax, and enjoy the peaceful environment, making it an ideal spot to recharge and take in the natural beauty.
7. For the brave – Dive in, the water is fine... and cold, I mean REFRESHING!

Whether you're a nature lover, adventurer, or simply looking for some peace and quiet, Outside Beach has something to offer. 🌊💧`},
 {title:"What's your view today?",excerpt:"What's your view today?",date:"Jan 28, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-01-28.jpg",body:`What's your view today? 👀🏔️`},
 {title:"Hello Seldovia, and welcome to Week 4 of 2025! (Part 2/2)",excerpt:"Weekly activities at the Sea Otter Community Center and Seldovia Bible Chapel.",date:"Jan 27, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-27_2.jpg",body:`Hello Seldovia, and welcome to Week 4 of 2025! (Part 2/2)

Weekly Activities at Sea Otter Community Center (SOCC):

- Arts & Crafts Club: Mondays, 3:15 PM
- Cooking with Lisa: Wednesdays, 3:15–5:00 PM
- Chess Club:
- Advanced: Thursdays, 3:15–4:00 PM
- Beginners: Thursdays, 4:00–5:00 PM
- Science Friday: Fridays, 1:00–3:00 PM

Weekly Activities at Seldovia Bible Chapel:

- Sunday School: 9:45–10:45 AM
- Morning Worship: 11:00 AM
- Teens Ground Zero (Grades 7-12): Sundays, 3:00 PM – Fun, refreshments, and Bible study for teens.

Stay updated with the Daily Calendar at www.Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!

Let's make it a fantastic week, Seldovia!`},
 {title:"Hello Seldovia, and welcome to Week 4 of 2025! (Part 1/2)",excerpt:"Let's dive into another exciting week filled with community events, activities, and opportunities to stay connected!",date:"Jan 27, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-27_1.jpg",body:`Hello Seldovia, and welcome to Week 4 of 2025! (Part 1/2)

Let's dive into another exciting week filled with community events, activities, and opportunities to stay connected!

Upcoming Events:

Monday, January 27, 2025
- Seldovia City Council Regular Meeting
Time: 6:00 PM
Location: Council Chambers

Tuesday, January 28, 2025
- SBE PAC Meeting
Time: 6:00 PM
Location: SBE Commons Area

The pool is OPENING tomorrow, January 28! Check out the photos for more details!

Wednesday, January 29, 2025
- SVT Children's Library Elder Reading with Darlene Crawford (0-6 years)
Time: 11am-12pm
Location: Alaska Tribal Cache Building

Preschool Hands-On Activities (Ages 3-5)
When: Mondays, Tuesdays & Wednesdays
Contact: Text or call Meg at 907-726-7255 for details.
Let your little ones explore, create, and learn in a fun, interactive environment!

Linwood Bar & Grill - Free Bingo
When: Fridays at 6:00 PM
Enjoy 10 exciting rounds of bingo with fun local prizes donated by the Linwood and other local businesses. Thank you, Jackie, for organizing this community favorite!

Weekly Activities for Seldovia Village Tribe (SVT):

- Elementary Homeschool Art Class (with Ecola Collier): Mondays, 1:30–2:30 PM
- After School Time (Grades K-5): Mondays, Wednesdays & Fridays, 3:15 PM
- Open Gym: Fridays, 6:00 PM – Fun for the whole family!
- Fitness Center: Weekdays, 8–10 AM & 1–2 PM
- Walking Club: Thursdays – All abilities welcome!

Click here for Part 2: https://web.facebook.com/photo/?fbid=1140312237933368&set=a.556376149660316`},
 {title:"Craving something sweet? Explore a few places in Seldovia to grab some delicious ice cream!",excerpt:"Craving something sweet? Explore a few places in Seldovia to grab some delicious ice cream!",date:"Jan 27, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-27.jpg",body:`Craving something sweet? 🍦 Explore a few places in Seldovia to grab some delicious ice cream! Check out the options here: https://www.seldovia.com/to-do/restaurants-and-groceries/`},
 {title:"Seldovia, Alaska, may be a small town, but it holds rich history and culture.",excerpt:"One notable museum in Seldovia is the Seldovia Museum & Visitor Center.",date:"Jan 26, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-26.jpg",body:`Seldovia, Alaska, may be a small town, but it holds rich history and culture. One notable museum in Seldovia is:

Seldovia Museum & Visitor Center

https://svt.org/seldovia-visitor-center-and-museum/

Located in the heart of town, the Seldovia Museum showcases the area's deep-rooted history, culture, and traditions. Exhibits highlight Native Alutiiq heritage, early settlers, fishing industry history, and the town's resilience after the 1964 Good Friday Earthquake. It's a great place to explore Seldovia's past and learn about its vibrant community.

Stop by the museum to connect with Seldovia's rich stories and traditions! ✨`},
 {title:"Embrace the Power of Positivity!",excerpt:"On National Compliment Day, let's spread kindness like confetti!",date:"Jan 24, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-24.jpg",body:`🌞 Embrace the Power of Positivity! 🌞

On National Compliment Day, let's spread kindness like confetti! Tag someone below and give them a compliment that brightens their day. Let's lift each other up!

An honest compliment is always welcome and if you lead with your heart - it will be received and make a difference in someone's day!`},
 {title:"If you love pie (like me) then you'll definitely be excited when I tell you that today is #NationalPieDay!",excerpt:"What are some of your favorite pies?",date:"Jan 23, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-23.jpg",body:`If you love pie (like me) then you'll definitely be excited when I tell you that today is #NationalPieDay! 🥧

What are some of your favorite pies?

My dad made the best pies with an emphasis on a delicious tender flakey crust and often we had pies instead of cakes for birthdays… here's a list of some of my favorites:

• Dad's blackberry pie from wild blackberries picked off the beach with a scoop of vanilla ice cream (he would let us lick the plate on this one!)
• Lemon meringue - the meringue was always so tall
• Apple - with apples from our trees and a slice of sharp cheddar cheese

What kind of pie will you be enjoying to celebrate the day?`},
 {title:"Flying into Seldovia with a breathtaking view of Homer Spit blanketed in snow.",excerpt:"Flying into Seldovia with a breathtaking view of Homer Spit blanketed in snow.",date:"Jan 22, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-01-22.jpg",body:`Flying into Seldovia with a breathtaking view of Homer Spit blanketed in snow. ❄️✈️`},
 {title:"It's National Hugging Day!",excerpt:"There's nothing like a good hug to make you feel warm, loved, and connected.",date:"Jan 21, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-21.jpg",body:`It's National Hugging Day! 🤗💖 There's nothing like a good hug to make you feel warm, loved, and connected. Whether it's a hug from a friend, family, or even a furry companion, today is all about sharing those sweet moments.

Who would you love to give a big hug to today? Tag them and let them know!`},
 {title:"Hello Seldovia, and welcome to Week 4 of 2025!",excerpt:"Upcoming events and weekly activities across Seldovia.",date:"Jan 20, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-20.jpg",body:`Hello Seldovia, and welcome to Week 4 of 2025!

Upcoming Events:

SVT - Thrive 'Autism Spectrum'
When: January 21st @ 12:30 PM
Don't miss this opportunity to learn and connect.

Preschool Hands-On Activities (Ages 3-5)
When: Mondays, Tuesdays & Wednesdays
Contact: Text or call Meg at 907-726-7255 for questions.
Let your little ones explore, create, and learn in a fun and interactive environment!

Linwood Bar & Grill - FREE BINGO
When: Fridays at 6:00 PM
Join in for 10 rounds of Bingo with fun local prizes donated by the Linwood and other businesses in town! Thanks Jackie for putting this together!

Seldovia Public Library Board of Directors Meeting
When: January 21, 6:30 PM

Weekly Activities for Seldovia Village Tribe (SVT):
• Elementary Homeschool Art Class with Ecola Collier, Mondays 1:30-2:30 PM
• Gentle Exercise with Jenifer Dickson, Tuesdays 11:15-12:15 PM
• After School Time (Grades K-5), Mondays, Wednesdays, and Fridays | 3:15 PM
• Open Gym, Fridays | 6:00 PM – Fun for the whole family!
• Children's Library Elder Reading (Ages 0-6), Wednesdays | 11:00 AM
• Fitness Center, Weekdays | 8–10 AM & 1–2 PM
• Walking Club, Thursdays – All abilities welcome!

Weekly Activities for Sea Otter Community Center (SOCC):
• Arts & Crafts Club, Mondays | 3:15 PM
• Cooking with Lisa, Wednesdays | 3:15–5:00 PM
• Chess Club:
Advanced: Thursdays | 3:15–4:00 PM
Beginners: Thursdays | 4:00–5:00 PM
• Science Friday, Fridays | 1:00–3:00 PM

Weekly Activities at Seldovia Bible Chapel (Every Sunday):
• Sunday School, 9:45–10:45 AM
• Morning Worship, 11:00 AM
• Teens Ground Zero (Grades 7-12), 3:00 PM – Fun, refreshments, and Bible study for teens.

Stay connected, get involved, and make the most of this wonderful week! Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"“Everybody can be great because everyone can serve.” — Martin Luther King, Jr.",excerpt:"Today, we celebrate the legacy of a true leader who inspired change through service and love.",date:"Jan 20, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-20_2.jpg",body:`"Everybody can be great because everyone can serve." — Martin Luther King, Jr. ✨

Today, we celebrate the legacy of a true leader who inspired change through service and love. Let's honor Martin Luther King Jr.'s incredible impact by continuing to serve and uplift those around us. 💙`},
 {title:"Discover Beauty at Seldovia's One and Only Salon!",excerpt:"Meggie at Fathoms Salon offers personalized beauty services right here in our cozy coastal town!",date:"Jan 18, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-18.jpg",body:`✨ Discover Beauty at Seldovia's One and Only Salon! ✨

Looking for a fresh new look or a little self-care? Meggie at Fathoms Salon offers personalized beauty services right here in our cozy coastal town!

Whether it's a stylish haircut, a relaxing treatment, or a bold new color, Fathoms Salon is here to make you feel and look your best. 🌊✂️

Stop by and treat yourself—you deserve it! 💖`},
 {title:"Endless beauty around every curve at Turnagain Arm",excerpt:"Endless beauty around every curve at Turnagain Arm",date:"Jan 16, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-01-16.jpg",body:`Endless beauty around every curve at Turnagain Arm ✨`},
 {title:"Bagels: Because breakfast shouldn't be boring!",excerpt:"What's your favorite bagel combo?",date:"Jan 15, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-15.jpg",body:`Bagels: Because breakfast shouldn't be boring! 🌞 What's your favorite bagel combo?`},
 {title:"How in the world did we end up in Seldovia? Part 3.",excerpt:"About 2 weeks before school was to start in Fairbanks, we got THE call — from the Boys & Girls Club!",date:"Jan 14, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-01-14.jpg",body:`How in the world did we end up in Seldovia? Part 3.

Disappointed, yes. We had so loved our visit to Seldovia in May and we couldn't get it out of our minds… We kept talking to Susan B English school - but soon summer was upon us, and everyone was on break. We kept scouring the internet and talking to folks in Seldovia to ask about possible position openings, to no avail.

Then, about 2 weeks before school was to start here in Fairbanks, we got THE call - from the Boys & Girls Club! They offered Sonny the position, and hoped he could start as soon as possible. Thankfully, they proposed a salary that would make it possible for a family of five to survive in Seldovia! We knew that it was not for financial gain that we were making this move to Seldovia - it was truly all about lifestyle! But first - Sonny had to call his principal and superintendant about releasing him from his teaching contract!

Fortunately, they had applicants for his position and they wrote a glowing recommendation and were willing to release him stating that he'd always be welcome back in the district! It was awesome that they understood we were following our dream!

We couldn't wait to call the owner of our sweet cottage on Bootlegger's Cove and let him know we were ready to put in an offer - and he had secured a job in Seldovia! It was all coming together! Read the continuation here: https://www.seldoviaproperty.com/.../how-in-the-world-did…`},
 {title:"Hello Seldovia, and Welcome to Week 3 of 2025!",excerpt:"Let's kick off this week with exciting events and activities happening all around Seldovia!",date:"Jan 13, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-13.jpg",body:`Hello Seldovia, and Welcome to Week 3 of 2025! Let's kick off this week with exciting events and activities happening all around Seldovia!

Upcoming events:
• Preschool Hands-On Activities (Ages 3-5)
When: Mondays, Tuesdays & Wednesdays
Contact: Text or call Meg at 907-726-7255 for questions.
Let your little ones explore, create, and learn in a fun and interactive environment!

• Seldovia City Council Regular Meeting
When: Monday, January 13, 2025 | 6:00 PM
Where: Council Chambers
Stay informed and involved in local decisions that shape our community.

• Seldovia Arts Council: 2025 Photo Essay Series
Event: "The Ice Below" and other tales from Antarctica
When: Saturday, January 18th | 6:00 PM
A captivating visual journey exploring the icy wonders of Antarctica!

Weekly Activities for Seldovia Village Tribe (SVT):
• After School Time: Mondays, Wednesdays, and Fridays | 3:15 PM (Grades K-5)
• Open Gym: Fridays | 6:00 PM – Fun for the whole family!
• Children's Library Elder Reading: Wednesdays | 11:00 AM (Ages 0-6)
• Fitness Center: Weekdays | 8–10 AM & 1–2 PM
• Walking Club: Thursdays – All abilities welcome!

Weekly Activities for Sea Otter Community Center (SOCC):
• Cooking with Lisa: Wednesdays | 3:15–5:00 PM
• Arts & Crafts Club: Mondays | 3:15 PM – Unleash your creativity!
• Chess Club: Thursdays
- Advanced: 3:15–4:00 PM
- Beginners: 4:00–5:00 PM
• Science Friday: Fridays | 1:00–3:00 PM – Dive into science fun!

Sunday Activities at Seldovia Bible Chapel:
• Sunday School: 9:45–10:45 AM
• Morning Worship: 11:00 AM
• Teens Ground Zero (Grades 7-12): 3:00 PM – Fun, refreshments, and Bible study for teens.

Stay connected, get involved, and make the most of this wonderful week! Check out the DAILY CALENDAR at Seldovia.com for new programs and updates.

While you're at it, take a look at the latest in the Seldovia real estate market at www.SeldoviaProperty.com. If anything catches your eye, give me a call—I'm always here to help as your Seldovia Connection!`},
 {title:"We're excited to announce that Susan B. English School has a new Pool Manager—Amelia Pollack!",excerpt:"Let's dive into a season of fun and fitness!",date:"Jan 11, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-11.jpg",body:`We're excited to announce that Susan B. English School has a new Pool Manager—Amelia Pollack! Amelia brings great energy and expertise, and we can't wait for a fantastic semester of swimming for both our students and the community. Let's dive into a season of fun and fitness! 🌊`},
 {title:"When the weather gets chilly, what's your comfort drink of choice?",excerpt:"When the weather gets chilly, what's your comfort drink of choice?",date:"Jan 10, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-10.jpg",body:`When the weather gets chilly, what's your comfort drink of choice?`},
 {title:"Honoring the Heroes in Uniform!",excerpt:"On Law Enforcement Day, we salute the brave men and women all throughout our country who work tirelessly to keep our communities safe.",date:"Jan 9, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-09.jpg",body:`Honoring the Heroes in Uniform! On Law Enforcement Day, we salute the brave men and women all throughout our country who work tirelessly to keep our communities safe. Your dedication is truly commendable. Thank you for your service! 🙌💙`},
 {title:"It's always so heartwarming to receive wonderful feedback from clients!",excerpt:"Thank you for making what I do so rewarding!",date:"Jan 8, 2025",read:"1 min",cat:"Kind Words",img:"images/gazette/2025-01-08.jpg",body:`It's always so heartwarming to receive wonderful feedback from clients! Thank you for making what I do so rewarding! 💗`},
 {title:"Right now, during the winter, the only place for pizza out is the Linwood Bar and Grill - for which we are so thankful!",excerpt:"The Crabpot grocery does a great job of keeping the frozen section supplied with a variety of pizza options!",date:"Jan 7, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-07.jpg",body:`Right now, during the winter, the only place for pizza out is the Linwood Bar and Grill - for which we are so thankful!

But if you don't feel like going out, and you aren't up to making your own homemade pizza, the Crabpot grocery does a great job of keeping the frozen section supplied with a variety of pizza options! They also have Boboli crusts (which is the hardest part of getting a pizza together at home!). Thanks Tata and Chris! 😊`},
 {title:"Seldovia, Alaska, is a hidden gem when it comes to wild berries!",excerpt:"Here are some of the best spots to find them.",date:"Jan 6, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-01-06.jpg",body:`Seldovia, Alaska, is a hidden gem when it comes to wild berries! ✨

Here are some of the best spots to find them:

Outside Beach & Otterbahn Trail: This scenic area is a prime location for wild berries, especially in the late summer and fall. You'll find blueberries, raspberries, salmonberries, and even huckleberries along the trails.

Rocky Ridge Trail, Red Mountain Hike and up to the ACS tower trails you'll find berries along the way! You can find an abundance of wild berries growing in forested areas along our trails. Sometimes you will find small pockets of raspberry bushes or even wild strawberries which thrive near the coastline.

Always be sure to pick along easements, trails or public lands. Be thoughtful not to trespass on private property. If you don't know where to go - ask!`},
 {title:"Do you agree? Yes or no?",excerpt:"Do you agree? Yes or no?",date:"Jan 5, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-05.jpg",body:`Do you agree? Yes or no?`},
 {title:"5 ways to embrace winter in Seldovia, from the new Waterfront Ice Rink to cozying up with a warm drink.",excerpt:"Winter in Seldovia is all about embracing the quiet charm and natural beauty of this Alaskan gem!",date:"Jan 4, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-01-04.jpg",body:`1. Explore the brand new Seldovia Waterfront Ice Rink!
Bundle up and enjoy a magical experience skating on the waterfront. It's a perfect winter activity for families and friends, Thanks Ashley for all you have done to bring this project to life! I love our view of the activities! And, the kids will absolutely LOVE our new ice rink!

2. Go Winter Beachcombing.
The heavy seas and high tides offer a unique chance to find beautiful driftwood, shells, or sea glass while enjoying stunning views of Kachemak Bay.

3. Winter Hiking.
Take to the trails surrounding Seldovia! Trails provide a peaceful way to enjoy the beauty of the Alaskan wilderness. Don't miss Otterbahn Trail for its tranquil forest vibes. Do wear good shoes, as we have got ice!

4. Wildlife Spotting.
Winter is a quieter time for wildlife, but you can still spot eagles, sea otters, and other hardy creatures thriving in the cold. Bring your binoculars for the best experience!

5. Cozy Up with a Warm Drink
Visit a local café or restaurant and enjoy a hot drink while chatting with locals. It's the perfect way to warm up and soak in the community spirit.

Winter in Seldovia is all about embracing the quiet charm and natural beauty of this Alaskan gem!`},
 {title:"Pebble beaches, white rocks, salty breeze, and endless fetch games!",excerpt:"Experience the joy of seaside adventures at Seldovia's favorite dog-friendly beaches.",date:"Jan 2, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-01-02.jpg",body:`Pebble beaches, white rocks, salty breeze, and endless fetch games! 🎾🌊 Experience the joy of seaside adventures at Seldovia's favorite dog-friendly beaches:

• Outside Beach - just a mile from Main Street in Seldovia.
• Jakolof Bay - about 10 miles out the road!

You can also head out on our many hiking trails where your furry friends love to chase squirrels and tree bears (though they are hopefully sleeping now!)

• Rocky Ridge Trail
• TV Tower
• Red Mountain
• Tutka Bay Trail

Did I miss a great spot? Comment below if you'd like to share!`},
 {title:"Wishing everyone a very Happy New Year!",excerpt:"Here's to new beginnings and exciting adventures in 2025!",date:"Jan 1, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-01-01.jpg",body:`Wishing everyone a very Happy New Year! Here's to new beginnings and exciting adventures in 2025! 🥂🎉`}
];
// Real "Seldovia Days" photos pulled from the Flywheel gallery (Jenny & Melody Hall).
const GALLERY=[{h:300,cap:"Sunset over the bay",img:"images/gallery/g-1.jpg"},{h:300,cap:"Floatplane off the bay",img:"images/gallery/g-2.jpg"},{h:300,cap:"Red salmon riches",img:"images/gallery/g-3.jpg"},{h:300,cap:"Seldovia harbor",img:"images/gallery/g-4.jpg"},{h:300,cap:"Outside Beach stream",img:"images/gallery/g-5.jpg"},{h:300,cap:"Kenai reds",img:"images/gallery/g-6.jpg"},{h:300,cap:"Enchanted woods",img:"images/gallery/g-7.jpg"},{h:300,cap:"Barabara Creek",img:"images/gallery/g-8.jpg"},{h:300,cap:"MacDonald Spit",img:"images/gallery/g-9.jpg"},{h:300,cap:"Seldovia rainbow",img:"images/gallery/g-10.jpg"},{h:300,cap:"Ferry day",img:"images/gallery/g-11.jpg"},{h:300,cap:"Through the trees",img:"images/gallery/g-12.jpg"}];
// REAL 2026 Seldovia events — sourced from the community news feed on seldovia.com
// (incl. the "2026 Summer Events in Seldovia" roundup). Times shown only where confirmed.
const EVENTS=[
 {d:"2026-05-22",t:"",title:"Human Powered Fishing Derby",where:"Seldovia Harbor",cat:"Fishing",dur:"May 22–24"},
 {d:"2026-05-24",t:"",title:"Blessing of the Fishermen & Fleet",where:"Seldovia Harbor",cat:"Community",dur:""},
 {d:"2026-06-01",t:"",title:"Seldovia's Chinook Challenge",where:"Seldovia",cat:"Fishing",dur:"Jun 1 – Jul 3"},
 {d:"2026-06-14",t:"",title:"Flag Day Breakfast Potluck",where:"Seldovia",cat:"Community",dur:""},
 {d:"2026-06-18",t:"",title:"Summer Solstice Music Festival",where:"Seldovia",cat:"Music",dur:"Jun 18–20"},
 {d:"2026-07-03",t:"",title:"Independence Day Activities",where:"Downtown Seldovia",cat:"Community",dur:"Jul 3–5"},
 {d:"2026-07-04",t:"",title:"Salmon Shuffle 5K",where:"Seldovia",cat:"Outdoors",dur:""},
 {d:"2026-07-17",t:"",title:"Songs on the Slough",where:"Seldovia Slough",cat:"Music",dur:"Jul 17–18"},
 {d:"2026-07-24",t:"",title:"Seldovia Fly-In 2026",where:"Seldovia Airport",cat:"Festival",dur:"Jul 24–26"},
 {d:"2026-07-24",t:"",title:"Teen Night — Fish Fry & Finger Darts",where:"Seldovia Bible Chapel",cat:"Youth",dur:"Evening"},
 {d:"2026-07-25",t:"14:30",title:"Pier One Theatre — The Frogs",where:"Clam Shell Stage",cat:"Arts",dur:""},
 {d:"2026-07-25",t:"",title:"Jakolof Bay 10-Miler",where:"Jakolof Bay Road",cat:"Outdoors",dur:""},
 {d:"2026-07-27",t:"17:00",title:"City Council Work Session",where:"Council Chambers, 260 Seldovia St",cat:"Civic",dur:""},
 {d:"2026-08-08",t:"",title:"Salmonberry Delights Cooking Competition",where:"Seldovia",cat:"Food",dur:""},
 {d:"2026-08-30",t:"",title:"Guitar Master's Concert",where:"Seldovia",cat:"Music",dur:""}
];
// Jenny's active listings (real). Photos in images/listings/ (optimized). Full detail via listing.html?id=slug.
const LISTINGS=[] /* migrated to Supabase — all listings now managed in the admin */;
// Community members — opt-in, privacy-first: each person shares only what they want,
// so fields are intentionally uneven. PROD: populated from approved Netlify Form submissions.
// Community phone-book residents. Intentionally EMPTY — the placeholder "neighbors" here were
// invented, and we don't publish real residents' contact details without their opt-in.
// Entries arrive via the directory-add form (Jenny approves each one). The old seldovia.com
// directory holds 145 residents already marked public — migrate only on Jenny's say-so.
const MEMBERS=[];
// REAL Seldovia businesses — migrated from the Connections directory on the existing
// seldovia.com WordPress site (37 approved + publicly-visible organizations).
// Entries marked "unlisted" on the old site are intentionally NOT included.
const DIRECTORY=[
 {name:"Aero Tech Lodge",cat:"Lodging",k:"stay",phone:"(907) 234-6200",spon:false},
 {name:"Alaska Dancing Eagles Cabin Rental",cat:"Cabin Rental",k:"stay",phone:"(907) 360-6363",url:"https://www.dancingeagles.com",spon:false},
 {name:"Alaska Free Diver",cat:"Diving & Tours",k:"activities",phone:"(907) 205-7963",url:"https://www.AlaskaFreeDiver.com",spon:false},
 {name:"Alaska Marine Highway System",cat:"Ferry",k:"travel",phone:"(800) 642-0066",spon:false},
 {name:"Asta Waterfront Suite",cat:"Lodging",k:"stay",phone:"(907) 231-6522",spon:false},
 {name:"Between Beaches",cat:"Lodging",k:"stay",phone:"(907) 290-6785",spon:false},
 {name:"Boardwalk Hotel",cat:"Hotel",k:"stay",phone:"(907) 234-7816",url:"https://www.SeldoviaHotel.com",spon:false},
 {name:"City of Seldovia",cat:"City Government",k:"life",phone:"(907) 234-7643",spon:false},
 {name:"Crabpot Grocery",cat:"Grocery",k:"shop",phone:"(907) 234-7435",spon:false},
 {name:"Fathoms Hair & Nail Salon",cat:"Salon",k:"services",phone:"(907) 726-7255",spon:false},
 {name:"Halo Cab",cat:"Taxi",k:"travel",phone:"(907) 205-7828",spon:false},
 {name:"Jack and Aiva's Restaurant",cat:"Restaurant",k:"eat",phone:"(907) 234-7440",spon:false},
 {name:"Kar-a-Van Transfer",cat:"Transfer",k:"travel",phone:"(907) 234-7802",spon:false},
 {name:"Mako's Water Taxi",cat:"Water Taxi",k:"travel",phone:"(907) 235-9055",spon:false},
  {name:"Sea Parrot Inn",cat:"Inn",k:"stay",phone:"(844) 377-7829",url:"https://www.seaparrotinn.com",spon:false},
 {name:"Seldovia Chamber of Commerce",cat:"Chamber of Commerce",k:"life",phone:"(907) 234-7612",spon:false},
 {name:"Seldovia Fishing Adventures",cat:"Fishing Charters",k:"activities",phone:"(907) 234-7417",url:"https://www.fishhalibut.com",spon:false},
 {name:"Seldovia Fuel and Hardware",cat:"Fuel & Hardware",k:"services",phone:"(907) 234-7622",spon:false},
 {name:"Seldovia Harbor Inn",cat:"Inn",k:"stay",phone:"(907) 202-3095",spon:false},
 {name:"Seldovia Health and Wellness",cat:"Health & Wellness",k:"services",phone:"(907) 435-3262",spon:false},
 {name:"Seldovia Native Association",cat:"Native Association",k:"life",phone:"(907) 234-7625",spon:false},
 {name:"Seldovia Outdoor Rentals & Gifts",cat:"Rentals & Gifts",k:"activities",phone:"(907) 302-0320",spon:false},
 {name:"Seldovia Police Department",cat:"Police",k:"life",phone:"(907) 234-7640",spon:false},
 {name:"Seldovia Property",cat:"Real Estate",k:"services",phone:"(907) 234-8000",url:"https://www.SeldoviaProperty.com",spon:false},
 {name:"Seldovia Public Library",cat:"Library",k:"life",phone:"(907) 234-7662",spon:false},
 {name:"Seldovia Sea Glass",cat:"Gifts & Art",k:"shop",phone:"",spon:false},
 {name:"Seldovia Sea Otter Community Center",cat:"Community Center",k:"life",phone:"(907) 234-4110",spon:false},
 {name:"Seldovia Suites",cat:"Suites",k:"stay",phone:"(907) 234-3700",spon:false},
 {name:"Seldovia Village Tribe",cat:"Tribe",k:"life",phone:"(907) 234-7898",spon:false},
 {name:"Smokey Bay Air",cat:"Air Taxi",k:"travel",phone:"(907) 531-0602",url:"https://www.SmokeyBayAir.com",spon:false},
 {name:"Susan B English School",cat:"School",k:"life",phone:"(907) 234-7616",spon:false},
 {name:"The Great Escape — Alaskan Vacation Rentals",cat:"Vacation Rentals",k:"stay",phone:"",url:"https://www.greatescapealaska.com",spon:false},
 {name:"Thyme on the Boardwalk",cat:"Gift Shop & Nursery",k:"shop",phone:"(907) 440-2213",url:"https://www.ThymeOnTheBoardwalk.com",spon:false},
 {name:"United States Post Office — Seldovia",cat:"Post Office",k:"life",phone:"(907) 234-7831",spon:false},
 {name:"Winter Watch",cat:"Property Care",k:"services",phone:"(907) 406-0775",url:"https://www.SeldoviaWinterWatch.com",spon:false},
 {name:"Rainbow Tours",cat:"Tours & Passenger Ferry",k:"travel",phone:"(907) 235-7272",url:"https://www.rainbowtours.net",spon:false},
 {name:"True North Air",cat:"Air Taxi",k:"travel",phone:"(907) 952-2726",spon:false},
 {name:"Seldovia Bay Ferry",cat:"Passenger Ferry",k:"travel",url:"https://seldoviabayferry.com",spon:false},
 {name:"Perley's Rides",cat:"Taxi & Truck Rental",k:"travel",phone:"(907) 299-8223",spon:false},
 {name:"Seldovia Nature Tours",cat:"Nature Tours",k:"activities",url:"https://www.seldovianaturetours.com",spon:false},
 {name:"Seldovia Salmonberry",cat:"Local Art & Gifts",k:"shop",phone:"(907) 632-9314",spon:false},
 {name:"SVT Museum & Gift Shop",cat:"Museum & Gifts",k:"shop",phone:"(907) 234-7898",url:"https://svt.org",spon:false},
 {name:"Seldovia Liquor Store",cat:"Beverages & Gifts",k:"shop",phone:"(907) 202-1938",spon:false},
 {name:"Schooner Beach Studio",cat:"Cut-Paper Art",k:"shop",phone:"(541) 520-7331",spon:false},
 {name:"Make it Reality",cat:"3D Printing & Laser",k:"services",phone:"(414) 367-9570",spon:false}
];
// REAL community announcements — sourced from the seldovia.com community news feed.
const NOTES=[] /* migrated to Supabase (seed-bulletin.sql) — all bulletin notices now managed + editable in the admin, rendered by bulletin-public.js */;
// REAL client testimonials, verbatim from Jenny's published client-testimonial graphics.
// Never add invented quotes here — the section self-hides when this array is empty.
const TESTIMONIALS=[
 {name:"Christine D.",role:"Home buyer",c:"#663015",t:"We very much appreciated Jenny's professionalism and helpfulness in the purchase of our home. Even with a small budget it was a big decision for us and Jenny was just as excited as we were! She made our dream possible!!! Thank you Jenny."},
 {name:"Rich K.",role:"Land buyer",c:"#1d6b78",t:"This was so easy for me. Jenny did all kinds of work, I did almost nothing. She snowshoed the property, took pictures, went with the surveyor, took more pictures after the snowmelt. I'm thousands of miles away, never lifted a finger. She's smart and clear, very relaxing to talk to; we shared some fun stories. We never met in person, but she's making me miss Seldovia."}
];
// REAL Seldovia businesses. These are not paid sponsors — the strip spotlights local
// businesses. Swap in genuine sponsors once Jenny sells that space.
// Photo Contest Sponsors — ad graphics in images/ads (Jenny). Add url to make a slide clickable.
const SPONSORS=[
  {name:"Breezy's by the Bay",img:"breezys.jpg"},
  {name:"True North Air",img:"true-north-air.jpg"},
  {name:"Seldovia Suites",img:"seldovia-suites.jpg"},
  {name:"The Kenai Airport Hotel",img:"kenai-airport-hotel.jpg"},
  {name:"Homer Sign Company",img:"homer-sign-company.jpg"},
  {name:"Alaska Bus Company",img:"alaska-bus-company.jpg"},
  {name:"Thyme on the Boardwalk",img:"thyme-on-the-boardwalk.jpg",url:"https://www.ThymeOnTheBoardwalk.com"},
  {name:"Seldovia Outdoor Rentals",img:"seldovia-outdoor-rentals.jpg",url:"https://seldovia.fun"}
];

/* ============================================================ RENDER (each guarded — runs only if its container exists on this page) ============================================================ */
function stars(r){const full=Math.round(r); return "★★★★★".slice(0,full)+"☆☆☆☆☆".slice(0,5-full);}
// self-hosted category photos by place key
const PLACE_IMG={about:"images/categories/cat-0.jpg?v=2",travel:"images/categories/cat-1.jpg?v=2",stay:"images/categories/cat-2.jpg?v=2",eat:"images/categories/cat-3.jpg?v=2",shop:"images/categories/cat-4.jpg?v=2",activities:"images/categories/cat-5.jpg?v=2",services:"images/categories/cat-6.jpg?v=2",life:"images/categories/cat-7.jpg?v=2"};

// hero quick-cats
if($("#quickcats")) $("#quickcats").innerHTML=[["Eat","eat"],["Stay","stay"],["Activities","activities"],["Travel","travel"],["Shop","shop"]].map(([label,key])=>
  `<a class="quickcat" href="explore.html?cat=${key}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>${esc(label)}</a>`).join("");

// category tiles
if($("#catGrid")) $("#catGrid").innerHTML=CATEGORIES.map((c,i)=>{
  const img=`images/categories/cat-${i}.jpg?v=3`;
  const href=`explore.html?cat=${c.key}`;
  return `<a class="cat-tile" href="${href}" aria-label="${esc(c.b)}"><img class="cat-photo" src="${img}" alt="" loading="lazy" width="600" height="600"><span class="cap"><b>${esc(c.b)}</b><span>${esc(c.s)}</span></span></a>`;}).join("");

// feature media
if($("#featureMedia")) $("#featureMedia").innerHTML=`<img class="feature-photo" src="images/photos/220627_SeldoviaHarbor_Melody.jpg" alt="Seldovia Harbor at first light" loading="lazy" width="1200" height="1200">`;

// places (directory highlights) with tabs — reads ?cat= from URL for deep-links
const PLACE_TABS=[["all","All"],["travel","Travel"],["stay","Lodging + Camping"],["eat","Eat"],["shop","Shop + Gifts"],["activities","Activities"],["services","Services"],["life","Public Services"],["outoftown","Out of Town"]];
let placeTab=(new URLSearchParams(location.search).get("cat"))||"all";
if(!PLACE_TABS.some(([k])=>k===placeTab) && placeTab!=="about") placeTab="all";
// Business owners + blurbs pulled from Jenny's old Seldovia.com directory (Connections).
// Keyed by the PLACES name. Only Sea Glass had a written blurb; the rest await Jenny.
const BIZ_OWNER={
  "Alaska Dancing Eagles Cabin Rental":"Kris & Judith Lethin","Alaska Free Diver":"Chris & Amelia Pollack",
  "Asta Waterfront Suite":"Sandy Bridge","Between Beaches":"Kristi McLean","Boardwalk Hotel":"Jeremiah and Angela Campbell",
  "Crabpot Grocery":"Chris & Tata Wheeler","Fathoms Hair & Nail Salon":"Meggie Langvardt","Halo Cab":"Bobbi Gese",
  "Jack and Aiva's Restaurant":"John Kennedy","Kar-a-Van Transfer":"Russ & Sandy Geagel","Mako's Water Taxi":"Mako Haggarty",
  "Sea Parrot Inn":"Tim and Mary Pedlow","Seldovia Fishing Adventures":"Chris & Ashley Keithley",
  "Seldovia Fuel and Hardware":"Dan Blodgett","Seldovia Harbor Inn":"Cory & Dawhn Bodyfelt",
  "Seldovia Outdoor Rentals & Gifts":"Jeremiah & Angela Campbell","Seldovia Property":"Jenny Chissus",
  "Seldovia Sea Glass":"Sarah Chambers","Seldovia Suites":"Cory & Dawhn Bodyfelt",
  "The Great Escape — Alaskan Vacation Rentals":"Sean Christman","Thyme on the Boardwalk":"Suzie Stranik",
  "Winter Watch":"Paul \"Sonny\" Chissus Jr.",
  // Added from the /to-do/ pages (Jenny's copy):
  "Linwood Bar & Grill":"Stephanie","Otter Cove Ice Cream at the Boardwalk Hotel":"Angela & Jeremiah Campbell",
  "Eternal Buzz":"Bobby","Breezy's by the Bay":"Josh & Brie","Make it Reality":"Henry",
  "Schooner Beach Studio":"Valisa","Seldovia Salmonberry":"Savanna","Seldovia Liquor Store":"Chaz & Jen",
  "True North Air":"Ronnie Fiscus"
};
// Blurbs are Jenny's own copy, pulled verbatim (lightly tidied) from the seldovia.com
// /to-do/ pages. Keyed by the exact PLACES name. Do not invent — leave a business out
// rather than guess.
const BIZ_BLURB={
  "Seldovia Sea Glass":"Beautifully handcrafted pendants made with ocean-tumbled Seldovia glass. Created here in Seldovia by local artist Sarah Chambers.",
  "Breezy's by the Bay":"Right across from the small boat harbor — smash burgers, subs, soups, pastries and fresh bread sub sandwiches!",
  "Crabpot Grocery":"Grocery items, household goods, fresh produce — a little bit of everything!",
  "Eternal Buzz":"Breakfast fare to-go, a drive-up window, coffee & teas.",
  "Jack and Aiva's Restaurant":"Breakfast and lunch right in the center of town, with lots of deck dining overlooking the harbor. Summer only.",
  "Linwood Bar & Grill":"Harbor view, dinner, carry-out, bar & ATM. Serving lunch and dinner.",
  "Otter Cove Ice Cream at the Boardwalk Hotel":"Hand-dipped ice cream, frozen chocolate-dipped bananas, gourmet ice cream bars & more.",
  "Seldovia Fuel and Hardware":"Espresso, Tuesday donuts, hot dogs, paninis and treats — plus gasoline, diesel, propane, a hardware store, snacks, groceries and fishing supplies.",
  "Halo Cab":"Local transportation services.",
  "Kar-a-Van Transfer":"Motor freight shipping into and out of Seldovia.",
  "Smokey Bay Air":"Air taxi and charter service — passengers and courier between Homer, Seldovia, Port Graham and Nanwalek. Just a 15-minute flight from Homer.",
  "True North Air":"Direct flights between Anchorage and Seldovia for passengers and freight — plus a shopping service in Anchorage!",
  "Perley's Rides":"Reliable taxi service and truck rental in Seldovia!",
  "Alaska Free Diver":"Alaska's home for wild ocean swimming, spearfishing & freediving. Sales, rentals & general info.",
  "Seldovia Fishing Adventures":"Family-friendly halibut fishing charters and B&B, established in 1985 — a Seldovia staple bringing guests from all over Alaska and the lower 48.",
  "Seldovia Outdoor Rentals & Gifts":"Golf carts, bicycle rental and an ice cream shop at the Boardwalk Hotel. Open all summer.",
  "Fathoms Hair & Nail Salon":"Haircuts, colors, waxing, spa manicures and pedicures.",
  "Seldovia Property":"Serving your real estate needs in Seldovia since 2004!",
  "Winter Watch":"Snow plowing, home security and watching, and construction services.",
  "Seldovia Salmonberry":"Gifts, local art, pottery, paintings, jewelry and Seldovia caps & sweatshirts, in a sweet little shop near the historic boardwalk.",
  "SVT Museum & Gift Shop":"Seldovia history & wildlife information, clothing, cards & art.",
  "Seldovia Liquor Store":"Liquor, beverages, snacks and gifts.",
  "Schooner Beach Studio":"Cut-paper artist — water access only. Visitors welcome, but BYOB (bring your own boat)!",
  "Make it Reality":"3D printing and laser creations — bringing imagination to life.",
  "Thyme on the Boardwalk":"Boutique and garden nursery — veggies & flowers, tools, yard decor, soil, and many beautiful, quality gift items."
};
// When arriving from a search suggestion (?find=Name), scroll to that card and flash it.
let _findScrolled=false;
function scrollToFind(containerSel){
  const find=new URLSearchParams(location.search).get("find"); if(!find) return false;
  const name=decodeURIComponent(find).trim().toLowerCase();
  const cont=document.querySelector(containerSel); if(!cont) return false;
  const h=[...cont.querySelectorAll("h4")].find(x=>x.textContent.trim().toLowerCase()===name);
  if(!h) return false;
  const card=h.closest("article,.place,.dir-item,li")||h.parentElement;
  card.scrollIntoView({behavior:"smooth",block:"center"}); card.classList.add("search-hit");
  setTimeout(()=>card.classList.remove("search-hit"),2400);
  return true;
}
function renderPlaces(){
  if(!$("#placeGrid")) return;
  if(placeTab==="about"){
    $("#placeGrid").innerHTML=`<div class="about-card">
      <h3>About Seldovia</h3>
      <p>Seldovia is a small town on the south shore of Kachemak Bay, across the water from Homer, Alaska. There is no road in — you arrive by ferry, small plane, or water taxi — which is a big part of what keeps it quiet, close-knit, and genuinely off the beaten path.</p>
      <p>The name comes from the Russian "Seldevoy," meaning "herring bay," a nod to the fishing heritage that still runs deep here. Wander the historic boardwalk, watch the boats in the harbor, hike the Otterbahn, and settle into the slower rhythm of one of Alaska's best kept secrets.</p>
      <p style="margin-top:1rem"><a class="btn btn-primary" href="explore.html">Browse the directory →</a></p>
    </div>`;
    return;
  }
  // Businesses first (alphabetical); trails & beaches sink to the bottom (Jenny #3).
  const isTrail=p=>p.cat==="Trail"||p.cat==="Beach & Park";
  const rows=PLACES.filter(p=>placeTab==="all"||p.key===placeTab).sort((a,b)=>{const ta=isTrail(a),tb=isTrail(b); return ta!==tb?(ta?1:-1):a.name.localeCompare(b.name);});
  const pin=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`;
  // Placeholder photo until Qwynny's square B&W watercolor images land (set p.img; p.imgColor for the sponsor color version).
  const placeCard=p=>{
    const bdg=placeBadge(p);
    const media=`<div class="place-media"><img class="place-photo" src="${bizPhoto(p)}" alt="" loading="lazy" width="600" height="600" onerror="this.src='images/placeholder-business.png'">${bdg?`<span class="place-badge" title="${esc(BADGE_LABEL[bdg]||"")}">${bdg}</span>`:""}</div>`;
    const owner=(p.key!=="life") ? BIZ_OWNER[p.name] : "";
    const blurb=BIZ_BLURB[p.name];
    const body=`<div class="place-body"><div class="rating"><span class="cat">${esc(p.cat)}</span></div><h4>${esc(p.name)}</h4>
        <div class="place-loc">${pin} Seldovia, AK</div>${owner?`<div class="place-owner">👤 ${esc(owner)}</div>`:""}${blurb?`<p class="place-blurb">${esc(blurb)}</p>`:""}`;
    if(p.url){ // whole card links to the business website
      return `<a class="place" href="${esc(p.url)}" target="_blank" rel="noopener">${media}${body}
        <div class="place-contact">${p.phone?esc(p.phone)+" · ":""}<span class="place-web">Visit website ↗</span></div></div></a>`;
    }
    // no website → not a link; show a tappable phone (or nothing for trails/beaches)
    const contact=p.phone?`<div class="place-contact"><a href="tel:${p.phone.replace(/[^\d]/g,"")}">📞 ${esc(p.phone)}</a></div>`:"";
    return `<div class="place place-static">${media}${body}${contact}</div></div>`;
  };
  $("#placeGrid").innerHTML=rows.map(placeCard).join("");
  if(!_findScrolled) requestAnimationFrame(()=>{ if(scrollToFind("#placeGrid")) _findScrolled=true; });
}
if($("#placeTabs")){
  $("#placeTabs").innerHTML=PLACE_TABS.map(([k,l])=>`<button class="tab" data-key="${k}" aria-pressed="${k===placeTab}">${esc(l)}</button>`).join("");
  $("#placeTabs").addEventListener("click",e=>{const b=e.target.closest(".tab"); if(!b)return; placeTab=b.dataset.key; $$("#placeTabs .tab").forEach(t=>t.setAttribute("aria-pressed",t===b)); renderPlaces();});
}
// Explore page: apply Jenny's saved category overrides (if any) before the first paint.
if($("#placeGrid") && window.db){
  db.from("settings").select("key,value").in("key",["explore_overrides","explore_photos"])
    .then(({data})=>{ (data||[]).forEach(r=>{ try{
        if(r.key==="explore_overrides" && r.value) applyExploreOverrides(JSON.parse(r.value));
        if(r.key==="explore_photos" && r.value) Object.assign(EXPLORE_PHOTOS, JSON.parse(r.value));
      }catch(e){} }); renderPlaces(); })
    .catch(()=>renderPlaces());
} else { renderPlaces(); }

// gazette — real recovered posts; each card opens a full post page
const slugify=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64);
const postBodyHtml=t=>"<p>"+esc((t||"").trim()).replace(/\n{2,}/g,"</p><p>").replace(/\n/g,"<br>")+"</p>";
if($("#gazetteGrid")){
  $("#gazetteGrid").innerHTML=GAZETTE.map(g=>{ const url="post.html?p="+slugify(g.title); const ex=(g.excerpt||g.body||"").trim().slice(0,180);
    return `<article class="post">
    ${g.img?`<a class="post-media" href="${url}"><img class="post-photo" src="${g.img}" alt="${esc(g.title)}" loading="lazy" onerror="this.closest('.post-media').style.display='none'"></a>`:""}
    <div class="post-body"><span class="kicker">${esc(g.cat)}</span><h4><a href="${url}">${esc(g.title)}</a></h4>
    <div class="post-meta"><span>${esc(g.date)}</span></div>
    <div class="post-text clamp">${esc(ex)}${ex.length>=180?"…":""}</div>
    <a class="show-more" href="${url}">Read more →</a></div></article>`; }).join("");
}

// single blog post page (post.html?p=slug)
if($("#postDetail")){
  const params=new URLSearchParams(location.search), pid=params.get("id");
  // Inline links in the post body, written markdown-style: [text](url). Opens in a new tab.
  const fixUrl=u=>u.replace(/^(https?:\/\/)+/i,m=>m.slice(m.toLowerCase().lastIndexOf("http"))); // collapse doubled https://https://
  const mdLinks=s=>s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,txt,url)=>/^(https?:\/\/|\/|mailto:|#|[\w.-]+\.html)/i.test(url)?`<a href="${fixUrl(url)}" target="_blank" rel="noopener">${txt}</a>`:m);
  const paras=t=>(t||"").trim().split(/\n{2,}/).map(x=>`<p>${mdLinks(esc(x.trim()).replace(/\n/g,"<br>"))}</p>`).join("");
  const showPost=o=>{ // {title,cat,date,img,body,link}
    document.title=`${o.title} — Seldovia Blog`;
    const media=o.img?`<div class="post-detail-media"><a href="${esc(o.img)}" target="_blank" rel="noopener" title="View full size"><img src="${esc(o.img)}" alt="${esc(o.title)}" onerror="this.closest('.post-detail-media').style.display='none'"></a></div>`:"";
    const linkBtn=o.link?`<p style="margin-top:1.6rem"><a class="btn btn-primary" href="${esc(o.link)}" target="_blank" rel="noopener">Visit website ↗</a></p>`:"";
    $("#postDetail").innerHTML=`
      <a class="back-link" href="gazette.html">← All posts</a>
      ${media}
      <span class="eyebrow" style="margin-top:1.2rem">${esc(o.cat||"Blog")}</span>
      <h1 style="margin:.15rem 0;font-family:var(--serif)">${esc(o.title)}</h1>
      <div class="listing-city">${esc(o.date)}</div>
      <div class="listing-desc" style="margin-top:1.3rem">${paras(o.body)}</div>
      ${linkBtn}
      <p style="margin-top:2rem"><a class="btn btn-ghost" href="gazette.html">← Back to the Seldovia Blog</a></p>`;
  };
  if(pid && window.db){
    const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    db.from("posts").select("*").eq("id",pid).maybeSingle().then(({data})=>{
      if(!data){ $("#postDetail").innerHTML=`<a class="back-link" href="gazette.html">← All posts</a><p style="margin-top:1rem">That post could not be found.</p>`; return; }
      let date=""; if(data.post_date){ const [y,m,d]=data.post_date.split("-"); date=`${MON[+m-1]} ${+d}, ${y}`; }
      showPost({ title:data.title, cat:data.category, date, img:data.image_url, body:data.body||data.excerpt, link:data.link });
    }).catch(()=>{});
  } else {
    const want=params.get("p");
    const post=GAZETTE.find(g=>slugify(g.title)===want)||GAZETTE[0];
    showPost({ title:post.title, cat:post.cat, date:post.date, img:post.img, body:post.body||post.excerpt });
  }
}

// gallery
if($("#masonry")) $("#masonry").innerHTML=GALLERY.map((im,i)=>{
  const img=`<img src="${im.img}" alt="${esc(im.cap)}" loading="lazy" width="300" height="${im.h}">`;
  return `<figure tabindex="0" data-idx="${i}">${img}<figcaption>${esc(im.cap)}</figcaption></figure>`;}).join("");

// real estate listings
if($("#reGrid")) $("#reGrid").innerHTML=LISTINGS.map((l,i)=>`
  <a class="place" href="listing.html?id=${encodeURIComponent(l.slug)}"><div class="place-media"><img class="place-photo" src="${(window.LISTING_PHOTOS&&LISTING_PHOTOS[l.slug]&&LISTING_PHOTOS[l.slug][0])||l.img}" alt="${esc(l.addr)}" loading="lazy" width="600" height="400" onerror="this.closest('.place-media').classList.add('place-media-blank');this.remove()"><span class="badge-open">${esc(l.status)}</span></div>
  <div class="place-body">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.6rem"><span class="price" style="font-size:1.15rem">${esc(l.price)}</span><span style="font-size:.82rem;color:var(--accent-ink);font-weight:700">Details →</span></div>
    <h4>${esc(l.addr)}</h4>
    <div class="place-loc" style="gap:1rem"><span><b style="color:var(--heading)">${esc(l.beds)}</b> bd</span><span><b style="color:var(--heading)">${esc(l.baths)}</b> ba</span><span><b style="color:var(--heading)">${esc(l.sqft)}</b> sqft</span></div>
  </div></a>`).join("");

// listings carousel — 3 per view, arrow navigation
if($("#reGrid")){
  const track=$("#reGrid"), car=track.closest(".re-carousel");
  if(car){
    const prev=car.querySelector(".car-prev"), next=car.querySelector(".car-next");
    const update=()=>{const max=track.scrollWidth-track.clientWidth-2; prev.hidden=track.scrollLeft<=2; next.hidden=track.scrollLeft>=max;};
    prev.addEventListener("click",()=>track.scrollBy({left:-track.clientWidth,behavior:"smooth"}));
    next.addEventListener("click",()=>track.scrollBy({left:track.clientWidth,behavior:"smooth"}));
    track.addEventListener("scroll",update,{passive:true});
    window.addEventListener("resize",update);
    update();
  }
}

// single listing detail page (listing.html?id=slug)
if($("#listingDetail") && LISTINGS.length){
  const id=new URLSearchParams(location.search).get("id");
  const l=LISTINGS.find(x=>x.slug===id)||LISTINGS[0];
  const lPhotos=(window.LISTING_PHOTOS&&LISTING_PHOTOS[l.slug])||null;
  const heroImg=lPhotos?lPhotos[0]:l.img;
  const chips=a=>a&&a.length?`<div class="spec-chips">${a.map(x=>`<span class="spec-chip">${esc(x)}</span>`).join("")}</div>`:"";
  const dl=(label,val)=>val?`<div class="dl-row"><dt>${esc(label)}</dt><dd>${esc(val)}</dd></div>`:"";
  const descHtml=(l.desc||"").split(/\n\n+/).map(p=>`<p>${esc(p.trim())}</p>`).join("");
  document.title=`${l.addr} — Seldovia Property`;
  $("#listingDetail").innerHTML=`
    <a class="back-link" href="real-estate.html">← All listings</a>
    <div class="listing-hero"><img src="${heroImg}" alt="${esc(l.addr)}" onerror="this.closest('.listing-hero').classList.add('place-media-blank');this.remove()"><span class="badge-open">${esc(l.status)}</span></div>
    <div class="listing-top">
      <div><div class="price" style="font-size:1.9rem">${esc(l.price)}</div><h1 style="margin:.15rem 0 0">${esc(l.addr)}</h1><div class="listing-city">${esc(l.city||"Seldovia, AK")}</div></div>
      <a class="btn btn-primary" href="contact.html">Ask about this home</a>
    </div>
    <div class="listing-stats">
      <div><b>${esc(l.beds)}</b><span>Beds</span></div>
      <div><b>${esc(l.baths)}</b><span>Baths</span></div>
      <div><b>${esc(l.sqft)}</b><span>Sq Ft</span></div>
      ${l.ppsf?`<div><b>${esc(l.ppsf)}</b><span>Per Sq Ft</span></div>`:""}
      ${l.payment?`<div><b>${esc(l.payment)}</b><span>Est. payment</span></div>`:""}
    </div>
    ${l.highlights?`<h3 class="listing-h">Highlights</h3>${chips(l.highlights)}`:""}
    ${lPhotos&&lPhotos.length>1?`<h3 class="listing-h">Photos</h3><div class="listing-gallery">${lPhotos.slice(1).map(u=>`<img src="${u}" loading="lazy" alt="${esc(l.addr)}">`).join("")}</div>`:""}
    ${l.desc?`<h3 class="listing-h">About this home</h3><div class="listing-desc">${descHtml}</div>`:""}
    ${(l.homeType||l.yearBuilt||l.lot||l.zoning)?`<h3 class="listing-h">Home details</h3>
      <dl class="listing-dl">${dl("Home type",l.homeType)}${dl("Year built",l.yearBuilt)}${dl("Lot",l.lot)}${dl("Zoning",l.zoning)}${dl("Interior",l.sqft?l.sqft+" sq ft":"")}</dl>
      ${l.design?chips(l.design):""}`:""}
    ${l.features?`<h3 class="listing-h">Property features</h3><ul class="listing-schools">${l.features.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
    ${l.schools?`<h3 class="listing-h">Schools</h3><ul class="listing-schools">${l.schools.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
    <div class="re-cta" style="margin-top:2.2rem"><div><h3>Interested in ${esc(l.addr)}?</h3><p>Reach out to Jenny for a showing, more photos, or the full disclosure packet.</p></div><a class="btn btn-primary" href="contact.html">Contact Jenny</a></div>`;
}

// community celebrations — from neighbors who chose to share a birthday/anniversary
if($("#celebrations")){
  const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let nowMonth=-1; try{nowMonth=new Date().getMonth();}catch(e){}
  const items=[];
  MEMBERS.forEach(m=>{
    if(m.bday)items.push({name:m.name,label:m.bday,icon:"🎂",kind:"Birthday",mo:MO.indexOf(m.bday.split(" ")[0])});
    if(m.anniv)items.push({name:m.name,label:m.anniv,icon:"💍",kind:"Anniversary",mo:MO.indexOf(m.anniv.split(" ")[0])});
  });
  items.sort((a,b)=>a.mo-b.mo);
  if(items.length){
    const thisMonth=items.filter(i=>i.mo===nowMonth);
    const sub=thisMonth.length?`${MO[nowMonth]} has ${thisMonth.length} to celebrate`:"Birthdays & anniversaries neighbors chose to share";
    $("#celebrations").innerHTML=`<div class="cel-head"><h3>🎉 Community celebrations</h3><span class="cel-sub">${esc(sub)}</span></div>
      <div class="cel-row">${items.map(i=>`<div class="cel-card ${i.mo===nowMonth?'cel-now':''}"><span class="cel-emoji">${i.icon}</span><div class="d-main"><div class="cel-name">${esc(i.name)}</div><div class="cel-date">${esc(i.kind)} · ${esc(i.label)}</div></div></div>`).join("")}</div>`;
  }
}

// directory / phone book — community members + businesses, privacy-first
if($("#dirList")){
  const PEOPLE=MEMBERS.map(m=>({...m,type:"person"}));
  const BIZ=DIRECTORY.map(d=>({...d,type:"biz"})).sort((a,b)=>a.name.localeCompare(b.name));
  let ALL=[...PEOPLE,...BIZ];
  // Phone-book category chips (Jenny's order/labels). Organization vs Government split the "life" key.
  const CATL=[
    {label:"Lodging",         test:r=>r.k==="stay"},
    {label:"Eating",          test:r=>r.k==="eat"},
    {label:"Travel",          test:r=>r.k==="travel"},
    {label:"Shopping",        test:r=>r.k==="shop"},
    {label:"Activities",      test:r=>r.k==="activities"},
    // "Life in Seldovia" chip removed per Jenny — those service entries are just businesses (show under Businesses/All).
    {label:"Organization",    test:r=>r.k==="life" && !GOVT_BIZ.has(r.name)},
    {label:"Government",       test:r=>r.k==="life" && GOVT_BIZ.has(r.name)},
  ];
  const CHIPS=["All","People","Businesses",...CATL.map(c=>c.label)];
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
  const bizCard=d=>{
    const bits=[]; if(d.phone)bits.push(`<a href="tel:${d.phone.replace(/[^\d]/g,"")}">${esc(d.phone)}</a>`); bits.push("Seldovia, AK");
    const site=d.url?`<div class="d-site"><a href="${esc(d.url)}" target="_blank" rel="noopener">Visit website ↗</a></div>`:"";
    return `<div class="dir-item ${d.spon?'featured':''}"><div class="d-ico">${esc(d.name[0])}</div>
      <div class="d-main"><div class="d-cat">${esc(d.cat)}</div><h4>${esc(d.name)}</h4><div class="d-contact">${bits.join(" · ")}</div>${site}</div>
      ${d.spon?'<span class="spon-flag">★ Sponsor</span>':''}</div>`;};

  const renderDir=()=>{const q=dirQuery.trim().toLowerCase(); const qd=q.replace(/\D/g,"");
    const catDef=CATL.find(c=>c.label===dirCat);
    const rows=ALL.filter(r=>{
      const inCat = dirCat==="All" || (dirCat==="People"&&r.type==="person") || (dirCat==="Businesses"&&r.type==="biz") || (r.type==="biz"&&catDef&&catDef.test(r));
      const inQ = !q || r.name.toLowerCase().includes(q) || (r.cat||"").toLowerCase().includes(q) || (r.addr||"").toLowerCase().includes(q) || (qd.length>=3 && (r.phone||"").replace(/\D/g,"").includes(qd));
      return inCat && inQ;
    });
    const empty = (!q && (dirCat==="People"||(dirCat==="All"&&!PEOPLE.length)) && !PEOPLE.length)
      ? `<div class="dir-empty">The neighbor listings are just getting started — <a href="directory-add.html">add your household</a> and share only what you're comfortable with.</div>`
      : `<div class="dir-empty">No matches — try another word or category.</div>`;
    $("#dirList").innerHTML=rows.length?rows.map(r=>r.type==="person"?personCard(r):bizCard(r)).join(""):empty;};
  renderDir();
  // Jenny #29: fold approved neighbor/business submissions into the phone book (respecting each person's privacy choices).
  if(window.db){ db.from("directory_submissions").select("*").eq("status","approved").then(({data})=>{
    if(!data||!data.length) return;
    const subs=data.map(s=>{ const d=s.data||{};
      return s.listing_type==="business"
        ? {type:"biz", name:s.display_name||d.business_name, cat:d.business_category||"Business", phone:d.business_phone||"", spon:false}
        : {type:"person", name:s.display_name||d.name, photo:s.photo_url||"", addr:(d.address_privacy==="public"&&d.address)?d.address:"", phone:(d.phone_privacy==="public"&&d.phone)?d.phone:""};
    }).filter(x=>x.name);
    const sp=subs.filter(x=>x.type==="person"), sb=subs.filter(x=>x.type==="biz");
    ALL=[...PEOPLE, ...sp, ...[...BIZ, ...sb].sort((a,b)=>a.name.localeCompare(b.name))];
    renderDir();
  }).catch(()=>{}); }
  requestAnimationFrame(()=>scrollToFind("#dirList"));
  $("#dirChips").addEventListener("click",e=>{const b=e.target.closest(".chip"); if(!b)return; dirCat=b.dataset.cat; $$("#dirChips .chip").forEach(c=>c.setAttribute("aria-pressed",c===b)); renderDir();});
  $("#dirSearch").addEventListener("input",e=>{dirQuery=e.target.value; renderDir();});
}

// bulletin
if($("#board")) $("#board").innerHTML=NOTES.map(n=>`<article class="note"><span class="n-cat">${esc(n.cat)}</span><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p><div class="n-foot"><span>${esc(n.by)}</span><span>${esc(n.when)}</span></div></article>`).join("");

// testimonials
// Renders only when there are REAL testimonials; the section hides itself while empty.
if($("#quoteGrid")){
  if(!TESTIMONIALS.length){ const sec=$("#quoteGrid").closest("section"); if(sec) sec.style.display="none"; }
  else {
    const cards=TESTIMONIALS.map(t=>`<div class="quote"><span class="qmark">&rdquo;</span><div class="quote-head"><span class="avatar" style="background:${t.c}">${esc(t.name[0])}</span><span><b>${esc(t.name)}</b><span>${esc(t.role)}</span></span></div><p>${esc(t.t)}</p></div>`).join("");
    // Jenny #14: testimonials scroll by gently (pauses on hover). Duplicated for a seamless loop.
    $("#quoteGrid").className="quote-strip";
    $("#quoteGrid").innerHTML=`<div class="quote-track">${cards}${cards}</div>`;
  }
}

// sponsors
if($("#sponsorTrack")){const spHTML=SPONSORS.map(s=>{const tag=s.url?"a":"div"; const attr=s.url?` href="${s.url}" target="_blank" rel="noopener"`:""; return `<${tag} class="sponsor sponsor-ad"${attr} aria-label="${esc(s.name)}"><img src="images/ads/${s.img}" alt="${esc(s.name)}" loading="lazy"></${tag}>`;}).join(""); $("#sponsorTrack").innerHTML=spHTML+spHTML;}

// home photo gallery (auto-scroll)
const galFig=(g,i)=>`<figure class="gallery-photo" tabindex="0" data-idx="${i}"><img src="${g.img}" alt="${esc(g.cap)}" loading="lazy" width="600" height="450"><figcaption>${esc(g.cap)}</figcaption></figure>`;
if($("#galleryTrack")){const gHTML=GALLERY.map((g,i)=>galFig(g,i)).join(""); $("#galleryTrack").innerHTML=gHTML+gHTML;}
if($("#galleryTrack2")){const gHTML=GALLERY.map((g,i)=>galFig(g,i)).reverse().join(""); $("#galleryTrack2").innerHTML=gHTML+gHTML;}
window.GALLERY=GALLERY; window.galFig=galFig; // home-gallery.js swaps in real photos from the DB

// gallery lightbox — click any gallery photo to view it large, with prev/next
if($("#galleryTrack")||$("#masonry")){
  document.body.insertAdjacentHTML("beforeend", `<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-hidden="true">
    <button class="lb-close" aria-label="Close">&#10005;</button>
    <button class="lb-nav lb-prev" aria-label="Previous photo">&#8249;</button>
    <figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>
    <button class="lb-nav lb-next" aria-label="Next photo">&#8250;</button>
  </div>`);
  const lb=$("#lightbox"), lbImg=lb.querySelector(".lb-img"), lbCap=lb.querySelector(".lb-cap");
  let cur=0;
  const show=i=>{ cur=(i+GALLERY.length)%GALLERY.length; const g=GALLERY[cur]; lbImg.src=g.img; lbImg.alt=g.cap; lbCap.textContent=g.cap; lb.classList.add("open"); lb.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; };
  const close=()=>{ lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); document.body.style.overflow=""; };
  lb.querySelector(".lb-close").addEventListener("click",close);
  lb.querySelector(".lb-prev").addEventListener("click",e=>{e.stopPropagation(); show(cur-1);});
  lb.querySelector(".lb-next").addEventListener("click",e=>{e.stopPropagation(); show(cur+1);});
  lb.addEventListener("click",e=>{ if(e.target===lb||e.target.classList.contains("lb-fig")) close(); });
  document.addEventListener("keydown",e=>{ if(!lb.classList.contains("open"))return; if(e.key==="Escape")close(); else if(e.key==="ArrowLeft")show(cur-1); else if(e.key==="ArrowRight")show(cur+1); });
  document.addEventListener("click",e=>{ const fig=e.target.closest(".gallery-photo,#masonry figure"); if(fig&&fig.dataset.idx!=null) show(+fig.dataset.idx); });
  document.addEventListener("keydown",e=>{ if(e.key!=="Enter")return; const fig=e.target.closest&&e.target.closest(".gallery-photo,#masonry figure"); if(fig&&fig.dataset.idx!=null) show(+fig.dataset.idx); });
}

/* ============================================================ CALENDAR ============================================================ */
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const parseD=s=>{const[y,m,d]=s.split("-").map(Number); return{y,m:m-1,d};};
const fmtDayLabel=s=>{const{y,m,d}=parseD(s); const dt=new Date(y,m,d); return `${DOW[dt.getDay()]}, ${MONTHS[m]} ${d}`;};
const fmt12=t=>{if(!t)return "All day"; let[h,mi]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; h=h%12||12; return `${h}:${String(mi).padStart(2,"0")} ${ap}`;};
/* The community calendar page is now rendered by calendar.js from the real Google
   Calendar (agenda + month grid), falling back to the Google embed. EVENTS below is
   kept only to feed the global search index. */
document.addEventListener("click",e=>{const b=e.target.closest(".add-cal"); if(b){e.preventDefault(); toast(`"${b.dataset.title}" — saved to your calendar (demo)`);}});

/* ============================================================ GLOBAL SEARCH ============================================================ */
const INDEX=[
  ...PLACES.map(p=>({type:"Place",title:p.name,desc:p.phone?`${p.cat} · ${p.phone}`:p.cat,href:"explore.html?cat="+p.key+"&find="+encodeURIComponent(p.name),kw:p.cat+" "+p.key})),
  ...LISTINGS.map(l=>({type:"Real Estate",title:l.name,desc:l.cat,href:"real-estate.html",kw:l.cat})),
  ...CATEGORIES.map(c=>({type:"Category",title:c.b,desc:c.s,href:"explore.html?cat="+c.key,kw:c.key+" "+({about:"about history location story seldovia town kachemak bay herring",travel:"travel ferry air taxi water taxi plane amhs smokey bay mako halibut cove get to seldovia transportation",stay:"stay sleep lodging hotel inn cabin lodge rental bnb bed suites vacation",eat:"food eat restaurant cafe bar grill grocery store meal dine breakfast lunch dinner drinks",shop:"shop store gift gifts nursery plants boutique sea glass grocery",activities:"activities tour charter fishing diving kayak trail hike beach rentals things to do outdoors",services:"services construction salon marine fuel real estate property care trades help",life:"life community organization tribe city church school library clinic emergency police post office chamber"}[c.key]||"")})),
  ...EVENTS.map(e=>({type:"Event",title:e.title,desc:`${fmtDayLabel(e.d)} · ${e.where}`,href:"calendar.html",kw:e.cat+" "+e.where})),
  ...DIRECTORY.map(d=>({type:"Directory",title:d.name,desc:`${d.cat} · ${d.phone}`,href:"phone-book.html?find="+encodeURIComponent(d.name),kw:d.cat})),
  ...NOTES.map(n=>({type:"News",title:n.title,desc:n.body,href:"gazette.html",kw:n.cat})),
  {type:"Guide",title:"Getting to Seldovia",desc:"Ferry, floatplane, and water-taxi options from Homer.",href:"explore.html",kw:"ferry floatplane water taxi homer travel arrive"},
  {type:"Info",title:"Ferry schedule (AMHS)",desc:"Alaska Marine Highway sailings to and from Homer.",href:"calendar.html",kw:"ferry amhs tustumena schedule boat"},
];
function scoreMatch(it,q){const hay=(it.title+" "+it.desc+" "+it.kw+" "+it.type).toLowerCase(); let s=0;
  q.forEach(tok=>{if(!tok)return; const t=it.title.toLowerCase(); if(t.startsWith(tok))s+=6; else if(t.includes(tok))s+=4; if(hay.includes(tok))s+=2; else if(hay.split(/\W+/).some(w=>w.startsWith(tok)))s+=1;});
  // Surface categories/places/listings above blog posts for the same query (e.g. "food" -> Where to Eat).
  if(s>0)s+=({Category:5,Place:3,"Real Estate":3,Directory:1,Info:2,Guide:2}[it.type]||0); return s;}
function runSearch(raw){const q=raw.toLowerCase().trim().split(/\s+/).filter(Boolean); if(!q.length)return[]; return INDEX.map(it=>({it,s:scoreMatch(it,q)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,8).map(x=>x.it);}
function hl(text,raw){const q=raw.trim().split(/\s+/).filter(Boolean).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")); if(!q.length)return esc(text); return esc(text).replace(new RegExp("("+q.join("|")+")","ig"),"<mark>$1</mark>");}
// The hero results box is position:fixed so it escapes the hero's overflow:clip (was hidden
// on mobile / clipped on desktop). Anchor it under the search card each time it shows.
function placeBox(box){ if(!box) return;
  const anchor = box.id==="navResults" ? document.getElementById("navSearch") : document.querySelector(".hero-search-card");
  if(!anchor) return; const r=anchor.getBoundingClientRect();
  const w = box.id==="navResults" ? Math.max(r.width, 300) : r.width;
  box.style.position="fixed"; box.style.top=(r.bottom+8)+"px"; box.style.width=w+"px";
  box.style.left = (box.id==="navResults" ? Math.max(8, r.right - w) : r.left) + "px"; }
function renderResults(box,raw){const res=runSearch(raw);
  if(!raw.trim()){box.classList.remove("show"); box.innerHTML=""; return;}
  const allLink=`<a class="r-item r-all" href="search.html?q=${encodeURIComponent(raw.trim())}" role="option"><span class="r-type">All</span><span><span class="r-title">See all results for “${esc(raw.trim())}” →</span></span></a>`;
  if(!res.length){box.innerHTML=`<div class="r-empty">No quick matches for "${esc(raw)}".</div>`+allLink;}
  else box.innerHTML=res.map((r,i)=>`<a class="r-item ${i===0?'active':''}" href="${r.href}" role="option"><span class="r-type">${esc(r.type)}</span><span><span class="r-title">${hl(r.title,raw)}</span><span class="r-desc">${hl(r.desc,raw)}</span></span></a>`).join("")+allLink;
  box.classList.add("show"); placeBox(box);}
function wireSearch(inputId,boxId){const input=document.getElementById(inputId),box=document.getElementById(boxId); if(!input||!box)return; let idx=0;
  input.addEventListener("input",()=>{idx=0; renderResults(box,input.value);});
  input.addEventListener("focus",()=>{if(input.value)renderResults(box,input.value);});
  input.addEventListener("keydown",e=>{const items=$$(".r-item",box);
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault(); if(!items.length)return; idx=e.key==="ArrowDown"?Math.min(idx+1,items.length-1):Math.max(idx-1,0); items.forEach((it,i)=>it.classList.toggle("active",i===idx)); items[idx].scrollIntoView({block:"nearest"});}
    else if(e.key==="Enter"){e.preventDefault(); const v=input.value.trim(); if(v) location.href="search.html?q="+encodeURIComponent(v);}
    else if(e.key==="Escape"){box.classList.remove("show"); input.blur();}});
  box.addEventListener("click",()=>setTimeout(()=>box.classList.remove("show"),60));
  document.addEventListener("click",e=>{if(!input.contains(e.target)&&!box.contains(e.target))box.classList.remove("show");});
  ["scroll","resize"].forEach(ev=>window.addEventListener(ev,()=>{if(box.classList.contains("show"))placeBox(box);},{passive:true}));}
// Float BOTH search dropdowns on <body> so nothing (sticky header stacking context,
// transforms, overflow:clip) can trap or clip them — fixes the top-right nav search
// and the hero search alike.
["heroResults","navResults"].forEach(id=>{ const b=document.getElementById(id); if(b && b.parentElement!==document.body) document.body.appendChild(b); });
wireSearch("navSearch","navResults");
wireSearch("heroSearch","heroResults");
if($("#heroSearchBtn")) $("#heroSearchBtn").addEventListener("click",()=>{const v=$("#heroSearch").value.trim(); if(v) location.href="search.html?q="+encodeURIComponent(v); else $("#heroSearch").focus();});

// ---- Full search RESULTS PAGE (search.html?q=) — static site index + the blog/news archive (DB) ----
if($("#searchResults")){
  const params=new URLSearchParams(location.search);
  const q=(params.get("q")||"").trim();
  const input=$("#searchPageInput"), summary=$("#searchSummary"), box=$("#searchResults");
  if(input) input.value=q;
  document.title = q ? `“${q}” — Search Seldovia.com` : "Search — Seldovia.com";
  const MON3=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const srDate=d=>{ if(!d)return""; const [y,m,day]=String(d).split("-"); return `${MON3[+m-1]} ${+day}, ${y}`; };
  const allStatic=raw=>{const qq=raw.toLowerCase().trim().split(/\s+/).filter(Boolean); if(!qq.length)return[]; return INDEX.map(it=>({it,s:scoreMatch(it,qq)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.it);};
  const groupHTML=(type,items,raw)=>`<section class="sr-group"><h2 class="sr-h">${esc(type)}<span class="sr-count">${items.length}</span></h2>`
    + items.map(r=>`<a class="sr-item" href="${esc(r.href)}"><span class="r-type">${esc(r.type)}</span><span class="sr-main"><span class="r-title">${hl(r.title,raw)}</span>${r.desc?`<span class="r-desc">${hl(String(r.desc),raw)}</span>`:""}</span>${r.date?`<span class="sr-date">${esc(srDate(r.date))}</span>`:""}</a>`).join("")
    + `</section>`;
  if($("#searchPageForm")) $("#searchPageForm").addEventListener("submit",e=>{e.preventDefault(); const v=(input.value||"").trim(); location.href="search.html?q="+encodeURIComponent(v);});
  if(!q){ summary.innerHTML=`<span class="sr-hint">Search for a place, business, event, trail, or anything in Seldovia’s story — including the full news archive.</span>`; }
  else {
    const stat=allStatic(q).filter(r=>r.type!=="News"); // blog/news comes from the DB below
    const ORDER=["Category","Place","Real Estate","Directory","Event","Guide","Info"];
    const groups={}; stat.forEach(r=>{ (groups[r.type]=groups[r.type]||[]).push(r); });
    summary.innerHTML=`<span class="sr-hint">Searching “${esc(q)}”…</span>`;
    const like="%"+q.replace(/[%,()]/g," ")+"%";
    const dbP = window.db ? db.from("posts").select("id,title,excerpt,body,post_date").eq("published",true).or(`title.ilike.${like},body.ilike.${like}`).order("post_date",{ascending:false}).limit(60) : Promise.resolve({data:[]});
    Promise.resolve(dbP).then(r=>(r&&r.data)||[]).catch(()=>[]).then(posts=>{
      const blog=posts.map(p=>({type:"Blog & News",title:p.title,desc:(p.excerpt||String(p.body||"").slice(0,140)),href:"post.html?id="+p.id,date:p.post_date}));
      const total=stat.length+blog.length;
      summary.innerHTML = total ? `<b>${total.toLocaleString()}</b> result${total===1?"":"s"} for <span class="sr-q">“${esc(q)}”</span>` : `No results for <span class="sr-q">“${esc(q)}”</span>. Try “ferry”, “cabin”, or “market”.`;
      let html=""; ORDER.forEach(t=>{ if(groups[t]&&groups[t].length) html+=groupHTML(t,groups[t],q); });
      if(blog.length) html+=groupHTML("Blog & News",blog,q);
      box.innerHTML=html;
    });
  }
}

/* ============================================================ MISC UI ============================================================ */
const drawer=$("#drawer"),menuBtn=$("#menuBtn");
function setDrawer(o){drawer.classList.toggle("open",o); menuBtn.setAttribute("aria-expanded",o); drawer.setAttribute("aria-hidden",!o);}
menuBtn.addEventListener("click",()=>setDrawer(true));
drawer.addEventListener("click",e=>{if(e.target.matches("[data-close], [data-close] *"))setDrawer(false);});
document.addEventListener("keydown",e=>{if(e.key==="Escape")setDrawer(false);});
if($("#contactForm")) $("#contactForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const form=e.target;
  if(form.website && form.website.value) return; // honeypot: silently drop bots
  const name=$("#cName").value.trim(), email=$("#cEmail").value.trim(); let msg=$("#cMsg").value.trim();
  const topic=$("#cTopic")?$("#cTopic").value:"";
  if(!name||!email||!msg){ toast("Please add your name, email, and a message."); return; }
  const btn=form.querySelector('button[type="submit"]'); if(btn){ btn.disabled=true; }
  let ok=false;
  try{
    // optional attachment (flier / photo) -> public uploads bucket, link appended to the message
    const fileInput=$("#cFile"), file=fileInput && fileInput.files && fileInput.files[0];
    if(file && window.db){
      try{
        const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
        const path=`contact/${Date.now()}-${Math.round(1e6*Math.random())}.${ext}`;
        const {error:upErr}=await db.storage.from("uploads").upload(path,file,{contentType:file.type||"application/octet-stream"});
        if(!upErr){ const {data:pub}=db.storage.from("uploads").getPublicUrl(path); if(pub&&pub.publicUrl) msg+=`\n\nAttachment: ${pub.publicUrl}`; }
      }catch(_){}
    }
    // 1) save to the admin inbox (Supabase)
    if(window.db){ const {error}=await db.from("messages").insert({name,email,topic,message:msg}); if(!error) ok=true; }
    // 2) email Jenny via Web3Forms (if configured)
    const key=window.WEB3FORMS_KEY;
    if(key && key.indexOf("PASTE_")!==0){
      const r=await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
        body:JSON.stringify({access_key:key, subject:`Seldovia.com contact — ${topic||"General"}`, name, email, topic, message:msg, from_name:"Seldovia.com"})});
      if(r.ok) ok=true;
    }
    if(ok){ form.reset(); toast("Thanks! Your message has been sent."); }
    else { toast("Couldn't send just now — please call or email us directly."); }
  }catch(_){ toast("Couldn't send just now — please call or email us directly."); }
  finally{ if(btn) btn.disabled=false; }
});
let toastT; function toast(msg){const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove("show"),2600);}
function tickTime(){try{const s=new Intl.DateTimeFormat("en-US",{timeZone:"America/Anchorage",hour:"numeric",minute:"2-digit"}).format(new Date()); const ft=$("#footTime"); if(ft)ft.textContent=s+" AKT";}catch(_){}}
tickTime(); setInterval(tickTime,30000);
if($("#year")) $("#year").textContent=new Date().getFullYear();

/* Roll the whole site over to the new day at Alaska midnight (daily photo, tides, seasonal
   band, "what's on this week") for pages left open past 12am. Skips the admin, and defers
   if someone is typing in a form so it never interrupts. */
(function(){
  const page=document.body && document.body.getAttribute("data-page");
  if(page==="admin") return;
  function msToAkMidnight(){
    const now=new Date();
    const ak=new Date(now.toLocaleString("en-US",{timeZone:"America/Anchorage"}));
    const next=new Date(ak); next.setHours(24,0,10,0); // 12:00:10am, a touch past midnight
    return Math.max(1000, next-ak);
  }
  setTimeout(function fire(){
    const a=document.activeElement, typing=a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
    if(typing){ setTimeout(fire, 60000); return; }        // wait a minute if they're typing
    location.reload();
  }, msToAkMidnight());
})();
