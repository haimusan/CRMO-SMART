const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/gallery-routes.js','utf8');
function setup(address){
 const url=new URL(address),calls=[],nodes=[];
 const location={href:url.href,pathname:url.pathname,origin:url.origin};
 const c={window:{},location,URL,history:{replaceState(_,__,value){const u=new URL(value);Object.assign(location,{href:u.href,pathname:u.pathname})}},document:{querySelectorAll:()=>[],createElement:tag=>({tag,setAttribute(){}})}};
 vm.runInNewContext(source,c);const routes=c.window.CRMO_ROUTES;
 const adapter={stack:{appendChild:n=>nodes.push(n)},galleries:routes.entries.filter(([p,id])=>!['pos','about','contact'].includes(id)).map(([p,id])=>({galleryId:id,meta:{visible:true,parentId:id.startsWith('pos-sub-')?'pos':''}})),editable:false,visible:()=>true,
  renderGallery:(g,i)=>calls.push(g.galleryId),renderAll:()=>calls.push('pos-all'),renderAbout:()=>calls.push('about'),renderContact:()=>calls.push('contact'),renderFooter:()=>calls.push('footer'),renderLegal:()=>calls.push('legal')};
 return {routes,location,calls,nodes,adapter};
}
test('every current standalone gallery renders only its own content and the full shell',()=>{
 const initial=setup('https://www.crmo.co.il/');for(const [path,id] of initial.routes.entries){
  const s=setup('https://www.crmo.co.il/'+path+'/');assert.equal(s.routes.render(s.adapter),true);
  const expected=id==='pos'?['pos-all','about','contact','footer','legal']:['about','contact'].includes(id)?['about','contact','footer','legal']:[id,'about','contact','footer','legal'];
  assert.deepEqual(s.calls,expected);assert(s.nodes.some(n=>n.href==='/'));
  assert(fs.existsSync(path+'/index.html'),'cold-link entry page exists for '+path);
 }
});
test('disabled gallery remains unavailable directly; editor can still manage it',()=>{
 const s=setup('https://www.crmo.co.il/pos/floor-stands/');s.adapter.galleries.find(g=>g.galleryId==='pos-sub-3').meta.visible=false;
 s.routes.render(s.adapter);assert(!s.calls.includes('pos-sub-3'));assert(s.nodes.some(n=>n.textContent?.includes('אינה זמינה')));
 s.calls.length=0;s.adapter.editable=true;s.routes.render(s.adapter);assert(s.calls.includes('pos-sub-3'));
});
test('disabled POS ALL is not made public by its direct address',()=>{
 const s=setup('https://www.crmo.co.il/pos-all/');s.adapter.visible=()=>false;s.routes.render(s.adapter);assert(!s.calls.includes('pos-all'));
});
test('legacy hashes and display parameters normalize to readable addresses',()=>{
 for(const [old,wanted] of [['?view=public#about','#about'],['?view=public#retail-pos','#retail-pos'],['pos','pos-all/'],['pos/all-works','pos/chosen/'],['?view=expanded&gallery=branding','branding/']]){
  assert.equal(setup('https://www.crmo.co.il/'+old).location.href,'https://www.crmo.co.il/'+wanted);
 }
 assert.equal(setup('https://www.crmo.co.il/?login=1&view=public').location.href,'https://www.crmo.co.il/?login=1');
});
test('header remains internal everywhere; share links are separate standalone addresses',()=>{
 for(const path of ['/','/exhibitions/','/pos/floor-stands/']){
  const s=setup('https://www.crmo.co.il'+path),links=['#exhibitions','#about','#stores'].map(value=>({href:value,getAttribute(){return value}}));
  s.adapter.galleries=[];
  // Exercise the real decorator against DOM-backed link stubs.
  const c={window:{},URL,location:{href:'https://www.crmo.co.il'+path,pathname:path,origin:'https://www.crmo.co.il'},history:{replaceState(){}},document:{querySelectorAll:()=>links}};
  vm.runInNewContext(source,c);c.window.CRMO_ROUTES.decorate();
  assert.deepEqual(links.map(l=>l.href),['/#exhibitions','/#about','/#stores']);
  assert.equal(c.window.CRMO_ROUTES.shareURL('exhibitions'),'https://www.crmo.co.il/exhibitions/');
  assert.equal(c.window.CRMO_ROUTES.shareURL('pos-sub-1'),'https://www.crmo.co.il/pos/chosen/');
  assert.equal(c.window.CRMO_ROUTES.shareURL('gallery-18'),'https://www.crmo.co.il/pos-mix/');
 }
});
