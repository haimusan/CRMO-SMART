const vm=require('vm'),fs=require('fs'),assert=require('node:assert/strict'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../admin/permissions.js'),'utf8');
async function check(serverRole,userRole='owner',signedIn=true,denied=false){
 let bind,authChange;const state=new Set();
 const ctx={setInterval:f=>{bind=f;return 1;},clearInterval(){},setTimeout:f=>f(),CustomEvent:class{},dispatchEvent(){},document:{body:{classList:{toggle(n,on){if(on)state.add(n);else state.delete(n);}}},getElementById(){return null;}}};
 const client={auth:{getUser:async()=>({data:{user:signedIn?{id:'test-user',user_metadata:{role:userRole}}:null}}),onAuthStateChange:f=>authChange=f},from(){return {select(){return this},eq(){return this},maybeSingle:async()=>({data:serverRole?{role:serverRole}:null,error:denied?Error('denied'):null})}}};
 ctx.window=ctx;ctx.CRMOAuthBridge={getSupabaseClient:()=>client};vm.createContext(ctx);vm.runInContext(source,ctx);
 assert.equal(ctx.CRMOPermissions.canEdit(),false);bind();await new Promise(r=>setImmediate(r));
 return {role:ctx.CRMOPermissions.getRole(),edit:ctx.CRMOPermissions.canEdit(),state};
}
(async()=>{
 for(const role of ['owner','admin']){const r=await check(role);assert.equal(r.edit,true);assert.ok(r.state.has('crmo-authorized'));}
 for(const role of ['viewer','social','registered','client',null])assert.equal((await check(role,'owner')).edit,false);
 assert.equal((await check('owner','owner',false)).edit,false);
 assert.equal((await check('owner','owner',true,true)).edit,false);
 console.log('PASS: owner/admin edit; all four other roles and signed-out users cannot; user_metadata escalation ignored; server errors fail closed');
})();
