/* Fetch private editor code only after verifying the account role. */
(async()=>{
 let status=document.getElementById('admin-status');
 if(!status){
  status=document.createElement('p');status.id='admin-status';status.setAttribute('role','status');
  document.body.prepend(status);
 }
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
  if(!html.includes('hydrated.__cloudRevision ='))html = html.replace(revisionMarker, revisionMarker + '\n    hydrated.__cloudRevision = data?.updated_at || "";');
  const revisionDeclaration=html.includes("  let cloudContentRevision = '';")?'':"  let cloudContentRevision = '';\n";
  html = html.replace(applyMarker, `${revisionDeclaration}
  let cloudContentBaseline = '';
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
      cloudContentRevision = next.__cloudRevision;
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

  // Keep the loaded revision until a successful cloud apply. Merely reading the
  // latest row before saving must never bless an older in-memory draft.
  const unsafeWrite = /    let result = await client\.from\(conn\.table\)\.upsert\(row, \{ onConflict: rowKeyCol \}\);\s*if \(result\?\.error && \/updated_at\/i\.test\(String\(result\.error\?\.message \|\| result\.error\?\.details \|\| ''\)\)\) \{\s*result = await client\.from\(conn\.table\)\.upsert\(\{ \[rowKeyCol\]: cloudRowKey, \[payloadCol\]: payload \}, \{ onConflict: rowKeyCol \}\);\s*\}\s*if \(result\?\.error\) throw result\.error;/;
  const guardedStart=html.indexOf('    if (!cloudContentRevision) throw new Error(');
  const guardedEndMarker='    cloudContentRevision = result.data.updated_at;';
  const guardedEnd=html.indexOf(guardedEndMarker,guardedStart);
  const guardedWrite=guardedStart>=0&&guardedEnd>=guardedStart?html.slice(guardedStart,guardedEnd+guardedEndMarker.length):'';
  if (!unsafeWrite.test(html) && (!guardedWrite.includes(".eq('updated_at', cloudContentRevision)") || !guardedWrite.includes('.maybeSingle()'))) throw Error('מבנה השמירה השתנה. העורך נעצר כדי להגן על התוכן.');
  const sharedWrite = `    const committed = await window.CRMOContentSync.updateIfCurrent({
      client, table: conn.table, keyColumn: rowKeyCol, rowKey: cloudRowKey,
      row, revision: cloudContentRevision
    });
    const committedRevision = committed.data?.updated_at;
    if (!committedRevision) throw Error('השמירה בוצעה אך לא התקבלה גרסת ענן מאומתת. יש לרענן לפני עריכה נוספת.');
    cloudContentRevision = committedRevision;
    cloudContentBaseline = contentFingerprint();
    cloudContentSync?.publish(committedRevision);`;
  html = unsafeWrite.test(html)?html.replace(unsafeWrite,()=>sharedWrite):html.slice(0,guardedStart)+sharedWrite+html.slice(guardedEnd+guardedEndMarker.length);

  if(new URLSearchParams(window.location.search).get('dev')==='move-projects'){
    const cardStart=html.indexOf('  function createGalleryCard(');
    const cardEnd=html.indexOf('\n  function ',cardStart+5);
    if(cardStart<0||cardEnd<0)throw Error('לא ניתן לחבר את תפריט העברת הפרויקט.');
    const cardBody=html.slice(cardStart,cardEnd);
    if(cardBody.split('    return card;').length!==2)throw Error('מבנה כרטיס הפרויקט השתנה.');
    html=html.slice(0,cardStart)+cardBody.replace('    return card;',`    if(editEnabled && !isBrandsGallery && window.CRMOProjectMove){
      card.prepend(window.CRMOProjectMove.createControl({
        galleries,sourceId:gallery.galleryId,tileId:tile.tileId,title:tile.overlay?.title||hoverTitle,
        onMove:async(targetId)=>{
          if(!canEdit())throw Error('אין הרשאת עריכה.');
          await runWithSyncLock('moving project',async()=>{
            window.CRMOProjectMove.moveProject(galleries,gallery.galleryId,targetId,tile.tileId);
            persistLocal(makePayload(galleries));
            const saved=await saveGalleriesToCloud();
            if(!saved)throw Error('ההעברה נשמרה מקומית בלבד. יש להתחבר ולשמור.');
          });
        }
      }));
    }
    return card;`)+html.slice(cardEnd);
  }

  // Reuse the private editor's own validated manager state and cloud-save
  // routine for inline visibility switches, rather than duplicating storage.
  const quickManagerMarker='function renderGalleryManager() {';
  if(html.split(quickManagerMarker).length!==2)throw Error('מבנה ניהול הגלריות השתנה. העדכון נעצר לשמירת התוכן.');
  html=html.replace(quickManagerMarker,`window.CRMO_VOTING_CONTEXT = {
    getSupabaseClient:()=>getSupabaseClient(),getSession:()=>getSession(),
    canManage:()=>canEdit(),getProjects:()=>galleries
  };
  window.CRMO_QUICK_MANAGER = {
    get(id) {
      const state=getGalleryManagerState();
      if(!findGalleryByManagerId(id) && id!==SUPER_GALLERY_ID)return null;
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

  const voteCardStart=html.indexOf('  function createGalleryCard(');
  const voteCardEnd=html.indexOf('\n  function ',voteCardStart+5);
  const voteCard=html.slice(voteCardStart,voteCardEnd);
  if(voteCardStart<0||voteCardEnd<0||voteCard.split('    return card;').length!==2)throw Error('מבנה כרטיס ההצבעה השתנה.');
  html=html.slice(0,voteCardStart)+voteCard.replace('    return card;',`    if(!isBrandsGallery && tile.media.length && window.CRMOProjectVotes)card.append(window.CRMOProjectVotes.createControl({projectId:tile.tileId,title:tile.overlay?.title||hoverTitle,galleryId:gallery.galleryId,galleryTitle:gallery.meta?.adminLabelHe||gallery.meta?.title}));
    return card;`)+html.slice(voteCardEnd);
  const voteTitleStart=html.indexOf("    byId('crmo3047LbTitle').textContent =");
  const voteTitleEnd=html.indexOf('\n',voteTitleStart);
  if(voteTitleStart<0||voteTitleEnd<0)throw Error('מבנה ההצבעה בלייטבוקס השתנה.');
  html=html.slice(0,voteTitleEnd)+"\n    window.CRMOProjectVotes?.mountLightbox(tile,gallery);"+html.slice(voteTitleEnd);


  // CRMO editor controls: compact gallery rows and safe project transfer.
  const crmoPatchOnce=(from,to,label)=>{if(html.split(from).length!==2)throw Error('Editor feature marker changed: '+label);html=html.replace(from,to);};
  crmoPatchOnce("      expandedEnabled: meta.expandedEnabled === true,\n      expandedCount\n","      expandedEnabled: meta.expandedEnabled === true,\n      compactCount: [6,9,12,15,18,21,24].includes(Number(meta.compactCount)) ? Number(meta.compactCount) : 9,\n      brandLogoCount: [9,18,27].includes(Number(meta.brandLogoCount)) ? Number(meta.brandLogoCount) : 27,\n      expandedCount\n","meta");
  crmoPatchOnce("    galleryEditorDraft.meta = meta;\n    byId('crmo3047GalleryTitleMobile')","    galleryEditorDraft.meta = meta;\n    const compactSelect = byId('crmo3047CompactCount');\n    if (compactSelect) compactSelect.value = String(galleryEditorDraft?.galleryId === 'our-brands' ? (meta.brandLogoCount || 27) : (meta.compactCount || 9));\n    byId('crmo3047GalleryTitleMobile')","render");
  crmoPatchOnce("    meta.expandedEnabled = !byId('crmo3047ExpandedEnabled').disabled","    meta.compactCount = Number(byId('crmo3047CompactCount')?.value || meta.compactCount || 9);\n    if (galleryEditorDraft?.galleryId === 'our-brands') meta.brandLogoCount = Number(byId('crmo3047CompactCount')?.value || meta.brandLogoCount || 27);\n    meta.expandedEnabled = !byId('crmo3047ExpandedEnabled').disabled","sync");
  crmoPatchOnce("    tileEditorDraft = structuredClone(sourceTile);\n    if (isBrandGalleryIndex(galleryIndex)) stabilizeBrandEditorDraft();\n    renderTileEditor();\n    byId('crmo3047EditorNote')","    tileEditorDraft = structuredClone(sourceTile);\n    if (isBrandGalleryIndex(galleryIndex)) stabilizeBrandEditorDraft();\n    renderTileEditor();\n    const moveSelect = byId('crmo3047TileMoveTarget');\n    if (moveSelect) {\n      moveSelect.innerHTML = '<option value=\"\">השאר בגלריה הנוכחית</option>';\n      if (!isBrandGalleryIndex(galleryIndex) && galleries[galleryIndex]?.meta?.galleryType !== 'master') galleries.forEach((g) => {\n        if (g.galleryId === galleries[galleryIndex]?.galleryId || g.galleryId === 'our-brands' || g.meta?.galleryType === 'master') return;\n        const o = document.createElement('option');o.value = g.galleryId;\n        o.textContent = (g.meta?.parentId === 'pos' ? 'POS · ' : '') + (g.meta?.adminLabelHe || g.meta?.title || g.galleryId);\n        moveSelect.append(o);\n      });\n      moveSelect.closest('label').hidden = isBrandGalleryIndex(galleryIndex) || galleries[galleryIndex]?.meta?.galleryType === 'master';\n      moveSelect.value = '';\n    }\n    byId('crmo3047EditorNote')","move-selection");
  crmoPatchOnce("    const normalized = normalizeTile(workingDraft, galleryIndex, tileIndex);\n    if (source === 'gallery-draft'","    const normalized = normalizeTile(workingDraft, galleryIndex, tileIndex);\n    const moveTargetId = byId('crmo3047TileMoveTarget')?.value || '';\n    if (moveTargetId && !isBrandGalleryIndex(galleryIndex)) {\n      try {\n        if (!window.CRMOProjectMove) throw Error('מנגנון העברת פרויקטים לא נטען.');\n        if (source === 'gallery-draft' && galleryEditorDraft && galleryEditorIndex === galleryIndex) {\n          galleryEditorDraft.tiles[tileIndex] = normalized;\n          galleries[galleryIndex] = normalizeGallery(galleryEditorDraft, galleryIndex);\n        } else galleries[galleryIndex].tiles[tileIndex] = normalized;\n        window.CRMOProjectMove.moveProject(galleries,galleries[galleryIndex].galleryId,moveTargetId,normalized.tileId);\n        persistLocal(makePayload(galleries));\n        closeTileEditor();\n        if (galleryDialog.open) closeGalleryEditor();\n        renderGalleryStack();populateGallerySelect();\n        await runWithSyncLock('moving project to another gallery',async()=>{\n          const saved = await saveGalleriesToCloud();\n          if (!saved) throw Error('השינוי נשמר מקומית בלבד.');\n        });\n        setStatus('הפרויקט הועבר ונשמר בענן.');\n      } catch (error) { setStatus('העברה נכשלה: '+(error?.message||error)); }\n      return;\n    }\n    if (source === 'gallery-draft'","move-commit");

  crmoPatchOnce("    if (addBtn) addBtn.disabled = !canAddTileToGalleryDraft();\n    updateExpandedControls();","    if (addBtn) addBtn.disabled = !canAddTileToGalleryDraft();\n    const countSelect = byId('crmo3047CompactCount');\n    if (countSelect && galleryEditorDraft) {\n      const full = getFullTileCountForExpanded(galleryEditorDraft.tiles || []);\n      const isBrands = galleryEditorDraft.galleryId === 'our-brands';\n      const allowed = isBrands ? [9,18,27] : [6,9,12,15,18,21,24].filter(n => n === 6 || full >= n);\n      for (const option of countSelect.options) {\n        option.hidden = isBrands ? ![9,18,27].includes(Number(option.value)) : Number(option.value) === 27;\n        option.disabled = !allowed.includes(Number(option.value));\n        option.title = option.disabled && !isBrands ? 'נדרשות ' + option.value + ' עבודות מלאות' : '';\n      }\n      const current = Number(countSelect.value || (isBrands ? galleryEditorDraft.meta?.brandLogoCount || 27 : galleryEditorDraft.meta?.compactCount || 9));\n      if (!allowed.includes(current)) {\n        const nearest = allowed[allowed.length - 1] || 6;\n        countSelect.value = String(nearest);\n        if (isBrands) galleryEditorDraft.meta.brandLogoCount = nearest; else galleryEditorDraft.meta.compactCount = nearest;\n      }\n    }\n    updateExpandedControls();","full-row-options");
  // Match the public brand wall rather than the legacy six-project preview.
  const brandLimitMarker = '  const STACK_TILE_LIMIT = 6;';
  const limitFunctionStart = html.indexOf('  function getExpandedTileLimitFor(');
  const limitFunctionEnd = html.indexOf('\n  function getExpandedTileCountForManagerId(', limitFunctionStart);
  const brandClassMarker = "${isBrandsGallery ? ' is-brands-gallery' : ''}`;";
  if (html.split(brandLimitMarker).length !== 2 || limitFunctionStart < 0 || limitFunctionEnd < 0 || html.split(brandClassMarker).length !== 2) {
    throw Error('מבנה גלריית המותגים השתנה. טעינת העורך נעצרה להגנה על התוכן.');
  }
  const limitFunction = html.slice(limitFunctionStart, limitFunctionEnd);
  html = html.slice(0, limitFunctionStart) + limitFunction.replace('    const inlineKey =', '    const selectedCompact = Number(gallery?.meta?.compactCount || 9);\n    const completedRows = Math.max(6, Math.floor(getFullTileCountForExpanded(gallery?.tiles || []) / 3) * 3);\n    const compactLimit = isBrandGalleryObject(gallery) ? ([9,18,27].includes(Number(gallery?.meta?.brandLogoCount)) ? Number(gallery.meta.brandLogoCount) : BRANDS_STACK_TILE_LIMIT) : Math.min(([6,9,12,15,18,21,24].includes(selectedCompact) ? selectedCompact : STACK_TILE_LIMIT),completedRows);\n    const inlineKey =').replace('    const fullCount = getFullTileCountForExpanded(gallery?.tiles || []);', '    const available = getFullTileCountForExpanded(gallery?.tiles || []);\n    const fullCount = isBrandGalleryObject(gallery) ? available : Math.max(6,Math.floor(available / 3) * 3);').replaceAll('return STACK_TILE_LIMIT', 'return compactLimit').replaceAll('<= STACK_TILE_LIMIT', '<= compactLimit').replaceAll('> STACK_TILE_LIMIT', '> compactLimit') + html.slice(limitFunctionEnd);
  html = html.replace(brandLimitMarker, brandLimitMarker + '\n  const BRANDS_STACK_TILE_LIMIT = 27;');
  html = html.replace('  const MAX_TILES_PER_GALLERY = 24;', '  const MAX_TILES_PER_GALLERY = 27;');
  html = html.replace(brandClassMarker, "${isBrandsGallery ? ' is-brands-gallery' : ''}${isBrandsGallery && visibleTileCount >= 18 && (gallery.tiles || []).filter(tile => tile?.isVisible !== false && ((tile.media || []).some(media => media?.src && media?.isVisible !== false) || tile.logoSrc || tile.brandConfig?.logoSrc)).length >= 15 ? ' is-brand-wall-ready' : ''}`;");
  html = html.replace('Math.min(STACK_TILE_LIMIT, visibleTileCount)', 'Math.min(isBrandsGallery ? BRANDS_STACK_TILE_LIMIT : STACK_TILE_LIMIT, visibleTileCount)');

  // Apply the same standalone-gallery contract to the authenticated legacy renderer.
  const routeHook = `    if(window.CRMO_ROUTES?.render({stack:galleryStack,galleries,editable:canEdit(),visible:isManagerItemVisible,
      renderGallery:(g,i)=>renderSingleGallerySection(g,i,canEdit()),renderAll:()=>renderSuperGallerySection(canEdit()),
      renderAbout:()=>renderAboutSection(canEdit()),renderContact:()=>renderContactSection(canEdit()),
      renderFooter:()=>renderFooterSection(canEdit()),renderLegal:()=>renderLegalSection(canEdit())}))return;`;
  html=html.replace('  function makeDedicatedGalleryUrl(id) {', "  function makeDedicatedGalleryUrl(id) {\n    const shared=window.CRMO_ROUTES?.shareURL(id);\n    if(shared)return shared;");
  html=html.replace('  function getSuperSubButtonLabel(slotIndex) {', "  function getSuperSubButtonLabel(slotIndex) {\n    if(slotIndex===0)return 'POS CHOSEN · עבודות נבחרות';");
  html=html.replace('    const superSubs = getSuperSubGalleries();', '    const superSubs = getSuperSubGalleries().filter(g=>editEnabled||g.meta?.visible!==false);');
  html=html.replace('btn.textContent = getSuperSubButtonLabel(slotIndex);','btn.textContent = getSuperSubButtonLabel(Number(gallery.galleryId.slice(SUPER_SUB_PREFIX.length))-1);');
  html=html.replace('    const selectedCompact =', '    if(window.CRMO_ROUTES?.current())return Math.min(MAX_TILES_PER_GALLERY,(gallery?.tiles||[]).length);\n    const selectedCompact =');
  const routeRenderMarker=/function renderGalleryStack(?:Contents)?\(\)\s*\{\s*galleryStack\.innerHTML = '';/;
  if(!routeRenderMarker.test(html))throw Error('לא ניתן לחבר את מסלול הגלריה לממשק הניהול.');
  html=html.replace(routeRenderMarker,match=>match+'\n'+routeHook);
  html=html.replace("    if (!gallery || isManagedChildGallery(gallery) || isManagedMasterGallery(gallery)) return;", "    if (!gallery || ((isManagedChildGallery(gallery) || isManagedMasterGallery(gallery)) && window.CRMO_ROUTES?.current()?.galleryId !== gallery.galleryId)) return;");
  html=html.replace('  function getDedicatedRoute() {', "  function getDedicatedRoute() {\n    const cleanRoute=window.CRMO_ROUTES?.current();\n    if(cleanRoute)return {managerId:cleanRoute.galleryId,posCategory:cleanRoute.galleryId==='pos'?'all-works':''};");
  html=html.replace("      if (getAboutDisplayMode() === 'expanded') {", "      if (getAboutDisplayMode() === 'expanded' && window.CRMO_ROUTES?.current()?.kind !== 'all') {");
  html=html.replace('    renderLegalSection(editEnabled);', '    renderLegalSection(editEnabled);\n    window.CRMO_ROUTES?.decorate();');

  // Release files can contain obsolete admin chrome. Normalize it on every load.
  const editorDocument=new DOMParser().parseFromString(html,'text/html');
  editorDocument.title='CRMO | sales oriented design';
  // The private editor creates dialogs at runtime, so add the new fields after it boots.
  const editorFeaturesScript=editorDocument.createElement('script');
  editorFeaturesScript.textContent="(()=>{\n    function attach(){\n      const galleryTools=document.querySelector('#crmo3047GalleryEditor .crmo3047-gallery-tools-row');\n      if(galleryTools&&!document.getElementById('crmo3047CompactCount')){\n        const label=document.createElement('label');label.className='crmo3045-field';\n        const caption=document.createElement('span');caption.textContent='מספר פריטים בתצוגת הגלריה';\n        const select=document.createElement('select');select.id='crmo3047CompactCount';\n        for(const count of [6,9,12,15,18,21,24,27]){\n          const option=document.createElement('option');option.value=String(count);option.textContent=String(count)+' פריטים';select.append(option);\n        }\n        label.append(caption,select);\n        galleryTools.prepend(label);\n      }\n      const tileTop=document.querySelector('#crmo3047TileEditor .crmo3047-tile-editor-top');\n      if(tileTop&&!document.getElementById('crmo3047TileMoveTarget')){\n        const label=document.createElement('label');label.className='crmo3045-field';\n        const caption=document.createElement('span');caption.textContent='העבר לגלריה אחרת';\n        const select=document.createElement('select');select.id='crmo3047TileMoveTarget';select.setAttribute('aria-label','העבר לגלריה אחרת');\n        label.append(caption,select);tileTop.append(label);\n      }\n    }\n    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();\n  })();";
  editorDocument.body.append(editorFeaturesScript);

  // Replace the bundled resolver below with the shared resolver before editor boot.
  // The external folder uploader is obsolete; existing cloud assets remain untouched.
  editorDocument.querySelectorAll('script[src*="studio-assets.js"],script#crmo3283-studio-assets').forEach(script=>script.remove());
  editorDocument.querySelectorAll('#galleryTestSections').forEach(node=>node.remove());
  editorDocument.querySelectorAll('#adminDashboard button').forEach(button=>{
    if(/^באקטים\s*[·-]\s*V\d+/i.test(button.textContent.trim())) button.textContent='באקטים';
  });
  // Private release files still contain an unversioned config.js. A cached copy
  // overwrites the freshly injected release and can point at a different content row.
  const editorBase=new URL('admin/',window.CRMO_ROOT_URL);
  editorDocument.querySelectorAll('script[src]').forEach(script=>{
    if(new URL(script.getAttribute('src'),editorBase).pathname.endsWith('/public/config.js'))script.remove();
    else if(new URL(script.getAttribute('src'),editorBase).pathname.endsWith('/admin/permissions.js')){
      script.setAttribute('src',new URL('admin/permissions.js?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href);
    }
  });
  // All first-party editor dependencies use the central release cache key.
  editorDocument.querySelectorAll('script[src],link[rel="stylesheet"][href]').forEach(node=>{
    const attr=node.tagName==='SCRIPT'?'src':'href';
    const url=new URL(node.getAttribute(attr),editorBase);
    if(url.origin!==new URL(window.CRMO_ROOT_URL).origin||!/[.](js|css)$/.test(url.pathname))return;
    url.searchParams.set('v',window.CRMO_CONFIG.release);
    node.setAttribute(attr,url.href);
  });
  // A legacy <base href="/admin/"> makes #links drop the entry query and reload.
  // Resolve section links against this exact document, preserving its release cache key.
  editorDocument.querySelectorAll('nav a[href^="#"]').forEach(link=>{
    const hash=link.getAttribute('href');
    if(!hash||hash==='#')return;
    const target=new URL(window.location.href);target.hash=hash;
    link.setAttribute('href',target.href);
  });
  const legacyNotice=editorDocument.querySelector('div[style*="#fff4cd"]');
  if(legacyNotice&&legacyNotice.querySelector('a[href="../index.html"]'))legacyNotice.remove();
  const headerStyle=editorDocument.createElement('style');
  headerStyle.id='crmo-admin-header-layout';
  headerStyle.textContent=`
    .crmo3045-tile.crmo-berlin-award::after,
    .crmo3045-lb-view.crmo-berlin-award::after{content:none!important;display:none!important}
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
    body.role-admin section,body.role-master section{scroll-margin-top:calc(var(--crmo-admin-dashboard-h,0px) + 96px)!important}
  `;
  headerStyle.textContent += ".crmo3045-hover{background:rgba(255,255,255,.90);padding:8px 12px}.crmo3045-hover-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.crmo3045-hover-desc{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;white-space:normal;line-height:1.25;max-height:3.75em}";
  // Reserve thumbnail geometry before image decoding, so drag targets never collapse.
  headerStyle.textContent += "#crmo3047EditorStrip .crmo3045-thumb{display:block!important;width:100%!important;aspect-ratio:16/9!important;box-sizing:border-box}#crmo3047EditorStrip .crmo3045-thumb img,#crmo3047EditorStrip .crmo3045-thumb video{display:block;width:100%;height:100%;object-fit:cover}";
  editorDocument.head.append(headerStyle);
  const brandStyles = editorDocument.createElement('link');
  brandStyles.rel = 'stylesheet';
  brandStyles.href = new URL('public/brand-gallery.css?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href;
  editorDocument.head.append(brandStyles);
  const uxStyle=editorDocument.createElement('style');
  uxStyle.id='crmo-ux-v3306';
  uxStyle.textContent=`
    #adminDashboard {
      position:sticky!important;top:0!important;z-index:10020!important;
      margin:0!important;background:#fff!important;
      font-size:11px!important;max-height:min(45dvh,320px);overflow-y:auto;
      overscroll-behavior:contain;
    }
    body.role-admin header,body.role-master header {
      position:sticky!important;top:var(--crmo-admin-dashboard-h,0px)!important;
      z-index:10010!important;
    }
    html body #crmo3047Lightbox.crmo3045-dialog {
      position:fixed!important;inset:50% auto auto 50%!important;
      top:50%!important;left:50%!important;right:auto!important;bottom:auto!important;
      transform:translate(-50%,-50%)!important;margin:0!important;
      width:min(920px,calc(100vw - 32px))!important;
      max-width:min(920px,calc(100vw - 32px))!important;
      max-height:calc(100dvh - 32px)!important;overflow:visible!important;
    }
    html body #crmo3047Lightbox .crmo3045-modal {
      max-height:calc(100dvh - 32px)!important;
      overflow-y:auto!important;overscroll-behavior:contain;
    }
    #adminDashboard button,#adminDashboard input,#adminDashboard select,
    #adminDashboard .dashboard-pill { font-size:11px!important; }
    #adminDashboard.crmo-ux-collapsed > :not(.crmo-ux-dashboard-toggle) {display:none!important}
    #adminDashboard.crmo-ux-collapsed {min-height:0!important;padding:4px 8px!important}
    #adminDashboard .crmo-ux-dashboard-toggle {
      display:flex;align-items:center;justify-content:flex-start;direction:ltr;
      width:100%;height:32px;min-height:32px;
    }
    #crmo-ux-expand-admin {
      width:auto;min-width:112px;height:32px;padding:0 12px;border:1px solid #111;border-radius:16px;
      background:#111;color:#fff;cursor:pointer;font:13px/1 Arial,sans-serif;
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
    #crmo3047GalleryTiles .crmo3045-tile-wrap.is-hidden-tile .crmo3045-tile,
    #crmo3047GalleryTiles .crmo3045-tile-wrap.is-hidden-tile .crmo3045-tile-media {
      filter:grayscale(1)!important;opacity:.55!important;
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
  uxStyle.textContent += `.crmo3339-gallery-toolbar{display:flex!important;direction:rtl;justify-content:flex-start;align-items:center;gap:18px;width:100%;justify-self:stretch}.crmo3339-gallery-toolbar button[data-gallery-editor],.crmo3339-gallery-toolbar button[data-managed-gallery-editor],.crmo3339-gallery-toolbar button[data-super-gallery-editor]{width:40px!important;height:40px!important;min-width:40px!important;flex:0 0 40px}.crmo3339-inline-checks{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.crmo3339-inline-checks label{font-size:16px;min-height:44px;gap:8px}.crmo3339-inline-checks input{width:22px;height:22px}.crmo3047-gallery-head{margin-bottom:0!important;gap:8px!important}.crmo3047-gallery{gap:8px!important}`;
  editorDocument.head.append(uxStyle);
  const uxScript=editorDocument.createElement('script');
  uxScript.id='crmo-ux-v3306-script';
  uxScript.textContent=`(function(){
    const marker='\\u2063';
    let observedDashboard=null;
    const dashboardResizeObserver=new ResizeObserver(()=>{
      if(observedDashboard){
        const h=observedDashboard.classList.contains('visible')
          ? observedDashboard.getBoundingClientRect().height : 0;
        document.documentElement.style.setProperty('--crmo-admin-dashboard-h',h+'px');
      }
    });
    function setup(){
      document.querySelectorAll('#adminDashboard button').forEach(button=>{
        if(/^באקטים[\\s]*[·-][\\s]*V[0-9]+/i.test(button.textContent.trim()))button.textContent='באקטים';
      });
      document.querySelectorAll('section > strong').forEach(title=>{
        if(title.textContent.trim()==='נכסי הסטודיו' &&
           title.parentElement?.querySelector('input[type="file"][webkitdirectory]')){
          title.parentElement.remove();
        }
      });
      const panel=document.getElementById('adminDashboard');
      if(panel&&panel!==observedDashboard){
        if(observedDashboard)dashboardResizeObserver.unobserve(observedDashboard);
        observedDashboard=panel;
        dashboardResizeObserver.observe(panel);
      }
      if(panel&&!document.getElementById('crmo-ux-expand-admin')){
        const row=document.createElement('div');
        row.className='crmo-ux-dashboard-toggle';
        const button=document.createElement('button');
        button.id='crmo-ux-expand-admin';button.type='button';button.textContent='לוח ניהול +';
        button.setAttribute('aria-label','פתח או סגור לוח ניהול');
        button.setAttribute('aria-expanded','false');
        panel.classList.add('crmo-ux-collapsed');
        button.addEventListener('click',()=>{
          const closed=panel.classList.toggle('crmo-ux-collapsed');
          button.textContent=closed?'לוח ניהול +':'סגור לוח ניהול −';
          button.setAttribute('aria-expanded',String(!closed));
        });
        const releaseBadge=document.createElement('span');releaseBadge.className='crmo-admin-release-badge';releaseBadge.style.cssText='margin-inline:10px;font:11px Arial,sans-serif';releaseBadge.textContent='CRMO_v'+window.CRMO_CONFIG.release;row.append(button,releaseBadge);panel.prepend(row);
      }
      document.querySelectorAll('button[data-gallery-editor],button[data-managed-gallery-editor]').forEach(button=>{
        button.setAttribute('aria-label','עריכת הגלריה');
        button.title='עריכת הגלריה';
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
  const routeScript=editorDocument.createElement('script');
  routeScript.src=new URL('public/gallery-routes.js?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href;
  releaseConfig.after(routeScript);
  // applyFaviconLaw and auth UI call this synchronously, before the first cloud read.
  editorDocument.querySelectorAll('script[src*="studio-fallback.js"]').forEach(script=>script.remove());
  const studioAssetsScript=editorDocument.createElement('script');
  studioAssetsScript.src=new URL('public/studio-fallback.js?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href;
  releaseConfig.after(studioAssetsScript);
  const contentSyncScript=editorDocument.createElement('script');
  contentSyncScript.src=new URL('public/content-sync.js?v='+window.CRMO_CONFIG.release+'-live',window.CRMO_ROOT_URL).href;
  studioAssetsScript.after(contentSyncScript);
  const votesScript=editorDocument.createElement('script');
  votesScript.src=new URL('public/project-votes.js?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href;
  contentSyncScript.after(votesScript);
  const votesStyle=editorDocument.createElement('link');votesStyle.rel='stylesheet';
  votesStyle.href=new URL('public/project-votes.css?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href;
  editorDocument.head.append(votesStyle);
  const moveScript=editorDocument.createElement('script');
  moveScript.src=new URL('public/admin-project-move.js?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href;
  contentSyncScript.after(moveScript);
  if(new URLSearchParams(window.location.search).get('dev')==='move-projects'){
    const moveStyle=editorDocument.createElement('style');
    moveStyle.textContent='.crmo-project-move{position:absolute;top:6px;right:6px;z-index:30;max-width:calc(100% - 48px);width:170px;padding:6px;border:1px solid #aaa;border-radius:5px;background:#fff;color:#111;font:12px Arial,sans-serif;direction:rtl}#crmo-project-move-status{position:fixed;bottom:20px;right:20px;z-index:10040;max-width:min(500px,90vw);padding:14px 20px;border:1px solid #bbb;border-radius:8px;background:#fff;box-shadow:0 3px 18px #0002;direction:rtl;font:14px Arial,sans-serif}';
    editorDocument.head.append(moveStyle);
  }
  const releaseGuard=editorDocument.createElement('script');
  releaseGuard.textContent="(()=>{const title=window.CRMO_CONFIG.siteTitle;const version=\"CRMO_v\"+window.CRMO_CONFIG.release;const sync=()=>{if(document.title!==title)document.title=title;document.querySelectorAll(\"#adminVersionPill,#footerVersionLabel,#crmo-footer-version,.crmo3047-footer-version\").forEach(el=>{if(el.textContent!==version)el.textContent=version;});};sync();new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true,characterData:true});})();";
  editorDocument.body.append(releaseGuard);
  // Mirror public reviewed framing in the privately loaded editor.
  if (!editorDocument.querySelector('script[src*="crmo-smart-framing.js"]')) {
    const framingScript=editorDocument.createElement('script');
    framingScript.defer=true;
    framingScript.src=new URL('public/crmo-smart-framing.js?v='+window.CRMO_CONFIG.release,window.CRMO_ROOT_URL).href;
    editorDocument.body.append(framingScript);
  }
  const editorHTML='<!DOCTYPE html>'+editorDocument.documentElement.outerHTML;
  if(!bridge.isLoggedIn()||!bridge.canManage())throw Error('הרשאת הניהול השתנתה. יש להתחבר מחדש.');
  // The public viewer must not keep polling against its detached DOM after promotion.
  window.CRMOContentSync?.stop?.();
  bridge.dispose();delete window.CRMOAuthBridge;
  document.open();document.write(editorHTML);document.close();
 }catch(error){status.textContent=error.message||'לא ניתן לפתוח את ממשק הניהול.';status.setAttribute('role','alert');}
})();

