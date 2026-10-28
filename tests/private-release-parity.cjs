const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const file=process.argv[2]||'../crmo-private-fixtures/CRMO_v3335.html';
const original=fs.readFileSync(file,'utf8'),html=original.replace(/\r\n/g,'\n');
const loader=fs.readFileSync('public/admin-loader.js','utf8');
const start=loader.indexOf('  const persistPattern'),end=loader.indexOf('  // Release files');
const c={html,URLSearchParams,window:{location:{search:''}}};vm.createContext(c);vm.runInContext(loader.slice(start,end),c);
let scripts=0;for(const m of c.html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(m[1].trim()){new vm.Script(m[1]);scripts++;}
assert(scripts>5);assert(c.html.includes('window.CRMOContentSync.updateIfCurrent'));assert(c.html.includes('cloudContentSync?.publish(committedRevision)'));
assert(c.html.includes('contentFingerprint() === cloudContentBaseline'));assert(c.html.includes('renderGallery:(g,i)=>renderSingleGallerySection'));
assert(c.html.includes('const shared=window.CRMO_ROUTES?.shareURL(id)'));
assert.equal((c.html.match(/let cloudContentRevision = '';/g)||[]).length,1);
const versions=[...original.matchAll(/const VERSION\s*=\s*['"]([^'"]+)/g)].map(m=>m[1]);assert(versions.length>=2);assert(versions.every(v=>v==='CRMO_v3335'));
console.log(JSON.stringify({file,scripts,embeddedVersions:versions,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),status:'PASS'}));
