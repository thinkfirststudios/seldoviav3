/* "Add your listing" submission.
   The site is static (GitHub Pages), so the old Netlify POST returned 405.
   This submits the form with JavaScript into Supabase instead:
     - any attached photo/logo -> public "uploads" bucket
     - all fields -> directory_submissions (status "pending", Jenny reviews)
   then sends the visitor to thanks.html.
   Needs the policies in seed-public-forms.sql to be applied once in Supabase. */
(function(){
  var form = document.getElementById("dirForm");
  if(!form || !window.db) return;
  if(window.HumanCheck){ // status line right under "Submit for review" (inside the step that appears after picking a type)
    var hcLine = document.createElement("p"); hcLine.className = "human-check"; hcLine.setAttribute("aria-live", "polite");
    var sb = form.querySelector('button[type="submit"]'); if(sb) sb.insertAdjacentElement("afterend", hcLine);
    HumanCheck.attach(form, sb ? hcLine : null);
  }

  form.addEventListener("submit", async function(e){
    e.preventDefault();
    if(form["bot-field"] && form["bot-field"].value) return; // honeypot: silently drop bots

    var btn = form.querySelector('button[type="submit"]');
    if(btn) btn.disabled = true;

    try{
      // Collect every enabled (visible) field. Disabled hidden groups don't submit.
      var fd = new FormData(form), data = {};
      fd.forEach(function(v, k){
        if(k === "bot-field" || k === "form-name" || k === "photo") return;
        if(typeof v !== "string" || v === "") return;
        if(data[k] !== undefined) data[k] = [].concat(data[k], v); // multi (e.g. tags)
        else data[k] = v;
      });

      var listing_type = data.listing_type || "";
      var display_name = data.name || data.couple_names || data.family_name ||
                         data.business_name || data.org_name || "(unnamed)";

      // Optional photo/logo -> uploads bucket
      var photo_url = null;
      var fileInput = form.querySelector('input[type="file"][name="photo"]');
      var file = fileInput && fileInput.files && fileInput.files[0];
      if(file){
        try{
          var ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
          var path = "dir/" + Date.now() + "-" + Math.round(1e6*Math.random()) + "." + ext;
          var up = await db.storage.from("uploads").upload(path, file, { contentType: file.type || "image/jpeg" });
          if(!up.error){ var pub = db.storage.from("uploads").getPublicUrl(path); photo_url = pub.data && pub.data.publicUrl; }
        }catch(_){ /* non-blocking: submit the listing even if the photo upload fails */ }
      }

      // saved through the "Are you human?" check (human-check.js -> submit-form function); always pending until Jenny approves
      var sent = await HumanCheck.send(form, "directory", {
        listing_type: listing_type, display_name: display_name, photo_url: photo_url, data: data
      });
      if(!sent) throw new Error("The human check didn't go through. Please refresh the page and try again.");

      window.location.href = "thanks.html";
    }catch(err){
      if(btn) btn.disabled = false;
      alert("Sorry — we couldn't submit that just now. Please try again in a moment.\n\nIf it keeps happening, email alex@thinkfirststudios.com.\n\n(" + (err && err.message ? err.message : err) + ")");
    }
  });
})();
