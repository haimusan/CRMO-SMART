const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/auth-client.js','utf8');
async function scenario(role,search='',pathname='/',options={}){
 const nodes=new Map(),scripts=[],events=[];let callback,redirect='';
 const element=()=>({hidden:false,classList:{toggle(){}},addEventListener(){},remove(){},insertAdjacentElement(_,n){nodes.set(n.id,n)}});
 nodes.set('login-trigger',element());
 const user={id:'u1',email:'owner@example.test',user_metadata:{role:'owner'}};
 let session=role==='anonymous'?null:{user};
 const client={auth:{getSession:async()=>({data:{session}}),getUser:async()=>options.expired?{error:{}}:{data:{user}},onAuthStateChange(fn){callback=fn},signOut:async()=>{session=null;callback('SIGNED_OUT',null);return {}}},
  from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>options.roleError?{error:{}}:{data:{role}}})})})};
 const c={URL,URLSearchParams,Promise,console,setTimeout,clearTimeout,localStorage:{getItem(){},setItem(){}},
  location:{pathname,protocol:'https:',search,replace(v){redirect=v}},
  document:{getElementById:id=>nodes.get(id),createElement:element,body:{append:n=>scripts.push(n)}},
  CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail}}};
 c.window=c;c.CRMO_ROOT_URL='https://www.crmo.co.il/';c.CRMO_CONFIG={url:'https://db.test',anonKey:'public',release:'3330'};c.supabase={createClient:()=>client};c.dispatchEvent=e=>events.push(e);
 vm.runInNewContext(source,c);await c.CRMOAuthBridge.ready;await new Promise(r=>setImmediate(r));
 return {c,scripts,events,nodes,redirect:()=>redirect,refresh:()=>callback('TOKEN_REFRESHED',session)};
}
(async()=>{
 for(const role of ['admin','owner'])for(const search of ['','?view=public','?view=public&gallery=intro']){
  const s=await scenario(role,search);assert(s.c.CRMOAuthBridge.canManage());
  assert.equal(s.redirect(),'','entry URL is preserved');
  assert.equal(s.scripts.length,1);assert.equal(s.scripts[0].src,'https://www.crmo.co.il/public/admin-loader.js?v=3330');
  s.refresh();await new Promise(r=>setTimeout(r,10));assert.equal(s.scripts.length,1,'token refresh does not reload the editor');
 }
 for(const role of ['anonymous','registered','social','client','viewer']){
  const s=await scenario(role,'?view=public');assert.equal(s.scripts.length,0,'non-editor never loads private editor');assert(!s.c.CRMOAuthBridge.canManage());
 }
 for(const options of [{roleError:true},{expired:true}]){
  const s=await scenario('owner','?view=public','/',options);assert.equal(s.scripts.length,0,'failed verification cannot load editor');
 }
 const admin=await scenario('owner','','/admin/');assert.equal(admin.scripts.length,0,'dedicated admin entry owns its loader');
 const owner=await scenario('owner','?view=public');await owner.c.CRMOAuthBridge.logout();assert(!owner.c.CRMOAuthBridge.canManage());assert(owner.nodes.get('crmo-admin-entry').hidden);
 console.log('PASS: role-based editor loading from root/public query, non-editor denial, failed verification, token refresh, admin entry and logout.');
})().catch(e=>{console.error(e);process.exit(1)});
