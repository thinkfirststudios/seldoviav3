/* Seldovia.com admin — Jenny signs in to post/edit a daily photo, a blog post, a
   bulletin notice, or a real-estate listing. Everything writes to Supabase
   (see db.js / SUPABASE_SETUP.md). If the backend isn't configured yet, this
   shows a friendly setup notice. */
(function(){
  const $=(s,el=document)=>el.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const app=$("#adminApp");
  const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtDate=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MONTHS[+m-1]} ${+day}, ${y}`; };
  const todayISO=()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const slugify=s=>String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);

  const BLOG_CATS=["Community","Events","Living Here","Real Estate","Business","Outdoors","Announcements"];
  const BUL_CATS=["Notice","Event","For Sale","Free","Wanted","Service","Lost & Found","Volunteer"];

  // Category <select> with an "Other…" escape hatch that reveals a text box.
  function catField(id, options){
    return `<select id="${id}">${options.map(o=>`<option>${esc(o)}</option>`).join("")}<option value="__other">Other…</option></select>
      <input id="${id}-other" type="text" placeholder="Type a category" style="margin-top:.45rem" hidden>`;
  }
  function wireCat(id){ const sel=$("#"+id), other=$("#"+id+"-other");
    sel.addEventListener("change",()=>{ const o=sel.value==="__other"; other.hidden=!o; if(o) other.focus(); }); }
  function readCat(id, fallback){ const sel=$("#"+id); return sel.value==="__other" ? ($("#"+id+"-other").value.trim()||fallback) : sel.value; }
  function fillCat(id, value, options){ const sel=$("#"+id), other=$("#"+id+"-other");
    if(value && options.includes(value)){ sel.value=value; other.hidden=true; other.value=""; }
    else if(value){ sel.value="__other"; other.hidden=false; other.value=value; }
    else { sel.selectedIndex=0; other.hidden=true; other.value=""; } }

  function compressImage(file, maxW, quality){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{ const scale=Math.min(1, maxW/img.width); const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
        const c=document.createElement("canvas"); c.width=w; c.height=h; c.getContext("2d").drawImage(img,0,0,w,h);
        c.toBlob(b=>b?resolve(b):reject(new Error("compress failed")), "image/jpeg", quality); };
      img.onerror=()=>reject(new Error("image load failed")); img.src=URL.createObjectURL(file);
    });
  }
  async function uploadImage(bucket, file, prefix){
    const blob=await compressImage(file, 1600, 0.82);
    const path=`${prefix}-${Date.now()}-${Math.round(performance.now())}.jpg`;
    const {error}=await db.storage.from(bucket).upload(path, blob, {contentType:"image/jpeg"});
    if(error) throw error;
    return db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  function boot(){
    if(!window.db){
      app.innerHTML=`<div class="info-block" style="max-width:640px">
        <h4>Backend not connected yet</h4>
        <p style="color:var(--text-soft);margin-top:.5rem">The admin needs its Supabase details. Follow
        <b>SUPABASE_SETUP.md</b>, paste the two values into <b>db.js</b>, and this page turns on.</p></div>`;
      return;
    }
    db.auth.getSession().then(({data:{session}})=>{ session?renderApp():renderLogin(); });
    db.auth.onAuthStateChange((_e,s)=>{ s?renderApp():renderLogin(); });
  }

  function renderLogin(){
    app.innerHTML=`<form id="loginForm" class="info-block" style="max-width:420px">
      <div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="username" required></div>
      <div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required></div>
      <button class="btn btn-primary" type="submit">Sign in</button>
      <p id="loginMsg" class="form-note" style="color:var(--accent-ink)"></p></form>`;
    $("#loginForm").addEventListener("submit",async e=>{ e.preventDefault();
      $("#loginMsg").textContent="Signing in…";
      const {error}=await db.auth.signInWithPassword({email:$("#email").value.trim(),password:$("#pw").value});
      if(error)$("#loginMsg").textContent=error.message;
    });
  }

  const TABS=[
    {key:"photo",    label:"📷 Daily Photo", render:renderPhotoTab},
    {key:"blog",     label:"✍️ Blog Post",   render:renderBlogTab},
    {key:"bulletin", label:"📰 News",        render:renderBulletinTab},
    {key:"listing",  label:"🏡 Listings",    render:renderListingTab},
    {key:"messages", label:"📨 Messages",    render:renderMessagesTab},
    {key:"settings", label:"⚙️ Home Extra",  render:renderSettingsTab},
    {key:"feature",  label:"⭐ Explore Card", render:renderFeatureTab},
  ];
  function renderApp(){
    app.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1.2rem">
        <div class="admin-tabs" role="tablist">
          ${TABS.map((t,i)=>`<button class="admin-tab ${i===0?"is-active":""}" data-tab="${t.key}" type="button">${t.label}</button>`).join("")}
        </div>
        <button class="btn btn-ghost" id="logoutBtn" type="button">Sign out</button>
      </div>
      ${TABS.map((t,i)=>`<div id="tab-${t.key}" ${i===0?"":"hidden"}></div>`).join("")}`;
    $("#logoutBtn").addEventListener("click",()=>db.auth.signOut());
    app.querySelectorAll(".admin-tab").forEach(b=>b.addEventListener("click",()=>{
      app.querySelectorAll(".admin-tab").forEach(x=>x.classList.toggle("is-active",x===b));
      TABS.forEach(t=>{ $("#tab-"+t.key).hidden = t.key!==b.dataset.tab; });
    }));
    TABS.forEach(t=>t.render());
  }

  /* ---------------- DAILY PHOTO ---------------- */
  let editPhoto=null;
  function renderPhotoTab(){
    $("#tab-photo").innerHTML=`
      <form class="info-block" id="photoForm" style="max-width:640px">
        <h4 id="ph-head">Add today's photo</h4>
        <p style="color:var(--text-soft);font-size:.92rem;margin:.3rem 0 1rem">It appears at the top of the Photo Journal, then settles into that month's gallery.</p>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="ph-date">Date the photo is for</label><input id="ph-date" type="date" required></div>
          <div class="field"><label for="ph-cap">Caption</label><input id="ph-cap" placeholder="Morning light on the harbor"></div>
        </div>
        <div class="field"><label for="ph-img">Photo <span class="req">*</span></label><input id="ph-img" type="file" accept="image/*" required><span class="hint" id="ph-imghint">Auto-resized on upload.</span></div>
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
          <button class="btn btn-primary" type="submit" id="ph-btn">Post photo</button>
          <button class="btn btn-ghost" type="button" id="ph-cancel" hidden>Cancel edit</button>
        </div>
        <p id="ph-msg" class="form-note"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Recent photos</h3>
      <div id="photoList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    $("#ph-date").value=todayISO();
    $("#photoForm").addEventListener("submit",onPostPhoto);
    $("#ph-cancel").addEventListener("click",resetPhoto);
    loadPhotos();
  }
  function resetPhoto(){ editPhoto=null; $("#photoForm").reset(); $("#ph-date").value=todayISO();
    $("#ph-img").required=true; $("#ph-imghint").textContent="Auto-resized on upload.";
    $("#ph-head").textContent="Add today's photo"; $("#ph-btn").textContent="Post photo"; $("#ph-cancel").hidden=true; }
  function fillPhoto(p){ editPhoto=p.id; $("#ph-date").value=p.taken_on; $("#ph-cap").value=p.caption||"";
    $("#ph-img").required=false; $("#ph-imghint").textContent="Leave empty to keep the current photo.";
    $("#ph-head").textContent="Edit photo"; $("#ph-btn").textContent="Save changes"; $("#ph-cancel").hidden=false;
    $("#photoForm").scrollIntoView({behavior:"smooth",block:"start"}); }
  async function onPostPhoto(e){
    e.preventDefault();
    const btn=$("#ph-btn"), msg=$("#ph-msg");
    btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent=editPhoto?"Saving…":"Uploading photo…";
    try{
      const file=$("#ph-img").files[0];
      const row={ taken_on:$("#ph-date").value, caption:$("#ph-cap").value.trim()||null };
      if(file){ msg.textContent="Uploading photo…"; row.image_url=await uploadImage("gallery", file, "photo"); }
      if(editPhoto){ const {error}=await db.from("photos").update(row).eq("id",editPhoto); if(error) throw error; }
      else { if(!file) throw new Error("Please choose a photo."); const {error}=await db.from("photos").insert(row); if(error) throw error; }
      msg.style.color="var(--open)"; msg.textContent=editPhoto?"Saved!":"Posted! It's live in the Photo Journal.";
      resetPhoto(); loadPhotos();
    }catch(err){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+(err.message||err); }
    finally{ btn.disabled=false; }
  }
  async function loadPhotos(){
    const list=$("#photoList");
    const {data,error}=await db.from("photos").select("*").order("taken_on",{ascending:false}).limit(48);
    if(error){ list.innerHTML=`<p style="color:var(--accent-ink)">${esc(error.message)}</p>`; return; }
    if(!data.length){ list.innerHTML='<p style="color:var(--text-soft)">No photos yet.</p>'; return; }
    list.innerHTML=`<div class="admin-photo-grid">`+data.map(p=>`<figure class="admin-photo">
      <img src="${esc(p.image_url)}" alt="${esc(p.caption||"")}" loading="lazy">
      <figcaption>${esc(fmtDate(p.taken_on))}${p.caption?" · "+esc(p.caption):""}</figcaption>
      <div class="admin-row-btns"><button class="btn btn-ghost" data-edit="${p.id}" type="button">Edit</button><button class="btn btn-ghost" data-del="${p.id}" type="button">Delete</button></div></figure>`).join("")+`</div>`;
    bindEdit(list,data,fillPhoto); bindDelete(list,"photos",loadPhotos);
  }

  /* ---------------- BLOG POST ---------------- */
  let editPost=null;
  function renderBlogTab(){
    $("#tab-blog").innerHTML=`
      <form class="info-block" id="postForm" style="max-width:640px">
        <h4 id="p-head">Write a blog post</h4>
        <div class="field"><label for="p-title">Title <span class="req">*</span></label><input id="p-title" required></div>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="p-date">Date</label><input id="p-date" type="date" required></div>
          <div class="field"><label for="p-cat">Category</label>${catField("p-cat",BLOG_CATS)}</div>
        </div>
        <div class="field"><label for="p-body">Post</label><textarea id="p-body" rows="7" placeholder="Write your post…"></textarea></div>
        <div class="field"><label for="p-img">Photo <span class="opt">(optional)</span></label><input id="p-img" type="file" accept="image/*"><span class="hint" id="p-imghint"></span></div>
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
          <button class="btn btn-primary" type="submit" id="pubBtn">Publish post</button>
          <button class="btn btn-ghost" type="button" id="p-cancel" hidden>Cancel edit</button>
        </div>
        <p id="postMsg" class="form-note"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Published posts</h3>
      <div id="postList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    $("#p-date").value=todayISO(); wireCat("p-cat");
    $("#postForm").addEventListener("submit",onPublish);
    $("#p-cancel").addEventListener("click",resetPost);
    loadPosts();
  }
  function resetPost(){ editPost=null; $("#postForm").reset(); $("#p-date").value=todayISO(); fillCat("p-cat","",BLOG_CATS);
    $("#p-imghint").textContent=""; $("#p-head").textContent="Write a blog post"; $("#pubBtn").textContent="Publish post"; $("#p-cancel").hidden=true; }
  function fillPost(p){ editPost=p.id; $("#p-title").value=p.title||""; $("#p-date").value=p.post_date; fillCat("p-cat",p.category,BLOG_CATS);
    $("#p-body").value=p.body||""; $("#p-imghint").textContent=p.image_url?"Leave empty to keep the current photo.":"";
    $("#p-head").textContent="Edit post"; $("#pubBtn").textContent="Save changes"; $("#p-cancel").hidden=false;
    $("#postForm").scrollIntoView({behavior:"smooth",block:"start"}); }
  async function onPublish(e){
    e.preventDefault();
    const btn=$("#pubBtn"), msg=$("#postMsg");
    btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent=editPost?"Saving…":"Publishing…";
    try{
      const body=$("#p-body").value.trim();
      const row={ title:$("#p-title").value.trim(), body, post_date:$("#p-date").value,
        category:readCat("p-cat","Blog"), excerpt:body.length>180?body.slice(0,177).trim()+"…":body, published:true };
      const file=$("#p-img").files[0];
      if(file){ msg.textContent="Uploading photo…"; row.image_url=await uploadImage("blog", file, "post"); }
      if(editPost){ const {error}=await db.from("posts").update(row).eq("id",editPost); if(error) throw error; }
      else { const {error}=await db.from("posts").insert(row); if(error) throw error; }
      msg.style.color="var(--open)"; msg.textContent=editPost?"Saved!":"Published! It's live on the blog.";
      resetPost(); loadPosts();
    }catch(err){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+(err.message||err); }
    finally{ btn.disabled=false; }
  }
  async function loadPosts(){
    const list=$("#postList");
    const {data,error}=await db.from("posts").select("*").order("post_date",{ascending:false});
    if(error){ list.innerHTML=`<p style="color:var(--accent-ink)">${esc(error.message)}</p>`; return; }
    if(!data.length){ list.innerHTML='<p style="color:var(--text-soft)">No posts yet.</p>'; return; }
    list.innerHTML=data.map(p=>`<div class="dir-item" style="align-items:center">
      ${p.image_url?`<img class="d-photo" src="${esc(p.image_url)}" alt="" style="border-radius:8px">`:'<div class="d-ico">✎</div>'}
      <div class="d-main"><div class="d-cat">${esc(fmtDate(p.post_date))} · ${esc(p.category||'')}</div><h4>${esc(p.title)}</h4></div>
      <div class="admin-row-btns"><button class="btn btn-ghost" data-edit="${p.id}" type="button">Edit</button><button class="btn btn-ghost" data-del="${p.id}" type="button">Delete</button></div></div>`).join("");
    bindEdit(list,data,fillPost); bindDelete(list,"posts",loadPosts);
  }

  /* ---------------- BULLETIN ---------------- */
  let editBul=null;
  function renderBulletinTab(){
    $("#tab-bulletin").innerHTML=`
      <form class="info-block" id="bulForm" style="max-width:640px">
        <h4 id="b-head">Post a news item</h4>
        <div class="field"><label for="b-title">Title <span class="req">*</span></label><input id="b-title" required></div>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="b-cat">Category</label>${catField("b-cat",BUL_CATS)}</div>
          <div class="field"><label for="b-by">Posted by</label><input id="b-by" placeholder="Your name / group"></div>
        </div>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="b-date">Date <span class="opt">(optional)</span></label><input id="b-date" type="date"></div>
          <div class="field"><label for="b-event">Calendar event link <span class="opt">(optional)</span></label><input id="b-event" type="url" placeholder="Paste a calendar event link"></div>
        </div>
        <div class="field"><label for="b-link">Flyer / website link <span class="opt">(optional)</span></label><input id="b-link" type="url" placeholder="https://…"></div>
        <div class="field"><label for="b-body">Details</label><textarea id="b-body" rows="4" placeholder="What's happening…"></textarea></div>
        <div class="field"><label for="b-img">Photo <span class="opt">(optional)</span></label><input id="b-img" type="file" accept="image/*"><span class="hint" id="b-imghint"></span></div>
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
          <button class="btn btn-primary" type="submit" id="b-btn">Post notice</button>
          <button class="btn btn-ghost" type="button" id="b-cancel" hidden>Cancel edit</button>
        </div>
        <p id="b-msg" class="form-note"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Posted notices</h3>
      <div id="bulList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    wireCat("b-cat");
    $("#bulForm").addEventListener("submit",onPostBulletin);
    $("#b-cancel").addEventListener("click",resetBul);
    loadBulletin();
  }
  function resetBul(){ editBul=null; $("#bulForm").reset(); fillCat("b-cat","",BUL_CATS); $("#b-imghint").textContent="";
    $("#b-head").textContent="Post a news item"; $("#b-btn").textContent="Post notice"; $("#b-cancel").hidden=true; }
  function fillBul(n){ editBul=n.id; $("#b-title").value=n.title||""; fillCat("b-cat",n.category,BUL_CATS); $("#b-by").value=n.posted_by||"";
    $("#b-date").value=n.starts_on||""; $("#b-link").value=n.link||""; $("#b-event").value=n.event_url||""; $("#b-body").value=n.body||"";
    $("#b-imghint").textContent=n.image_url?"Leave empty to keep the current photo.":"";
    $("#b-head").textContent="Edit notice"; $("#b-btn").textContent="Save changes"; $("#b-cancel").hidden=false;
    $("#bulForm").scrollIntoView({behavior:"smooth",block:"start"}); }
  async function onPostBulletin(e){
    e.preventDefault();
    const btn=$("#b-btn"), msg=$("#b-msg");
    btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent="Saving…";
    try{
      const row={ title:$("#b-title").value.trim(), category:readCat("b-cat","Notice"),
        posted_by:$("#b-by").value.trim()||null, starts_on:$("#b-date").value||null,
        link:$("#b-link").value.trim()||null, body:$("#b-body").value.trim()||null, published:true };
      if(!row.title) throw new Error("Please add a title.");
      // image_url + event_url only added when provided, so posting still works before
      // seed-bulletin-cols.sql adds those columns (avoids "column does not exist").
      const ev=$("#b-event").value.trim(); if(ev) row.event_url=ev;
      const file=$("#b-img").files[0];
      if(file){ msg.textContent="Uploading photo…"; row.image_url=await uploadImage("blog", file, "bulletin"); }
      if(editBul){ const {error}=await db.from("bulletin").update(row).eq("id",editBul); if(error) throw error; }
      else { const {error}=await db.from("bulletin").insert(row); if(error) throw error; }
      msg.style.color="var(--open)"; msg.textContent=editBul?"Saved!":"Posted! It's live on the bulletin board.";
      resetBul(); loadBulletin();
    }catch(err){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+(err.message||err); }
    finally{ btn.disabled=false; }
  }
  async function loadBulletin(){
    const list=$("#bulList");
    const {data,error}=await db.from("bulletin").select("*").order("created_at",{ascending:false});
    if(error){ list.innerHTML=`<p style="color:var(--accent-ink)">${esc(error.message)}</p>`; return; }
    if(!data.length){ list.innerHTML='<p style="color:var(--text-soft)">No notices yet.</p>'; return; }
    list.innerHTML=data.map(n=>`<div class="dir-item" style="align-items:center">
      ${n.image_url?`<img class="d-photo" src="${esc(n.image_url)}" alt="" style="border-radius:8px">`:'<div class="d-ico">📌</div>'}
      <div class="d-main"><div class="d-cat">${esc(n.category||'')}${n.starts_on?" · "+esc(fmtDate(n.starts_on)):""}${n.event_url?' · 📅 event':''}${n.link?' · 🔗 link':''}</div><h4>${esc(n.title)}</h4></div>
      <div class="admin-row-btns"><button class="btn btn-ghost" data-edit="${n.id}" type="button">Edit</button><button class="btn btn-ghost" data-del="${n.id}" type="button">Delete</button></div></div>`).join("");
    bindEdit(list,data,fillBul); bindDelete(list,"bulletin",loadBulletin);
  }

  /* ---------------- LISTINGS ---------------- */
  let editLst=null;
  function renderListingTab(){
    $("#tab-listing").innerHTML=`
      <form class="info-block" id="lstForm" style="max-width:680px">
        <h4 id="l-head">Add a real-estate listing</h4>
        <div class="field"><label for="l-addr">Address <span class="req">*</span></label><input id="l-addr" required placeholder="230 Kachemak St"></div>
        <div class="row-3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.6rem">
          <div class="field"><label for="l-price">Price</label><input id="l-price" placeholder="$475,000"></div>
          <div class="field"><label for="l-status">Status</label>
            <select id="l-status"><option>For Sale</option><option>Pending</option><option>Sold</option><option>Price on request</option></select></div>
          <div class="field"><label for="l-date">Listed on</label><input id="l-date" type="date"></div>
        </div>
        <div class="row-3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.6rem">
          <div class="field"><label for="l-beds">Beds</label><input id="l-beds" placeholder="3"></div>
          <div class="field"><label for="l-baths">Baths</label><input id="l-baths" placeholder="1.5"></div>
          <div class="field"><label for="l-sqft">Sq ft</label><input id="l-sqft" placeholder="1,122"></div>
        </div>
        <div class="field"><label for="l-desc">Description</label><textarea id="l-desc" rows="5" placeholder="Tell buyers about it…"></textarea></div>
        <div class="field"><label for="l-img">Main photo <span class="req">*</span></label><input id="l-img" type="file" accept="image/*" required><span class="hint" id="l-imghint"></span></div>
        <div class="field"><label for="l-more">More photos <span class="opt">(optional, pick several)</span></label><input id="l-more" type="file" accept="image/*" multiple><span class="hint" id="l-morehint"></span></div>
        <div class="field"><label for="l-video">Video link <span class="opt">(optional — YouTube/Vimeo)</span></label><input id="l-video" type="url" placeholder="https://…"></div>
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
          <button class="btn btn-primary" type="submit" id="l-btn">Publish listing</button>
          <button class="btn btn-ghost" type="button" id="l-cancel" hidden>Cancel edit</button>
        </div>
        <p id="l-msg" class="form-note"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Published listings</h3>
      <div id="lstList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    $("#l-date").value=todayISO();
    $("#lstForm").addEventListener("submit",onPostListing);
    $("#l-cancel").addEventListener("click",resetLst);
    loadListings();
  }
  function resetLst(){ editLst=null; $("#lstForm").reset(); $("#l-date").value=todayISO(); $("#l-img").required=true;
    $("#l-imghint").textContent=""; $("#l-morehint").textContent="";
    $("#l-head").textContent="Add a real-estate listing"; $("#l-btn").textContent="Publish listing"; $("#l-cancel").hidden=true; }
  function fillLst(l){ editLst=l; $("#l-addr").value=l.address||""; $("#l-price").value=l.price||""; $("#l-status").value=l.status||"For Sale";
    $("#l-date").value=l.listed_on||todayISO(); $("#l-beds").value=l.beds||""; $("#l-baths").value=l.baths||""; $("#l-sqft").value=l.sqft||"";
    $("#l-desc").value=l.description||""; $("#l-img").required=false;
    $("#l-imghint").textContent="Leave empty to keep the current main photo.";
    const n=Array.isArray(l.photos)?l.photos.length:0; $("#l-morehint").textContent=n?`${n} extra photo(s) on file — new picks are added to them.`:"";
    $("#l-head").textContent="Edit listing"; $("#l-btn").textContent="Save changes"; $("#l-cancel").hidden=false;
    $("#lstForm").scrollIntoView({behavior:"smooth",block:"start"}); }
  async function onPostListing(e){
    e.preventDefault();
    const btn=$("#l-btn"), msg=$("#l-msg");
    btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent="Uploading…";
    try{
      const addr=$("#l-addr").value.trim();
      if(!addr) throw new Error("Please add an address.");
      const row={ address:addr, slug:slugify(addr), price:$("#l-price").value.trim()||null,
        status:$("#l-status").value, listed_on:$("#l-date").value||todayISO(),
        beds:$("#l-beds").value.trim()||null, baths:$("#l-baths").value.trim()||null, sqft:$("#l-sqft").value.trim()||null,
        description:$("#l-desc").value.trim()||null, video_url:$("#l-video").value.trim()||null, published:true };
      const main=$("#l-img").files[0];
      if(main){ msg.textContent="Uploading main photo…"; row.image_url=await uploadImage("listings", main, "listing"); }
      else if(!editLst){ throw new Error("Please add a main photo."); }
      const extra=[...$("#l-more").files]; const newPhotos=[];
      for(let i=0;i<extra.length;i++){ msg.textContent=`Uploading extra photo ${i+1}…`; newPhotos.push(await uploadImage("listings", extra[i], "listing")); }
      if(editLst){
        const existing=Array.isArray(editLst.photos)?editLst.photos:[];
        row.photos=existing.concat(newPhotos);
        const {error}=await db.from("listings").update(row).eq("id",editLst.id); if(error) throw error;
      } else {
        row.photos=newPhotos;
        const {error}=await db.from("listings").insert(row); if(error) throw error;
      }
      msg.style.color="var(--open)"; msg.textContent=editLst?"Saved!":"Published! It's live on the Real Estate page.";
      resetLst(); loadListings();
    }catch(err){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+(err.message||err); }
    finally{ btn.disabled=false; }
  }
  async function loadListings(){
    const list=$("#lstList");
    const {data,error}=await db.from("listings").select("*").order("listed_on",{ascending:false,nullsFirst:false});
    if(error){ list.innerHTML=`<p style="color:var(--accent-ink)">${esc(error.message)}</p>`; return; }
    if(!data.length){ list.innerHTML='<p style="color:var(--text-soft)">No listings yet.</p>'; return; }
    list.innerHTML=data.map(l=>`<div class="dir-item" style="align-items:center">
      ${l.image_url?`<img class="d-photo" src="${esc(l.image_url)}" alt="" style="border-radius:8px">`:'<div class="d-ico">🏡</div>'}
      <div class="d-main"><div class="d-cat">${esc(l.status||'')} · ${esc(fmtDate(l.listed_on))}${Array.isArray(l.photos)&&l.photos.length?` · ${l.photos.length+1} photos`:''}</div><h4>${esc(l.address)} — ${esc(l.price||'')}</h4></div>
      <div class="admin-row-btns"><button class="btn btn-ghost" data-edit="${l.id}" type="button">Edit</button><button class="btn btn-ghost" data-del="${l.id}" type="button">Delete</button></div></div>`).join("");
    bindEdit(list,data,fillLst); bindDelete(list,"listings",loadListings);
  }

  /* ---------------- MESSAGES (contact-form inbox) ---------------- */
  function renderMessagesTab(){
    $("#tab-messages").innerHTML=`
      <p style="color:var(--text-soft);margin:0 0 1rem">Messages people send from the Contact page land here.</p>
      <div id="msgList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    loadMessages();
  }
  async function loadMessages(){
    const list=$("#msgList");
    const {data,error}=await db.from("messages").select("*").order("created_at",{ascending:false});
    if(error){ list.innerHTML=`<p style="color:var(--accent-ink)">${esc(error.message)}</p>`; return; }
    if(!data.length){ list.innerHTML='<p style="color:var(--text-soft)">No messages yet.</p>'; return; }
    const fmtTs=t=>{ const d=t.slice(0,10); return fmtDate(d); };
    list.innerHTML=data.map(m=>`<div class="info-block" style="margin-bottom:.9rem">
      <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:baseline">
        <h4 style="margin:0">${esc(m.name||"(no name)")} ${m.topic?`<span class="d-cat" style="font-weight:700">· ${esc(m.topic)}</span>`:""}</h4>
        <span style="font-size:.8rem;color:var(--muted)">${esc(fmtTs(m.created_at))}</span>
      </div>
      <div style="font-size:.88rem;color:var(--accent-ink);margin:.15rem 0 .5rem">${esc(m.email||"")}</div>
      <p style="margin:0;white-space:pre-wrap">${esc(m.message||"")}</p>
      <div style="display:flex;gap:.5rem;margin-top:.8rem">
        ${m.email?`<a class="btn btn-ghost" style="min-height:36px;padding:.35rem .75rem" href="mailto:${esc(m.email)}?subject=Re:%20Seldovia.com">Reply</a>`:""}
        <button class="btn btn-ghost" data-del="${m.id}" type="button" style="min-height:36px;padding:.35rem .75rem">Delete</button>
      </div></div>`).join("");
    bindDelete(list,"messages",loadMessages);
  }

  /* ---------------- HOME EXTRA (which "of the day" shows + editable text) ---------------- */
  function renderSettingsTab(){
    const D=window.EXTRA_DEFAULTS||{facts:"",words:"",fundays:""};
    // modes whose text is editable -> settings key + label/hint for the textarea
    const EDIT={
      alaska_fact:{key:"facts",  label:"Alaska facts",  ph:"Add a new Alaska fact…",                       hint:"A different one shows each day."},
      word:       {key:"words",  label:"Words",         ph:"Word — meaning",                               hint:"Type each as \"Word — meaning\". A different one shows each day."},
      funday:     {key:"fundays",label:"Fun days",      ph:"MM-DD Name  (e.g. 07-11 National Blueberry Muffin Day)", hint:"Shows on the matching date. Keep it light — no political holidays."},
    };
    const esc2=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const rowHtml=t=>`<div class="ex-row"><input class="ex-item" type="text" value="${esc2(t)}"><button type="button" class="ex-rm" aria-label="Remove" title="Remove">×</button></div>`;
    $("#tab-settings").innerHTML=`
      <form class="info-block" id="setForm" style="max-width:640px">
        <h4>Home page "of the day" widget</h4>
        <p style="color:var(--text-soft);font-size:.92rem;margin:.3rem 0 1rem">Pick what shows in the little card under the top bar on the home page, and edit the wording for the ones that have text.</p>
        <div class="field"><label for="s-extra">Show</label>
          <select id="s-extra">
            <option value="alaska_fact">🧭 Alaska fact of the day</option>
            <option value="marine">🌊 Marine weather (wind &amp; seas)</option>
            <option value="word">📖 Word of the day</option>
            <option value="funday">🎉 Fun day</option>
            <option value="none">— Nothing (hide it) —</option>
          </select></div>
        <div id="extraEditor"></div>
        <button class="btn btn-primary" type="submit" id="s-btn">Save</button>
        <p id="s-msg" class="form-note"></p>
      </form>`;
    let cfg={};
    const renderEditor=mode=>{
      const box2=$("#extraEditor");
      if(mode==="marine"){ box2.innerHTML=`<p class="hint" style="display:block;margin:.2rem 0 1rem">🌊 Marine weather is live from the National Weather Service — there's nothing to edit here.</p>`; return; }
      const ed=EDIT[mode];
      if(!ed){ box2.innerHTML=""; return; }
      const val=(cfg[ed.key]!=null && cfg[ed.key]!=="") ? cfg[ed.key] : (D[ed.key]||"");
      const items=String(val).split("\n").map(x=>x.trim()).filter(Boolean);
      box2.innerHTML=`<div class="field"><label>${esc(ed.label)}</label>
        <div id="ex-list" class="ex-list">${items.map(rowHtml).join("")}</div>
        <div class="ex-add"><input id="ex-new" type="text" placeholder="${esc(ed.ph)}"><button type="button" class="btn btn-ghost" id="ex-addbtn">+ Add</button></div>
        <span class="hint">${esc(ed.hint)}</span></div>`;
      const list=$("#ex-list"), inp=$("#ex-new");
      list.addEventListener("click",e=>{ const b=e.target.closest(".ex-rm"); if(b) b.closest(".ex-row").remove(); });
      const add=()=>{ const v=inp.value.trim(); if(!v) return; list.insertAdjacentHTML("beforeend", rowHtml(v)); inp.value=""; inp.focus(); list.scrollTop=list.scrollHeight; };
      $("#ex-addbtn").addEventListener("click",add);
      inp.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); add(); } });
    };
    db.from("settings").select("key,value")
      .then(({data})=>{ if(data) data.forEach(r=>cfg[r.key]=r.value);
        if(cfg.home_extra) $("#s-extra").value=cfg.home_extra; renderEditor($("#s-extra").value); })
      .catch(()=>renderEditor($("#s-extra").value));
    $("#s-extra").addEventListener("change",()=>renderEditor($("#s-extra").value));
    $("#setForm").addEventListener("submit",async e=>{ e.preventDefault();
      const msg=$("#s-msg"), btn=$("#s-btn"); btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent="Saving…";
      const mode=$("#s-extra").value, ed=EDIT[mode];
      const rows=[{key:"home_extra",value:mode}]; let content=null;
      if(ed){ content=[...document.querySelectorAll("#ex-list .ex-item")].map(i=>i.value.trim()).filter(Boolean).join("\n"); rows.push({key:ed.key, value:content}); }
      const {error}=await db.from("settings").upsert(rows,{onConflict:"key"});
      if(error){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+error.message+" (run seed-settings.sql once)"; }
      else { msg.style.color="var(--open)"; msg.textContent="Saved! It's live on the home page."; cfg.home_extra=mode; if(ed) cfg[ed.key]=content; }
      btn.disabled=false;
    });
  }

  /* ---------------- EXPLORE FEATURE CARD ---------------- */
  function renderFeatureTab(){
    // Defaults MUST match the hard-coded card in explore.html.
    const DEF={
      eyebrow:"Local Favorite",
      title:"Best of the Boardwalk",
      body:"The historic boardwalk is the heart of Seldovia — homes on stilts above the tide, little galleries, and the best cinnamon rolls in town. Stroll it once and you’ll understand why folks never leave.",
      btnLabel:"Browse the phone book",
      btnLink:"phone-book.html",
      image:""
    };
    $("#tab-feature").innerHTML=`
      <form class="info-block" id="featForm" style="max-width:640px">
        <h4>Explore page "Local Favorite" card</h4>
        <p style="color:var(--text-soft);font-size:.92rem;margin:.3rem 0 1rem">This is the highlighted card near the bottom of the Explore page. Change any of it here — it goes live right away.</p>
        <div class="field"><label for="f-eyebrow">Small label</label><input id="f-eyebrow" placeholder="Local Favorite"></div>
        <div class="field"><label for="f-title">Title</label><input id="f-title" placeholder="Best of the Boardwalk"></div>
        <div class="field"><label for="f-body">Text</label><textarea id="f-body" rows="5" placeholder="Write the card text…"></textarea></div>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="f-btnlabel">Button label</label><input id="f-btnlabel" placeholder="Browse the phone book"></div>
          <div class="field"><label for="f-btnlink">Button link</label><input id="f-btnlink" placeholder="phone-book.html"></div>
        </div>
        <span class="hint" style="display:block;margin:-.4rem 0 1rem">Leave the button label empty to hide the button.</span>
        <div class="field"><label for="f-img">Photo <span class="opt">(optional)</span></label><input id="f-img" type="file" accept="image/*"><span class="hint" id="f-imghint"></span></div>
        <button class="btn btn-primary" type="submit" id="f-btn">Save</button>
        <p id="f-msg" class="form-note"></p>
      </form>`;
    let cur={...DEF};
    db.from("settings").select("value").eq("key","explore_feature").maybeSingle()
      .then(({data})=>{ if(data&&data.value){ try{ cur={...DEF,...JSON.parse(data.value)}; }catch(e){} }
        $("#f-eyebrow").value=cur.eyebrow||""; $("#f-title").value=cur.title||""; $("#f-body").value=cur.body||"";
        $("#f-btnlabel").value=cur.btnLabel||""; $("#f-btnlink").value=cur.btnLink||"";
        $("#f-imghint").textContent=cur.image?"A photo is set. Choose a new one to replace it.":"Uses the harbor photo unless you set one here."; })
      .catch(()=>{});
    $("#featForm").addEventListener("submit",async e=>{ e.preventDefault();
      const msg=$("#f-msg"), btn=$("#f-btn"); btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent="Saving…";
      try{
        const val={ eyebrow:$("#f-eyebrow").value.trim(), title:$("#f-title").value.trim(), body:$("#f-body").value.trim(),
          btnLabel:$("#f-btnlabel").value.trim(), btnLink:$("#f-btnlink").value.trim(), image:cur.image||"" };
        const file=$("#f-img").files[0];
        if(file){ msg.textContent="Uploading photo…"; val.image=await uploadImage("blog", file, "feature"); }
        const {error}=await db.from("settings").upsert({key:"explore_feature",value:JSON.stringify(val)},{onConflict:"key"});
        if(error) throw error;
        cur=val; $("#f-imghint").textContent=cur.image?"A photo is set. Choose a new one to replace it.":"Uses the harbor photo unless you set one here.";
        msg.style.color="var(--open)"; msg.textContent="Saved! It's live on the Explore page.";
      }catch(err){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+(err.message||err); }
      finally{ btn.disabled=false; }
    });
  }

  /* ---------------- shared ---------------- */
  function bindEdit(scope, data, fill){
    scope.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>{
      const row=data.find(r=>r.id===b.dataset.edit); if(row) fill(row);
    }));
  }
  function bindDelete(scope, table, reload){
    scope.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",async()=>{
      if(!confirm("Delete this?")) return;
      const {error}=await db.from(table).delete().eq("id",b.dataset.del);
      if(error) alert(error.message); else reload();
    }));
  }

  boot();
})();
