const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const loader=fs.readFileSync('public/admin-loader.js','utf8');
const patch=loader.slice(loader.indexOf('  const persistPattern'),loader.indexOf('  // Release files'));
const legacy=fs.readFileSync('preview/v3286/admin/CRMO_v3286.html','utf8');
const context={html:legacy};vm.createContext(context);vm.runInContext(patch,context);
assert.notEqual(context.html,legacy);
const body=context.html.match(/function persistLocal\(payload = makePayload\(galleries\)\) \{[\s\S]*?\n  \}/)[0];
function run({online=true,error=null}={}){
 const state={window:{},console:{warn(){}},localWrapper:null,hydrateWrapperShape:p=>p,isLoggedIn:()=>online,getSupabaseClient:()=>({}),getConnection:()=>({}),STORAGE_KEY:'draft',localStorage:{setItem(){if(error)throw error;}}};
 vm.createContext(state);vm.runInContext(body,state);return state;
}
const quota=Object.assign(new Error('full'),{name:'QuotaExceededError'});
let c=run({error:quota});vm.runInContext('persistLocal({images:["new-upload"]}); cloudWriteReached=true;',c);assert.equal(c.cloudWriteReached,true);assert.equal(c.window.CRMO_LOCAL_CACHE_FULL,true);assert.equal(c.localWrapper.images[0],'new-upload');
c=run({online:false,error:quota});assert.throws(()=>vm.runInContext('persistLocal({}); cloudWriteReached=true;',c),/full/);assert.equal(c.cloudWriteReached,undefined);
c=run({error:new Error('other failure')});assert.throws(()=>vm.runInContext('persistLocal({})',c),/other failure/);
c=run();vm.runInContext('persistLocal({})',c);assert.equal(c.window.CRMO_LOCAL_CACHE_FULL,false);
assert.throws(()=>{const c={html:'unknown editor'};vm.createContext(c);vm.runInContext(patch,c);},/מבנה/);
console.log('PASS: connected quota continues; offline and other errors remain failures; draft preserved; unknown editor fails closed.');
