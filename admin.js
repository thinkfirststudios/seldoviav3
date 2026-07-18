/* Admin CMS for Jenny's Blog — login, write/publish posts, upload photos. */
(function(){
  const $=(s,el=document)=>el.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const app=$("#adminApp");
  const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtDate=d=>{ if(!d) return ""; const [y,m,day]=d.split("-"); return `${MONTHS[+m-1]} ${+day}, ${y}`; };

  // The 10 recovered posts — click "Import" once to load them into the database.
  const SEED=[
   {title:"In Seldovia, working moms wear many hats and often all in the same day.",excerpt:"It’s early mornings with the tide schedule in mind, kids bundled up before school boats or boardwalk walks, and workdays shaped by weather, community needs, and family life all at once.",post_date:"2026-03-12",category:"Living Here",image_url:"images/gazette/post-0.jpg"},
   {title:"Author Event – “My Heart is Good” with Josh Wisniewski",excerpt:"We love celebrating local talent, and Seldovia is full of it.",post_date:"2026-03-11",category:"Events",image_url:"images/gazette/post-1.jpg"},
   {title:"New Library Hours – Thank You Volunteers!",excerpt:"We’re so grateful for the volunteers who keep our library open and thriving.",post_date:"2026-03-10",category:"Community",image_url:"images/gazette/post-2.jpg"},
   {title:"National Napping Day is a reminder that slowing down is just as important as showing up.",excerpt:"Sometimes the best way to reset isn’t coffee… it’s a blanket, a window view of the harbor, and a few peaceful minutes of doing nothing at all.",post_date:"2026-03-09",category:"Living Here",image_url:"images/gazette/post-3.jpg"},
   {title:"March 8 marks the start of Daylight Saving Time.",excerpt:"At 2:00 A.M., the clocks jump ahead one hour so don’t forget to spring forward.",post_date:"2026-03-08",category:"Community",image_url:"images/gazette/post-4.jpg"},
   {title:"Living here means learning from the water, the weather, and the quiet strength of a coastal town that stands beautifully against the elements.",excerpt:"From this view on the Homer Spit, looking across the bay toward Seldovia, you can almost feel the character of the place calling you home.",post_date:"2026-03-07",category:"Living Here",image_url:"images/gazette/post-5.jpg"},
   {title:"Week 10 of 2026 in Seldovia carries the feeling of a season gently beginning to turn.",excerpt:"Winter still shapes the landscape, but the light feels brighter and the days a little longer, hinting at the quiet approach of change.",post_date:"2026-03-06",category:"Living Here",image_url:"images/gazette/post-6.jpg"},
   {title:"A big thank you to Seldovia Village Tribe for providing such a beautiful fitness center for our community.",excerpt:"Having a warm, welcoming place to walk on the treadmill, lift weights, or stretch it out on the mats makes all the difference during these long, cold winter days.",post_date:"2026-03-06",category:"Community",image_url:"images/gazette/post-7.jpg"},
   {title:"Did you know your name often has a special meaning or history behind it?",excerpt:"Some names come from nature, some from family traditions, and others from different cultures around the world.",post_date:"2026-03-05",category:"Community",image_url:"images/gazette/post-8.jpg"},
   {title:"March 2026 Photo Contest – “Color in Motion”",excerpt:"March is here, and with it comes longer days, warmer temps (fingers crossed), and all the vibrant energy of early spring in Seldovia!",post_date:"2026-03-05",category:"Events",image_url:"images/gazette/post-9.jpg"}
  ];

  function compressImage(file, maxW, quality){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{ const scale=Math.min(1, maxW/img.width); const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
        const c=document.createElement("canvas"); c.width=w; c.height=h; c.getContext("2d").drawImage(img,0,0,w,h);
        c.toBlob(b=>b?resolve(b):reject(new Error("compress failed")), "image/jpeg", quality); };
      img.onerror=()=>reject(new Error("image load failed")); img.src=URL.createObjectURL(file);
    });
  }

  async function boot(){
    if(!window.db){ app.innerHTML='<p style="color:var(--accent-ink)">Couldn’t reach the database. Check the Supabase config in db.js.</p>'; return; }
    const { data:{ session } } = await db.auth.getSession();
    session ? renderEditor() : renderLogin();
    db.auth.onAuthStateChange((_e,s)=>{ s ? renderEditor() : renderLogin(); });
  }

  function renderLogin(){
    app.innerHTML=`<form id="loginForm" class="signup-form" style="max-width:420px">
      <div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="username" required></div>
      <div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required></div>
      <button class="btn btn-primary" type="submit">Sign in</button>
      <p id="loginMsg" class="form-fine" style="color:var(--accent-ink)"></p></form>`;
    $("#loginForm").addEventListener("submit",async e=>{ e.preventDefault();
      $("#loginMsg").textContent="Signing in…";
      const {error}=await db.auth.signInWithPassword({email:$("#email").value.trim(),password:$("#pw").value});
      if(error)$("#loginMsg").textContent=error.message;
    });
  }

  async function renderEditor(){
    app.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1.2rem">
        <p style="margin:0;color:var(--text-soft)">Signed in. Write a post below — it publishes to the blog immediately.</p>
        <button class="btn btn-ghost" id="logoutBtn" type="button">Sign out</button>
      </div>
      <form class="signup-form" id="postForm" style="max-width:640px">
        <div class="field"><label for="p-title">Title <span class="req">*</span></label><input id="p-title" required></div>
        <div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <div class="field"><label for="p-date">Date</label><input id="p-date" type="date" required></div>
          <div class="field"><label for="p-cat">Category</label><input id="p-cat" placeholder="Community, Events, Living Here…"></div>
        </div>
        <div class="field"><label for="p-body">Post</label><textarea id="p-body" rows="6" placeholder="Write your post…"></textarea></div>
        <div class="field"><label for="p-img">Photo <span class="opt">(optional)</span></label><input id="p-img" type="file" accept="image/*"><span class="hint">Auto-compressed on upload.</span></div>
        <button class="btn btn-primary" type="submit" id="pubBtn">Publish post</button>
        <p id="postMsg" class="form-fine"></p>
      </form>
      <h3 class="listing-h" style="margin-top:2rem">Published posts</h3>
      <div id="postList"><p style="color:var(--text-soft)">Loading…</p></div>
      <p style="margin-top:1.4rem"><button class="btn btn-ghost" id="seedBtn" type="button">Import the 10 recovered posts</button> <span class="hint">One-time — only if the blog is empty.</span></p>`;

    $("#p-date").valueAsDate=new Date();
    $("#logoutBtn").addEventListener("click",()=>db.auth.signOut());
    $("#postForm").addEventListener("submit",onPublish);
    $("#seedBtn").addEventListener("click",onSeed);
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
      if(file){
        msg.textContent="Uploading photo…";
        const blob=await compressImage(file,1280,0.82);
        const path=`post-${Date.now()}.jpg`;
        const {error:upErr}=await db.storage.from("blog").upload(path,blob,{contentType:"image/jpeg"});
        if(upErr) throw upErr;
        image_url=db.storage.from("blog").getPublicUrl(path).data.publicUrl;
      }
      const {error}=await db.from("posts").insert({title,body,excerpt,category,post_date,image_url,published:true});
      if(error) throw error;
      msg.style.color="var(--open)"; msg.textContent="Published! It’s live on the blog.";
      $("#postForm").reset(); $("#p-date").valueAsDate=new Date();
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
    list.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",async()=>{
      if(!confirm("Delete this post?")) return;
      const {error}=await db.from("posts").delete().eq("id",b.dataset.del);
      if(error) alert(error.message); else loadPosts();
    }));
  }

  async function onSeed(){
    const btn=$("#seedBtn"); btn.disabled=true; btn.textContent="Importing…";
    const {error}=await db.from("posts").insert(SEED);
    if(error){ alert(error.message); btn.disabled=false; btn.textContent="Import the 10 recovered posts"; return; }
    btn.textContent="Imported ✓"; loadPosts();
  }

  boot();
})();
