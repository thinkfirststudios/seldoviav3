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
  if(!document.querySelector('link[rel="manifest"]')) add("manifest","manifest.json");
  add("apple-touch-icon","images/icon-180.png");
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
    <a class="brand" href="index.html" aria-label="Seldovia.com home">
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
const CATEGORIES=[{b:"Stay",s:"Lodges & cabins",key:"lodging"},{b:"Eat & Drink",s:"Dining & cafés",key:"dining"},{b:"Charters & Tours",s:"On the water",key:"charters"},{b:"Cafés",s:"Coffee & bakery",key:"dining"},{b:"Arts & Galleries",s:"Local makers",key:"arts"},{b:"Outdoors & Trails",s:"Hikes & beaches",key:"outdoors"},{b:"Beauty & Wellness",s:"Spa & self-care",key:"wellness"},{b:"Events",s:"What's on",key:"events"}];
// REAL Seldovia places — sourced from the existing seldovia.com business directory.
// No star ratings or review counts: we don't have real review data, so we don't invent it.
const PLACES=[
 {name:"Boardwalk Hotel",cat:"Hotel",key:"lodging",phone:"(907) 234-7816",url:"https://www.SeldoviaHotel.com"},
 {name:"Sea Parrot Inn",cat:"Inn",key:"lodging",phone:"(844) 377-7829",url:"https://www.seaparrotinn.com"},
 {name:"Seldovia Suites",cat:"Lodging",key:"lodging",phone:"(907) 234-3700"},
 {name:"Between Beaches",cat:"Lodging",key:"lodging",phone:"(907) 290-6785"},
 {name:"Alaska Dancing Eagles Cabin Rental",cat:"Cabin Rental",key:"lodging",phone:"(907) 360-6363",url:"https://www.dancingeagles.com"},
 {name:"Jack and Aiva's Restaurant",cat:"Restaurant",key:"dining",phone:"(907) 234-7440"},
 {name:"Thyme on the Boardwalk",cat:"Dining",key:"dining",phone:"(907) 440-2213",url:"https://www.ThymeOnTheBoardwalk.com"},
 {name:"Linwood Bar & Grill",cat:"Bar & Grill",key:"dining"},
 {name:"Crabpot Grocery",cat:"Grocery",key:"dining",phone:"(907) 234-7435"},
 {name:"Alaska Free Diver",cat:"Charters & Tours",key:"charters",phone:"(907) 205-7963",url:"https://www.AlaskaFreeDiver.com"},
 {name:"Seldovia Fishing Adventures",cat:"Fishing Charters",key:"charters",phone:"(907) 234-7417",url:"https://www.fishhalibut.com"},
 {name:"Mako's Water Taxi",cat:"Water Taxi",key:"charters",phone:"(907) 235-9055"},
 {name:"Otterbahn Trail",cat:"Trail",key:"outdoors"},
 {name:"Outside Beach Park",cat:"Beach & Park",key:"outdoors"},
 {name:"Seldovia Sea Glass",cat:"Local Art",key:"arts"},
 {name:"Seldovia Outdoor Rentals & Gifts",cat:"Gifts & Rentals",key:"arts",phone:"(907) 302-0320"}
];
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
 {title:"230 Kachemak Street — a historic waterfront legacy",excerpt:"One of Seldovia's iconic historic waterfront properties — approximately 0.20 acres, nearly 4× larger than many neighboring waterfront lots.",date:"Jul 15, 2026",read:"1 min",cat:"Real Estate",img:"images/listings/230-kachemak-st.jpg",body:`📍 230 Kachemak Street, Seldovia, AK 99663
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
 {title:"195 Lookout Aly — sunny corner lot with slough & harbor views",excerpt:"A charming 1,376 sq. ft. Lindal Cedar Home on a sunny corner lot overlooking Seldovia Slough, Main Street & the harbor beyond.",date:"Jul 14, 2026",read:"1 min",cat:"Real Estate",img:"images/listings/195-lookout-aly.jpg",body:`📍 195 Lookout Aly, Seldovia, AK 99663
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
 {title:"New listing: 3108 Jakolof Bay Road",excerpt:"A cozy open-concept cabin on 3 private acres overlooking the Barbara Creek area, with breathtaking views of Kachemak Bay, the Homer Spit & the lights of Homer.",date:"Jul 3, 2026",read:"1 min",cat:"Real Estate",img:"images/listings/3108-jakolof-bay-rd.jpg",body:`📍 3108 Jakolof Bay Road, Seldovia, AK 99663
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
 {title:"333 Anderson Way — Heart-of-Town Seldovia Location",excerpt:"Three town lots (0.69 acres total), a sun-filled ranch home, a 768 sq ft shop, and commercial zoning with expansion potential.",date:"Jun 8, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-06-08_02.jpg",body:`📍 333 Anderson Way Seldovia, AK 99663
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
 {title:"60187 Chesloknu Lease — Waterfront Seldovia Bay Location",excerpt:"A custom-built log home with rare private road access, bay and mountain views, an expansive loft and artist's atelier, and beach access.",date:"Jun 8, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-06-08_01.jpg",body:`📍 60187 Chesloknu Lease Seldovia, AK 99663
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
 {title:"A global celebration of one of the most iconic and versatile dishes!",excerpt:"Even in Seldovia, it's the kind of comfort food that just hits the spot after a long day—simple, satisfying, and always a favorite!",date:"May 28, 2026",read:"1 min",cat:"Community",img:"",body:`A global celebration of one of the most iconic and versatile dishes!

Even in Seldovia, it's the kind of comfort food that just hits the spot after a long day—simple, satisfying, and always a favorite!

Wanna have a onion smash burger? That sounds soooo good!`},
 {title:"As a resident of Seldovia for almost 24 years, there has not been a time without Jim in it.",excerpt:"His bright eyes and tender heart have always been a welcome part of every interaction.",date:"May 28, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-28.jpg",body:`As a resident of Seldovia for almost 24 years, there has not been a time without Jim in it. His bright eyes and tender heart have always been a welcome part of every interaction, whether at the dump, talking through the window of his big equipment, sitting at a local restaurant, or stopping by to see the status of his beets and flourishing garden.

Jim was on speed dial for me as he was the "go to" for any client needing dirt work, driveways and help with septic, pilings or moving big things… He is leaving a huge void in our personal and professional worlds and our hearts are broken with this great loss to our entire community.

Our hearts are with the entire Hopkins family – rest in peace Jim – we love you!`},
 {title:"Aside from the MV Tustumena that serves the broader Alaska coastline, we're especially grateful here in Seldovia for the Seldovia Bay Ferry.",excerpt:"Our daily lifeline across Kachemak Bay.",date:"May 27, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-05-27_1.jpg",body:`Aside from the MV Tustumena that serves the broader Alaska coastline, we're especially grateful here in Seldovia for the Seldovia Bay Ferry, our daily lifeline across Kachemak Bay.

Living in Seldovia means understanding that the bay isn't a barrier, it's a lifeline. And the Seldovia Bay Ferry is one of the most important threads holding that lifeline together, day after day, trip after trip.`},
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
 {title:"Congratulations to the seller & buyer! This property is now officially under contract!",excerpt:"A rare property like this is more than just land, it's a front-row seat to one of the most beautiful stretches of coastline anywhere.",date:"May 21, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-05-21_2.jpg",body:`Congratulations to the seller & buyer! This property is now officially under contract! A rare property like this is more than just land, it's a front-row seat to one of the most beautiful stretches of coastline anywhere. 😊`},
 {title:"Are you team sweet, herbal, or black?",excerpt:"In Seldovia, a simple cup of tea can feel like a pause in the day, something warm in your hands after time outside.",date:"May 21, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-21.jpg",body:`Are you team sweet, herbal, or black?

In Seldovia, a simple cup of tea can feel like a pause in the day, something warm in your hands after time outside, or a slow start to the morning while everything is still quiet.

Happy International Tea Day!`},
 {title:"Today we celebrate more than a milestone, we celebrate the hard work, growth, and determination that brought you here.",excerpt:"Congratulations, graduates! Your future is just beginning.",date:"May 19, 2026",read:"1 min",cat:"Community",img:"images/gazette/2026-05-19_2.jpg",body:`Today we celebrate more than a milestone, we celebrate the hard work, growth, and determination that brought you here.

As you move ahead, carry with you the lessons learned, the friendships built, and the memories made along the way. Seldovia is proud of you today and always.

Congratulations, graduates! Your future is just beginning.`},
 {title:"Here's our updated flipbook for the month of May featuring the latest Seldovia real estate listings.",excerpt:"Take a scroll through and see what catches your eye!",date:"May 19, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-05-19.jpg",body:`Here's our updated flipbook for the month of May featuring the latest Seldovia real estate listings. Take a scroll through and see what catches your eye!`},
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
 {title:"Take a look at our latest flipbook to explore our active listings.",excerpt:"From unique opportunities to beautiful homes in Seldovia, this collection gives you a closer look at what's currently available in the market.",date:"Apr 30, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-04-30_2.jpg",body:`Take a look at our latest flipbook to explore our active listings.

From unique opportunities to beautiful homes in Seldovia, this collection gives you a closer look at what's currently available in the market. Whether you're searching for your next home, an investment, or just browsing what's out there, it's all in one easy place to flip through and explore.`},
 {title:"In Seldovia, May always feels like a quiet turning point.",excerpt:"Winter starts to loosen its grip, the days stretch a little longer, and suddenly life moves back outside again.",date:"Apr 30, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-30.jpg",body:`In Seldovia, May always feels like a quiet turning point. Winter starts to loosen its grip, the days stretch a little longer, and suddenly life moves back outside again.

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
 {title:"Pending and moving forward!",excerpt:"A big congratulations to the sellers and buyers of this lot in Seldovia, one step closer to making it official!",date:"Apr 20, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-04-20.jpg",body:`Pending and moving forward! A big congratulations to the sellers and buyers of this lot in Seldovia, one step closer to making it official! 🎉`},
 {title:"People have a lot of ideas about living in Alaska but the reality, especially in Seldovia, might surprise you.",excerpt:"Here are 5 common myths… and the truth behind them.",date:"Apr 20, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-20_2.jpg",body:`People have a lot of ideas about living in Alaska but the reality, especially in Seldovia, might surprise you.

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
 {title:"Your chance to own a beautiful home in the heart of Seldovia",excerpt:"This 3 bed, 2 bath home sits on a spacious hillside lot, offering both privacy and convenience.",date:"Apr 7, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-04-07_2.jpg",body:`Your chance to own a beautiful home in the heart of Seldovia 🌳✨

This 3 bed, 2 bath home sits on a spacious hillside lot, offering both privacy and convenience. With a large shop/garage, there's plenty of room for storage, hobbies, or creating the perfect workspace.

All of this is just a short distance from everything in town, giving you the best of both worlds: peaceful living with easy access to the heart of the community.

If you've been waiting for the right place to call home in Seldovia, this could be it. Click here to learn more
https://www.seldoviaproperty.com/.../321-eagle-run-loop…`},
 {title:"Here in our quiet coastal town, we're surrounded by the kind of environment that naturally supports a healthier way of life.",excerpt:"But health goes beyond the environment, it's also about the choices we make every day.",date:"Apr 7, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-04-07.jpg",body:`Here in our quiet coastal town, we're surrounded by the kind of environment that naturally supports a healthier way of life—fresh air, open space, and the calming presence of nature. But health goes beyond the environment, it's also about the choices we make every day.

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
 {title:"Today we celebrate National Bird Day!",excerpt:"From bald eagles soaring high over the harbor to seabirds resting quietly along the shoreline, Seldovia is lucky to be surrounded by incredible birdlife year-round.",date:"Jan 5, 2026",read:"1 min",cat:"Living Here",img:"images/gazette/2026-01-05_2.jpg",body:`Today we celebrate National Bird Day! 🐦❄️ From bald eagles soaring high over the harbor to seabirds resting quietly along the shoreline, or on your roof, Seldovia is lucky to be surrounded by incredible birdlife year-round.

Even in the heart of winter, these birds bring movement, sound, and life to our skies and waters.

Take a moment today to look up, slow down, and appreciate the wild beauty that makes our community so special.`},
 {title:"Excited to see this home in Seldovia being passed along to a sweet family moving to Seldovia full-time, congratulations!",excerpt:"Excited to see this home in Seldovia being passed along to a sweet family moving to Seldovia full-time, congratulations!",date:"Jan 5, 2026",read:"1 min",cat:"Real Estate",img:"images/gazette/2026-01-05.jpg",body:`Excited to see this home in Seldovia being passed along to a sweet family moving to Seldovia full-time, congratulations! 😊👨‍👩‍👧‍👦`},
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
 {title:"How are you spending these chilly days in Seldovia?",excerpt:"How are you spending these chilly days in Seldovia?",date:"Dec 28, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-12-28.jpg",body:`How are you spending these chilly days in Seldovia?`},
 {title:"It doesn't happen often at all here in Seldovia, but when the harbor freezes, everything slows down.",excerpt:"Living through a frozen harbor teaches patience in a way few things can.",date:"Dec 27, 2025",read:"1 min",cat:"Living Here",img:"",body:`It doesn't happen often at all here in Seldovia, but when the harbor freezes, everything slows down.  There was plenty of ice in the harbor last week, but it has already melted, or moved on and we're clear again!

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
 {title:"We're recorded! This beautiful 3+ acre parcel on Nutbeem Road has officially closed.",excerpt:"Congratulations to the Sellers and the Buyers on this exciting new chapter in Seldovia!",date:"Sep 25, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-25.jpg",body:`We're recorded! ✨

This beautiful 3+ acre parcel on Nutbeem Road has officially closed. Congratulations to the Sellers and the Buyers on this exciting new chapter in Seldovia!`},
 {title:"A unique opportunity has just been secured in the heart of Seldovia!",excerpt:"This property carries both charm and potential, giving the new owners a head start on creating their Seldovia dream.",date:"Sep 25, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-25_2.jpg",body:`A unique opportunity has just been secured in the heart of Seldovia! Congratulations to the Sellers and the Buyers!

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
 {title:"We're pending! Two parcels just outside downtown Seldovia are off the market.",excerpt:"Congratulations to everyone involved in this rare Alaskan opportunity!",date:"Sep 18, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-18.jpg",body:`We're pending! Two parcels just outside downtown Seldovia are off the market. Congratulations to everyone involved in this rare Alaskan opportunity! 😊`},
 {title:"Happy National Cheeseburger Day!",excerpt:"What better excuse to treat yourself than today?",date:"Sep 18, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-18_2.jpg",body:`🍔 Happy National Cheeseburger Day! 🍔

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
 {title:"Here's what you need to know before you pitch your tent:",excerpt:"Getting here, camping spots, what to bring, activities, and leave no trace.",date:"Sep 8, 2025",read:"1 min",cat:"Living Here",img:"images/gazette/2025-09-08.jpg",body:`Here's what you need to know before you pitch your tent:

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
 {title:"57739 Seldovia Bay Lease — 1.68 acres with 600 feet along the bay and 600 feet along the lagoon.",excerpt:"Solar + generator make everything easy. Comes with a boat! Amazing views all around.",date:"Sep 8, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-08_2.jpg",body:`📍 57739 Seldovia Bay Lease Seldovia, AK 99663
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
 {title:"Happy National Cheese Pizza Day!",excerpt:"There's nothing like a classic slice of cheesy goodness to make any day better.",date:"Sep 5, 2025",read:"1 min",cat:"Community",img:"images/gazette/2025-09-05.jpg",body:`Happy National Cheese Pizza Day! There's nothing like a classic slice of cheesy goodness to make any day better.

Whether you prefer it thin crust or deep dish, let's celebrate the ultimate comfort food! 🍕`},
 {title:"It's always exciting to see dreams take root here, whether it's building a future home, creating a getaway retreat, or simply investing in a piece of Seldovia's beauty!",excerpt:"Thinking about buying or selling in Seldovia? Reach out today, let's make your real estate goals a reality!",date:"Sep 5, 2025",read:"1 min",cat:"Real Estate",img:"images/gazette/2025-09-05_2.jpg",body:`It's always exciting to see dreams take root here, whether it's building a future home, creating a getaway retreat, or simply investing in a piece of Seldovia's beauty! 💗

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

Here's to the workers, dreamers, and doers thank you for all that you do. 🙌`}
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

The rare single-car garage and high-ceiling workshop is a game-changer — secure storage for kayaks, bikes, a vehicle, ATVs, or canoes, or space for creative projects. Some upstairs furnishings are negotiable (seller's personal items, artwork, gift-shop merchandise, and the golf-cart rental business are not included). Surrounded by a gorgeous grass yard and zoned for commercial success, this is a launchpad for your entrepreneurial dreams in Seldovia's coastal heart.`},
 {slug:"57739-kachemak-bay", addr:"57739 Kachemak Bay", city:"Seldovia, AK 99663", price:"$450,000", beds:"3", baths:"1", sqft:"1,399", status:"For Sale", img:"images/listings/57739-kachemak-bay.jpg",
  ppsf:"$322", payment:"$2,538/mo", homeType:"Single Family (leased parcel)", yearBuilt:"1996", lot:"1.68 acres — bluff, steep/hilly, fronts the bay; 600+ ft of beachfront", zoning:"UNZ — Not Zoned", parking:"EV charger",
  highlights:["Bay front","Off-grid","Vaulted ceiling","Heated spa","Bluff lot","Fireplace"],
  design:["Cabin","Pillar/Post/Pier foundation","Wood-frame construction","Metal roof","Vaulted ceiling","Fireplace","Washer & dryer"],
  features:["600+ ft of bay beachfront plus 600+ ft along the inside lagoon","Fully off-grid — solar arrays + dual generators","Turnkey main cabin, sold mostly furnished","Two guest cabins (12x16 & 12x20) sleeping ~10 total","Three sea kayaks + a 2003 Jetcraft jet boat included","Complete tool & equipment package conveys","SNA 55-yr lease, renewable through 2103"],
  schools:["Susan B. English Elementary & Middle School","Susan B. English High School"],
  desc:`Gorgeous turn-key off-grid cabin perched high above Kachemak Bay with unobstructed views of the water and mountains. Completely self-sufficient — powered by robust solar arrays and dual generators — with all the modern conveniences and none of the utility bills. A true modern-day pioneer paradise.

Over 600 feet of bay beachfront plus another 600+ feet along the tranquil inside lagoon. Cast a line from the pebbled beach, comb the tide lines for sea glass and driftwood, or launch one of the three included sea kayaks to glide the bay among sea otters and eagles. Bear-trodden trails lead to summer blueberries and salmonberries.

The main cabin is your headquarters — cozy, fully equipped, and sold turn-key with most of the furniture. Cook fresh salmon on the gas barbecue or smoke it to perfection, then seal your bounty in the chest freezer and vacuum packer. Two charming guest cabins — a 12×16 and a roomier 12×20 with a queen below and a loft queen — host your fellow adventurers, sleeping around ten in all.

Built for resilience and made to be shared, the property conveys with a full arsenal of tools and equipment — chainsaw, table saw, brush cutter, log splitter, generators, a track transport vehicle — and even a 2003 Jetcraft jet boat for quick runs to Seldovia for supplies.

The parcel is secured by a 55-year lease through the Seldovia Native Association, renewable for another 55 years through October 1, 2103. Off-grid means no electric, water, or sewer bill; two annual fees apply (2025 SNA lease ~$2,520; 2025 taxes ~$1,286). This isn't just a property — it's a multi-generational legacy of off-grid mastery and boundless exploration. Your Alaskan odyssey awaits.`}
];
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
 {name:"Aero Tech Lodge",cat:"Lodging",phone:"(907) 234-6200",spon:false},
 {name:"Alaska Dancing Eagles Cabin Rental",cat:"Lodging",phone:"(907) 360-6363",url:"https://www.dancingeagles.com",spon:false},
 {name:"Alaska Free Diver",cat:"Charters & Tours",phone:"(907) 205-7963",url:"https://www.AlaskaFreeDiver.com",spon:false},
 {name:"Alaska Marine Highway System",cat:"Transportation",phone:"(800) 642-0066",spon:false},
 {name:"Asta Waterfront Suite",cat:"Lodging",phone:"(907) 231-6522",spon:false},
 {name:"Between Beaches",cat:"Lodging",phone:"(907) 290-6785",spon:false},
 {name:"Boardwalk Hotel",cat:"Lodging",phone:"(907) 234-7816",url:"https://www.SeldoviaHotel.com",spon:false},
 {name:"City of Seldovia",cat:"Community",phone:"(907) 234-7643",spon:false},
 {name:"Crabpot Grocery",cat:"Shopping",phone:"(907) 234-7435",spon:false},
 {name:"Family First Construction",cat:"Services",phone:"(907) 310-6419",spon:false},
 {name:"Fathoms Hair & Nail Salon",cat:"Beauty & Wellness",phone:"(907) 726-7255",spon:false},
 {name:"Halo Cab",cat:"Transportation",phone:"(907) 205-7828",spon:false},
 {name:"Jack and Aiva's Restaurant",cat:"Food & Drink",phone:"(907) 234-7440",spon:false},
 {name:"Kar-a-Van Transfer",cat:"Transportation",phone:"(907) 234-7802",spon:false},
 {name:"Mako's Water Taxi",cat:"Transportation",phone:"(907) 235-9055",spon:false},
 {name:"Red Mountain Marine",cat:"Marine",phone:"(907) 399-8230",spon:false},
 {name:"Sea Parrot Inn",cat:"Lodging",phone:"(844) 377-7829",url:"https://www.seaparrotinn.com",spon:false},
 {name:"Seldovia Chamber of Commerce",cat:"Community",phone:"(907) 234-7612",spon:false},
 {name:"Seldovia Fishing Adventures",cat:"Charters & Tours",phone:"(907) 234-7417",url:"https://www.fishhalibut.com",spon:false},
 {name:"Seldovia Fuel and Lube",cat:"Marine",phone:"(907) 234-7622",spon:false},
 {name:"Seldovia Harbor Inn",cat:"Lodging",phone:"(907) 202-3095",spon:false},
 {name:"Seldovia Health and Wellness",cat:"Health",phone:"(907) 435-3262",spon:false},
 {name:"Seldovia Native Association",cat:"Community",phone:"(907) 234-7625",spon:false},
 {name:"Seldovia Outdoor Rentals & Gifts",cat:"Shopping",phone:"(907) 302-0320",spon:false},
 {name:"Seldovia Police Department",cat:"Community",phone:"(907) 234-7640",spon:false},
 {name:"Seldovia Property",cat:"Real Estate",phone:"(907) 234-8000",url:"https://www.SeldoviaProperty.com",spon:false},
 {name:"Seldovia Public Library",cat:"Community",phone:"(907) 234-7662",spon:false},
 {name:"Seldovia Sea Glass",cat:"Shopping",phone:"",spon:false},
 {name:"Seldovia Sea Otter Community Center",cat:"Community",phone:"(907) 234-4110",spon:false},
 {name:"Seldovia Suites",cat:"Lodging",phone:"(907) 234-3700",spon:false},
 {name:"Seldovia Village Tribe",cat:"Community",phone:"(907) 234-7898",spon:false},
 {name:"Smokey Bay Air",cat:"Transportation",phone:"(907) 234-8511",url:"https://www.SmokeyBayAir.com",spon:false},
 {name:"Susan B English School",cat:"Community",phone:"(907) 234-7616",spon:false},
 {name:"The Great Escape — Alaskan Vacation Rentals",cat:"Lodging",phone:"",url:"https://www.greatescapealaska.com",spon:false},
 {name:"Thyme on the Boardwalk",cat:"Food & Drink",phone:"(907) 440-2213",url:"https://www.ThymeOnTheBoardwalk.com",spon:false},
 {name:"United States Post Office — Seldovia",cat:"Community",phone:"(907) 234-7831",spon:false},
 {name:"Winter Watch",cat:"Services",phone:"(907) 406-0775",url:"https://www.SeldoviaWinterWatch.com",spon:false}
];
// REAL community announcements — sourced from the seldovia.com community news feed.
const NOTES=[
 {cat:"Announcement",title:"Seldovia Booster Club Annual Auction",body:"The Seldovia Sea Otters Booster Club invites the community to an evening of great food, exciting auctions, and a cash raffle supporting local middle and high school students.",by:"Sea Otters Booster Club",when:"Jul 23"},
 {cat:"Civic",title:"City Council Work Session — July 27",body:"Residents are invited to the Council Work Session on Monday, July 27 at 5:00 p.m., in person at the Council Chambers, 260 Seldovia Street.",by:"City of Seldovia",when:"Jul 22"},
 {cat:"Class",title:"Kuspuk Sewing Class",body:"Learn to sew a traditional Kuspuk in a three-day class led by Angel Oliveira. New sewers and experienced hands are both welcome.",by:"Community Class",when:"Jul 20"},
 {cat:"Announcement",title:"Susan B. English Community Pool — summer schedule",body:"Lap swim, water aerobics, family swim, and free community swim sessions run throughout the week all summer long.",by:"Susan B. English School",when:"Jul 15"},
 {cat:"Jobs",title:"SVT Health & Wellness is hiring",body:"Healthcare professionals wanted for positions in Seldovia and Homer.",by:"Seldovia Village Tribe",when:"Jul 10"},
 {cat:"Notice",title:"Road closure — C Street",body:"C Street is closed to through traffic. Please plan an alternate route.",by:"City of Seldovia",when:"Jul 7"}
];
// REAL client testimonials, verbatim from Jenny's published client-testimonial graphics.
// Never add invented quotes here — the section self-hides when this array is empty.
const TESTIMONIALS=[
 {name:"Christine D.",role:"Home buyer",c:"#663015",t:"We very much appreciated Jenny's professionalism and helpfulness in the purchase of our home. Even with a small budget it was a big decision for us and Jenny was just as excited as we were! She made our dream possible!!! Thank you Jenny."},
 {name:"Rich K.",role:"Land buyer",c:"#1d6b78",t:"This was so easy for me. Jenny did all kinds of work, I did almost nothing. She snowshoed the property, took pictures, went with the surveyor, took more pictures after the snowmelt. I'm thousands of miles away, never lifted a finger. She's smart and clear, very relaxing to talk to; we shared some fun stories. We never met in person, but she's making me miss Seldovia."}
];
// REAL Seldovia businesses. These are not paid sponsors — the strip spotlights local
// businesses. Swap in genuine sponsors once Jenny sells that space.
const SPONSORS=[{name:"Boardwalk Hotel",cat:"Lodging",c:"#663015"},{name:"Jack and Aiva's",cat:"Restaurant",c:"#DF1284"},{name:"Thyme on the Boardwalk",cat:"Dining",c:"#7f8a6b"},{name:"Smokey Bay Air",cat:"Air Taxi",c:"#4f5a3d"},{name:"Crabpot Grocery",cat:"Grocery",c:"#a8683a"},{name:"Alaska Free Diver",cat:"Charters & Tours",c:"#b0357e"},{name:"Mako's Water Taxi",cat:"Water Taxi",c:"#1d6b78"},{name:"Seldovia Fishing Adventures",cat:"Fishing Charters",c:"#2c4a3a"}];

/* ============================================================ RENDER (each guarded — runs only if its container exists on this page) ============================================================ */
function stars(r){const full=Math.round(r); return "★★★★★".slice(0,full)+"☆☆☆☆☆".slice(0,5-full);}
// ---- On-theme placeholder photos (LoremFlickr, keyworded per item) ----
// PROD: replace these keyworded placeholders with real Seldovia photography.
const flickr=(w,h,tags,lock)=>`https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;
const TAGS_BY_KEY={lodging:"cabin,forest,alaska",dining:"seafood,harbor,alaska",charters:"boat,ocean,alaska",arts:"art,gallery,coast",outdoors:"trail,forest,mountains",wellness:"spa,forest,nature",events:"festival,outdoor,community"};
// self-hosted category photos by place key (PROD: real place photos)
const PLACE_IMG={lodging:"images/categories/cat-0.jpg",dining:"images/categories/cat-1.jpg",charters:"images/categories/cat-2.jpg",arts:"images/categories/cat-4.jpg",outdoors:"images/categories/cat-5.jpg",wellness:"images/categories/cat-6.jpg",events:"images/categories/cat-7.jpg"};
// Category tiles use hand-verified tag+lock pairs (specific-concept flickr tags
// are unreliable, so each was previewed and locked to a good image).
const CAT_TAGS=[{t:"log-cabin,alaska",l:1},{t:"seafood,dinner,plate",l:3},{t:"fishing-boat,harbor",l:1},{t:"latte,coffee",l:2},{t:"mural,streetart",l:1},{t:"mountains,hiking",l:1},{t:"spa,wellness",l:1},{t:"fireworks,night",l:2}];
const GAL_TAGS=["harbor,fog,alaska","boardwalk,coast,alaska","seaplane,bay,alaska","berries,forest,trail","otter,sea,wildlife","wildflowers,mountains,alaska","fishing,dock,harbor","sunset,coast,alaska","kayak,water,alaska"];

// hero quick-cats
if($("#quickcats")) $("#quickcats").innerHTML=[["Restaurants","dining"],["Lodging","lodging"],["Charters","charters"],["Trails","outdoors"],["Arts","arts"],["Events","events"]].map(([label,key])=>
  `<a class="quickcat" href="explore.html?cat=${key}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>${esc(label)}</a>`).join("");

// category tiles
if($("#catGrid")) $("#catGrid").innerHTML=CATEGORIES.map((c,i)=>{
  const img=`images/categories/cat-${i}.jpg`;
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
    <a class="place" href="${p.url?esc(p.url):'phone-book.html'}"${p.url?' target="_blank" rel="noopener"':''}>
      <div class="place-media"><img class="place-photo" src="${PLACE_IMG[p.key]||'images/categories/cat-5.jpg'}" alt="" loading="lazy" width="600" height="400"></div>
      <div class="place-body">
        <div class="rating"><span class="cat">${esc(p.cat)}</span></div>
        <h4>${esc(p.name)}</h4>
        <div class="place-loc"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> Seldovia, AK${p.phone?` · ${esc(p.phone)}`:""}</div>
      </div>
    </a>`).join("");
}
if($("#placeTabs")){
  $("#placeTabs").innerHTML=PLACE_TABS.map(([k,l])=>`<button class="tab" data-key="${k}" aria-pressed="${k===placeTab}">${esc(l)}</button>`).join("");
  $("#placeTabs").addEventListener("click",e=>{const b=e.target.closest(".tab"); if(!b)return; placeTab=b.dataset.key; $$("#placeTabs .tab").forEach(t=>t.setAttribute("aria-pressed",t===b)); renderPlaces();});
}
renderPlaces();

// gazette — real recovered posts; each card opens a full post page
const slugify=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64);
const postBodyHtml=t=>"<p>"+esc((t||"").trim()).replace(/\n{2,}/g,"</p><p>").replace(/\n/g,"<br>")+"</p>";
if($("#gazetteGrid")){
  $("#gazetteGrid").innerHTML=GAZETTE.map(g=>`<article class="post">
    <div class="post-media"><img class="post-photo" src="${g.img}" alt="${esc(g.title)}" loading="lazy"></div>
    <div class="post-body"><span class="kicker">${esc(g.cat)}</span><h4>${esc(g.title)}</h4>
    <div class="post-meta"><span>${esc(g.date)}</span></div>
    <div class="post-text clamp">${postBodyHtml(g.body||g.excerpt)}</div>
    <button class="show-more" type="button">Read more</button></div></article>`).join("");
  // reveal full text inline; hide the button when the text already fits
  $$("#gazetteGrid .post").forEach(card=>{
    const text=card.querySelector(".post-text"), btn=card.querySelector(".show-more");
    if(text.scrollHeight<=text.clientHeight+4){ btn.remove(); return; }
    btn.addEventListener("click",()=>{ const clamped=text.classList.toggle("clamp"); btn.textContent=clamped?"Read more":"Read less"; });
  });
}

// single blog post page (post.html?p=slug)
if($("#postDetail")){
  const want=new URLSearchParams(location.search).get("p");
  const post=GAZETTE.find(g=>slugify(g.title)===want)||GAZETTE[0];
  document.title=`${post.title} — Jenny's Blog`;
  const bodyHtml=(post.body||post.excerpt||"").trim().split(/\n{2,}/).map(x=>`<p>${esc(x.trim()).replace(/\n/g,"<br>")}</p>`).join("");
  $("#postDetail").innerHTML=`
    <a class="back-link" href="gazette.html">← All posts</a>
    <div class="listing-hero" style="aspect-ratio:16/9"><img src="${post.img}" alt="${esc(post.title)}" onerror="this.closest('.listing-hero').classList.add('place-media-blank');this.remove()"></div>
    <span class="eyebrow" style="margin-top:1.2rem">${esc(post.cat||"Blog")}</span>
    <h1 style="margin:.15rem 0;font-family:var(--serif)">${esc(post.title)}</h1>
    <div class="listing-city">${esc(post.date)}</div>
    <div class="listing-desc" style="margin-top:1.3rem">${bodyHtml}</div>
    <p style="margin-top:2rem"><a class="btn btn-primary" href="gazette.html">← Back to Jenny's Blog</a></p>`;
}

// gallery
if($("#masonry")) $("#masonry").innerHTML=GALLERY.map((im,i)=>{
  const img=`<img src="${im.img}" alt="${esc(im.cap)}" loading="lazy" width="300" height="${im.h}">`;
  return `<figure tabindex="0" data-idx="${i}">${img}<figcaption>${esc(im.cap)}</figcaption></figure>`;}).join("");

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
  const bizCard=d=>{
    const bits=[]; if(d.phone)bits.push(`<a href="tel:${d.phone.replace(/[^\d]/g,"")}">${esc(d.phone)}</a>`); bits.push("Seldovia, AK");
    const site=d.url?`<div class="d-site"><a href="${esc(d.url)}" target="_blank" rel="noopener">Visit website ↗</a></div>`:"";
    return `<div class="dir-item ${d.spon?'featured':''}"><div class="d-ico">${esc(d.name[0])}</div>
      <div class="d-main"><div class="d-cat">${esc(d.cat)}</div><h4>${esc(d.name)}</h4><div class="d-contact">${bits.join(" · ")}</div>${site}</div>
      ${d.spon?'<span class="spon-flag">★ Sponsor</span>':''}</div>`;};

  const renderDir=()=>{const q=dirQuery.trim().toLowerCase();
    const rows=ALL.filter(r=>{
      const inCat = dirCat==="All" || (dirCat==="People"&&r.type==="person") || (dirCat==="Businesses"&&r.type==="biz") || (r.type==="biz"&&r.cat===dirCat);
      const inQ = !q || r.name.toLowerCase().includes(q) || (r.cat||"").toLowerCase().includes(q) || (r.addr||"").toLowerCase().includes(q);
      return inCat && inQ;
    });
    const empty = (!q && (dirCat==="People"||(dirCat==="All"&&!PEOPLE.length)) && !PEOPLE.length)
      ? `<div class="dir-empty">The neighbor listings are just getting started — <a href="directory-add.html">add your household</a> and share only what you're comfortable with.</div>`
      : `<div class="dir-empty">No matches — try another word or category.</div>`;
    $("#dirList").innerHTML=rows.length?rows.map(r=>r.type==="person"?personCard(r):bizCard(r)).join(""):empty;};
  renderDir();
  $("#dirChips").addEventListener("click",e=>{const b=e.target.closest(".chip"); if(!b)return; dirCat=b.dataset.cat; $$("#dirChips .chip").forEach(c=>c.setAttribute("aria-pressed",c===b)); renderDir();});
  $("#dirSearch").addEventListener("input",e=>{dirQuery=e.target.value; renderDir();});
}

// bulletin
if($("#board")) $("#board").innerHTML=NOTES.map(n=>`<article class="note"><span class="n-cat">${esc(n.cat)}</span><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p><div class="n-foot"><span>${esc(n.by)}</span><span>${esc(n.when)}</span></div></article>`).join("");

// testimonials
// Renders only when there are REAL testimonials; the section hides itself while empty.
if($("#quoteGrid")){
  if(!TESTIMONIALS.length){ const sec=$("#quoteGrid").closest("section"); if(sec) sec.style.display="none"; }
  else $("#quoteGrid").innerHTML=TESTIMONIALS.map(t=>`<div class="quote"><span class="qmark">&rdquo;</span><div class="quote-head"><span class="avatar" style="background:${t.c}">${esc(t.name[0])}</span><span><b>${esc(t.name)}</b><span>${esc(t.role)}</span></span></div><p>${esc(t.t)}</p></div>`).join("");
}

// sponsors
if($("#sponsorTrack")){const spHTML=SPONSORS.map(s=>`<a class="sponsor" href="phone-book.html" aria-label="${esc(s.name)} — ${esc(s.cat)}"><span class="logo" style="background:${s.c}">${esc(s.name[0])}</span><span class="s-name">${esc(s.name)}</span><span class="s-cat">${esc(s.cat)}</span></a>`).join(""); $("#sponsorTrack").innerHTML=spHTML+spHTML;}

// home photo gallery (auto-scroll)
const galFig=(g,i)=>`<figure class="gallery-photo" tabindex="0" data-idx="${i}"><img src="${g.img}" alt="${esc(g.cap)}" loading="lazy" width="600" height="450"><figcaption>${esc(g.cap)}</figcaption></figure>`;
if($("#galleryTrack")){const gHTML=GALLERY.map((g,i)=>galFig(g,i)).join(""); $("#galleryTrack").innerHTML=gHTML+gHTML;}
if($("#galleryTrack2")){const gHTML=GALLERY.map((g,i)=>galFig(g,i)).reverse().join(""); $("#galleryTrack2").innerHTML=gHTML+gHTML;}

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
    $("#calHint").innerHTML=ag?'Upcoming events in Seldovia':'July 2026';};
  $("#viewAgenda").addEventListener("click",()=>setCalView("agenda"));
  $("#viewMonth").addEventListener("click",()=>setCalView("month"));
}
document.addEventListener("click",e=>{const b=e.target.closest(".add-cal"); if(b){e.preventDefault(); toast(`"${b.dataset.title}" — saved to your calendar (demo)`);}});

/* ============================================================ GLOBAL SEARCH ============================================================ */
const INDEX=[
  ...PLACES.map(p=>({type:"Place",title:p.name,desc:p.phone?`${p.cat} · ${p.phone}`:p.cat,href:"explore.html",kw:p.cat+" "+p.key})),
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
