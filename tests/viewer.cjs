const vm=require('vm'),fs=require('fs'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
if(!process.argv[2])throw Error('Supply a local exported test fixture; never commit business data');
const fixture=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
class Element{
 constructor(tag='div',doc){this.tagName=tag.toUpperCase();this.doc=doc;this.children=[];this.dataset={};this.style={setProperty(){}};this.attrs={};this.classList={add(){},remove(){},toggle(){},contains(){return false;}};this.hidden=false;this.open=false;this.listeners={};}
 set innerHTML(v){this.html=v;this.children=[];for(const m of v.matchAll(/id="([^"]+)"/g)){const e=new Element('div',this.doc);this.doc.ids[m[1]]=e;}}
 get innerHTML(){return this.html||'';}
 appendChild(n){this.children.push(n);return n;} append(n){return this.appendChild(n)}
 querySelector(s){if(s.startsWith('#'))return this.doc.getElementById(s.slice(1));if(/editor/i.test(s))return null;return new Element('div',this.doc);}
 closest(){return null;} insertAdjacentElement(_,n){this.appendChild(n);} querySelectorAll(){return [];} setAttribute(k,v){this.attrs[k]=v;} getAttribute(k){return this.attrs[k]||null;}
 addEventListener(k,f){this.listeners[k]=f;} replaceChildren(){this.children=[];} remove(){} close(){this.open=false;} showModal(){this.open=true;} matches(){return false;} getBoundingClientRect(){return {width:1200,height:800};}
 get lastElementChild(){return this.children.at(-1);}
}
async function run(url,seed=true){
 const doc={ids:{},createElement(t){return new Element(t,this);},getElementById(id){return this.ids[id]||null;},querySelector(s){if(s==='main.stage')return this.stage;if(s==='nav.nav')return this.nav;return null;},querySelectorAll(){return [];},addEventListener(){}};
 doc.body=new Element('body',doc);doc.head=new Element('head',doc);doc.documentElement=new Element('html',doc);doc.stage=new Element('main',doc);doc.nav=new Element('nav',doc);
 const requests=[];const timers=[];const ctx={document:doc,location:new URL(url),URL,URLSearchParams,console,AbortController,structuredClone,MutationObserver:class{observe(){}},setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){},setInterval(){},requestAnimationFrame:f=>f(),navigator:{},matchMedia:()=>({matches:false}),innerWidth:1440,innerHeight:900,addEventListener(){},history:{replaceState(){}},localStorage:{getItem(){return null;},setItem(){throw Error('Public must not save local drafts');}},fetch:async(u,o)=>{requests.push({u,o});return {ok:true,json:async()=>[{payload:structuredClone(fixture)}]};}};
 ctx.window=ctx;if(seed)ctx.CRMO_RELEASE_SNAPSHOT=structuredClone(fixture);vm.createContext(ctx);
 for(const f of ['config.js','content-layout.js','viewer.js'])vm.runInContext(fs.readFileSync(path.join(root,'public',f),'utf8'),ctx,{filename:f});
 await new Promise(resolve=>setImmediate(resolve));
 const result=JSON.parse(JSON.stringify(ctx.CRMO_VIEW.summary()));
 assert.equal(result.galleryIds.length,17);assert.equal(new Set(result.galleryIds).size,17);
 assert.deepEqual(result.order,['intro','our-brands','intro-more','stores','pos','branding','product-design','exhibitions','packaging','small-business']);
 assert.equal(result.tiles.reduce((a,b)=>a+b,0),106);assert.ok(doc.stage.children.length>0);
 assert.equal(requests.length,1);assert.equal(requests[0].o.method,undefined);assert.ok(requests[0].u.includes('preview_v3285__multi_gallery_demo'));
 const layout=fs.readFileSync(path.join(root,'public/content-layout.js'),'utf8');assert.ok(!/insert into|function destination/.test(layout));
 const js=fs.readFileSync(path.join(root,'public/viewer.js'),'utf8');assert.ok(!/\.upsert\(|\.upload\(|signInWithPassword|service_role|async function save/.test(js));
 assert.ok(!doc.getElementById('crmo3047TileEditor'));assert.ok(!doc.getElementById('adminDashboard'));
 return result;
}
(async()=>{const local=await run('file:///test/crmo/index.html'),online=await run('https://example.test/CRMO-SMART/index.html');assert.deepEqual(local,online);const unseeded=await run('file:///test/crmo/index.html',false);assert.deepEqual(local,unseeded);
console.log('PASS: local/HTTPS display parity, 17 galleries, 106 tile slots, exact order, GET-only public renderer, no editor DOM or write code');

})().catch(e=>{console.error(e);process.exitCode=1;});
