-- Migrate the 6 built-in bulletin notices into the database so they're editable in the admin.
-- Run ONCE in Supabase SQL Editor. Safe to re-run (skips ones already present by title).
insert into public.bulletin (category, title, body, posted_by, starts_on, link, published)
select v.category, v.title, v.body, v.posted_by, v.starts_on::date, null, true
from (values
('Announcement','Seldovia Booster Club Annual Auction','The Seldovia Sea Otters Booster Club invites the community to an evening of great food, exciting auctions, and a cash raffle supporting local middle and high school students.','Sea Otters Booster Club','2026-07-23'),
('Civic','City Council Work Session — July 27','Residents are invited to the Council Work Session on Monday, July 27 at 5:00 p.m., in person at the Council Chambers, 260 Seldovia Street.','City of Seldovia','2026-07-22'),
('Class','Kuspuk Sewing Class','Learn to sew a traditional Kuspuk in a three-day class led by Angel Oliveira. New sewers and experienced hands are both welcome.','Community Class','2026-07-20'),
('Announcement','Susan B. English Community Pool — summer schedule','Lap swim, water aerobics, family swim, and free community swim sessions run throughout the week all summer long.','Susan B. English School','2026-07-15'),
('Jobs','SVT Health & Wellness is hiring','Healthcare professionals wanted for positions in Seldovia and Homer.','Seldovia Village Tribe','2026-07-10'),
('Notice','Road closure — C Street','C Street is closed to through traffic. Please plan an alternate route.','City of Seldovia','2026-07-07')
) as v(category, title, body, posted_by, starts_on)
where not exists (select 1 from public.bulletin b where b.title = v.title);
