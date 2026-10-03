/* Live webcam players.
   1) HLS cams (WebCOOS dock cams): attaches <video data-hls="…m3u8"> via hls.js
      (Safari/iOS play HLS natively). Loaded lazily on scroll-into-view.
   2) Snapshot cam (Seldovia Harbor — a private AXIS cam served HTTP-only):
      <img class="wc-snap" data-snap="host/path"> is refreshed on a timer so it
      looks live, routed over HTTPS through PROXY (the site is HTTPS, the cam is
      not, so a direct embed would be blocked as mixed content).
      PROXY is the ONE line to change to move to a self-hosted proxy
      (see supabase/functions/harbor-cam). */
(function(){

  /* ---------- HLS video cams ---------- */
  var vids = Array.prototype.slice.call(document.querySelectorAll(".wc-video[data-hls]"));
  function startVid(video){
    if(video.dataset.started) return;
    video.dataset.started = "1";
    var src = video.dataset.hls;
    var card = video.closest(".webcam-card");
    function fail(){ if(card) card.classList.add("wc-offline"); }

    if(video.canPlayType("application/vnd.apple.mpegurl")){ // Safari / iOS
      video.src = src;
      video.addEventListener("error", fail);
      video.play().catch(function(){});
    } else if(window.Hls && window.Hls.isSupported()){
      var hls = new Hls({ liveDurationInfinity:true, lowLatencyMode:true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function(){ video.play().catch(function(){}); });
      hls.on(Hls.Events.ERROR, function(e, data){ if(data && data.fatal) fail(); });
    } else {
      fail();
    }
  }
  if(vids.length){
    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting){ startVid(en.target); io.unobserve(en.target); } });
      }, { rootMargin:"200px" });
      vids.forEach(function(v){ io.observe(v); });
    } else {
      vids.forEach(startVid);
    }
  }

  /* ---------- Snapshot cams (Harbor) ---------- */
  function PROXY(origin){ return "https://wsrv.nl/?url=" + encodeURIComponent(origin) + "&w=1280&output=jpg&q=80"; }
  var snaps = Array.prototype.slice.call(document.querySelectorAll(".wc-snap[data-snap]"));
  snaps.forEach(function(img){
    var origin = img.dataset.snap;
    var card = img.closest(".webcam-card");
    function refresh(){
      if(document.hidden) return;                 // don't fetch on a hidden tab
      var url = PROXY(origin) + "&t=" + Date.now();
      var pre = new Image();                        // preload, then swap → no flicker
      pre.onload = function(){ img.src = url; if(card) card.classList.remove("wc-offline"); };
      pre.onerror = function(){ if(card) card.classList.add("wc-offline"); };
      pre.src = url;
    }
    refresh();
    setInterval(refresh, 6000);
    document.addEventListener("visibilitychange", function(){ if(!document.hidden) refresh(); });
  });

  /* ---------- Click the preview to view it full screen (Jenny) ---------- */
  function goFullscreen(el){
    var r = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen || el.msRequestFullscreen;
    if(r){ try { r.call(el); } catch(e){} }
  }
  /* Phones: native fullscreen takes over the screen with no visible way out (the Harbor still image
     has no controls at all), so older visitors got stuck (Alex). On phones we open our own full-screen
     view instead, with a big Close button, tap-anywhere-to-close, and the phone's Back button closing it.
     Desktop keeps native fullscreen (Esc exits). */
  var isPhone = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  function openView(player){
    player.classList.add("wc-expanded");
    document.body.style.overflow = "hidden";
    var x = document.createElement("button");
    x.type = "button"; x.className = "wc-close"; x.setAttribute("aria-label", "Close full screen");
    x.textContent = "✕ Close";
    player.appendChild(x);
    x.addEventListener("click", function(e){ e.stopPropagation(); history.back(); });
    history.pushState({ wcView: 1 }, "");
    function onPop(){
      player.classList.remove("wc-expanded");
      document.body.style.overflow = "";
      x.remove();
      window.removeEventListener("popstate", onPop);
    }
    window.addEventListener("popstate", onPop);
  }
  Array.prototype.slice.call(document.querySelectorAll(".wc-video, .wc-snap")).forEach(function(el){
    el.style.cursor = "zoom-in";
    el.title = isPhone ? "Tap to view full screen" : "Click to view full screen";
    el.addEventListener("click", function(){
      if(!isPhone){ goFullscreen(el); return; }
      var player = el.closest(".wc-player") || el.parentElement;
      if(player.classList.contains("wc-expanded")) history.back();   // tap anywhere to close
      else openView(player);
    });
  });

})();
