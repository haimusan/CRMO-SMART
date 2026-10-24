const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('public/content-sync.js', 'utf8');
async function scenario() {
  let latest = 'r1', busy = false, dialog = false, allow = true, renders = 0, requests = 0, failed = false, deferred;
  const scrolls = [], events = {};
  const context = {URLSearchParams, AbortController, console:{warn(){}},
    setTimeout,clearTimeout,setInterval:()=>1,clearInterval(){},requestAnimationFrame:fn=>fn(),
    document:{visibilityState:'visible',activeElement:null,querySelector:()=>dialog?{}:null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener:(n,fn)=>events[n]=fn,removeEventListener(){}},
    fetch:async()=>{requests++;if(deferred){const wait=deferred;deferred=null;await wait;}if(failed)throw Error('offline');return {ok:true,json:async()=>[{updated_at:latest}]};}
  };
  context.window=context;context.CRMO_CONFIG={url:'https://example.test',table:'content',contentRow:'published',anonKey:'public'};
  context.scrollX=0;context.scrollY=700;context.scrollTo=p=>scrolls.push(p);
  context.addEventListener=(n,fn)=>events[n]=fn;context.removeEventListener=()=>{};
  vm.createContext(context);vm.runInContext(source,context);
  const sync=context.CRMOContentSync.start({canApply:()=>!busy,refresh:async canApply=>{if(!allow||!canApply())return false;renders++;sync.accept(latest);return true;}});
  sync.accept('r1');await sync.check();assert.equal(renders,0);assert.equal(scrolls.length,0);
  latest='r2';await sync.check();assert.equal(renders,1);assert.equal(scrolls[0].top,700);
  await sync.check();assert.equal(renders,1,'same revision does not rebuild galleries');
  latest='r3';busy=true;const before=requests;await sync.check();assert.equal(requests,before,'unsaved editor does not poll');
  busy=false;dialog=true;await sync.check();assert.equal(renders,1);dialog=false;
  let resume;deferred=new Promise(r=>resume=r);const inflight=sync.check();dialog=true;resume();await inflight;assert.equal(renders,1,'opening a dialog during fetch protects work');
  dialog=false;allow=false;await sync.check();assert.equal(renders,1);allow=true;
  failed=true;await sync.check();assert.equal(renders,1,'network error keeps displayed content');failed=false;
  await sync.check();assert.equal(renders,2,'failed refresh is retried');
  context.document.visibilityState='hidden';latest='r4';await sync.check();assert.equal(renders,2);
  context.document.visibilityState='visible';await events.visibilitychange();await new Promise(r=>setImmediate(r));assert.equal(renders,3);
  sync.stop();latest='r5';await sync.check();assert.equal(renders,3);
}
function editorPatch() {
  const loader=fs.readFileSync('public/admin-loader.js','utf8');
  const start=loader.indexOf('  const persistPattern'),end=loader.indexOf('  // Release files');
  const legacy=fs.readFileSync('preview/v3286/admin/CRMO_v3286.html','utf8');
  const context={html:legacy};vm.createContext(context);vm.runInContext(loader.slice(start,end),context);
  assert(context.html.includes('window.CRMOContentSync.start('));
  assert(context.html.includes('contentFingerprint() === cloudContentBaseline'));
  assert(context.html.includes('return window.CRMO_CONFIG.contentRow'));
  let count=0;
  for(const match of context.html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    if(!match[1].trim())continue;
    new vm.Script(match[1]);count++;
  }
  assert(count>5,'patched legacy script syntax checked');
}
(async()=>{await scenario();editorPatch();console.log('PASS: shared cloud revisions, retry, no-change stability, protected edits/dialogs, in-flight guard, scroll preservation, editor patch syntax.');})().catch(e=>{console.error(e);process.exit(1);});
