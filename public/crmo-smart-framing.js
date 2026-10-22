/* CRMO smart media framing — non-destructive display correction.
 * Conservative detection of embedded blank borders. Source files unchanged.
 */
(()=>{
'use strict';
const SELECTOR='.crmo3045-tile-media, .crmo3045-lb-media, .tile-media, .lightbox-media';
const done=new WeakSet(),pending=new Set();
const c=document.createElement('canvas'),S=180,H=101;c.width=S;c.height=H;
const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return;
let active=0;const LIMIT=2;
function blank(p,i){return p[i+3]<=18||(p[i+3]>=245&&p[i]>=249&&p[i+1]>=249&&p[i+2]>=249);}
function border(p,axis,end){
 const len=axis==='x'?S:H,other=axis==='x'?H:S;let n=0;
 for(let k=0;k<Math.floor(len*.29);k++){
  const v=end?len-k-1:k;let hits=0;
  for(let j=0;j<other;j++){const x=axis==='x'?v:j,y=axis==='x'?j:v;if(blank(p,(y*S+x)*4))hits++;}
  if(hits/other<.965)break;n++;
 }return n/len;
}
function analyze(im){
 const w=im.naturalWidth,h=im.naturalHeight;
 if(!w||!h||Math.abs(w/h-16/9)>.07)return null;
 ctx.clearRect(0,0,S,H);ctx.drawImage(im,0,0,S,H);
 const p=ctx.getImageData(0,0,S,H).data;
 const l=border(p,'x',false),r=border(p,'x',true),t=border(p,'y',false),b=border(p,'y',true);
 const largest=Math.max(l,r,t,b),bw=1-l-r,bh=1-t-b;
 if(largest<.027||largest>.27||bw<.55||bh<.55)return null;
 const scale=Math.min(1.5,1/(bw+.04),1/(bh+.04));
 if(scale<1.04)return null;
 return {scale,dx:.5-scale*(l+bw/2),dy:.5-scale*(t+bh/2)};
}
function finish(){active--;pump();}
function run(el){
 if(!el.isConnected||el.tagName!=='IMG'||!el.currentSrc){finish();return;}
 const im=new Image();im.crossOrigin='anonymous';
 im.onload=()=>{
  try{const a=analyze(im);if(a&&el.isConnected){
   el.style.setProperty('transform-origin','0 0','important');
   el.style.setProperty('transform',`translate(${(a.dx*100).toFixed(2)}%, ${(a.dy*100).toFixed(2)}%) scale(${a.scale.toFixed(4)})`,'important');
   el.dataset.crmoAutoFrame='1';
  }}catch(e){}finally{finish();}
 };
 im.onerror=finish;im.src=el.currentSrc;
}
function pump(){while(active<LIMIT&&pending.size){const el=pending.values().next().value;pending.delete(el);active++;run(el);}}
function queue(el){if(!el||done.has(el)||el.tagName!=='IMG')return;done.add(el);pending.add(el);pump();}
const intersection=new IntersectionObserver(entries=>entries.forEach(e=>{
 if(e.isIntersecting){intersection.unobserve(e.target);queue(e.target);}
}),{rootMargin:'250px'});
function scan(root){if(root.nodeType!==1)return;if(root.matches?.(SELECTOR))intersection.observe(root);root.querySelectorAll?.(SELECTOR).forEach(el=>intersection.observe(el));}
scan(document.body);
const observer=new MutationObserver(ms=>ms.forEach(m=>{
 m.addedNodes.forEach(scan);
 if(m.type==='attributes'&&m.target.matches?.(SELECTOR)){done.delete(m.target);intersection.observe(m.target);}
}));
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset']});
})();