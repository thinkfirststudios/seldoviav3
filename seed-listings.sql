-- Migrate the 8 built-in listings into the database so ALL listings are editable in the admin.
-- Run ONCE in Supabase SQL Editor. Safe to re-run (skips ones already present by slug).
insert into public.listings (address, slug, city, price, beds, baths, sqft, status, description, listed_on, published)
select v.address, v.slug, v.city, v.price, v.beds, v.baths, v.sqft, v.status, v.description, null, true
from (values
('230 Kachemak St', '230-kachemak-st', 'Seldovia, AK 99663', '$475,000', '3', '1.5', '1,122', 'For Sale', 'Rare opportunity to own one of Seldovia''s iconic waterfront properties. Set on approximately 0.20 acres — nearly four times the size of many neighboring lots — this historic Waterfront Commercial Residential property offers unmatched potential. This is an older home that has been remodeled. For the right buyer, it''s a chance to preserve a piece of Seldovia''s history while creating a lasting legacy.

There are properties you purchase for convenience. Then there are properties you purchase because you know you''ll never find another one quite like it. Stretching along Seldovia''s iconic waterfront, where the tides rise and fall beneath weathered pilings and fishing skiffs, this property has quietly been part of the town''s story for decades. Its location alone is something that simply couldn''t be recreated today.

It has served as both a family home and a commercial space. Step inside and you''ll find spaces designed around the water. Two main-floor bedrooms greet the morning with sunrise views across the slough, while upstairs a private guest retreat sleeps four with its own exterior entrance — ideal for visiting family or guests — with even a half bath in the attic alongside this room.

The spacious kitchen, complete with two refrigerators, was made for gathering. Just beyond, the generous living room opens through French doors to a deck of more than 400 square feet suspended above the slough. Here you''ll watch salmon move with the tide, fishermen cast from the bridge, eagles pass overhead, and the seasons unfold from one of the best seats in town.

The owners have invested in meaningful improvements while preserving the property''s rustic character, but this is an older waterfront building and it deserves an owner who understands what that means. For the right person, that investment isn''t simply maintenance — it''s the privilege of preserving a place that has already stood the test of time.

Highlights: Hot Property, Unobstructed views, Waterfront, Cabin, Fronts a lagoon/estuary, Shed.

Home type: Single Family · Built: 1945 · Lot: 8,712 sq ft (~0.20 ac) — fronts a lagoon/estuary · Zoning: WCR — Waterfront Commercial Residential · Price/sq ft: $423.

Schools: Susan B. English Elementary & Middle School, Susan B. English High School.'),
('195 Lookout Aly', '195-lookout-aly', 'Seldovia, AK 99663', '$345,000', '2', '1.5', '1,376', 'For Sale', 'Wake up to sunshine, slough, and harbor views from this welcoming corner-lot home in the heart of Seldovia. With 2 bedrooms, 1.5 baths, accessible entry ramps, sunny decks, berry gardens, a rustic workshop, and an easy walk to the harbor, shops, and restaurants, this property offers comfort, convenience, and the relaxed Alaska lifestyle you''ve been looking for.

Perfectly positioned on a sunny corner lot overlooking the Seldovia Slough, Main Street, and the harbor beyond, this welcoming 1,376 sq ft Lindal Cedar Home offers the convenience of in-town living with peaceful views. Designed with accessibility in mind, the home features spacious living and dining areas and ramps for easy access. Large windows invite natural light inside while offering glimpses of the surrounding trees, gardens, and neighborhood.

Step outside and discover a property that''s ready to be enjoyed. Relax with morning coffee on the east-facing deck or evening sunshine on the harbor-facing west deck. Enjoy outdoor spaces on both sides of the home, surrounded by established gardens bursting with salmonberries and raspberries throughout the growing season.

A rustic 554 sq ft workshop provides the perfect place for projects, hobbies, storage, or tinkering. Located just a short walk from the harbor, boardwalk, shops, restaurants, airport, post office, and community amenities, this home offers the best of small-town living with everything close at hand.

Highlights: Hot Property, Bay view, Fireplace, Fronts an inlet, Private yard, Handicap accessible.

Home type: Single Family · Built: 1963 · Lot: 10,019 sq ft — level, waterfront, private yard, fronts an inlet · Zoning: WCR — Waterfront Commercial Residential · Price/sq ft: $251.

Schools: Susan B. English Elementary & Middle School, Susan B. English High School.'),
('3108 Jakolof Bay Rd', '3108-jakolof-bay-rd', 'Seldovia, AK 99663', '$219,900', '1', '1', '768', 'For Sale', 'Charming cabin overlooking the Barbara Creek area with sweeping views across Kachemak Bay to the Homer Spit and the twinkling lights of Homer. This cozy, open-concept cabin is warm, bright, and freshly updated — the kind of retreat that instantly feels like home.

The main level features a bright, sunny new kitchen, cozy living area, and bathroom, while the loft above provides a peaceful sleeping space tucked beneath the roofline. The hearth is framed with handsome Italian tile, and a brand-new Toyo stove keeps you warm and comfortable through every season.

Set on three private acres, there''s plenty of room to garden, explore, or simply soak in the peace and quiet. Recent tree clearing has opened the property to even more sunshine and enhanced the views. A spacious 448 sq ft heated shop and garage offers excellent space for projects, vehicles, or Alaska gear, and an additional insulated outbuilding is already wired and ready to become a workshop, bunkhouse, studio, or storage.

The cabin is served by a water catchment system, with the tank tucked beneath the home and insulated from the weather. And yes — even the outhouse comes with a view. As an added bonus, more than four cords of firewood have already been cut, split, and stacked, ready to keep the fire crackling from the day you arrive.

Highlights: Bay view, Private yard, Fireplace, Bluff lot, Wood countertops, Shed.

Home type: Single Family · Built: 2000 · Lot: 3.03 acres — bluff, level, private yard · Zoning: UNZ — Not Zoned · Price/sq ft: $286.

Schools: Susan B. English Elementary & Middle School, Susan B. English High School.'),
('175 Augustine North Ave', '175-augustine-north-ave', 'Seldovia, AK 99663', '$895,000', '7', '6', '4,040', 'For Sale', 'A rare opportunity in the heart of Seldovia: a 3,500+ sq ft home and iconic waterfront cabin with 7 bedrooms, 6 baths, a successful turnkey Bed & Breakfast, an oversized garage/shop, a huge two-story greenhouse, a smokehouse, and nearly 90 feet of slough frontage. Breathtaking slough, bay, mountain, and sunset views — with endless residential or business potential.

Waterfront land along the slough is limited, and it''s rare to find this much usable space. A large driveway leaves plenty of room for guests, boats, trailers, or RVs, plus the garage, greenhouse, and smokehouse. You''re just three lots from the Seldovia Slough Bridge — an easy walk to the harbor, restaurants, shops, and airport.

The views are part of everyday life. From the windows and decks you''ll look across the slough toward Seldovia Bay, the surrounding mountains, colorful waterfront homes, and spectacular sunsets. Eagles visit regularly, boats and kayaks drift by, and the changing tides bring a new view every few hours.

Designed with guests in mind while still warm as a full-time home. Upstairs are three beautifully furnished guest suites, each with a private 3/4 bath and sitting area — most with their own decks. Fully furnished and ready to welcome visitors from day one: a true turnkey B&B.

The main level gathers everyone around a vaulted two-story living room, a kitchen and dining nook, and a bright sunroom/formal dining area that opens to a grand deck tucked among mature spruce. Downstairs adds a large bedroom, a family room over the water, laundry, storage, and a dedicated fish-processing room with freezers — this is Alaska, after all.

Just outside: a smokehouse with hot and cold smokers, an oversized 668 sq ft garage/shop, and an impressive two-story greenhouse. And the guest cabin — built on pilings over the water with a wraparound deck and nearly 180° slough views — is the perfect spot for Songs on the Slough in July. Zoned Waterfront Commercial Residential, it can keep welcoming guests, become a family retreat, or simply be enjoyed as one of Seldovia''s one-of-a-kind waterfront homes. Much of the furniture and equipment conveys.

Highlights: Very popular, Turnkey B&B, Bay view, Vaulted ceiling, ~90 ft waterfront, Mud room.

Home type: Single Family · Built: 1979 · Lot: 16,553 sq ft — fronts a lagoon/estuary & inlet, ~90 ft of slough frontage · Zoning: WCR — Waterfront Commercial Residential · Price/sq ft: $222.

Schools: Susan B. English Elementary & Middle School, Susan B. English High School.'),
('60187 Chesloknu Lease', '60187-chesloknu-lease', 'Seldovia, AK 99663', '$425,000', '2', '0.5', '1,631', 'For Sale', 'Rare waterfront opportunity on Seldovia Bay. This custom-built log home offers stunning bay, mountain, sunrise, and sunset views from a wraparound deck — and something almost unheard of on the Seldovia side of the bay: private road access, so you can drive right to your door. A spacious open-concept living area, large kitchen, beach access, and authentic off-grid Alaska living.

Built in 1988 by a local log craftsman, the home sits on the shoreline overlooking the head of the Seldovia River, catching both morning and afternoon sun. What truly sets it apart is private road access through Native lands — no other leased properties on this side of the bay offer this. The roughly 8,500-ft access road makes travel from Seldovia easy in the accessible seasons; in winter it''s unmaintained, so owners plow or arrive by snow machine, making every trip part of the adventure.

Inside, the home embraces classic Alaska living: a spacious kitchen with a generous pantry and propane appliances. Since electricity isn''t available here, the home operates off-grid, with water hauled to two storage tanks. The open-concept living and dining area is highlighted by vaulted ceilings and large windows framing the bay, and the main-floor primary bedroom has large southwest-facing windows for panoramic water and mountain views.

Above is an expansive ~585 sq ft loft running the full length of the cabin — abundant room for guests and hobbies, plus a bright artist''s atelier tucked alongside the windows: a peaceful place to paint, write, or simply be inspired by the tides and wildlife. This is the second bedroom.

Life here is defined by the wildlife just outside your door — bald eagles overhead, sea otters in the calm water, and black bears along the shoreline. During the summer pink-salmon run, thousands of fish make their way toward the Seldovia River. Because the property sits at the back of the bay, the water is remarkably quiet, with low tides naturally limiting boat traffic and creating a rare sense of peace and solitude.

Offered fully furnished (excluding personal items and select artwork), it''s ready to enjoy from day one — just bring groceries, a fishing pole, and your sense of adventure. The parcel is leased through the Seldovia Native Association on a 55-year lease expiring in 2042, with an option to renew to 2097. (2025 lease ~$3,588; 2025 taxes ~$1,363.)

Highlights: Bay/harbor front, Rare road access, Log cabin, Vaulted ceiling, Heated spa, Off-grid.

Home type: Single Family (leased parcel) · Built: 1988 · Lot: 3.18 acres — fronts a bay/harbor, bluff, steep slope · Zoning: UNZ — Not Zoned · Price/sq ft: $261.

Schools: Susan B. English Elementary & Middle School, Susan B. English High School.'),
('333 Anderson Way', '333-anderson-way', 'Seldovia, AK 99663', '$300,000', '2', '1.5', '1,120', 'For Sale', 'Heart-of-town opportunity — three lots (~0.69 acres total) directly across from Susan B. English School. A sun-filled 2-bedroom, 1.5-bath ranch with 1,120 sq ft, a spacious 768 sq ft shop, and a 256 sq ft shed — plus room for an additional building, with city water, sewer, and power already stubbed out. Walk anywhere in minutes.

Imagine living where you can stroll to the harbor, wave to neighbors on the way to the store, and enjoy community events just minutes from your front door — while still having nearly 0.69 acres to call your own. Situated on three town lots, the property is a short walk from downtown shops, restaurants, the harbor, the Alaska Marine Highway dock, and the boardwalk.

The single-level ranch offers comfortable living with two bedrooms and 1.5 baths, and its standout feature is light: from sunrise over the mountains to the evening sun in the west, the home stays bathed in warm, inviting sunshine all day.

The property truly shines with its outbuildings and possibilities. The 768 sq ft shop is ready for woodworking, boat projects, vehicle storage, or a home business, and a 256 sq ft storage building adds even more flexibility. There''s also space for an additional building, with utilities already stubbed out.

Large in-town parcels are increasingly rare, and three lots open the door to countless options. Zoned Commercial, there''s room to expand gardens, create outdoor entertaining spaces, or pursue a business. Offered as-is, it''s an exceptional opportunity to personalize a remarkable in-town setting — as a full-time residence, a seasonal retreat, or an investment in one of Alaska''s most charming coastal communities.

Highlights: Town center, Level lot, 768 sq ft shop, Sun-filled, Commercial zoning, Shed.

Home type: Single Family · Built: 1992 · Lot: 30,056 sq ft (~0.69 ac) — three town lots, level · Zoning: C — Commercial · Price/sq ft: $268.

Schools: Susan B. English Elementary & Middle School, Susan B. English High School.'),
('251 Main St', '251-main-st', 'Seldovia, AK 99663', '$685,000', '3', '3', '2,240', 'For Sale', 'Double lot on the Seldovia Small Boat Harbor with morning sunrises and evening sunsets — and the ONLY waterfront grassy lawn in town. A spacious 2-bedroom, 2-bath home upstairs, a 1-bedroom full-bath apartment downstairs, and a Main Street storefront, plus a rare single-car garage/shop. Zoned Commercial Business, steps from the bustling harbor and a stone''s throw from shops, the airport, and all town amenities — a chance to craft a thriving business while living in coastal comfort upstairs.

The Main Street-facing commercial space offers prime frontage, ideal for a gift shop, retail boutique, or professional office. On the waterfront side, a large patio leads to a fully furnished 1-bedroom apartment — perfect for a B&B or vacation rental — with a newly remodeled kitchen and bath, a queen Murphy bed, and a covered patio for guests to soak in harbor views. All apartment furniture transfers, making it rental-ready from day one.

The surrounding lush lawn — Seldovia''s only large lawn on the harbor front — makes a stunning backdrop for weddings, family gatherings, or waterfront entertaining, basking in sun from morning to sunset. The property sits in the heart of the community, between the Linwood Bar & Grill and the Boardwalk Hotel & Otter Cove Ice Cream, with the post office and grocery store right across the street.

Upstairs, a private oasis awaits with expansive harbor, mountain, and waterfront views from a large deck. The bright, open-concept living room flows into a chef''s kitchen with solid-surface counters, new appliances, and a grand island with a bar sink. An open dining area under vaulted ceilings, a cozy fireplace, two spacious bedrooms (including a water-side master with a fully remodeled ensuite, 2023–2025), a guest bath, and a large pantry complete the retreat.

The rare single-car garage and high-ceiling workshop is a game-changer — secure storage for kayaks, bikes, a vehicle, ATVs, or canoes, or space for creative projects. Some upstairs furnishings are negotiable (seller''s personal items, artwork, gift-shop merchandise, and the golf-cart rental business are not included). Surrounded by a gorgeous grass yard and zoned for commercial success, this is a launchpad for your entrepreneurial dreams in Seldovia''s coastal heart.

Highlights: Harbor front, Ocean view, Storefront + apartment, Vaulted ceiling, Quartz counters, Only harborfront lawn.

Home type: Single Family / mixed-use · Built: 1983 · Lot: 19,166 sq ft — double lot, fronts the harbor, level, private yard · Zoning: CB — Commercial Business · Price/sq ft: $306.

Schools: Susan B. English Elementary & Middle School, Susan B. English High School.'),
('57739 Kachemak Bay', '57739-kachemak-bay', 'Seldovia, AK 99663', '$450,000', '3', '1', '1,399', 'For Sale', 'Gorgeous turn-key off-grid cabin perched high above Kachemak Bay with unobstructed views of the water and mountains. Completely self-sufficient — powered by robust solar arrays and dual generators — with all the modern conveniences and none of the utility bills. A true modern-day pioneer paradise.

Over 600 feet of bay beachfront plus another 600+ feet along the tranquil inside lagoon. Cast a line from the pebbled beach, comb the tide lines for sea glass and driftwood, or launch one of the three included sea kayaks to glide the bay among sea otters and eagles. Bear-trodden trails lead to summer blueberries and salmonberries.

The main cabin is your headquarters — cozy, fully equipped, and sold turn-key with most of the furniture. Cook fresh salmon on the gas barbecue or smoke it to perfection, then seal your bounty in the chest freezer and vacuum packer. Two charming guest cabins — a 12×16 and a roomier 12×20 with a queen below and a loft queen — host your fellow adventurers, sleeping around ten in all.

Built for resilience and made to be shared, the property conveys with a full arsenal of tools and equipment — chainsaw, table saw, brush cutter, log splitter, generators, a track transport vehicle — and even a 2003 Jetcraft jet boat for quick runs to Seldovia for supplies.

The parcel is secured by a 55-year lease through the Seldovia Native Association, renewable for another 55 years through October 1, 2103. Off-grid means no electric, water, or sewer bill; two annual fees apply (2025 SNA lease ~$2,520; 2025 taxes ~$1,286). This isn''t just a property — it''s a multi-generational legacy of off-grid mastery and boundless exploration. Your Alaskan odyssey awaits.

Highlights: Bay front, Off-grid, Vaulted ceiling, Heated spa, Bluff lot, Fireplace.

Home type: Single Family (leased parcel) · Built: 1996 · Lot: 1.68 acres — bluff, steep/hilly, fronts the bay; 600+ ft of beachfront · Zoning: UNZ — Not Zoned · Price/sq ft: $322.

Schools: Susan B. English Elementary & Middle School, Susan B. English High School.')
) as v(address, slug, city, price, beds, baths, sqft, status, description)
where not exists (select 1 from public.listings l where l.slug = v.slug);
