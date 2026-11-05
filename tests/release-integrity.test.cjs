const {test}=require('node:test');
const assert=require('node:assert/strict');
const {webcrypto,createHash}=require('node:crypto');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/admin-loader.js','utf8');
const validation=source.slice(source.indexOf('  const artifactVersion ='),source.indexOf('  if(!html.trimStart()'));
const bytes=Buffer.from("<!DOCTYPE html><script>const VERSION = 'CRMO_v3347';</script><script>const VERSION = 'CRMO_v3347';</script>");
const manifest={path:'releases/CRMO_v3347.html',version:'3347',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
async function check(patch={},data=bytes){
 const context={release:{...manifest,...patch},window:{CRMO_CONFIG:{release:'3347'}},client:{storage:{from:()=>({download:async()=>({data:new Blob([data])})})}},crypto:webcrypto,TextDecoder,Uint8Array};
 return vm.runInNewContext('(async()=>{'+validation+'return html;})()',context);
}
test('accepts the exact matching editor bytes',async()=>assert.match(await check(),/CRMO_v3347/));
test('rejects a manifest pointing at an old editor',async()=>assert.rejects(check({path:'releases/CRMO_v3342.html'})));
test('rejects an inconsistent manifest version',async()=>assert.rejects(check({version:'3342'})));
test('rejects missing integrity metadata',async()=>assert.rejects(check({sha256:undefined})));
test('rejects changed artifact bytes',async()=>assert.rejects(check({},Buffer.concat([bytes,Buffer.from('x')]))));
test('rejects an old editor renamed as the new release',async()=>{
 const data=Buffer.from(bytes.toString().replaceAll('3347','3342'));
 await assert.rejects(check({bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')},data));
});
