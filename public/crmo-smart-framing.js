/* CRMO reviewed full-frame presentation. Original assets remain unchanged. */
(()=>{
'use strict';
const SELECTOR='.crmo3045-tile-media, .crmo3045-lb-media, .tile-media, .lightbox-media';
const REVIEWED={"/storage/v1/object/public/galleries/stores/gallery-4-tile-02/1792530675317-fad16d3673a1d8/2026-10-20T21-11-33-140Z_ae09c2a0-a171-498b-b783-94f790dd52d9_03-joystick-store-photo.webp": {"crop": [0.123, 0.1, 0.877, 0.854]}, "/storage/v1/object/public/galleries/stores/gallery-4-tile-03/1792534294988-9ba762e5ace9a8/2026-10-20T22-11-54-045Z_78f07c6c-e3d6-4209-a035-60759a203e52_01-arlin-built.webp": {"crop": [0.159, 0.218, 0.84, 0.899]}, "/storage/v1/object/public/galleries/stores/gallery-4-tile-03/1792534294990-071746ee01df/2026-10-20T22-11-54-795Z_b42f7318-fed5-4d2f-a497-a07fc189cd95_02-arlin-blue-option.webp": {"crop": [0.045, 0.045, 0.955, 0.955]}, "/storage/v1/object/public/galleries/pos/custom-solutions/pos-sub-8-tile-01/1792532469160-7f24ef1b461e5/2026-10-20T21-41-31-581Z_7be4adff-9b19-428f-b018-c9e03389ed53_01-gad-modular.webp": {"crop": [0.048, 0.048, 0.952, 0.952]}, "/storage/v1/object/public/galleries/pos/custom-solutions/pos-sub-8-tile-01/1792532469161-606685781c7838/2026-10-20T21-41-32-586Z_ac09eaf9-b038-4032-9471-a8cda89aa89c_02-gad-counter.webp": {"crop": [0.048, 0.048, 0.952, 0.952]}, "/storage/v1/object/public/galleries/stores/gallery-4-tile-04/1792640655649-d42cf6a52e1b58/2026-10-22T03-45-39-456Z_ae365b97-35da-4d79-bb3d-48169d2468fe_nuts-04-storefront.jpg": {"crop": [0.14, 0.14, 0.86, 0.86]}, "/storage/v1/object/public/galleries/stores/gallery-4-tile-04/1792640655644-d1fd4c4d3d1ba8/2026-10-22T03-45-37-394Z_9622a353-35fc-4f20-a2cc-4d28fe795004_nuts-01-store-interior.jpg": {"crop": [0.14, 0.019, 0.86, 0.739]}, "/storage/v1/object/public/galleries/stores/gallery-4-tile-04/1792640655646-7b42ac58d7ac88/2026-10-22T03-45-38-526Z_e9b7ffeb-4595-4f56-9a1c-6a3427987ece_nuts-02-roasting-display.jpg": {"crop": [0.14, 0.019, 0.86, 0.739]}, "/storage/v1/object/public/galleries/stores/gallery-4-tile-04/1792640655647-d42380e6de3e48/2026-10-22T03-45-38-983Z_9bf81816-fe6e-4c1b-9f8f-2ea7fbccfc0f_nuts-03-chocolate-workshop.jpg": {"crop": [0.14, 0.019, 0.86, 0.739]}, "/storage/v1/object/public/galleries/exhibitions/tile/1792344119914-rnuym8/2026-10-18T17-22-51-242Z_188408a2-b016-4073-9bee-597251c5ea3a_01.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/tile/1792344170702-8bd7457fd992f/2026-10-18T17-22-51-843Z_53309a13-7880-46f0-9dae-a05724a20a3e_02.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/tile/1792344170705-68cdf6cdcfab08/2026-10-18T17-22-53-362Z_8c54ca18-110e-48f8-b3ae-1c26ee83ec72_05.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/gallery-7-tile-01/1792340623330-e7613500f9767/2026-10-18T16-23-51-515Z_dac6ae54-b16a-4d3e-b685-57f406144378_01.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/gallery-7-tile-01/1792340623331-bf27ade48ae12/2026-10-18T16-23-52-033Z_9557ebde-16ce-4ece-9560-73a365531e96_02.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/gallery-7-tile-01/1792340623332-583b895e14b2e8/2026-10-18T16-23-52-818Z_34e151f5-0681-4117-a2ea-73d8e5e3f555_03.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/gallery-7-tile-05/1792343827683-374a39c0978f98/2026-10-18T17-17-08-204Z_67c8b3e0-d99f-4e03-ac1a-62f4c84fb521_01.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/gallery-7-tile-05/1792343827684-8f1514246dcbe/2026-10-18T17-17-08-593Z_bb213037-f2b8-4801-a3b5-b21f5f3769ea_02.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/gallery-7-tile-05/1792343827685-798d453c556dc8/2026-10-18T17-17-08-961Z_40d1557b-f51c-4aa8-967b-6a3fd1e0ba3f_03.webp": {"position": "50% 10%"}, "/storage/v1/object/public/galleries/exhibitions/gallery-7-tile-05/1792343827686-f89f12b5a7e9a/2026-10-18T17-17-09-317Z_04ad8b90-8b02-4ee2-bb39-2148550d1b57_04.webp": {"position": "50% 10%"}};
const seen=new WeakMap(),cache=new Map(),pending=new Set();let active=0;
function key(src){try{return new URL(src,location.href).pathname;}catch{return src;}}
function apply(el,a){
 if(!el.isConnected)return;
 el.style.setProperty('object-fit','cover','important');
 el.style.setProperty('object-position',a?.position||'50% 50%','important');
 el.style.removeProperty('transform');el.style.removeProperty('transform-origin');
 delete el.dataset.crmoAutoFrame;
 if(a?.crop){
  const [l,t,r,b]=a.crop,w=r-l,h=b-t;
  if(Math.abs(w-h)>.005)return;
  const s=1/w;
  el.style.setProperty('transform-origin','0 0','important');
  el.style.setProperty('transform',`translate(${(-l*s*100).toFixed(3)}%,${(-t*s*100).toFixed(3)}%) scale(${s.toFixed(6)})`,'important');
  el.dataset.crmoAutoFrame='reviewed';
 }else if(a?.position)el.dataset.crmoAutoFrame='reviewed-focus';
}
function analyze(im){
 if(Math.abs(im.naturalWidth/im.naturalHeight-16/9)>.035)return null;
 const w=320,h=180,c=document.createElement('canvas');c.width=w;c.height=h;
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,w,h);
 const p=ctx.getImageData(0,0,w,h).data;
 function blank(i){return p[i+3]<20||(p[i]>=249&&p[i+1]>=249&&p[i+2]>=249);}
 function edge(axis,end){
  const len=axis==='x'?w:h,other=axis==='x'?h:w;let n=0;
  for(;n<Math.floor(len*.14);n++){
   const v=end?len-1-n:n;let hits=0;
   for(let j=0;j<other;j++){const x=axis==='x'?v:j,y=axis==='x'?j:v;if(blank((y*w+x)*4))hits++;}
   if(hits/other<.985)break;
  }return n/len;
 }
 const e=[edge('x',false),edge('y',false),edge('x',true),edge('y',true)];
 // Uniform padding only: never infer a crop from an isolated product silhouette.
 if(Math.min(...e)<.027||Math.max(...e)>.12||Math.max(...e)-Math.min(...e)>.018)return null;
 const m=Math.min(...e)+.002;return {crop:[m,m,1-m,1-m]};
}
async function inspect(el,src){
 const path=key(src);if(REVIEWED[path]){apply(el,REVIEWED[path]);return;}
 apply(el,null);
 if(!cache.has(src))cache.set(src,new Promise(resolve=>{
  const im=new Image();im.crossOrigin='anonymous';
  im.onload=()=>{try{resolve(analyze(im));}catch{resolve(null);}};
  im.onerror=()=>resolve(null);im.src=src;
 }));
 const a=await cache.get(src);if(seen.get(el)===src&&a)apply(el,a);
}
function pump(){
 while(active<2&&pending.size){
  const el=pending.values().next().value;pending.delete(el);const src=el.currentSrc||el.src;
  if(!src||seen.get(el)===src)continue;seen.set(el,src);active++;
  inspect(el,src).finally(()=>{active--;pump();});
 }
}
const io=new IntersectionObserver(entries=>{
 for(const e of entries)if(e.isIntersecting){io.unobserve(e.target);pending.add(e.target);pump();}
},{rootMargin:'200px'});
function watch(el){if(el.tagName!=='IMG'||el.closest('.is-brands-gallery'))return;io.observe(el);}
function scan(root){if(root.nodeType!==1)return;if(root.matches?.(SELECTOR))watch(root);root.querySelectorAll?.(SELECTOR).forEach(watch);}
scan(document.body);
new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(scan);if(m.type==='attributes'&&m.target.matches?.(SELECTOR)){seen.delete(m.target);watch(m.target);}}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset']});
})();
