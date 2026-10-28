const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('public/content-sync.js','utf8');
const sandbox={window:{}};vm.runInNewContext(source,sandbox);
const save=sandbox.window.CRMOContentSync.updateIfCurrent;
function database(){
 const state={revision:'revision-1',payload:'original',writes:0};
 const client={from(table){assert.equal(table,'content');return {update(row){const filters={};return {eq(k,v){filters[k]=v;return this},select(){return this},async maybeSingle(){
 if(filters.key!=='main'||filters.updated_at!==state.revision)return {data:null,error:null};
 state.payload=row.payload;state.revision=row.updated_at;state.writes++;return {data:{key:'main'},error:null};
 }}}}}};
 return {state,client};
}
const args=(db,revision,value)=>({client:db.client,table:'content',keyColumn:'key',rowKey:'main',revision,row:{payload:value,updated_at:value}});
test('only one of two editors loaded from the same revision can save',async()=>{
 const db=database();const results=await Promise.allSettled([save(args(db,'revision-1','newer')),save(args(db,'revision-1','stale'))]);
 assert.equal(results[0].status,'fulfilled');assert.equal(results[1].status,'rejected');assert.equal(db.state.payload,'newer');assert.equal(db.state.writes,1);
});
test('a refreshed editor can save the next change',async()=>{
 const db=database();await save(args(db,'revision-1','newer'));await save(args(db,'newer','next'));assert.equal(db.state.payload,'next');
});
test('offline fallback cannot overwrite cloud without a loaded revision',async()=>{
 const db=database();await assert.rejects(save(args(db,'','stale')));assert.equal(db.state.writes,0);
});
test('a failed database write is surfaced without an unconditional retry',async()=>{
 let calls=0;const error=new Error('permission denied');const client={from(){calls++;return {update(){return {eq(){return this},select(){return this},async maybeSingle(){return {error}}}}}}};
 await assert.rejects(save({...args(database(),'revision-1','newer'),client}),/permission denied/);assert.equal(calls,1);
});
test('loader replaces legacy blind write and tracks the loaded cloud revision',async()=>{
 const html=fs.readFileSync('../crmo-private-fixtures/CRMO_v3286.html','utf8').replace('function renderGalleryStack()', 'function renderGalleryStackContents()');let patched;
 const context={URL,URLSearchParams,Date,console,window:{location:{href:'https://www.crmo.co.il/admin/?dev=move-projects',search:'?dev=move-projects'},CRMO_ROOT_URL:'https://www.crmo.co.il/',CRMO_CONFIG:{url:'https://example.com',release:'3314',anonKey:'public-key'}},document:{getElementById(){return {setAttribute(){}}}},fetch:async()=>({ok:true,json:async()=>({path:'releases/CRMO_v3288.html'})}),DOMParser:class {parseFromString(text){patched=text;throw Error('capture')}}};
 context.window.CRMOAuthBridge={
  ready:Promise.resolve(),isLoggedIn:()=>true,canManage:()=>true,
  getSupabaseClient:()=>({
   auth:{getSession:async()=>({data:{session:{access_token:'test'}}})},
   storage:{from:()=>({download:async()=>({data:{text:async()=>html}})})}
  })
 };
 await vm.runInNewContext(fs.readFileSync('public/admin-loader.js','utf8'),context);
 assert.ok(patched,'loader should validate and patch the legacy editor');
 assert.ok(patched.includes('cloudContentRevision = next.__cloudRevision'));
 assert.ok(patched.includes('row, revision: cloudContentRevision'));
 assert.ok(patched.includes('renderGallery:(g,i)=>renderSingleGallerySection'), 'active wrapped renderer receives the standalone route hook');
 const saving=patched.slice(patched.indexOf('  async function saveGalleriesToCloud()'),patched.indexOf('  async function loadFromCloudAndApply()'));
 assert.ok(!saving.includes('.upsert('));assert.ok(saving.includes('updateIfCurrent'));
 for(const script of patched.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) if(script[1].trim())new vm.Script(script[1]);
});
