const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const [version,editor]=process.argv.slice(2);
if(!/^\d+$/.test(version)||!editor)throw Error('Usage: node scripts/prepare-release.cjs VERSION PRIVATE_EDITOR_PATH');
const bytes=fs.readFileSync(editor),html=bytes.toString('utf8');
const markers=[...html.matchAll(/const VERSION\s*=\s*['"]CRMO_v(\d+)/g)].map(m=>m[1]);
if(markers.length<2||markers.some(v=>v!==version))throw Error('Editor version mismatch');
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
const configPath='public/config.js',config=fs.readFileSync(configPath,'utf8');
fs.writeFileSync(configPath,config.replace(/"release":"\d+"/,'"release":"'+version+'"'));
for(const file of ['index.html','admin/index.html']){
 let s=fs.readFileSync(file,'utf8');
 for(const asset of ['config','admin-loader','auth-client','auth-modal'])s=s.replace(new RegExp('public/'+asset+'\\.js\\?v=[^"<>]+','g'),'public/'+asset+'.js?v='+version);
 fs.writeFileSync(file,s);
}
const manifest={version,path:'releases/CRMO_v'+version+'.html',sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,contentRow:'main__multi_gallery_demo'};
fs.writeFileSync('releases/'+version+'.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest));
