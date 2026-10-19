const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 let file=path.join(root,decodeURIComponent(new URL(req.url,'http://local').pathname));
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
 const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css'})[ext]||'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 async function pageFor(role,opts={}){
  const context=await browser.newContext();
  await context.addInitScript(({role,opts})=>{
   const user={id:'test-user',email:'test@example.test',user_metadata:{role:opts.spoof?'owner':undefined}};
   let session=role==='anonymous'?null:{user,access_token:'test-token'};
   const callbacks=[];window.downloads=[];
   window.supabase={createClient:()=>({
    auth:{getSession:async()=>({data:{session}}),getUser:async()=>opts.expired?{error:{message:'expired'}}:{data:{user}},onAuthStateChange:fn=>{callbacks.push(fn);return {data:{subscription:{unsubscribe(){}}}};},signOut:async()=>{session=null;callbacks.forEach(fn=>fn('SIGNED_OUT',null));return {error:null};}},
    from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>opts.roleError?{error:{message:'denied'}}:{data:{role}}})})}),
    storage:{from:bucket=>({download:async name=>{window.downloads.push(name);if(opts.storageError)return {error:{message:'denied'}};return {data:new Blob([name==='latest.json'?JSON.stringify({path:opts.badManifest?'../../public/config.js':'releases/CRMO_v3288.html'}):'<!DOCTYPE html><html><body><h1 id="private-editor">CRMO_v3288</h1></body></html>'])};}})}
   })};
  },{role,opts});
  await context.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await context.route('https://fonts.**',r=>r.abort());
  await context.route('https://swkxhqrovsdfpqbskcyp.supabase.co/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify([{payload:{schema:'crmo-structured-content-v1',galleries:[],site:{},footerSection:{visible:true}}}])}));
  return {context,page:await context.newPage()};
 }
 for(const role of ['anonymous','registered','client']){
  const {context,page}=await pageFor(role,{spoof:true});await page.goto(url+'/?view=public');
  await page.waitForFunction(()=>window.CRMOAuthBridge);await page.evaluate(()=>window.CRMOAuthBridge.ready);
  assert.equal(await page.locator('#crmo-admin-entry').count(),0,role+' has no admin link');
  assert.equal(await page.locator('#crmo-footer-version').textContent(),'CRMO_v3288');
  await page.goto(url+'/admin/');
  if(role==='anonymous')await page.waitForURL('**/index.html?login=1');
  else{await page.locator('#admin-status[role="alert"]').waitFor();assert.equal((await page.evaluate(()=>downloads)).length,0);}
  await context.close();
 }
 for(const role of ['admin','owner']){
  const {context,page}=await pageFor(role);await page.goto(url+'/');
  await page.waitForURL('**/admin/');await page.locator('#private-editor').waitFor();
  assert.equal(await page.locator('#private-editor').textContent(),'CRMO_v3288');
  assert.deepEqual(await page.evaluate(()=>downloads),['latest.json','releases/CRMO_v3288.html']);await context.close();
 }
 for(const opts of [{expired:true},{roleError:true},{storageError:true},{badManifest:true}]){
  const {context,page}=await pageFor('owner',opts);await page.goto(url+'/admin/');
  if(opts.expired)await page.waitForURL('**/index.html?login=1');else await page.locator('#admin-status[role="alert"]').waitFor();
  assert.equal(await page.locator('#private-editor').count(),0);await context.close();
 }
 const {context,page}=await pageFor('owner');await page.goto(url+'/?view=public');
 await page.locator('#crmo-admin-entry').waitFor();await page.evaluate(()=>window.CRMOAuthBridge.logout());
 assert.equal(await page.locator('#crmo-admin-entry').isVisible(),false);await context.close();
 await browser.close();server.close();console.log('PASS: public footer, anonymous/client/registered access, admin/owner routing, forged metadata, expired session, role failure, storage failure, invalid manifest, logout.');
})().catch(e=>{console.error(e);server.close();process.exit(1);});
