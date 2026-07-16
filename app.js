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
  ["gazette.html","Jenny's Blog","gazette"],
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
      <div class="foot-col"><h4>Explore</h4><ul><li><a href="explore.html">Directory</a></li><li><a href="gazette.html">Jenny's Blog</a></li><li><a href="gallery.html">Gallery</a></li><li><a href="calendar.html">Calendar</a></li></ul></div>
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
// Jenny's active listings (real). Photos in images/listings/ (optimized). Full detail via listing.html?id=slug.
const LISTINGS=[
 {slug:"230-kachemak-st", addr:"230 Kachemak St", city:"Seldovia, AK 99663", price:"$475,000", beds:"3", baths:"1.5", sqft:"1,122", status:"For Sale", img:"images/listings/230-kachemak-st.jpg",
  ppsf:"$423", payment:"$2,572/mo", homeType:"Single Family", yearBuilt:"1945", lot:"8,712 sq ft (~0.20 ac) — fronts a lagoon/estuary", zoning:"WCR — Waterfront Commercial Residential",
  highlights:["Hot Property","Unobstructed views","Waterfront","Cabin","Fronts a lagoon/estuary","Shed"],
  design:["Cabin","Pillar/Post/Pier foundation","Wood-frame construction","Metal roof","Disposal"],
  schools:["Susan B. English Elementary & Middle School","Susan B. English High School"],
  desc:`Rare opportunity to own one of Seldovia's iconic waterfront properties. Set on approximately 0.20 acres — nearly four times the size of many neighboring lots — this historic Waterfront Commercial Residential property offers unmatched potential. This is an older home that has been remodeled. For the right buyer, it's a chance to preserve a piece of Seldovia's history while creating a lasting legacy.

There are properties you purchase for convenience. Then there are properties you purchase because you know you'll never find another one quite like it. Stretching along Seldovia's iconic waterfront, where the tides rise and fall beneath weathered pilings and fishing skiffs, this property has quietly been part of the town's story for decades. Its location alone is something that simply couldn't be recreated today.

It has served as both a family home and a commercial space. Step inside and you'll find spaces designed around the water. Two main-floor bedrooms greet the morning with sunrise views across the slough, while upstairs a private guest retreat sleeps four with its own exterior entrance — ideal for visiting family or guests — with even a half bath in the attic alongside this room.

The spacious kitchen, complete with two refrigerators, was made for gathering. Just beyond, the generous living room opens through French doors to a deck of more than 400 square feet suspended above the slough. Here you'll watch salmon move with the tide, fishermen cast from the bridge, eagles pass overhead, and the seasons unfold from one of the best seats in town.

The owners have invested in meaningful improvements while preserving the property's rustic character, but this is an older waterfront building and it deserves an owner who understands what that means. For the right person, that investment isn't simply maintenance — it's the privilege of preserving a place that has already stood the test of time.`},

 {slug:"195-lookout-aly", addr:"195 Lookout Aly", city:"Seldovia, AK 99663", price:"$345,000", beds:"2", baths:"1.5", sqft:"1,376", status:"For Sale", img:"images/listings/195-lookout-aly.jpg",
  ppsf:"$251", payment:"$2,209/mo", homeType:"Single Family", yearBuilt:"1963", lot:"10,019 sq ft — level, waterfront, private yard, fronts an inlet", zoning:"WCR — Waterfront Commercial Residential",
  highlights:["Hot Property","Bay view","Fireplace","Fronts an inlet","Private yard","Handicap accessible"],
  design:["Lindal Cedar home","Pillar/Post/Pier & block foundation","Wood-frame construction","Metal roof","Ceiling fan","Fireplace","Bay views","Laminate countertops"],
  features:["Sunny corner lot with slough, Main Street & harbor views","Accessible design with entry ramps","Decks on both sides for sun or shade","Established gardens — salmonberries & raspberries","Rustic 554 sq ft shed/shop","Mature trees for beauty & privacy","Easy walk to harbor, boardwalk, shops, restaurants & airport"],
  schools:["Susan B. English Elementary & Middle School","Susan B. English High School"],
  desc:`Wake up to sunshine, slough, and harbor views from this welcoming corner-lot home in the heart of Seldovia. With 2 bedrooms, 1.5 baths, accessible entry ramps, sunny decks, berry gardens, a rustic workshop, and an easy walk to the harbor, shops, and restaurants, this property offers comfort, convenience, and the relaxed Alaska lifestyle you've been looking for.

Perfectly positioned on a sunny corner lot overlooking the Seldovia Slough, Main Street, and the harbor beyond, this welcoming 1,376 sq ft Lindal Cedar Home offers the convenience of in-town living with peaceful views. Designed with accessibility in mind, the home features spacious living and dining areas and ramps for easy access. Large windows invite natural light inside while offering glimpses of the surrounding trees, gardens, and neighborhood.

Step outside and discover a property that's ready to be enjoyed. Relax with morning coffee on the east-facing deck or evening sunshine on the harbor-facing west deck. Enjoy outdoor spaces on both sides of the home, surrounded by established gardens bursting with salmonberries and raspberries throughout the growing season.

A rustic 554 sq ft workshop provides the perfect place for projects, hobbies, storage, or tinkering. Located just a short walk from the harbor, boardwalk, shops, restaurants, airport, post office, and community amenities, this home offers the best of small-town living with everything close at hand.`},

 {slug:"3108-jakolof-bay-rd", addr:"3108 Jakolof Bay Rd", city:"Seldovia, AK 99663", price:"$219,900", beds:"1", baths:"1", sqft:"768", status:"For Sale", img:"images/listings/3108-jakolof-bay-rd.jpg",
  ppsf:"$286", payment:"$1,250/mo", homeType:"Single Family", yearBuilt:"2000", lot:"3.03 acres — bluff, level, private yard", zoning:"UNZ — Not Zoned", parking:"1-car garage",
  highlights:["Bay view","Private yard","Fireplace","Bluff lot","Wood countertops","Shed"],
  design:["Cabin","Pillar/Post/Pier foundation","Wood-frame construction","Metal roof","Fireplace","Bay views","Wood countertops"],
  features:["3 private acres above Barbara Creek","Sweeping views to Kachemak Bay & the Homer Spit","New kitchen; loft sleeping space","Italian-tile hearth & brand-new Toyo stove","448 sq ft heated shop/garage","Insulated outbuilding — wired for workshop, bunkhouse, or studio","Water catchment system (insulated tank)","4+ cords of firewood cut, split & stacked","Composting toilet (never used) + outhouse with a view"],
  schools:["Susan B. English Elementary & Middle School","Susan B. English High School"],
  desc:`Charming cabin overlooking the Barbara Creek area with sweeping views across Kachemak Bay to the Homer Spit and the twinkling lights of Homer. This cozy, open-concept cabin is warm, bright, and freshly updated — the kind of retreat that instantly feels like home.

The main level features a bright, sunny new kitchen, cozy living area, and bathroom, while the loft above provides a peaceful sleeping space tucked beneath the roofline. The hearth is framed with handsome Italian tile, and a brand-new Toyo stove keeps you warm and comfortable through every season.

Set on three private acres, there's plenty of room to garden, explore, or simply soak in the peace and quiet. Recent tree clearing has opened the property to even more sunshine and enhanced the views. A spacious 448 sq ft heated shop and garage offers excellent space for projects, vehicles, or Alaska gear, and an additional insulated outbuilding is already wired and ready to become a workshop, bunkhouse, studio, or storage.

The cabin is served by a water catchment system, with the tank tucked beneath the home and insulated from the weather. And yes — even the outhouse comes with a view. As an added bonus, more than four cords of firewood have already been cut, split, and stacked, ready to keep the fire crackling from the day you arrive.`},
 {slug:"175-augustine-north-ave", addr:"175 Augustine North Ave", city:"Seldovia, AK 99663", price:"$895,000", beds:"7", baths:"6", sqft:"4,040", status:"For Sale", img:"images/listings/175-augustine-north-ave.jpg",
  ppsf:"$222", payment:"$5,729/mo", homeType:"Single Family", yearBuilt:"1979", lot:"16,553 sq ft — fronts a lagoon/estuary & inlet, ~90 ft of slough frontage", zoning:"WCR — Waterfront Commercial Residential", parking:"2-car attached garage + carport",
  highlights:["Very popular","Turnkey B&B","Bay view","Vaulted ceiling","~90 ft waterfront","Mud room"],
  design:["Cabin","Pillar/Post/Pier foundation","Wood-frame construction","Metal roof","Vaulted ceiling","Fireplace","Tile flooring","Quartz & laminate counters","Dishwasher","Basement"],
  features:["Turnkey Bed & Breakfast — 3 furnished guest suites, each with a private 3/4 bath","Iconic guest cabin built over the water with ~180° slough views","Oversized 668 sq ft garage & shop","Two-story greenhouse with 540+ sq ft of growing space","Smokehouse with hot & cold smokers","Dedicated fish-processing room with freezers","~90 ft of slough frontage — room to expand","Three lots from the Slough Bridge; walk to harbor, shops & airport","Most furniture & equipment convey"],
  schools:["Susan B. English Elementary & Middle School","Susan B. English High School"],
  desc:`A rare opportunity in the heart of Seldovia: a 3,500+ sq ft home and iconic waterfront cabin with 7 bedrooms, 6 baths, a successful turnkey Bed & Breakfast, an oversized garage/shop, a huge two-story greenhouse, a smokehouse, and nearly 90 feet of slough frontage. Breathtaking slough, bay, mountain, and sunset views — with endless residential or business potential.

Waterfront land along the slough is limited, and it's rare to find this much usable space. A large driveway leaves plenty of room for guests, boats, trailers, or RVs, plus the garage, greenhouse, and smokehouse. You're just three lots from the Seldovia Slough Bridge — an easy walk to the harbor, restaurants, shops, and airport.

The views are part of everyday life. From the windows and decks you'll look across the slough toward Seldovia Bay, the surrounding mountains, colorful waterfront homes, and spectacular sunsets. Eagles visit regularly, boats and kayaks drift by, and the changing tides bring a new view every few hours.

Designed with guests in mind while still warm as a full-time home. Upstairs are three beautifully furnished guest suites, each with a private 3/4 bath and sitting area — most with their own decks. Fully furnished and ready to welcome visitors from day one: a true turnkey B&B.

The main level gathers everyone around a vaulted two-story living room, a kitchen and dining nook, and a bright sunroom/formal dining area that opens to a grand deck tucked among mature spruce. Downstairs adds a large bedroom, a family room over the water, laundry, storage, and a dedicated fish-processing room with freezers — this is Alaska, after all.

Just outside: a smokehouse with hot and cold smokers, an oversized 668 sq ft garage/shop, and an impressive two-story greenhouse. And the guest cabin — built on pilings over the water with a wraparound deck and nearly 180° slough views — is the perfect spot for Songs on the Slough in July. Zoned Waterfront Commercial Residential, it can keep welcoming guests, become a family retreat, or simply be enjoyed as one of Seldovia's one-of-a-kind waterfront homes. Much of the furniture and equipment conveys.`},
 {slug:"60187-chesloknu-lease", addr:"60187 Chesloknu Lease", city:"Seldovia, AK 99663", price:"$425,000", beds:"2", baths:"0.5", sqft:"1,631", status:"For Sale", img:"images/listings/60187-chesloknu-lease.jpg",
  ppsf:"$261", payment:"$2,410/mo", homeType:"Single Family (leased parcel)", yearBuilt:"1988", lot:"3.18 acres — fronts a bay/harbor, bluff, steep slope", zoning:"UNZ — Not Zoned", parking:"Private road access",
  highlights:["Bay/harbor front","Rare road access","Log cabin","Vaulted ceiling","Heated spa","Off-grid"],
  design:["Log cabin","Pillar/Post/Pier foundation","Metal roof","Log siding","Vaulted ceiling","Fireplace","Wood countertops"],
  features:["Rare private road access on the Seldovia side of the bay (~8,500 ft road through Native lands)","Custom hand-built log home (1988)","Wraparound deck with ~180° bay & mountain views","~585 sq ft loft with a bright artist's atelier","Off-grid — propane appliances, water hauled to two tanks","Beach access; salmon runs, eagles, otters & bears","Offered fully furnished (excluding personal items)","Seldovia Native Association 55-yr lease to 2042, renewable to 2097"],
  schools:["Susan B. English Elementary & Middle School","Susan B. English High School"],
  desc:`Rare waterfront opportunity on Seldovia Bay. This custom-built log home offers stunning bay, mountain, sunrise, and sunset views from a wraparound deck — and something almost unheard of on the Seldovia side of the bay: private road access, so you can drive right to your door. A spacious open-concept living area, large kitchen, beach access, and authentic off-grid Alaska living.

Built in 1988 by a local log craftsman, the home sits on the shoreline overlooking the head of the Seldovia River, catching both morning and afternoon sun. What truly sets it apart is private road access through Native lands — no other leased properties on this side of the bay offer this. The roughly 8,500-ft access road makes travel from Seldovia easy in the accessible seasons; in winter it's unmaintained, so owners plow or arrive by snow machine, making every trip part of the adventure.

Inside, the home embraces classic Alaska living: a spacious kitchen with a generous pantry and propane appliances. Since electricity isn't available here, the home operates off-grid, with water hauled to two storage tanks. The open-concept living and dining area is highlighted by vaulted ceilings and large windows framing the bay, and the main-floor primary bedroom has large southwest-facing windows for panoramic water and mountain views.

Above is an expansive ~585 sq ft loft running the full length of the cabin — abundant room for guests and hobbies, plus a bright artist's atelier tucked alongside the windows: a peaceful place to paint, write, or simply be inspired by the tides and wildlife. This is the second bedroom.

Life here is defined by the wildlife just outside your door — bald eagles overhead, sea otters in the calm water, and black bears along the shoreline. During the summer pink-salmon run, thousands of fish make their way toward the Seldovia River. Because the property sits at the back of the bay, the water is remarkably quiet, with low tides naturally limiting boat traffic and creating a rare sense of peace and solitude.

Offered fully furnished (excluding personal items and select artwork), it's ready to enjoy from day one — just bring groceries, a fishing pole, and your sense of adventure. The parcel is leased through the Seldovia Native Association on a 55-year lease expiring in 2042, with an option to renew to 2097. (2025 lease ~$3,588; 2025 taxes ~$1,363.)`},
 {slug:"333-anderson-way", addr:"333 Anderson Way", city:"Seldovia, AK 99663", price:"$300,000", beds:"2", baths:"1.5", sqft:"1,120", status:"For Sale", img:"images/listings/333-anderson-way.jpg",
  ppsf:"$268", payment:"$1,628/mo", homeType:"Single Family", yearBuilt:"1992", lot:"30,056 sq ft (~0.69 ac) — three town lots, level", zoning:"C — Commercial", parking:"2-car garage",
  highlights:["Town center","Level lot","768 sq ft shop","Sun-filled","Commercial zoning","Shed"],
  design:["Wood-frame construction","Metal roof","Ceiling fan","Laminate countertops"],
  features:["Three town lots (~0.69 ac) directly across from Susan B. English School","Sun-filled single-level ranch — 2 bd / 1.5 ba","Spacious 768 sq ft shop + 256 sq ft storage shed","Room for an additional building — city water, sewer & power stubbed out","Zoned Commercial — home-business potential","Walk to harbor, shops, restaurants, boardwalk & the ferry dock"],
  schools:["Susan B. English Elementary & Middle School","Susan B. English High School"],
  desc:`Heart-of-town opportunity — three lots (~0.69 acres total) directly across from Susan B. English School. A sun-filled 2-bedroom, 1.5-bath ranch with 1,120 sq ft, a spacious 768 sq ft shop, and a 256 sq ft shed — plus room for an additional building, with city water, sewer, and power already stubbed out. Walk anywhere in minutes.

Imagine living where you can stroll to the harbor, wave to neighbors on the way to the store, and enjoy community events just minutes from your front door — while still having nearly 0.69 acres to call your own. Situated on three town lots, the property is a short walk from downtown shops, restaurants, the harbor, the Alaska Marine Highway dock, and the boardwalk.

The single-level ranch offers comfortable living with two bedrooms and 1.5 baths, and its standout feature is light: from sunrise over the mountains to the evening sun in the west, the home stays bathed in warm, inviting sunshine all day.

The property truly shines with its outbuildings and possibilities. The 768 sq ft shop is ready for woodworking, boat projects, vehicle storage, or a home business, and a 256 sq ft storage building adds even more flexibility. There's also space for an additional building, with utilities already stubbed out.

Large in-town parcels are increasingly rare, and three lots open the door to countless options. Zoned Commercial, there's room to expand gardens, create outdoor entertaining spaces, or pursue a business. Offered as-is, it's an exceptional opportunity to personalize a remarkable in-town setting — as a full-time residence, a seasonal retreat, or an investment in one of Alaska's most charming coastal communities.`},
 {slug:"251-main-st", addr:"251 Main St", city:"Seldovia, AK 99663", price:"$685,000", beds:"3", baths:"3", sqft:"2,240", status:"For Sale", img:"images/listings/251-main-st.jpg",
  ppsf:"$306", payment:"$4,173/mo", homeType:"Single Family / mixed-use", yearBuilt:"1983", lot:"19,166 sq ft — double lot, fronts the harbor, level, private yard", zoning:"CB — Commercial Business", parking:"1-car attached garage + carport",
  highlights:["Harbor front","Ocean view","Storefront + apartment","Vaulted ceiling","Quartz counters","Only harborfront lawn"],
  design:["Wood-frame & concrete-block/stucco","Metal roof","Vaulted ceiling","Fireplace","Tile flooring","Quartz & wood countertops","Dishwasher"],
  features:["Double lot on the Seldovia Small Boat Harbor — the ONLY waterfront grassy lawn","Main Street commercial storefront (gift shop, boutique, or office)","Fully furnished 1-bed waterfront apartment — B&B / rental ready","Upstairs 2-bed, 2-bath home with harbor & mountain views","Chef's kitchen with island & bar sink; water-side master with remodeled ensuite","Rare single-car garage / high-ceiling workshop","Steps from the harbor, shops, restaurants, post office & airport"],
  schools:["Susan B. English Elementary & Middle School","Susan B. English High School"],
  desc:`Double lot on the Seldovia Small Boat Harbor with morning sunrises and evening sunsets — and the ONLY waterfront grassy lawn in town. A spacious 2-bedroom, 2-bath home upstairs, a 1-bedroom full-bath apartment downstairs, and a Main Street storefront, plus a rare single-car garage/shop. Zoned Commercial Business, steps from the bustling harbor and a stone's throw from shops, the airport, and all town amenities — a chance to craft a thriving business while living in coastal comfort upstairs.

The Main Street-facing commercial space offers prime frontage, ideal for a gift shop, retail boutique, or professional office. On the waterfront side, a large patio leads to a fully furnished 1-bedroom apartment — perfect for a B&B or vacation rental — with a newly remodeled kitchen and bath, a queen Murphy bed, and a covered patio for guests to soak in harbor views. All apartment furniture transfers, making it rental-ready from day one.

The surrounding lush lawn — Seldovia's only large lawn on the harbor front — makes a stunning backdrop for weddings, family gatherings, or waterfront entertaining, basking in sun from morning to sunset. The property sits in the heart of the community, between the Linwood Bar & Grill and the Boardwalk Hotel & Otter Cove Ice Cream, with the post office and grocery store right across the street.

Upstairs, a private oasis awaits with expansive harbor, mountain, and waterfront views from a large deck. The bright, open-concept living room flows into a chef's kitchen with solid-surface counters, new appliances, and a grand island with a bar sink. An open dining area under vaulted ceilings, a cozy fireplace, two spacious bedrooms (including a water-side master with a fully remodeled ensuite, 2023–2025), a guest bath, and a large pantry complete the retreat.

The rare single-car garage and high-ceiling workshop is a game-changer — secure storage for kayaks, bikes, a vehicle, ATVs, or canoes, or space for creative projects. Some upstairs furnishings are negotiable (seller's personal items, artwork, gift-shop merchandise, and the golf-cart rental business are not included). Surrounded by a gorgeous grass yard and zoned for commercial success, this is a launchpad for your entrepreneurial dreams in Seldovia's coastal heart.`}
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
  <a class="place" href="listing.html?id=${encodeURIComponent(l.slug)}"><div class="place-media"><img class="place-photo" src="${l.img}" alt="${esc(l.addr)}" loading="lazy" width="600" height="400" onerror="this.closest('.place-media').classList.add('place-media-blank');this.remove()"><span class="badge-open">${esc(l.status)}</span></div>
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
if($("#listingDetail")){
  const id=new URLSearchParams(location.search).get("id");
  const l=LISTINGS.find(x=>x.slug===id)||LISTINGS[0];
  const chips=a=>a&&a.length?`<div class="spec-chips">${a.map(x=>`<span class="spec-chip">${esc(x)}</span>`).join("")}</div>`:"";
  const dl=(label,val)=>val?`<div class="dl-row"><dt>${esc(label)}</dt><dd>${esc(val)}</dd></div>`:"";
  const descHtml=(l.desc||"").split(/\n\n+/).map(p=>`<p>${esc(p.trim())}</p>`).join("");
  document.title=`${l.addr} — Seldovia Property`;
  $("#listingDetail").innerHTML=`
    <a class="back-link" href="real-estate.html">← All listings</a>
    <div class="listing-hero"><img src="${l.img}" alt="${esc(l.addr)}" onerror="this.closest('.listing-hero').classList.add('place-media-blank');this.remove()"><span class="badge-open">${esc(l.status)}</span></div>
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
  ...GAZETTE.map(g=>({type:"Jenny's Blog",title:g.title,desc:g.excerpt,href:"gazette.html",kw:g.cat})),
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
