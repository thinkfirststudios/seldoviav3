-- Publish the L1 Shoreline Dr land listing. Run ONCE in Supabase SQL Editor (safe to re-run).
-- Photo auto-attaches from images/listings/l1-shoreline-dr/ via the slug.
insert into public.listings (address, slug, city, price, beds, baths, sqft, status, listed_on, description, published)
select 'L1 Shoreline Dr','l1-shoreline-dr','Seldovia, AK 99663','$95,000',null,null,'7,841','For Sale','2026-07-17',
$desc$Nice sized lot on the slough with 65+ ft of beach frontage! Build your dream cottage among Sitka Spruce, with room for parking and even a private dock for prime fishing. Enjoy sunrise views over the hills, plus salmon, otters, and bears from your doorstep. Steps from Seldovia's airstrip, watch planes come and go — connected yet serene. Your private Alaskan haven awaits!

This is a premier, larger waterfront lot on the Slough — a rare find compared to the many smaller parcels as tiny as 0.04 acres. With over 65 feet of pristine beach frontage to call your own, there's space to craft your dream waterfront cottage while preserving the majestic Sitka Spruce that ensure your privacy. Enjoy unobstructed views of salmon gliding through the waters, river otters along the shore, sea otters heading up to the lagoon, and the occasional black bear strolling by — all from your front-row seat to nature's spectacle.

Perfectly positioned to welcome the sunrise's first light over the hills, this lot invites you to build a private dock, just like your neighbors, securing the ultimate fishing spot. Unusual along the slough, you have ample room for parking and outdoor living, and can selectively trim trees to open sweeping views while keeping a cozy, wooded retreat.

Steps from Seldovia's charming town center, the property keeps you connected to local life while offering a prime vantage point over the active airstrip — daily Smokey Bay Air flights, private planes, helicopters, and medivac departures. As one former slough resident shared, the comings and goings of planes create a unique sense of connection to the world without losing the tranquility of our Seldovia paradise. This is more than a lot — it's the canvas for your private waterfront escape in the heart of Seldovia.

Highlights: Popular property · Fronts a lagoon/estuary · Unobstructed views.

Land details: 0.18 acres (7,841 sq ft lot) · Zoned WCR (Waterfront Commercial Residential) · Steep slope · Est. annual taxes $732 · Price per acre $527,778.

Schools: Susan B. English Elementary & Middle School · Susan B. English High School.$desc$,
true
where not exists (select 1 from public.listings l where l.slug = 'l1-shoreline-dr');
