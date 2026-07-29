/* Seldovia.com admin — Jenny signs in to post a daily photo, a blog post, a
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
    {key:"bulletin", label:"📌 Bulletin",    render:renderBulletinTab},
    {key:"listing",  label:"🏡 Listings",    render:renderListingTab},
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
  function renderPhotoTab(){
    $("#tab-photo").innerHTML=`
      <form class="info-block" id="photoForm" style="max-width:640px">
        <h4>Add today's photo</h4>
        <p style="color:var(--text-soft);font-size:.92rem;margin:.3rem 0 1rem">It appears at the top of the Photo Journal, then settles into that month's gallery.</p>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="ph-date">Date the photo is for</label><input id="ph-date" type="date" required></div>
          <div class="field"><label for="ph-cap">Caption</label><input id="ph-cap" placeholder="Morning light on the harbor"></div>
        </div>
        <div class="field"><label for="ph-img">Photo <span class="req">*</span></label><input id="ph-img" type="file" accept="image/*" required><span class="hint">Auto-resized on upload.</span></div>
        <button class="btn btn-primary" type="submit" id="ph-btn">Post photo</button>
        <p id="ph-msg" class="form-note"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Recent photos</h3>
      <div id="photoList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    $("#ph-date").value=todayISO();
    $("#photoForm").addEventListener("submit",onPostPhoto);
    loadPhotos();
  }
  async function onPostPhoto(e){
    e.preventDefault();
    const btn=$("#ph-btn"), msg=$("#ph-msg");
    btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent="Uploading photo…";
    try{
      const file=$("#ph-img").files[0];
      if(!file) throw new Error("Please choose a photo.");
      const image_url=await uploadImage("gallery", file, "photo");
      const {error}=await db.from("photos").insert({taken_on:$("#ph-date").value, caption:$("#ph-cap").value.trim()||null, image_url});
      if(error) throw error;
      msg.style.color="var(--open)"; msg.textContent="Posted! It's live in the Photo Journal.";
      $("#photoForm").reset(); $("#ph-date").value=todayISO();
      loadPhotos();
    }catch(err){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+(err.message||err); }
    finally{ btn.disabled=false; }
  }
  async function loadPhotos(){
    const list=$("#photoList");
    const {data,error}=await db.from("photos").select("*").order("taken_on",{ascending:false}).limit(24);
    if(error){ list.innerHTML=`<p style="color:var(--accent-ink)">${esc(error.message)}</p>`; return; }
    if(!data.length){ list.innerHTML='<p style="color:var(--text-soft)">No photos yet.</p>'; return; }
    list.innerHTML=`<div class="admin-photo-grid">`+data.map(p=>`<figure class="admin-photo">
      <img src="${esc(p.image_url)}" alt="${esc(p.caption||"")}" loading="lazy">
      <figcaption>${esc(fmtDate(p.taken_on))}${p.caption?" · "+esc(p.caption):""}</figcaption>
      <button class="btn btn-ghost" data-del="${p.id}" type="button">Delete</button></figure>`).join("")+`</div>`;
    bindDelete(list,"photos",loadPhotos);
  }

  /* ---------------- BLOG POST ---------------- */
  function renderBlogTab(){
    $("#tab-blog").innerHTML=`
      <form class="info-block" id="postForm" style="max-width:640px">
        <h4>Write a blog post</h4>
        <div class="field"><label for="p-title">Title <span class="req">*</span></label><input id="p-title" required></div>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="p-date">Date</label><input id="p-date" type="date" required></div>
          <div class="field"><label for="p-cat">Category</label><input id="p-cat" placeholder="Community, Events, Real Estate…"></div>
        </div>
        <div class="field"><label for="p-body">Post</label><textarea id="p-body" rows="7" placeholder="Write your post…"></textarea></div>
        <div class="field"><label for="p-img">Photo <span class="opt">(optional)</span></label><input id="p-img" type="file" accept="image/*"></div>
        <button class="btn btn-primary" type="submit" id="pubBtn">Publish post</button>
        <p id="postMsg" class="form-note"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Published posts</h3>
      <div id="postList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    $("#p-date").value=todayISO();
    $("#postForm").addEventListener("submit",onPublish);
    loadPosts();
  }
  async function onPublish(e){
    e.preventDefault();
    const btn=$("#pubBtn"), msg=$("#postMsg");
    btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent="Publishing…";
    try{
      const title=$("#p-title").value.trim();
      const body=$("#p-body").value.trim();
      const post_date=$("#p-date").value;
      const category=$("#p-cat").value.trim()||"Blog";
      const excerpt=body.length>180?body.slice(0,177).trim()+"…":body;
      let image_url=null;
      const file=$("#p-img").files[0];
      if(file){ msg.textContent="Uploading photo…"; image_url=await uploadImage("blog", file, "post"); }
      const {error}=await db.from("posts").insert({title,body,excerpt,category,post_date,image_url,published:true});
      if(error) throw error;
      msg.style.color="var(--open)"; msg.textContent="Published! It's live on the blog.";
      $("#postForm").reset(); $("#p-date").value=todayISO();
      loadPosts();
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
      <button class="btn btn-ghost" data-del="${p.id}" type="button" style="min-height:38px;padding:.4rem .8rem">Delete</button></div>`).join("");
    bindDelete(list,"posts",loadPosts);
  }

  /* ---------------- BULLETIN ---------------- */
  function renderBulletinTab(){
    $("#tab-bulletin").innerHTML=`
      <form class="info-block" id="bulForm" style="max-width:640px">
        <h4>Post a bulletin notice</h4>
        <div class="field"><label for="b-title">Title <span class="req">*</span></label><input id="b-title" required></div>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="b-cat">Category</label><input id="b-cat" placeholder="Notice, Event, For Sale, Service…"></div>
          <div class="field"><label for="b-by">Posted by</label><input id="b-by" placeholder="Your name / group"></div>
        </div>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="b-date">Date <span class="opt">(optional)</span></label><input id="b-date" type="date"></div>
          <div class="field"><label for="b-link">Flyer / link <span class="opt">(optional)</span></label><input id="b-link" type="url" placeholder="https://…"></div>
        </div>
        <div class="field"><label for="b-body">Details</label><textarea id="b-body" rows="4" placeholder="What's happening…"></textarea></div>
        <button class="btn btn-primary" type="submit" id="b-btn">Post notice</button>
        <p id="b-msg" class="form-note"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Posted notices</h3>
      <div id="bulList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    $("#bulForm").addEventListener("submit",onPostBulletin);
    loadBulletin();
  }
  async function onPostBulletin(e){
    e.preventDefault();
    const btn=$("#b-btn"), msg=$("#b-msg");
    btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent="Posting…";
    try{
      const row={ title:$("#b-title").value.trim(), category:$("#b-cat").value.trim()||"Notice",
        posted_by:$("#b-by").value.trim()||null, starts_on:$("#b-date").value||null,
        link:$("#b-link").value.trim()||null, body:$("#b-body").value.trim()||null, published:true };
      if(!row.title) throw new Error("Please add a title.");
      const {error}=await db.from("bulletin").insert(row);
      if(error) throw error;
      msg.style.color="var(--open)"; msg.textContent="Posted! It's live on the bulletin board.";
      $("#bulForm").reset(); loadBulletin();
    }catch(err){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+(err.message||err); }
    finally{ btn.disabled=false; }
  }
  async function loadBulletin(){
    const list=$("#bulList");
    const {data,error}=await db.from("bulletin").select("*").order("created_at",{ascending:false});
    if(error){ list.innerHTML=`<p style="color:var(--accent-ink)">${esc(error.message)}</p>`; return; }
    if(!data.length){ list.innerHTML='<p style="color:var(--text-soft)">No notices yet.</p>'; return; }
    list.innerHTML=data.map(n=>`<div class="dir-item" style="align-items:center">
      <div class="d-ico">📌</div>
      <div class="d-main"><div class="d-cat">${esc(n.category||'')}${n.starts_on?" · "+esc(fmtDate(n.starts_on)):""}${n.link?' · 🔗 link':''}</div><h4>${esc(n.title)}</h4></div>
      <button class="btn btn-ghost" data-del="${n.id}" type="button" style="min-height:38px;padding:.4rem .8rem">Delete</button></div>`).join("");
    bindDelete(list,"bulletin",loadBulletin);
  }

  /* ---------------- LISTINGS ---------------- */
  function renderListingTab(){
    $("#tab-listing").innerHTML=`
      <form class="info-block" id="lstForm" style="max-width:680px">
        <h4>Add a real-estate listing</h4>
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
        <div class="field"><label for="l-img">Main photo <span class="req">*</span></label><input id="l-img" type="file" accept="image/*" required></div>
        <div class="field"><label for="l-more">More photos <span class="opt">(optional, pick several)</span></label><input id="l-more" type="file" accept="image/*" multiple></div>
        <div class="field"><label for="l-video">Video link <span class="opt">(optional — YouTube/Vimeo)</span></label><input id="l-video" type="url" placeholder="https://…"></div>
        <button class="btn btn-primary" type="submit" id="l-btn">Publish listing</button>
        <p id="l-msg" class="form-note"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Published listings</h3>
      <div id="lstList"><p style="color:var(--text-soft)">Loading…</p></div>`;
    $("#l-date").value=todayISO();
    $("#lstForm").addEventListener("submit",onPostListing);
    loadListings();
  }
  async function onPostListing(e){
    e.preventDefault();
    const btn=$("#l-btn"), msg=$("#l-msg");
    btn.disabled=true; msg.style.color="var(--text-soft)"; msg.textContent="Uploading photos…";
    try{
      const addr=$("#l-addr").value.trim();
      if(!addr) throw new Error("Please add an address.");
      const main=$("#l-img").files[0];
      if(!main) throw new Error("Please add a main photo.");
      const image_url=await uploadImage("listings", main, "listing");
      const extra=[...$("#l-more").files];
      const photos=[];
      for(let i=0;i<extra.length;i++){ msg.textContent=`Uploading photo ${i+2}…`; photos.push(await uploadImage("listings", extra[i], "listing")); }
      const row={ address:addr, slug:slugify(addr), price:$("#l-price").value.trim()||null,
        status:$("#l-status").value, listed_on:$("#l-date").value||todayISO(),
        beds:$("#l-beds").value.trim()||null, baths:$("#l-baths").value.trim()||null, sqft:$("#l-sqft").value.trim()||null,
        description:$("#l-desc").value.trim()||null, image_url, photos, video_url:$("#l-video").value.trim()||null, published:true };
      const {error}=await db.from("listings").insert(row);
      if(error) throw error;
      msg.style.color="var(--open)"; msg.textContent="Published! It's live on the Real Estate page.";
      $("#lstForm").reset(); $("#l-date").value=todayISO();
      loadListings();
    }catch(err){ msg.style.color="var(--accent-ink)"; msg.textContent="Error: "+(err.message||err); }
    finally{ btn.disabled=false; }
  }
  async function loadListings(){
    const list=$("#lstList");
    const {data,error}=await db.from("listings").select("*").order("listed_on",{ascending:false});
    if(error){ list.innerHTML=`<p style="color:var(--accent-ink)">${esc(error.message)}</p>`; return; }
    if(!data.length){ list.innerHTML='<p style="color:var(--text-soft)">No listings yet.</p>'; return; }
    list.innerHTML=data.map(l=>`<div class="dir-item" style="align-items:center">
      ${l.image_url?`<img class="d-photo" src="${esc(l.image_url)}" alt="" style="border-radius:8px">`:'<div class="d-ico">🏡</div>'}
      <div class="d-main"><div class="d-cat">${esc(l.status||'')} · ${esc(fmtDate(l.listed_on))}${Array.isArray(l.photos)&&l.photos.length?` · ${l.photos.length+1} photos`:''}</div><h4>${esc(l.address)} — ${esc(l.price||'')}</h4></div>
      <button class="btn btn-ghost" data-del="${l.id}" type="button" style="min-height:38px;padding:.4rem .8rem">Delete</button></div>`).join("");
    bindDelete(list,"listings",loadListings);
  }

  /* ---------------- shared ---------------- */
  function bindDelete(scope, table, reload){
    scope.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",async()=>{
      if(!confirm("Delete this?")) return;
      const {error}=await db.from(table).delete().eq("id",b.dataset.del);
      if(error) alert(error.message); else reload();
    }));
  }

  boot();
})();
