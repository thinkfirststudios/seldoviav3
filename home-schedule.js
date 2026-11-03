/* Home "What's on this week" box (Jenny #25; switched to Tockify's own mini widget, Jenny Nov 2).
   The widget loads straight from Tockify (calendar "seldovia", the same one the Calendar page embeds),
   so new events show up the moment they're added in Tockify. No copy of the calendar is kept here.
   If Tockify doesn't load, a tidy link to the full calendar stays in its place — never anything broken. */
(function(){
  const box=document.querySelector("#todaySchedule");
  if(!box) return;
  box.innerHTML=`<div class="today-sched">
      <div class="ts-head"><h3>What’s on this week</h3></div>
      <div class="ts-tockify"><div data-tockify-component="mini" data-tockify-calendar="seldovia"></div></div>
      <p class="ts-empty" id="tsWait">Loading this week’s events…</p>
      <a class="ts-all" href="calendar.html">Full community calendar →</a></div>`;
  const wait=box.querySelector("#tsWait"), wrap=box.querySelector(".ts-tockify");
  const loaded=()=>wrap.querySelector("iframe,[class*='tockify']")!==null;
  const giveUp=()=>{ if(!loaded() && wait) wait.textContent="Meetings, markets, music and more — see the community calendar."; };
  const s=document.createElement("script");
  s.setAttribute("data-cfasync","false"); s.setAttribute("data-tockify-script","embed");
  s.src="https://public.tockify.com/browser/embed.js";
  s.onerror=giveUp; document.body.appendChild(s);
  // Hide the "loading" line as soon as Tockify draws the widget; if it never does, show the friendly line.
  const t0=Date.now(), iv=setInterval(()=>{
    if(loaded()){ wait.remove(); clearInterval(iv); }
    else if(Date.now()-t0>10000){ giveUp(); clearInterval(iv); }
  },300);
})();
