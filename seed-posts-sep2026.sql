-- ============================================================
--  Seldovia Blog — September 2026 posts (from Jenny's Facebook)
--  The live blog reads the public.posts table, so new posts must be
--  inserted here (not the static GAZETTE fallback in app.js).
--  Run ONCE in Supabase SQL Editor. Idempotent: skips a title already present.
--  Images are the local files in images/gazette/ (already in the repo).
--  NOTE: the Sep 2 "under contract", Sep 9 "Just 5 days on the market", and
--  Patriot Day posts are intentionally omitted — they are already in the DB.
-- ============================================================
insert into public.posts (title, body, excerpt, category, post_date, image_url, published)
select v.title, v.body, v.excerpt, v.category, v.post_date::date, v.image_url, v.published
from (values
('Two available Seldovia land listings', 'Ready to take the next step? Reach out to Jenny to schedule a showing, ask questions, or learn more about these available land listings. Want to take a closer look? [Click here to explore the properties](real-estate.html)!', 'Ready to take the next step? Reach out to Jenny to schedule a showing, ask questions, or learn more about these available land listings.', 'Real Estate', '2026-09-14', 'images/gazette/2026-09-15.jpg', true),
('Happy Grandparents Day!', 'Grandparents are more than just grandparents. 🥰

They''re the ones who have time for one more story.

The ones who teach you how to do things their way. The ones who cheer you on, share their wisdom, and somehow always have a snack nearby. 😉

Today, we''re celebrating the grandparents who help make a house feel like home and a community feel like family.

Happy Grandparents Day!', 'Today, we''re celebrating the grandparents who help make a house feel like home and a community feel like family.', 'Community', '2026-09-13', 'images/gazette/2026-09-14_1.jpg', true),
('Sunny Hill Retreat', 'Welcome to Sunny Hill Retreat, a beautifully updated log home perched high on one of Seldovia''s sunniest hillsides, with sweeping views across Seldovia Bay and the surrounding mountains.

🌿 3 bedrooms | 2 three-quarter baths
☀️ All-day sunshine
🌊 Views of Seldovia Slough & the mountains surrounding Seldovia Bay
🪵 Beautifully restored log construction
🔥 2 heating stoves
🛠️ Detached workshop with electricity
🚗 Covered two-vehicle carport
🌹 Wild roses & mature raspberry bushes
📍 Convenient walk everywhere in town location

[Contact Jenny to schedule a showing](contact.html?topic=Real%20Estate) — call or text (907) 406-0044', 'Welcome to Sunny Hill Retreat, a beautifully updated log home perched high on one of Seldovia''s sunniest hillsides, with sweeping views across Seldovia Bay and the surrounding mountains.', 'Real Estate', '2026-09-13', 'images/gazette/2026-09-13.jpg', true),
('What''s your favorite month in Seldovia?', 'I used to think I''d have an easy answer to this question!

Every time I think I''ve picked a favorite, another season gives me a reason to change my mind. 😂

Maybe that''s the problem with Seldovia, you don''t really get one favorite month. You get a new reason to love the place all year long.', 'Every time I think I''ve picked a favorite, another season gives me a reason to change my mind.', 'Living Here', '2026-09-11', 'images/gazette/2026-09-11_2.jpg', true),
('Heart-of-town home under contract', 'A huge congratulations to the sellers and buyers of this wonderful heart-of-town property!

Just steps from Susan B. English School and within walking distance of town, it was a special opportunity for convenient Seldovia living. Wishing everyone involved all the best in what comes next! 😄', 'A huge congratulations to the sellers and buyers of this wonderful heart-of-town property!', 'Real Estate', '2026-09-07', 'images/gazette/2026-09-07_2.jpg', true),
('Happy Labor Day, Seldovia!', 'Happy Labor Day, Seldovia! 💙

Here''s to the people who keep Seldovia moving whether you''re working hard, lending a hand, running a local business, building something, or simply keeping the coffee pot full. 😉☕

Today is a good excuse to slow down, enjoy the long weekend, and appreciate the people who make this little community such a special place to call home.', 'Here''s to the people who keep Seldovia moving whether you''re working hard, lending a hand, running a local business, building something, or simply keeping the coffee pot full.', 'Community', '2026-09-07', 'images/gazette/2026-09-07_1.jpg', true),
('A family''s Alaska cabin dream come true', 'It was such a joy to help this family explore properties, find the right piece of land, and eventually see their vision come to life in the form of their beautiful Alaska cabin.

Thank you for trusting me to be part of your journey and for sharing such incredibly kind words! 😄', 'It was such a joy to help this family explore properties, find the right piece of land, and eventually see their vision come to life in the form of their beautiful Alaska cabin.', 'Kind Words', '2026-09-06', 'images/gazette/2026-09-06.jpg', true),
('Inside Beach or Outside Beach?', 'If you know Seldovia, you know this is a serious question. 😂

Are you choosing Inside Beach for the calm water, easy strolls, and peaceful views?

Or are you an Outside Beach person who''d rather have the open ocean, big views, and a little more adventure?

If you only had one day, which beach are you choosing? 🤔😄', 'If you know Seldovia, you know this is a serious question. Are you an Inside Beach person, or an Outside Beach person?', 'Community', '2026-09-05', 'images/gazette/2026-09-05.jpg', true),
('What do you do on a slow Sunday?', 'Honestly? Sometimes… absolutely nothing. And that''s the beauty of it! ✨

☕ A slow morning with coffee.
🌱 A little extra time in the garden.
🥾 Walking a trail without checking the clock.
⛪ Meeting up with friends at church, or
🏡 catching up with a neighbor.
📖 Reading a book you''ve been meaning to finish.
🍳 Making a good meal and actually sitting down to enjoy it.
🔨 Maybe working on a little project around the house.
🌤️ And if the weather is right, simply finding a spot to sit outside and watch the day go by.

What''s your favorite way to spend a slow Sunday? 💛', 'Honestly? Sometimes… absolutely nothing. And that''s the beauty of it!', 'Living Here', '2026-09-04', 'images/gazette/2026-09-04.jpg', true),
('How did you end up in Seldovia?', 'Was it a carefully thought-out life decision… or did you visit once and accidentally start calling it home? 🤔😊', 'Was it a carefully thought-out life decision… or did you visit once and accidentally start calling it home?', 'Community', '2026-08-31', 'images/gazette/2026-08-31.jpg', true)
) as v(title, body, excerpt, category, post_date, image_url, published)
where not exists (select 1 from public.posts p where p.title = v.title);
