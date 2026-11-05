const fs=require('node:fs');
let config=fs.readFileSync('public/config.js','utf8');
config=config.replace(/,"displayRevision":"[^"]+"/,'');
config=config.replace(/"release":"(\d+)"/,'"release":"$1","displayRevision":"$1-display-parity"');
fs.writeFileSync('public/config.js',config);
const viewer=fs.readFileSync('public/viewer.js','utf8').replace(/\r\n/g,'\n');
const curation=viewer.slice(viewer.indexOf('/* CRMO homepage curation:'),viewer.indexOf('\nfunction renderSingleGallerySection('));
const limit=viewer.slice(viewer.indexOf('function getExpandedTileLimitFor('),viewer.indexOf('\nfunction getExpandedTileCountForManagerId('));
if(!curation.includes('function crmoRenderCuratedGrid(')||!limit.includes('return compactLimit;'))throw Error('Display contract markers changed');
fs.writeFileSync('public/display-contract.js','/* Generated from the public viewer. Regenerate and test when display rules change. */\nwindow.CRMO_DISPLAY_SOURCE=Object.freeze('+JSON.stringify({curation,limit})+');\n');
for(const file of ['index.html','admin/index.html']){
 let html=fs.readFileSync(file,'utf8').replace(/<script src="(?:\.\.\/)?public\/display-contract\.js\?v=\d+"><\/script>/g,'');
 const version=fs.readFileSync('public/config.js','utf8').match(/"release":"(\d+)"/)[1];
 const prefix=file.startsWith('admin/')?'../':'';
 html=html.replace(/(<script src="(?:\.\.\/)?public\/config\.js\?v=\d+"><\/script>)/,'$1<script src="'+prefix+'public/display-contract.js?v='+version+'"></script>');
 html=html.replace(/public\/(config|auth-client|admin-loader)\.js\?v=[^"<>]+/g,'public/$1.js?v='+version+'-display-parity');
 fs.writeFileSync(file,html);
}
