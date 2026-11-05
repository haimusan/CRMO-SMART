const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const c={window:{}};vm.runInNewContext(fs.readFileSync('public/display-contract.js','utf8'),c);
const viewer=fs.readFileSync('public/viewer.js','utf8').replace(/\r\n/g,'\n');
test('private and public use the exact same curation and limits',()=>{
 assert(viewer.includes(c.window.CRMO_DISPLAY_SOURCE.curation));
 assert(viewer.includes(c.window.CRMO_DISPLAY_SOURCE.limit));
 const loader=fs.readFileSync('public/admin-loader.js','utf8');
 assert(loader.includes('display.curation'));assert(loader.includes('display.limit'));
});
test('every public entry and admin load the shared display contract',()=>{
 for(const file of ['index.html','admin/index.html','exhibitions/index.html','pos/chosen/index.html'])assert.match(fs.readFileSync(file,'utf8'),/public\/display-contract\.js\?v=3348/);
});
