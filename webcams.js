/* Live webcam players — attaches HLS streams to <video data-hls="…m3u8">.
   Uses hls.js where needed; Safari/iOS play HLS natively. Loads lazily when
   the player scrolls into view so the page isn't fetching video up top. */
(function(){
  var vids = Array.prototype.slice.call(document.querySelectorAll(".wc-video[data-hls]"));
  if(!vids.length) return;

  function start(video){
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

  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ start(en.target); io.unobserve(en.target); } });
    }, { rootMargin:"200px" });
    vids.forEach(function(v){ io.observe(v); });
  } else {
    vids.forEach(start);
  }
})();
