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
  let html=await file.data.text();
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

  // Release files can contain obsolete admin chrome. Normalize it on every load.
  const editorDocument=new DOMParser().parseFromString(html,'text/html');
  editorDocument.title='CRMO | sales oriented design';
  // Private release files still contain an unversioned config.js. A cached copy
  // overwrites the freshly injected release and can point at a different content row.
  editorDocument.querySelectorAll('script[src]').forEach(script=>{
    if(new URL(script.getAttribute('src'),window.CRMO_ROOT_URL).pathname.endsWith('/public/config.js'))script.remove();
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
  editorDocument.head.append(headerStyle);
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
