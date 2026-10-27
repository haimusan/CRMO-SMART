const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const legacy=fs.readFileSync(path.join(root,'../crmo-private-fixtures/CRMO_v3286.html'),'utf8');
const brand={tileId:'brands-live-logo',meta:{brand:'Coca-Cola',client:''},overlay:{title:'Coca-Cola',desc:'',link:''},isVisible:true,media:[{id:'live-logo',src:'/assets/brands/coca-cola.svg',type:'image/svg+xml',isVisible:true}],display:{},brandConfig:{enableLightbox:true,attachedWorkRefs:[]}};
const payload={schema:'crmo-structured-content-v1',site:{},galleries:[{galleryId:'our-brands',meta:{slug:'our-brands',label:'our-brands',visible:true},tiles:Array.from({length:18},(_,i)=>({...brand,tileId:'brand-'+i,meta:{...brand.meta,brand:i===0?'Coca-Cola':'Brand '+i},media:[{...brand.media[0],id:'logo-'+i}]}))}]};
if(process.env.CRMO_LIVE_BRANDS_FIXTURE)payload.galleries=[JSON.parse(fs.readFileSync(process.env.CRMO_LIVE_BRANDS_FIXTURE,'utf8'))];
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://local').pathname;
 const file=path.join(root,pathname.endsWith('/')?pathname+'index.html':pathname);
 if(/\/assets\//.test(pathname)&&!fs.existsSync(file)){res.setHeader('Content-Type','image/svg+xml');return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="red"/></svg>');}
 if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
 const context=await browser.newContext();
 await context.addInitScript(({legacy,payload})=>{
  window.testQueries=[];
  const user={id:'fixture-owner',email:'fixture@example.test'};
  const session={user,access_token:'fixture-token'};
  const client={
   auth:{getSession:async()=>({data:{session}}),getUser:async()=>({data:{user}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
   storage:{from:()=>({download:async()=>({data:new Blob([legacy])})})},
   from(table){const q={select(){return q},eq(col,key){q.key=key;return q},async maybeSingle(){window.testQueries.push({table,key:q.key});return {data:table==='crmo_user_roles'?{role:'owner'}:{key:q.key,payload,updated_at:'2026-10-25T20:00:00Z'}}},async single(){return q.maybeSingle()}};return q}
  };
  window.supabase={createClient:()=>client};
 },{legacy,payload});
 await context.route('https://www.crmo.co.il/assets/**',r=>{const file=path.join(root,new URL(r.request().url()).pathname);return r.fulfill({path:file});});
 await context.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'application/javascript',body:''}));
 await context.route('https://fonts.**',r=>r.abort());
 await context.route('https://swkxhqrovsdfpqbskcyp.supabase.co/**',r=>r.fulfill({contentType:'application/json',body:r.request().url().includes('latest.json')?JSON.stringify({path:'releases/CRMO_v3288.html'}):JSON.stringify([{payload,updated_at:'2026-10-25T20:00:00Z'}])}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'/admin/');
 await page.locator('#crmo3047GalleryStack').waitFor();
 await page.waitForFunction(()=>document.querySelector('#crmo3047GalleryStack')?.textContent.includes('Coca-Cola'));
 assert.equal(await page.locator('#galleryTestSections').count(),0,'obsolete B1/B2 scaffold removed');
 assert.equal(await page.title(),'CRMO | sales oriented design');
 assert((await page.evaluate(()=>testQueries)).some(q=>q.table==='crmo_site_config'&&q.key==='main__multi_gallery_demo'),'editor reaches the authoritative cloud row');
 assert(!errors.some(e=>/CRMOStudioAssets|resolve|base/.test(e)),JSON.stringify(errors));
 const results=await page.evaluate(()=>({
  relative:CRMOStudioAssets.resolve('assets/studio/logo/logo.svg'),
  parent:CRMOStudioAssets.resolve('../assets/studio/logo/logo.svg'),
  short:CRMOStudioAssets.resolve('studio/logo/favicon.svg'),
  uploaded:CRMOStudioAssets.resolve('https://example.test/storage/v1/object/public/assets/studio/custom.png'),
  header:document.querySelector('header img')?.getAttribute('src'),
  release:document.querySelector('#adminVersionPill')?.textContent,
  scripts:[...document.querySelectorAll('script[src]')].map(s=>s.src)
 }));
 assert.equal(results.relative,url+'/assets/studio/logo/logo.svg');
 assert.equal(results.parent,results.relative);
 assert.equal(results.short,url+'/assets/studio/logo/favicon.svg');
 assert.equal(results.uploaded,'https://example.test/storage/v1/object/public/assets/studio/custom.png');
 assert.equal(results.header,results.relative);
 const release=await page.evaluate(()=>CRMO_CONFIG.release);
 assert.equal(results.release,'CRMO_v'+release);
 await page.evaluate(()=>{document.title='stale';document.querySelectorAll('#adminVersionPill,#footerVersionLabel,#crmo-footer-version,.crmo3047-footer-version').forEach(el=>el.textContent='old');});
 await page.waitForFunction(()=>document.title===CRMO_CONFIG.siteTitle && [...document.querySelectorAll('#adminVersionPill,#footerVersionLabel,#crmo-footer-version,.crmo3047-footer-version')].every(el=>el.textContent==='CRMO_v'+CRMO_CONFIG.release));
 assert(results.scripts.some(s=>s===url+'/public/studio-fallback.js?v='+release));
 assert(!results.scripts.some(s=>s.includes('/admin/assets/')));
 for(const [width,columns] of [[1696,9],[800,4],[390,3]]){
  await page.setViewportSize({width,height:1000});
  const wall=page.locator('#our-brands [data-gallery-grid]');
  assert.equal(await wall.locator('.crmo3045-tile').count(),18);
  const metrics=await wall.evaluate(el=>({columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,fit:getComputedStyle(el.querySelector('img')).objectFit,scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.equal(metrics.columns,columns);assert.equal(metrics.fit,'contain');assert(metrics.scroll<=metrics.viewport+1,JSON.stringify(metrics));
 }
 await page.setViewportSize({width:1696,height:1100});
 if(process.env.CRMO_SCREENSHOT_PATH)await page.locator('#our-brands').screenshot({path:process.env.CRMO_SCREENSHOT_PATH});
 await page.locator('#our-brands .crmo3045-pencil').first().click();
 await page.locator('#crmo3047TileEditor[open]').waitFor();
 assert.equal(await page.locator('#crmo3047EditorStage img').evaluate(el=>getComputedStyle(el).objectFit),'contain');
 await page.evaluate(()=>document.querySelector('#crmo3047TileEditor').close());
 const publicPage=await context.newPage();
 await publicPage.goto(url+'/?view=public');
 await publicPage.locator('#our-brands.is-brand-wall-ready').waitFor();
 for(const [width,columns] of [[1696,9],[800,4],[390,3]]){
  await publicPage.setViewportSize({width,height:1000});
  const wall=publicPage.locator('#our-brands [data-gallery-grid]');
  assert.equal(await wall.locator('.crmo3045-tile').count(),18);
  assert.equal(await wall.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),columns);
  assert.equal(await wall.locator('img').first().evaluate(el=>getComputedStyle(el).objectFit),'contain');
 }
 console.log('PASS: public/admin 18-logo walls at desktop/tablet/mobile widths, contained logos including brand editor, cloud boot, studio assets and release guards.');
 if(errors.length)console.log('Other fixture errors:',errors);
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1)});
