/* Fetch private editor code only after verifying the account role. */
(async()=>{
 const status=document.getElementById('admin-status');
 try{
  const bridge=window.CRMOAuthBridge;
  if(!bridge)throw Error('לא ניתן לטעון את מנגנון ההתחברות.');
  await bridge.ready;
  if(!bridge.isLoggedIn()){
   const url=new URL('index.html',window.CRMO_ROOT_URL);url.searchParams.set('login','1');
   location.replace(url.href);return;
  }
  if(!bridge.canManage())throw Error('לחשבון המחובר אין הרשאת ניהול.');
  status.textContent='טוען את גרסת הניהול האחרונה…';
  const client=bridge.getSupabaseClient();
  // The mutable manifest must not be served from a previous browser/CDN cache.
  const sessionResult=await client.auth.getSession();
  const token=sessionResult.data?.session?.access_token;
  if(!token)throw Error('נדרשת התחברות מחדש לממשק הניהול.');
  const manifestUrl=new URL('/storage/v1/object/authenticated/admin/latest.json',window.CRMO_CONFIG.url);
  manifestUrl.searchParams.set('release',window.CRMO_CONFIG.release);
  manifestUrl.searchParams.set('fresh',String(Date.now()));
  const manifest=await fetch(manifestUrl,{headers:{apikey:window.CRMO_CONFIG.anonKey,Authorization:'Bearer '+token},cache:'no-store'});
  if(!manifest.ok)throw Error('לא ניתן לטעון את גרסת הניהול. נסה לרענן.');
  const release=await manifest.json();
  if(!/^releases\/CRMO_v\d+\.html$/.test(release.path))throw Error('כתובת גרסת הניהול אינה תקינה.');
  const file=await client.storage.from('admin').download(release.path);
  if(file.error)throw Error('טעינת ממשק הניהול נכשלה. נסה לרענן.');
  let html=(await file.data.text()).replace(/\r\n/g,'\n');
  if(!html.trimStart().toLowerCase().startsWith('<!doctype html>'))throw Error('קובץ הניהול אינו תקין.');

  // Patch the private legacy editor before execution. Never clear existing drafts.
  const persistPattern = /function persistLocal\(payload = makePayload\(galleries\)\)\s*\{\s*localWrapper = hydrateWrapperShape\(payload\) \|\| payload;\s*localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(payload\)\);\s*\}/;
  const safePersist = `function persistLocal(payload = makePayload(galleries)) {
    localWrapper = hydrateWrapperShape(payload) || payload;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      window.CRMO_LOCAL_CACHE_FULL = false;
    } catch (error) {
      const quota = error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      // Offline saves must still fail honestly; connected saves continue to cloud verification.
      if (!quota || !isLoggedIn() || !getSupabaseClient() || !getConnection()) throw error;
      window.CRMO_LOCAL_CACHE_FULL = true;
      console.warn('[CRMO] Local cache full; keeping changes in memory and continuing cloud save.');
    }
  }`;
  if (!persistPattern.test(html)) throw Error('מבנה מנגנון השמירה השתנה. טעינת העורך נעצרה כדי להגן על התוכן.');
  html = html.replace(persistPattern, () => safePersist);
  html = html.replace('if (!editable) closeAboutEditor();', 'if (!canEdit()) closeAboutEditor();');

  // Public and admin always read the central content row, including old cached editors.
  const rowMarker = 'function getCloudRowKey() {';
  const revisionMarker = "    hydrated.source = 'cloud';";
  const applyMarker = '  function applyWrapper(wrapper, sourceLabel, opts = {}) {';
  const bootMarker = '  loadFromCloudAndApply()\n    .then(() => {';
  for (const marker of [rowMarker, revisionMarker, applyMarker, bootMarker]) {
    if (html.split(marker).length !== 2) throw Error('מבנה סנכרון התוכן השתנה. טעינת העורך נעצרה כדי להגן על התוכן.');
  }
  html = html.replace(rowMarker, rowMarker + '\n    if (window.CRMO_CONFIG?.contentRow) return window.CRMO_CONFIG.contentRow;');
  html = html.replace(revisionMarker, revisionMarker + '\n    hydrated.__cloudRevision = data?.updated_at || "";');
  html = html.replace(applyMarker, `  let cloudContentBaseline = '';
  let cloudContentSync;
  function contentFingerprint() {
    const payload = makePayload(galleries);
    return JSON.stringify([payload.site, payload.galleries, payload.brands, payload.clients, payload.routes]);
  }
${applyMarker}`);
  const applyStart = html.indexOf(applyMarker);
  const applyEnd = html.indexOf('\n  function getPreferredWrapper(', applyStart);
  if (applyEnd < 0) throw Error('לא ניתן לחבר בדיקת עדכניות לתוכן.');
  const applyBody = html.slice(applyStart, applyEnd);
  if (applyBody.split('    return next;').length !== 2) throw Error('מבנה החלת התוכן השתנה.');
  html = html.slice(0, applyStart) + applyBody.replace('    return next;', `    if (next.__cloudRevision && String(sourceLabel || '').startsWith('cloud')) {
      cloudContentBaseline = contentFingerprint();
      cloudContentSync?.accept(next.__cloudRevision);
    } else if (!cloudContentBaseline && String(sourceLabel || '').startsWith('local')) {
      // Retry an initial cloud failure, provided this fallback has not been edited.
      cloudContentBaseline = contentFingerprint();
    }
    return next;`) + html.slice(applyEnd);
  html = html.replace(bootMarker, `  cloudContentSync = window.CRMOContentSync.start({
    canApply: () => !syncBusy && !galleryFilePickerActive &&
      !document.querySelector('.crmo3047-gallery.is-editing') &&
      !!cloudContentBaseline && contentFingerprint() === cloudContentBaseline,
    refresh: async (canApply) => {
      const cloud = await readCloudPayload();
      if (!cloud || !canApply()) return false;
      applyWrapper(cloud, 'cloud active');
      return true;
    }
  });
${bootMarker}`);

  // Reuse the private editor's own validated manager state and cloud-save
  // routine for inline visibility switches, rather than duplicating storage.
  const quickManagerMarker='function renderGalleryManager() {';
  if(html.split(quickManagerMarker).length!==2)throw Error('מבנה ניהול הגלריות השתנה. העדכון נעצר לשמירת התוכן.');
  html=html.replace(quickManagerMarker,`window.CRMO_QUICK_MANAGER = {
    get(id) {
      const state=getGalleryManagerState();
      if(!Object.prototype.hasOwnProperty.call(state?.items||{},id))return null;
      const item=state?.items?.[id]||{};
      return {
        visible:item.visible!==false,
        visibleMobile:item.visibleMobile!==false,
        visibleDesktop:item.visibleDesktop!==false,
        showExpandedButton:item.showExpandedButton===true,
        expandedAllowed:isExpandedButtonEligible(id,item)
      };
    },
    async set(id,flag,enabled) {
      if(!canEdit() || !['visible','visibleMobile','visibleDesktop','showExpandedButton'].includes(flag))return false;
      const state=structuredClone(getGalleryManagerState());
      state.items=state.items||{};
      state.items[id]=state.items[id]||{};
      if(flag==='showExpandedButton' && enabled && !isExpandedButtonEligible(id,state.items[id]))return false;
      state.items[id][flag]=!!enabled;
      setGalleryManagerState(state);
      if(flag==='showExpandedButton'){
        const gallery=findGalleryByManagerId(id);
        if(gallery?.meta){
          gallery.meta.expandedEnabled=!!enabled;
          gallery.meta.showExpandedButton=!!enabled;
        }
      }
      renderGalleryStack();
      populateGallerySelect();
      persistLocal(makePayload(galleries));
      try {
        await runWithSyncLock('saving gallery visibility to cloud',async()=>saveGalleriesToCloud());
        setStatus('נראות הגלריה נשמרה בענן.');
        return true;
      } catch(error) {
        setStatus('הנראות נשמרה מקומית בלבד: '+(error?.message||error));
        return false;
      }
    }
  };
  ${quickManagerMarker}`);

  // Release files can contain obsolete admin chrome. Normalize it on every load.
  const editorDocument=new DOMParser().parseFromString(html,'text/html');
  editorDocument.title='CRMO | sales oriented design';
  // This one-time studio-assets uploader duplicates the existing edit icons.
  // Remove only its UI scripts; existing cloud assets are left untouched.
  editorDocument.querySelectorAll('script[src*="/admin/studio-assets.js"],script#crmo3283-studio-assets').forEach(script=>script.remove());
  editorDocument.querySelectorAll('#adminDashboard button').forEach(button=>{
    if(/^באקטים\s*[·-]\s*V\d+/i.test(button.textContent.trim())) button.textContent='באקטים';
  });
  // Private release files still contain an unversioned config.js. A cached copy
  // overwrites the freshly injected release and can point at a different content row.
  editorDocument.querySelectorAll('script[src]').forEach(script=>{
    if(new URL(script.getAttribute('src'),window.CRMO_ROOT_URL).pathname.endsWith('/public/config.js'))script.remove();
    else if(new URL(script.getAttribute('src'),window.CRMO_ROOT_URL).pathname.endsWith('/admin/permissions.js')){
      script.setAttribute('src',new URL('admin/permissions.js?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href);
    }
  });
  const legacyNotice=editorDocument.querySelector('div[style*="#fff4cd"]');
  if(legacyNotice&&legacyNotice.querySelector('a[href="../index.html"]'))legacyNotice.remove();
  const headerStyle=editorDocument.createElement('style');
  headerStyle.id='crmo-admin-header-layout';
  headerStyle.textContent=`
    body header,body.role-admin header,body.role-master header{
      position:sticky!important;top:0!important;z-index:9999;
      background:#fff!important;isolation:isolate;
    }
    body header::before{
      content:"";position:absolute;top:0;bottom:0;
      left:calc((100% - 100vw)/2);right:calc((100% - 100vw)/2);
      background:#fff;z-index:-1;pointer-events:none;
      border-bottom:1px solid #e6e6e6;
    }
    body.role-admin main,body.role-master main{padding-top:0!important}
    body.role-admin section,body.role-master section{scroll-margin-top:96px!important}
  `;
  headerStyle.textContent += ".crmo3045-hover{background:rgba(255,255,255,.90);padding:8px 12px}.crmo3045-hover-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.crmo3045-hover-desc{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;white-space:normal;line-height:1.25;max-height:3.75em}";
  // Reserve thumbnail geometry before image decoding, so drag targets never collapse.
  headerStyle.textContent += "#crmo3047EditorStrip .crmo3045-thumb{display:block!important;width:100%!important;aspect-ratio:16/9!important;box-sizing:border-box}#crmo3047EditorStrip .crmo3045-thumb img,#crmo3047EditorStrip .crmo3045-thumb video{display:block;width:100%;height:100%;object-fit:cover}";
  editorDocument.head.append(headerStyle);
  const uxStyle=editorDocument.createElement('style');
  uxStyle.id='crmo-ux-v3302';
  uxStyle.textContent=`
    #adminDashboard { font-size:11px!important; }
    #adminDashboard button,#adminDashboard input,#adminDashboard select,
    #adminDashboard .dashboard-pill { font-size:11px!important; }
    #adminDashboard.crmo-ux-collapsed > :not(.crmo-ux-dashboard-toggle) {display:none!important}
    #adminDashboard.crmo-ux-collapsed {min-height:0!important;padding:4px 8px!important}
    #adminDashboard .crmo-ux-dashboard-toggle {
      display:flex;align-items:center;justify-content:flex-start;direction:ltr;
      width:100%;height:24px;min-height:24px;
    }
    #crmo-ux-expand-admin {
      width:24px;height:24px;padding:0;border:1px solid #111;border-radius:50%;
      background:#111;color:#fff;cursor:pointer;font:17px/1 Arial,sans-serif;
    }
    .crmo3047-gallery-head {position:relative!important}
    .crmo3047-gallery-tools {position:absolute!important;top:0!important;left:0!important;
      margin:0!important;padding:0!important;z-index:20!important}
    button[data-gallery-editor],button[data-managed-gallery-editor] {
      display:grid!important;place-items:center!important;width:28px!important;height:28px!important;
      padding:0!important;min-width:28px!important;border:0!important;border-radius:50%!important;
      background:#111!important;color:transparent!important;font-size:0!important;line-height:1!important;
    }
    button[data-gallery-editor]::before,button[data-managed-gallery-editor]::before {
      content:"✎";color:#fff;font:20px/1 Arial,sans-serif;
    }
    .crmo3263-manager-row:has(input[data-flag="visible"]:not(:checked)) {
      filter:grayscale(1);opacity:.56;
    }
    .crmo-ux-mobile-desc-choice {
      display:flex;align-items:center;gap:6px;font-size:12px;padding:5px 0;
    }
    .crmo-ux-quick-flags {
      display:flex;flex-wrap:wrap;gap:10px;align-items:center;
      font:11px/1.4 Rubik,Arial,sans-serif;color:#555;margin:3px 0 0;
    }
    .crmo-ux-quick-flags label {display:inline-flex;gap:3px;align-items:center;cursor:pointer}
    .crmo-ux-quick-flags input {width:12px;height:12px;margin:0;accent-color:#111}
    @media(max-width:900px) {
      .crmo3047-gallery-desc.crmo-ux-mobile-desc-hidden {display:none!important}
    }
  `;
  editorDocument.head.append(uxStyle);
  const uxScript=editorDocument.createElement('script');
  uxScript.id='crmo-ux-v3302-script';
  uxScript.textContent=`(function(){
    const marker='\\u2063';
    function setup(){
      document.querySelectorAll('section > strong').forEach(title=>{
        if(title.textContent.trim()==='נכסי הסטודיו' &&
           title.parentElement?.querySelector('input[type="file"][webkitdirectory]')){
          title.parentElement.remove();
        }
      });
      const panel=document.getElementById('adminDashboard');
      if(panel&&!document.getElementById('crmo-ux-expand-admin')){
        const row=document.createElement('div');
        row.className='crmo-ux-dashboard-toggle';
        const button=document.createElement('button');
        button.id='crmo-ux-expand-admin';button.type='button';button.textContent='+';
        button.setAttribute('aria-label','פתח או סגור לוח ניהול');
        button.setAttribute('aria-expanded','false');
        panel.classList.add('crmo-ux-collapsed');
        button.addEventListener('click',()=>{
          const closed=panel.classList.toggle('crmo-ux-collapsed');
          button.textContent=closed?'+':'−';
          button.setAttribute('aria-expanded',String(!closed));
        });
        row.append(button);panel.prepend(row);
      }
      document.querySelectorAll('button[data-gallery-editor],button[data-managed-gallery-editor]').forEach(button=>{
        button.setAttribute('aria-label','עריכת הגלריה');
        button.title='עריכת הגלריה';
      });
      document.querySelectorAll('section.crmo3047-gallery[id]').forEach(section=>{
        const manager=window.CRMO_QUICK_MANAGER;
        const state=manager?.get(section.id);
        const copy=section.querySelector('.crmo3047-gallery-copy');
        if(!state||!copy)return;
        let quick=copy.querySelector('.crmo-ux-quick-flags');
        if(quick)return;
        quick=document.createElement('div');quick.className='crmo-ux-quick-flags';
        const names={visible:'כללי',visibleMobile:'מובייל',visibleDesktop:'דסקטופ',showExpandedButton:'עבודות נוספות'};
        Object.keys(names).forEach(flag=>{
          const label=document.createElement('label');
          const proxy=document.createElement('input');
          proxy.type='checkbox';proxy.checked=state[flag];
          proxy.disabled=flag==='showExpandedButton'&&!state.expandedAllowed;
          label.append(proxy,document.createTextNode(names[flag]));
          proxy.addEventListener('change',async()=>{
            proxy.disabled=true;
            try{await manager.set(section.id,flag,proxy.checked)}
            finally {
              const next=manager.get(section.id);
              proxy.checked=!!next?.[flag];
              proxy.disabled=flag==='showExpandedButton'&&!next?.expandedAllowed;
            }
          });
          quick.append(label);
        });
        copy.append(quick);
      });
      const mobile=document.getElementById('crmo3047GalleryDescMobile');
      if(mobile&&!document.getElementById('crmo-ux-hide-desc-mobile')){
        const label=document.createElement('label');
        label.className='crmo-ux-mobile-desc-choice';
        const checkbox=document.createElement('input');
        checkbox.type='checkbox';checkbox.id='crmo-ux-hide-desc-mobile';
        label.append(checkbox,document.createTextNode('במובייל: כותרת בלבד, ללא הסבר'));
        mobile.closest('label')?.after(label);
        const sync=()=>{checkbox.checked=mobile.value.startsWith(marker)};
        checkbox.addEventListener('change',()=>{
          const original=mobile.value.startsWith(marker)?mobile.value.slice(1):mobile.value;
          mobile.value=checkbox.checked?marker+original:original;
          mobile.dispatchEvent(new Event('input',{bubbles:true}));
        });
        document.addEventListener('click',event=>{
          if(event.target.closest?.('[data-gallery-editor],[data-managed-gallery-editor]'))setTimeout(sync,60);
        },true);
        sync();
      }
      if(window.innerWidth<=900){
        document.querySelectorAll('.crmo3047-gallery-desc').forEach(el=>{
          el.classList.toggle('crmo-ux-mobile-desc-hidden',el.textContent.startsWith(marker));
        });
      }
    }
    let scheduled=false;
    function schedule(){
      if(scheduled)return;scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;setup()});
    }
    document.addEventListener('DOMContentLoaded',()=>{
      setup();
      new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
    },{once:true});
    window.addEventListener('resize',schedule,{passive:true});
  })();`;
  editorDocument.body.append(uxScript);
  // Carry the central release configuration into the private editor document.
  const releaseConfig=editorDocument.createElement('script');
  releaseConfig.textContent='window.CRMO_CONFIG=Object.freeze('+JSON.stringify(window.CRMO_CONFIG)+');';
  editorDocument.head.prepend(releaseConfig);
  const contentSyncScript=editorDocument.createElement('script');
  contentSyncScript.src=new URL('public/content-sync.js?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href;
  releaseConfig.after(contentSyncScript);
  const releaseGuard=editorDocument.createElement('script');
  releaseGuard.textContent="(()=>{const title=window.CRMO_CONFIG.siteTitle;const version=\"CRMO_v\"+window.CRMO_CONFIG.release;const sync=()=>{if(document.title!==title)document.title=title;document.querySelectorAll(\"#adminVersionPill,#footerVersionLabel,#crmo-footer-version,.crmo3047-footer-version\").forEach(el=>{if(el.textContent!==version)el.textContent=version;});};sync();new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true,characterData:true});})();";
  editorDocument.body.append(releaseGuard);
  // Mirror public reviewed framing in the privately loaded editor.
  if (!editorDocument.querySelector('script[src*="crmo-smart-framing.js"]')) {
    const framingScript=editorDocument.createElement('script');
    framingScript.defer=true;
    framingScript.src=new URL('public/crmo-smart-framing.js?v=3293',window.CRMO_ROOT_URL).href;
    editorDocument.body.append(framingScript);
  }
  const editorHTML='<!DOCTYPE html>'+editorDocument.documentElement.outerHTML;
  bridge.dispose();delete window.CRMOAuthBridge;
  document.open();document.write(editorHTML);document.close();
 }catch(error){status.textContent=error.message||'לא ניתן לפתוח את ממשק הניהול.';status.setAttribute('role','alert');}
})();
