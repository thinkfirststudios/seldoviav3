/* Default content for the home "of the day" widget. Editable in the admin
   (⚙️ Home Extra) — the admin saves overrides into the Supabase `settings`
   table (keys: facts, words, fundays), and these are the built-in fallbacks.
   Shared by home-extra.js (home page) and admin.js (editor). Plain strings so
   they edit cleanly in a textarea: one item per line. */
window.EXTRA_DEFAULTS = {
  // Alaska fact of the day — one fact per line.
  facts: [
    'Seldovia’s name comes from the Russian "Seldevoy," meaning "herring bay."',
    "There is no road to Seldovia — you arrive by ferry, small plane, or water taxi.",
    "Alaska has more coastline than all other U.S. states combined, about 34,000 miles.",
    "Kachemak Bay is one of the most productive estuaries in the world.",
    "At Seldovia’s latitude, midsummer brings well over 18 hours of daylight.",
    "Alaska is the only U.S. state whose name is typed on one row of a keyboard.",
    "Denali, at 20,310 feet, is the highest peak in North America.",
    "Seldovia’s historic boardwalk once ran along the whole waterfront on pilings over the tide.",
    "Alaska has roughly 3 million lakes and more than 100,000 glaciers.",
    "Kachemak Bay tides swing more than 20 feet — among the largest in the United States.",
    "The 1964 Good Friday earthquake dropped Seldovia’s land several feet, reshaping the shoreline.",
    "Halibut caught near Seldovia can top 300 pounds.",
    "Alaska sits so far west that part of it crosses into the Eastern Hemisphere.",
    "Sea otters, once nearly gone from these waters, are again common in Kachemak Bay.",
    "Seldovia is home to the Seldovia Village Tribe, an active Alaska Native community.",
    "Bald eagles are a daily sight along the Seldovia waterfront.",
    "Alaska was purchased from Russia in 1867 for about two cents an acre.",
    "The Otterbahn Trail winds from town to Outside Beach through coastal spruce forest.",
    "Kachemak Bay State Park, across the water, was Alaska’s first state park.",
    "In winter, Seldovia can drop to just over 5 hours of daylight.",
    "Wild blueberries, salmonberries, and highbush cranberries grow all around Seldovia.",
    "The Alaska Marine Highway ferries are officially part of the U.S. National Highway System.",
  ].join("\n"),

  // Word of the day — one per line, "Word — definition".
  words: [
    "Petrichor — The earthy scent after rain on dry ground.",
    "Halcyon — Calm, peaceful, and happy — like a still day on the bay.",
    "Littoral — Of or on the shore between high and low tide.",
    "Nautical — Relating to sailors, ships, or navigation.",
    "Gloaming — Twilight; the soft light after sunset.",
    "Estuary — Where a river’s fresh water meets the sea’s tide.",
    "Boreal — Of the northern forests and their cool climate.",
    "Fathom — A unit of water depth (6 feet); also, to understand deeply.",
    "Slough — A slow, marshy channel of water (as in Songs on the Slough).",
    "Aurora — Natural light display in the northern night sky.",
    "Weir — A small dam or fence set in a stream to catch fish.",
    "Cove — A small, sheltered bay.",
    "Tidepool — A rocky pool left full of sea life at low tide.",
    "Skiff — A small, light boat for shallow water.",
    "Verdant — Green with growing plants; lush.",
    "Mariner — A sailor; one who navigates the sea.",
  ].join("\n"),

  // Fun day of the day — one per line, "MM-DD Name" (non-political only).
  fundays: [
    "01-01 New Year’s Day",
    "02-02 Groundhog Day",
    "03-14 Pi Day",
    "04-22 Earth Day",
    "06-08 World Oceans Day",
    "06-21 Summer Solstice",
    "07-11 National Blueberry Muffin Day",
    "08-09 National Book Lovers Day",
    "08-16 National Roller Coaster Day",
    "09-19 Talk Like a Pirate Day",
    "10-04 National Taco Day",
    "11-17 National Take a Hike Day",
    "12-21 Winter Solstice",
  ].join("\n"),
};
