/* Build the read-only renderer from the approved 3284 source. No bundler required. */
const fs=require('fs'),path=require('path');
// Node embeds Acorn. Keep the extracted parser in scratch, not in the project.
const vm=require('vm'),parser={exports:{}};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{module:parser,exports:parser.exports});const acorn=parser.exports;
const root=path.resolve(__dirname,'..');
if(!process.argv[2])throw Error('Usage: node scripts/build.cjs /path/to/CRMO_v3284.html');
const input=fs.readFileSync(path.resolve(process.argv[2]),'utf8');
const scripts=[...input.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
const source=scripts.find(m=>m[1].includes('crmo3047-multigallery-script'))[2];
const ast=acorn.parse(source,{ecmaVersion:'latest'});
const body=ast.body[0].expression.callee.body.body;
const map=new Map();
for(const n of body){if(n.type==='FunctionDeclaration')map.set(n.id.name,n);if(n.type==='VariableDeclaration')for(const d of n.declarations)if(d.id.type==='Identifier')map.set(d.id.name,n);}
const replacements={
 aboutDialog:'const aboutDialog=null;',contactDialog:'const contactDialog=null;',footerDialog:'const footerDialog=null;',privacyDialog:'const privacyDialog=null;',accessibilityDialog:'const accessibilityDialog=null;',
 canEdit:'function canEdit(){return false;}',
 isLoggedIn:'function isLoggedIn(){return false;}',
 getConnection:'function getConnection(){return window.CRMO_CONFIG;}',
 getSiteRootUrl:'function getSiteRootUrl(){const u=new URL(window.CRMO_ROOT_URL || new URL("./",location.href));u.search="";u.hash="";return u;}',
 getAssetBase:'function getAssetBase(){return window.CRMO_CONFIG.url+"/storage/v1/object/public/assets/";}',
 loadLocalWrapper:'function loadLocalWrapper(){return window.CRMO_RELEASE_SNAPSHOT || null;}',
 persistLocal:'function persistLocal(){}',
 getWorkingTiles:'function getWorkingTiles(i){return galleries[i]?.tiles || [];}',
 getTileSourceCollection:'function getTileSourceCollection(i){return galleries[i]?.tiles || [];}',
 applyWrapper:`function applyWrapper(raw){
 const next=hydrateWrapperShape(raw); if(!next) throw Error('Invalid site content');
 siteState=ensureSiteState(next.site||{});galleries=ensureAllGalleries(next.galleries||[]);
 aboutSection=ensureAboutSection(next.aboutSection||siteState.about||{});
 contactSection=ensureContactSection(next.contactSection||siteState.contact||{});
 footerSection=ensureFooterSection(next.footerSection||siteState.footer||{});
 accessibilitySection=ensureAccessibilitySection(next.accessibilitySection||siteState.accessibility||{});
 privacySection=ensurePrivacySection(next.privacySection||siteState.privacy||{});
 applyPosCopyOnce();applyOurBrandsCopyOnce3283();applyAllWorksCopyOnce3284();applyRequestedGalleryOrderOnce();
 document.getElementById('crmo-loading')?.remove();renderGalleryStack();applyFaviconLaw();return {galleries,site:siteState};
 }`,
 STORAGE_KEY:"const STORAGE_KEY='CRMO_3285_VIEWER';",
 VERSION:"const VERSION='CRMO_v3285';"
};
const forbidden=new Set([...map.keys()].filter(n=>/^(open.*Editor|close.*Editor|render.*Editor|save.*Editor|collect.*Editor|sync.*Draft|installGalleryManagerButton|openGalleryManager|closeGalleryManager|saveGalleryManager|showStoragePlan)/.test(n)));
const walk=(n,fn,parent=null,key=null)=>{if(!n||typeof n!=='object')return; if(n.type)fn(n,parent,key);for(const [k,v]of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn,n,k));else if(v&&typeof v==='object')walk(v,fn,n,k);}};
function rewrite(n){let text=source.slice(n.start,n.end);const edits=[];walk(n,(x,p,key)=>{if(x.type==='Identifier'&&forbidden.has(x.name)&&!(p?.type==='CallExpression'&&key==='callee'))edits.push({s:x.start-n.start,e:x.end-n.start,v:'(()=>{})'});if(x.type==='CallExpression'&&x.callee.type==='Identifier'&&forbidden.has(x.callee.name))edits.push({s:x.start-n.start,e:x.end-n.start,v:'void 0'});});edits.sort((a,b)=>a.s-b.s);const outer=edits.filter((e,i)=>!edits.slice(0,i).some(p=>p.s<=e.s&&p.e>=e.e));for(const e of outer.reverse())text=text.slice(0,e.s)+e.v+text.slice(e.e);return text;}
const needed=new Set();
function include(name){if(needed.has(name)||forbidden.has(name)||!map.has(name))return;needed.add(name);const n=map.get(name);const text=replacements[name]||rewrite(n);const a=acorn.parse(text,{ecmaVersion:'latest'});walk(a,(x,p,k)=>{if(x.type!=='Identifier')return;if(p?.type==='MemberExpression'&&k==='property'&&!p.computed)return;if(p?.type==='Property'&&k==='key'&&!p.computed&&!p.shorthand)return;if(x.name!==name)include(x.name);});}
['renderGalleryStack','hydrateWrapperShape','applyWrapper','shiftTile','openLightbox','renderLightbox','applyFaviconLaw','galleries','siteState','aboutSection','contactSection','footerSection','accessibilitySection','privacySection','activeGalleryIndex','activeTileIndex','activeMediaIndex','activeSuperGalleryId','inlineExpandedGalleryIds','activeManagedMasterIds','galleryManagerDraft'].forEach(include);
const sideIndices=new Set([21,22,25,26,27,28,31,32,33,34,35,71,72,73,74,75,185]);
// Initializations referenced by a retained function must remain in their original order.
for(const i of sideIndices)walk(body[i],n=>{if(n.type==='Identifier')include(n.name)});
const retained=[];const emitted=new Set();
body.forEach((n,i)=>{const names=[...map].filter(([k,v])=>v===n).map(([k])=>k);const name=names.find(k=>needed.has(k));if(name){if(emitted.has(n))return;emitted.add(n);retained.push(replacements[name]||rewrite(n));}else if(sideIndices.has(i))retained.push(rewrite(n));});
const boot=`
byId('crmo3047PrevTile').addEventListener('click',()=>shiftTile(-1));
byId('crmo3047NextTile').addEventListener('click',()=>shiftTile(1));
lb.querySelector('[data-close-lightbox]').addEventListener('click',()=>lb.close());
lb.addEventListener('close',()=>document.body.classList.remove('lightbox-open'));
privacyPanel.addEventListener('click',e=>{if(e.target.closest('[data-close-privacy-panel]'))closePrivacyPanel();});
window.addEventListener('keydown',e=>{if(lb.open&&e.key==='ArrowLeft')shiftTile(-1);if(lb.open&&e.key==='ArrowRight')shiftTile(1);});
window.CRMO_VIEW = {apply:applyWrapper,summary:()=>({galleryIds:galleries.map(g=>g.galleryId),order:getManagerRenderOrder(),tiles:galleries.map(g=>g.tiles.length)})};
if(window.CRMO_RELEASE_SNAPSHOT)applyWrapper(window.CRMO_RELEASE_SNAPSHOT);
async function refreshPublicContent(){
 const c=window.CRMO_CONFIG;const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),10000);
 try{const query=new URLSearchParams({select:'payload',key:'eq.'+c.contentRow});
 const r=await fetch(c.url+'/rest/v1/'+c.table+'?'+query,{headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey},cache:'no-store',signal:ctl.signal});
 if(!r.ok)throw Error('Content HTTP '+r.status);const data=await r.json();if(data[0]?.payload)applyWrapper(data[0].payload);
 }catch(e){console.warn('Content fetch failed:',e.message);const msg=document.getElementById('crmo-loading');if(msg)msg.textContent='לא ניתן לטעון את התוכן כרגע. בדוק את החיבור ונסה לרענן.';}finally{clearTimeout(timer);}}
refreshPublicContent();window.addEventListener('focus',refreshPublicContent);
`;
// Public legal popover is a viewing feature.
include('closePrivacyPanel');
if(!needed.has('closePrivacyPanel'))throw Error('privacy close missing');
if(!retained.some(x=>x.includes('function closePrivacyPanel(')))retained.push(rewrite(map.get('closePrivacyPanel')));
const viewer='(()=>{\n"use strict";\n'+retained.join('\n\n')+'\n'+boot+'\n})();';
acorn.parse(viewer,{ecmaVersion:'latest'});
fs.writeFileSync(path.join(root,'public/viewer.js'),viewer);
fs.writeFileSync(path.join(root,'public/viewer.css'),[...input.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(x=>x[1]).join('\n')+'\n#crmo-user-indicator{cursor:pointer}');
// Config is public; no secret/service-role key is present.
const defaults=input.match(/const APP_CONNECTION_DEFAULTS = Object.freeze\(\{([\s\S]*?)\}\);/);
if(!defaults)throw Error('Missing connection defaults');
const cfg=Function('return ({'+defaults[1]+'})')();cfg.rowKey='preview_v3285';cfg.contentRow='preview_v3285__multi_gallery_demo';cfg.release='3285';cfg.roles=['viewer','social','registered','client','admin','owner'];
fs.writeFileSync(path.join(root,'public/config.js'),'window.CRMO_ROOT_URL=new URL("../",document.currentScript?.src || new URL("public/config.js",location.href)).href;window.CRMO_CONFIG=Object.freeze('+JSON.stringify(cfg)+');\n');
let layout=scripts.find(x=>x[1].includes('crmo3281-storage-layout'))[2];
 layout=layout.slice(0,layout.indexOf('  function destination('))+`window.CRMOStorage3281=Object.freeze({prepare,remapReferences});})();`;
 const assets=scripts[0][2].replace("if (isLocal()) return 'assets/';",'').replace('conn.url || window.CRMO_SUPABASE_URL','conn.url || window.CRMO_CONFIG?.url');
 layout=assets+'\n'+layout;
fs.writeFileSync(path.join(root,'public/content-layout.js'),layout);
const header=input.match(/<header\b[\s\S]*?<\/header>/)[0];
fs.writeFileSync(path.join(root,'index.html'),`<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CRMO | sales oriented design</title><link rel="stylesheet" href="public/viewer.css"><script src="public/config.js"></script><script src="public/content-layout.js"></script></head><body>${header}<main class="stage"><p id="crmo-loading" role="status">טוען את האתר…</p></main><script src="public/viewer.js"></script><script>document.getElementById('crmo-user-indicator')?.addEventListener('click',()=>location.href=new URL('admin/index.html',location.href).href);</script></body></html>`);
let admin=input.replace(/CRMO_v3284/g,'CRMO_v3285').replace("rowKey: 'main'","rowKey: 'preview_v3285'");
admin=admin.replace("const LOCAL_CONN_KEY =", "const LOCAL_CONN_KEY =");
// Studio assets share the exact same cloud URL in both file: and HTTPS runtimes.
admin=admin.replace("if (isLocal()) return 'assets/';",'');
admin=admin.replace("const url = conn.url || window.CRMO_SUPABASE_URL;","const url = conn.url || window.CRMO_CONFIG?.url;");
admin=admin.replace(/function canEdit\(\) \{\n    const bridge = getBridge\(\);[\s\S]*?\n  \}/,"function canEdit(){return window.CRMOPermissions?.canEdit() === true;}");
admin=admin.replace("function canEdit(){ try{ return !!bridge()?.isLoggedIn?.(); }catch(e){ return false; } }","function canEdit(){return window.CRMOPermissions?.canEdit() === true;}");
admin=admin.replace("function updateAuthUI(isLoggedIn) {","function updateAuthUI(isLoggedIn) {\n const editable = isLoggedIn && window.CRMOPermissions?.canEdit() === true;");
admin=admin.replace("els.adminDashboard.classList.toggle('visible', isLoggedIn)","els.adminDashboard.classList.toggle('visible', editable)").replace("els.tileWrap.classList.toggle('editable', isLoggedIn)","els.tileWrap.classList.toggle('editable', editable)");
// Ignore saved connection settings to prevent a local legacy key from writing the live row.
const start=admin.indexOf('      function getConnectionSettings() {');const end=admin.indexOf('\n      function ',start+12);
if(start<0||end<0)throw Error('Cannot isolate settings');
admin=admin.slice(0,start)+`      function getConnectionSettings(){return {...window.CRMO_CONFIG};}\n`+admin.slice(end);
// Seed only the preview cache; do not overwrite a user's previous local draft.
admin=admin.replace("const STORAGE_KEY = 'CRMO_v3281_MULTI_GALLERY_DEMO';","const STORAGE_KEY = 'CRMO_v3285_PREVIEW';");
admin=admin.replace("let localWrapper = loadLocalWrapper();","let localWrapper = loadLocalWrapper();");
// Every cloud write requires the verified role, including the legacy editor.
admin=admin.replace('async function saveToCloud(', 'async function saveToCloud('); // guard inserted at function bodies below
admin=admin.replace(/(async function (?:saveGalleriesToCloud|uploadMediaItem|uploadAboutLogoAsset)\([^)]*\) \{)/g,'$1\n if(!window.CRMOPermissions?.canEdit())throw Error("אין הרשאת עריכה");');
admin=admin.replace(/(async function saveToCloud\([^)]*\) \{)/g,'$1\n if(!window.CRMOPermissions?.canEdit())throw Error("אין הרשאת עריכה");');
admin=admin.replace('<head>','<head>\n<script src="../public/config.js"></script><script src="permissions.js"></script><script src="studio-assets.js" defer></script>\n<style>body:not(.crmo-authorized) .dashboard-shell,body:not(.crmo-authorized) .tile-edit-btn,body:not(.crmo-authorized) .crmo3045-pencil{display:none!important}</style>');
admin=admin.replace('<body>','<body><div style="background:#fff4cd;padding:8px;text-align:center;font:14px Arial">גרסת בדיקה 3285 — השמירה מעדכנת תוכן בדיקה בלבד. <a href="../index.html">לתצוגה הציבורית</a></div>');
const rootFn=map.get('getSiteRootUrl');admin=admin.replace(source.slice(rootFn.start,rootFn.end),replacements.getSiteRootUrl);
fs.writeFileSync(path.join(root,'admin/index.html'),admin);
fs.writeFileSync(path.join(root,'scripts/viewer-functions.json'),JSON.stringify([...needed].sort(),null,2));
console.log('Retained display bindings:',needed.size,'Viewer bytes:',viewer.length,'Admin bytes:',admin.length);
