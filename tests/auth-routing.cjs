const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const auth=fs.readFileSync('public/auth-client.js','utf8'),loader=fs.readFileSync('public/admin-loader.js','utf8');
async function scenario(role,options={}){
 const nodes=new Map(),events=[],downloads=[];let redirect='',written='',callback;
 const element=()=>({hidden:false,textContent:'',attributes:{},classList:{toggle(){}},addEventListener(){},setAttribute(k,v){this.attributes[k]=v;},insertAdjacentElement(_,node){nodes.set(node.id,node);}});
 nodes.set('login-trigger',element());nodes.set('admin-status',element());
 const user={id:'test-user',email:'test@example.test',user_metadata:{role:'owner'}};
 let session=role==='anonymous'?null:{user,access_token:'test'};
 const client={auth:{onAuthStateChange(fn){callback=fn;},getSession:async()=>({data:{session}}),getUser:async()=>options.expired?{error:{}}:{data:{user}},signOut:async()=>{session=null;callback('SIGNED_OUT',null);return {}; }},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>options.roleError?{error:{}}:{data:{role}}})})}),storage:{from:()=>({download:async name=>{downloads.push(name);return options.storageError?{error:{}}:{data:new Blob([name==='latest.json'?JSON.stringify({path:options.badManifest?'../bad.js':'releases/CRMO_v3288.html'}):'<!DOCTYPE html><html><body>CRMO_v3288</body></html>'])};}})}};
 const context=vm.createContext({URL,URLSearchParams,Promise,Blob,console,setTimeout,clearTimeout,localStorage:{setItem(){},getItem(){return null;}},location:{href:'https://www.crmo.co.il/',pathname:options.admin?'/admin/':'/',protocol:'https:',search:options.public?'?view=public':'',replace(v){redirect=v;}},document:{getElementById:id=>nodes.get(id),createElement:element,open(){},write(html){written=html;},close(){}},CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}}});
 context.window=context;context.CRMO_ROOT_URL='https://www.crmo.co.il/';context.CRMO_CONFIG={url:'https://example.test',anonKey:'public'};context.supabase={createClient:()=>client};context.dispatchEvent=e=>events.push(e);
 vm.runInContext(auth,context);await context.CRMOAuthBridge.ready;
 if(options.admin)await vm.runInContext(loader,context);
 return {context,nodes,downloads,redirect:()=>redirect,written:()=>written};
}
(async()=>{
 for(const role of ['anonymous','registered','client']){
  const s=await scenario(role);assert.equal(s.redirect(),'');assert(!s.nodes.has('crmo-admin-entry'));assert(!s.context.CRMOAuthBridge.canManage());
  const a=await scenario(role,{admin:true});assert.equal(a.downloads.length,0);assert.equal(a.written(),'');if(role==='anonymous')assert(a.redirect().includes('login=1'));else assert.equal(a.nodes.get('admin-status').attributes.role,'alert');
 }
 for(const role of ['admin','owner']){
  assert.equal((await scenario(role)).redirect(),'https://www.crmo.co.il/admin/');
  const a=await scenario(role,{admin:true});assert.deepEqual(a.downloads,['latest.json','releases/CRMO_v3288.html']);assert(a.written().includes('CRMO_v3288'));
 }
 for(const options of [{expired:true},{roleError:true},{storageError:true},{badManifest:true}]){
  const a=await scenario('owner',{...options,admin:true});assert.equal(a.written(),'');
 }
 const publicAdmin=await scenario('owner',{public:true});assert.equal(publicAdmin.redirect(),'');assert(publicAdmin.nodes.has('crmo-admin-entry'));await publicAdmin.context.CRMOAuthBridge.logout();assert(publicAdmin.nodes.get('crmo-admin-entry').hidden);
 // Run the actual footer renderer and check the generated release label.
 const source=fs.readFileSync('public/viewer.js','utf8');const start=source.indexOf('function renderFooterSection('),end=source.indexOf('\nfunction openPrivacyPanel',start);assert(start>=0&&end>start);
 let footer;const ctx=vm.createContext({window:{CRMO_CONFIG:{release:'3288'}},footerDialog:null,footerEditorDraft:null,footerSection:{visible:true},ensureFooterSection:s=>s,escape:s=>String(s||''),document:{createElement:()=>({querySelector(){return null;}})},galleryStack:{appendChild:node=>footer=node}});
 vm.runInContext(source.slice(start,end)+'\nrenderFooterSection(false);',ctx);assert(footer.innerHTML.includes('id="crmo-footer-version">CRMO_v3288</span>'));
 console.log('PASS: 15 routing/access cases and rendered public footer.');
})().catch(error=>{console.error(error);process.exit(1);});
