const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'public/studio-fallback.js'),'utf8');
for(const page of ['https://www.crmo.co.il/','https://www.crmo.co.il/admin/']){
 const listeners={};
 const context={URL,location:new URL(page),MutationObserver:class{observe(){}},document:{currentScript:{src:'https://www.crmo.co.il/public/studio-fallback.js?v=3312'},documentElement:{},readyState:'loading',addEventListener(){}}};
 context.window=context;context.addEventListener=(name,fn)=>listeners[name]=fn;
 vm.runInNewContext(source,context);
 const resolve=context.CRMOStudioAssets.resolve;
 for(const input of ['assets/studio/logo/logo.svg','../assets/studio/logo/logo.svg','/assets/studio/logo/logo.svg','admin/assets/studio/logo/logo.svg','studio/logo/logo.svg','branding/logo/logo.svg'])assert.equal(resolve(input),'https://www.crmo.co.il/assets/studio/logo/logo.svg');
 assert.equal(resolve('favicon.svg'),'https://www.crmo.co.il/assets/studio/logo/favicon.svg');
 for(const input of ['https://example.test/custom.png','data:image/png;base64,AA','blob:https://example.test/id','/assets/brands/coca-cola.svg'])assert.equal(resolve(input),input);
 assert.equal(resolve('studio/../private/file'), 'studio/../private/file');
 const img={tagName:'IMG',getAttribute:()=> 'https://example.test/storage/v1/object/public/assets/studio/logo/logo.svg',setAttribute:(attr,value)=>assert.equal(value,'https://www.crmo.co.il/assets/studio/logo/logo.svg')};
 listeners.error({target:img});
}
const loader=fs.readFileSync(path.join(root,'public/admin-loader.js'),'utf8');
assert(loader.indexOf('releaseConfig.after(studioAssetsScript)')<loader.indexOf('document.write('));
assert(loader.includes("querySelectorAll('#galleryTestSections')"));
const legacy=fs.readFileSync(path.join(root,'../crmo-private-fixtures/CRMO_v3286.html'),'utf8');
const context={html:legacy};vm.createContext(context);
vm.runInContext(loader.slice(loader.indexOf('  const persistPattern'),loader.indexOf('  // Release files')),context);
for(const match of context.html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(match[1].trim())new vm.Script(match[1]);
assert(context.html.includes('return window.CRMO_CONFIG.contentRow'));
console.log('PASS: public/admin studio paths, favicon, cloud error fallback, uploaded URLs, private editor patch syntax and authoritative content row.');
