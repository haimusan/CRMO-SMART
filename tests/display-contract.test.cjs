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
 const configuredRelease = /"release":"(\d+)"/.exec(fs.readFileSync('public/config.js','utf8'))?.[1];
 assert(configuredRelease, 'A numeric central release is required');
 const displayContractAsset = new RegExp('public/display-contract\\.js\\?v=' + configuredRelease);
 for(const file of ['index.html','exhibitions/index.html','pos/chosen/index.html'])assert.match(fs.readFileSync(file,'utf8'),displayContractAsset);
 const admin=fs.readFileSync('admin/index.html','utf8');
 assert.match(admin,/location\.replace/);
 assert.doesNotMatch(admin,/public\/admin-loader\.js/);
});
