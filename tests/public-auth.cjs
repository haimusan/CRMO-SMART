const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');
class Node{
 constructor(){this.hidden=false;this.listeners={};this.classList={toggle(){},add(){},remove(){}};this.attrs={};this.nodes={};}
 querySelector(s){return this.nodes[s]||=new Node();}querySelectorAll(){return [];}appendChild(n){this.child=n;}closest(){return null;}focus(){}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,f){this.listeners[k]=f;}
}
(async()=>{
 const nodes={'crmo-user-indicator':new Node(),'login-trigger':new Node()};const body=new Node();const calls=[];const storage={};
 const client={auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}}),signInWithPassword:async args=>{calls.push(['login',args]);return {data:{session:{user:{email:args.email}}}};},signUp:async args=>{calls.push(['register',args]);return {data:{user:{email:args.email},session:null}};},signOut:async()=>({})}};
 const ctx={window:null,location:new URL('file:///preview/index.html'),URL,document:{body,createElement(){return new Node()},getElementById(id){return nodes[id]||null},addEventListener(){}},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},supabase:{createClient:()=>client},setTimeout:f=>f(),console};ctx.window=ctx;ctx.CRMO_CONFIG={url:'https://example.test',anonKey:'publishable'};ctx.CRMOStudioAssets={resolve:x=>x};vm.createContext(ctx);
 for(const file of ['auth-client.js','auth-modal.js'])vm.runInContext(fs.readFileSync(path.join(root,'public',file),'utf8'),ctx,{filename:file});
 await new Promise(r=>setImmediate(r));assert.ok(ctx.CRMOAuthModal);assert.equal(body.child.hidden,true);
 for(const id of Object.keys(nodes)){let prevented=false;nodes[id].listeners.click({preventDefault(){prevented=true}});assert.equal(prevented,true);assert.equal(body.child.hidden,false);assert.equal(ctx.location.href,'file:///preview/index.html');ctx.CRMOAuthModal.close();}
 assert.equal((await ctx.CRMOAuthBridge.loginWithPassword('test@example.com','test-only')).ok,true);assert.equal(ctx.CRMOAuthBridge.isLoggedIn(),true);
 assert.equal((await ctx.CRMOAuthBridge.signUpWithPassword('test@example.com','test-only',true,{firstName:'Test'})).ok,true);assert.equal(calls[1][1].options.data.firstName,'Test');
 assert.equal(ctx.CRMOAuthBridge.saveToCloud,undefined);assert.equal(ctx.CRMOAuthBridge.getSupabaseClient,undefined);
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(index.includes('<div class="app">'));assert.ok(index.includes('family=Rubik'));assert.ok(!index.includes('admin/index.html'));assert.ok(fs.existsSync(path.join(root,'admin/CRMO_v3286.html')));assert.ok(!fs.existsSync(path.join(root,'admin/index.html')));
 const css=fs.readFileSync(path.join(root,'public/viewer.css'),'utf8');assert.ok(css.includes('width: min(85vw, var(--layout-max))'));const admin=fs.readFileSync(path.join(root,'admin/CRMO_v3286.html'),'utf8');assert.ok(admin.includes('<div class="app">'));assert.ok(admin.includes('width: min(85vw, var(--layout-max))'));
 console.log('PASS: both header controls open the existing modal without navigating; account login/register bridge works; no content-editing API; identical app width container; numbered editor file only');
})().catch(e=>{console.error(e);process.exitCode=1;});
