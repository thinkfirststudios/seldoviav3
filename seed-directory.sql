-- ============================================================
--  DIRECTORY (phone-book businesses & organizations)
--  Moves the hard-coded DIRECTORY list into the database so Jenny can
--  add / edit / delete every entry from the admin Phone Book tab.
--  Run ONCE in Supabase SQL Editor. Safe to re-run (skips rows already
--  present by name; never overwrites Jenny's later edits).
-- ============================================================

create table if not exists public.directory (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  cat        text default '',          -- category label shown on the card
  section    text default '',          -- grouping key: stay/eat/travel/shop/activities/life/services/outoftown
  phone      text default '',
  url        text default '',
  sponsor    boolean not null default false,
  govt       boolean not null default false,  -- Government vs Organization split (section='life')
  sort_order int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.directory enable row level security;

drop policy if exists "public read directory" on public.directory;
create policy "public read directory" on public.directory for select using (true);

drop policy if exists "auth write directory" on public.directory;
create policy "auth write directory" on public.directory for all
  to authenticated using (true) with check (true);

-- Seed rows (idempotent: only inserts a name that isn't there yet).
insert into public.directory (name, cat, section, phone, url, sponsor, govt, sort_order)
select v.name, v.cat, v.section, v.phone, v.url, v.sponsor, v.govt, v.sort_order
from (values
('Aero Tech Lodge', 'Lodging', 'stay', '(907) 234-6200', '', false, false, 0),
('Alaska Dancing Eagles Cabin Rental', 'Cabin Rental', 'stay', '(907) 360-6363', 'https://www.dancingeagles.com', false, false, 1),
('Alaska Free Diver', 'Diving & Tours', 'activities', '(907) 205-7963', 'https://www.AlaskaFreeDiver.com', false, false, 2),
('Alaska Marine Highway System', 'Ferry', 'travel', '(800) 642-0066', '', false, false, 3),
('Asta Waterfront Suite', 'Lodging', 'stay', '(907) 231-6522', '', false, false, 4),
('Between Beaches', 'Lodging', 'stay', '(907) 290-6785', '', false, false, 5),
('Boardwalk Hotel', 'Hotel', 'stay', '(907) 234-7816', 'https://www.SeldoviaHotel.com', false, false, 6),
('City of Seldovia', 'City Government', 'life', '(907) 234-7643', '', false, true, 7),
('Crabpot Grocery', 'Grocery', 'shop', '(907) 234-7435', '', false, false, 8),
('Fathoms Hair & Nail Salon', 'Salon', 'services', '(907) 726-7255', '', false, false, 9),
('Halo Cab', 'Taxi', 'travel', '(907) 205-7828', '', false, false, 10),
('Jack and Aiva''s Restaurant', 'Restaurant', 'eat', '(907) 234-7440', '', false, false, 11),
('Kar-a-Van Transfer', 'Transfer', 'travel', '(907) 234-7802', '', false, false, 12),
('Mako''s Water Taxi', 'Water Taxi', 'travel', '(907) 235-9055', '', false, false, 13),
('Sea Parrot Inn', 'Inn', 'stay', '(844) 377-7829', 'https://www.seaparrotinn.com', false, false, 14),
('Seldovia Chamber of Commerce', 'Chamber of Commerce', 'life', '(907) 234-7612', '', false, false, 15),
('Seldovia Fishing Adventures', 'Fishing Charters', 'activities', '(907) 234-7417', 'https://www.fishhalibut.com', false, false, 16),
('Seldovia Fuel and Hardware', 'Fuel & Hardware', 'services', '(907) 234-7622', '', false, false, 17),
('Seldovia Harbor Inn', 'Inn', 'stay', '(907) 202-3095', '', false, false, 18),
('Seldovia Health and Wellness', 'Health & Wellness', 'services', '(907) 435-3262', '', false, false, 19),
('Seldovia Native Association', 'Native Association', 'life', '(907) 234-7625', '', false, false, 20),
('Seldovia Outdoor Rentals & Gifts', 'Rentals & Gifts', 'activities', '(907) 302-0320', '', false, false, 21),
('Seldovia Police Department', 'Police', 'life', '(907) 234-7640', '', false, true, 22),
('Seldovia Property', 'Real Estate', 'services', '(907) 234-8000', 'https://www.SeldoviaProperty.com', false, false, 23),
('Seldovia Public Library', 'Library', 'life', '(907) 234-7662', '', false, false, 24),
('Seldovia Sea Glass', 'Gifts & Art', 'shop', '', '', false, false, 25),
('Seldovia Sea Otter Community Center', 'Community Center', 'life', '(907) 234-4110', '', false, false, 26),
('Seldovia Suites', 'Suites', 'stay', '(907) 234-3700', '', false, false, 27),
('Seldovia Village Tribe', 'Tribe', 'life', '(907) 234-7898', '', false, false, 28),
('Smokey Bay Air', 'Air Taxi', 'travel', '(907) 531-0602', 'https://www.SmokeyBayAir.com', false, false, 29),
('Susan B English School', 'School', 'life', '(907) 234-7616', '', false, true, 30),
('The Great Escape — Alaskan Vacation Rentals', 'Vacation Rentals', 'stay', '', 'https://www.greatescapealaska.com', false, false, 31),
('Thyme on the Boardwalk', 'Gift Shop & Nursery', 'shop', '(907) 440-2213', 'https://www.ThymeOnTheBoardwalk.com', false, false, 32),
('United States Post Office — Seldovia', 'Post Office', 'life', '(907) 234-7831', '', false, true, 33),
('Winter Watch', 'Property Care', 'services', '(907) 406-0775', 'winter-watch.html', false, false, 34),
('Rainbow Tours', 'Tours & Passenger Ferry', 'travel', '(907) 235-7272', 'https://www.rainbowtours.net', false, false, 35),
('True North Air', 'Air Taxi', 'travel', '(907) 952-2726', '', false, false, 36),
('Seldovia Bay Ferry', 'Passenger Ferry', 'travel', '', 'https://seldoviabayferry.com', false, false, 37),
('Perley''s Rides', 'Taxi & Truck Rental', 'travel', '(907) 299-8223', '', false, false, 38),
('Seldovia Nature Tours', 'Nature Tours', 'activities', '', 'https://www.seldovianaturetours.com', false, false, 39),
('Seldovia Salmonberry', 'Local Art & Gifts', 'shop', '(907) 632-9314', '', false, false, 40),
('SVT Museum & Gift Shop', 'Museum & Gifts', 'shop', '(907) 234-7898', 'https://svt.org', false, false, 41),
('Seldovia Liquor Store', 'Beverages & Gifts', 'shop', '(907) 202-1938', '', false, false, 42),
('Schooner Beach Studio', 'Cut-Paper Art', 'shop', '(541) 520-7331', '', false, false, 43),
('Make it Reality', '3D Printing & Laser', 'services', '(414) 367-9570', '', false, false, 44),
('Seldovia Arts Council', 'Arts Organization', 'life', '', 'arts-council.html', false, false, 45),
('Seldovia House', 'Senior Housing', 'life', '', 'seldovia-house.html', false, false, 46),
('Seldovia Bible Chapel', 'Church', 'life', '', '', false, false, 47),
('Grace Haven Fellowship', 'Church', 'life', '', '', false, false, 48),
('Russian Orthodox Church', 'Church', 'life', '', '', false, false, 49),
('Seldovia Landfill', 'Public Service', 'life', '', '', false, false, 50),
('SVT Ch''anik''na Children''s Program', 'Children''s Program', 'life', '', '', false, false, 51),
('Seldovia Pavilion', 'Park', 'activities', '', '', false, false, 52),
('Hogenson Park', 'Park', 'activities', '', '', false, false, 53),
('Main Street Park', 'Park', 'activities', '', '', false, false, 54),
('Central Park', 'Park', 'activities', '', '', false, false, 55),
('Lollipop Park', 'Park', 'activities', '', '', false, false, 56),
('Pieren Park', 'Park', 'activities', '', '', false, false, 57),
('Mermaid Park', 'Park', 'activities', '', '', false, false, 58),
('Susan B English Playground & Ballfield', 'Playground & Ballfield', 'activities', '', '', false, false, 59),
('Clay Studio at Susan B English', 'Clay Studio', 'activities', '', '', false, false, 60),
('SVT Fitness Center', 'Fitness Center', 'activities', '', '', false, false, 61),
('Seldovia Community Garden', 'Community Garden', 'activities', '', '', false, false, 62),
('Seldovia Conference Center', 'Conference Center', 'services', '', '', false, false, 63),
('Seldovia Fishing Adventures Gift Shop', 'Gift Shop', 'shop', '', '', false, false, 64),
('Kasitsna Bay Laboratory', 'Marine Research Lab', 'services', '(907) 235-4042', 'kasitsna-bay.html', false, false, 65),
('Dillon & Dillon Construction', 'Construction', 'services', '', '', false, false, 66),
('Black Spruce Equipment Rental & Milling', 'Equipment Rental & Milling', 'services', '', '', false, false, 67),
('Bay Watch Vacation Rental', 'Vacation Rental', 'stay', '', '', false, false, 68),
('Lazy Crow Inn', 'Inn', 'stay', '', '', false, false, 69),
('Seldovia Wilderness RV Park', 'RV Park', 'stay', '', '', false, false, 70),
('Cole''s Vending', 'Vending', 'services', '', '', false, false, 71),
('SVT Gift Shop', 'Gift Shop', 'shop', '', '', false, false, 72),
('HBL Kayak Rental', 'Kayak Rental', 'activities', '', '', false, false, 73),
('Tutka Bay Lodge', 'Lodge · Kachemak Bay', 'outoftown', '', '', false, false, 74),
('AK Bus Company', 'Bus Service', 'outoftown', '', '', false, false, 75)
) as v(name, cat, section, phone, url, sponsor, govt, sort_order)
where not exists (select 1 from public.directory d where d.name = v.name);
