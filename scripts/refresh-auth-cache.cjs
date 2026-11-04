const fs=require('node:fs');
for(const file of ['index.html','admin/index.html']){
 const html=fs.readFileSync(file,'utf8').replace(/public\/auth-client\.js\?v=[^"<>]+/g,'public/auth-client.js?v=3347').replace(/public\/auth-modal\.js\?v=[^"<>]+/g,'public/auth-modal.js?v=3347');
 fs.writeFileSync(file,html);
}
