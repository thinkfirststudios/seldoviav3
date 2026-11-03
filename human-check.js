/* "Are you human?" check for the public forms (Jenny, Nov 2 2026): no picture puzzles, no squiggly words.
   While someone fills in a form, their browser quietly solves a small math puzzle from our Supabase
   function (supabase/functions/submit-form), then the form is sent through that function, which checks
   the answer before saving. A friendly line under the button shows the progress.
   Usage:  HumanCheck.attach(form, statusEl?)   then   await HumanCheck.send(form, "message"|"directory", data)  -> true/false */
(function(){
  var FN = "https://ycnbgyewuyietkhjxorz.supabase.co/functions/v1/submit-form";
  var MSG = {
    working: "🤖 Quick check that you're a human, not a robot…",
    done: "✅ Human confirmed! No puzzles needed.",
    fail: "Couldn't run the human check. Please refresh the page and try again."
  };
  var enc = new TextEncoder();
  function hex(buf){ return Array.from(new Uint8Array(buf), function(b){ return b.toString(16).padStart(2,"0"); }).join(""); }

  // Try numbers 0..maxnumber until sha256(salt + n) matches the challenge (a few hundred at a time so the page stays smooth).
  async function solve(c){
    for(var start = 0; start <= c.maxnumber; start += 400){
      var tries = [];
      for(var n = start; n < start + 400 && n <= c.maxnumber; n++) tries.push(n);
      var hashes = await Promise.all(tries.map(function(n){ return crypto.subtle.digest("SHA-256", enc.encode(c.salt + n)); }));
      for(var i = 0; i < hashes.length; i++){
        if(hex(hashes[i]) === c.challenge) return { algorithm: c.algorithm, challenge: c.challenge, number: tries[i], salt: c.salt, signature: c.signature };
      }
    }
    throw new Error("no solution");
  }

  function begin(form){
    form._hc.solution = fetch(FN, { cache: "no-store" })
      .then(function(r){ if(!r.ok) throw new Error("challenge " + r.status); return r.json(); })
      .then(solve)
      .then(function(s){ say(form, MSG.done, "ok"); return s; });
    form._hc.solution.catch(function(){ say(form, MSG.fail, "bad"); });
    form._hc.started = Date.now();
  }

  function say(form, text, state){
    var el = form._hc.status; if(!el) return;
    el.textContent = text; el.setAttribute("data-state", state || "");
  }

  function attach(form, statusEl){
    if(!form || form._hc) return;
    var el = statusEl;
    if(!el){ el = document.createElement("p"); el.className = "human-check"; el.setAttribute("aria-live", "polite");
      var btn = form.querySelector('button[type="submit"]');
      var row = btn && btn.parentElement !== form ? btn.parentElement : btn;
      if(row) row.insertAdjacentElement("afterend", el); else form.appendChild(el); }
    form._hc = { status: el, loaded: Date.now() };
    say(form, MSG.working, "");
    // Start as soon as the person touches the form (or right away if it's already on screen), so it's done before they hit Send.
    var go = function(){ if(!form._hc.solution) begin(form); };
    form.addEventListener("focusin", go, { once: true });
    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(es){ if(es.some(function(e){ return e.isIntersecting; })){ io.disconnect(); go(); } });
      io.observe(form);
    } else go();
  }

  async function send(form, kind, data){
    attach(form);
    if(!form._hc.solution) begin(form);
    var solution;
    try { solution = await form._hc.solution; }
    catch(_){ begin(form); solution = await form._hc.solution; } // one retry with a fresh puzzle
    var hp = form.querySelector('[name="website"][tabindex="-1"], [name="bot-field"]');
    var r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: kind, solution: solution, website: hp ? hp.value : "", elapsed: Date.now() - form._hc.loaded, data: data }) });
    var out = {}; try { out = await r.json(); } catch(_){}
    form._hc.solution = null; begin(form); // fresh puzzle ready in case they send another
    return r.ok && out.ok === true;
  }

  window.HumanCheck = { attach: attach, send: send };
})();
