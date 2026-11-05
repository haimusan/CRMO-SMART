const fs=require('node:fs');
const version=fs.readFileSync('public/config.js','utf8').match(/"release":"(\d+)"/)[1];
for(const file of ['index.html','admin/index.html']){
 const html=fs.readFileSync(file,'utf8').replace(/public\/auth-client\.js\?v=[^"<>]+/g,'public/auth-client.js?v='+version).replace(/public\/auth-modal\.js\?v=[^"<>]+/g,'public/auth-modal.js?v='+version);
 fs.writeFileSync(file,html);
}
