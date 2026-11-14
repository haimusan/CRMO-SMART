const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context={window:{},location:{pathname:'/',href:'https://www.crmo.co.il/',origin:'https://www.crmo.co.il'},history:{replaceState(){}},URL};
vm.runInNewContext(fs.readFileSync(path.join(root,'public/gallery-routes.js'),'utf8'),context);
const template=fs.readFileSync(path.join(root,'index.html'),'utf8')
 .replace(/<template id="crmo-editorial-template">[\s\S]*?<\/template><div id="crmo-editorial-home"><\/div>/,'')
 .replace(/<link rel="stylesheet" href="\/public\/editorial\.css[^"]*">/,'')
 .replace(/<script src="\/public\/editorial\.js[^"]*"><\/script>/,'');
for(const [slug] of [...context.window.CRMO_ROUTES.entries,...Object.entries(context.window.CRMO_ROUTES.aliases)]){
 const dir=path.join(root,slug);fs.mkdirSync(dir,{recursive:true});
 const canonical=context.window.CRMO_ROUTES.aliases[slug]||slug;
 fs.writeFileSync(path.join(dir,'index.html'),template.replace('<head>','<head><link rel="canonical" href="https://www.crmo.co.il/'+canonical+'/">'));
}
console.log('Generated '+context.window.CRMO_ROUTES.entries.length+' standalone route pages.');
