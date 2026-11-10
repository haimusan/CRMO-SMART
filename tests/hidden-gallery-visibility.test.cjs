const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const viewer=fs.readFileSync('public/viewer.js','utf8');
const start=viewer.indexOf('function isManagerItemVisible(id) {');
const end=viewer.indexOf('\nfunction findGalleryByManagerId(',start);
assert(start>=0&&end>start,'Expected visibility function in public viewer');
const visibility=viewer.slice(start,end);

function evaluateVisibility({editor=false,meta={},manager={},mode='desktop'}={}){
  const context={
    canEdit:()=>editor,
    findGalleryByManagerId:()=>({meta}),
    getManagerItem:()=>manager,
    getCurrentViewMode:()=>mode,
  };
  vm.createContext(context);
  vm.runInContext(visibility,context);
  return context.isManagerItemVisible('gallery-test');
}

test('hidden gallery remains visible to a verified editor',()=>{
  assert.equal(evaluateVisibility({editor:true,meta:{visible:false},manager:{visible:false}}),true);
  assert.equal(evaluateVisibility({editor:true,meta:{unpublished:true},manager:{visibleMobile:false},mode:'mobile'}),true);
});

test('public cannot see galleries disabled by any publication flag',()=>{
  assert.equal(evaluateVisibility({meta:{visible:false}}),false);
  assert.equal(evaluateVisibility({meta:{published:false}}),false);
  assert.equal(evaluateVisibility({meta:{unpublished:true}}),false);
  assert.equal(evaluateVisibility({manager:{visible:false}}),false);
  assert.equal(evaluateVisibility({manager:{visibleMobile:false},mode:'mobile'}),false);
  assert.equal(evaluateVisibility({manager:{visibleDesktop:false},mode:'desktop'}),false);
  assert.equal(evaluateVisibility({meta:{visible:true},manager:{visible:true}}),true);
});

test('private editor adds a gray draft marker without changing public CSS',()=>{
  const loader=fs.readFileSync('public/admin-loader.js','utf8');
  assert.match(loader,/html = html\.replace\(hiddenGalleryVisibility/);
  assert.match(loader,/section\.classList\.toggle\('crmo-dev-unpublished',hidden\)/);
  assert.match(loader,/\.crmo3047-gallery\.crmo-dev-unpublished/);
  assert.match(loader,/לא מפורסמת/);
  assert.doesNotMatch(fs.readFileSync('public/viewer.css','utf8'),/crmo-dev-unpublished/);
});
